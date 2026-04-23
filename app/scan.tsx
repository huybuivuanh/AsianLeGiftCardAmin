import { getCard, updateCard } from "@/lib/cards";
import { GiftCard } from "@/lib/types";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [card, setCard] = useState<GiftCard | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [balance, setBalance] = useState("");
  const [saving, setSaving] = useState(false);
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const sheetAnim = useRef(new Animated.Value(height)).current;
  const isSheetOpenRef = useRef(false);

  const scanFrameSize = useMemo(() => {
    const max = 320;
    const min = 200;
    const sizeFromWidth = Math.floor(width * 0.62);
    return Math.max(min, Math.min(max, sizeFromWidth));
  }, [width]);

  useEffect(() => {
    if (!isSheetOpenRef.current) {
      sheetAnim.setValue(height);
    }
  }, [height, sheetAnim]);

  const openSheet = () => {
    isSheetOpenRef.current = true;
    Animated.spring(sheetAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
    }).start();
  };

  const closeSheet = () => {
    isSheetOpenRef.current = false;
    Animated.timing(sheetAnim, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setScanned(false);
      setCard(null);
      setNotFound(false);
      setBalance("");
    });
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const segments = data.split("/");
    const id = segments[segments.length - 1];

    try {
      const found = await getCard(id);
      if (!found) {
        setNotFound(true);
      } else {
        setCard(found);
        setBalance(found.balance.toFixed(2));
      }
    } catch {
      setNotFound(true);
    }
    openSheet();
  };

  const handleUpdate = async () => {
    if (!card) return;
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount < 0) {
      Alert.alert("Invalid balance", "Please enter a valid amount.");
      return;
    }
    setSaving(true);
    try {
      await updateCard(card.id, { balance: amount });
      Alert.alert("Success", "Balance updated.");
      closeSheet();
    } catch {
      Alert.alert("Error", "Failed to update balance.");
    } finally {
      setSaving(false);
    }
  };

  if (!permission) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 justify-center items-center px-6">
        <Text className="text-center text-base mb-4">
          Camera access is required to scan QR codes.
        </Text>
        <TouchableOpacity
          className="bg-blue-600 px-6 py-3 rounded-lg"
          onPress={requestPermission}
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <CameraView
        style={StyleSheet.absoluteFill}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />

      <View className="absolute inset-0 justify-center items-center">
        <View
          className="border-2 border-white rounded-xl"
          style={{ width: scanFrameSize, height: scanFrameSize }}
        />
        <Text className="text-white mt-4 text-sm opacity-80">
          Align QR code within the frame
        </Text>
      </View>

      {/* Bottom sheet — uses Animated.Value for slide-in so style prop is required */}
      <Animated.View
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6"
        style={{
          transform: [{ translateY: sheetAnim }],
          elevation: 10,
          paddingBottom: Math.max(16, insets.bottom + 16),
        }}
      >
        {notFound ? (
          <>
            <Text className="text-xl font-bold mb-1">Card not found</Text>
            <Text className="text-gray-500 mb-5">
              The scanned QR code does not match any card.
            </Text>
            <TouchableOpacity className="py-3 items-center" onPress={closeSheet}>
              <Text className="text-gray-500 text-base">Scan Again</Text>
            </TouchableOpacity>
          </>
        ) : card ? (
          <>
            <Text className="text-2xl font-bold mb-1">
              {card.label || "Unnamed card"}
            </Text>
            <Text className="text-4xl font-extrabold text-blue-600 mb-5">
              ${card.balance.toFixed(2)}
            </Text>
            <Text className="text-sm text-gray-600 mb-1">New Balance ($)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-lg mb-4"
              value={balance}
              onChangeText={setBalance}
              keyboardType="decimal-pad"
              autoFocus
            />
            <TouchableOpacity
              className={`bg-blue-600 py-3.5 rounded-lg items-center mb-2.5 ${saving ? "opacity-60" : ""}`}
              onPress={handleUpdate}
              disabled={saving}
            >
              <Text className="text-white font-bold text-base">
                {saving ? "Saving..." : "Update Balance"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="py-3 items-center" onPress={closeSheet}>
              <Text className="text-gray-500 text-base">Cancel</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </Animated.View>
    </View>
  );
}

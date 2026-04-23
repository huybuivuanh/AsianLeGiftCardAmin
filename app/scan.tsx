import { CameraView, useCameraPermissions } from "expo-camera";
import { useMemo, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useRouter } from "expo-router";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const { width } = useWindowDimensions();
  const router = useRouter();

  const scanFrameSize = useMemo(() => {
    const max = 320;
    const min = 200;
    const sizeFromWidth = Math.floor(width * 0.62);
    return Math.max(min, Math.min(max, sizeFromWidth));
  }, [width]);

  useFocusEffect(
    useCallback(() => {
      setScanned(false);
    }, []),
  );

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    const segments = data.split("/");
    const id = segments[segments.length - 1];
    router.push(`/card/${id}`);
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
    </View>
  );
}

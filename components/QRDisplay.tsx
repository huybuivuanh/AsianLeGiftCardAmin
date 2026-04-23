import { QR_BASE_URL } from "@/lib/config";
import * as Sharing from "expo-sharing";
import { useRef } from "react";
import {
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";

const PADDING = 24;

type Props = {
  cardId: string;
};

export default function QRDisplay({ cardId }: Props) {
  const { width } = useWindowDimensions();
  const qrRef = useRef<View>(null);
  const qrValue = `${QR_BASE_URL}/${cardId}`;
  const qrSize = Math.max(150, Math.min(300, Math.floor(width - 128)));

  const downloadOnWeb = async () => {
    // Dynamic import so the qrcode package is never bundled for native
    const QRCodeLib = await import("qrcode");
    const dataUrl = await QRCodeLib.default.toDataURL(qrValue, {
      margin: 2,
      width: qrSize + PADDING * 2,
      color: { dark: "#000000", light: "#ffffff" },
    });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `giftcard-${cardId}.png`;
    a.click();
  };

  const handleDownload = async () => {
    try {
      if (Platform.OS === "web") {
        await downloadOnWeb();
        return;
      }
      const uri = await captureRef(qrRef, { format: "png", quality: 1 });
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert("Unavailable", "Sharing is not available on this device.");
        return;
      }
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert("Error", "Failed to export QR code.");
    }
  };

  return (
    <View className="items-center my-4">
      <View
        ref={qrRef}
        className="bg-white p-4 rounded-xl shadow-sm"
        collapsable={false}
      >
        <QRCode value={qrValue} size={qrSize} />
      </View>
      <TouchableOpacity
        className="mt-3 px-5 py-2.5 bg-blue-600 rounded-lg"
        onPress={handleDownload}
      >
        <Text className="text-white font-semibold">Download QR</Text>
      </TouchableOpacity>
    </View>
  );
}

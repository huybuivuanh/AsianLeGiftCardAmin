import { QR_BASE_URL } from "@/lib/config";
import * as Sharing from "expo-sharing";
import { useRef } from "react";
import {
  Alert,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { captureRef } from "react-native-view-shot";

type Props = {
  cardId: string;
};

export default function QRDisplay({ cardId }: Props) {
  const { width } = useWindowDimensions();
  const qrRef = useRef<View>(null);
  const qrValue = `${QR_BASE_URL}/${cardId}`;
  const qrSize = Math.max(150, Math.min(300, Math.floor(width - 128)));

  const handleDownload = async () => {
    try {
      const uri = await captureRef(qrRef, { format: "png", quality: 1 });
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

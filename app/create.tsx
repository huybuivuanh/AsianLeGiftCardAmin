import { createCard } from "@/lib/cards";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CreateScreen() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createCard({ label: label.trim(), balance: 0 });
      router.back();
    } catch {
      Alert.alert("Error", "Failed to create card.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="p-5"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-sm text-gray-600 mb-1">Label (optional)</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-base mb-4"
        value={label}
        onChangeText={setLabel}
        placeholder="e.g. Birthday gift"
      />
      <TouchableOpacity
        className={`bg-blue-600 py-3.5 rounded-lg items-center mt-2 ${loading ? "opacity-60" : ""}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color="white" size="small" />
            <Text className="text-white font-bold text-base">Creating...</Text>
          </View>
        ) : (
          <Text className="text-white font-bold text-base">Create Card</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

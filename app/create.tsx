import BalanceInput from "@/components/BalanceInput";
import { createCard } from "@/lib/cards";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function CreateScreen() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [balance, setBalance] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount <= 0) {
      setBalanceError("Balance must be a positive number.");
      return;
    }
    setBalanceError("");
    setLoading(true);
    try {
      await createCard({ label: label.trim(), balance: amount });
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
      <BalanceInput value={balance} onChange={setBalance} error={balanceError} />
      <TouchableOpacity
        className={`bg-blue-600 py-3.5 rounded-lg items-center mt-2 ${loading ? "opacity-60" : ""}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className="text-white font-bold text-base">
          {loading ? "Creating..." : "Create Card"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

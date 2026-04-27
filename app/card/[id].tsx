import BalanceInput from "@/components/BalanceInput";
import QRDisplay from "@/components/QRDisplay";
import { deleteCard, getCard, updateCard } from "@/lib/cards";
import { GiftCard } from "@/lib/types";
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [card, setCard] = useState<GiftCard | null>(null);
  const [label, setLabel] = useState("");
  const [balance, setBalance] = useState("");
  const [balanceError, setBalanceError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getCard(id);
        if (!data) {
          Alert.alert("Error", "Card not found.");
          router.back();
          return;
        }
        setCard(data);
        setLabel(data.label || "");
        setBalance(data.balance.toFixed(2));
      } catch {
        Alert.alert("Error", "Failed to load card.");
        router.back();
      }
    })();
  }, [id]);

  useEffect(() => {
    navigation.setOptions({ title: "Card Details" });
  }, [card, navigation]);

  const handleSave = async () => {
    const amount = parseFloat(balance);
    if (isNaN(amount) || amount < 0) {
      setBalanceError("Balance must be a valid number.");
      return;
    }
    setBalanceError("");
    setSaving(true);
    try {
      await updateCard(id, { label: label.trim(), balance: amount });
      router.dismiss();
    } catch {
      Alert.alert("Error", "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!id) return;

    if (Platform.OS === "web") {
      const ok = window.confirm("Are you sure you want to delete this card?");
      if (!ok) return;
      (async () => {
        try {
          await deleteCard(id);
          router.dismiss();
        } catch {
          Alert.alert("Error", "Failed to delete card.");
        }
      })();
      return;
    }

    Alert.alert("Delete Card", "Are you sure you want to delete this card?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCard(id);
            router.dismiss();
          } catch {
            Alert.alert("Error", "Failed to delete card.");
          }
        },
      },
    ]);
  };

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerClassName="p-5"
      keyboardShouldPersistTaps="handled"
    >
      <Text className="text-sm text-gray-600 mb-1">Label</Text>
      <TextInput
        className="border border-gray-300 rounded-lg px-3 py-2.5 text-base mb-4"
        value={label}
        onChangeText={setLabel}
        placeholder="e.g. Birthday gift"
      />

      <QRDisplay cardId={id} />

      <BalanceInput
        value={balance}
        onChange={setBalance}
        error={balanceError}
      />

      <View className="mb-3">
        <Text className="text-xs">Original Balance</Text>
        <Text className="text-base mt-0.5">
          {card ? `$${card.originalBalance.toFixed(2)}` : "—"}
        </Text>
      </View>
      <View className="mb-3">
        <Text className="text-xs">Card ID</Text>
        <Text className="text-xs mt-0.5">{id}</Text>
      </View>
      <View className="mb-3">
        <Text className="text-xs">Created</Text>
        <Text className="text-base mt-0.5">
          {card?.createdAt.toDate().toLocaleDateString() ?? "—"}
        </Text>
      </View>

      <TouchableOpacity
        className={`bg-blue-600 py-3.5 rounded-lg items-center mt-2 ${saving || !card ? "opacity-60" : ""}`}
        onPress={handleSave}
        disabled={saving || !card}
      >
        <Text className="text-white font-bold text-base">
          {saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="mt-3 py-3.5 rounded-lg items-center border border-red-500"
        onPress={handleDelete}
      >
        <Text className="text-red-500 font-semibold text-base">
          Delete Card
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

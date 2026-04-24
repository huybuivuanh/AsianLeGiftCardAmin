import BalanceInput from "@/components/BalanceInput";
import QRDisplay from "@/components/QRDisplay";
import {
  archiveCard,
  deleteCard,
  getCard,
  unarchiveCard,
  updateCard,
} from "@/lib/cards";
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
  const [archiving, setArchiving] = useState(false);

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

  const runArchive = async () => {
    if (!id || !card) return;
    setArchiving(true);
    try {
      await archiveCard(id);
      router.dismiss();
    } catch {
      Alert.alert("Error", "Failed to archive card.");
    } finally {
      setArchiving(false);
    }
  };

  const handleArchive = () => {
    if (!id || !card || card.archived) return;

    if (Platform.OS === "web") {
      const ok = window.confirm(
        "Archive this card? It will show under the Archived filter on the home list.",
      );
      if (!ok) return;
      void runArchive();
      return;
    }

    Alert.alert(
      "Archive Card",
      "This card will appear under the Archived filter. You can unarchive it later.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Archive", onPress: () => void runArchive() },
      ],
    );
  };

  const runUnarchive = async () => {
    if (!id || !card) return;
    setArchiving(true);
    try {
      await unarchiveCard(id);
      router.dismiss();
    } catch {
      Alert.alert("Error", "Failed to unarchive card.");
    } finally {
      setArchiving(false);
    }
  };

  const handleUnarchive = () => {
    if (!id || !card || !card.archived) return;

    if (Platform.OS === "web") {
      void runUnarchive();
      return;
    }

    Alert.alert("Unarchive Card", "Restore this card to the active list?", [
      { text: "Cancel", style: "cancel" },
      { text: "Unarchive", onPress: () => void runUnarchive() },
    ]);
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
        <Text className="text-xs text-gray-400">Original Balance</Text>
        <Text className="text-base mt-0.5">
          {card ? `$${card.originalBalance.toFixed(2)}` : "—"}
        </Text>
      </View>
      <View className="mb-3">
        <Text className="text-xs text-gray-400">Card ID</Text>
        <Text className="text-xs text-gray-300 mt-0.5">{id}</Text>
      </View>
      <View className="mb-3">
        <Text className="text-xs text-gray-400">Created</Text>
        <Text className="text-base mt-0.5">
          {card?.createdAt.toDate().toLocaleDateString() ?? "—"}
        </Text>
      </View>

      <TouchableOpacity
        className={`bg-blue-600 py-3.5 rounded-lg items-center mt-2 ${saving || !card || archiving ? "opacity-60" : ""}`}
        onPress={handleSave}
        disabled={saving || !card || archiving}
      >
        <Text className="text-white font-bold text-base">
          {saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>

      {card?.archived ? (
        <TouchableOpacity
          className={`mt-3 py-3.5 rounded-lg items-center border border-green-600 ${archiving || saving ? "opacity-60" : ""}`}
          onPress={handleUnarchive}
          disabled={archiving || saving || !card}
        >
          <Text className="text-green-700 font-semibold text-base">
            {archiving ? "Restoring..." : "Unarchive"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className={`mt-3 py-3.5 rounded-lg items-center border border-gray-400 ${archiving || saving || !card ? "opacity-60" : ""}`}
          onPress={handleArchive}
          disabled={archiving || saving || !card}
        >
          <Text className="text-gray-800 font-semibold text-base">
            {archiving ? "Archiving..." : "Archive"}
          </Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        className={`mt-3 py-3.5 rounded-lg items-center border border-red-500 ${archiving || saving ? "opacity-60" : ""}`}
        onPress={handleDelete}
        disabled={archiving || saving}
      >
        <Text className="text-red-500 font-semibold text-base">
          Delete Card
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

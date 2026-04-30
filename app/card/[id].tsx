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
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const PIN_MAX_LENGTH =
  process.env.EXPO_PUBLIC_ORIGINAL_BALANCE_PIN?.length ?? 8;

const PIN_NOT_CONFIGURED_MESSAGE =
  "Original balance PIN is not set or failed to load. Set EXPO_PUBLIC_ORIGINAL_BALANCE_PIN and rebuild the app.";

/** RN Web's Alert.alert is often a no-op; use the browser dialog on web. */
function alertMessage(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function CardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const [card, setCard] = useState<GiftCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [balance, setBalance] = useState("");
  const [redeemAmount, setRedeemAmount] = useState("");
  const [redeemError, setRedeemError] = useState("");
  const [originalBalance, setOriginalBalance] = useState("");
  const [originalBalanceError, setOriginalBalanceError] = useState("");
  const [isOriginalEditable, setIsOriginalEditable] = useState(false);
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pinEntry, setPinEntry] = useState("");
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setRedeemAmount("");
      setRedeemError("");
      setOriginalBalanceError("");
      setIsOriginalEditable(false);
      setShowPinEntry(false);
      setPinEntry("");
      setLoading(true);
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
          setOriginalBalance(data.originalBalance.toFixed(2));
        } catch {
          Alert.alert("Error", "Failed to load card.");
          router.back();
        } finally {
          setLoading(false);
        }
      })();
    }, [id]),
  );

  useEffect(() => {
    navigation.setOptions({ title: "Card Details" });
  }, [card, navigation]);

  const handleSave = async () => {
    const originalAmount = parseFloat(originalBalance);
    if (isNaN(originalAmount) || originalAmount < 0) {
      setOriginalBalanceError("Original balance must be a valid number.");
      return;
    }

    let newBalance: number;
    let didRedeem = false;
    if (isOriginalEditable) {
      newBalance = originalAmount;
    } else {
      const redeemValue = redeemAmount === "" ? 0 : parseFloat(redeemAmount);
      if (isNaN(redeemValue) || redeemValue < 0) {
        setRedeemError("Redeem amount must be a valid number.");
        return;
      }
      const currentBalance = parseFloat(balance);
      if (redeemValue > currentBalance) {
        setRedeemError("Redeem amount exceeds current balance.");
        return;
      }
      newBalance = currentBalance - redeemValue;
      didRedeem = redeemValue > 0;
    }

    setRedeemError("");
    setOriginalBalanceError("");
    setSaving(true);
    try {
      await updateCard(
        id,
        {
          label: label.trim(),
          balance: newBalance,
          originalBalance: originalAmount,
        },
        didRedeem,
      );
      router.dismiss();
    } catch {
      Alert.alert("Error", "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const requireOriginalBalancePin = async (): Promise<
    "ok" | "cancel" | "wrong" | "not_configured"
  > => {
    const pin = process.env.EXPO_PUBLIC_ORIGINAL_BALANCE_PIN?.trim();

    if (Platform.OS === "web") {
      const entered = window.prompt("Enter PIN to edit original balance");
      if (entered === null) return "cancel";
      if (!pin) return "not_configured";
      return entered === pin ? "ok" : "wrong";
    }

    if (Platform.OS !== "ios") {
      return "cancel";
    }

    return await new Promise((resolve) => {
      Alert.prompt(
        "PIN Required",
        "Enter PIN to edit original balance",
        [
          { text: "Cancel", style: "cancel", onPress: () => resolve("cancel") },
          {
            text: "Continue",
            onPress: (entered: string | undefined) => {
              if (!pin) {
                resolve("not_configured");
                return;
              }
              resolve((entered ?? "") === pin ? "ok" : "wrong");
            },
          },
        ],
        "secure-text",
      );
    });
  };

  const handleEditOriginalBalance = async () => {
    if (Platform.OS === "android") {
      setShowPinEntry(true);
      return;
    }

    const result = await requireOriginalBalancePin();
    if (result === "cancel") return;
    if (result === "not_configured") {
      alertMessage("Error", PIN_NOT_CONFIGURED_MESSAGE);
      return;
    }
    if (result !== "ok") {
      alertMessage("Denied", "Incorrect PIN.");
      return;
    }
    setIsOriginalEditable(true);
  };

  const submitAndroidPin = () => {
    const pin = process.env.EXPO_PUBLIC_ORIGINAL_BALANCE_PIN?.trim();
    if (!pin) {
      setPinEntry("");
      Alert.alert("Error", PIN_NOT_CONFIGURED_MESSAGE);
      return;
    }
    if (pinEntry !== pin) {
      setPinEntry("");
      Alert.alert("Denied", "Incorrect PIN.");
      return;
    }
    setShowPinEntry(false);
    setPinEntry("");
    setIsOriginalEditable(true);
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

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
      </View>
    );
  }

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

      <View className="mb-4">
        <Text className="text-sm text-gray-600 mb-1">Balance ($)</Text>
        <TextInput
          className="border border-gray-300 rounded-lg px-3 py-2.5 text-lg bg-gray-50 text-gray-500"
          value={balance}
          editable={false}
        />
      </View>

      <BalanceInput
        value={redeemAmount}
        onChange={setRedeemAmount}
        label="Redeem Amount ($)"
        error={redeemError}
        disabled={parseFloat(originalBalance) === 0}
      />

      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-sm text-gray-600">Original Balance ($)</Text>
          {!isOriginalEditable ? (
            <TouchableOpacity
              onPress={handleEditOriginalBalance}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text className="text-blue-600 font-semibold">Edit</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {showPinEntry ? (
          <View className="mb-2">
            <Text className="text-xs text-gray-600 mb-1">Enter PIN</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-base"
              value={pinEntry}
              onChangeText={setPinEntry}
              placeholder="PIN"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={PIN_MAX_LENGTH}
            />
            <View className="flex-row gap-2 mt-2">
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg items-center border border-gray-300"
                onPress={() => {
                  setShowPinEntry(false);
                  setPinEntry("");
                }}
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-3 rounded-lg items-center bg-blue-600"
                onPress={submitAndroidPin}
              >
                <Text className="text-white font-semibold">Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        <TextInput
          className={`border rounded-lg px-3 py-2.5 text-lg ${
            originalBalanceError ? "border-red-500" : "border-gray-300"
          } ${!isOriginalEditable ? "bg-gray-50 text-gray-500" : ""}`}
          value={originalBalance}
          onChangeText={(v) => {
            if (!/^\d*\.?\d{0,2}$/.test(v)) return;
            setOriginalBalance(v);
            setOriginalBalanceError("");
            if (isOriginalEditable && parseFloat(v) > 0) setBalance(v);
          }}
          keyboardType="decimal-pad"
          editable={isOriginalEditable}
          selectTextOnFocus={isOriginalEditable}
          placeholder="0"
        />
        {originalBalanceError ? (
          <Text className="text-red-500 text-xs mt-1">
            {originalBalanceError}
          </Text>
        ) : null}
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
      {card?.updatedAt ? (
        <View className="mb-3">
          <Text className="text-xs">Last Redeemed</Text>
          <Text className="text-base mt-0.5">
            {card.updatedAt.toDate().toLocaleString()}
          </Text>
        </View>
      ) : null}

      <TouchableOpacity
        className={`bg-blue-600 py-3.5 rounded-lg items-center mt-2 ${saving || !card ? "opacity-60" : ""}`}
        onPress={handleSave}
        disabled={saving || !card}
      >
        <Text className="text-white font-bold text-base">
          {saving ? "Saving..." : "Save"}
        </Text>
      </TouchableOpacity>

      {card?.archived ? (
        <TouchableOpacity
          className={`mt-3 py-3.5 rounded-lg items-center border border-green-600 ${archiving || !card ? "opacity-60" : ""}`}
          onPress={handleUnarchive}
          disabled={archiving || !card}
        >
          <Text className="text-green-700 font-semibold text-base">
            {archiving ? "Restoring..." : "Unarchive"}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          className={`mt-3 py-3.5 rounded-lg items-center border border-gray-400 ${archiving || !card ? "opacity-60" : ""}`}
          onPress={handleArchive}
          disabled={archiving || !card}
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

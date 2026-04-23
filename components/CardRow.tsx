import { GiftCard } from "@/lib/types";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  card: GiftCard;
  onPress: () => void;
};

export default function CardRow({ card, onPress }: Props) {
  const isDepleted = card.balance === 0;
  return (
    <TouchableOpacity
      className={`flex-row justify-between items-center px-2 py-3.5 border-b border-gray-200 bg-white ${isDepleted ? "opacity-40" : ""}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-900">
          {card.label || "Unnamed card"}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          {card.createdAt?.toDate().toLocaleDateString() ?? ""}
        </Text>
      </View>
      <Text className="text-lg font-bold text-gray-900">
        ${card.balance.toFixed(2)}
      </Text>
    </TouchableOpacity>
  );
}

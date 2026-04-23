import { GiftCard } from "@/lib/types";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  card: GiftCard;
  onPress: () => void;
};

export default function CardRow({ card, onPress }: Props) {
  const isDepleted = card.balance === 0 && card.originalBalance > 0;
  const isUnused = card.balance === 0 && card.originalBalance === 0;
  return (
    <TouchableOpacity
      className={`my-1.5 rounded-2xl bg-white px-3 py-2.5 border border-gray-200 shadow-sm flex-row items-center ${isDepleted ? "opacity-50" : ""}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-1 pr-3">
        <View className="flex-row items-center mb-1">
          <Text className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            Gift Card
          </Text>
          <Text className="ml-2 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
            {isDepleted ? "Depleted" : isUnused ? "Unused" : "Active"}
          </Text>
        </View>

        <Text
          className="text-base font-semibold text-gray-900"
          numberOfLines={1}
        >
          {card.label || "Unnamed card"}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">ID: {card.id}</Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          Created: {card.createdAt?.toDate().toLocaleDateString() ?? "—"}
        </Text>
        <Text className="text-xs text-gray-400 mt-0.5">
          Updated: {card.updatedAt?.toDate().toLocaleDateString() ?? "—"}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className={`text-lg font-extrabold ${isDepleted || isUnused ? "text-gray-700" : "text-blue-700"}`}
        >
          ${card.balance.toFixed(2)}
        </Text>
        <Text className="text-gray-300 text-2xl leading-none -mr-0.5">›</Text>
      </View>
    </TouchableOpacity>
  );
}

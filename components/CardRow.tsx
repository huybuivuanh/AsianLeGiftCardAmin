import { GiftCard } from "@/lib/types";
import { Text, TouchableOpacity, View } from "react-native";

type Props = {
  card: GiftCard;
  onPress: () => void;
};

/** Remaining balance spent; original value was positive. */
export function giftCardIsDepleted(card: GiftCard): boolean {
  return card.balance === 0 && card.originalBalance > 0;
}

/** Matches green "Active" badge: spendable balance, not archived. */
export function giftCardIsActiveFilter(card: GiftCard): boolean {
  return !card.archived && card.balance > 0;
}

export type CardListFilter =
  | "all"
  | "active"
  | "inactive"
  | "depleted"
  | "archived";

export function giftCardMatchesListFilter(
  card: GiftCard,
  filter: CardListFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "archived") return !!card.archived;
  if (card.archived) return false;
  if (filter === "active") return giftCardIsActiveFilter(card);
  if (filter === "inactive") return !giftCardIsActiveFilter(card);
  if (filter === "depleted") return giftCardIsDepleted(card);
  return true;
}

export default function CardRow({ card, onPress }: Props) {
  const isDepleted = giftCardIsDepleted(card);
  const isActive = giftCardIsActiveFilter(card);

  return (
    <TouchableOpacity
      className={`my-1.5 rounded-2xl bg-white px-3 py-2.5 border border-gray-200 shadow-sm flex-row items-center ${isDepleted ? "opacity-50" : ""}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-1 pr-3">
        <View className="flex-row items-center flex-wrap gap-y-1 mb-1">
          <Text className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            Gift Card
          </Text>
          {card.archived ? (
            <Text className="ml-2 text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Archived
            </Text>
          ) : (
            <Text
              className={`ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full ${isActive ? "text-green-700 bg-green-50" : isDepleted ? "text-gray-600 bg-gray-100" : "text-gray-600 bg-gray-100"}`}
            >
              {isActive ? "Active" : isDepleted ? "Depleted" : "Inactive"}
            </Text>
          )}
        </View>

        <Text
          className="text-base font-semibold text-gray-900"
          numberOfLines={1}
        >
          {card.label || "Unnamed card"}
        </Text>
        <Text className="text-xs mt-0.5">ID: {card.id}</Text>
        <Text className="text-xs mt-0.5">
          Created: {card.createdAt?.toDate().toLocaleDateString() ?? "—"}
        </Text>
        <Text className="text-xs mt-0.5">
          Updated: {card.updatedAt?.toDate().toLocaleDateString() ?? "—"}
        </Text>
      </View>

      <View className="items-end">
        <Text
          className={`text-lg font-extrabold ${isDepleted || !isActive ? "text-gray-700" : "text-blue-700"}`}
        >
          ${card.balance.toFixed(2)}
        </Text>
        <Text className="text-gray-300 text-2xl leading-none -mr-0.5">›</Text>
      </View>
    </TouchableOpacity>
  );
}

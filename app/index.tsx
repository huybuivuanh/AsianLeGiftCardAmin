import CardRow, {
  type CardListFilter,
  giftCardMatchesListFilter,
} from "@/components/CardRow";
import DropdownPicker from "@/components/DropdownPicker";
import { signOut } from "@/lib/auth";
import { subscribeCards } from "@/lib/cards";
import { GiftCard } from "@/lib/types";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Timestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type SortKey = "createdAt" | "updatedAt";

function stampMs(t: Timestamp | null | undefined): number {
  return t?.toMillis?.() ?? 0;
}

const FILTER_OPTIONS: { key: CardListFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "depleted", label: "Depleted" },
  { key: "archived", label: "Archived" },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "createdAt", label: "Created" },
  { key: "updatedAt", label: "Updated" },
];

export default function CardListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<CardListFilter>("all");
  const [sortBy, setSortBy] = useState<SortKey>("createdAt");

  useEffect(() => {
    const unsubscribe = subscribeCards(setCards, () =>
      Alert.alert("Error", "Failed to load cards."),
    );
    return unsubscribe;
  }, []);

  const handleSignOut = () => {
    if (Platform.OS === "web") {
      const ok = window.confirm("Are you sure you want to sign out?");
      if (!ok) return;
      signOut().catch(() => Alert.alert("Error", "Failed to sign out."));
      return;
    }

    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
          } catch {
            Alert.alert("Error", "Failed to sign out.");
          }
        },
      },
    ]);
  };

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={handleSignOut}
          className="ml-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-red-500 text-base font-semibold">Sign Out</Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => router.push("/scan")}
          className="mr-1"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text className="text-blue-600 text-base font-semibold">Scan</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, router]);

  const filteredSorted = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = cards.filter((c) => {
      if (!q) return true;
      const label = (c.label || "Unnamed card").toLowerCase();
      return label.includes(q) || c.id.toLowerCase().includes(q);
    });
    list = list.filter((c) => giftCardMatchesListFilter(c, filter));
    list = [...list].sort((a, b) => {
      const aMs =
        sortBy === "createdAt"
          ? stampMs(a.createdAt)
          : stampMs(a.updatedAt ?? a.createdAt);
      const bMs =
        sortBy === "createdAt"
          ? stampMs(b.createdAt)
          : stampMs(b.updatedAt ?? b.createdAt);
      return bMs - aMs;
    });
    return list;
  }, [cards, search, filter, sortBy]);

  return (
    <View className="flex-1 bg-gray-100">
      <TextInput
        className="mx-3 my-3 px-3 py-2.5 bg-white rounded-lg border border-gray-200 text-base"
        placeholder="Search by label or ID..."
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />

      <View className="flex-row gap-3 mb-3 px-3">
        <View className="flex-1">
          <DropdownPicker
            label="Filter"
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
          />
        </View>
        <View className="flex-1">
          <DropdownPicker
            label="Sort by"
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={setSortBy}
          />
        </View>
      </View>

      <FlatList
        className="px-3"
        data={filteredSorted}
        extraData={{ filter, sortBy, search, n: cards.length }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CardRow
            card={item}
            onPress={() => router.push(`/card/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10 text-base px-4">
            No cards match your search or filters.
          </Text>
        }
      />
      <TouchableOpacity
        className="absolute right-5 bottom-8 w-14 h-14 rounded-full bg-blue-600 justify-center items-center shadow-md"
        onPress={() => router.push("/create")}
      >
        <Text className="text-white text-3xl leading-none pb-0.5">+</Text>
      </TouchableOpacity>
    </View>
  );
}

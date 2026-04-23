import CardRow from "@/components/CardRow";
import { subscribeCards } from "@/lib/cards";
import { GiftCard } from "@/lib/types";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function CardListScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeCards(setCards, () =>
      Alert.alert("Error", "Failed to load cards."),
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    navigation.setOptions({
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

  const filtered = cards.filter((c) =>
    (c.label || "Unnamed card").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View className="flex-1 bg-gray-100">
      <TextInput
        className="mx-3 my-3 px-3 py-2.5 bg-white rounded-lg border border-gray-200 text-base"
        placeholder="Search by label..."
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
      />
      <FlatList
        className="px-3"
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CardRow
            card={item}
            onPress={() => router.push(`/card/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10 text-base">
            No cards found.
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

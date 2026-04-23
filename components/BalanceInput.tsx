import { Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
};

export default function BalanceInput({
  value,
  onChange,
  label = "Balance ($)",
  error,
}: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-600 mb-1">{label}</Text>
      <TextInput
        className={`border rounded-lg px-3 py-2.5 text-lg ${error ? "border-red-500" : "border-gray-300"}`}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
        placeholder="0.00"
      />
      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}
    </View>
  );
}

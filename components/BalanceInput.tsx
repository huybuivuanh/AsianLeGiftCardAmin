import { Text, TextInput, View } from "react-native";

type Props = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
};

export default function BalanceInput({
  value,
  onChange,
  label = "Balance ($)",
  error,
  disabled,
}: Props) {
  return (
    <View className="mb-4">
      <Text className="text-sm text-gray-600 mb-1">{label}</Text>
      <TextInput
        className={`border rounded-lg px-3 py-2.5 text-lg ${error ? "border-red-500" : "border-gray-300"} ${disabled ? "bg-gray-50 text-gray-500" : ""}`}
        value={value}
        onChangeText={(v) => {
          if (/^\d*\.?\d{0,2}$/.test(v)) onChange(v);
        }}
        keyboardType="decimal-pad"
        placeholder="0"
        editable={!disabled}
      />
      {error ? <Text className="text-red-500 text-xs mt-1">{error}</Text> : null}
    </View>
  );
}

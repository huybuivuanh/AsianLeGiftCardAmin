import { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

type Option<T extends string> = { key: T; label: string };

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function DropdownPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.key === value);

  return (
    <>
      <Text className="text-xs text-gray-500 font-medium mb-1">{label}</Text>
      <TouchableOpacity
        className="flex-row items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2.5"
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text className="text-base text-gray-800">{selected?.label}</Text>
        <Text className="text-gray-400 text-sm">▾</Text>
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 justify-center bg-black/40 px-6"
          onPress={() => setOpen(false)}
        >
          <Pressable>
            <View className="bg-white rounded-2xl overflow-hidden">
              <Text className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-5 pt-4 pb-2">
                {label}
              </Text>
              {options.map((option, i) => (
                <TouchableOpacity
                  key={option.key}
                  className={`px-5 py-3.5 flex-row items-center justify-between ${
                    i < options.length - 1 ? "border-b border-gray-100" : ""
                  } ${option.key === value ? "bg-blue-50" : ""}`}
                  onPress={() => {
                    onChange(option.key);
                    setOpen(false);
                  }}
                >
                  <Text
                    className={`text-base ${
                      option.key === value
                        ? "text-blue-600 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {option.label}
                  </Text>
                  {option.key === value && (
                    <Text className="text-blue-600 text-base">✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

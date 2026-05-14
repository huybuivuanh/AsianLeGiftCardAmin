import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (pin: string) => void;
  error?: string;
  maxLength?: number;
};

export default function PinModal({
  visible,
  onCancel,
  onSubmit,
  error,
  maxLength,
}: Props) {
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (visible) setPin("");
  }, [visible]);

  const handleSubmit = () => onSubmit(pin);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-2xl p-6 w-72">
                <Text className="text-lg font-bold text-gray-900 mb-1">
                  PIN Required
                </Text>
                <Text className="text-sm text-gray-500 mb-4">
                  Enter PIN to edit original balance
                </Text>

                <TextInput
                  className={`border rounded-lg px-3 py-2.5 text-base ${
                    error ? "border-red-400" : "border-gray-300"
                  }`}
                  value={pin}
                  onChangeText={setPin}
                  placeholder="PIN"
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={maxLength}
                  autoFocus
                  onSubmitEditing={handleSubmit}
                />
                {error ? (
                  <Text className="text-red-500 text-xs mt-1 mb-3">
                    {error}
                  </Text>
                ) : (
                  <View className="mb-4" />
                )}

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-lg items-center border border-gray-300"
                    onPress={onCancel}
                  >
                    <Text className="text-gray-800 font-semibold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 py-3 rounded-lg items-center bg-blue-600"
                    onPress={handleSubmit}
                  >
                    <Text className="text-white font-semibold">Continue</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

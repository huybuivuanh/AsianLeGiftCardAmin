import { signIn } from "@/lib/auth";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // _layout.tsx auth listener will redirect to / automatically
    } catch (e: any) {
      const code = e?.code as string | undefined;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Sign in failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !email.trim() || !password;

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-gray-900">
            Asian Le Gift Card Admin
          </Text>
        </View>

        <View className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <Text className="text-base font-semibold text-gray-900 mb-4">
            Sign in
          </Text>

          <Text className="text-sm text-gray-600 mb-1">Email</Text>
          <TextInput
            className="bg-white border border-gray-200 rounded-lg px-3 py-3 text-base mb-4"
            value={email}
            onChangeText={(v) => {
              setEmail(v);
              if (error) setError("");
            }}
            placeholder="staff@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <Text className="text-sm text-gray-600 mb-1">Password</Text>
          <View className="relative mb-2">
            <TextInput
              className="bg-white border border-gray-200 rounded-lg pl-3 pr-12 py-3 text-base"
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                if (error) setError("");
              }}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              className="absolute right-0 top-0 bottom-0 px-3 justify-center"
              onPress={() => setShowPassword((s) => !s)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#6B7280"
              />
            </TouchableOpacity>
          </View>

          {error ? (
            <Text className="text-red-500 text-sm mb-4">{error}</Text>
          ) : (
            <View className="mb-4" />
          )}

          <TouchableOpacity
            className={`bg-blue-600 py-3.5 rounded-lg items-center ${
              isDisabled ? "opacity-60" : ""
            }`}
            onPress={handleLogin}
            disabled={isDisabled}
          >
            <Text className="text-white font-bold text-base">
              {loading ? "Signing in..." : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

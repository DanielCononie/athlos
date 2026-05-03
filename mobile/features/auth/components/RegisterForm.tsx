import { router } from "expo-router";
import { useState } from "react";

import {
  AuthButton,
  AuthError,
  AuthField,
  AuthForm,
  AuthScreen,
} from "@/features/auth/components/AuthScreen";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function RegisterForm() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setError("Enter your email and password.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await register(trimmedEmail, password);
      router.replace("/(app)");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "Registration failed. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreen
      footerAction="Sign in"
      footerHref="/(auth)/login"
      footerLabel="Already have an account?"
      subtitle="Build your profile and turn daily effort into visible momentum."
      title="Start strong"
    >
      <AuthForm>
        <AuthField
          autoCapitalize="none"
          autoComplete="email"
          editable={!isSubmitting}
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder="you@example.com"
          textContentType="emailAddress"
          value={email}
        />

        <AuthField
          editable={!isSubmitting}
          label="Password"
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          textContentType="newPassword"
          value={password}
        />

        <AuthError>{error}</AuthError>
        <AuthButton
          disabled={isSubmitting}
          label={isSubmitting ? "Creating account..." : "Create account"}
          onPress={handleSubmit}
        />
      </AuthForm>
    </AuthScreen>
  );
}

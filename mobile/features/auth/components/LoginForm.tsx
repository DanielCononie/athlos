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

export function LoginForm() {
  const { signIn } = useAuth();
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
      await signIn(trimmedEmail, password);
      router.replace("/(app)");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Login failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreen
      footerAction="Create an account"
      footerHref="/(auth)/register"
      footerLabel="New here?"
      subtitle="Track training, nutrition, recovery, and progress in one focused space."
      title="Welcome back"
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
          textContentType="password"
          value={password}
        />

        <AuthError>{error}</AuthError>
        <AuthButton
          disabled={isSubmitting}
          label={isSubmitting ? "Signing in..." : "Sign in"}
          onPress={handleSubmit}
        />
      </AuthForm>
    </AuthScreen>
  );
}

import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const tokenKey = "auth.jwt";
let webToken: string | null = null;

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED,
};

async function canUseSecureStore() {
  if (Platform.OS === "web") {
    return false;
  }

  return SecureStore.isAvailableAsync();
}

export async function getStoredToken() {
  if (!(await canUseSecureStore())) {
    return webToken;
  }

  return SecureStore.getItemAsync(tokenKey, secureStoreOptions);
}

export async function storeToken(token: string) {
  if (!(await canUseSecureStore())) {
    webToken = token;
    return;
  }

  await SecureStore.setItemAsync(tokenKey, token, secureStoreOptions);
}

export async function deleteStoredToken() {
  webToken = null;

  if (!(await canUseSecureStore())) {
    return;
  }

  await SecureStore.deleteItemAsync(tokenKey, secureStoreOptions);
}

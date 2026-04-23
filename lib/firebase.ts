import Constants from "expo-constants";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey as string,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain as string,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId as string,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket as string,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId as string,
  appId: Constants.expoConfig?.extra?.firebaseAppId as string,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

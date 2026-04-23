import { Timestamp } from "firebase/firestore";

export type GiftCard = {
  id: string;
  label: string;
  balance: number;
  originalBalance: number;
  active: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
};

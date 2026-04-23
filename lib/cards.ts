import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { GiftCard } from "./types";

const COL = "giftCards";

export async function getCards(): Promise<GiftCard[]> {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as GiftCard));
}

export function subscribeCards(
  onUpdate: (cards: GiftCard[]) => void,
  onError: (e: Error) => void
): () => void {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() } as GiftCard))),
    onError
  );
}

export async function getCard(id: string): Promise<GiftCard | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as GiftCard;
}

export async function createCard(
  data: Pick<GiftCard, "label" | "balance">
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    label: data.label || "",
    balance: data.balance,
    originalBalance: data.balance,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateCard(
  id: string,
  data: Partial<Pick<GiftCard, "label" | "balance">>
): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteCard(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { GiftCard } from "./types";

const COL = "giftCards";

export async function getCards(): Promise<GiftCard[]> {
  const snap = await getDocs(collection(db, COL));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GiftCard);
}

export function subscribeCards(
  onUpdate: (cards: GiftCard[]) => void,
  onError: (e: Error) => void,
): () => void {
  return onSnapshot(
    collection(db, COL),
    (snap) =>
      onUpdate(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as GiftCard)),
    onError,
  );
}

export async function getCard(id: string): Promise<GiftCard | null> {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as GiftCard;
}

export async function createCard(
  data: Pick<GiftCard, "label" | "balance">,
): Promise<string> {
  const ref = await addDoc(collection(db, COL), {
    label: data.label || "",
    balance: data.balance,
    originalBalance: data.balance,
    archived: false,
  });
  return ref.id;
}

/** Stamps createdAt — call when setting the original balance for the first time (customer purchase). */
export async function activateCard(
  id: string,
  data: Pick<GiftCard, "label" | "originalBalance" | "balance">,
): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, createdAt: serverTimestamp() });
}

/** Stamps updatedAt — call when redeeming balance. */
export async function redeemCard(
  id: string,
  data: Pick<GiftCard, "label" | "balance">,
): Promise<void> {
  await updateDoc(doc(db, COL, id), { ...data, updatedAt: serverTimestamp() });
}

/** No timestamp side effects — use for label edits or correcting original balance after activation. */
export async function updateCard(
  id: string,
  data: Partial<Pick<GiftCard, "label" | "balance" | "originalBalance" | "archived">>,
): Promise<void> {
  await updateDoc(doc(db, COL, id), data);
}

export async function deleteCard(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id));
}

export async function archiveCard(id: string): Promise<void> {
  await updateCard(id, { archived: true });
}

export async function unarchiveCard(id: string): Promise<void> {
  await updateCard(id, { archived: false });
}

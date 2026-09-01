import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Reusable real-time Firestore collection subscription helper.
 */
export function subscribeToFirestoreCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  onError?: (err: any) => void
): Unsubscribe {
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const items: T[] = snapshot.docs.map((d) => ({
            ...(d.data() as T),
            id: d.id,
          }));
          onData(items);
        }
      },
      (error) => {
        console.warn(`Firestore stream notice for [${collectionName}]:`, error);
        if (onError) onError(error);
      }
    );
  } catch (e) {
    console.warn(`Could not start stream for [${collectionName}]`, e);
    return () => {};
  }
}

/**
 * Reusable Firestore document writer with merge enabled by default.
 */
export async function saveFirestoreDocument<T extends { id: string }>(
  collectionName: string,
  documentData: T
): Promise<boolean> {
  try {
    const docRef = doc(db, collectionName, documentData.id);
    await setDoc(docRef, documentData, { merge: true });
    return true;
  } catch (e) {
    console.error(`Failed to save document in [${collectionName}]:`, e);
    return false;
  }
}

import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot, getDocs, doc, getDoc, updateDoc, addDoc, deleteDoc, where, increment } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Book } from "../lib/types";

export function useBooks(options?: { trending?: boolean; latest?: boolean; limit?: number; category?: string }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = collection(db, "books");
    const constraints: any[] = [];

    if (options?.category) {
      constraints.push(where("category", "==", options.category));
    }

    if (options?.trending) {
      constraints.push(orderBy("viewCount", "desc"));
    } else if (options?.latest) {
      constraints.push(orderBy("createdAt", "desc"));
    } else {
      constraints.push(orderBy("createdAt", "desc"));
    }

    if (options?.limit) {
      constraints.push(limit(options.limit));
    }

    const finalQuery = query(q, ...constraints);

    const unsubscribe = onSnapshot(finalQuery, (snapshot) => {
      const fetchedBooks: Book[] = [];
      snapshot.forEach((doc) => {
        fetchedBooks.push({ id: doc.id, ...doc.data() } as Book);
      });
      setBooks(fetchedBooks);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching books:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [options?.trending, options?.latest, options?.limit, options?.category]);

  return { books, loading };
}

export function useBook(id?: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, "books", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setBook({ id: docSnap.id, ...docSnap.data() } as Book);
      } else {
        setBook(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching book:", error);
      setLoading(false);
    });

    // Increment view count when book is viewed
    updateDoc(docRef, {
      viewCount: increment(1)
    }).catch(console.error);

    return () => unsubscribe();
  }, [id]);

  return { book, loading };
}

export async function createBook(data: Omit<Book, "id" | "createdAt" | "updatedAt" | "viewCount" | "orderCount">) {
  const now = Date.now();
  const docRef = await addDoc(collection(db, "books"), {
    ...data,
    createdAt: now,
    updatedAt: now,
    viewCount: 0,
    orderCount: 0
  });
  return docRef.id;
}

export async function updateBookData(id: string, data: Partial<Book>) {
  const docRef = doc(db, "books", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now()
  });
}

export async function deleteBook(id: string) {
  const docRef = doc(db, "books", id);
  await deleteDoc(docRef);
}

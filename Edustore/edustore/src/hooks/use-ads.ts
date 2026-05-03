import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, getDocs, doc, addDoc, updateDoc, deleteDoc, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Ad, AdApplication } from "../lib/types";

export function useAds(options?: { activeOnly?: boolean; type?: "ribbon" | "redirect" | "popup" }) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = collection(db, "ads");
    const constraints: any[] = [];

    if (options?.activeOnly) {
      constraints.push(where("isActive", "==", true));
    }
    
    if (options?.type) {
      constraints.push(where("type", "==", options.type));
    }

    constraints.push(orderBy("createdAt", "desc"));

    const finalQuery = query(q, ...constraints);

    const unsubscribe = onSnapshot(finalQuery, (snapshot) => {
      const fetchedAds: Ad[] = [];
      snapshot.forEach((doc) => {
        const ad = { id: doc.id, ...doc.data() } as Ad;
        // Client-side filtering for expiration if activeOnly
        if (options?.activeOnly && ad.expiresAt < Date.now()) {
          return;
        }
        fetchedAds.push(ad);
      });
      setAds(fetchedAds);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching ads:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [options?.activeOnly, options?.type]);

  return { ads, loading };
}

export function useAdApplications() {
  const [applications, setApplications] = useState<AdApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "adApplications"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched: AdApplication[] = [];
      snapshot.forEach((doc) => {
        fetched.push({ id: doc.id, ...doc.data() } as AdApplication);
      });
      setApplications(fetched);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching ad applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { applications, loading };
}

export async function createAd(data: Omit<Ad, "id" | "createdAt">) {
  const docRef = await addDoc(collection(db, "ads"), {
    ...data,
    createdAt: Date.now()
  });
  return docRef.id;
}

export async function updateAd(id: string, data: Partial<Ad>) {
  const docRef = doc(db, "ads", id);
  await updateDoc(docRef, data);
}

export async function deleteAd(id: string) {
  const docRef = doc(db, "ads", id);
  await deleteDoc(docRef);
}

export async function submitAdApplication(data: Omit<AdApplication, "id" | "createdAt" | "status">) {
  const docRef = await addDoc(collection(db, "adApplications"), {
    ...data,
    status: "pending",
    createdAt: Date.now()
  });
  return docRef.id;
}

export async function updateApplicationStatus(id: string, status: "approved" | "rejected") {
  const docRef = doc(db, "adApplications", id);
  await updateDoc(docRef, { status });
}

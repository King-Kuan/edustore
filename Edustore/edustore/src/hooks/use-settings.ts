import { useState, useEffect } from "react";
import { collection, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Settings } from "../lib/types";

const SETTINGS_DOC_ID = "main";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, "settings", SETTINGS_DOC_ID);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSettings({ id: docSnap.id, ...docSnap.data() } as Settings);
        } else {
          // Initialize default settings if they don't exist
          const defaultSettings = {
            adminPhone: "+1234567890",
            adminWhatsApp: "1234567890"
          };
          await setDoc(docRef, defaultSettings);
          setSettings({ id: SETTINGS_DOC_ID, ...defaultSettings });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  return { settings, loading };
}

export async function updateSettings(data: Partial<Settings>) {
  const docRef = doc(db, "settings", SETTINGS_DOC_ID);
  await updateDoc(docRef, data);
}

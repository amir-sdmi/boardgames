import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig, isFirebaseConfigured } from "./firebase-config";

// The protected pages display setup guidance before rendering game clients.
// This placeholder permits importing those modules without connecting to a project.
const app = getApps().length
  ? getApp()
  : initializeApp(
      isFirebaseConfigured ? firebaseConfig : { projectId: "unconfigured" },
    );
export const db = getFirestore(app);

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCQrkQuYkUNqFIamgbHJWSyl9MPDzQIZBI",
  authDomain: "disease-project-441119.firebaseapp.com",
  projectId: "disease-project-441119",
  storageBucket: "disease-project-441119.firebasestorage.app",
  messagingSenderId: "625234315822",
  appId: "1:625234315822:web:907037063ad5e3a947edbf"
};

const app = initializeApp(firebaseConfig);

// Use custom firestoreDatabaseId
export const db = getFirestore(app, "ai-studio-ahmadjabarportfo-a6a922c4-1732-46bf-9118-35197004f5b3");

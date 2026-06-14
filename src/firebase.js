import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCkUk8QWBA7v2QT79uyHgeniCReXX8k60c",
  authDomain: "hikezo.firebaseapp.com",
  projectId: "hikezo",
  storageBucket: "hikezo.firebasestorage.app",
  messagingSenderId: "32537171959",
  appId: "1:32537171959:web:bd8ae9f782a5fd522f40f2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

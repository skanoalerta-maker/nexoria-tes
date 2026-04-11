import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyDccMk1KLoCwXWG2g4r1sOI6qEt_7d5gTw",
  authDomain: "dyh-nebula.firebaseapp.com",
  projectId: "dyh-nebula",
  storageBucket: "dyh-nebula.firebasestorage.app",
  messagingSenderId: "230506596749",
  appId: "1:230506596749:web:d7ffcf38de039c9629d5c4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

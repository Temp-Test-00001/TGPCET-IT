// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAbpCJRXBwORZC1_MVaqTVlMOqVoA0CT5w",
    authDomain: "tgpcet-5ef68.firebaseapp.com",
    projectId: "tgpcet-5ef68",
    storageBucket: "tgpcet-5ef68.firebasestorage.app",
    messagingSenderId: "63942237118",
    appId: "1:63942237118:web:16fc9f531ba84a7ce237ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, db, storage, googleProvider };

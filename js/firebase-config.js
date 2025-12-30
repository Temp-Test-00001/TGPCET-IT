// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, enableIndexedDbPersistence, CACHE_SIZE_UNLIMITED } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAbpCJRXBwORZC1_MVaqTVlMOqVoA0CT5w",
    authDomain: "tgpcet-5ef68.firebaseapp.com",
    projectId: "tgpcet-5ef68",
    storageBucket: "tgpcet-5ef68.firebasestorage.app",
    messagingSenderId: "63942237118",
    appId: "1:63942237118:web:d5a181bd04ba0e8ce237ef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Google Provider with additional scopes
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
    prompt: 'select_account'
});

// Enable offline persistence for Firestore
// This allows data to load even when network is unstable
enableIndexedDbPersistence(db, { cacheSizeBytes: CACHE_SIZE_UNLIMITED })
    .then(() => {
        console.log("✓ Firestore offline persistence enabled");
    })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled in one tab at a time
            console.warn("Offline persistence unavailable: multiple tabs open");
        } else if (err.code === 'unimplemented') {
            // The current browser doesn't support offline persistence
            console.warn("Offline persistence not supported in this browser");
        } else {
            console.warn("Offline persistence error:", err);
        }
    });

export { auth, db, storage, googleProvider };

import { db } from './auth.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export const logActivity = async (action, details, user) => {
    try {
        await addDoc(collection(db, "logs"), {
            action: action,
            details: details,
            userEmail: user.email,
            userName: user.displayName || 'Admin',
            timestamp: serverTimestamp()
        });
        console.log("Activity logged:", action);
    } catch (error) {
        console.error("Error logging activity:", error);
    }
};

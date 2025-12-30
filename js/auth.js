import { auth, db, googleProvider } from './firebase-config.js';
import {
    onAuthStateChanged,
    signOut,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const authLinks = document.getElementById('auth-links');

// Check for redirect result on page load (handles signInWithRedirect callback)
getRedirectResult(auth)
    .then((result) => {
        if (result && result.user) {
            console.log("Redirect login successful:", result.user.email);
            // The onAuthStateChanged listener will handle the rest
        }
    })
    .catch((error) => {
        if (error.code !== 'auth/popup-closed-by-user') {
            console.error("Redirect result error:", error);
        }
    });

// ============================================
// Google Login with Fallback to Redirect
// ============================================
async function signInWithGoogleWithFallback() {
    // First, try popup (faster, better UX)
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result;
    } catch (popupError) {
        console.warn("Popup login failed:", popupError.code);

        // Check if we should try redirect
        const shouldFallback = [
            'auth/popup-blocked',
            'auth/popup-closed-by-user',
            'auth/network-request-failed',
            'auth/cancelled-popup-request'
        ].includes(popupError.code);

        if (shouldFallback) {
            console.log("Falling back to redirect login...");
            // Store a flag to know we're in redirect flow
            sessionStorage.setItem('google-login-redirect', 'true');
            await signInWithRedirect(auth, googleProvider);
            // This won't return - page will redirect
            return null;
        }

        // Re-throw if not a fallback-able error
        throw popupError;
    }
}

// Handle Auth State Changes
onAuthStateChanged(auth, async (user) => {
    // Clear redirect flag if present
    sessionStorage.removeItem('google-login-redirect');

    if (user) {
        // User is signed in
        if (authLinks) {
            try {
                // Aggressively enforce Admin Role for specific email
                if (user.email === 'bhushanmallick2006@gmail.com') {
                    const userRef = doc(db, "users", user.uid);
                    const snap = await getDoc(userRef);
                    if (!snap.exists() || snap.data().role !== 'admin') {
                        await setDoc(userRef, {
                            uid: user.uid,
                            email: user.email,
                            role: 'admin',
                            createdAt: new Date().toISOString()
                        }, { merge: true });
                        console.log("Admin role enforced for bhushanmallick2006@gmail.com");
                    }
                }

                // Check role to determine dashboard link
                const userDoc = await getDoc(doc(db, "users", user.uid));
                let dashboardLink = "dashboard/user/index.html"; // Default

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    let role = userData.role || 'user';

                    // Double check local variable logic just in case
                    if (user.email === 'bhushanmallick2006@gmail.com') role = 'admin';

                    dashboardLink = `dashboard/${role}/index.html`;
                } else {
                    // New user - check if admin
                    let role = 'user';
                    if (user.email === 'bhushanmallick2006@gmail.com') {
                        role = 'admin';
                        await setDoc(doc(db, "users", user.uid), {
                            uid: user.uid,
                            email: user.email,
                            role: 'admin',
                            createdAt: new Date().toISOString()
                        });
                    }
                    dashboardLink = `dashboard/${role}/index.html`;
                }

                authLinks.innerHTML = `
                    <div class="user-menu" style="position: relative; display: inline-block;">
                        <button id="user-icon-btn" style="background: none; border: none; cursor: pointer; padding: 0.5rem;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #a855f7); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);">
                                ${user.photoURL ? `<img src="${user.photoURL}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : (user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U')}
                            </div>
                        </button>
                        <div id="user-dropdown" style="display: none; position: absolute; right: 0; top: 100%; width: 200px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 1000; margin-top: 0.5rem;">
                            <div style="padding: 0.75rem 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 0.5rem;">
                                <p style="margin: 0; color: white; font-weight: 600; font-size: 0.9rem;">${user.displayName || 'User'}</p>
                                <p style="margin: 0; color: #94a3b8; font-size: 0.8rem; text-overflow: ellipsis; overflow: hidden;">${user.email}</p>
                            </div>
                            <a href="${dashboardLink}" style="display: block; padding: 0.75rem 1rem; color: #e2e8f0; text-decoration: none; transition: background 0.2s; border-radius: 8px; font-size: 0.9rem; margin-bottom: 0.25rem;">
                                <i class="fas fa-columns" style="margin-right: 0.5rem; color: #a855f7;"></i> Dashboard
                            </a>
                            <button id="logout-btn" style="width: 100%; text-align: left; padding: 0.75rem 1rem; background: none; border: none; color: #ef4444; cursor: pointer; transition: background 0.2s; border-radius: 8px; font-size: 0.9rem; font-family: inherit;">
                                <i class="fas fa-sign-out-alt" style="margin-right: 0.5rem;"></i> Logout
                            </button>
                        </div>
                    </div>
                `;

                const userBtn = document.getElementById('user-icon-btn');
                const dropdown = document.getElementById('user-dropdown');

                if (userBtn && dropdown) {
                    userBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                    });

                    document.addEventListener('click', () => {
                        dropdown.style.display = 'none';
                    });

                    dropdown.addEventListener('click', (e) => e.stopPropagation());

                    // Add hover effect via JS since inline styles are used
                    const links = dropdown.querySelectorAll('a, button#logout-btn');
                    links.forEach(link => {
                        link.addEventListener('mouseenter', () => link.style.background = 'rgba(255, 255, 255, 0.05)');
                        link.addEventListener('mouseleave', () => link.style.background = 'none');
                    });

                    document.getElementById('logout-btn').addEventListener('click', () => {
                        signOut(auth).then(() => {
                            window.location.href = 'index.html';
                        });
                    });
                }
            } catch (error) {
                console.error("Error setting up auth UI:", error);
            }
        }
    } else {
        // User is signed out
        if (authLinks) {
            authLinks.innerHTML = `
                <a href="login.html" class="login-icon-btn" title="Login">
                    <i class="fas fa-user"></i>
                </a>
            `;
        }
    }
});

// Re-export Firestore functions for convenience
import { collection, getDocs, addDoc, deleteDoc, query, where, orderBy, updateDoc, limit } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Export for use in other files
export {
    auth, db, googleProvider,
    signInWithPopup, signInWithRedirect, signInWithGoogleWithFallback,
    signOut,
    doc, getDoc, setDoc, updateDoc,
    signInWithEmailAndPassword, createUserWithEmailAndPassword,
    collection, getDocs, addDoc, deleteDoc, query, where, orderBy, limit
};


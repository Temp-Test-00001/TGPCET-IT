/**
 * TGPCET Website Utilities
 * Provides network detection, retry logic, loading states, and toast notifications
 */

// ============================================
// Network Status Detection
// ============================================
let isOnline = navigator.onLine;
const networkListeners = [];

window.addEventListener('online', () => {
    isOnline = true;
    networkListeners.forEach(cb => cb(true));
    showToast('Connection restored', 'success');
});

window.addEventListener('offline', () => {
    isOnline = false;
    networkListeners.forEach(cb => cb(false));
    showToast('You are offline', 'warning');
});

export function getNetworkStatus() {
    return isOnline;
}

export function onNetworkChange(callback) {
    networkListeners.push(callback);
    return () => {
        const idx = networkListeners.indexOf(callback);
        if (idx > -1) networkListeners.splice(idx, 1);
    };
}

// ============================================
// Retry Logic with Exponential Backoff
// ============================================
export async function withRetry(operation, options = {}) {
    const { maxRetries = 3, baseDelay = 1000, onRetry = null } = options;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            const isLastAttempt = attempt === maxRetries - 1;
            
            if (isLastAttempt) {
                throw error;
            }
            
            // Check if error is retryable
            const retryable = isRetryableError(error);
            if (!retryable) {
                throw error;
            }
            
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
            
            if (onRetry) onRetry(attempt + 1, maxRetries);
            
            await sleep(delay);
        }
    }
}

function isRetryableError(error) {
    const retryableCodes = [
        'auth/network-request-failed',
        'unavailable',
        'resource-exhausted',
        'deadline-exceeded',
        'cancelled'
    ];
    
    return retryableCodes.some(code => 
        error.code?.includes(code) || error.message?.includes(code)
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// Toast Notifications
// ============================================
let toastContainer = null;

function ensureToastContainer() {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
}

export function showToast(message, type = 'info', duration = 4000) {
    const container = ensureToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const colors = {
        success: { bg: 'rgba(34, 197, 94, 0.95)', icon: '✓' },
        error: { bg: 'rgba(239, 68, 68, 0.95)', icon: '✕' },
        warning: { bg: 'rgba(234, 179, 8, 0.95)', icon: '⚠' },
        info: { bg: 'rgba(59, 130, 246, 0.95)', icon: 'ℹ' }
    };
    
    const config = colors[type] || colors.info;
    
    toast.style.cssText = `
        background: ${config.bg};
        color: white;
        padding: 14px 20px;
        border-radius: 12px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    toast.innerHTML = `
        <span style="font-size: 1.2rem;">${config.icon}</span>
        <span>${message}</span>
    `;
    
    // Add animation styles if not present
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, duration);
    
    return toast;
}

// ============================================
// Loading State Helpers
// ============================================
export function createLoadingSpinner(size = 'medium') {
    const sizes = {
        small: '20px',
        medium: '40px',
        large: '60px'
    };
    
    const spinnerSize = sizes[size] || sizes.medium;
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    spinner.innerHTML = `
        <div style="
            width: ${spinnerSize};
            height: ${spinnerSize};
            border: 3px solid rgba(168, 85, 247, 0.2);
            border-top-color: #a855f7;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        "></div>
    `;
    
    // Add spin animation if not present
    if (!document.getElementById('spinner-styles')) {
        const style = document.createElement('style');
        style.id = 'spinner-styles';
        style.textContent = `
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
            .loading-spinner {
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 2rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    return spinner;
}

export function createLoadingOverlay(message = 'Loading...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(15, 23, 42, 0.9);
        backdrop-filter: blur(8px);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 99998;
        gap: 1.5rem;
    `;
    
    overlay.innerHTML = `
        <div style="
            width: 50px;
            height: 50px;
            border: 3px solid rgba(168, 85, 247, 0.2);
            border-top-color: #a855f7;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        "></div>
        <p style="color: #94a3b8; font-family: 'Inter', sans-serif; font-size: 1rem; margin: 0;">${message}</p>
    `;
    
    return overlay;
}

// ============================================
// Retry UI Component
// ============================================
export function createRetryUI(message, onRetry) {
    const container = document.createElement('div');
    container.className = 'retry-ui';
    container.style.cssText = `
        text-align: center;
        padding: 2rem;
        color: #94a3b8;
    `;
    
    container.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <i class="fas fa-exclamation-triangle" style="font-size: 2rem; color: #ef4444; margin-bottom: 0.5rem;"></i>
            <p style="margin: 0.5rem 0;">${message}</p>
        </div>
        <button class="retry-btn" style="
            background: linear-gradient(135deg, #3b82f6, #a855f7);
            color: white;
            padding: 0.75rem 1.5rem;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            transition: transform 0.2s, box-shadow 0.2s;
        ">
            <i class="fas fa-redo" style="margin-right: 0.5rem;"></i>
            Try Again
        </button>
    `;
    
    const btn = container.querySelector('.retry-btn');
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'translateY(-2px)';
        btn.style.boxShadow = '0 8px 20px rgba(168, 85, 247, 0.4)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translateY(0)';
        btn.style.boxShadow = 'none';
    });
    btn.addEventListener('click', onRetry);
    
    return container;
}

// ============================================
// Firebase Error Messages
// ============================================
export function getFirebaseErrorMessage(error) {
    const errorMessages = {
        'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
        'auth/popup-blocked': 'Popup was blocked. Please allow popups or try again.',
        'auth/popup-closed-by-user': 'Login cancelled. Please try again when ready.',
        'auth/user-not-found': 'No account found with this email.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes.',
        'unavailable': 'Service temporarily unavailable. Please try again.',
        'permission-denied': 'You do not have permission to perform this action.'
    };
    
    const code = error.code || '';
    for (const [key, message] of Object.entries(errorMessages)) {
        if (code.includes(key) || error.message?.includes(key)) {
            return message;
        }
    }
    
    return error.message || 'An unexpected error occurred. Please try again.';
}

// ============================================
// Connection Status Indicator
// ============================================
export function createConnectionIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'connection-indicator';
    indicator.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 8px 16px;
        border-radius: 20px;
        font-family: 'Inter', sans-serif;
        font-size: 0.8rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 9999;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
    `;
    
    function updateStatus(online) {
        if (online) {
            indicator.style.background = 'rgba(34, 197, 94, 0.2)';
            indicator.style.color = '#4ade80';
            indicator.style.border = '1px solid rgba(34, 197, 94, 0.3)';
            indicator.innerHTML = '<span style="width: 8px; height: 8px; background: #4ade80; border-radius: 50%;"></span> Online';
        } else {
            indicator.style.background = 'rgba(239, 68, 68, 0.2)';
            indicator.style.color = '#f87171';
            indicator.style.border = '1px solid rgba(239, 68, 68, 0.3)';
            indicator.innerHTML = '<span style="width: 8px; height: 8px; background: #f87171; border-radius: 50%; animation: pulse 1.5s infinite;"></span> Offline';
        }
        
        // Show briefly then hide
        indicator.style.opacity = '1';
        indicator.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            if (online) {
                indicator.style.opacity = '0';
                indicator.style.transform = 'translateY(20px)';
            }
        }, 3000);
    }
    
    // Add pulse animation
    if (!document.getElementById('pulse-styles')) {
        const style = document.createElement('style');
        style.id = 'pulse-styles';
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
        `;
        document.head.appendChild(style);
    }
    
    updateStatus(navigator.onLine);
    onNetworkChange(updateStatus);
    
    document.body.appendChild(indicator);
    return indicator;
}

// script.js - Main Application Initialization

console.log("💼 Savings Tracker App loaded!");

// ============================================
// APPLICATION STATE & CONFIGURATION
// ============================================

let appState = {
    isAuthenticated: false,
    currentUser: null,
    userData: null,
    isLoading: false
};

// ============================================
// 1. SUPABASE INITIALIZATION
// ============================================

/**
 * Initialize Supabase client
 */
function initializeSupabase() {
    try {
        // Check if Supabase is already initialized
        if (window.supabase) {
            console.log("✅ Supabase already initialized");
            return window.supabase;
        }
        
        // Your Supabase credentials
        const supabaseUrl = 'https://vnetyllnjwlsgfspnojs.supabase.co';
        const supabaseKey = 'sb_publishable_qHTc3Ida8tM2SkJNssrX1w_P-RT0hua';
        
        // Create and store Supabase client
        window.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
        console.log("✅ Supabase initialized successfully");
        
        return window.supabase;
    } catch (error) {
        console.error("❌ Failed to initialize Supabase:", error);
        return null;
    }
}

// ============================================
// 2. AUTHENTICATION MANAGEMENT
// ============================================

/**
 * Check if user is logged in
 */
async function checkAuthStatus() {
    try {
        const supabase = initializeSupabase();
        if (!supabase) return false;
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error("❌ Auth session error:", error);
            return false;
        }
        
        if (session?.user) {
            appState.isAuthenticated = true;
            appState.currentUser = session.user;
            console.log("✅ User authenticated:", session.user.email);
            return true;
        }
        
        return false;
    } catch (error) {
        console.error("❌ Auth check failed:", error);
        return false;
    }
}

/**
 * Handle automatic redirection based on auth status
 */
async function handlePageAccess() {
    const isLoggedIn = await checkAuthStatus();
    const currentPage = window.location.pathname;
    
    // If on login page but already logged in, redirect to dashboard
    if (isLoggedIn && (currentPage.includes('index.html') || currentPage === '/')) {
        console.log("🔀 Redirecting to dashboard (already logged in)");
        window.location.href = 'dashboard.html';
        return;
    }
    
    // If on dashboard but not logged in, redirect to login
    if (!isLoggedIn && currentPage.includes('dashboard.html')) {
        console.log("🔀 Redirecting to login (not authenticated)");
        window.location.href = 'index.html';
        return;
    }
    
    // If on onboarding but not logged in, redirect to login
    if (!isLoggedIn && currentPage.includes('onboarding.html')) {
        console.log("🔀 Redirecting to login (onboarding requires auth)");
        window.location.href = 'index.html';
        return;
    }
}

// ============================================
// 3. APPLICATION INITIALIZATION
// ============================================

/**
 * Initialize the entire application
 */
async function initializeApp() {
    console.log("🚀 Initializing Savings Tracker App...");
    
    try {
        // Initialize Supabase first
        initializeSupabase();
        
        // Handle page access based on auth
        await handlePageAccess();
        
        // Load appropriate page-specific scripts
        loadPageSpecificScripts();
        
        console.log("✅ App initialization complete");
    } catch (error) {
        console.error("❌ App initialization failed:", error);
        showErrorMessage("Failed to initialize application. Please refresh the page.");
    }
}

/**
 * Load scripts specific to the current page
 */
function loadPageSpecificScripts() {
    const currentPage = window.location.pathname;
    
    console.log("📄 Current page:", currentPage);
    
    // Scripts are already loaded in HTML, this just logs what should be active
    if (currentPage.includes('index.html') || currentPage === '/') {
        console.log("📍 Login/Signup page - auth.js should handle this");
    }
    
    if (currentPage.includes('dashboard.html')) {
        console.log("📍 Dashboard page - dashboard.js should handle this");
    }
    
    if (currentPage.includes('onboarding.html')) {
        console.log("📍 Onboarding page - onboarding.js should handle this");
    }
}

// ============================================
// 4. UTILITY FUNCTIONS
// ============================================

/**
 * Show error message to user
 */
function showErrorMessage(message, duration = 5000) {
    // Create error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Add styles if not already present
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            .error-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #ef4444;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 10px 25px rgba(239, 68, 68, 0.3);
                z-index: 1001;
                animation: slideInRight 0.3s ease;
                display: flex;
                align-items: center;
                gap: 12px;
                max-width: 350px;
            }
            
            .error-toast i {
                font-size: 1.2rem;
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Remove after duration
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, duration);
}

/**
 * Show loading state
 */
function showLoading(show = true) {
    appState.isLoading = show;
    
    // Add/remove loading overlay
    let overlay = document.getElementById('loading-overlay');
    
    if (show && !overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
        `;
        overlay.innerHTML = `
            <div style="text-align: center;">
                <div class="spinner" style="
                    width: 50px;
                    height: 50px;
                    border: 4px solid #334155;
                    border-top: 4px solid #00d4ff;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p style="color: #cbd5e1;">Loading...</p>
            </div>
        `;
        
        // Add spin animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        overlay.appendChild(style);
        
        document.body.appendChild(overlay);
    } else if (!show && overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        }, 300);
    }
}

// ============================================
// 5. GLOBAL EVENT HANDLERS
// ============================================

/**
 * Setup global event listeners
 */
function setupGlobalEvents() {
    // Handle navigation
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (link && link.getAttribute('href')) {
            const href = link.getAttribute('href');
            
            // Prevent navigation for internal links that need auth check
            if (href.includes('dashboard.html') || href.includes('onboarding.html')) {
                e.preventDefault();
                checkAuthStatus().then(isAuthenticated => {
                    if (isAuthenticated) {
                        window.location.href = href;
                    } else {
                        window.location.href = 'index.html';
                    }
                });
            }
        }
    });
    
    // Handle logout
    document.addEventListener('click', function(e) {
        if (e.target.closest('.logout-btn')) {
            e.preventDefault();
            logoutUser();
        }
    });
}

/**
 * Logout user
 */
async function logoutUser() {
    try {
        showLoading(true);
        
        const supabase = initializeSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }
        
        // Clear app state
        appState.isAuthenticated = false;
        appState.currentUser = null;
        appState.userData = null;
        
        console.log("✅ User logged out successfully");
        
        // Redirect to login page
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error("❌ Logout error:", error);
        showErrorMessage("Logout failed. Please try again.");
    } finally {
        showLoading(false);
    }
}

// ============================================
// 6. EXPORT GLOBAL FUNCTIONS
// ============================================

// Make app functions available globally
window.App = {
    initializeApp,
    checkAuthStatus,
    showLoading,
    showErrorMessage,
    logoutUser,
    getState: () => appState
};

// ============================================
// 7. START THE APPLICATION
// ============================================

// Initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        initializeApp();
        setupGlobalEvents();
    });
} else {
    initializeApp();
    setupGlobalEvents();
}

console.log("🌟 Savings Tracker App Ready!");
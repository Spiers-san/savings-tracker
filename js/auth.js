// auth.js - Authentication Logic with Password Reset & Remember Me (SUPABASE VERSION)

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Auth.js initializing with Supabase...");
    
    // Wait for Supabase to be ready
    if (typeof supabase === 'undefined') {
        console.error("Supabase not loaded yet!");
        setTimeout(() => {
            if (typeof supabase !== 'undefined') {
                initializeAuth();
            } else {
                console.error("Supabase still not loaded. Check if supabase.js is loaded.");
            }
        }, 1000);
    } else {
        initializeAuth();
    }
});

async function initializeAuth() {
    console.log("Initializing authentication with Supabase...");
    
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authError = document.getElementById('authError');

    // Tab switching
    if (loginTab && signupTab) {
        loginTab.addEventListener('click', () => switchTab('login'));
        signupTab.addEventListener('click', () => switchTab('signup'));
    }

    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // ========== PASSWORD RESET FUNCTIONALITY ==========
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const passwordResetModal = document.getElementById('passwordResetModal');
    const closeModalBtn = document.getElementById('closeModal');
    const sendResetEmailBtn = document.getElementById('sendResetEmail');
    const resetEmailInput = document.getElementById('resetEmail');
    
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get email from whichever form is active
            let emailToFill = '';
            
            // Check which tab is active
            const isLoginTabActive = loginTab.classList.contains('active');
            
            if (isLoginTabActive) {
                // Get email from login form
                const loginEmailInput = document.getElementById('loginEmail');
                if (loginEmailInput) {
                    emailToFill = loginEmailInput.value;
                }
            } else {
                // Get email from signup form
                const signupEmailInput = document.getElementById('signupEmail');
                if (signupEmailInput) {
                    emailToFill = signupEmailInput.value;
                }
            }
            
            // Auto-fill the modal with the email
            if (resetEmailInput) {
                resetEmailInput.value = emailToFill;
            }
            
            if (passwordResetModal) {
                passwordResetModal.style.display = 'flex';
            }
        });
    }
    
    if (closeModalBtn && passwordResetModal) {
        closeModalBtn.addEventListener('click', function() {
            passwordResetModal.style.display = 'none';
            const resetMessage = document.getElementById('resetMessage');
            if (resetMessage) {
                resetMessage.style.display = 'none';
            }
        });
    }
    
    // Close modal when clicking outside
    if (passwordResetModal) {
        passwordResetModal.addEventListener('click', function(e) {
            if (e.target === passwordResetModal) {
                passwordResetModal.style.display = 'none';
                if (resetEmailInput) {
                    resetEmailInput.value = '';
                }
                const resetMessage = document.getElementById('resetMessage');
                if (resetMessage) {
                    resetMessage.style.display = 'none';
                }
            }
        });
    }
    
    // Send reset email
    if (sendResetEmailBtn) {
        sendResetEmailBtn.addEventListener('click', async function() {
            const email = resetEmailInput ? resetEmailInput.value.trim() : '';
            const resetMessage = document.getElementById('resetMessage');
            
            if (!email) {
                if (resetMessage) {
                    resetMessage.textContent = 'Please enter your email address.';
                    resetMessage.style.background = '#fef3c7';
                    resetMessage.style.color = '#92400e';
                    resetMessage.style.display = 'block';
                }
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                if (resetMessage) {
                    resetMessage.textContent = 'Please enter a valid email address.';
                    resetMessage.style.background = '#fef3c7';
                    resetMessage.style.color = '#92400e';
                    resetMessage.style.display = 'block';
                }
                return;
            }
            
            // Show loading state
            sendResetEmailBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            sendResetEmailBtn.disabled = true;
            
            try {
                // Send password reset email via Supabase
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: window.location.origin + '/index.html'
                });
                
                if (error) throw error;
                
                // Success
                if (resetMessage) {
                    resetMessage.innerHTML = `
                        <div style="color: #10b981;">
                            <i class="fas fa-check-circle"></i> 
                            <strong>Reset email sent!</strong><br>
                            Check your inbox at <strong>${email}</strong> for the password reset link.
                        </div>
                    `;
                    resetMessage.style.background = '#d1fae5';
                    resetMessage.style.color = '#065f46';
                    resetMessage.style.display = 'block';
                }
                
                sendResetEmailBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
                
                // Close modal after 3 seconds
                setTimeout(() => {
                    if (passwordResetModal) {
                        passwordResetModal.style.display = 'none';
                    }
                    if (resetEmailInput) {
                        resetEmailInput.value = '';
                    }
                    if (resetMessage) {
                        resetMessage.style.display = 'none';
                    }
                    sendResetEmailBtn.innerHTML = 'Send Reset Link';
                    sendResetEmailBtn.disabled = false;
                }, 3000);
            } catch (error) {
                // Error handling
                let errorMessage = 'Failed to send reset email. ';
                
                if (error.message.includes('user not found')) {
                    errorMessage = 'No account found with this email. Please sign up.';
                } else if (error.message.includes('invalid email')) {
                    errorMessage = 'Invalid email address format.';
                } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
                    errorMessage = 'Too many attempts. Please try again later.';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Network error. Please check your internet connection.';
                } else {
                    errorMessage += error.message;
                }
                
                if (resetMessage) {
                    resetMessage.textContent = errorMessage;
                    resetMessage.style.background = '#fee2e2';
                    resetMessage.style.color = '#991b1b';
                    resetMessage.style.display = 'block';
                }
                
                sendResetEmailBtn.innerHTML = 'Send Reset Link';
                sendResetEmailBtn.disabled = false;
            }
        });
    }

    // Check if user is already logged in
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            console.log("User found:", session.user.email);
            
            // With Supabase, we can check email confirmation status
            if (session.user.confirmed_at || session.user.email_confirmed_at) {
                const redirectTo = checkOnboardingStatus(session.user.id);
                console.log("Redirecting to:", redirectTo);
                
                if (redirectTo === 'dashboard') {
                    window.location.href = 'dashboard.html';
                } else {
                    window.location.href = 'onboarding.html';
                }
            } else {
                // User not verified - keep on login page
                console.log("Email not verified yet:", session.user.email);
            }
        } else {
            console.log("No user logged in, staying on login page");
        }
    } catch (error) {
        console.error("Error checking auth state:", error);
    }
}

function switchTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authError = document.getElementById('authError');

    if (authError) {
        authError.style.display = 'none';
    }

    if (tab === 'login') {
        if (loginTab) loginTab.classList.add('active');
        if (signupTab) signupTab.classList.remove('active');
        if (loginForm) loginForm.classList.add('active');
        if (signupForm) signupForm.classList.remove('active');
    } else {
        if (loginTab) loginTab.classList.remove('active');
        if (signupTab) signupTab.classList.add('active');
        if (loginForm) loginForm.classList.remove('active');
        if (signupForm) signupForm.classList.add('active');
    }
}

async function handleLogin(e) {
    e.preventDefault();
    console.log("Login form submitted");
    
    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const rememberMeInput = document.getElementById('rememberMe');
    
    if (!emailInput || !passwordInput) {
        console.error("Login form elements not found!");
        return;
    }
    
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const rememberMe = rememberMeInput ? rememberMeInput.checked : false;
    const authError = document.getElementById('authError');

    if (authError) {
        authError.style.display = 'none';
    }

    // Validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) {
        console.error("Submit button not found!");
        return;
    }
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;

    try {
        console.log("Signing in with email:", email);
        
        // Login with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (error) throw error;
        
        const user = data.user;
        console.log("Login successful:", user.email);
        
        // Check if email is confirmed (Supabase uses confirmed_at)
        if (!user.confirmed_at && !user.email_confirmed_at) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Offer to resend verification email
            const resend = confirm('Your email is not verified. Would you like us to resend the verification email?');
            if (resend) {
                try {
                    const { error: resendError } = await supabase.auth.resend({
                        type: 'signup',
                        email: email
                    });
                    
                    if (resendError) throw resendError;
                    alert('Verification email sent! Please check your inbox.');
                } catch (resendError) {
                    console.error("Error sending verification:", resendError);
                    alert('Failed to send verification email. Please try signing up again.');
                }
            }
            return;
        }
        
        // Email is verified - check where to redirect
        const redirectTo = checkOnboardingStatus(user.id);
        
        if (redirectTo === 'dashboard') {
            window.location.href = 'dashboard.html';
        } else {
            window.location.href = 'onboarding.html';
        }
        
    } catch (error) {
        console.error("Login error:", error.message);
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (error.message.includes('Invalid login credentials')) {
            showError('Incorrect email or password');
        } else if (error.message.includes('Email not confirmed')) {
            showError('Please verify your email first. Check your inbox.');
        } else if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
            showError('Too many failed attempts. Please try again later.');
        } else if (error.message.includes('network')) {
            showError('Network error. Please check your internet connection.');
        } else {
            showError('Login failed: ' + error.message);
        }
    }
}

async function handleSignup(e) {
    e.preventDefault();
    console.log("Signup form submitted");
    
    const nameInput = document.getElementById('signupName');
    const emailInput = document.getElementById('signupEmail');
    const passwordInput = document.getElementById('signupPassword');
    const confirmPasswordInput = document.getElementById('signupConfirmPassword');
    
    if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput) {
        console.error("Signup form elements not found!");
        return;
    }
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const authError = document.getElementById('authError');

    if (authError) {
        authError.style.display = 'none';
    }

    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showError('Please fill in all fields');
        return;
    }

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        return;
    }

    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (!submitBtn) {
        console.error("Submit button not found!");
        return;
    }
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;

    try {
        // Sign up with Supabase (automatically sends verification email!)
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    name: name,
                    full_name: name
                },
                emailRedirectTo: window.location.origin
            }
        });
        
        if (error) throw error;
        
        console.log("Signup successful:", data.user?.email || email);
        
        // Clear any old data for fresh start
        if (data.user) {
            cleanupOldUserData(data.user.id);
        }
        
        // Show success message
        const signupForm = document.getElementById('signupForm');
        if (!signupForm) return;
        
        submitBtn.innerHTML = '<i class="fas fa-check"></i> Check Your Email!';
        submitBtn.style.background = '#10b981';
        submitBtn.style.color = 'white';
        
        // Hide the form and show success message
        const successHTML = `
            <div class="success-message" style="
                background: rgba(16, 185, 129, 0.1);
                border: 2px solid #10b981;
                color: #10b981;
                padding: 25px;
                border-radius: 12px;
                margin-top: 30px;
                text-align: center;
            ">
                <i class="fas fa-envelope-open-text fa-3x" style="margin-bottom: 15px;"></i>
                <h3 style="margin-bottom: 10px;">Verification Email Sent!</h3>
                <p style="margin-bottom: 15px;">We've sent a verification link to:</p>
                <p style="background: #0f172a; padding: 10px; border-radius: 8px; font-weight: bold; margin: 10px 0;">${email}</p>
                <p style="font-size: 0.9rem; color: #94a3b8;">
                    <i class="fas fa-lightbulb"></i> Check your inbox and click the link to activate your account.
                </p>
                <div style="margin-top: 20px; padding: 15px; background: rgba(0, 212, 255, 0.1); border-radius: 8px;">
                    <p style="margin: 5px 0; font-size: 0.85rem;">
                        <i class="fas fa-info-circle"></i> Didn't receive the email? Check spam folder.
                    </p>
                    <button id="resendBtn" style="
                        background: transparent;
                        border: 1px solid #00d4ff;
                        color: #00d4ff;
                        padding: 8px 20px;
                        border-radius: 8px;
                        margin-top: 10px;
                        cursor: pointer;
                    ">
                        <i class="fas fa-redo"></i> Resend Email
                    </button>
                    <button id="switchToLoginBtn" style="
                        background: #3b82f6;
                        border: none;
                        color: white;
                        padding: 8px 20px;
                        border-radius: 8px;
                        margin-top: 10px;
                        margin-left: 10px;
                        cursor: pointer;
                    ">
                        <i class="fas fa-sign-in-alt"></i> Go to Login
                    </button>
                </div>
            </div>
        `;
        
        signupForm.insertAdjacentHTML('afterend', successHTML);
        signupForm.style.display = 'none';
        
        // Add resend functionality
        const resendBtn = document.getElementById('resendBtn');
        if (resendBtn) {
            resendBtn.addEventListener('click', async function() {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                this.disabled = true;
                
                try {
                    const { error } = await supabase.auth.resend({
                        type: 'signup',
                        email: email
                    });
                    
                    if (error) throw error;
                    
                    this.innerHTML = '<i class="fas fa-check"></i> Resent!';
                    this.style.background = '#10b981';
                    this.style.borderColor = '#10b981';
                    this.style.color = 'white';
                    
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-redo"></i> Resend Again';
                        this.style.background = 'transparent';
                        this.style.borderColor = '#00d4ff';
                        this.style.color = '#00d4ff';
                        this.disabled = false;
                    }, 3000);
                } catch (error) {
                    console.error("Error resending verification:", error);
                    this.innerHTML = '<i class="fas fa-exclamation-circle"></i> Failed';
                    this.style.background = '#ef4444';
                    this.style.borderColor = '#ef4444';
                    this.style.color = 'white';
                    setTimeout(() => {
                        this.innerHTML = '<i class="fas fa-redo"></i> Try Again';
                        this.style.background = 'transparent';
                        this.style.borderColor = '#00d4ff';
                        this.style.color = '#00d4ff';
                        this.disabled = false;
                    }, 2000);
                }
            });
        }
        
        // Add switch to login button
        const switchToLoginBtn = document.getElementById('switchToLoginBtn');
        if (switchToLoginBtn) {
            switchToLoginBtn.addEventListener('click', function() {
                switchTab('login');
                
                // Remove success message
                const successMsg = document.querySelector('.success-message');
                if (successMsg) {
                    successMsg.remove();
                }
                
                // Show form again
                signupForm.style.display = 'block';
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
                submitBtn.style.color = '';
                
                // Clear form
                nameInput.value = '';
                emailInput.value = '';
                passwordInput.value = '';
                confirmPasswordInput.value = '';
            });
        }
        
        // Auto-switch to login after 10 seconds
        setTimeout(() => {
            switchTab('login');
            
            const successMsg = document.querySelector('.success-message');
            if (successMsg) {
                successMsg.remove();
            }
            
            signupForm.style.display = 'block';
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
            submitBtn.style.color = '';
            
            // Clear form
            nameInput.value = '';
            emailInput.value = '';
            passwordInput.value = '';
            confirmPasswordInput.value = '';
        }, 10000);
        
    } catch (error) {
        console.error("Signup error:", error.message);
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        if (error.message.includes('already registered') || error.message.includes('user already exists')) {
            showError('Email already in use. Please login instead.');
            switchTab('login');
        } else if (error.message.includes('invalid email')) {
            showError('Invalid email address format');
        } else if (error.message.includes('weak password') || error.message.includes('password is too weak')) {
            showError('Password is too weak. Use at least 6 characters.');
        } else if (error.message.includes('network')) {
            showError('Network error. Please check your internet connection.');
        } else {
            showError('Signup failed: ' + error.message);
        }
    }
}

function showError(message) {
    const authError = document.getElementById('authError');
    if (authError) {
        authError.textContent = message;
        authError.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            authError.style.display = 'none';
        }, 5000);
    } else {
        console.error("Auth error element not found!");
    }
}

// Clean up old user data
function cleanupOldUserData(userId) {
    console.log("Cleaning up old data for user:", userId);
    
    // Remove old shared data
    localStorage.removeItem('savingsTrackerData');
    localStorage.removeItem('savingsTrackerTransactions');
    
    // Remove any old user-specific data
    const oldKeys = Object.keys(localStorage).filter(key => 
        key.includes('savings') || 
        key.includes('onboarding') ||
        key.includes('tracker')
    );
    
    oldKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log("Removed old key:", key);
    });
    
    // Store current user ID
    localStorage.setItem('currentUserId', userId);
    
    console.log("✅ Fresh start for new user!");
}

// Check if user completed onboarding
function checkOnboardingStatus(userId) {
    console.log("Checking onboarding status for user:", userId);
    
    if (!userId) {
        return 'onboarding';
    }
    
    // Check user-specific data first
    const userKey = `savingsTrackerData_${userId}`;
    const savedData = localStorage.getItem(userKey);
    
    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            console.log("Found user data:", data);
            
            if (data.setupComplete === true) {
                return 'dashboard'; // Go to dashboard
            }
        } catch (e) {
            console.error("Error parsing user data:", e);
        }
    }
    
    // Check legacy data (temporary)
    const legacyData = localStorage.getItem('savingsTrackerData');
    if (legacyData) {
        try {
            const data = JSON.parse(legacyData);
            if (data.setupComplete === true) {
                return 'dashboard';
            }
        } catch (e) {
            // Ignore parsing errors
        }
    }
    
    // Default to onboarding if no data exists or setup not complete
    return 'onboarding';
}

// Make functions available globally
window.switchTab = switchTab;
window.showError = showError;
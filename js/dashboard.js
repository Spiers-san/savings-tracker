// dashboard.js - Savings Tracker Dashboard Logic

// Global variables
let currentUser = null;
let userGoals = [];
let userTransactions = [];

// ============================================
// 1. INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log("=== SAVINGS TRACKER DASHBOARD INITIALIZING ===");
    
    try {
        // Initialize Supabase
        currentUser = await initializeSupabase();
        
        if (!currentUser) {
            console.error("❌ Failed to initialize user");
            return;
        }
        
        // Update user info in navbar
        updateUserInfo(currentUser);
        
        // Load user data from Supabase
        await loadUserData(currentUser);
        
        // Setup event listeners
        setupEventListeners();
        
        console.log("✅ Dashboard initialized successfully");
        
    } catch (error) {
        console.error("❌ Dashboard initialization error:", error);
        showErrorMessage("Failed to load dashboard. Please refresh.");
    }
});

// ============================================
// 2. SUPABASE INITIALIZATION
// ============================================

async function initializeSupabase() {
    console.log("🔧 Initializing Supabase...");
    
    // Check if Supabase is already loaded
    if (!window.supabase) {
        console.error("❌ Supabase not loaded!");
        return null;
    }
    
    // Get current session
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error) {
        console.error("❌ Session error:", error);
        return null;
    }
    
    if (!session?.user) {
        console.log("⚠️ No user logged in, redirecting to login");
        window.location.href = 'index.html';
        return null;
    }
    
    console.log("✅ User authenticated:", session.user.email);
    console.log("✅ User ID:", session.user.id);
    
    return session.user;
}

// ============================================
// 3. DATA LOADING FUNCTIONS - FIXED!
// ============================================

async function loadUserData(user) {
    console.log("📂 Loading user data...");
    
    // Load savings goals
    await loadSavingsGoals(user.id);
    
    // Load transactions
    await loadTransactions(user.id);
    
    // Update dashboard UI
    updateDashboardUI();
}

async function loadSavingsGoals(userId) {
    console.log("🎯 Loading savings goals...");
    
    try {
        const { data, error } = await window.supabase
            .from('savings_goals')
            .select('*')
            .eq('user_id', userId)
            .order('id', { ascending: false }); // FIX: Use 'id' instead of 'created_at'
        
        if (error) {
            console.error("❌ Error loading goals:", error);
            userGoals = [];
            return;
        }
        
        userGoals = data || [];
        console.log(`✅ Loaded ${userGoals.length} savings goals:`, data);
        
    } catch (error) {
        console.error("❌ Exception loading goals:", error);
        userGoals = [];
    }
}

async function loadTransactions(userId) {
    console.log("💰 Loading transactions...");
    
    try {
        const { data, error } = await window.supabase
            .from('transaction')
            .select('*')
            .eq('user_id', userId)
            .order('id', { ascending: false }) // FIX: Use 'id' instead of 'created_at'
            .limit(10);
        
        if (error) {
            console.error("❌ Error loading transactions:", error);
            userTransactions = [];
            return;
        }
        
        userTransactions = data || [];
        console.log(`✅ Loaded ${userTransactions.length} recent transactions`);
        
    } catch (error) {
        console.error("❌ Exception loading transactions:", error);
        userTransactions = [];
    }
}

// ============================================
// 4. UI UPDATE FUNCTIONS
// ============================================

function updateUserInfo(user) {
    const emailEl = document.getElementById('userEmail');
    const greetingEl = document.getElementById('userGreeting');
    
    if (emailEl) emailEl.textContent = user.email;
    if (greetingEl) {
        // Try to get name from user metadata
        if (user.user_metadata?.name) {
            const firstName = user.user_metadata.name.split(' ')[0];
            greetingEl.textContent = `Hello ${firstName}!`;
        } else {
            greetingEl.textContent = `Welcome back!`;
        }
    }
}

function updateDashboardUI() {
    console.log("🔄 Updating dashboard UI...");
    console.log("Current goals:", userGoals);
    
    // Calculate totals
    const totalSaved = userGoals.reduce((sum, goal) => sum + (parseFloat(goal.current_amount) || 0), 0);
    const totalGoals = userGoals.length;
    const completedGoals = userGoals.filter(goal => goal.is_completed).length;
    const nextDeadline = getNextDeadline();
    
    // Update overview cards
    document.getElementById('totalSaved').textContent = formatCurrency(totalSaved);
    document.getElementById('totalGoals').textContent = totalGoals;
    document.getElementById('completedGoals').textContent = completedGoals;
    document.getElementById('nextDeadline').textContent = nextDeadline || '--/--/----';
    
    // Update goals list
    updateGoalsList();
    
    // Update transactions list
    updateTransactionsList();
    
    console.log("✅ Dashboard UI updated");
}

function updateGoalsList() {
    const goalsList = document.getElementById('goalsList');
    if (!goalsList) return;
    
    console.log("Updating goals list with", userGoals.length, "goals");
    
    if (userGoals.length === 0) {
        goalsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bullseye"></i>
                <p>No savings goals yet</p>
                <button onclick="showAddGoalModal()" class="add-first-btn">
                    Create Your First Goal
                </button>
            </div>
        `;
        return;
    }
    
    let goalsHTML = '';
    
    userGoals.forEach(goal => {
        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
        const progressPercent = Math.min(100, Math.max(0, progress)).toFixed(1);
        
        goalsHTML += `
            <div class="goal-card">
                <div class="goal-header">
                    <div class="goal-icon">
                        <i class="${goal.icon || 'fas fa-bullseye'}"></i>
                    </div>
                    <div class="goal-info">
                        <h3 class="goal-name">${goal.goal_name || 'Unnamed Goal'}</h3>
                        <div class="goal-category">${goal.category || 'General'}</div>
                    </div>
                    <div class="goal-status ${goal.is_completed ? 'completed' : 'active'}">
                        ${goal.is_completed ? '✓ Completed' : '● Active'}
                    </div>
                </div>
                
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%; background: ${goal.color || '#3b82f6'}"></div>
                    </div>
                    <div class="progress-text">
                        <span>${formatCurrency(goal.current_amount)} / ${formatCurrency(goal.target_amount)}</span>
                        <span>${progressPercent}%</span>
                    </div>
                </div>
                
                <div class="goal-details">
                    <div class="goal-deadline">
                        <i class="fas fa-calendar"></i>
                        ${goal.deadline ? formatDate(goal.deadline) : 'No deadline'}
                    </div>
                    <button onclick="viewGoalDetails('${goal.id}')" class="view-goal-btn">
                        <i class="fas fa-eye"></i> View
                    </button>
                </div>
            </div>
        `;
    });
    
    goalsList.innerHTML = goalsHTML;
}

function updateTransactionsList() {
    const transactionsList = document.getElementById('transactionsList');
    if (!transactionsList) return;
    
    if (userTransactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No transactions yet</p>
                <button onclick="showAddDepositModal()" class="add-first-btn">
                    Make Your First Deposit
                </button>
            </div>
        `;
        return;
    }
    
    let transactionsHTML = '';
    
    userTransactions.forEach(transaction => {
        const goal = userGoals.find(g => g.id === transaction.goal_id);
        const goalName = goal ? goal.goal_name : 'Unknown Goal';
        
        transactionsHTML += `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-icon ${transaction.type}">
                        <i class="fas fa-${transaction.type === 'deposit' ? 'plus' : 'minus'}"></i>
                    </div>
                    <div class="transaction-details">
                        <h4>${goalName}</h4>
                        <p>${transaction.description || 'No description'}</p>
                        <small>${formatDateTime(transaction.created_at)}</small>
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type}">
                    ${transaction.type === 'deposit' ? '+' : '-'}${formatCurrency(transaction.amount)}
                </div>
            </div>
        `;
    });
    
    transactionsList.innerHTML = transactionsHTML;
}

// ============================================
// 5. UTILITY FUNCTIONS
// ============================================

function getNextDeadline() {
    if (userGoals.length === 0) return null;
    
    const activeGoals = userGoals.filter(goal => !goal.is_completed && goal.deadline);
    if (activeGoals.length === 0) return null;
    
    const nextGoal = activeGoals.reduce((prev, current) => {
        return new Date(prev.deadline) < new Date(current.deadline) ? prev : current;
    });
    
    return formatDate(nextGoal.deadline);
}

function formatCurrency(amount) {
    if (isNaN(amount)) return '₹0.00';
    return '₹' + parseFloat(amount).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '';
    try {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return 'Date unknown';
    }
}

function showErrorMessage(message) {
    // Create error message element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ef4444;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 350px;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 5 seconds
    setTimeout(() => {
        errorDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (errorDiv.parentNode) {
                document.body.removeChild(errorDiv);
            }
        }, 300);
    }, 5000);
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 12px;
        max-width: 350px;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (successDiv.parentNode) {
                document.body.removeChild(successDiv);
            }
        }, 300);
    }, 3000);
}

function setupEventListeners() {
    console.log("🔗 Setting up event listeners...");
    
    // Refresh button (if exists)
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            console.log("🔄 Manual refresh triggered");
            await loadUserData(currentUser);
        });
    }
}

// ============================================
// 6. GOAL CREATION FUNCTIONS
// ============================================

window.showAddGoalModal = async function() {
    console.log("🎯 Opening Add Goal modal...");
    
    try {
        // Remove any existing modal first
        const existingModal = document.getElementById('goalModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create the modal
        const modalHTML = `
            <div id="goalModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Create New Savings Goal</h2>
                        <button class="close-modal" onclick="closeGoalModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="goalForm">
                            <div class="form-group">
                                <label for="goalName">Goal Name</label>
                                <input type="text" id="goalName" placeholder="e.g., New Laptop, Vacation Fund" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="goalCategory">Category</label>
                                <select id="goalCategory" required>
                                    <option value="">Select Category</option>
                                    <option value="Travel">✈️ Travel</option>
                                    <option value="Electronics">📱 Electronics</option>
                                    <option value="Education">🎓 Education</option>
                                    <option value="Home">🏠 Home</option>
                                    <option value="Vehicle">🚗 Vehicle</option>
                                    <option value="Emergency">⚠️ Emergency Fund</option>
                                    <option value="Other">📦 Other</option>
                                </select>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="targetAmount">Target Amount (₹)</label>
                                    <input type="number" id="targetAmount" min="1" placeholder="10000" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="currentAmount">Already Saved (₹)</label>
                                    <input type="number" id="currentAmount" min="0" placeholder="0">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label for="deadline">Deadline (Optional)</label>
                                <input type="date" id="deadline" min="${new Date().toISOString().split('T')[0]}">
                            </div>
                            
                            <div class="form-group">
                                <label for="goalColor">Color Theme</label>
                                <div class="color-options">
                                    <div class="color-option" style="background: #3b82f6;" data-color="#3b82f6"></div>
                                    <div class="color-option" style="background: #10b981;" data-color="#10b981"></div>
                                    <div class="color-option" style="background: #f59e0b;" data-color="#f59e0b"></div>
                                    <div class="color-option" style="background: #ef4444;" data-color="#ef4444"></div>
                                    <div class="color-option" style="background: #8b5cf6;" data-color="#8b5cf6"></div>
                                    <div class="color-option" style="background: #ec4899;" data-color="#ec4899"></div>
                                </div>
                                <input type="hidden" id="goalColor" value="#3b82f6">
                            </div>
                            
                            <div class="modal-actions">
                                <button type="button" class="btn-secondary" onclick="closeGoalModal()">Cancel</button>
                                <button type="submit" class="btn-primary">Create Goal</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Setup color picker
        const colorOptions = document.querySelectorAll('.color-option');
        const colorInput = document.getElementById('goalColor');
        
        colorOptions.forEach(option => {
            option.addEventListener('click', function() {
                colorOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                colorInput.value = this.dataset.color;
            });
        });
        
        // Select first color by default
        if (colorOptions.length > 0) {
            colorOptions[0].classList.add('active');
        }
        
        // Handle form submission
        const goalForm = document.getElementById('goalForm');
        goalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await createNewGoal();
        });
        
        console.log("✅ Goal modal created successfully");
        
    } catch (error) {
        console.error("❌ Error creating goal modal:", error);
        showErrorMessage("Failed to open goal creator. Please try again.");
    }
};

window.closeGoalModal = function() {
    const modal = document.getElementById('goalModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }
};

async function createNewGoal() {
    console.log("🎯 Creating new goal...");
    
    try {
        // Get form values
        const goalName = document.getElementById('goalName').value.trim();
        const category = document.getElementById('goalCategory').value;
        const targetAmount = parseFloat(document.getElementById('targetAmount').value);
        const currentAmount = parseFloat(document.getElementById('currentAmount').value) || 0;
        const deadline = document.getElementById('deadline').value || null;
        const color = document.getElementById('goalColor').value;
        
        // Validation
        if (!goalName) {
            showErrorMessage("Please enter a goal name");
            return;
        }
        
        if (!category) {
            showErrorMessage("Please select a category");
            return;
        }
        
        if (!targetAmount || targetAmount <= 0) {
            showErrorMessage("Please enter a valid target amount");
            return;
        }
        
        if (currentAmount < 0) {
            showErrorMessage("Current amount cannot be negative");
            return;
        }
        
        if (currentAmount > targetAmount) {
            showErrorMessage("Current amount cannot exceed target amount");
            return;
        }
        
        // Create goal object
        const goalData = {
            user_id: currentUser.id,
            goal_name: goalName,
            category: category,
            target_amount: targetAmount,
            current_amount: currentAmount,
            deadline: deadline,
            color: color,
            icon: getIconForCategory(category),
            is_completed: currentAmount >= targetAmount
        };
        
        console.log("📤 Saving goal to database:", goalData);
        
        // Save to Supabase
        const { data, error } = await window.supabase
            .from('savings_goals')
            .insert([goalData])
            .select();
        
        if (error) {
            console.error("❌ Error saving goal:", error);
            showErrorMessage("Failed to save goal: " + error.message);
            return;
        }
        
        console.log("✅ Goal saved successfully:", data);
        
        // Close modal
        closeGoalModal();
        
        // Refresh goals list
        await loadSavingsGoals(currentUser.id);
        updateDashboardUI();
        
        // Show success message
        showSuccessMessage(`Goal "${goalName}" created successfully!`);
        
    } catch (error) {
        console.error("❌ Exception creating goal:", error);
        showErrorMessage("Failed to create goal. Please try again.");
    }
};

function getIconForCategory(category) {
    const icons = {
        'Travel': 'fas fa-plane',
        'Electronics': 'fas fa-laptop',
        'Education': 'fas fa-graduation-cap',
        'Home': 'fas fa-home',
        'Vehicle': 'fas fa-car',
        'Emergency': 'fas fa-shield-alt',
        'Other': 'fas fa-bullseye'
    };
    
    return icons[category] || 'fas fa-bullseye';
}

// ============================================
// 7. DEPOSIT/WITHDRAWAL FUNCTIONS - FIXED!
// ============================================

window.showAddDepositModal = async function() {
    console.log("💰 Opening Add Deposit/Withdrawal modal...");
    console.log("Current userGoals before refresh:", userGoals);
    
    try {
        // FIRST, refresh goals to ensure we have latest data
        if (currentUser) {
            await loadSavingsGoals(currentUser.id);
        }
        
        console.log("Current userGoals after refresh:", userGoals);
        
        // Check if we have goals first
        if (userGoals.length === 0) {
            showErrorMessage("Please create a savings goal first!");
            setTimeout(() => showAddGoalModal(), 1000);
            return;
        }
        
        // Remove any existing modal first
        const existingModal = document.getElementById('depositModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create the modal
        const modalHTML = `
            <div id="depositModal" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Add Transaction</h2>
                        <button class="close-modal" onclick="closeDepositModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <form id="depositForm">
                            <div class="form-group">
                                <label for="transactionType">Transaction Type</label>
                                <select id="transactionType" required>
                                    <option value="deposit">➕ Deposit</option>
                                    <option value="withdrawal">➖ Withdrawal</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="transactionGoal">Select Goal</label>
                                <select id="transactionGoal" required>
                                    <option value="">Select a goal</option>
                                    ${userGoals.map(goal => 
                                        `<option value="${goal.id}">${goal.goal_name} (₹${goal.current_amount}/${goal.target_amount})</option>`
                                    ).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="transactionAmount">Amount (₹)</label>
                                <input type="number" id="transactionAmount" min="1" placeholder="1000" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="transactionDescription">Description (Optional)</label>
                                <input type="text" id="transactionDescription" placeholder="e.g., Monthly savings, Bonus">
                            </div>
                            
                            <div class="modal-actions">
                                <button type="button" class="btn-secondary" onclick="closeDepositModal()">Cancel</button>
                                <button type="submit" class="btn-primary">Add Transaction</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Handle form submission
        const depositForm = document.getElementById('depositForm');
        depositForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await addTransaction();
        });
        
        console.log("✅ Deposit modal created successfully");
        
    } catch (error) {
        console.error("❌ Error creating deposit modal:", error);
        showErrorMessage("Failed to open transaction form. Please try again.");
    }
};

window.closeDepositModal = function() {
    const modal = document.getElementById('depositModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }
};

async function addTransaction() {
    console.log("💰 Adding transaction...");
    
    try {
        // Get form values
        const type = document.getElementById('transactionType').value;
        const goalId = document.getElementById('transactionGoal').value;
        const amount = parseFloat(document.getElementById('transactionAmount').value);
        const description = document.getElementById('transactionDescription').value.trim();
        
        // Validation
        if (!goalId) {
            showErrorMessage("Please select a goal");
            return;
        }
        
        if (!amount || amount <= 0) {
            showErrorMessage("Please enter a valid amount");
            return;
        }
        
        // Debug: Check what we're working with
        console.log("Goal ID from form:", goalId, "Type:", typeof goalId);
        console.log("Available goals:", userGoals);
        
        // CRITICAL FIX: Convert goalId to number for comparison
        const numericGoalId = parseInt(goalId);
        const selectedGoal = userGoals.find(g => g.id === numericGoalId);
        
        if (!selectedGoal) {
            console.error("Goal not found. Goal ID from form:", goalId, "Numeric ID:", numericGoalId);
            console.error("Looking for ID:", numericGoalId);
            console.error("Available goal IDs:", userGoals.map(g => ({id: g.id, name: g.goal_name})));
            showErrorMessage("Selected goal not found. Please refresh and try again.");
            return;
        }
        
        console.log("✅ Found goal:", selectedGoal.goal_name, "ID:", selectedGoal.id);
        
        // Check for withdrawal validity
        if (type === 'withdrawal' && amount > selectedGoal.current_amount) {
            showErrorMessage(`Cannot withdraw more than current balance (₹${selectedGoal.current_amount})`);
            return;
        }
        
        // Create transaction object
        const transactionData = {
            user_id: currentUser.id,
            goal_id: numericGoalId, // Use the numeric ID
            type: type,
            amount: amount,
            description: description || null
        };
        
        console.log("📤 Saving transaction to database:", transactionData);
        
        // Save transaction to Supabase
        const { data: transaction, error: transactionError } = await window.supabase
            .from('transaction')
            .insert([transactionData])
            .select();
        
        if (transactionError) {
            console.error("❌ Error saving transaction:", transactionError);
            showErrorMessage("Failed to save transaction: " + transactionError.message);
            return;
        }
        
        // Update goal's current amount
        const newAmount = type === 'deposit' 
            ? selectedGoal.current_amount + amount
            : selectedGoal.current_amount - amount;
        
        const isCompleted = newAmount >= selectedGoal.target_amount;
        
        const { error: goalError } = await window.supabase
            .from('savings_goals')
            .update({ 
                current_amount: newAmount,
                is_completed: isCompleted
            })
            .eq('id', numericGoalId);
        
        if (goalError) {
            console.error("❌ Error updating goal:", goalError);
            showErrorMessage("Transaction saved but failed to update goal");
        }
        
        console.log("✅ Transaction saved successfully");
        
        // Close modal
        closeDepositModal();
        
        // Refresh all data
        await loadSavingsGoals(currentUser.id);
        await loadTransactions(currentUser.id);
        updateDashboardUI();
        
        // Show success message
        const action = type === 'deposit' ? 'Deposit' : 'Withdrawal';
        showSuccessMessage(`${action} of ₹${amount} recorded successfully!`);
        
    } catch (error) {
        console.error("❌ Exception adding transaction:", error);
        showErrorMessage("Failed to add transaction. Please try again.");
    }
};

// ============================================
// 8. VIEW ALL GOALS PAGE
// ============================================

window.viewAllGoals = function() {
    console.log("📋 Opening All Goals page...");
    
    // Create modal to show all goals
    const modalHTML = `
        <div id="allGoalsModal" class="modal-overlay">
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h2>All Savings Goals (${userGoals.length})</h2>
                    <button class="close-modal" onclick="closeAllGoalsModal()">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="goals-summary">
                        <div class="summary-card">
                            <i class="fas fa-bullseye"></i>
                            <div>
                                <h3>Total Goals</h3>
                                <p>${userGoals.length}</p>
                            </div>
                        </div>
                        <div class="summary-card">
                            <i class="fas fa-check-circle"></i>
                            <div>
                                <h3>Completed</h3>
                                <p>${userGoals.filter(g => g.is_completed).length}</p>
                            </div>
                        </div>
                        <div class="summary-card">
                            <i class="fas fa-clock"></i>
                            <div>
                                <h3>Active</h3>
                                <p>${userGoals.filter(g => !g.is_completed).length}</p>
                            </div>
                        </div>
                        <div class="summary-card">
                            <i class="fas fa-rupee-sign"></i>
                            <div>
                                <h3>Total Saved</h3>
                                <p>${formatCurrency(userGoals.reduce((sum, g) => sum + parseFloat(g.current_amount), 0))}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="all-goals-list">
                        ${userGoals.length === 0 ? 
                            `<div class="empty-state">
                                <i class="fas fa-bullseye"></i>
                                <p>No savings goals yet</p>
                                <button onclick="showAddGoalModal(); closeAllGoalsModal();" class="add-first-btn">
                                    Create Your First Goal
                                </button>
                            </div>` 
                            : 
                            userGoals.map(goal => {
                                const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
                                const progressPercent = Math.min(100, Math.max(0, progress)).toFixed(1);
                                const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                                
                                return `
                                    <div class="goal-card-detailed">
                                        <div class="goal-main-info">
                                            <div class="goal-icon-large" style="background: ${goal.color || '#3b82f6'}">
                                                <i class="${goal.icon || 'fas fa-bullseye'}"></i>
                                            </div>
                                            <div class="goal-details">
                                                <h3>${goal.goal_name}</h3>
                                                <div class="goal-meta">
                                                    <span class="category">${goal.category}</span>
                                                    <span class="status ${goal.is_completed ? 'completed' : 'active'}">
                                                        ${goal.is_completed ? '✓ Completed' : '● Active'}
                                                    </span>
                                                    ${goal.deadline ? 
                                                        `<span class="deadline ${daysLeft <= 7 ? 'urgent' : ''}">
                                                            <i class="fas fa-calendar"></i>
                                                            ${formatDate(goal.deadline)} 
                                                            ${daysLeft > 0 ? `(${daysLeft} days left)` : '(Overdue)'}
                                                        </span>` 
                                                        : ''
                                                    }
                                                </div>
                                            </div>
                                            <div class="goal-amounts">
                                                <div class="current-amount">${formatCurrency(goal.current_amount)}</div>
                                                <div class="target-amount">Target: ${formatCurrency(goal.target_amount)}</div>
                                            </div>
                                        </div>
                                        
                                        <div class="goal-progress-detailed">
                                            <div class="progress-info">
                                                <span>Progress: ${progressPercent}%</span>
                                                <span>${formatCurrency(goal.current_amount)} of ${formatCurrency(goal.target_amount)}</span>
                                            </div>
                                            <div class="progress-bar">
                                                <div class="progress-fill" style="width: ${progressPercent}%; background: ${goal.color || '#3b82f6'}"></div>
                                            </div>
                                        </div>
                                        
                                        <div class="goal-actions">
                                            <button onclick="addToGoal('${goal.id}')" class="btn-action">
                                                <i class="fas fa-plus"></i> Add Money
                                            </button>
                                            <button onclick="viewGoalDetails('${goal.id}')" class="btn-action">
                                                <i class="fas fa-eye"></i> Details
                                            </button>
                                            <button onclick="editGoal('${goal.id}')" class="btn-action">
                                                <i class="fas fa-edit"></i> Edit
                                            </button>
                                        </div>
                                    </div>
                                `;
                            }).join('')
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add styles for all goals modal
    if (!document.getElementById('all-goals-styles')) {
        const style = document.createElement('style');
        style.id = 'all-goals-styles';
        style.textContent = `
            .goals-summary {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            
            .summary-card {
                background: #f8fafc;
                border-radius: 10px;
                padding: 15px;
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .summary-card i {
                font-size: 1.5rem;
                color: #3b82f6;
            }
            
            .summary-card h3 {
                margin: 0;
                font-size: 0.9rem;
                color: #64748b;
                font-weight: 500;
            }
            
            .summary-card p {
                margin: 5px 0 0;
                font-size: 1.5rem;
                font-weight: bold;
                color: #1e293b;
            }
            
            .all-goals-list {
                max-height: 60vh;
                overflow-y: auto;
            }
            
            .goal-card-detailed {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 15px;
            }
            
            .goal-main-info {
                display: flex;
                align-items: center;
                gap: 15px;
                margin-bottom: 15px;
            }
            
            .goal-icon-large {
                width: 50px;
                height: 50px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 1.2rem;
            }
            
            .goal-details {
                flex: 1;
            }
            
            .goal-details h3 {
                margin: 0 0 8px 0;
                font-size: 1.1rem;
            }
            
            .goal-meta {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .goal-meta span {
                font-size: 0.85rem;
                padding: 3px 10px;
                border-radius: 20px;
                background: #f1f5f9;
            }
            
            .goal-meta .category {
                background: #e0f2fe;
                color: #0369a1;
            }
            
            .goal-meta .status.completed {
                background: #d1fae5;
                color: #065f46;
            }
            
            .goal-meta .status.active {
                background: #fef3c7;
                color: #92400e;
            }
            
            .goal-meta .deadline {
                background: #fce7f3;
                color: #9d174d;
            }
            
            .goal-meta .deadline.urgent {
                background: #fee2e2;
                color: #dc2626;
            }
            
            .goal-amounts {
                text-align: right;
            }
            
            .current-amount {
                font-size: 1.3rem;
                font-weight: bold;
                color: #1e293b;
            }
            
            .target-amount {
                font-size: 0.9rem;
                color: #64748b;
            }
            
            .goal-progress-detailed {
                margin-bottom: 15px;
            }
            
            .progress-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 0.9rem;
                color: #475569;
            }
            
            .goal-actions {
                display: flex;
                gap: 10px;
            }
            
            .btn-action {
                padding: 8px 15px;
                border: 1px solid #cbd5e1;
                border-radius: 6px;
                background: white;
                color: #475569;
                cursor: pointer;
                font-size: 0.85rem;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            
            .btn-action:hover {
                background: #f8fafc;
                border-color: #94a3b8;
            }
        `;
        document.head.appendChild(style);
    }
};

window.closeAllGoalsModal = function() {
    const modal = document.getElementById('allGoalsModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }
};

// Helper functions for goal actions
function addToGoal(goalId) {
    closeAllGoalsModal();
    showAddDepositModal();
    // Pre-select the goal
    setTimeout(() => {
        const goalSelect = document.getElementById('transactionGoal');
        if (goalSelect) goalSelect.value = goalId;
    }, 100);
}

function editGoal(goalId) {
    alert(`Edit goal ${goalId} - Feature coming soon!`);
}

// ============================================
// 9. TRANSACTION HISTORY PAGE
// ============================================

window.viewTransactionHistory = async function() {
    console.log("📊 Opening Transaction History...");
    
    try {
        // Load all transactions (not just recent ones)
        const { data: allTransactions, error } = await window.supabase
            .from('transaction')
            .select('*, savings_goals(goal_name)')
            .eq('user_id', currentUser.id)
            .order('id', { ascending: false }); // FIX: Use 'id' instead of 'created_at'
        
        if (error) {
            console.error("❌ Error loading transaction history:", error);
            showErrorMessage("Failed to load transaction history");
            return;
        }
        
        // Create modal to show transaction history
        const modalHTML = `
            <div id="transactionHistoryModal" class="modal-overlay">
                <div class="modal-content" style="max-width: 900px;">
                    <div class="modal-header">
                        <h2>Transaction History (${allTransactions.length})</h2>
                        <button class="close-modal" onclick="closeTransactionHistoryModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="transaction-filters">
                            <div class="filter-group">
                                <label>Filter by Type:</label>
                                <select id="filterType" onchange="filterTransactions()">
                                    <option value="all">All Transactions</option>
                                    <option value="deposit">Deposits Only</option>
                                    <option value="withdrawal">Withdrawals Only</option>
                                </select>
                            </div>
                            <div class="filter-group">
                                <label>Filter by Date:</label>
                                <select id="filterDate" onchange="filterTransactions()">
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="transaction-summary">
                            <div class="summary-item">
                                <i class="fas fa-plus-circle" style="color: #10b981;"></i>
                                <div>
                                    <h3>Total Deposits</h3>
                                    <p>${formatCurrency(allTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + parseFloat(t.amount), 0))}</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <i class="fas fa-minus-circle" style="color: #ef4444;"></i>
                                <div>
                                    <h3>Total Withdrawals</h3>
                                    <p>${formatCurrency(allTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + parseFloat(t.amount), 0))}</p>
                                </div>
                            </div>
                            <div class="summary-item">
                                <i class="fas fa-exchange-alt" style="color: #3b82f6;"></i>
                                <div>
                                    <h3>Net Flow</h3>
                                    <p>${formatCurrency(
                                        allTransactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + parseFloat(t.amount), 0) -
                                        allTransactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + parseFloat(t.amount), 0)
                                    )}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="transactions-history-list" id="transactionsHistoryList">
                            ${allTransactions.length === 0 ? 
                                `<div class="empty-state">
                                    <i class="fas fa-receipt"></i>
                                    <p>No transactions yet</p>
                                    <button onclick="showAddDepositModal(); closeTransactionHistoryModal();" class="add-first-btn">
                                        Make Your First Transaction
                                    </button>
                                </div>` 
                                : 
                                allTransactions.map(transaction => {
                                    const goalName = transaction.savings_goals?.goal_name || 'Unknown Goal';
                                    return `
                                        <div class="transaction-history-item" data-type="${transaction.type}" data-date="${transaction.created_at}">
                                            <div class="transaction-icon ${transaction.type}">
                                                <i class="fas fa-${transaction.type === 'deposit' ? 'plus' : 'minus'}"></i>
                                            </div>
                                            <div class="transaction-info">
                                                <h4>${goalName}</h4>
                                                <p>${transaction.description || 'No description'}</p>
                                                <small>${formatDateTime(transaction.created_at)}</small>
                                            </div>
                                            <div class="transaction-amount ${transaction.type}">
                                                ${transaction.type === 'deposit' ? '+' : '-'}${formatCurrency(transaction.amount)}
                                            </div>
                                        </div>
                                    `;
                                }).join('')
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Store transactions for filtering
        window.allTransactionsData = allTransactions;
        
    } catch (error) {
        console.error("❌ Error opening transaction history:", error);
        showErrorMessage("Failed to load transaction history");
    }
};

window.closeTransactionHistoryModal = function() {
    const modal = document.getElementById('transactionHistoryModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }
};

// ============================================
// 10. VIEW GOAL DETAILS
// ============================================

window.viewGoalDetails = async function(goalId) {
    console.log(`🔍 Viewing goal details: ${goalId}`);
    
    try {
        // Convert goalId to number for comparison
        const numericGoalId = parseInt(goalId);
        
        // Get goal details
        const goal = userGoals.find(g => g.id === numericGoalId);
        if (!goal) {
            showErrorMessage("Goal not found");
            return;
        }
        
        // Get transactions for this goal
        const { data: goalTransactions, error } = await window.supabase
            .from('transaction')
            .select('*')
            .eq('goal_id', numericGoalId)
            .order('id', { ascending: false }); // FIX: Use 'id' instead of 'created_at'
        
        if (error) {
            console.error("❌ Error loading goal transactions:", error);
        }
        
        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
        const progressPercent = Math.min(100, Math.max(0, progress)).toFixed(1);
        const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
        const remainingAmount = goal.target_amount - goal.current_amount;
        const monthlySaving = daysLeft ? remainingAmount / Math.max(1, daysLeft / 30) : null;
        
        // Create modal
        const modalHTML = `
            <div id="goalDetailsModal" class="modal-overlay">
                <div class="modal-content" style="max-width: 700px;">
                    <div class="modal-header">
                        <h2>${goal.goal_name}</h2>
                        <button class="close-modal" onclick="closeGoalDetailsModal()">&times;</button>
                    </div>
                    
                    <div class="modal-body">
                        <div class="goal-details-header">
                            <div class="goal-icon-large" style="background: ${goal.color || '#3b82f6'}">
                                <i class="${goal.icon || 'fas fa-bullseye'}"></i>
                            </div>
                            <div class="goal-header-info">
                                <div class="goal-category-badge">${goal.category}</div>
                                <div class="goal-status-badge ${goal.is_completed ? 'completed' : 'active'}">
                                    ${goal.is_completed ? '✓ Completed' : '● Active'}
                                </div>
                                ${goal.deadline ? 
                                    `<div class="goal-deadline-badge ${daysLeft <= 7 ? 'urgent' : ''}">
                                        <i class="fas fa-calendar"></i>
                                        ${formatDate(goal.deadline)} 
                                        ${daysLeft > 0 ? `(${daysLeft} days left)` : '(Overdue)'}
                                    </div>` 
                                    : ''
                                }
                            </div>
                        </div>
                        
                        <div class="goal-progress-section">
                            <div class="progress-stats">
                                <div class="stat">
                                    <label>Current Amount</label>
                                    <div class="value">${formatCurrency(goal.current_amount)}</div>
                                </div>
                                <div class="stat">
                                    <label>Target Amount</label>
                                    <div class="value">${formatCurrency(goal.target_amount)}</div>
                                </div>
                                <div class="stat">
                                    <label>Remaining</label>
                                    <div class="value">${formatCurrency(remainingAmount)}</div>
                                </div>
                                <div class="stat">
                                    <label>Progress</label>
                                    <div class="value">${progressPercent}%</div>
                                </div>
                            </div>
                            
                            <div class="progress-bar-large">
                                <div class="progress-fill" style="width: ${progressPercent}%; background: ${goal.color || '#3b82f6'}"></div>
                            </div>
                            
                            ${monthlySaving && monthlySaving > 0 ? `
                                <div class="saving-suggestion">
                                    <i class="fas fa-lightbulb"></i>
                                    To reach your goal on time, save about ${formatCurrency(monthlySaving)} per month
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="goal-actions-section">
                            <button onclick="addToGoal('${goal.id}'); closeGoalDetailsModal();" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Money
                            </button>
                            <button onclick="editGoal('${goal.id}')" class="btn-secondary">
                                <i class="fas fa-edit"></i> Edit Goal
                            </button>
                        </div>
                        
                        <div class="goal-transactions">
                            <h3>Recent Transactions</h3>
                            ${goalTransactions && goalTransactions.length > 0 ? 
                                `<div class="transactions-list">
                                    ${goalTransactions.map(transaction => `
                                        <div class="transaction-item-detailed">
                                            <div class="transaction-type ${transaction.type}">
                                                <i class="fas fa-${transaction.type === 'deposit' ? 'plus' : 'minus'}"></i>
                                            </div>
                                            <div class="transaction-details-detailed">
                                                <div class="transaction-main">
                                                    <h4>${transaction.description || 'No description'}</h4>
                                                    <div class="transaction-amount-detailed ${transaction.type}">
                                                        ${transaction.type === 'deposit' ? '+' : '-'}${formatCurrency(transaction.amount)}
                                                    </div>
                                                </div>
                                                <small>${formatDateTime(transaction.created_at)}</small>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>` 
                                : 
                                `<div class="empty-state">
                                    <i class="fas fa-receipt"></i>
                                    <p>No transactions for this goal yet</p>
                                    <button onclick="addToGoal('${goal.id}'); closeGoalDetailsModal();" class="add-first-btn">
                                        Add First Transaction
                                    </button>
                                </div>`
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
    } catch (error) {
        console.error("❌ Error loading goal details:", error);
        showErrorMessage("Failed to load goal details");
    }
};

window.closeGoalDetailsModal = function() {
    const modal = document.getElementById('goalDetailsModal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 300);
    }
};

// ============================================
// 11. AUTO-REFRESH (Optional)
// ============================================

// Auto-refresh data every 30 seconds
setInterval(async () => {
    if (currentUser) {
        console.log("🔄 Auto-refreshing data...");
        await loadUserData(currentUser);
    }
}, 30000);

console.log("✅ dashboard.js loaded successfully!");
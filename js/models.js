// modals.js - Modal functionality for Savings Tracker

// ============================================
// 1. MODAL TEMPLATES
// ============================================

const modalTemplates = {
    // Add Goal Modal
    addGoal: `
        <div class="modal-overlay" id="addGoalModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-bullseye"></i> Add New Savings Goal</h3>
                    <button class="modal-close" onclick="closeModal('addGoalModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="addGoalForm">
                        <div class="form-group">
                            <label for="goalName">
                                <i class="fas fa-tag"></i> Goal Name
                            </label>
                            <input type="text" id="goalName" class="form-input" 
                                   placeholder="e.g., Emergency Fund, New Car, Vacation" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="targetAmount">
                                    <i class="fas fa-bullseye"></i> Target Amount
                                </label>
                                <input type="number" id="targetAmount" class="form-input" 
                                       placeholder="10000" min="0" step="0.01" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="currentAmount">
                                    <i class="fas fa-wallet"></i> Current Amount
                                </label>
                                <input type="number" id="currentAmount" class="form-input" 
                                       placeholder="0" min="0" step="0.01" value="0">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="goalDeadline">
                                <i class="fas fa-calendar"></i> Deadline (Optional)
                            </label>
                            <input type="date" id="goalDeadline" class="form-input">
                        </div>
                        
                        <div class="form-group">
                            <label for="goalCategory">
                                <i class="fas fa-folder"></i> Category
                            </label>
                            <select id="goalCategory" class="form-input">
                                <option value="Emergency">Emergency Fund</option>
                                <option value="Travel">Travel</option>
                                <option value="Vehicle">Vehicle</option>
                                <option value="Home">Home</option>
                                <option value="Education">Education</option>
                                <option value="Health">Health</option>
                                <option value="Gadgets">Gadgets</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="goalColor">
                                    <i class="fas fa-palette"></i> Color
                                </label>
                                <input type="color" id="goalColor" class="form-input color-picker" 
                                       value="#3b82f6">
                            </div>
                            
                            <div class="form-group">
                                <label for="goalIcon">
                                    <i class="fas fa-icons"></i> Icon
                                </label>
                                <select id="goalIcon" class="form-input">
                                    <option value="fas fa-bullseye">Target</option>
                                    <option value="fas fa-car">Car</option>
                                    <option value="fas fa-plane">Travel</option>
                                    <option value="fas fa-home">Home</option>
                                    <option value="fas fa-graduation-cap">Education</option>
                                    <option value="fas fa-heart">Health</option>
                                    <option value="fas fa-laptop">Gadgets</option>
                                    <option value="fas fa-shield-alt">Emergency</option>
                                    <option value="fas fa-piggy-bank">Savings</option>
                                    <option value="fas fa-gem">Luxury</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('addGoalModal')">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Create Goal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    
    // Add Deposit Modal
    addDeposit: `
        <div class="modal-overlay" id="addDepositModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-money-bill-wave"></i> Add Deposit</h3>
                    <button class="modal-close" onclick="closeModal('addDepositModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="addDepositForm">
                        <div class="form-group">
                            <label for="depositGoal">
                                <i class="fas fa-bullseye"></i> Select Goal
                            </label>
                            <select id="depositGoal" class="form-input" required>
                                <option value="">-- Select a goal --</option>
                                <!-- Goals will be populated dynamically -->
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="depositAmount">
                                <i class="fas fa-rupee-sign"></i> Amount
                            </label>
                            <input type="number" id="depositAmount" class="form-input" 
                                   placeholder="1000" min="0.01" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="depositDescription">
                                <i class="fas fa-file-alt"></i> Description (Optional)
                            </label>
                            <input type="text" id="depositDescription" class="form-input" 
                                   placeholder="e.g., Monthly savings, Bonus, Gift">
                        </div>
                        
                        <div class="form-group">
                            <label for="depositDate">
                                <i class="fas fa-calendar"></i> Date
                            </label>
                            <input type="date" id="depositDate" class="form-input" 
                                   value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('addDepositModal')">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-plus"></i> Add Deposit
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    
    // Add Withdrawal Modal
    addWithdrawal: `
        <div class="modal-overlay" id="addWithdrawalModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-minus-circle"></i> Add Withdrawal</h3>
                    <button class="modal-close" onclick="closeModal('addWithdrawalModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <form id="addWithdrawalForm">
                        <div class="form-group">
                            <label for="withdrawalGoal">
                                <i class="fas fa-bullseye"></i> Select Goal
                            </label>
                            <select id="withdrawalGoal" class="form-input" required>
                                <option value="">-- Select a goal --</option>
                                <!-- Goals will be populated dynamically -->
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="withdrawalAmount">
                                <i class="fas fa-rupee-sign"></i> Amount
                            </label>
                            <input type="number" id="withdrawalAmount" class="form-input" 
                                   placeholder="1000" min="0.01" step="0.01" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="withdrawalDescription">
                                <i class="fas fa-file-alt"></i> Description (Optional)
                            </label>
                            <input type="text" id="withdrawalDescription" class="form-input" 
                                   placeholder="e.g., Emergency expense, Purchase">
                        </div>
                        
                        <div class="form-group">
                            <label for="withdrawalDate">
                                <i class="fas fa-calendar"></i> Date
                            </label>
                            <input type="date" id="withdrawalDate" class="form-input" 
                                   value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('addWithdrawalModal')">
                                Cancel
                            </button>
                            <button type="submit" class="btn-primary">
                                <i class="fas fa-minus"></i> Add Withdrawal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `,
    
    // View Goal Details Modal
    viewGoal: `
        <div class="modal-overlay" id="viewGoalModal">
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h3><i class="fas fa-info-circle"></i> Goal Details</h3>
                    <button class="modal-close" onclick="closeModal('viewGoalModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div id="goalDetailsContent">
                        <!-- Goal details will be loaded here -->
                    </div>
                </div>
            </div>
        </div>
    `
};

// ============================================
// 2. MODAL MANAGEMENT FUNCTIONS
// ============================================

// Show a modal
function showModal(modalName, data = {}) {
    console.log(`Opening modal: ${modalName}`);
    
    // Close any open modal first
    closeAllModals();
    
    // Get the template
    const template = modalTemplates[modalName];
    if (!template) {
        console.error(`Modal template not found: ${modalName}`);
        return;
    }
    
    // Create modal container if it doesn't exist
    let modalsContainer = document.getElementById('modalsContainer');
    if (!modalsContainer) {
        modalsContainer = document.createElement('div');
        modalsContainer.id = 'modalsContainer';
        document.body.appendChild(modalsContainer);
    }
    
    // Insert the modal
    modalsContainer.innerHTML = template;
    
    // Initialize modal based on type
    setTimeout(() => {
        initializeModal(modalName, data);
    }, 10);
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
}

// Initialize modal with data
function initializeModal(modalName, data) {
    const modal = document.getElementById(`${modalName}Modal`);
    if (!modal) return;
    
    switch(modalName) {
        case 'addGoal':
            initializeAddGoalModal(data);
            break;
        case 'addDeposit':
            initializeAddDepositModal(data);
            break;
        case 'addWithdrawal':
            initializeAddWithdrawalModal(data);
            break;
        case 'viewGoal':
            initializeViewGoalModal(data);
            break;
    }
    
    // Add click outside to close
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal(`${modalName}Modal`);
        }
    });
}

// Close a specific modal
function closeModal(modalId) {
    console.log(`Closing modal: ${modalId}`);
    
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.remove();
    }
    
    // Check if any modals are left
    const modalsContainer = document.getElementById('modalsContainer');
    if (modalsContainer && modalsContainer.children.length === 0) {
        modalsContainer.remove();
    }
    
    // Restore body scroll
    if (document.querySelectorAll('.modal-overlay').length === 0) {
        document.body.style.overflow = 'auto';
    }
}

// Close all modals
function closeAllModals() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => {
        modal.remove();
    });
    
    const modalsContainer = document.getElementById('modalsContainer');
    if (modalsContainer) {
        modalsContainer.remove();
    }
    
    document.body.style.overflow = 'auto';
}

// ============================================
// 3. MODAL INITIALIZATION FUNCTIONS
// ============================================

function initializeAddGoalModal(data) {
    const form = document.getElementById('addGoalForm');
    if (!form) return;
    
    // Set today as minimum date for deadline
    const today = new Date().toISOString().split('T')[0];
    const deadlineInput = document.getElementById('goalDeadline');
    if (deadlineInput) {
        deadlineInput.min = today;
    }
    
    // Handle form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const goalData = {
            goal_name: document.getElementById('goalName').value.trim(),
            target_amount: parseFloat(document.getElementById('targetAmount').value),
            current_amount: parseFloat(document.getElementById('currentAmount').value) || 0,
            deadline: document.getElementById('goalDeadline').value || null,
            category: document.getElementById('goalCategory').value,
            color: document.getElementById('goalColor').value,
            icon: document.getElementById('goalIcon').value,
            is_completed: false
        };
        
        // Validation
        if (goalData.target_amount <= 0) {
            alert('Target amount must be greater than 0');
            return;
        }
        
        if (goalData.current_amount < 0) {
            alert('Current amount cannot be negative');
            return;
        }
        
        if (goalData.current_amount > goalData.target_amount) {
            if (!confirm('Current amount exceeds target amount. Continue?')) {
                return;
            }
        }
        
        try {
            // Get current user
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                alert('Please login again');
                window.location.href = 'index.html';
                return;
            }
            
            // Add user_id and created_at
            goalData.user_id = session.user.id;
            goalData.created_at = new Date().toISOString();
            
            console.log('Creating goal:', goalData);
            
            // Insert into database
            const { data, error } = await supabase
                .from('savings_goals')
                .insert([goalData])
                .select();
            
            if (error) throw error;
            
            console.log('Goal created successfully:', data);
            alert('Savings goal created successfully!');
            
            // Close modal
            closeModal('addGoalModal');
            
            // Refresh dashboard
            if (typeof loadUserData === 'function') {
                await loadUserData(session.user);
            } else {
                window.location.reload();
            }
            
        } catch (error) {
            console.error('Error creating goal:', error);
            alert('Error creating goal: ' + error.message);
        }
    });
}

async function initializeAddDepositModal(data) {
    const form = document.getElementById('addDepositForm');
    if (!form) return;
    
    try {
        // Get current user and their goals
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            alert('Please login again');
            window.location.href = 'index.html';
            return;
        }
        
        // Fetch user's goals
        const { data: goals, error } = await supabase
            .from('savings_goals')
            .select('id, goal_name, current_amount, target_amount')
            .eq('user_id', session.user.id)
            .eq('is_completed', false);
        
        if (error) throw error;
        
        // Populate goals dropdown
        const select = document.getElementById('depositGoal');
        select.innerHTML = '<option value="">-- Select a goal --</option>';
        
        if (goals.length === 0) {
            select.innerHTML = '<option value="" disabled>No active goals found</option>';
            select.disabled = true;
        } else {
            goals.forEach(goal => {
                const option = document.createElement('option');
                option.value = goal.id;
                option.textContent = `${goal.goal_name} (₹${goal.current_amount.toFixed(2)} / ₹${goal.target_amount.toFixed(2)})`;
                select.appendChild(option);
            });
        }
        
        // Handle form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const transactionData = {
                goal_id: parseInt(document.getElementById('depositGoal').value),
                amount: parseFloat(document.getElementById('depositAmount').value),
                type: 'deposit',
                description: document.getElementById('depositDescription').value.trim() || 'Deposit',
                created_at: document.getElementById('depositDate').value || new Date().toISOString()
            };
            
            // Validation
            if (transactionData.amount <= 0) {
                alert('Amount must be greater than 0');
                return;
            }
            
            try {
                // Get selected goal
                const selectedGoalId = transactionData.goal_id;
                const selectedGoal = goals.find(g => g.id === selectedGoalId);
                
                if (!selectedGoal) {
                    alert('Please select a valid goal');
                    return;
                }
                
                // Add user_id
                transactionData.user_id = session.user.id;
                
                console.log('Creating deposit:', transactionData);
                
                // Insert transaction
                const { data: transaction, error: transError } = await supabase
                    .from('transaction')
                    .insert([transactionData])
                    .select();
                
                if (transError) throw transError;
                
                // Update goal current amount
                const newCurrentAmount = selectedGoal.current_amount + transactionData.amount;
                const { error: goalError } = await supabase
                    .from('savings_goals')
                    .update({ 
                        current_amount: newCurrentAmount,
                        is_completed: newCurrentAmount >= selectedGoal.target_amount
                    })
                    .eq('id', selectedGoalId);
                
                if (goalError) throw goalError;
                
                console.log('Deposit created successfully:', transaction);
                alert('Deposit added successfully!');
                
                // Close modal
                closeModal('addDepositModal');
                
                // Refresh dashboard
                if (typeof loadUserData === 'function') {
                    await loadUserData(session.user);
                } else {
                    window.location.reload();
                }
                
            } catch (error) {
                console.error('Error adding deposit:', error);
                alert('Error adding deposit: ' + error.message);
            }
        });
        
    } catch (error) {
        console.error('Error initializing deposit modal:', error);
        alert('Error loading goals: ' + error.message);
    }
}

// Initialize withdrawal modal (similar to deposit)
async function initializeAddWithdrawalModal(data) {
    // Similar to initializeAddDepositModal but for withdrawals
    // Implementation would be very similar
    console.log('Withdrawal modal initialized');
}

// Initialize view goal modal
async function initializeViewGoalModal(goalId) {
    // This would fetch and display goal details
    console.log('View goal modal initialized for goal:', goalId);
}

// ============================================
// 4. GLOBAL EXPORTS
// ============================================

// Make functions globally available
window.showModal = showModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;

// Dashboard button functions
window.showAddGoalModal = function() {
    showModal('addGoal');
};

window.showAddDepositModal = function() {
    showModal('addDeposit');
};

window.showAddWithdrawalModal = function() {
    showModal('addWithdrawal');
};

window.viewGoalDetails = function(goalId) {
    showModal('viewGoal', { goalId: goalId });
};

console.log('✅ modals.js loaded successfully!');
// ========== GLOBAL BILLS ARRAY ==========
// Initialize ONCE at global scope - this is the SINGLE SOURCE OF TRUTH
if (typeof window._savingsTrackerBills === 'undefined') {
    window._savingsTrackerBills = [];
    console.log("✅ Created fresh bills array");
}

// Create an alias for easy access
Object.defineProperty(window, 'userBills', {
    get: function() {
        return window._savingsTrackerBills;
    },
    set: function(value) {
        window._savingsTrackerBills = Array.isArray(value) ? value : [];
        console.log("📦 Bills array updated:", window._savingsTrackerBills.length, "items");
    },
    configurable: true
});

window.currentStep = 1;

// ========== STEP NAVIGATION ==========
window.goToStep = function(stepNumber) {
    console.log("Going to step:", stepNumber);
    
    // Hide all steps
    document.querySelectorAll('.onboarding-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Show target step
    const targetStep = document.getElementById('step' + stepNumber);
    if (targetStep) {
        targetStep.classList.add('active');
    }
    
    // Update progress bar
    document.querySelectorAll('.progress-step').forEach((stepEl, index) => {
        if (index + 1 <= stepNumber) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.remove('active');
        }
    });
    
    window.currentStep = stepNumber;
    
    // Update bills list if we're on step 3
    if (stepNumber === 3) {
        setTimeout(updateBillsList, 100);
    }
    
    // Auto-focus on inputs
    setTimeout(() => {
        if (stepNumber === 1) {
            document.getElementById('currentBalance')?.focus();
        } else if (stepNumber === 2) {
            const firstOption = document.querySelector('.option-card');
            if (firstOption) firstOption.focus();
        } else if (stepNumber === 3) {
            document.getElementById('billName')?.focus();
        }
    }, 100);
};

// ========== STEP 2: INCOME SELECTION ==========
window.selectIncomeOption = function(option) {
    console.log("Income option selected:", option);
    
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    const selectedCard = document.querySelector(`.option-card[onclick*="${option}"]`);
    if (selectedCard) {
        selectedCard.classList.add('selected');
    }
    
    const incomeSection = document.getElementById('incomeAmountSection');
    if (option === 'yes') {
        if (incomeSection) incomeSection.style.display = 'block';
        setTimeout(() => {
            document.getElementById('monthlyIncome')?.focus();
        }, 100);
    } else {
        if (incomeSection) incomeSection.style.display = 'none';
    }
};

// ========== STEP 3: BILL MANAGEMENT ==========
window.addBill = function() {
    const billNameInput = document.getElementById('billName');
    const billAmountInput = document.getElementById('billAmount');
    
    if (!billNameInput || !billAmountInput) return;
    
    const name = billNameInput.value.trim();
    const amount = parseFloat(billAmountInput.value);
    
    if (!name || !amount || amount <= 0) {
        alert("Please enter both bill name and amount (greater than 0)");
        return;
    }
    
    const newBill = {
        id: Date.now(),
        name: name,
        amount: amount,
        addedAt: new Date().toISOString()
    };
    
    // Add to the SINGLE source of truth
    window._savingsTrackerBills.push(newBill);
    
    billNameInput.value = '';
    billAmountInput.value = '';
    billNameInput.focus();
    
    updateBillsList();
    
    console.log("✅ Bill added to _savingsTrackerBills:", newBill);
    console.log("📊 Total bills in array:", window._savingsTrackerBills.length);
};

function updateBillsList() {
    const billsList = document.getElementById('billsList');
    if (!billsList) return;
    
    const billsArray = window._savingsTrackerBills;
    
    if (billsArray.length === 0) {
        billsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No bills added yet</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    let total = 0;
    
    billsArray.forEach(bill => {
        total += bill.amount;
        html += `
            <div class="bill-item" data-bill-id="${bill.id}">
                <div class="bill-info">
                    <span class="bill-name">${bill.name}</span>
                    <span class="bill-amount">₹${bill.amount.toFixed(2)}</span>
                </div>
                <button onclick="removeBill(${bill.id})" class="remove-bill-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    });
    
    html += `
        <div class="bill-total">
            <span class="total-label">Monthly Total:</span>
            <span class="total-amount">₹${total.toFixed(2)}</span>
        </div>
    `;
    
    billsList.innerHTML = html;
}

window.removeBill = function(billId) {
    window._savingsTrackerBills = window._savingsTrackerBills.filter(bill => bill.id !== billId);
    updateBillsList();
    console.log("🗑️ Bill removed. Remaining:", window._savingsTrackerBills.length);
};

// ========== COMPLETE ONBOARDING ==========
window.completeOnboarding = async function() {
    console.log("🎉🎉🎉 COMPLETE ONBOARDING CALLED! 🎉🎉🎉");
    
    // ========== CRITICAL: VERIFY BILLS BEFORE SAVING ==========
    console.log("=== BILLS VERIFICATION ===");
    console.log("1. window._savingsTrackerBills:", window._savingsTrackerBills);
    console.log("2. Length:", window._savingsTrackerBills.length);
    console.log("3. Is array?", Array.isArray(window._savingsTrackerBills));
    
    // Create a SAFE COPY of bills
    const billsToSave = window._savingsTrackerBills.map(bill => ({
        ...bill,
        amount: Number(bill.amount) // Ensure it's a number
    }));
    
    console.log("4. Bills to save (copied):", billsToSave);
    console.log("5. Bills count:", billsToSave.length);
    
    // ========== GET USER ==========
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
            alert("Please login again.");
            window.location.href = 'index.html';
            return;
        }
        
        const user = session.user;
        console.log("✅ User:", user.email, "ID:", user.id);
        
        // ========== VALIDATE DATA ==========
        const currentBalanceInput = document.getElementById('currentBalance');
        const currentBalance = parseFloat(currentBalanceInput?.value) || 0;
        
        if (currentBalance <= 0) {
            alert("Please enter your current balance first.");
            window.goToStep(1);
            return;
        }
        
        const yesButton = document.querySelector('.option-card[onclick*="yes"]');
        const noButton = document.querySelector('.option-card[onclick*="no"]');
        
        let hasMonthlyIncome = false;
        let monthlyIncome = 0;
        
        if (yesButton && yesButton.classList.contains('selected')) {
            hasMonthlyIncome = true;
            const incomeInput = document.getElementById('monthlyIncome');
            monthlyIncome = parseFloat(incomeInput?.value) || 0;
            
            if (monthlyIncome <= 0) {
                alert("Please enter your monthly income amount.");
                window.goToStep(2);
                return;
            }
        } else if (noButton && noButton.classList.contains('selected')) {
            hasMonthlyIncome = false;
            monthlyIncome = 0;
        } else {
            alert("Please select income option.");
            window.goToStep(2);
            return;
        }
        
        // ========== CALCULATE TOTALS ==========
        const totalBills = billsToSave.reduce((sum, bill) => sum + bill.amount, 0);
        
        console.log("=== FINAL DATA ===");
        console.log("Balance:", currentBalance);
        console.log("Income:", monthlyIncome);
        console.log("Bills count:", billsToSave.length);
        console.log("Bills total:", totalBills);
        console.log("Bills array:", billsToSave);
        
        // ========== CREATE DATA OBJECT ==========
        const data = {
            setupComplete: true,
            currentBalance: currentBalance,
            hasMonthlyIncome: hasMonthlyIncome,
            monthlyIncome: monthlyIncome,
            monthlyBills: billsToSave, // <<< USING OUR SAFE COPY
            totalMonthlyBills: totalBills,
            netMonthly: monthlyIncome - totalBills,
            createdAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            userId: user.id,
            userEmail: user.email
        };
        
        // ========== SAVE TO LOCALSTORAGE ==========
        const storageKey = `savingsTrackerData_${user.id}`;
        console.log("💾 Saving to:", storageKey);
        
        localStorage.setItem(storageKey, JSON.stringify(data));
        
        // ========== VERIFY SAVE ==========
        const savedData = localStorage.getItem(storageKey);
        const parsedData = savedData ? JSON.parse(savedData) : null;
        
        if (parsedData) {
            console.log("✅ SAVE VERIFICATION:");
            console.log("  Bills saved:", parsedData.monthlyBills?.length || 0);
            console.log("  First bill:", parsedData.monthlyBills?.[0]);
            console.log("  Total bills:", parsedData.totalMonthlyBills);
            
            if (parsedData.monthlyBills?.length > 0) {
                console.log("  All saved bills:");
                parsedData.monthlyBills.forEach((bill, i) => {
                    console.log(`    ${i+1}. ${bill.name}: ₹${bill.amount}`);
                });
            }
        }
        
        // ========== SHOW SUCCESS ==========
        const overlay = document.createElement('div');
        overlay.innerHTML = `
            <div style="
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0, 0, 0, 0.95);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            ">
                <div style="
                    background: #0f172a;
                    padding: 40px;
                    border-radius: 15px;
                    text-align: center;
                    max-width: 450px;
                    border: 2px solid #00ff9d;
                ">
                    <div style="font-size: 48px; margin-bottom: 20px;">🎉</div>
                    <h2 style="color: white; margin-bottom: 10px;">Setup Complete!</h2>
                    
                    <div style="
                        background: rgba(0, 255, 157, 0.1);
                        padding: 15px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        text-align: left;
                    ">
                        <p style="color: white; margin: 5px 0;">
                            <span style="color: #94a3b8;">Balance:</span> ₹${currentBalance.toFixed(2)}
                        </p>
                        <p style="color: white; margin: 5px 0;">
                            <span style="color: #94a3b8;">Income:</span> ₹${monthlyIncome.toFixed(2)}
                        </p>
                        <p style="color: white; margin: 5px 0;">
                            <span style="color: #94a3b8;">Bills:</span> ${billsToSave.length} bills (₹${totalBills.toFixed(2)})
                        </p>
                        
                        ${billsToSave.length > 0 ? `
                            <div style="margin-top: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 5px;">
                                <p style="color: #94a3b8; font-size: 12px; margin: 3px 0;">Your bills saved:</p>
                                ${billsToSave.map(bill => `
                                    <p style="color: white; font-size: 12px; margin: 2px 0;">
                                        • ${bill.name}: <strong style="color: #ef4444;">₹${bill.amount.toFixed(2)}</strong>
                                    </p>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                    
                    <p style="color: #00ff9d; font-weight: 600; margin-top: 20px;">
                        Redirecting to dashboard...
                    </p>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // ========== REDIRECT ==========
        setTimeout(() => {
            console.log("🔀 Redirecting to dashboard...");
            window.location.href = 'dashboard.html';
        }, 3500);
        
    } catch (error) {
        console.error("❌ Error:", error);
        alert("Error saving data. Please try again.");
    }
};

// ========== INITIALIZE ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log("✅ onboarding.js loaded");
    console.log("Initial bills:", window._savingsTrackerBills.length);
    
    window.goToStep(1);
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            if (window.currentStep === 1) {
                document.querySelector('#step1 .next-btn')?.click();
            } else if (window.currentStep === 2) {
                document.querySelector('#step2 .next-btn')?.click();
            } else if (window.currentStep === 3) {
                document.querySelector('#step3 .finish-btn')?.click();
            }
        }
        
        if (e.key === 'ArrowRight' && window.currentStep < 3) {
            window.goToStep(window.currentStep + 1);
        }
        if (e.key === 'ArrowLeft' && window.currentStep > 1) {
            window.goToStep(window.currentStep - 1);
        }
    });
});
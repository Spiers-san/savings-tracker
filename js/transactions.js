// transactions.js - Handle income/expense transactions

class TransactionManager {
    constructor() {
        this.transactions = this.loadTransactions();
    }
    
    // Get current user's storage key
    getStorageKey() {
        const userId = window.currentUser?.id || localStorage.getItem('currentUserId');
        return `savingsTransactions_${userId}`;
    }
    
    // Load transactions from localStorage
    loadTransactions() {
        const key = this.getStorageKey();
        const data = localStorage.getItem(key);
        
        if (data) {
            try {
                return JSON.parse(data);
            } catch (error) {
                console.error('Error loading transactions:', error);
                return [];
            }
        }
        return [];
    }
    
    // Save transactions to localStorage
    saveTransactions() {
        const key = this.getStorageKey();
        localStorage.setItem(key, JSON.stringify(this.transactions));
        console.log('💾 Transactions saved:', this.transactions.length);
    }
    
    // Add a new transaction
    addTransaction(transaction) {
        const newTransaction = {
            id: Date.now(),
            type: transaction.type, // 'income' or 'expense'
            category: transaction.category,
            amount: parseFloat(transaction.amount),
            description: transaction.description || '',
            date: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };
        
        this.transactions.unshift(newTransaction); // Add to beginning
        this.saveTransactions();
        
        // Update current balance in main data
        this.updateBalance(newTransaction);
        
        return newTransaction;
    }
    
    // Update main balance based on transaction
    updateBalance(transaction) {
        const userId = window.currentUser?.id || localStorage.getItem('currentUserId');
        const key = `savingsTrackerData_${userId}`;
        const data = JSON.parse(localStorage.getItem(key)) || {};
        
        if (transaction.type === 'income') {
            data.currentBalance = (data.currentBalance || 0) + transaction.amount;
        } else if (transaction.type === 'expense') {
            data.currentBalance = (data.currentBalance || 0) - transaction.amount;
        }
        
        data.lastUpdated = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(data));
        
        // Refresh dashboard display
        if (window.loadUserData) {
            window.loadUserData(window.currentUser);
        }
    }
    
    // Get recent transactions (limit optional)
    getRecentTransactions(limit = 10) {
        return this.transactions.slice(0, limit);
    }
    
    // Get total income/expense for current month
    getMonthlySummary() {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const monthTransactions = this.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && 
                   date.getFullYear() === currentYear;
        });
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const expenses = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
            
        return { income, expenses, transactions: monthTransactions.length };
    }
    
    // Get transactions by category
    getCategorySummary() {
        const categories = {};
        
        this.transactions.forEach(transaction => {
            if (!categories[transaction.category]) {
                categories[transaction.category] = {
                    income: 0,
                    expense: 0,
                    count: 0
                };
            }
            
            if (transaction.type === 'income') {
                categories[transaction.category].income += transaction.amount;
            } else {
                categories[transaction.category].expense += transaction.amount;
            }
            
            categories[transaction.category].count++;
        });
        
        return categories;
    }
}

// Initialize globally
window.TransactionManager = TransactionManager;
window.transactionManager = new TransactionManager();
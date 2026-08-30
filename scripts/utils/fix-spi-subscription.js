const fs = require('fs');
const file = 'i:/DIGIBIZ-SYSTEM/public/clients/spi_holdings/index.html';
let content = fs.readFileSync(file, 'utf8');

// Find the duplicate block from 7010 to 7107 and remove it
const badBlock = `            // GRN Records
        function validateOrder(order) {
            if (!order.shopId) { showToast('Shop is required'); return false; }
            if (!order.repId) { showToast('Rep is required'); return false; }
            if (!order.items || order.items.length === 0) { showToast('At least one item is required'); return false; }
            if (order.total <= 0) { showToast('Order total must be greater than 0'); return false; }
            return true;
        }

        function validateProduct(product) {
            if (!product.name || product.name.trim() === '') { showToast('Product name is required'); return false; }
            if (product.price <= 0) { showToast('Price must be greater than 0'); return false; }
            if (product.cost <= 0) { showToast('Cost must be greater than 0'); return false; }
            if (product.stock < 0) { showToast('Stock cannot be negative'); return false; }
            return true;
        }

        // ================================================================
        //  DATA STORE
        // ================================================================

        const STORAGE_KEY = 'spi_holdings_distributor_data';

        let data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
            // Orders
            orders: [],
            pendingOrders: [],

            // Products
            products: [
                { id: 'p1', name: 'Rice 1kg', brand: 'CIC', category: 'Groceries', price: 180, stock: 50, minStock: 10 },
                { id: 'p2', name: 'Coconut Oil 400ml', brand: 'Raththi', category: 'Groceries', price: 450, stock: 30, minStock: 5 },
                { id: 'p3', name: 'Tea 100g', brand: 'Watawala', category: 'Beverages', price: 320, stock: 40, minStock: 8 },
                { id: 'p4', name: 'Sugar 1kg', brand: 'Lanka Sugar', category: 'Groceries', price: 195, stock: 60, minStock: 15 },
                { id: 'p5', name: 'Toothpaste 120g', brand: 'Signal', category: 'Household', price: 210, stock: 25, minStock: 5 }
            ],

            // Shops
            shops: [
                { id: 's1', name: 'Perera Supermarket', owner: 'Mr. Perera', phone: '0771234567', address: 'Kandy', repId: '' },
                { id: 's2', name: 'Silva Grocery', owner: 'Mrs. Silva', phone: '0777654321', address: 'Colombo', repId: '' }
            ],

            // Reps
            reps: [
                { id: 'r1', name: 'Kasun Fernando', email: 'kasun@rep.com', phone: '0712345678', isActive: true, commissionRate: 5 },
                { id: 'r2', name: 'Nuwan Pradeep', email: 'nuwan@rep.com', phone: '0787654321', isActive: true, commissionRate: 4 }
            ],

            // Free Issues
            freeIssues: [],

            // Returns
            returns: [],

            // Cheques
            cheques: [],

            // Credit Aging
            creditAging: [],

            // Commission
            commissions: [],

            // Revenue
            revenue: [],

            // Expenses
            expenses: [],

            // Journal Entries
            journalEntries: [],

            // Supplier Ledger
            supplierLedger: [],

            // GRN Records
            grnRecords: [],

            // Staff Salary Configs
            staffSalaryConfigs: {},

            // Settings
            settings: {
                storeName: 'SPI Holdings',
                businessName: 'SPI Holdings',
                ownerName: 'Nadun De Alwis',
                phone: '',
                email: 'nadundealwis@gmail.com',
                address: '',
                currency: 'LKR',
                timezone: 'Asia/Colombo',
                invoicePrefix: 'SPI-INV-',
                receiptHeader: 'SPI HOLDINGS DISTRIBUTORS',
                receiptFooter: 'Thank you for your business!'
            },

            // Subscription
            subscription: {
                plan: 'PRO',
                status: 'ACTIVE',
                startDate: '2026-08-29',
                expireDate: '2027-08-29',
                monthlyFee: 1500,
                smsBalance: 500,
                trialSmsBalance: 0,
                paidSmsBalance: 500,
                smsHeader: 'SPI'
            }`;

const cleanBlock = `            // GRN Records
            grnRecords: [],

            // Staff Salary Configs
            staffSalaryConfigs: {},

            // Settings
            settings: {
                storeName: 'SPI Holdings',
                businessName: 'SPI Holdings',
                ownerName: 'Nadun De Alwis',
                phone: '',
                email: 'nadundealwis@gmail.com',
                address: '',
                currency: 'LKR',
                timezone: 'Asia/Colombo',
                invoicePrefix: 'SPI-INV-',
                receiptHeader: 'SPI HOLDINGS DISTRIBUTORS',
                receiptFooter: 'Thank you for your business!'
            },

            // Subscription
            subscription: {
                plan: 'TRIAL',
                status: 'trial',
                startDate: '2026-08-29',
                expireDate: '2026-09-05',
                monthlyFee: 1000,
                smsBalance: 300,
                trialSmsBalance: 300,
                paidSmsBalance: 0,
                smsHeader: 'SPI'
            }`;

const isCRLF = content.includes('\r\n');
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedBad = badBlock.replace(/\r\n/g, '\n');
const normalizedClean = cleanBlock.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedBad)) {
    let replaced = normalizedContent.replace(normalizedBad, normalizedClean);
    if (isCRLF) replaced = replaced.replace(/\n/g, '\r\n');
    fs.writeFileSync(file, replaced, 'utf8');
    console.log('SUCCESS: Cleaned up spi_holdings subscription!');
} else {
    console.log('FAILED: Pattern not found in spi_holdings');
}

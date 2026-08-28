const fs = require('fs');
const file = 'i:/DIGIBIZ-SYSTEM/public/clients/sathityrecentre/index.html';
let content = fs.readFileSync(file, 'utf8');

const submitInvRegex = /function submitInventory\(\) \{[\s\S]*?closeModal\('inventoryModal'\);/m;
const submitInvNew = `function submitInventory() {
    var name = document.getElementById('invName').value.trim();
    var company = document.getElementById('invCompany')?.value.trim() || 'NM';
    var category = document.getElementById('invCategory').value;
    var cost = parseFloat(document.getElementById('invCost').value) || 0;
    var price = parseFloat(document.getElementById('invPrice').value) || 0;
    var discountPrice = parseFloat(document.getElementById('invDiscountPrice').value) || 0;
    var stock = parseInt(document.getElementById('invStock').value) || 0;
    var minStock = parseInt(document.getElementById('invMinStock').value) || 3;
    var warranty = parseInt(document.getElementById('invWarranty')?.value) || 12;
    var expiry = document.getElementById('invExpiry')?.value || null;

    if (!name || price <= 0) {
        showToast('Please fill item name and price');
        return;
    }

    if (discountPrice > 0 && discountPrice >= price) {
        showToast('⚠️ Discount price must be less than selling price!');
        return;
    }

    if (!expiry && warranty > 0) {
        var d = new Date();
        d.setMonth(d.getMonth() + warranty);
        expiry = d.toISOString().split('T')[0];
    }

    var itemId = 'i_' + Date.now();
    var totalValue = cost * stock;

    data.inventory.push({
        id: itemId,
        name: name,
        company: company,
        category: category,
        cost: cost,
        price: price,
        discountPrice: discountPrice || null,
        stock: stock,
        minStock: minStock,
        warranty: warranty,
        expiry: expiry
    });

    if (!data.journalEntries) data.journalEntries = [];
    if (totalValue > 0) {
        data.journalEntries.push({
            id: 'J-' + String((data.journalEntries || []).length + 1),
            date: new Date().toISOString().split('T')[0],
            desc: 'Inventory Addition: ' + name + ' (Qty: ' + stock + ')',
            debit: 'Inventory Asset (1201)',
            debitAmt: totalValue,
            credit: 'Cash in Drawer (1001)',
            creditAmt: totalValue
        });
    }

    closeModal('inventoryModal');
    
    document.getElementById('invName').value = '';
    document.getElementById('invCompany').value = '';
    document.getElementById('invCost').value = '';
    document.getElementById('invPrice').value = '';
    document.getElementById('invDiscountPrice').value = '0';
    document.getElementById('invStock').value = '10';
    document.getElementById('invMinStock').value = '3';
    document.getElementById('invExpiry').value = '';`;
content = content.replace(submitInvRegex, submitInvNew);

// Add the other functions at the very end of the <script> block, before // END JS
const addFunctionsStr = `
// New functions for Cheque, GRN Cheque, Expense Categories, Low Stock
data.cheques = data.cheques || [];
data.expenseCategories = data.expenseCategories || [
    { id: 'cat_shop', name: 'Shop Utility & Tea', icon: 'fa-mug-saucer', color: '#ff9900' },
    { id: 'cat_rent', name: 'Rent & Power', icon: 'fa-house', color: '#0066c0' },
    { id: 'cat_transport', name: 'Transport', icon: 'fa-truck', color: '#059669' },
    { id: 'cat_other', name: 'Other', icon: 'fa-ellipsis', color: '#64748b' }
];

function openChequeModal() {
    var total = (data.cart || []).reduce(function(s, c) { return s + c.price * c.qty; }, 0);
    document.getElementById('chequeAmount').value = total;
    document.getElementById('chequeDate').value = new Date().toISOString().split('T')[0];
    var exp = new Date();
    exp.setMonth(exp.getMonth() + 3);
    document.getElementById('chequeExpiry').value = exp.toISOString().split('T')[0];
    openModal('chequeModal');
}

function submitCheque() {
    var chequeNumber = document.getElementById('chequeNumber').value.trim();
    var bankName = document.getElementById('chequeBank').value;
    var chequeDate = document.getElementById('chequeDate').value;
    var expiryDate = document.getElementById('chequeExpiry').value;
    var amount = parseFloat(document.getElementById('chequeAmount').value) || 0;
    var paymentType = document.getElementById('chequePaymentType').value;
    var ref = document.getElementById('chequeRef').value.trim() || 'N/A';

    if (!chequeNumber) {
        showToast('Please enter cheque number');
        return;
    }
    if (amount <= 0) {
        showToast('Please enter a valid amount');
        return;
    }

    var existing = (data.cheques || []).find(function(c) {
        return c.chequeNumber === chequeNumber && c.bankName === bankName;
    });
    if (existing) {
        showToast('⚠️ Cheque #' + chequeNumber + ' already exists!');
        return;
    }

    var cheque = {
        id: 'CHQ-' + String((data.cheques || []).length + 1001),
        chequeNumber: chequeNumber,
        bankName: bankName,
        chequeDate: chequeDate || new Date().toISOString().split('T')[0],
        expiryDate: expiryDate || '',
        amount: amount,
        status: 'PENDING',
        reference: ref,
        customerName: document.getElementById('posCustomer')?.value || 'Walk-in',
        paymentType: paymentType,
        createdAt: new Date().toISOString()
    };

    if (!data.cheques) data.cheques = [];
    data.cheques.push(cheque);

    if (!data.journalEntries) data.journalEntries = [];
    data.journalEntries.push({
        id: 'J-' + String((data.journalEntries || []).length + 1),
        date: new Date().toISOString().split('T')[0],
        desc: 'Cheque ' + (paymentType === 'RECEIVED' ? 'Received' : 'Issued') + ': #' + chequeNumber + ' (' + bankName + ')',
        debit: paymentType === 'RECEIVED' ? 'Cheque Receivable (1101)' : 'Accounts Payable (2001)',
        debitAmt: amount,
        credit: paymentType === 'RECEIVED' ? 'Revenue (4001)' : 'Cheque Payable (2101)',
        creditAmt: amount
    });

    closeModal('chequeModal');
    document.getElementById('chequeNumber').value = '';
    document.getElementById('chequeRef').value = '';

    if (data.cart && data.cart.length > 0) {
        var customerName = document.getElementById('posCustomer')?.value || 'Walk-in';
        var total = data.cart.reduce(function(s, c) { return s + c.price * c.qty; }, 0);
        
        posTender = 'CHEQUE';
        document.getElementById('posTenderDisplay').textContent = 'CHEQUE';
        
        checkout();
        
        var lastBill = (data.posBills || []).slice(-1)[0];
        if (lastBill) {
            cheque.reference = 'Bill #' + lastBill.id;
            cheque.customerName = lastBill.customer || 'Walk-in';
        }
        saveData();
    }

    saveData();
    renderCheques();
    if (typeof renderAccounting === 'function') renderAccounting();
    updateBadges();
    showToast('✅ Cheque #' + chequeNumber + ' recorded successfully!');
}

function renderCheques() {
    var cheques = data.cheques || [];
    console.log('Total Cheques:', cheques.length);
}

function toggleGrnPaymentDetails() {
    var status = document.getElementById('grnPaymentStatus').value;
    var chequeGroup = document.getElementById('grnChequeGroup');
    var chequeDetails = document.getElementById('grnChequeDetails');
    
    if (status === 'CHEQUE') {
        chequeGroup.style.display = 'block';
        chequeDetails.style.display = 'flex';
    } else {
        chequeGroup.style.display = 'none';
        chequeDetails.style.display = 'none';
    }
}

function checkLowStockAlerts() {
    var lowItems = (data.inventory || []).filter(function(item) {
        return item.stock <= (item.minStock || 3);
    });
    
    if (lowItems.length > 0) {
        var msg = '⚠️ ' + lowItems.length + ' items are below minimum stock level: ';
        msg += lowItems.map(function(item) {
            return item.name + ' (' + item.stock + '/' + (item.minStock || 3) + ')';
        }).join(', ');
        showToast(msg);
    }
}

function renderExpenseCategories() {
    var container = document.getElementById('categoryList');
    if (!container) return;
    
    var categories = data.expenseCategories || [];
    if (categories.length === 0) {
        container.innerHTML = '<div style="text-align:center; color:#999; padding:20px 0;">No categories created yet.</div>';
        return;
    }
    
    container.innerHTML = categories.map(function(cat) {
        return '<div style="display:flex; justify-content:space-between; align-items:center; padding:8px 12px; border-bottom:1px solid #f0f2f5; border-left:4px solid ' + (cat.color || '#64748b') + ';">' +
            '<div style="display:flex; align-items:center; gap:10px;">' +
                '<i class="fas ' + (cat.icon || 'fa-tag') + '" style="color:' + (cat.color || '#64748b') + ';"></i>' +
                '<span style="font-weight:600;">' + cat.name + '</span>' +
                '<span style="font-size:10px; color:#888;">(' + (data.expenses || []).filter(function(e) { return e.category === cat.name; }).length + ' expenses)</span>' +
            '</div>' +
            '<div style="display:flex; gap:4px;">' +
                '<button class="btn btn-secondary btn-sm" onclick="editExpenseCategory(\\'' + cat.id + '\\')" style="color:#0066c0;"><i class="fas fa-pen"></i></button>' +
                '<button class="btn btn-secondary btn-sm" onclick="deleteExpenseCategory(\\'' + cat.id + '\\')" style="color:#dc2626;"><i class="fas fa-trash"></i></button>' +
            '</div>' +
        '</div>';
    }).join('');
}

function addExpenseCategory() {
    var name = document.getElementById('newCategoryName').value.trim();
    var color = document.getElementById('newCategoryColor').value;
    
    if (!name) {
        showToast('Please enter a category name');
        return;
    }
    
    var existing = (data.expenseCategories || []).find(function(c) {
        return c.name.toLowerCase() === name.toLowerCase();
    });
    if (existing) {
        showToast('⚠️ Category "' + name + '" already exists!');
        return;
    }
    
    if (!data.expenseCategories) data.expenseCategories = [];
    data.expenseCategories.push({
        id: 'cat_' + Date.now(),
        name: name,
        icon: 'fa-tag',
        color: color || '#64748b'
    });
    
    document.getElementById('newCategoryName').value = '';
    saveData();
    renderExpenseCategories();
    populateExpenseCategoryDropdown();
    showToast('✅ Category "' + name + '" added!');
}

function deleteExpenseCategory(id) {
    var category = (data.expenseCategories || []).find(function(c) { return c.id === id; });
    if (!category) return;
    
    var inUse = (data.expenses || []).some(function(e) { return e.category === category.name; });
    if (inUse) {
        if (!confirm('⚠️ Category "' + category.name + '" is used in ' + 
            (data.expenses || []).filter(function(e) { return e.category === category.name; }).length + 
            ' expenses. Delete anyway? Expenses will be marked as "Other".')) {
            return;
        }
        (data.expenses || []).forEach(function(e) {
            if (e.category === category.name) e.category = 'Other';
        });
    } else {
        if (!confirm('Delete category "' + category.name + '"?')) return;
    }
    
    data.expenseCategories = (data.expenseCategories || []).filter(function(c) { return c.id !== id; });
    saveData();
    renderExpenseCategories();
    populateExpenseCategoryDropdown();
    showToast('✅ Category "' + category.name + '" deleted!');
}

function editExpenseCategory(id) {
    var category = (data.expenseCategories || []).find(function(c) { return c.id === id; });
    if (!category) return;
    
    var newName = prompt('Edit category name:', category.name);
    if (newName && newName.trim() !== '') {
        var newNameTrim = newName.trim();
        var existing = (data.expenseCategories || []).find(function(c) {
            return c.name.toLowerCase() === newNameTrim.toLowerCase() && c.id !== id;
        });
        if (existing) {
            showToast('⚠️ Category "' + newNameTrim + '" already exists!');
            return;
        }
        
        (data.expenses || []).forEach(function(e) {
            if (e.category === category.name) e.category = newNameTrim;
        });
        
        category.name = newNameTrim;
        saveData();
        renderExpenseCategories();
        populateExpenseCategoryDropdown();
        showToast('✅ Category renamed to "' + newNameTrim + '"!');
    }
}

function populateExpenseCategoryDropdown() {
    var selects = document.querySelectorAll('.expense-category-select');
    var categories = data.expenseCategories || [];
    var options = categories.map(function(c) {
        return '<option value="' + c.name + '">' + c.name + '</option>';
    }).join('') + '<option value="Other">Other</option>';
    
    selects.forEach(function(select) {
        var currentVal = select.value;
        select.innerHTML = options;
        if (currentVal) select.value = currentVal;
    });
}

const originalOpenModal = openModal;
openModal = function(id) {
    originalOpenModal(id);
    if (id === 'expenseCategoryModal') {
        renderExpenseCategories();
    }
};

const originalRenderExpenses = typeof renderExpenses !== 'undefined' ? renderExpenses : function(){};
renderExpenses = function() {
    originalRenderExpenses();
    populateExpenseCategoryDropdown();
};

const originalLoadData = window.onload;
window.onload = function(e) {
    if (originalLoadData) originalLoadData(e);
    populateExpenseCategoryDropdown();
    checkLowStockAlerts();
};

// GRN Update
`;
content = content.replace('// END JS', addFunctionsStr + '\n// END JS');

// Patch submitGRN logic to add cheque logic before saveData
const submitGRNRegex = /(data\.grnRecords\.push\(grnRecord\);)/;
const submitGRNNew = `$1

        // Cheque logic
        var chequeNumber = document.getElementById('grnChequeNumber')?.value.trim();
        var chequeBank = document.getElementById('grnChequeBank')?.value;
        var chequeDate = document.getElementById('grnChequeDate')?.value;
        
        if (paymentStatus === 'CHEQUE') {
            if (!chequeNumber) {
                showToast('Please enter cheque number for cheque payment');
                // We won't block the GRN completely, but warn them
            } else {
                var existingCheque = (data.cheques || []).find(function(c) {
                    return c.chequeNumber === chequeNumber && c.bankName === chequeBank;
                });
                if (existingCheque) {
                    showToast('⚠️ Cheque #' + chequeNumber + ' already recorded! Please use a different cheque.');
                } else {
                    var chequeData = {
                        id: 'CHQ-' + String((data.cheques || []).length + 1001),
                        chequeNumber: chequeNumber,
                        bankName: chequeBank,
                        chequeDate: chequeDate || new Date().toISOString().split('T')[0],
                        expiryDate: '',
                        amount: total,
                        status: 'PENDING',
                        reference: 'GRN #' + grnId + ' - ' + supplier.name,
                        customerName: supplier.name,
                        paymentType: 'ISSUED',
                        grnId: grnId,
                        supplierId: supplierId,
                        createdAt: new Date().toISOString()
                    };
                    
                    if (!data.cheques) data.cheques = [];
                    data.cheques.push(chequeData);
                    
                    data.journalEntries.push({
                        id: 'J-' + String((data.journalEntries || []).length + 1),
                        date: new Date().toISOString().split('T')[0],
                        desc: 'Supplier Cheque Payment: #' + chequeNumber + ' (' + chequeBank + ') for GRN ' + grnId,
                        debit: 'Accounts Payable - ' + supplier.name + ' (2001)',
                        debitAmt: total,
                        credit: 'Cheque Payable (2101)',
                        creditAmt: total
                    });
                    
                    showToast('✅ Cheque #' + chequeNumber + ' recorded for GRN ' + grnId);
                }
            }
        }`;
content = content.replace(submitGRNRegex, submitGRNNew);

fs.writeFileSync(file, content, 'utf8');

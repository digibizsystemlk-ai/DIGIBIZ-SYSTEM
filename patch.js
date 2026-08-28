const fs = require('fs');
const file = 'i:/DIGIBIZ-SYSTEM/public/clients/sathityrecentre/index.html';
let content = fs.readFileSync(file, 'utf8');

// 1. POS Payment Buttons
content = content.replace(
`<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:6px;">
                                <button class="btn btn-secondary btn-sm" onclick="setTender('CASH')"><i class="fas fa-money-bill"></i> CASH</button>
                                <button class="btn btn-secondary btn-sm" onclick="setTender('CARD')"><i class="fas fa-credit-card"></i> CARD</button>
                                <button class="btn btn-secondary btn-sm" onclick="setTender('BANK')"><i class="fas fa-building-columns"></i> BANK</button>
                                <button class="btn btn-secondary btn-sm" onclick="setTender('CREDIT')"><i class="fas fa-user-clock"></i> CREDIT</button>
                            </div>`,
`<div style="display:grid; grid-template-columns:repeat(5,1fr); gap:6px;">
                                <button class="btn btn-secondary btn-sm" onclick="setTender('CASH')"><i class="fas fa-money-bill"></i> CASH</button>
                                <button class="btn btn-secondary btn-sm" onclick="setTender('CARD')"><i class="fas fa-credit-card"></i> CARD</button>
                                <button class="btn btn-secondary btn-sm" onclick="setTender('BANK')"><i class="fas fa-building-columns"></i> BANK</button>
                                <button class="btn btn-secondary btn-sm" onclick="setTender('CREDIT')"><i class="fas fa-user-clock"></i> CREDIT</button>
                                <button class="btn btn-secondary btn-sm" onclick="openChequeModal()" style="background:#7c3aed; color:#fff; border-color:#7c3aed;">
                                    <i class="fas fa-money-check"></i> CHEQUE
                                </button>
                            </div>`
);

// 2. Add Cheque Modal and Expense Category Modal before <!-- Settings Modal --> or similar. Let's find a safe modal anchor.
const chequeModalStr = `<!-- Cheque Details Modal -->
<div class="modal-overlay" id="chequeModal">
    <div class="modal" style="max-width:450px;">
        <div class="modal-header">
            <h3><i class="fas fa-money-check" style="color:#7c3aed;"></i> Cheque Details</h3>
            <button class="modal-close" onclick="closeModal('chequeModal')">&times;</button>
        </div>
        <div class="modal-body">
            <div class="form-group">
                <label>Cheque Number *</label>
                <input type="text" class="form-control" id="chequeNumber" placeholder="e.g. 123456">
            </div>
            <div class="form-group">
                <label>Bank Name *</label>
                <select class="form-control" id="chequeBank">
                    <option value="Commercial Bank">Commercial Bank</option>
                    <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                    <option value="People's Bank">People's Bank</option>
                    <option value="Sampath Bank" selected>Sampath Bank</option>
                    <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                    <option value="Seylan Bank">Seylan Bank</option>
                    <option value="Other Bank">Other Bank</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Cheque Date</label>
                    <input type="date" class="form-control" id="chequeDate">
                </div>
                <div class="form-group">
                    <label>Expiry Date</label>
                    <input type="date" class="form-control" id="chequeExpiry">
                </div>
            </div>
            <div class="form-group">
                <label>Amount (LKR) *</label>
                <input type="number" class="form-control" id="chequeAmount" placeholder="0.00">
            </div>
            <div class="form-group">
                <label>Payment Type</label>
                <select class="form-control" id="chequePaymentType">
                    <option value="RECEIVED">Received (Customer Payment)</option>
                    <option value="ISSUED">Issued (Supplier Payment)</option>
                </select>
            </div>
            <div class="form-group">
                <label>Reference / Description</label>
                <input type="text" class="form-control" id="chequeRef" placeholder="e.g. Invoice #POS-1001">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal('chequeModal')">Cancel</button>
            <button class="btn btn-primary" onclick="submitCheque()" style="background:#7c3aed; border-color:#7c3aed;">
                <i class="fas fa-check"></i> Save Cheque
            </button>
        </div>
    </div>
</div>

<!-- Expense Category Management Modal -->
<div class="modal-overlay" id="expenseCategoryModal">
    <div class="modal" style="max-width:550px;">
        <div class="modal-header">
            <h3><i class="fas fa-tags" style="color:#ff9900;"></i> Manage Expense Categories</h3>
            <button class="modal-close" onclick="closeModal('expenseCategoryModal')">&times;</button>
        </div>
        <div class="modal-body">
            <div style="display:flex; gap:8px; margin-bottom:12px;">
                <input type="text" class="form-control" id="newCategoryName" placeholder="New category name..." style="flex:1;">
                <input type="color" class="form-control" id="newCategoryColor" value="#ff9900" style="max-width:50px; padding:2px;">
                <button class="btn btn-primary" onclick="addExpenseCategory()"><i class="fas fa-plus"></i> Add</button>
            </div>
            <div id="categoryList" style="max-height:300px; overflow-y:auto;">
                <!-- Categories will be rendered here -->
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal('expenseCategoryModal')">Close</button>
        </div>
    </div>
</div>
`;
content = content.replace('<!-- Toast Notification -->', chequeModalStr + '\n<!-- Toast Notification -->');

// 3. GRN Modal Payment Status update
content = content.replace(
`<select class="form-control" id="grnPaymentStatus">
                            <option value="PAID">Paid</option>
                            <option value="CREDIT" selected>Credit (Due)</option>
                            <option value="PARTIAL">Partial</option>
                        </select>`,
`<select class="form-control" id="grnPaymentStatus" onchange="toggleGrnPaymentDetails()">
                            <option value="PAID">Paid</option>
                            <option value="CHEQUE">Cheque Payment</option>
                            <option value="CREDIT" selected>Credit (Due)</option>
                            <option value="PARTIAL">Partial</option>
                        </select>
                    </div>
                    <div class="form-group" id="grnChequeGroup" style="display:none;">
                        <label>Cheque Number *</label>
                        <input type="text" class="form-control" id="grnChequeNumber" placeholder="e.g. 123456">
                    </div>
                </div>
                <div class="form-row" id="grnChequeDetails" style="display:none;">
                    <div class="form-group">
                        <label>Cheque Bank</label>
                        <select class="form-control" id="grnChequeBank">
                            <option value="Commercial Bank">Commercial Bank</option>
                            <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                            <option value="People's Bank">People's Bank</option>
                            <option value="Sampath Bank" selected>Sampath Bank</option>
                            <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                            <option value="Seylan Bank">Seylan Bank</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cheque Date</label>
                        <input type="date" class="form-control" id="grnChequeDate">
                    </div>
                </div>
                <div class="form-row" style="display:none;"> <!-- Hiding original closing div to compensate for the above layout adjustments if any, wait, better replace exactly -->`
);

// Better logic for GRN Payment Status:
// find exact match for:
const grnOld = `<div class="form-group">
                        <label>Payment Status</label>
                        <select class="form-control" id="grnPaymentStatus">
                            <option value="PAID">Paid</option>
                            <option value="CREDIT" selected>Credit (Due)</option>
                            <option value="PARTIAL">Partial</option>
                        </select>
                    </div>`;
const grnNew = `<div class="form-group">
                        <label>Payment Status</label>
                        <select class="form-control" id="grnPaymentStatus" onchange="toggleGrnPaymentDetails()">
                            <option value="PAID">Paid (Cash/Bank)</option>
                            <option value="CHEQUE">Cheque Payment</option>
                            <option value="CREDIT" selected>Credit (Due)</option>
                            <option value="PARTIAL">Partial</option>
                        </select>
                    </div>
                    <div class="form-group" id="grnChequeGroup" style="display:none;">
                        <label>Cheque Number *</label>
                        <input type="text" class="form-control" id="grnChequeNumber" placeholder="e.g. 123456">
                    </div>
                </div>
                <div class="form-row" id="grnChequeDetails" style="display:none;">
                    <div class="form-group">
                        <label>Cheque Bank</label>
                        <select class="form-control" id="grnChequeBank">
                            <option value="Commercial Bank">Commercial Bank</option>
                            <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                            <option value="People's Bank">People's Bank</option>
                            <option value="Sampath Bank" selected>Sampath Bank</option>
                            <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                            <option value="Seylan Bank">Seylan Bank</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Cheque Date</label>
                        <input type="date" class="form-control" id="grnChequeDate">
                    </div>`;
content = content.replace(grnOld, grnNew);

fs.writeFileSync('i:/DIGIBIZ-SYSTEM/patch1.js_log.txt', 'Done first parts', 'utf8');
fs.writeFileSync(file, content, 'utf8');

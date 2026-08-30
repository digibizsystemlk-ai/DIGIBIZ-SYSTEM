/**
 * DIGIBIZ SYSTEM — Master Distributor POS & GRN Studio Engine
 * 
 * Features:
 *   1. Anti-Flicker Instant Auth Gate (Zero Flash on Refresh)
 *   2. Today's Orders Live Register under #page-new-order
 *   3. World-Class Enterprise POS & Order Studio with isolated CSS
 *   4. World-Class GRN / Purchases Module
 * 
 * Target Clients:
 *   - public/clients/delightbakers/index.html
 *   - public/clients/spi_holdings/index.html
 */

const fs = require('fs');
const path = require('path');
const { backupClientIndex } = require('./backup-client-index');

const ROOT_DIR = path.resolve(__dirname, '..');

const CLIENTS = [
    {
        clientId: 'delightbakers',
        businessName: 'Delight Bakers',
        tagline: 'Distributor Management Platform',
        ownerName: 'T.A.S.P Deshapriya',
        phone: '0771234567',
        email: 'delightkukule@gmail.com',
        address: 'Kandy Road, Sri Lanka',
        invoicePrefix: 'DB-INV-',
        orderPrefix: 'DB-SO-',
        grnPrefix: 'DB-GRN-',
        receiptHeader: 'DELIGHT BAKERS DISTRIBUTORS',
        authStorageKey: 'delightbakers_distributor_data_auth_active'
    },
    {
        clientId: 'spi_holdings',
        businessName: 'SPI Holdings',
        tagline: 'Distributor Management Platform',
        ownerName: 'S.P.I. Management',
        phone: '0777654321',
        email: 'info@spiholdings.lk',
        address: 'Colombo Road, Sri Lanka',
        invoicePrefix: 'SPI-INV-',
        orderPrefix: 'SPI-SO-',
        grnPrefix: 'SPI-GRN-',
        receiptHeader: 'SPI HOLDINGS DISTRIBUTORS',
        authStorageKey: 'spi_holdings_distributor_data_auth_active'
    }
];

function getMasterCSS() {
    return `
        /* ================================================================ */
        /*  WORLD-CLASS ENTERPRISE POS & ORDER STUDIO CSS (ISOLATED/ROBUST) */
        /* ================================================================ */

        /* Form Group & Input Primitives */
        .pos-field-group,
        .form-group {
            display: flex !important;
            flex-direction: column !important;
            margin-bottom: 12px !important;
            width: 100% !important;
            box-sizing: border-box !important;
        }

        .pos-field-label,
        .form-group label {
            display: block !important;
            font-size: 11.5px !important;
            font-weight: 700 !important;
            color: #334155 !important;
            margin-bottom: 5px !important;
            text-transform: uppercase !important;
            letter-spacing: 0.4px !important;
        }

        .pos-input,
        .pos-select,
        .pos-textarea,
        .form-control {
            width: 100% !important;
            height: 40px !important;
            padding: 8px 12px !important;
            border: 1.5px solid #cbd5e1 !important;
            border-radius: 8px !important;
            font-size: 13.5px !important;
            font-family: inherit !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            outline: none !important;
            box-sizing: border-box !important;
            transition: all 0.2s ease !important;
            display: block !important;
        }

        .pos-textarea,
        textarea.form-control {
            height: auto !important;
            min-height: 65px !important;
            resize: vertical !important;
        }

        .pos-input:focus,
        .pos-select:focus,
        .pos-textarea:focus,
        .form-control:focus {
            border-color: #ff9900 !important;
            box-shadow: 0 0 0 3px rgba(255, 153, 0, 0.25) !important;
            background-color: #fff !important;
        }

        /* 2-Column POS Studio Grid */
        .pos-studio-layout {
            display: grid !important;
            grid-template-columns: 1fr 380px !important;
            gap: 18px !important;
            align-items: start !important;
            margin-top: 10px !important;
        }
        @media (max-width: 1120px) {
            .pos-studio-layout { grid-template-columns: 1fr !important; }
        }

        /* Studio Cards */
        .pos-card {
            background: #ffffff !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 12px !important;
            padding: 18px 20px !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
            margin-bottom: 16px !important;
        }

        .pos-card-header {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            margin-bottom: 14px !important;
            padding-bottom: 10px !important;
            border-bottom: 1px solid #f1f5f9 !important;
        }

        .pos-card-header h3 {
            font-size: 15px !important;
            font-weight: 800 !important;
            color: #0f172a !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            gap: 8px !important;
        }

        /* Multi-Column Form Grid */
        .pos-row-3 {
            display: grid !important;
            grid-template-columns: 1.5fr 1fr 1fr !important;
            gap: 12px !important;
            width: 100% !important;
        }
        @media (max-width: 768px) {
            .pos-row-3 { grid-template-columns: 1fr !important; }
        }

        .pos-row-4 {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1.2fr 1.2fr !important;
            gap: 12px !important;
            width: 100% !important;
        }
        @media (max-width: 768px) {
            .pos-row-4 { grid-template-columns: 1fr 1fr !important; }
        }

        /* Shop Intelligence Dossier Card */
        .shop-intel-dossier {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%) !important;
            border-radius: 12px !important;
            padding: 16px 20px !important;
            color: #ffffff !important;
            margin-top: 14px !important;
            border: 1px solid #334155 !important;
            box-shadow: 0 4px 16px rgba(15, 23, 42, 0.25) !important;
            display: none;
            animation: fadeIn 0.25s ease !important;
        }

        .shop-intel-top {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 8px !important;
        }

        .shop-intel-grid {
            display: grid !important;
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 12px !important;
            margin-top: 12px !important;
            padding-top: 12px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
        }
        @media (max-width: 768px) {
            .shop-intel-grid { grid-template-columns: 1fr 1fr !important; }
        }

        .shop-intel-kpi {
            display: flex !important;
            flex-direction: column !important;
            gap: 2px !important;
        }

        .shop-intel-kpi .k-lbl {
            font-size: 10px !important;
            text-transform: uppercase !important;
            font-weight: 700 !important;
            color: #94a3b8 !important;
            letter-spacing: 0.5px !important;
        }

        .shop-intel-kpi .k-val {
            font-size: 16px !important;
            font-weight: 900 !important;
            color: #f8fafc !important;
        }

        .shop-credit-gauge-bg {
            width: 100% !important;
            height: 8px !important;
            background: rgba(255, 255, 255, 0.15) !important;
            border-radius: 6px !important;
            overflow: hidden !important;
            margin-top: 10px !important;
        }

        .shop-credit-gauge-fill {
            height: 100% !important;
            border-radius: 6px !important;
            transition: width 0.3s ease, background 0.3s ease !important;
        }

        /* Rapid Scanner & Product Entry Hub */
        .pos-scanner-box {
            background: #ffffff !important;
            border: 2px solid #e2e8f0 !important;
            border-left: 5px solid #ff9900 !important;
            border-radius: 12px !important;
            padding: 16px 18px !important;
            margin-bottom: 16px !important;
            position: relative !important;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03) !important;
        }

        .pos-scanner-inputs-grid {
            display: grid !important;
            grid-template-columns: 2.5fr 1fr 0.9fr 0.9fr 0.9fr auto !important;
            gap: 10px !important;
            align-items: end !important;
        }
        @media (max-width: 900px) {
            .pos-scanner-inputs-grid { grid-template-columns: 1fr 1fr !important; }
        }

        .pos-search-dropdown-menu {
            position: absolute !important;
            top: 100% !important;
            left: 0 !important;
            right: 0 !important;
            background: #ffffff !important;
            border: 1.5px solid #cbd5e1 !important;
            border-radius: 10px !important;
            max-height: 280px !important;
            overflow-y: auto !important;
            z-index: 1000 !important;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15) !important;
            display: none;
            margin-top: 6px !important;
        }

        .pos-search-dropdown-item {
            padding: 10px 14px !important;
            border-bottom: 1px solid #f1f5f9 !important;
            cursor: pointer !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            transition: background 0.15s !important;
        }
        .pos-search-dropdown-item:hover {
            background: #fff7ed !important;
        }

        /* Order Table */
        .pos-cart-table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 13px !important;
        }
        .pos-cart-table th {
            background: #f8fafc !important;
            color: #475569 !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
            padding: 12px 14px !important;
            border-bottom: 2px solid #e2e8f0 !important;
        }
        .pos-cart-table td {
            padding: 12px 14px !important;
            vertical-align: middle !important;
            border-bottom: 1px solid #f1f5f9 !important;
        }

        /* Stepper */
        .pos-qty-stepper {
            display: inline-flex !important;
            align-items: center !important;
            border: 1.5px solid #cbd5e1 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            background: #fff !important;
        }
        .pos-stepper-btn {
            background: #f1f5f9 !important;
            border: none !important;
            width: 32px !important;
            height: 32px !important;
            font-size: 14px !important;
            font-weight: 900 !important;
            cursor: pointer !important;
            color: #1e293b !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            transition: all 0.15s !important;
        }
        .pos-stepper-btn:hover {
            background: #ff9900 !important;
            color: #131921 !important;
        }
        .pos-stepper-input {
            width: 48px !important;
            height: 32px !important;
            border: none !important;
            text-align: center !important;
            font-size: 13.5px !important;
            font-weight: 900 !important;
            outline: none !important;
            color: #0f172a !important;
            padding: 0 !important;
            background: #fff !important;
        }

        /* Right Billing Summary Panel */
        .pos-checkout-card {
            background: #ffffff !important;
            border-radius: 14px !important;
            border: 1px solid #d5d9d9 !important;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.06) !important;
            overflow: hidden !important;
            position: sticky !important;
            top: 76px !important;
        }

        .pos-checkout-header {
            background: #131921 !important;
            color: #ffffff !important;
            padding: 14px 18px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
        }

        .pos-checkout-body {
            padding: 18px !important;
        }

        .pos-calc-row {
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 7px 0 !important;
            font-size: 13px !important;
            color: #475569 !important;
        }

        .pos-grand-total-banner {
            background: linear-gradient(135deg, #067d62, #055a46) !important;
            color: #ffffff !important;
            padding: 16px !important;
            border-radius: 12px !important;
            margin: 14px 0 !important;
            text-align: center !important;
            box-shadow: 0 4px 14px rgba(6, 125, 98, 0.35) !important;
        }
        .pos-grand-total-banner .lbl {
            font-size: 11px !important;
            font-weight: 800 !important;
            letter-spacing: 0.8px !important;
            text-transform: uppercase !important;
            opacity: 0.9 !important;
        }
        .pos-grand-total-banner .amt {
            font-size: 28px !important;
            font-weight: 900 !important;
            letter-spacing: -0.5px !important;
            margin-top: 2px !important;
        }

        /* Visual Catalog Browser Modal */
        .catalog-pill-filter {
            display: flex !important;
            gap: 8px !important;
            overflow-x: auto !important;
            padding-bottom: 6px !important;
            margin-bottom: 12px !important;
        }
        .catalog-pill {
            padding: 6px 14px !important;
            background: #f1f5f9 !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 20px !important;
            font-size: 12px !important;
            font-weight: 700 !important;
            color: #475569 !important;
            cursor: pointer !important;
            white-space: nowrap !important;
            transition: all 0.2s !important;
        }
        .catalog-pill.active, .catalog-pill:hover {
            background: #ff9900 !important;
            border-color: #ff9900 !important;
            color: #131921 !important;
        }
        .catalog-grid {
            display: grid !important;
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)) !important;
            gap: 12px !important;
            max-height: 480px !important;
            overflow-y: auto !important;
            padding: 4px !important;
        }
        .catalog-card {
            background: #fff !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 10px !important;
            padding: 12px !important;
            cursor: pointer !important;
            transition: all 0.2s !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
        }
        .catalog-card:hover {
            border-color: #ff9900 !important;
            transform: translateY(-2px) !important;
            box-shadow: 0 4px 12px rgba(255, 153, 0, 0.15) !important;
        }

        /* GRN Studio Modal Styles */
        .grn-studio-modal {
            max-width: 980px !important;
            width: 96% !important;
        }
        .grn-table-wrap {
            max-height: 320px !important;
            overflow-y: auto !important;
            border: 1px solid #e2e8f0 !important;
            border-radius: 8px !important;
            margin-bottom: 14px !important;
        }
        .grn-table {
            width: 100% !important;
            border-collapse: collapse !important;
        }
        .grn-table th {
            position: sticky !important;
            top: 0 !important;
            background: #0f172a !important;
            color: #fff !important;
            z-index: 5 !important;
            font-size: 11px !important;
            padding: 8px 10px !important;
        }
        .grn-table td {
            padding: 6px 8px !important;
            vertical-align: middle !important;
            border-bottom: 1px solid #f1f5f9 !important;
        }
    `;
}

function getRedesignedNewOrderHTML(config) {
    return `
        <!-- ============================================================ -->
        <!--  1. NEW SALES ORDER PAGE (WORLD-CLASS ENTERPRISE POS STUDIO) -->
        <!-- ============================================================ -->
        <div class="page" id="page-new-order">
            <!-- Top Header & Action Suite -->
            <div class="page-header">
                <div>
                    <h1>New Sales Order <span class="sub">| Enterprise Order Studio</span></h1>
                </div>
                <div class="actions">
                    <button class="btn btn-secondary" onclick="openCatalogModal()"><i class="fas fa-layer-group"></i> Visual Catalog</button>
                    <button class="btn btn-secondary" onclick="saveOrderDraft()"><i class="fas fa-save"></i> Save Draft</button>
                    <button class="btn btn-secondary" onclick="clearNewOrder()"><i class="fas fa-trash"></i> Reset</button>
                    <button class="btn btn-primary" onclick="submitNewOrder('THERMAL')"><i class="fas fa-print"></i> Submit & Print Slip</button>
                    <button class="btn btn-success" onclick="submitNewOrder('INVOICE')"><i class="fas fa-file-invoice"></i> Submit & A4 Invoice</button>
                </div>
            </div>

            <!-- Quick Alert / Overlimit Warning Area -->
            <div id="orderCreditAlertBanner" style="display:none; margin-bottom:14px; background:#fef2f2; border:1px solid #fecaca; border-radius:10px; padding:12px 16px; color:#991b1b; align-items:center; justify-content:space-between;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <i class="fas fa-triangle-exclamation" style="font-size:20px; color:#dc2626;"></i>
                    <div>
                        <strong id="orderCreditAlertTitle">Credit Limit Warning</strong>
                        <div id="orderCreditAlertMsg" style="font-size:12px; color:#7f1d1d;">This shop will exceed its allowed credit limit.</div>
                    </div>
                </div>
                <span class="badge badge-rejected" id="orderCreditAlertBadge">OVERLIMIT</span>
            </div>

            <!-- Main Order Builder Grid -->
            <div class="pos-studio-layout">
                <!-- Left: Inputs, Shop Intelligence, Product Entry, Items Grid -->
                <div>
                    <!-- 1. Customer Dossier & Order Parameters Card -->
                    <div class="pos-card">
                        <div class="pos-card-header">
                            <h3><i class="fas fa-store" style="color:#ff9900;"></i> Customer & Order Parameters</h3>
                            <button class="btn btn-secondary btn-sm" onclick="openNewShopQuickModal()"><i class="fas fa-plus"></i> Add New Shop</button>
                        </div>
                        
                        <!-- Row 1: Shop, Rep, Order Type -->
                        <div class="pos-row-3">
                            <div class="pos-field-group">
                                <label class="pos-field-label">Shop / Customer *</label>
                                <select id="orderShop" class="pos-select" onchange="onShopSelectionChanged(this.value)">
                                    <option value="">-- Select Shop / Store --</option>
                                </select>
                            </div>
                            <div class="pos-field-group">
                                <label class="pos-field-label">Sales Rep *</label>
                                <select id="orderRep" class="pos-select">
                                    <option value="">-- Select Rep --</option>
                                </select>
                            </div>
                            <div class="pos-field-group">
                                <label class="pos-field-label">Order Type</label>
                                <select id="orderType" class="pos-select">
                                    <option value="VAN_SALE">Van Sale (Direct Delivery)</option>
                                    <option value="PRE_ORDER">Pre-Order / Booking</option>
                                    <option value="EXPRESS">Urgent Express</option>
                                    <option value="SAMPLE">Sample / Promotion</option>
                                </select>
                            </div>
                        </div>

                        <!-- Live Shop Insight Dossier -->
                        <div class="shop-intel-dossier" id="shopDossierCard">
                            <div class="shop-intel-top">
                                <div>
                                    <span style="font-size:16px; font-weight:900; color:#fff;" id="dossierShopName">Shop Name</span>
                                    <span style="font-size:12px; color:#94a3b8; margin-left:8px;" id="dossierOwnerName">Owner</span>
                                </div>
                                <div style="display:flex; gap:6px;">
                                    <a id="dossierPhoneLink" href="#" class="btn btn-secondary btn-sm" style="background:#1e293b; color:#fff; border-color:#475569;"><i class="fas fa-phone"></i> Call</a>
                                    <a id="dossierWhatsAppLink" href="#" target="_blank" class="btn btn-success btn-sm"><i class="fab fa-whatsapp"></i> WhatsApp</a>
                                </div>
                            </div>

                            <div class="shop-intel-grid">
                                <div class="shop-intel-kpi">
                                    <span class="k-lbl">Outstanding Due</span>
                                    <span class="k-val" id="dossierBalance" style="color:#f87171;">LKR 0.00</span>
                                </div>
                                <div class="shop-intel-kpi">
                                    <span class="k-lbl">Credit Limit</span>
                                    <span class="k-val" id="dossierCreditLimit">LKR 50,000.00</span>
                                </div>
                                <div class="shop-intel-kpi">
                                    <span class="k-lbl">Available Credit</span>
                                    <span class="k-val" id="dossierAvailableCredit" style="color:#4ade80;">LKR 50,000.00</span>
                                </div>
                                <div class="shop-intel-kpi">
                                    <span class="k-lbl">Route / Town</span>
                                    <span class="k-val" id="dossierRoute" style="font-size:13px;">General</span>
                                </div>
                            </div>

                            <!-- Credit Meter -->
                            <div class="shop-credit-gauge-bg">
                                <div class="shop-credit-gauge-fill" id="dossierCreditBar" style="width:0%; background:#22c55e;"></div>
                            </div>
                        </div>

                        <!-- Row 2: Date and Payment Terms Strip -->
                        <div class="pos-row-4" style="margin-top:10px;">
                            <div class="pos-field-group">
                                <label class="pos-field-label">Order Date</label>
                                <input type="date" id="orderDate" class="pos-input">
                            </div>
                            <div class="pos-field-group">
                                <label class="pos-field-label">Delivery Date</label>
                                <input type="date" id="orderDeliveryDate" class="pos-input">
                            </div>
                            <div class="pos-field-group">
                                <label class="pos-field-label">Price Tier</label>
                                <select id="orderPriceTier" class="pos-select">
                                    <option value="WHOLESALE">Wholesale Standard</option>
                                    <option value="DISTRIBUTOR_BULK">Distributor Bulk (5% Off)</option>
                                    <option value="SPECIAL">Special Contract</option>
                                </select>
                            </div>
                            <div class="pos-field-group">
                                <label class="pos-field-label">Payment Terms</label>
                                <select id="orderPayment" class="pos-select" onchange="onPaymentMethodChange(this.value)">
                                    <option value="CASH">Cash on Delivery</option>
                                    <option value="CREDIT_7">Credit (7 Days)</option>
                                    <option value="CREDIT_14">Credit (14 Days)</option>
                                    <option value="CREDIT_21">Credit (21 Days)</option>
                                    <option value="CREDIT_30">Credit (30 Days)</option>
                                    <option value="CREDIT_60">Credit (60 Days)</option>
                                    <option value="CHEQUE">Cheque Payment</option>
                                    <option value="BANK_TRANSFER">Bank Direct Transfer</option>
                                </select>
                            </div>
                        </div>

                        <!-- Cheque Details Section (Conditional) -->
                        <div id="chequeDetailsSection" style="display:none; margin-top:12px; padding:14px; background:#f8fafc; border-radius:8px; border:1px solid #cbd5e1;">
                            <div class="pos-row-4">
                                <div class="pos-field-group">
                                    <label class="pos-field-label">Cheque Number *</label>
                                    <input type="text" id="orderChequeNumber" class="pos-input" placeholder="e.g. 849201">
                                </div>
                                <div class="pos-field-group">
                                    <label class="pos-field-label">Bank & Branch</label>
                                    <input type="text" id="orderChequeBank" class="pos-input" placeholder="e.g. Commercial Bank">
                                </div>
                                <div class="pos-field-group">
                                    <label class="pos-field-label">Cheque Date</label>
                                    <input type="date" id="orderChequeDate" class="pos-input">
                                </div>
                                <div class="pos-field-group">
                                    <label class="pos-field-label">Due Date</label>
                                    <input type="date" id="orderChequeDueDate" class="pos-input">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Rapid Multi-Mode Product Entry Strip -->
                    <div class="pos-scanner-box">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                            <span style="font-size:13px; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:6px;">
                                <i class="fas fa-bolt" style="color:#ff9900;"></i> Rapid Product Entry & Barcode Scanner
                            </span>
                            <span style="font-size:11px; color:#64748b;">Press <kbd style="background:#e2e8f0; padding:2px 6px; border-radius:4px; font-weight:bold;">Enter</kbd> to add item</span>
                        </div>

                        <div class="pos-scanner-inputs-grid">
                            <div class="pos-field-group" style="position:relative; margin-bottom:0;">
                                <label class="pos-field-label">Search / Scan SKU *</label>
                                <input type="text" id="productSearchInput" class="pos-input" placeholder="Scan Barcode or Type Product..." oninput="onProductSearchKeyInput(this.value)" onkeydown="onProductSearchKeyDown(event)" autocomplete="off">
                                <div id="productSearchFloatingResults" class="pos-search-dropdown-menu"></div>
                            </div>

                            <div class="pos-field-group" style="margin-bottom:0;">
                                <label class="pos-field-label">Unit Price</label>
                                <input type="number" id="activeLinePrice" class="pos-input" placeholder="LKR" step="0.01">
                            </div>

                            <div class="pos-field-group" style="margin-bottom:0;">
                                <label class="pos-field-label">Qty</label>
                                <input type="number" id="activeLineQty" class="pos-input" value="1" min="1">
                            </div>

                            <div class="pos-field-group" style="margin-bottom:0;">
                                <label class="pos-field-label">Free Qty</label>
                                <input type="number" id="activeLineFreeQty" class="pos-input" value="0" min="0">
                            </div>

                            <div class="pos-field-group" style="margin-bottom:0;">
                                <label class="pos-field-label">Disc (%)</label>
                                <input type="number" id="activeLineDiscount" class="pos-input" value="0" min="0" max="100">
                            </div>

                            <div class="pos-field-group" style="margin-bottom:0;">
                                <button class="btn btn-primary" onclick="addActiveProductToCart()" style="height:40px; padding:0 18px; font-weight:800; border-radius:8px;">
                                    <i class="fas fa-plus"></i> Add
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 3. Dynamic Order Items Table -->
                    <div class="pos-card" style="padding:0; overflow:hidden;">
                        <div style="padding:14px 18px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                            <h3 style="font-size:14px; font-weight:800; color:#0f172a; margin:0; display:flex; align-items:center; gap:8px;">
                                <i class="fas fa-shopping-basket" style="color:#ff9900;"></i> Ordered Line Items 
                                <span id="cartItemBadgeCount" class="badge badge-secondary" style="font-size:11px;">0 SKUs</span>
                            </h3>
                            <button class="btn btn-secondary btn-sm" onclick="clearNewOrder()" style="color:#dc2626;"><i class="fas fa-trash"></i> Empty Table</button>
                        </div>

                        <div class="table-wrap">
                            <table class="pos-cart-table">
                                <thead>
                                    <tr>
                                        <th style="width:30px;">#</th>
                                        <th>Product / SKU</th>
                                        <th class="text-right" style="width:110px;">Unit Price</th>
                                        <th class="text-center" style="width:140px;">Quantity</th>
                                        <th class="text-center" style="width:90px;">Bonus / Free</th>
                                        <th class="text-right" style="width:90px;">Disc (%)</th>
                                        <th class="text-right" style="width:130px;">Line Total</th>
                                        <th class="text-center" style="width:50px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="cartTableBody">
                                    <tr>
                                        <td colspan="8" style="text-align:center; padding:36px; color:#94a3b8;">
                                            <i class="fas fa-cart-arrow-down" style="font-size:32px; display:block; margin-bottom:8px; color:#cbd5e1;"></i>
                                            Scan barcode or select products to build order
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- 4. Empty Crates / Returns Deduction Strip -->
                    <div class="pos-card" style="margin-top:14px;">
                        <div class="pos-card-header" style="margin-bottom:8px;">
                            <h3 style="font-size:13.5px;"><i class="fas fa-undo" style="color:#3b82f6;"></i> Returns & Empty Crates Deduction (Optional)</h3>
                            <button class="btn btn-secondary btn-sm" onclick="addReturnDeductionLine()"><i class="fas fa-plus"></i> Add Return Item</button>
                        </div>
                        <div id="orderReturnsContainer" style="display:none; padding-top:8px;">
                            <table style="width:100%; font-size:12px;">
                                <thead>
                                    <tr style="border-bottom:1px solid #e2e8f0; color:#64748b;">
                                        <th>Item Description / Crate Type</th>
                                        <th style="width:100px;">Qty</th>
                                        <th style="width:130px;" class="text-right">Unit Credit</th>
                                        <th style="width:130px;" class="text-right">Deduction Total</th>
                                        <th style="width:40px;"></th>
                                    </tr>
                                </thead>
                                <tbody id="orderReturnsTableBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Right: Real-time Calculation Panel & Order Action Suite -->
                <div>
                    <div class="pos-checkout-card">
                        <div class="pos-checkout-header">
                            <span style="font-weight:900; font-size:15px;"><i class="fas fa-calculator" style="color:#ff9900;"></i> Bill Breakdown</span>
                            <span style="font-size:11px; opacity:0.8;" id="posOrderRefId">REF: NEW</span>
                        </div>

                        <div class="pos-checkout-body">
                            <div class="pos-calc-row">
                                <span>Gross Items Subtotal:</span>
                                <strong id="posGrossSubtotal">LKR 0.00</strong>
                            </div>
                            <div class="pos-calc-row">
                                <span>Line Discounts:</span>
                                <span id="posLineDiscounts" style="color:#dc2626;">- LKR 0.00</span>
                            </div>
                            <div class="pos-calc-row">
                                <span>Special Order Discount:</span>
                                <div style="display:flex; align-items:center; gap:4px; max-width:130px;">
                                    <input type="number" id="posOrderSpecialDiscount" class="pos-input" style="height:32px; padding:4px 8px; font-size:12px; text-align:right;" value="0" min="0" oninput="renderCartSummary()">
                                    <span style="font-size:11px; color:#64748b;">LKR</span>
                                </div>
                            </div>
                            <div class="pos-calc-row">
                                <span>Free Issues Value:</span>
                                <span id="posFreeIssuesValue" style="color:#0284c7;">0 pcs (LKR 0.00)</span>
                            </div>
                            <div class="pos-calc-row" id="posReturnsRow" style="display:none;">
                                <span>Returns / Crates Credit:</span>
                                <span id="posReturnsDeduction" style="color:#dc2626;">- LKR 0.00</span>
                            </div>

                            <!-- Net Total Highlight -->
                            <div class="pos-grand-total-banner">
                                <div class="lbl">NET PAYABLE AMOUNT</div>
                                <div class="amt" id="posNetTotal">LKR 0.00</div>
                            </div>

                            <!-- Cash Paid & Balance Return Section -->
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:12px;">
                                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                                    <label style="font-size:11.5px; font-weight:700; color:#334155; margin:0;">Amount Paid / Tendered:</label>
                                    <input type="number" id="posCashTendered" class="pos-input" style="width:130px; height:34px; padding:4px 8px; font-size:13px; font-weight:800; text-align:right;" placeholder="0.00" oninput="calculatePosChange()">
                                </div>
                                <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:800; color:#0f172a; padding-top:6px; border-top:1px dashed #cbd5e1;">
                                    <span id="posChangeLabel">Balance Due (Credit):</span>
                                    <span id="posChangeValue" style="color:#dc2626;">LKR 0.00</span>
                                </div>
                            </div>

                            <!-- Order Notes -->
                            <div class="pos-field-group" style="margin-bottom:14px;">
                                <label class="pos-field-label">Delivery Notes / Remarks</label>
                                <textarea id="orderNotes" class="pos-textarea" placeholder="e.g. Leave with store manager, urgent morning drop..."></textarea>
                            </div>

                            <!-- Primary Action Buttons -->
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                <button class="btn btn-success" style="width:100%; padding:12px; font-size:14px; font-weight:800; justify-content:center; border-radius:8px;" onclick="submitNewOrder('INVOICE')">
                                    <i class="fas fa-check-circle"></i> Submit Order & Generate Invoice
                                </button>
                                
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                                    <button class="btn btn-primary" style="justify-content:center; font-size:12px; padding:9px; border-radius:8px;" onclick="submitNewOrder('THERMAL')">
                                        <i class="fas fa-print"></i> Thermal Slip
                                    </button>
                                    <button class="btn btn-secondary" style="justify-content:center; font-size:12px; padding:9px; background:#25D366; color:#fff; border-color:#25D366; border-radius:8px;" onclick="submitAndShareWhatsApp()">
                                        <i class="fab fa-whatsapp"></i> WhatsApp
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================ -->
            <!--  TODAY'S SALES ORDERS REGISTER (LIVE REAL-TIME FEED)         -->
            <!-- ============================================================ -->
            <div class="pos-card" style="margin-top:20px; padding:0; overflow:hidden;">
                <div style="padding:14px 18px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <div>
                        <h3 style="font-size:15px; font-weight:900; color:#0f172a; margin:0; display:flex; align-items:center; gap:8px;">
                            <i class="fas fa-calendar-day" style="color:#ff9900;"></i> Today's Sales Orders 
                            <span id="todayOrdersBadgeCount" class="badge badge-good" style="font-size:11px;">0 Orders</span>
                        </h3>
                    </div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <span id="todayOrdersTotalAmount" style="font-weight:900; font-size:14px; color:#067d62;">Today Total: LKR 0.00</span>
                        <button class="btn btn-secondary btn-sm" onclick="renderTodayOrders()"><i class="fas fa-sync"></i> Refresh</button>
                    </div>
                </div>
                <div class="table-wrap">
                    <table class="pos-cart-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Shop / Customer</th>
                                <th>Sales Rep</th>
                                <th class="text-center">Items & Units</th>
                                <th>Payment Mode</th>
                                <th class="text-right">Net Total</th>
                                <th class="text-center">Status</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="todayOrdersTableBody">
                            <tr>
                                <td colspan="8" style="text-align:center; padding:30px; color:#94a3b8;">No orders created today yet</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function getGRNHTML(config) {
    return `
        <!-- ============================================================ -->
        <!--  5. GRN / PURCHASES PAGE (GOODS RECEIVED NOTE STUDIO)        -->
        <!-- ============================================================ -->
        <div class="page" id="page-grn">
            <!-- Page Header -->
            <div class="page-header">
                <div>
                    <h1>GRN / Purchases <span class="sub">| Goods Received Note & Procurement</span></h1>
                </div>
                <div class="actions">
                    <button class="btn btn-primary" onclick="openGRNModal()"><i class="fas fa-plus-circle"></i> Create New GRN</button>
                    <button class="btn btn-secondary" onclick="openNewSupplierQuickModal()"><i class="fas fa-truck-field"></i> Add Supplier</button>
                    <button class="btn btn-secondary" onclick="renderGRN()"><i class="fas fa-sync"></i> Refresh</button>
                </div>
            </div>

            <!-- 4 Live KPI Cards -->
            <div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px;">
                <div class="dash-card" style="border-top:3px solid #ff9900; text-align:center; padding:12px;">
                    <div style="font-size:11px; font-weight:700; color:#64748b;">Month Purchases</div>
                    <div style="font-size:20px; font-weight:900; color:#ff9900;" id="grnMonthTotal">LKR 0.00</div>
                    <div style="font-size:10px; color:#94a3b8;" id="grnMonthCount">0 GRN Vouchers</div>
                </div>
                <div class="dash-card" style="border-top:3px solid #3b82f6; text-align:center; padding:12px;">
                    <div style="font-size:11px; font-weight:700; color:#64748b;">Items Received</div>
                    <div style="font-size:20px; font-weight:900; color:#3b82f6;" id="grnItemsReceived">0</div>
                    <div style="font-size:10px; color:#94a3b8;">Total Units Added to Stock</div>
                </div>
                <div class="dash-card" style="border-top:3px solid #dc2626; text-align:center; padding:12px;">
                    <div style="font-size:11px; font-weight:700; color:#64748b;">Supplier Payables (Due)</div>
                    <div style="font-size:20px; font-weight:900; color:#dc2626;" id="grnSupplierDue">LKR 0.00</div>
                    <div style="font-size:10px; color:#94a3b8;" id="grnSupplierCount">0 Active Suppliers</div>
                </div>
                <div class="dash-card" style="border-top:3px solid #067d62; text-align:center; padding:12px;">
                    <div style="font-size:11px; font-weight:700; color:#64748b;">Completed GRNs</div>
                    <div style="font-size:20px; font-weight:900; color:#067d62;" id="grnCompletedCount">0</div>
                    <div style="font-size:10px; color:#94a3b8;">Stock Verified & Approved</div>
                </div>
            </div>

            <!-- Search & Filters -->
            <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; align-items:center;">
                <input type="text" id="grnSearchFilter" placeholder="Search by GRN #, Supplier Name, Bill #, PO #..." class="pos-input" style="flex:1; min-width:240px;" oninput="renderGRN()">
                
                <select id="grnSupplierFilter" class="pos-select" style="width:auto; min-width:160px;" onchange="renderGRN()">
                    <option value="ALL">All Suppliers</option>
                </select>

                <select id="grnPaymentFilter" class="pos-select" style="width:auto; min-width:150px;" onchange="renderGRN()">
                    <option value="ALL">All Payment Statuses</option>
                    <option value="PAID">Paid in Full</option>
                    <option value="CREDIT">On Credit (Unpaid)</option>
                    <option value="PARTIAL">Partial Paid</option>
                </select>
            </div>

            <!-- GRN Records Table -->
            <div class="pos-card" style="padding:0; overflow:hidden;">
                <div style="padding:12px 18px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
                    <h3 style="font-size:14px; font-weight:800; color:#0f172a; margin:0;">
                        <i class="fas fa-file-invoice-dollar" style="color:#ff9900;"></i> Goods Received Note (GRN) Register
                    </h3>
                    <span id="grnTotalRecordsCount" style="font-size:12px; color:#64748b; font-weight:700;">0 records</span>
                </div>
                <div class="table-wrap">
                    <table class="pos-cart-table">
                        <thead>
                            <tr>
                                <th>GRN #</th>
                                <th>Supplier Name</th>
                                <th>Supplier Bill #</th>
                                <th>Receiving Date</th>
                                <th class="text-center">Items Received</th>
                                <th class="text-right">Total Purchase Cost</th>
                                <th>Payment Status</th>
                                <th class="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="grnTableBody">
                            <tr>
                                <td colspan="8" style="text-align:center; padding:40px; color:#94a3b8;">No GRN records registered</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function getEnterpriseModalsHTML() {
    return `
    <!-- ============================================================ -->
    <!--  ENTERPRISE MODALS: CATALOG, GRN STUDIO, QUICK ADD MODALS    -->
    <!-- ============================================================ -->

    <!-- 1. Visual Product Catalog Modal -->
    <div class="modal-overlay" id="catalogModal">
        <div class="modal" style="max-width:850px; width:95%;">
            <div class="modal-header">
                <h3><i class="fas fa-layer-group"></i> Visual Product Catalog</h3>
                <button class="modal-close" onclick="closeCatalogModal()">&times;</button>
            </div>
            <div class="modal-body" style="padding:16px;">
                <div style="display:flex; gap:10px; margin-bottom:12px;">
                    <input type="text" id="catalogSearchInput" class="pos-input" placeholder="Search catalog by name, brand, SKU..." oninput="renderCatalogModalGrid()">
                </div>
                <div class="catalog-pill-filter" id="catalogCategoryPills"></div>
                <div class="catalog-grid" id="catalogGridContainer"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeCatalogModal()">Done</button>
            </div>
        </div>
    </div>

    <!-- 2. Full Enterprise GRN Creation Studio Modal -->
    <div class="modal-overlay" id="grnStudioModal">
        <div class="modal grn-studio-modal">
            <div class="modal-header">
                <h3><i class="fas fa-truck-ramp-box"></i> Goods Received Note (GRN) Creation Studio</h3>
                <button class="modal-close" onclick="closeGRNModal()">&times;</button>
            </div>
            <div class="modal-body" style="padding:18px;">
                <!-- Supplier & Invoice Dossier -->
                <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:14px; margin-bottom:16px;">
                    <div class="pos-row-4" style="gap:10px;">
                        <div class="pos-field-group" style="margin-bottom:0;">
                            <label class="pos-field-label">Supplier / Vendor *</label>
                            <select id="grnModalSupplier" class="pos-select" onchange="onGRNSupplierChange(this.value)">
                                <option value="">-- Select Supplier --</option>
                            </select>
                        </div>
                        <div class="pos-field-group" style="margin-bottom:0;">
                            <label class="pos-field-label">Supplier Bill / Invoice # *</label>
                            <input type="text" id="grnModalBillNumber" class="pos-input" placeholder="e.g. INV-9842">
                        </div>
                        <div class="pos-field-group" style="margin-bottom:0;">
                            <label class="pos-field-label">PO Reference #</label>
                            <input type="text" id="grnModalPoRef" class="pos-input" placeholder="e.g. PO-2026-01">
                        </div>
                        <div class="pos-field-group" style="margin-bottom:0;">
                            <label class="pos-field-label">Receiving Date</label>
                            <input type="date" id="grnModalDate" class="pos-input">
                        </div>
                    </div>

                    <div class="pos-row-3" style="gap:10px; margin-top:10px;">
                        <div class="pos-field-group" style="margin-bottom:0;">
                            <label class="pos-field-label">Warehouse / Location</label>
                            <select id="grnModalLocation" class="pos-select">
                                <option value="MAIN_STORE">Main Warehouse / Central Store</option>
                                <option value="VAN_1">Distribution Van 01</option>
                                <option value="VAN_2">Distribution Van 02</option>
                                <option value="COLD_ROOM">Cold Storage Facility</option>
                            </select>
                        </div>
                        <div class="pos-field-group" style="margin-bottom:0;">
                            <label class="pos-field-label">Received & Inspected By</label>
                            <input type="text" id="grnModalReceiver" class="pos-input" placeholder="Store Manager Name">
                        </div>
                        <div class="pos-field-group" style="margin-bottom:0;">
                            <label class="pos-field-label">Supplier Phone / Balance</label>
                            <input type="text" id="grnModalSupplierBalance" class="pos-input" readonly style="background:#e2e8f0; font-weight:800;">
                        </div>
                    </div>
                </div>

                <!-- GRN Line Items Table -->
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:13px; font-weight:800; color:#0f172a;"><i class="fas fa-boxes-stacked" style="color:#ff9900;"></i> Received SKUs & Batch Details</span>
                    <button class="btn btn-secondary btn-sm" onclick="addGRNLineItemRow()"><i class="fas fa-plus"></i> Add Line Item</button>
                </div>

                <div class="grn-table-wrap">
                    <table class="grn-table">
                        <thead>
                            <tr>
                                <th style="min-width:180px;">Product</th>
                                <th style="width:110px;">Cost (LKR)</th>
                                <th style="width:80px;">Qty</th>
                                <th style="width:70px;">Bonus</th>
                                <th style="width:110px;">Batch #</th>
                                <th style="width:110px;">Expiry Date</th>
                                <th style="width:120px;">Selling Price</th>
                                <th style="width:110px;" class="text-right">Line Total</th>
                                <th style="width:40px;"></th>
                            </tr>
                        </thead>
                        <tbody id="grnLineItemsTableBody"></tbody>
                    </table>
                </div>

                <!-- Financial Summary & Payment Breakdown -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:14px;">
                    <div>
                        <div class="pos-field-group">
                            <label class="pos-field-label">Payment Terms</label>
                            <select id="grnModalPaymentMode" class="pos-select" onchange="onGRNPaymentModeChange(this.value)">
                                <option value="PAID_CASH">Paid in Full (Cash)</option>
                                <option value="PAID_CHEQUE">Paid in Full (Cheque)</option>
                                <option value="PAID_BANK">Paid in Full (Bank Transfer)</option>
                                <option value="CREDIT">Supplier Credit (Payable Later)</option>
                                <option value="PARTIAL">Partial Payment</option>
                            </select>
                        </div>
                        <div class="pos-row-2" id="grnPartialPaymentRow" style="display:none; grid-template-columns:1fr 1fr; gap:10px;">
                            <div class="pos-field-group">
                                <label class="pos-field-label">Paid Now (LKR)</label>
                                <input type="number" id="grnModalCashPaid" class="pos-input" value="0" oninput="calculateGRNTotals()">
                            </div>
                            <div class="pos-field-group">
                                <label class="pos-field-label">Due Date</label>
                                <input type="date" id="grnModalDueDate" class="pos-input">
                            </div>
                        </div>
                        <div class="pos-field-group" style="margin-bottom:0;">
                            <label class="pos-field-label">GRN Remarks / Notes</label>
                            <input type="text" id="grnModalNotes" class="pos-input" placeholder="e.g. All cartons inspected, quality perfect">
                        </div>
                    </div>

                    <div style="display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div class="pos-calc-row">
                                <span>Gross Purchases:</span>
                                <strong id="grnModalGrossTotal">LKR 0.00</strong>
                            </div>
                            <div class="pos-calc-row">
                                <span>Supplier Discount:</span>
                                <input type="number" id="grnModalDiscount" class="pos-input" style="width:100px; height:32px; padding:2px 6px; text-align:right; font-size:12px;" value="0" oninput="calculateGRNTotals()">
                            </div>
                            <div class="pos-calc-row">
                                <span>Freight / Handling:</span>
                                <input type="number" id="grnModalFreight" class="pos-input" style="width:100px; height:32px; padding:2px 6px; text-align:right; font-size:12px;" value="0" oninput="calculateGRNTotals()">
                            </div>
                        </div>
                        <div class="pos-grand-total-banner" style="margin:6px 0 0; padding:12px;">
                            <div class="lbl">NET GRN BILL AMOUNT</div>
                            <div class="amt" id="grnModalNetTotal" style="font-size:22px;">LKR 0.00</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeGRNModal()">Cancel</button>
                <button class="btn btn-success" onclick="saveGRNRecord()"><i class="fas fa-check"></i> Post GRN & Update Inventory</button>
            </div>
        </div>
    </div>

    <!-- 3. GRN Voucher View & Print Modal -->
    <div class="modal-overlay" id="grnVoucherViewModal">
        <div class="modal" style="max-width:700px; width:95%;">
            <div class="modal-header">
                <h3><i class="fas fa-file-invoice"></i> GRN Voucher Details</h3>
                <button class="modal-close" onclick="closeGRNVoucherModal()">&times;</button>
            </div>
            <div class="modal-body" id="grnVoucherViewContent" style="padding:16px;"></div>
            <div class="modal-footer">
                <button class="btn btn-primary" onclick="printCurrentGRNVoucher()"><i class="fas fa-print"></i> Print A4 Voucher</button>
                <button class="btn btn-secondary" onclick="closeGRNVoucherModal()">Close</button>
            </div>
        </div>
    </div>

    <!-- 4. Quick Add Shop Modal -->
    <div class="modal-overlay" id="quickAddShopModal">
        <div class="modal" style="max-width:440px;">
            <div class="modal-header">
                <h3><i class="fas fa-store"></i> Quick Add Shop</h3>
                <button class="modal-close" onclick="document.getElementById('quickAddShopModal').classList.remove('show')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="pos-field-group">
                    <label class="pos-field-label">Shop Name *</label>
                    <input type="text" id="quickShopName" class="pos-input" placeholder="e.g. Jayalath Stores">
                </div>
                <div class="pos-field-group">
                    <label class="pos-field-label">Owner Name</label>
                    <input type="text" id="quickShopOwner" class="pos-input" placeholder="e.g. Sunil Jayalath">
                </div>
                <div class="pos-field-group">
                    <label class="pos-field-label">Phone Number *</label>
                    <input type="text" id="quickShopPhone" class="pos-input" placeholder="0771234567">
                </div>
                <div class="pos-field-group">
                    <label class="pos-field-label">Address / Route</label>
                    <input type="text" id="quickShopAddress" class="pos-input" placeholder="Kandy Town Route">
                </div>
                <div class="pos-field-group">
                    <label class="pos-field-label">Credit Limit (LKR)</label>
                    <input type="number" id="quickShopCreditLimit" class="pos-input" value="50000">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="document.getElementById('quickAddShopModal').classList.remove('show')">Cancel</button>
                <button class="btn btn-success" onclick="saveQuickShop()">Save & Select Shop</button>
            </div>
        </div>
    </div>

    <!-- 5. Quick Add Supplier Modal -->
    <div class="modal-overlay" id="quickAddSupplierModal">
        <div class="modal" style="max-width:440px;">
            <div class="modal-header">
                <h3><i class="fas fa-truck-field"></i> Quick Add Supplier</h3>
                <button class="modal-close" onclick="document.getElementById('quickAddSupplierModal').classList.remove('show')">&times;</button>
            </div>
            <div class="modal-body">
                <div class="pos-field-group">
                    <label class="pos-field-label">Supplier / Company Name *</label>
                    <input type="text" id="quickSupplierName" class="pos-input" placeholder="e.g. Prima Ceylon Mills">
                </div>
                <div class="pos-field-group">
                    <label class="pos-field-label">Contact Person</label>
                    <input type="text" id="quickSupplierContact" class="pos-input" placeholder="e.g. Mr. Bandara">
                </div>
                <div class="pos-field-group">
                    <label class="pos-field-label">Phone Number *</label>
                    <input type="text" id="quickSupplierPhone" class="pos-input" placeholder="0112345678">
                </div>
                <div class="pos-field-group">
                    <label class="pos-field-label">Address</label>
                    <input type="text" id="quickSupplierAddress" class="pos-input" placeholder="Trincomalee / Colombo">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="document.getElementById('quickAddSupplierModal').classList.remove('show')">Cancel</button>
                <button class="btn btn-success" onclick="saveQuickSupplier()">Save Supplier</button>
            </div>
        </div>
    </div>
    `;
}

function getUpgradeJS(config) {
    const { businessName, phone, email, address, receiptHeader, invoicePrefix, orderPrefix, grnPrefix } = config;
    return `
        // ================================================================
        //  ENTERPRISE SALES ORDER, GRN & PROCUREMENT ENGINE
        // ================================================================

        let orderCart = [];
        let orderReturns = [];
        let activeSelectedProduct = null;
        let activeCatalogCategory = 'ALL';
        let currentViewingGRN = null;

        // Initialize / Render New Order Page
        function renderNewOrder() {
            // Populate shops dropdown
            const shopSelect = document.getElementById('orderShop');
            const currentShop = shopSelect.value;
            shopSelect.innerHTML = '<option value="">-- Select Shop / Customer --</option>';
            (data.shops || []).forEach(s => {
                shopSelect.innerHTML += \`<option value="\${s.id}">\${s.name} (\${s.owner || 'Store'})\</option>\`;
            });
            shopSelect.value = currentShop;

            // Populate reps dropdown
            const repSelect = document.getElementById('orderRep');
            const currentRep = repSelect.value;
            repSelect.innerHTML = '<option value="">-- Select Sales Rep --</option>';
            (data.reps || []).forEach(r => {
                repSelect.innerHTML += \`<option value="\${r.id}">\${r.name}\</option>\`;
            });
            repSelect.value = currentRep;

            // Dates & Reference ID
            if (!document.getElementById('orderDate').value) document.getElementById('orderDate').value = getToday();
            if (!document.getElementById('orderDeliveryDate').value) document.getElementById('orderDeliveryDate').value = getToday();
            document.getElementById('posOrderRefId').textContent = 'REF: ' + generateOrderRef();

            if (currentShop) {
                onShopSelectionChanged(currentShop);
            }

            renderCartTable();
            renderTodayOrders();
        }

        function generateOrderRef() {
            return '${orderPrefix}' + new Date().toISOString().slice(2,10).replace(/-/g,'') + '-' + Math.floor(1000 + Math.random() * 9000);
        }

        function onShopSelectionChanged(shopId) {
            const dossier = document.getElementById('shopDossierCard');
            const alertBanner = document.getElementById('orderCreditAlertBanner');

            if (!shopId) {
                dossier.style.display = 'none';
                alertBanner.style.display = 'none';
                return;
            }

            const shop = (data.shops || []).find(s => s.id === shopId);
            if (!shop) return;

            // Auto select assigned rep if set
            if (shop.assignedRepId) {
                document.getElementById('orderRep').value = shop.assignedRepId;
            }

            // Calculate outstanding balance
            const shopOrders = (data.orders || []).filter(o => o.shopId === shopId && o.paymentMethod === 'CREDIT' && o.status !== 'rejected');
            const totalOutstanding = shopOrders.reduce((sum, o) => sum + (o.balance || o.total || 0), 0);
            const creditLimit = Number(shop.creditLimit) || 50000;
            const availableCredit = Math.max(0, creditLimit - totalOutstanding);
            const creditUsagePercent = Math.min(100, Math.round((totalOutstanding / creditLimit) * 100));

            // Populate Dossier
            document.getElementById('dossierShopName').textContent = shop.name;
            document.getElementById('dossierOwnerName').textContent = shop.owner ? '• ' + shop.owner : '';
            document.getElementById('dossierBalance').textContent = 'LKR ' + totalOutstanding.toFixed(2);
            document.getElementById('dossierCreditLimit').textContent = 'LKR ' + creditLimit.toFixed(2);
            document.getElementById('dossierAvailableCredit').textContent = 'LKR ' + availableCredit.toFixed(2);
            document.getElementById('dossierRoute').textContent = shop.address || shop.route || 'Standard Route';

            const phone = shop.phone || '';
            const phoneLink = document.getElementById('dossierPhoneLink');
            const waLink = document.getElementById('dossierWhatsAppLink');
            if (phone) {
                phoneLink.href = 'tel:' + phone;
                phoneLink.style.display = 'inline-flex';
                waLink.href = 'https://api.whatsapp.com/send?phone=' + phone.replace(/[^0-9]/g, '');
                waLink.style.display = 'inline-flex';
            } else {
                phoneLink.style.display = 'none';
                waLink.style.display = 'none';
            }

            // Credit Bar Color
            const bar = document.getElementById('dossierCreditBar');
            bar.style.width = creditUsagePercent + '%';
            if (creditUsagePercent >= 90) {
                bar.style.background = '#ef4444';
            } else if (creditUsagePercent >= 70) {
                bar.style.background = '#f59e0b';
            } else {
                bar.style.background = '#22c55e';
            }

            dossier.style.display = 'block';

            // Check Overlimit
            checkOrderCreditLimit();
        }

        function checkOrderCreditLimit() {
            const shopId = document.getElementById('orderShop').value;
            const alertBanner = document.getElementById('orderCreditAlertBanner');
            if (!shopId) {
                alertBanner.style.display = 'none';
                return;
            }

            const shop = (data.shops || []).find(s => s.id === shopId);
            if (!shop) return;

            const shopOrders = (data.orders || []).filter(o => o.shopId === shopId && o.paymentMethod === 'CREDIT' && o.status !== 'rejected');
            const totalOutstanding = shopOrders.reduce((sum, o) => sum + (o.balance || o.total || 0), 0);
            const creditLimit = Number(shop.creditLimit) || 50000;
            const currentOrderNet = calculateNetOrderTotal();
            const paymentMethod = document.getElementById('orderPayment').value;

            if (paymentMethod.startsWith('CREDIT') && (totalOutstanding + currentOrderNet > creditLimit)) {
                const overAmt = (totalOutstanding + currentOrderNet) - creditLimit;
                document.getElementById('orderCreditAlertTitle').textContent = '⚠️ Credit Limit Warning: Limit Exceeded by LKR ' + overAmt.toFixed(2);
                document.getElementById('orderCreditAlertMsg').textContent = 'Shop current due (LKR ' + totalOutstanding.toFixed(2) + ') + this order (LKR ' + currentOrderNet.toFixed(2) + ') exceeds allowed limit of LKR ' + creditLimit.toFixed(2);
                alertBanner.style.display = 'flex';
            } else {
                alertBanner.style.display = 'none';
            }
        }

        // Live Product Search Dropdown & Keyboard scanning
        function onProductSearchKeyInput(query) {
            const resultsBox = document.getElementById('productSearchFloatingResults');
            if (!query || query.trim().length < 1) {
                resultsBox.style.display = 'none';
                return;
            }

            const q = query.toLowerCase().trim();
            const matches = (data.products || []).filter(p => 
                (p.name || '').toLowerCase().includes(q) ||
                (p.sku || p.barcode || '').toLowerCase().includes(q) ||
                (p.brand || '').toLowerCase().includes(q) ||
                (p.category || '').toLowerCase().includes(q)
            ).slice(0, 10);

            if (matches.length === 0) {
                resultsBox.innerHTML = '<div style="padding:12px; color:#94a3b8; text-align:center;">No matching products found</div>';
                resultsBox.style.display = 'block';
                return;
            }

            resultsBox.innerHTML = matches.map(p => {
                const stock = p.stock || 0;
                const stockBadge = stock <= 0 
                    ? '<span class="badge badge-rejected" style="font-size:10px;">Out of Stock</span>' 
                    : (stock <= 5 ? '<span class="badge badge-warning" style="font-size:10px;">Low: ' + stock + '</span>' : '<span class="badge badge-good" style="font-size:10px;">Stock: ' + stock + '</span>');
                
                return \`
                    <div class="pos-search-dropdown-item" onclick="selectProductForActiveLine('\${p.id}')">
                        <div>
                            <div style="font-weight:800; font-size:13px; color:#0f172a;">\${p.name}</div>
                            <div style="font-size:11px; color:#64748b;">SKU: \${p.sku || p.barcode || 'N/A'} • \${p.brand || 'Standard'} • \${p.category || 'General'}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-weight:900; color:#067d62;">LKR \${(p.price || 0).toFixed(2)}</div>
                            <div>\${stockBadge}</div>
                        </div>
                    </div>
                \`;
            }).join('');
            resultsBox.style.display = 'block';
        }

        function onProductSearchKeyDown(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = document.getElementById('productSearchInput').value.trim();
                if (!query) return;

                const exactMatch = (data.products || []).find(p => 
                    (p.sku && p.sku.toLowerCase() === query.toLowerCase()) || 
                    (p.barcode && p.barcode.toLowerCase() === query.toLowerCase()) ||
                    (p.name && p.name.toLowerCase() === query.toLowerCase())
                );

                if (exactMatch) {
                    selectProductForActiveLine(exactMatch.id);
                    addActiveProductToCart();
                } else {
                    const firstMatch = (data.products || []).find(p => (p.name || '').toLowerCase().includes(query.toLowerCase()));
                    if (firstMatch) {
                        selectProductForActiveLine(firstMatch.id);
                    }
                }
            }
        }

        function selectProductForActiveLine(productId) {
            const product = (data.products || []).find(p => p.id === productId);
            if (!product) return;

            activeSelectedProduct = product;
            document.getElementById('productSearchInput').value = product.name;
            document.getElementById('activeLinePrice').value = (product.price || 0).toFixed(2);
            document.getElementById('activeLineQty').value = 1;
            document.getElementById('activeLineFreeQty').value = calculatePromotionFreeQty(product, 1);
            document.getElementById('activeLineDiscount').value = 0;
            document.getElementById('productSearchFloatingResults').style.display = 'none';
        }

        function calculatePromotionFreeQty(product, qty) {
            if (product.promoRatio && product.promoRatio > 0) {
                return Math.floor(qty / product.promoRatio);
            }
            return 0;
        }

        function addActiveProductToCart() {
            if (!activeSelectedProduct) {
                const searchInput = document.getElementById('productSearchInput').value.trim();
                if (searchInput) {
                    const matched = (data.products || []).find(p => p.name.toLowerCase().includes(searchInput.toLowerCase()));
                    if (matched) activeSelectedProduct = matched;
                }
            }

            if (!activeSelectedProduct) {
                showToast('⚠️ Please search and select a product first');
                return;
            }

            const qty = parseInt(document.getElementById('activeLineQty').value) || 1;
            const price = parseFloat(document.getElementById('activeLinePrice').value) || (activeSelectedProduct.price || 0);
            const freeQty = parseInt(document.getElementById('activeLineFreeQty').value) || 0;
            const discountPct = parseFloat(document.getElementById('activeLineDiscount').value) || 0;

            if (qty <= 0) {
                showToast('⚠️ Quantity must be greater than 0');
                return;
            }

            const existingIndex = orderCart.findIndex(item => item.productId === activeSelectedProduct.id);
            if (existingIndex !== -1) {
                orderCart[existingIndex].qty += qty;
                orderCart[existingIndex].freeQty += freeQty;
                orderCart[existingIndex].price = price;
                orderCart[existingIndex].discount = discountPct;
            } else {
                orderCart.push({
                    productId: activeSelectedProduct.id,
                    name: activeSelectedProduct.name,
                    sku: activeSelectedProduct.sku || activeSelectedProduct.barcode || 'N/A',
                    brand: activeSelectedProduct.brand || '',
                    category: activeSelectedProduct.category || '',
                    price: price,
                    cost: activeSelectedProduct.cost || (price * 0.75),
                    qty: qty,
                    freeQty: freeQty,
                    discount: discountPct
                });
            }

            showToast('✅ Added ' + activeSelectedProduct.name);
            activeSelectedProduct = null;
            document.getElementById('productSearchInput').value = '';
            document.getElementById('activeLinePrice').value = '';
            document.getElementById('activeLineQty').value = 1;
            document.getElementById('activeLineFreeQty').value = 0;
            document.getElementById('activeLineDiscount').value = 0;
            document.getElementById('productSearchFloatingResults').style.display = 'none';

            renderCartTable();
        }

        function updateCartItemQty(index, delta) {
            if (!orderCart[index]) return;
            const newQty = orderCart[index].qty + delta;
            if (newQty <= 0) {
                removeCartItem(index);
            } else {
                orderCart[index].qty = newQty;
                const prod = (data.products || []).find(p => p.id === orderCart[index].productId);
                if (prod && prod.promoRatio) {
                    orderCart[index].freeQty = Math.floor(newQty / prod.promoRatio);
                }
                renderCartTable();
            }
        }

        function setCartItemQtyDirect(index, value) {
            const qty = parseInt(value) || 1;
            if (!orderCart[index]) return;
            if (qty <= 0) {
                removeCartItem(index);
            } else {
                orderCart[index].qty = qty;
                renderCartTable();
            }
        }

        function removeCartItem(index) {
            orderCart.splice(index, 1);
            renderCartTable();
        }

        function renderCartTable() {
            const tbody = document.getElementById('cartTableBody');
            const badgeCount = document.getElementById('cartItemBadgeCount');

            if (orderCart.length === 0) {
                tbody.innerHTML = \`
                    <tr>
                        <td colspan="8" style="text-align:center; padding:36px; color:#94a3b8;">
                            <i class="fas fa-cart-arrow-down" style="font-size:32px; display:block; margin-bottom:8px; color:#cbd5e1;"></i>
                            Scan barcode or select products to build order
                        </td>
                    </tr>
                \`;
                badgeCount.textContent = '0 SKUs';
            } else {
                badgeCount.textContent = orderCart.length + ' SKUs (' + orderCart.reduce((s,i) => s + i.qty, 0) + ' units)';
                tbody.innerHTML = orderCart.map((item, idx) => {
                    const lineGross = item.price * item.qty;
                    const lineDiscAmount = lineGross * ((item.discount || 0) / 100);
                    const lineNet = lineGross - lineDiscAmount;

                    return \`
                        <tr>
                            <td>\${idx + 1}</td>
                            <td>
                                <div style="font-weight:800; color:#0f172a; font-size:13px;">\${item.name}</div>
                                <div style="font-size:11px; color:#64748b;">\${item.brand ? item.brand + ' • ' : ''}SKU: \${item.sku}</div>
                            </td>
                            <td class="text-right">
                                <span style="font-weight:700;">LKR \${item.price.toFixed(2)}</span>
                            </td>
                            <td class="text-center">
                                <div class="pos-qty-stepper">
                                    <button class="pos-stepper-btn" onclick="updateCartItemQty(\${idx}, -1)">-</button>
                                    <input type="number" class="pos-stepper-input" value="\${item.qty}" min="1" onchange="setCartItemQtyDirect(\${idx}, this.value)">
                                    <button class="pos-stepper-btn" onclick="updateCartItemQty(\${idx}, 1)">+</button>
                                </div>
                            </td>
                            <td class="text-center">
                                \${item.freeQty > 0 ? '<span class="badge badge-good">+' + item.freeQty + ' FREE</span>' : '<span style="color:#94a3b8;">-</span>'}
                            </td>
                            <td class="text-right">
                                \${item.discount > 0 ? '<span style="color:#dc2626; font-weight:700;">' + item.discount + '%</span>' : '<span style="color:#94a3b8;">0%</span>'}
                            </td>
                            <td class="text-right">
                                <strong style="font-size:13.5px; color:#067d62;">LKR \${lineNet.toFixed(2)}</strong>
                            </td>
                            <td class="text-center">
                                <button class="btn btn-secondary btn-sm" style="color:#dc2626; padding:3px 7px;" onclick="removeCartItem(\${idx})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    \`;
                }).join('');
            }

            renderCartSummary();
            checkOrderCreditLimit();
        }

        function calculateNetOrderTotal() {
            const gross = orderCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const lineDiscounts = orderCart.reduce((sum, item) => sum + ((item.price * item.qty) * ((item.discount || 0) / 100)), 0);
            const specialDiscount = parseFloat(document.getElementById('posOrderSpecialDiscount')?.value) || 0;
            const returnsDeduction = orderReturns.reduce((sum, r) => sum + ((r.qty || 0) * (r.unitCredit || 0)), 0);
            return Math.max(0, gross - lineDiscounts - specialDiscount - returnsDeduction);
        }

        function renderCartSummary() {
            const gross = orderCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const lineDiscounts = orderCart.reduce((sum, item) => sum + ((item.price * item.qty) * ((item.discount || 0) / 100)), 0);
            const specialDiscount = parseFloat(document.getElementById('posOrderSpecialDiscount')?.value) || 0;
            const freeUnits = orderCart.reduce((sum, item) => sum + (item.freeQty || 0), 0);
            const freeValue = orderCart.reduce((sum, item) => sum + ((item.freeQty || 0) * item.price), 0);
            const returnsDeduction = orderReturns.reduce((sum, r) => sum + ((r.qty || 0) * (r.unitCredit || 0)), 0);

            const netTotal = Math.max(0, gross - lineDiscounts - specialDiscount - returnsDeduction);

            if (document.getElementById('posGrossSubtotal')) document.getElementById('posGrossSubtotal').textContent = 'LKR ' + gross.toFixed(2);
            if (document.getElementById('posLineDiscounts')) document.getElementById('posLineDiscounts').textContent = '- LKR ' + lineDiscounts.toFixed(2);
            if (document.getElementById('posFreeIssuesValue')) document.getElementById('posFreeIssuesValue').textContent = freeUnits + ' pcs (LKR ' + freeValue.toFixed(2) + ')';
            
            const returnsRow = document.getElementById('posReturnsRow');
            if (returnsRow) {
                if (returnsDeduction > 0) {
                    returnsRow.style.display = 'flex';
                    document.getElementById('posReturnsDeduction').textContent = '- LKR ' + returnsDeduction.toFixed(2);
                } else {
                    returnsRow.style.display = 'none';
                }
            }

            if (document.getElementById('posNetTotal')) document.getElementById('posNetTotal').textContent = 'LKR ' + netTotal.toFixed(2);

            calculatePosChange();
        }

        function calculatePosChange() {
            const netTotal = calculateNetOrderTotal();
            const tendered = parseFloat(document.getElementById('posCashTendered')?.value) || 0;
            const changeLabel = document.getElementById('posChangeLabel');
            const changeVal = document.getElementById('posChangeValue');

            if (!changeLabel || !changeVal) return;

            if (tendered >= netTotal) {
                changeLabel.textContent = 'Change to Return:';
                changeVal.textContent = 'LKR ' + (tendered - netTotal).toFixed(2);
                changeVal.style.color = '#067d62';
            } else {
                changeLabel.textContent = 'Balance Due (Credit):';
                changeVal.textContent = 'LKR ' + (netTotal - tendered).toFixed(2);
                changeVal.style.color = '#dc2626';
            }
        }

        function onPaymentMethodChange(method) {
            const chequeSection = document.getElementById('chequeDetailsSection');
            if (chequeSection) {
                chequeSection.style.display = method === 'CHEQUE' ? 'block' : 'none';
            }
            checkOrderCreditLimit();
        }

        // Returns and Empty Crates Lines
        function addReturnDeductionLine() {
            const container = document.getElementById('orderReturnsContainer');
            container.style.display = 'block';
            orderReturns.push({
                desc: 'Empty Bakery Trays / Return Crates',
                qty: 1,
                unitCredit: 50
            });
            renderReturnsTable();
        }

        function renderReturnsTable() {
            const tbody = document.getElementById('orderReturnsTableBody');
            if (!tbody) return;
            tbody.innerHTML = orderReturns.map((r, idx) => \`
                <tr style="border-bottom:1px solid #f1f5f9;">
                    <td><input type="text" class="pos-input" style="height:32px; padding:2px 8px; font-size:12px;" value="\${r.desc}" oninput="orderReturns[\${idx}].desc=this.value"></td>
                    <td><input type="number" class="pos-input" style="height:32px; padding:2px 8px; font-size:12px; width:70px;" value="\${r.qty}" min="1" oninput="orderReturns[\${idx}].qty=parseFloat(this.value)||0; renderCartSummary();"></td>
                    <td class="text-right"><input type="number" class="pos-input" style="height:32px; padding:2px 8px; font-size:12px; width:90px; text-align:right;" value="\${r.unitCredit}" oninput="orderReturns[\${idx}].unitCredit=parseFloat(this.value)||0; renderCartSummary();"></td>
                    <td class="text-right" style="font-weight:800; color:#dc2626;">LKR \${((r.qty||0)*(r.unitCredit||0)).toFixed(2)}</td>
                    <td class="text-center"><button class="btn btn-secondary btn-sm" style="color:#dc2626; padding:2px 6px;" onclick="orderReturns.splice(\${idx},1); renderReturnsTable(); renderCartSummary();"><i class="fas fa-times"></i></button></td>
                </tr>
            \`).join('');
            renderCartSummary();
        }

        // ================================================================
        //  TODAY'S SALES ORDERS REGISTER RENDERER
        // ================================================================
        function renderTodayOrders() {
            const today = getToday();
            const allOrders = [...(data.orders || []), ...(data.pendingOrders || [])];
            const todayOrders = allOrders.filter(o => o.date === today || (o.createdAt && o.createdAt.startsWith(today)));

            const todayCountEl = document.getElementById('todayOrdersBadgeCount');
            const todayTotalEl = document.getElementById('todayOrdersTotalAmount');
            const tbody = document.getElementById('todayOrdersTableBody');

            const totalSum = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
            const totalUnits = todayOrders.reduce((sum, o) => sum + (o.items || []).reduce((s, i) => s + (i.qty || 0), 0), 0);

            if (todayCountEl) todayCountEl.textContent = todayOrders.length + ' Orders (' + totalUnits + ' units)';
            if (todayTotalEl) todayTotalEl.textContent = 'Today Total: LKR ' + totalSum.toFixed(2);

            if (!tbody) return;

            if (todayOrders.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#94a3b8;"><i class="fas fa-inbox" style="font-size:24px; display:block; margin-bottom:6px; color:#cbd5e1;"></i>No orders created today yet</td></tr>';
                return;
            }

            tbody.innerHTML = todayOrders.slice().reverse().map((o) => {
                const payBadge = o.paymentMethod === 'CASH' 
                    ? '<span class="badge badge-good">CASH</span>' 
                    : (o.paymentMethod.startsWith('CREDIT') ? '<span class="badge badge-rejected">' + o.paymentMethod + '</span>' : '<span class="badge badge-warning">' + o.paymentMethod + '</span>');

                const itemCount = (o.items || []).length;
                const totalPcs = (o.items || []).reduce((s, i) => s + (i.qty || 0), 0);

                return \`
                    <tr>
                        <td><strong>#\${o.id}</strong></td>
                        <td>
                            <div style="font-weight:800; color:#0f172a;">\${o.shopName || 'Customer'}</div>
                            <div style="font-size:11px; color:#64748b;">\${o.shopAddress || ''}</div>
                        </td>
                        <td>\${o.repName || 'Sales Rep'}</td>
                        <td class="text-center"><span class="badge badge-secondary">\${itemCount} SKUs (\${totalPcs} pcs)</span></td>
                        <td>\${payBadge}</td>
                        <td class="text-right"><strong style="color:#067d62; font-size:13.5px;">LKR \${(o.total || 0).toFixed(2)}</strong></td>
                        <td class="text-center"><span class="badge badge-\${o.status === 'approved' ? 'good' : 'warning'}">\${(o.status || 'Pending').toUpperCase()}</span></td>
                        <td class="text-right">
                            <button class="btn btn-secondary btn-sm" onclick="printOrderThermal('\${o.id}')" title="Print Thermal Slip"><i class="fas fa-print"></i></button>
                            <button class="btn btn-secondary btn-sm" onclick="printOrderInvoice('\${o.id}')" title="Print A4 Invoice"><i class="fas fa-file-invoice"></i></button>
                            <button class="btn btn-secondary btn-sm" style="background:#25D366; color:#fff; border-color:#25D366;" onclick="shareOrderWhatsApp('\${o.id}')" title="WhatsApp Share"><i class="fab fa-whatsapp"></i></button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        // Save Draft & Clear
        function saveOrderDraft() {
            if (orderCart.length === 0) {
                showToast('⚠️ No items in cart to save');
                return;
            }
            const draft = {
                shopId: document.getElementById('orderShop').value,
                repId: document.getElementById('orderRep').value,
                orderType: document.getElementById('orderType').value,
                paymentMethod: document.getElementById('orderPayment').value,
                cart: orderCart,
                returns: orderReturns,
                notes: document.getElementById('orderNotes').value,
                savedAt: new Date().toISOString()
            };
            localStorage.setItem('DIGIBIZ_ORDER_DRAFT_' + (data.settings?.storeName || 'DEFAULT'), JSON.stringify(draft));
            showToast('💾 Order draft saved successfully');
        }

        function clearNewOrder() {
            if (orderCart.length > 0 && !confirm('Are you sure you want to clear all items from the order?')) return;
            orderCart = [];
            orderReturns = [];
            document.getElementById('posOrderSpecialDiscount').value = 0;
            document.getElementById('posCashTendered').value = '';
            document.getElementById('orderNotes').value = '';
            document.getElementById('orderReturnsContainer').style.display = 'none';
            renderCartTable();
            showToast('Order workspace reset');
        }

        // SUBMIT ORDER ENGINE
        function submitNewOrder(printType = 'NONE') {
            const shopId = document.getElementById('orderShop').value;
            const repId = document.getElementById('orderRep').value;
            const paymentMethod = document.getElementById('orderPayment').value;
            const orderDate = document.getElementById('orderDate').value || getToday();
            const deliveryDate = document.getElementById('orderDeliveryDate').value || orderDate;
            const orderType = document.getElementById('orderType').value;
            const notes = document.getElementById('orderNotes').value;

            if (!shopId) {
                showToast('⚠️ Please select a Shop / Customer');
                document.getElementById('orderShop').focus();
                return;
            }
            if (!repId) {
                showToast('⚠️ Please select a Sales Rep');
                document.getElementById('orderRep').focus();
                return;
            }
            if (orderCart.length === 0) {
                showToast('⚠️ Order cart is empty! Please add products.');
                return;
            }

            const shop = (data.shops || []).find(s => s.id === shopId);
            const rep = (data.reps || []).find(r => r.id === repId);

            const gross = orderCart.reduce((sum, item) => sum + (item.price * item.qty), 0);
            const lineDiscounts = orderCart.reduce((sum, item) => sum + ((item.price * item.qty) * ((item.discount || 0) / 100)), 0);
            const specialDiscount = parseFloat(document.getElementById('posOrderSpecialDiscount')?.value) || 0;
            const returnsDeduction = orderReturns.reduce((sum, r) => sum + ((r.qty || 0) * (r.unitCredit || 0)), 0);
            const netTotal = Math.max(0, gross - lineDiscounts - specialDiscount - returnsDeduction);
            const totalCost = orderCart.reduce((sum, item) => sum + ((item.cost || item.price * 0.75) * item.qty), 0);
            const tendered = parseFloat(document.getElementById('posCashTendered')?.value) || 0;

            let paidAmount = 0;
            let balanceDue = 0;

            if (paymentMethod === 'CASH') {
                paidAmount = tendered >= netTotal ? netTotal : tendered;
                balanceDue = Math.max(0, netTotal - paidAmount);
            } else if (paymentMethod.startsWith('CREDIT')) {
                paidAmount = 0;
                balanceDue = netTotal;
            } else if (paymentMethod === 'CHEQUE') {
                paidAmount = netTotal;
                balanceDue = 0;
            } else {
                paidAmount = netTotal;
                balanceDue = 0;
            }

            const orderId = 'ORD-' + Date.now().toString().slice(-6);

            const newOrder = {
                id: orderId,
                date: orderDate,
                deliveryDate: deliveryDate,
                orderType: orderType,
                shopId: shopId,
                shopName: shop ? shop.name : 'Customer',
                shopPhone: shop ? shop.phone : '',
                shopAddress: shop ? shop.address : '',
                repId: repId,
                repName: rep ? rep.name : 'Rep',
                items: orderCart.map(i => ({ ...i })),
                returns: orderReturns.map(r => ({ ...r })),
                grossSubtotal: gross,
                lineDiscounts: lineDiscounts,
                specialDiscount: specialDiscount,
                returnsDeduction: returnsDeduction,
                total: netTotal,
                cost: totalCost,
                paymentMethod: paymentMethod,
                cashPaid: paidAmount,
                balance: balanceDue,
                status: 'pending',
                notes: notes,
                createdAt: new Date().toISOString()
            };

            // Cheque details
            if (paymentMethod === 'CHEQUE') {
                newOrder.chequeNumber = document.getElementById('orderChequeNumber')?.value || '';
                newOrder.chequeBank = document.getElementById('orderChequeBank')?.value || '';
                newOrder.chequeDate = document.getElementById('orderChequeDate')?.value || orderDate;
                newOrder.chequeDueDate = document.getElementById('orderChequeDueDate')?.value || orderDate;

                if (!data.cheques) data.cheques = [];
                data.cheques.push({
                    id: generateId(),
                    chequeNumber: newOrder.chequeNumber,
                    bank: newOrder.chequeBank,
                    customerName: newOrder.shopName,
                    amount: netTotal,
                    dueDate: newOrder.chequeDueDate,
                    status: 'pending',
                    orderId: orderId
                });
            }

            if (!data.pendingOrders) data.pendingOrders = [];
            data.pendingOrders.push(newOrder);

            // Deduct stock
            orderCart.forEach(item => {
                const product = (data.products || []).find(p => p.id === item.productId);
                if (product) {
                    product.stock = Math.max(0, (product.stock || 0) - (item.qty + (item.freeQty || 0)));
                }
            });

            // Double Entry Accounting Journal
            if (!data.journalEntries) data.journalEntries = [];
            data.journalEntries.push({
                id: generateId(),
                date: orderDate,
                description: 'Sales Order #' + orderId + ' (' + newOrder.shopName + ')',
                account: 'Accounts Receivable',
                debit: netTotal,
                credit: 0,
                amount: netTotal
            });

            saveData();
            showToast('🎉 Order #' + orderId + ' created successfully!');

            // Post-submit actions
            if (printType === 'THERMAL') {
                printOrderThermal(orderId);
            } else if (printType === 'INVOICE') {
                printOrderInvoice(orderId);
            }

            // Reset cart
            orderCart = [];
            orderReturns = [];
            document.getElementById('posOrderSpecialDiscount').value = 0;
            document.getElementById('posCashTendered').value = '';
            document.getElementById('orderNotes').value = '';
            document.getElementById('orderReturnsContainer').style.display = 'none';

            renderNewOrder();
            renderOrders();
            renderDashboard();
            renderTodayOrders();
        }

        function submitAndShareWhatsApp() {
            submitNewOrder('NONE');
            const latestOrder = (data.pendingOrders || []).slice(-1)[0] || (data.orders || []).slice(-1)[0];
            if (latestOrder) {
                shareOrderWhatsApp(latestOrder.id);
            }
        }

        // ================================================================
        //  PRINTING & EXPORT ENGINE (THERMAL, A4 INVOICE, WHATSAPP)
        // ================================================================

        function printOrderThermal(orderId) {
            const allOrders = [...(data.orders || []), ...(data.pendingOrders || [])];
            const order = allOrders.find(o => o.id === orderId) || (data.pendingOrders || []).slice(-1)[0];
            if (!order) {
                showToast('⚠️ Order not found');
                return;
            }

            const settings = data.settings || {};
            const storeName = settings.storeName || settings.businessName || '${businessName}';
            const phone = settings.phone || '${phone}';
            const address = settings.address || '${address}';
            const header = settings.receiptHeader || '${receiptHeader}';
            const footer = settings.receiptFooter || 'Thank you for your business! / ඔබට ස්තූතියි!';

            const itemsRows = (order.items || []).map(i => \`
                <tr style="border-bottom:1px dashed #ccc;">
                    <td style="padding:4px 0;">\${i.name}\${i.freeQty > 0 ? ' <small style="font-weight:bold; color:#000;">(+' + i.freeQty + ' Free)</small>' : ''}<br><small>\${i.qty} x LKR \${i.price.toFixed(2)}</small></td>
                    <td style="padding:4px 0; text-align:right; vertical-align:bottom; font-weight:bold;">LKR \${((i.price * i.qty) * (1 - (i.discount||0)/100)).toFixed(2)}</td>
                </tr>
            \`).join('');

            const receiptHtml = \`
                <div id="thermalReceiptPrint" style="font-family:'Courier New', monospace; width:300px; padding:12px; background:#fff; color:#000; margin:0 auto; font-size:11.5px; line-height:1.35;">
                    <div style="text-align:center; margin-bottom:8px;">
                        <h3 style="margin:0; font-size:15px; font-weight:900;">\${storeName}</h3>
                        <div style="font-size:10.5px; font-weight:bold;">\${header}</div>
                        <div style="font-size:10px;">\${address}</div>
                        <div style="font-size:10px;">Tel: \${phone}</div>
                        <div style="border-top:1px dashed #000; margin:6px 0;"></div>
                        <div style="font-weight:bold; font-size:12px;">SALES ORDER SLIP</div>
                        <div style="font-size:10.5px;">Order #: \${order.id}</div>
                        <div style="font-size:10px;">Date: \${order.date} | Rep: \${order.repName || 'Sales Rep'}</div>
                        <div style="font-size:11px; font-weight:bold; margin-top:2px;">Shop: \${order.shopName || '-'}</div>
                    </div>
                    <table style="width:100%; border-collapse:collapse; margin-bottom:8px; font-size:11px;">
                        <thead>
                            <tr style="border-bottom:1px dashed #000; border-top:1px dashed #000;">
                                <th style="text-align:left; padding:3px 0;">Item Description</th>
                                <th style="text-align:right; padding:3px 0;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${itemsRows}
                        </tbody>
                    </table>
                    <div style="border-top:1px dashed #000; padding-top:4px; font-size:11px;">
                        <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
                            <span>Gross Subtotal:</span>
                            <span>LKR \${(order.grossSubtotal || order.total).toFixed(2)}</span>
                        </div>
                        \${(order.lineDiscounts || 0) > 0 ? \`<div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Line Discounts:</span><span>- LKR \${order.lineDiscounts.toFixed(2)}</span></div>\` : ''}
                        \${(order.specialDiscount || 0) > 0 ? \`<div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Special Disc:</span><span>- LKR \${order.specialDiscount.toFixed(2)}</span></div>\` : ''}
                        \${(order.returnsDeduction || 0) > 0 ? \`<div style="display:flex; justify-content:space-between; margin-bottom:2px;"><span>Returns Cr:</span><span>- LKR \${order.returnsDeduction.toFixed(2)}</span></div>\` : ''}
                        <div style="display:flex; justify-content:space-between; margin-top:4px; border-top:1px solid #000; padding-top:4px; font-weight:bold; font-size:13px;">
                            <span>NET TOTAL:</span>
                            <span>LKR \${(order.total || 0).toFixed(2)}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-top:3px; font-size:10.5px;">
                            <span>Payment: \${order.paymentMethod || 'CASH'}</span>
                            <span>Paid: LKR \${(order.cashPaid || 0).toFixed(2)}</span>
                        </div>
                        \${(order.balance || 0) > 0 ? \`<div style="display:flex; justify-content:space-between; margin-top:2px; font-size:11px; font-weight:bold; color:#000;"><span>Credit Due:</span><span>LKR \${order.balance.toFixed(2)}</span></div>\` : ''}
                    </div>
                    <div style="border-top:1px dashed #000; margin-top:8px; padding-top:6px; text-align:center; font-size:10px;">
                        <div>\${footer}</div>
                        <div style="margin-top:2px; font-size:8.5px; color:#555;">DIGIBIZ SYSTEM • Enterprise Distributor</div>
                    </div>
                </div>
            \`;

            openPrintWindow(receiptHtml, 'Thermal_Receipt_' + order.id);
        }

        function printOrderInvoice(orderId) {
            const allOrders = [...(data.orders || []), ...(data.pendingOrders || [])];
            const order = allOrders.find(o => o.id === orderId) || (data.pendingOrders || []).slice(-1)[0];
            if (!order) {
                showToast('⚠️ Order not found');
                return;
            }

            const settings = data.settings || {};
            const storeName = settings.storeName || settings.businessName || '${businessName}';
            const phone = settings.phone || '${phone}';
            const email = settings.email || '${email}';
            const address = settings.address || '${address}';

            const itemRows = (order.items || []).map((i, idx) => \`
                <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:8px 10px; text-align:center;">\${idx + 1}</td>
                    <td style="padding:8px 10px;">
                        <strong>\${i.name}</strong>
                        <div style="font-size:11px; color:#64748b;">SKU: \${i.sku || 'N/A'} \${i.brand ? '• ' + i.brand : ''}</div>
                    </td>
                    <td style="padding:8px 10px; text-align:right;">LKR \${i.price.toFixed(2)}</td>
                    <td style="padding:8px 10px; text-align:center; font-weight:bold;">\${i.qty}</td>
                    <td style="padding:8px 10px; text-align:center;">\${i.freeQty > 0 ? '+' + i.freeQty + ' Free' : '-'}</td>
                    <td style="padding:8px 10px; text-align:right;">\${i.discount > 0 ? i.discount + '%' : '-'}</td>
                    <td style="padding:8px 10px; text-align:right; font-weight:bold;">LKR \${((i.price * i.qty) * (1 - (i.discount||0)/100)).toFixed(2)}</td>
                </tr>
            \`).join('');

            const a4Html = \`
                <div class="a4-print-container" style="font-family:'Inter', sans-serif; max-width:800px; margin:0 auto; padding:30px; background:#fff; color:#0f172a; line-height:1.4;">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #0f172a; padding-bottom:16px; margin-bottom:20px;">
                        <div>
                            <h1 style="font-size:24px; font-weight:900; margin:0; color:#0f172a; letter-spacing:-0.5px;">\${storeName}</h1>
                            <div style="font-size:12px; color:#475569; margin-top:2px;">Distributor Management & Supply Network</div>
                            <div style="font-size:11.5px; color:#475569; margin-top:4px;">\${address}</div>
                            <div style="font-size:11.5px; color:#475569;">Tel: \${phone} • Email: \${email}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:20px; font-weight:900; color:#ff9900; letter-spacing:0.5px;">TAX INVOICE</div>
                            <div style="font-size:13px; font-weight:bold; margin-top:4px;">Invoice #: \${order.id}</div>
                            <div style="font-size:12px; color:#64748b;">Date: \${order.date}</div>
                            <div style="font-size:12px; color:#64748b;">Delivery Date: \${order.deliveryDate || order.date}</div>
                            <div style="font-size:12px; color:#64748b;">Sales Rep: \${order.repName || 'Representative'}</div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px; margin-bottom:20px;">
                        <div>
                            <div style="font-size:10.5px; font-weight:800; color:#64748b; text-transform:uppercase;">CUSTOMER / INVOICE TO:</div>
                            <div style="font-size:15px; font-weight:900; color:#0f172a; margin-top:2px;">\${order.shopName}</div>
                            <div style="font-size:12px; color:#475569;">\${order.shopAddress || 'Store Address'}</div>
                            <div style="font-size:12px; color:#475569;">Tel: \${order.shopPhone || 'N/A'}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:10.5px; font-weight:800; color:#64748b; text-transform:uppercase;">ORDER DETAILS:</div>
                            <div style="font-size:13px; font-weight:bold; margin-top:2px;">Payment: \${order.paymentMethod || 'CASH'}</div>
                            <div style="font-size:12px; color:#475569;">Order Type: \${order.orderType || 'Standard'}</div>
                            <div style="font-size:12px; color:#475569;">Status: \${(order.status || 'Pending').toUpperCase()}</div>
                        </div>
                    </div>

                    <table style="width:100%; border-collapse:collapse; margin-bottom:20px; font-size:12px;">
                        <thead>
                            <tr style="background:#0f172a; color:#fff;">
                                <th style="padding:8px 10px; text-align:center; width:40px;">#</th>
                                <th style="padding:8px 10px; text-align:left;">Item Description</th>
                                <th style="padding:8px 10px; text-align:right; width:100px;">Unit Price</th>
                                <th style="padding:8px 10px; text-align:center; width:60px;">Qty</th>
                                <th style="padding:8px 10px; text-align:center; width:80px;">Bonus</th>
                                <th style="padding:8px 10px; text-align:right; width:70px;">Disc</th>
                                <th style="padding:8px 10px; text-align:right; width:120px;">Line Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${itemRows}
                        </tbody>
                    </table>

                    <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:20px; margin-bottom:24px;">
                        <div style="font-size:11.5px; color:#475569; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
                            <strong>Terms & Conditions:</strong>
                            <ul style="margin:4px 0 0 16px; padding:0;">
                                <li>All goods received in sound condition and correct quantity.</li>
                                <li>Discrepancies must be notified within 24 hours of delivery.</li>
                                <li>Cheques subject to realization.</li>
                            </ul>
                        </div>
                        <div>
                            <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12.5px;">
                                <span>Gross Subtotal:</span>
                                <strong>LKR \${(order.grossSubtotal || order.total).toFixed(2)}</strong>
                            </div>
                            \${(order.lineDiscounts || 0) > 0 ? \`<div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12.5px; color:#dc2626;"><span>Line Discounts:</span><span>- LKR \${order.lineDiscounts.toFixed(2)}</span></div>\` : ''}
                            \${(order.specialDiscount || 0) > 0 ? \`<div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12.5px; color:#dc2626;"><span>Special Discount:</span><span>- LKR \${order.specialDiscount.toFixed(2)}</span></div>\` : ''}
                            \${(order.returnsDeduction || 0) > 0 ? \`<div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12.5px; color:#dc2626;"><span>Returns Credit:</span><span>- LKR \${order.returnsDeduction.toFixed(2)}</span></div>\` : ''}
                            <div style="display:flex; justify-content:space-between; padding:8px 0; font-size:16px; font-weight:900; border-top:2px solid #0f172a; margin-top:6px; color:#067d62;">
                                <span>NET PAYABLE:</span>
                                <span>LKR \${(order.total || 0).toFixed(2)}</span>
                            </div>
                            <div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12px;">
                                <span>Amount Paid:</span>
                                <span>LKR \${(order.cashPaid || 0).toFixed(2)}</span>
                            </div>
                            \${(order.balance || 0) > 0 ? \`<div style="display:flex; justify-content:space-between; padding:4px 0; font-size:12.5px; font-weight:bold; color:#dc2626;"><span>Outstanding Due:</span><span>LKR \${order.balance.toFixed(2)}</span></div>\` : ''}
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; margin-top:40px; text-align:center; font-size:11px; color:#475569;">
                        <div>
                            <div style="border-top:1px dashed #94a3b8; padding-top:6px;">Prepared / Rep Signature</div>
                        </div>
                        <div>
                            <div style="border-top:1px dashed #94a3b8; padding-top:6px;">Storekeeper Signature</div>
                        </div>
                        <div>
                            <div style="border-top:1px dashed #94a3b8; padding-top:6px;">Customer Seal & Signature</div>
                        </div>
                    </div>
                </div>
            \`;

            openPrintWindow(a4Html, 'Invoice_' + order.id);
        }

        function shareOrderWhatsApp(orderId) {
            const allOrders = [...(data.orders || []), ...(data.pendingOrders || [])];
            const order = allOrders.find(o => o.id === orderId);
            if (!order) return;

            const itemsText = (order.items || []).map(i => '• ' + i.name + ' x ' + i.qty + (i.freeQty > 0 ? ' (+' + i.freeQty + ' Free)' : '') + ' = LKR ' + ((i.price * i.qty) * (1 - (i.discount||0)/100)).toFixed(2)).join('%0A');
            
            const message = \`*SALES ORDER: #\${order.id}*%0A*Shop:* \${order.shopName}%0A*Date:* \${order.date}%0A----------------------------%0A\${itemsText}%0A----------------------------%0A*Net Total: LKR \${(order.total || 0).toFixed(2)}*%0A*Payment:* \${order.paymentMethod}%0A*Due Balance: LKR \${(order.balance || 0).toFixed(2)}*%0A%0A_Thank you for your business!_\`;

            const phone = (order.shopPhone || '').replace(/[^0-9]/g, '');
            const url = phone ? \`https://api.whatsapp.com/send?phone=\${phone}&text=\${message}\` : \`https://api.whatsapp.com/send?text=\${message}\`;
            window.open(url, '_blank');
        }

        function openPrintWindow(htmlContent, title = 'Print') {
            const printWin = window.open('', '_blank', 'width=850,height=700');
            printWin.document.write('<!DOCTYPE html><html><head><title>' + title + '</title><meta charset="UTF-8" /><style>body { margin:0; padding:0; background:#fff; font-family:sans-serif; } @media print { body { margin:0; } }</style></head><body>' + htmlContent + '<' + 'script>window.onload = function() { window.print(); };<' + '/script></body></html>');
            printWin.document.close();
        }

        // ================================================================
        //  VISUAL PRODUCT CATALOG MODAL
        // ================================================================

        function openCatalogModal() {
            renderCatalogCategoryPills();
            renderCatalogModalGrid();
            document.getElementById('catalogModal').classList.add('show');
        }

        function closeCatalogModal() {
            document.getElementById('catalogModal').classList.remove('show');
        }

        function renderCatalogCategoryPills() {
            const categories = ['ALL', ...new Set((data.products || []).map(p => p.category || 'General').filter(Boolean))];
            const pillsContainer = document.getElementById('catalogCategoryPills');
            pillsContainer.innerHTML = categories.map(cat => \`
                <div class="catalog-pill \${activeCatalogCategory === cat ? 'active' : ''}" onclick="setCatalogCategory('\${cat}')">
                    \${cat}
                </div>
            \`).join('');
        }

        function setCatalogCategory(cat) {
            activeCatalogCategory = cat;
            renderCatalogCategoryPills();
            renderCatalogModalGrid();
        }

        function renderCatalogModalGrid() {
            const query = (document.getElementById('catalogSearchInput')?.value || '').toLowerCase().trim();
            const container = document.getElementById('catalogGridContainer');

            let products = data.products || [];
            if (activeCatalogCategory !== 'ALL') {
                products = products.filter(p => (p.category || 'General') === activeCatalogCategory);
            }
            if (query) {
                products = products.filter(p => 
                    (p.name || '').toLowerCase().includes(query) ||
                    (p.brand || '').toLowerCase().includes(query) ||
                    (p.sku || '').toLowerCase().includes(query)
                );
            }

            if (products.length === 0) {
                container.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:30px; color:#94a3b8;">No products found in catalog</div>';
                return;
            }

            container.innerHTML = products.map(p => {
                const inCart = orderCart.find(i => i.productId === p.id);
                const stock = p.stock || 0;
                return \`
                    <div class="catalog-card" onclick="addCatalogItemToOrder('\${p.id}')">
                        <div>
                            <div style="font-size:10px; font-weight:800; color:#ff9900; text-transform:uppercase;">\${p.category || 'General'}</div>
                            <div style="font-size:13px; font-weight:800; color:#0f172a; margin-top:2px;">\${p.name}</div>
                            <div style="font-size:11px; color:#64748b;">\${p.brand || ''} • Stock: \${stock}</div>
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px solid #f1f5f9;">
                            <span style="font-size:14px; font-weight:900; color:#067d62;">LKR \${(p.price || 0).toFixed(2)}</span>
                            <button class="btn btn-primary btn-sm" style="padding:3px 10px;">
                                \${inCart ? '<i class="fas fa-check"></i> ' + inCart.qty : '<i class="fas fa-plus"></i> Add'}
                            </button>
                        </div>
                    </div>
                \`;
            }).join('');
        }

        function addCatalogItemToOrder(productId) {
            const product = (data.products || []).find(p => p.id === productId);
            if (!product) return;

            const existingIndex = orderCart.findIndex(item => item.productId === productId);
            if (existingIndex !== -1) {
                orderCart[existingIndex].qty += 1;
            } else {
                orderCart.push({
                    productId: product.id,
                    name: product.name,
                    sku: product.sku || product.barcode || 'N/A',
                    brand: product.brand || '',
                    category: product.category || '',
                    price: product.price || 0,
                    cost: product.cost || (product.price * 0.75),
                    qty: 1,
                    freeQty: calculatePromotionFreeQty(product, 1),
                    discount: 0
                });
            }

            showToast('✅ Added ' + product.name);
            renderCartTable();
            renderCatalogModalGrid();
        }

        // ================================================================
        //  WORLD-CLASS GRN / PROCUREMENT ENGINE
        // ================================================================

        let grnLineItems = [];

        function renderGRN() {
            const grnRecords = data.grnRecords || [];
            const suppliers = data.supplierLedger || [];

            // Stats
            const monthStart = getMonthStart();
            const monthRecords = grnRecords.filter(g => g.date && g.date >= monthStart);
            const monthTotal = monthRecords.reduce((sum, g) => sum + (g.total || 0), 0);
            const itemsReceived = grnRecords.reduce((sum, g) => sum + (g.items || []).reduce((s, i) => s + (i.qty || 0), 0), 0);
            const totalDue = suppliers.reduce((sum, s) => sum + (s.balance || 0), 0);
            const completedCount = grnRecords.filter(g => g.status === 'completed').length;

            if (document.getElementById('grnMonthTotal')) document.getElementById('grnMonthTotal').textContent = 'LKR ' + monthTotal.toFixed(2);
            if (document.getElementById('grnMonthCount')) document.getElementById('grnMonthCount').textContent = monthRecords.length + ' GRN Vouchers';
            if (document.getElementById('grnItemsReceived')) document.getElementById('grnItemsReceived').textContent = itemsReceived;
            if (document.getElementById('grnSupplierDue')) document.getElementById('grnSupplierDue').textContent = 'LKR ' + totalDue.toFixed(2);
            if (document.getElementById('grnSupplierCount')) document.getElementById('grnSupplierCount').textContent = suppliers.length + ' Active Suppliers';
            if (document.getElementById('grnCompletedCount')) document.getElementById('grnCompletedCount').textContent = completedCount;

            // Populate Supplier Filter dropdown
            const supFilter = document.getElementById('grnSupplierFilter');
            if (supFilter) {
                const currentSup = supFilter.value;
                supFilter.innerHTML = '<option value="ALL">All Suppliers</option>';
                suppliers.forEach(s => {
                    supFilter.innerHTML += \`<option value="\${s.name}">\${s.name}\</option>\`;
                });
                supFilter.value = currentSup;
            }

            // Filtering
            const search = (document.getElementById('grnSearchFilter')?.value || '').toLowerCase().trim();
            const selectedSup = document.getElementById('grnSupplierFilter')?.value || 'ALL';
            const selectedPay = document.getElementById('grnPaymentFilter')?.value || 'ALL';

            let filtered = grnRecords;
            if (search) {
                filtered = filtered.filter(g => 
                    (g.id || '').toLowerCase().includes(search) ||
                    (g.supplierName || '').toLowerCase().includes(search) ||
                    (g.billNumber || '').toLowerCase().includes(search) ||
                    (g.poRef || '').toLowerCase().includes(search)
                );
            }
            if (selectedSup !== 'ALL') {
                filtered = filtered.filter(g => g.supplierName === selectedSup);
            }
            if (selectedPay !== 'ALL') {
                filtered = filtered.filter(g => g.paymentStatus === selectedPay);
            }

            document.getElementById('grnTotalRecordsCount').textContent = filtered.length + ' records';

            const tbody = document.getElementById('grnTableBody');
            if (filtered.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:40px; color:#94a3b8;">No GRN records match your filters</td></tr>';
                return;
            }

            tbody.innerHTML = filtered.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(g => {
                const isPaid = g.paymentStatus === 'PAID';
                const statusBadge = isPaid 
                    ? '<span class="badge badge-good">PAID</span>' 
                    : (g.paymentStatus === 'PARTIAL' ? '<span class="badge badge-warning">PARTIAL</span>' : '<span class="badge badge-rejected">CREDIT</span>');

                return \`
                    <tr>
                        <td><strong>#\${g.id || 'N/A'}</strong></td>
                        <td>
                            <div style="font-weight:800; color:#0f172a;">\${g.supplierName || '-'}</div>
                            <div style="font-size:11px; color:#64748b;">PO: \${g.poRef || 'N/A'}</div>
                        </td>
                        <td>\${g.billNumber || '-'}</td>
                        <td>\${g.date || '-'}</td>
                        <td class="text-center"><span class="badge badge-secondary">\${(g.items || []).length} SKUs (\${(g.items || []).reduce((s,i)=>s+(i.qty||0),0)} units)</span></td>
                        <td class="text-right"><strong>LKR \${(g.total || 0).toFixed(2)}</strong></td>
                        <td>\${statusBadge}</td>
                        <td class="text-right">
                            <button class="btn btn-secondary btn-sm" onclick="viewGRNVoucher('\${g.id}')" title="View Voucher"><i class="fas fa-eye"></i></button>
                            <button class="btn btn-secondary btn-sm" onclick="printGRNVoucher('\${g.id}')" title="Print A4 GRN"><i class="fas fa-print"></i></button>
                            <button class="btn btn-danger btn-sm" onclick="deleteGRN('\${g.id}')" title="Void / Delete"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                \`;
            }).join('');
        }

        function openGRNModal() {
            // Populate supplier dropdown
            const supSelect = document.getElementById('grnModalSupplier');
            supSelect.innerHTML = '<option value="">-- Select Supplier --</option>';
            (data.supplierLedger || []).forEach(s => {
                supSelect.innerHTML += \`<option value="\${s.name}">\${s.name} (Due: LKR \${(s.balance||0).toFixed(2)})\</option>\`;
            });

            document.getElementById('grnModalBillNumber').value = '';
            document.getElementById('grnModalPoRef').value = 'PO-' + new Date().toISOString().slice(2,7).replace('-','') + '-' + Math.floor(100 + Math.random()*900);
            document.getElementById('grnModalDate').value = getToday();
            document.getElementById('grnModalReceiver').value = data.settings?.ownerName || 'Store Manager';
            document.getElementById('grnModalDiscount').value = 0;
            document.getElementById('grnModalFreight').value = 0;
            document.getElementById('grnModalCashPaid').value = 0;
            document.getElementById('grnModalNotes').value = '';

            grnLineItems = [];
            addGRNLineItemRow();

            calculateGRNTotals();
            document.getElementById('grnStudioModal').classList.add('show');
        }

        function closeGRNModal() {
            document.getElementById('grnStudioModal').classList.remove('show');
        }

        function onGRNSupplierChange(supName) {
            const sup = (data.supplierLedger || []).find(s => s.name === supName);
            const balInput = document.getElementById('grnModalSupplierBalance');
            if (sup) {
                balInput.value = 'Due: LKR ' + (sup.balance || 0).toFixed(2) + ' | Phone: ' + (sup.phone || 'N/A');
            } else {
                balInput.value = '';
            }
        }

        function onGRNPaymentModeChange(mode) {
            const partialRow = document.getElementById('grnPartialPaymentRow');
            if (mode === 'PARTIAL') {
                partialRow.style.display = 'grid';
            } else {
                partialRow.style.display = 'none';
            }
        }

        function addGRNLineItemRow() {
            const rowId = 'grn_row_' + Date.now() + '_' + Math.random().toString(36).substr(2,3);
            const today = getToday();
            const nextYear = new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0];

            grnLineItems.push({
                rowId: rowId,
                productId: '',
                productName: '',
                cost: 0,
                qty: 1,
                bonusQty: 0,
                batchNumber: 'LOT-' + new Date().toISOString().slice(2,7).replace('-','') + '-' + Math.floor(100 + Math.random()*900),
                mfd: today,
                exp: nextYear,
                sellingPrice: 0,
                total: 0
            });

            renderGRNLineItemsTable();
        }

        function renderGRNLineItemsTable() {
            const tbody = document.getElementById('grnLineItemsTableBody');
            const products = data.products || [];

            tbody.innerHTML = grnLineItems.map((item, idx) => {
                const prodOptions = products.map(p => \`<option value="\${p.id}" \${item.productId === p.id ? 'selected' : ''}>\${p.name}\</option>\`).join('');

                return \`
                    <tr id="\${item.rowId}">
                        <td>
                            <select class="pos-select" style="height:34px; padding:2px 6px; font-size:12px; font-weight:700;" onchange="onGRNRowProductChange(\${idx}, this.value)">
                                <option value="">-- Select or Type --</option>
                                \${prodOptions}
                                <option value="__NEW__">+ Quick Add New Product...</option>
                            </select>
                        </td>
                        <td>
                            <input type="number" class="pos-input" style="height:34px; padding:2px 6px; font-size:12px; text-align:right;" value="\${item.cost}" min="0" step="0.01" oninput="onGRNRowCostChange(\${idx}, this.value)">
                        </td>
                        <td>
                            <input type="number" class="pos-input" style="height:34px; padding:2px 6px; font-size:12px; text-align:center;" value="\${item.qty}" min="1" oninput="onGRNRowQtyChange(\${idx}, this.value)">
                        </td>
                        <td>
                            <input type="number" class="pos-input" style="height:34px; padding:2px 6px; font-size:12px; text-align:center;" value="\${item.bonusQty}" min="0" oninput="grnLineItems[\${idx}].bonusQty=parseInt(this.value)||0; calculateGRNTotals();">
                        </td>
                        <td>
                            <input type="text" class="pos-input" style="height:34px; padding:2px 6px; font-size:11px;" value="\${item.batchNumber}" oninput="grnLineItems[\${idx}].batchNumber=this.value">
                        </td>
                        <td>
                            <input type="date" class="pos-input" style="height:34px; padding:2px 6px; font-size:11px;" value="\${item.exp}" oninput="grnLineItems[\${idx}].exp=this.value">
                        </td>
                        <td>
                            <input type="number" class="pos-input" style="height:34px; padding:2px 6px; font-size:12px; text-align:right;" value="\${item.sellingPrice}" min="0" step="0.01" oninput="grnLineItems[\${idx}].sellingPrice=parseFloat(this.value)||0;">
                        </td>
                        <td class="text-right" style="font-weight:800; color:#067d62;">
                            LKR \${(item.cost * item.qty).toFixed(2)}
                        </td>
                        <td class="text-center">
                            <button class="btn btn-secondary btn-sm" style="color:#dc2626; padding:2px 6px;" onclick="grnLineItems.splice(\${idx},1); renderGRNLineItemsTable(); calculateGRNTotals();"><i class="fas fa-times"></i></button>
                        </td>
                    </tr>
                \`;
            }).join('');

            calculateGRNTotals();
        }

        function onGRNRowProductChange(idx, prodId) {
            if (prodId === '__NEW__') {
                const newName = prompt('Enter New Product Name:');
                if (newName) {
                    const newId = generateId();
                    if (!data.products) data.products = [];
                    const newProd = {
                        id: newId,
                        name: newName,
                        price: 100,
                        cost: 80,
                        stock: 0,
                        minStock: 5,
                        category: 'General',
                        brand: ''
                    };
                    data.products.push(newProd);
                    saveData();
                    grnLineItems[idx].productId = newId;
                    grnLineItems[idx].productName = newName;
                    grnLineItems[idx].cost = newProd.cost;
                    grnLineItems[idx].sellingPrice = newProd.price;
                }
            } else {
                const prod = (data.products || []).find(p => p.id === prodId);
                if (prod) {
                    grnLineItems[idx].productId = prod.id;
                    grnLineItems[idx].productName = prod.name;
                    grnLineItems[idx].cost = prod.cost || (prod.price * 0.75);
                    grnLineItems[idx].sellingPrice = prod.price || (grnLineItems[idx].cost * 1.25);
                }
            }
            renderGRNLineItemsTable();
        }

        function onGRNRowCostChange(idx, costVal) {
            const cost = parseFloat(costVal) || 0;
            grnLineItems[idx].cost = cost;
            if (!grnLineItems[idx].sellingPrice || grnLineItems[idx].sellingPrice <= cost) {
                grnLineItems[idx].sellingPrice = parseFloat((cost * 1.25).toFixed(2));
            }
            renderGRNLineItemsTable();
        }

        function onGRNRowQtyChange(idx, qtyVal) {
            grnLineItems[idx].qty = parseInt(qtyVal) || 1;
            renderGRNLineItemsTable();
        }

        function calculateGRNTotals() {
            const gross = grnLineItems.reduce((sum, item) => sum + (item.cost * item.qty), 0);
            const discount = parseFloat(document.getElementById('grnModalDiscount')?.value) || 0;
            const freight = parseFloat(document.getElementById('grnModalFreight')?.value) || 0;
            const netTotal = Math.max(0, gross - discount + freight);

            if (document.getElementById('grnModalGrossTotal')) document.getElementById('grnModalGrossTotal').textContent = 'LKR ' + gross.toFixed(2);
            if (document.getElementById('grnModalNetTotal')) document.getElementById('grnModalNetTotal').textContent = 'LKR ' + netTotal.toFixed(2);
        }

        function saveGRNRecord() {
            const supplierName = document.getElementById('grnModalSupplier').value;
            const billNumber = document.getElementById('grnModalBillNumber').value.trim();
            const poRef = document.getElementById('grnModalPoRef').value.trim();
            const date = document.getElementById('grnModalDate').value || getToday();
            const location = document.getElementById('grnModalLocation').value;
            const receiver = document.getElementById('grnModalReceiver').value;
            const paymentMode = document.getElementById('grnModalPaymentMode').value;
            const notes = document.getElementById('grnModalNotes').value;

            if (!supplierName) {
                showToast('⚠️ Please select a Supplier');
                return;
            }
            if (!billNumber) {
                showToast('⚠️ Supplier Bill / Invoice # is required');
                document.getElementById('grnModalBillNumber').focus();
                return;
            }
            if (grnLineItems.length === 0 || !grnLineItems.some(i => i.productId && i.qty > 0)) {
                showToast('⚠️ At least one product item is required');
                return;
            }

            const gross = grnLineItems.reduce((sum, item) => sum + (item.cost * item.qty), 0);
            const discount = parseFloat(document.getElementById('grnModalDiscount')?.value) || 0;
            const freight = parseFloat(document.getElementById('grnModalFreight')?.value) || 0;
            const netTotal = Math.max(0, gross - discount + freight);

            const isCredit = paymentMode === 'CREDIT';
            const isPartial = paymentMode === 'PARTIAL';
            const cashPaid = isPartial ? (parseFloat(document.getElementById('grnModalCashPaid')?.value) || 0) : (isCredit ? 0 : netTotal);
            const balanceDue = Math.max(0, netTotal - cashPaid);

            const grnId = '${grnPrefix}' + Date.now().toString().slice(-6);

            const grnRecord = {
                id: grnId,
                date: date,
                supplierName: supplierName,
                billNumber: billNumber,
                poRef: poRef,
                location: location,
                receivedBy: receiver,
                items: grnLineItems.filter(i => i.productId).map(i => ({ ...i })),
                grossTotal: gross,
                discount: discount,
                freight: freight,
                total: netTotal,
                paymentStatus: isCredit ? 'CREDIT' : (isPartial ? 'PARTIAL' : 'PAID'),
                cashPaid: cashPaid,
                balanceDue: balanceDue,
                status: 'completed',
                notes: notes,
                createdAt: new Date().toISOString()
            };

            if (!data.grnRecords) data.grnRecords = [];
            data.grnRecords.push(grnRecord);

            // Update Product Stock, Cost and Selling Price
            grnRecord.items.forEach(item => {
                const product = (data.products || []).find(p => p.id === item.productId);
                if (product) {
                    product.stock = (product.stock || 0) + (item.qty + (item.bonusQty || 0));
                    product.cost = item.cost;
                    if (item.sellingPrice && item.sellingPrice > 0) {
                        product.price = item.sellingPrice;
                    }
                    if (!product.batches) product.batches = [];
                    product.batches.push({
                        batchNumber: item.batchNumber,
                        qty: item.qty + (item.bonusQty || 0),
                        mfd: item.mfd,
                        exp: item.exp,
                        receivedDate: date,
                        cost: item.cost
                    });
                }
            });

            // Update Supplier Ledger
            if (!data.supplierLedger) data.supplierLedger = [];
            let sup = data.supplierLedger.find(s => s.name === supplierName);
            if (sup) {
                sup.balance = (sup.balance || 0) + balanceDue;
            } else {
                data.supplierLedger.push({
                    id: generateId(),
                    name: supplierName,
                    balance: balanceDue
                });
            }

            // Journal Entry
            if (!data.journalEntries) data.journalEntries = [];
            data.journalEntries.push({
                id: generateId(),
                date: date,
                description: 'GRN #' + grnId + ' (' + supplierName + ' Bill #' + billNumber + ')',
                account: 'Inventory',
                debit: netTotal,
                credit: 0,
                amount: netTotal
            });

            saveData();
            closeGRNModal();
            renderGRN();
            renderDashboard();
            showToast('🎉 GRN #' + grnId + ' posted successfully! Inventory updated.');
        }

        function viewGRNVoucher(grnId) {
            const grn = (data.grnRecords || []).find(g => g.id === grnId);
            if (!grn) return;
            currentViewingGRN = grn;

            const itemsHtml = (grn.items || []).map((i, idx) => \`
                <tr style="border-bottom:1px solid #e2e8f0;">
                    <td style="padding:6px 8px;">\${idx + 1}</td>
                    <td style="padding:6px 8px;"><strong>\${i.productName || 'Product'}</strong></td>
                    <td style="padding:6px 8px; font-size:11px;">\${i.batchNumber || '-'}</td>
                    <td style="padding:6px 8px; font-size:11px;">\${i.exp || '-'}</td>
                    <td style="padding:6px 8px; text-align:center;"><strong>\${i.qty}</strong>\${i.bonusQty > 0 ? ' (+' + i.bonusQty + ' Bonus)' : ''}</td>
                    <td style="padding:6px 8px; text-align:right;">LKR \${(i.cost || 0).toFixed(2)}</td>
                    <td style="padding:6px 8px; text-align:right; font-weight:bold;">LKR \${((i.cost || 0) * (i.qty || 0)).toFixed(2)}</td>
                </tr>
            \`).join('');

            const content = \`
                <div style="line-height:1.4;">
                    <div style="display:flex; justify-content:space-between; border-bottom:2px solid #0f172a; padding-bottom:10px; margin-bottom:12px;">
                        <div>
                            <h3 style="margin:0; font-size:18px;">GOODS RECEIVED NOTE (GRN)</h3>
                            <div style="font-size:12px; color:#64748b;">GRN #: <strong>\${grn.id}</strong> | Date: \${grn.date}</div>
                            <div style="font-size:12px; color:#64748b;">Location: \${grn.location || 'Main Store'} | Inspected: \${grn.receivedBy || 'Staff'}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:14px; font-weight:bold;">Supplier: \${grn.supplierName}</div>
                            <div style="font-size:12px; color:#64748b;">Bill / Inv #: \${grn.billNumber}</div>
                            <div style="font-size:12px; color:#64748b;">PO Ref: \${grn.poRef || 'N/A'}</div>
                        </div>
                    </div>

                    <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:14px;">
                        <thead>
                            <tr style="background:#f1f5f9; color:#334155;">
                                <th style="padding:6px 8px; text-align:left; width:30px;">#</th>
                                <th style="padding:6px 8px; text-align:left;">Product</th>
                                <th style="padding:6px 8px; text-align:left; width:90px;">Batch</th>
                                <th style="padding:6px 8px; text-align:left; width:90px;">Expiry</th>
                                <th style="padding:6px 8px; text-align:center; width:90px;">Qty Recv</th>
                                <th style="padding:6px 8px; text-align:right; width:90px;">Cost</th>
                                <th style="padding:6px 8px; text-align:right; width:110px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${itemsHtml}
                        </tbody>
                    </table>

                    <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
                        <div>
                            <div><strong>Payment Status:</strong> \${grn.paymentStatus || 'PAID'}</div>
                            <div style="font-size:11px; color:#64748b;">Paid: LKR \${(grn.cashPaid || 0).toFixed(2)} • Due: LKR \${(grn.balanceDue || 0).toFixed(2)}</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:11px; color:#64748b;">Total Value:</div>
                            <div style="font-size:18px; font-weight:900; color:#067d62;">LKR \${(grn.total || 0).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            \`;

            document.getElementById('grnVoucherViewContent').innerHTML = content;
            document.getElementById('grnVoucherViewModal').classList.add('show');
        }

        function closeGRNVoucherModal() {
            document.getElementById('grnVoucherViewModal').classList.remove('show');
        }

        function printCurrentGRNVoucher() {
            if (currentViewingGRN) {
                printGRNVoucher(currentViewingGRN.id);
            }
        }

        function printGRNVoucher(grnId) {
            const grn = (data.grnRecords || []).find(g => g.id === grnId);
            if (!grn) return;

            const itemsHtml = (grn.items || []).map((i, idx) => \`
                <tr style="border-bottom:1px solid #ddd;">
                    <td style="padding:6px; text-align:center;">\${idx + 1}</td>
                    <td style="padding:6px;"><strong>\${i.productName || 'Product'}</strong></td>
                    <td style="padding:6px;">\${i.batchNumber || '-'}</td>
                    <td style="padding:6px;">\${i.exp || '-'}</td>
                    <td style="padding:6px; text-align:center;">\${i.qty}\${i.bonusQty > 0 ? ' (+' + i.bonusQty + ' Bonus)' : ''}</td>
                    <td style="padding:6px; text-align:right;">LKR \${(i.cost || 0).toFixed(2)}</td>
                    <td style="padding:6px; text-align:right; font-weight:bold;">LKR \${((i.cost || 0) * (i.qty || 0)).toFixed(2)}</td>
                </tr>
            \`).join('');

            const a4Html = \`
                <div class="a4-print-container" style="font-family:'Inter', sans-serif; max-width:800px; margin:0 auto; padding:30px; background:#fff; color:#000;">
                    <div style="display:flex; justify-content:space-between; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:16px;">
                        <div>
                            <h2 style="margin:0; font-size:22px; font-weight:900;">\${data.settings?.storeName || '${businessName}'}</h2>
                            <div style="font-size:12px;">Warehouse Goods Receiving & Quality Inspection</div>
                        </div>
                        <div style="text-align:right;">
                            <div style="font-size:18px; font-weight:bold; color:#ff9900;">GOODS RECEIVED NOTE</div>
                            <div style="font-size:12px;">GRN #: <strong>\${grn.id}</strong></div>
                            <div style="font-size:12px;">Date: \${grn.date}</div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; border:1px solid #ddd; padding:12px; margin-bottom:16px; font-size:12px;">
                        <div>
                            <div><strong>Supplier:</strong> \${grn.supplierName}</div>
                            <div><strong>Bill / Inv #:</strong> \${grn.billNumber}</div>
                            <div><strong>PO Reference:</strong> \${grn.poRef || 'N/A'}</div>
                        </div>
                        <div style="text-align:right;">
                            <div><strong>Location:</strong> \${grn.location || 'Main Warehouse'}</div>
                            <div><strong>Received By:</strong> \${grn.receivedBy || 'Storekeeper'}</div>
                            <div><strong>Payment Terms:</strong> \${grn.paymentStatus || 'PAID'}</div>
                        </div>
                    </div>

                    <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:16px;">
                        <thead>
                            <tr style="background:#0f172a; color:#fff;">
                                <th style="padding:6px; width:30px;">#</th>
                                <th style="padding:6px; text-align:left;">Product Description</th>
                                <th style="padding:6px; text-align:left; width:90px;">Batch #</th>
                                <th style="padding:6px; text-align:left; width:90px;">Expiry</th>
                                <th style="padding:6px; text-align:center; width:80px;">Qty</th>
                                <th style="padding:6px; text-align:right; width:90px;">Unit Cost</th>
                                <th style="padding:6px; text-align:right; width:110px;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            \${itemsHtml}
                        </tbody>
                    </table>

                    <div style="display:flex; justify-content:flex-end; margin-bottom:30px;">
                        <div style="width:250px; font-size:13px;">
                            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:15px; border-top:2px solid #000; padding-top:6px;">
                                <span>TOTAL BILL:</span>
                                <span>LKR \${(grn.total || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:20px; text-align:center; font-size:11px; margin-top:50px;">
                        <div><div style="border-top:1px dashed #000; padding-top:6px;">Received By</div></div>
                        <div><div style="border-top:1px dashed #000; padding-top:6px;">Inspected & Verified</div></div>
                        <div><div style="border-top:1px dashed #000; padding-top:6px;">Authorized Manager</div></div>
                    </div>
                </div>
            \`;

            openPrintWindow(a4Html, 'GRN_' + grn.id);
        }

        function deleteGRN(grnId) {
            if (!confirm('Are you sure you want to void/delete GRN #' + grnId + '? Inventory and supplier balance will be rolled back.')) return;
            const grn = (data.grnRecords || []).find(g => g.id === grnId);
            if (grn) {
                (grn.items || []).forEach(item => {
                    const product = (data.products || []).find(p => p.id === item.productId);
                    if (product) {
                        product.stock = Math.max(0, (product.stock || 0) - (item.qty + (item.bonusQty || 0)));
                    }
                });
                const sup = (data.supplierLedger || []).find(s => s.name === grn.supplierName);
                if (sup) {
                    sup.balance = Math.max(0, (sup.balance || 0) - (grn.balanceDue || 0));
                }
            }
            data.grnRecords = (data.grnRecords || []).filter(g => g.id !== grnId);
            saveData();
            renderGRN();
            renderDashboard();
            showToast('🗑️ GRN deleted and stock restored');
        }

        // Quick Add Modals
        function openNewShopQuickModal() {
            document.getElementById('quickShopName').value = '';
            document.getElementById('quickShopOwner').value = '';
            document.getElementById('quickShopPhone').value = '';
            document.getElementById('quickShopAddress').value = '';
            document.getElementById('quickShopCreditLimit').value = 50000;
            document.getElementById('quickAddShopModal').classList.add('show');
        }

        function saveQuickShop() {
            const name = document.getElementById('quickShopName').value.trim();
            const owner = document.getElementById('quickShopOwner').value.trim();
            const phone = document.getElementById('quickShopPhone').value.trim();
            const address = document.getElementById('quickShopAddress').value.trim();
            const creditLimit = parseFloat(document.getElementById('quickShopCreditLimit').value) || 50000;

            if (!name) {
                showToast('⚠️ Shop Name is required');
                return;
            }

            const newId = generateId();
            if (!data.shops) data.shops = [];
            data.shops.push({
                id: newId,
                name: name,
                owner: owner,
                phone: phone,
                address: address,
                creditLimit: creditLimit,
                assignedRepId: document.getElementById('orderRep')?.value || ''
            });

            saveData();
            document.getElementById('quickAddShopModal').classList.remove('show');
            renderNewOrder();
            document.getElementById('orderShop').value = newId;
            onShopSelectionChanged(newId);
            showToast('✅ Shop added & selected!');
        }

        function openNewSupplierQuickModal() {
            document.getElementById('quickSupplierName').value = '';
            document.getElementById('quickSupplierContact').value = '';
            document.getElementById('quickSupplierPhone').value = '';
            document.getElementById('quickSupplierAddress').value = '';
            document.getElementById('quickAddSupplierModal').classList.add('show');
        }

        function saveQuickSupplier() {
            const name = document.getElementById('quickSupplierName').value.trim();
            const contact = document.getElementById('quickSupplierContact').value.trim();
            const phone = document.getElementById('quickSupplierPhone').value.trim();
            const address = document.getElementById('quickSupplierAddress').value.trim();

            if (!name) {
                showToast('⚠️ Supplier Name is required');
                return;
            }

            const newId = generateId();
            if (!data.supplierLedger) data.supplierLedger = [];
            data.supplierLedger.push({
                id: newId,
                name: name,
                contact: contact,
                phone: phone,
                address: address,
                balance: 0
            });

            saveData();
            document.getElementById('quickAddSupplierModal').classList.remove('show');
            renderGRN();
            showToast('✅ Supplier added successfully!');
        }
    `;
}

function upgradeWorkspace(config) {
    const { clientId, businessName, authStorageKey } = config;
    const clientPath = path.join(ROOT_DIR, 'public/clients', clientId, 'index.html');

    console.log(`\n==========================================================`);
    console.log(`🚀 Master Upgrading: [${clientId}] (${businessName})`);
    console.log(`==========================================================`);

    // Clean restore from earliest pristine backup
    const cleanBackup = path.join(ROOT_DIR, 'public/clients', clientId, 'backups/index.backup_2026-08-29_21-10-32.html');
    if (fs.existsSync(cleanBackup)) {
        fs.copyFileSync(cleanBackup, clientPath);
        console.log(`Restored clean base from backup: ${cleanBackup}`);
    }

    let html = fs.readFileSync(clientPath, 'utf8');

    // 0. Inject Instant Anti-Flicker Auth Guard into <head>
    const headAntiFlickerScript = `
    <!-- Zero-Flash Instant Auth Guard -->
    <script>
        (function() {
            var k = '${authStorageKey}';
            if (localStorage.getItem(k) === 'true' || sessionStorage.getItem(k) === 'true') {
                document.documentElement.classList.add('auth-active');
            }
        })();
    </script>`;

    if (html.includes('<head>') && !html.includes('Zero-Flash Instant Auth Guard')) {
        html = html.replace('<head>', '<head>' + headAntiFlickerScript);
        console.log('✅ Injected Zero-Flash Instant Auth Guard in <head>');
    }

    // 1. Inject Master Pos CSS
    const printStyleAnchor = '/* ===== PRINT STYLES ===== */';
    if (!html.includes('WORLD-CLASS ENTERPRISE POS & ORDER STUDIO CSS') && html.includes(printStyleAnchor)) {
        html = html.replace(printStyleAnchor, getMasterCSS() + '\n\n        ' + printStyleAnchor);
        console.log('✅ Injected Master POS & GRN CSS');
    }

    // 2. Reorder OPERATIONS Sidebar Navigation Menu
    const oldOperationsNavRegex = /<div class="sidebar-section-title">OPERATIONS<\/div>[\s\S]*?<div class="sidebar-section-title">PROMOTIONS & RETURNS<\/div>/;
    const newOperationsNav = `<div class="sidebar-section-title">OPERATIONS</div>
        <a class="sidebar-item" data-page="new-order" onclick="navigateTo('new-order')">
            <i class="fas fa-cart-plus"></i> <span>New Sales Order</span>
        </a>
        <a class="sidebar-item" data-page="orders" onclick="navigateTo('orders')">
            <i class="fas fa-receipt"></i> <span>All Orders</span>
            <span class="count" id="sideOrderCount">0</span>
        </a>
        <a class="sidebar-item" data-page="products" onclick="navigateTo('products')">
            <i class="fas fa-boxes-stacked"></i> <span>Products</span>
            <span class="count" id="sideProdCount">0</span>
        </a>
        <a class="sidebar-item" data-page="shops" onclick="navigateTo('shops')">
            <i class="fas fa-store"></i> <span>Shops</span>
            <span class="count" id="sideShopCount">0</span>
        </a>
        <a class="sidebar-item" data-page="grn" onclick="navigateTo('grn')">
            <i class="fas fa-truck-ramp-box"></i> <span>GRN / Purchases</span>
        </a>
        <a class="sidebar-item" data-page="staff-salary" onclick="navigateTo('staff-salary')">
            <i class="fas fa-users-cog"></i> <span>Staff Salary</span>
        </a>
        <a class="sidebar-item" data-page="reps" onclick="navigateTo('reps')">
            <i class="fas fa-users"></i> <span>Sales Reps</span>
            <span class="count" id="sideRepCount">0</span>
        </a>

        <div class="sidebar-section-title">PROMOTIONS & RETURNS</div>`;

    if (oldOperationsNavRegex.test(html)) {
        html = html.replace(oldOperationsNavRegex, newOperationsNav);
        console.log('✅ Reordered Operations Sidebar Menu');
    }

    // 3. Replace #page-new-order HTML
    const newOrderRegex = /<!-- =+ -->\s*<!--\s*(?:1|3)\.\s*NEW[\s\S]*?<!-- =+ -->\s*<!--\s*4\.\s*PRODUCTS PAGE/i;
    const newOrderReplacement = getRedesignedNewOrderHTML(config) + '\n\n        <!-- ============================================================ -->\n        <!--  4. PRODUCTS PAGE';
    if (newOrderRegex.test(html)) {
        html = html.replace(newOrderRegex, newOrderReplacement);
        console.log('✅ Injected Redesigned #page-new-order HTML (with Today Orders)');
    }

    // 4. Replace #page-grn HTML
    const grnRegex = /<!-- =+ -->\s*<!--\s*5\.\s*GRN[\s\S]*?<!-- =+ -->\s*<!--\s*6\.\s*SHOPS PAGE/i;
    const grnReplacement = getGRNHTML(config) + '\n\n        <!-- ============================================================ -->\n        <!--  6. SHOPS PAGE';
    if (grnRegex.test(html)) {
        html = html.replace(grnRegex, grnReplacement);
        console.log('✅ Injected Redesigned #page-grn HTML');
    }

    // 5. Inject Modals before <!--  TOAST
    const modalsHTML = getEnterpriseModalsHTML();
    const existingModalsRegex = /<!-- =+ -->\s*<!--\s*ENTERPRISE MODALS[\s\S]*?<!--\s*TOAST/i;
    if (existingModalsRegex.test(html)) {
        html = html.replace(existingModalsRegex, modalsHTML + '\n\n    <!--  TOAST');
        console.log('✅ Updated Enterprise Modals');
    } else if (html.includes('<!--  TOAST')) {
        html = html.replace('<!--  TOAST', modalsHTML + '\n\n    <!--  TOAST');
        console.log('✅ Injected Enterprise Modals before TOAST');
    }

    // 6. Replace JavaScript
    const oldNewOrderJSRegex = /\/\/\s*={10,}\s*\/\/\s*(?:NEW ORDER|ENTERPRISE SALES ORDER)[\s\S]*?\/\/\s*={10,}\s*\/\/\s*PRODUCTS PAGE/i;
    const newOrderJSReplacement = getUpgradeJS(config) + '\n\n        // ================================================================\n        //  PRODUCTS PAGE';
    
    if (oldNewOrderJSRegex.test(html)) {
        html = html.replace(oldNewOrderJSRegex, newOrderJSReplacement);
        console.log('✅ Injected Master JS Engine');
    }

    const oldGRNJSRegex = /\/\/\s*={10,}\s*\/\/\s*GRN PAGE[\s\S]*?\/\/\s*={10,}\s*\/\/\s*SETTINGS PAGE/i;
    if (oldGRNJSRegex.test(html)) {
        html = html.replace(oldGRNJSRegex, '// ================================================================\n        //  SETTINGS PAGE');
        console.log('✅ Cleaned up old basic GRN routines');
    }

    fs.writeFileSync(clientPath, html, 'utf8');
    console.log(`🎉 Client [${clientId}] upgraded successfully!`);
}

// Execute on both clients
CLIENTS.forEach(clientConfig => {
    upgradeWorkspace(clientConfig);
});

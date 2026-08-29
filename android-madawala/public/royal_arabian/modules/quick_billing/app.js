/**
 * DIGIBIZ — Quick Billing Terminal Engine (Progressive Step-by-Step Mobile Edition)
 * Multilingual (English / සිංහල / தமிழ்), Live Online/Offline Status, Instant Autocomplete, Direct Quantity Typing, Bluetooth ESC/POS & WhatsApp Receipts
 */

window.__dgDiagnostics = window.__dgDiagnostics || {};

let appCtx = null;
let currentBusinessData = null;
let currentLang = localStorage.getItem('preferredLanguage') || 'en';
let allCustomers = [];
let allCatalogItems = [];
let cart = [];
let allBillsHistory = [];
let currentReceiptData = null;
let activeOrderForReceipt = null;
let activeReceiptCopyTab = 'CUSTOMER';
let selectedPaymentMode = 'CASH';
let bluetoothDevice = null;
function debugLog(msg) {
    console.log(`[QuickBilling] ${msg}`);
}
window.debugLog = debugLog;

function isRoyalArabianUser() {
    const email = (appCtx && appCtx.userEmail) || localStorage.getItem('digibiz_qb_email') || '';
    const bid = (appCtx && appCtx.businessId) || localStorage.getItem('currentBusinessId') || '';
    const bName = (appCtx && (appCtx.businessName || appCtx.name)) || localStorage.getItem('digibiz_qb_biz_name') || '';
    const pathname = (window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
    return email.toLowerCase() === 'asminmoho1998@gmail.com' ||
           bid === 'TuyqnDOCjadkMJY2hGu7Iz7Ezm93' ||
           bName.toLowerCase().includes('royal arabian') ||
           pathname.includes('royal_arabian');
}
window.isRoyalArabianUser = isRoyalArabianUser;

function applyClientSpecificCustomizations() {
    if (isRoyalArabianUser()) {
        // For Royal Arabian Restaurant (asminmoho1998@gmail.com): CASH ONLY
        document.querySelectorAll('.pay-chip').forEach(chip => {
            const mode = chip.getAttribute('data-mode');
            if (mode !== 'CASH') {
                chip.style.setProperty('display', 'none', 'important');
            } else {
                chip.style.setProperty('display', 'flex', 'important');
                chip.style.setProperty('flex', '1', 'important');
                chip.style.setProperty('justify-content', 'center', 'important');
                chip.classList.add('active');
            }
        });
        const creditBox = document.getElementById('creditDueBox');
        if (creditBox) creditBox.style.setProperty('display', 'none', 'important');

        selectedPaymentMode = 'CASH';
        const paySummary = document.getElementById('payStepSummary');
        if (paySummary) paySummary.textContent = 'CASH';
    }
}
window.applyClientSpecificCustomizations = applyClientSpecificCustomizations;

function escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

const I18N_QUICK_BILLING = {
    en: {
        terminalHeader: "⚡ Fast Billing Terminal",
        // Step 1: Customer
        step1Title: "CUSTOMER",
        guestCustomer: "🛍️ Guest / Walk-in Customer",
        btnNew: "➕ New",
        custSummaryGuest: "Guest",
        custPhone: "Phone",
        custArea: "Area",
        custBal: "Balance",
        // Step 2: Items
        step2Title: "ITEMS (Add Products)",
        itemSearchPh: "Item name (Type or select)...",
        itemPricePh: "Price (Rs.)",
        btnAdd: "➕ Add",
        itemsStepSummaryZero: "0 items",
        emptyCartNotice: "Cart is empty. Add products above.",
        // Step 3: Payment
        step3Title: "PAYMENT METHOD",
        dueDateLabel: "📅 Payment Due Date:",
        dueDays7: "+7 Days",
        dueDays14: "+14 Days",
        dueDays30: "+30 Days",
        // Step 4: Totals
        step4Title: "BILL TOTALS & DISCOUNT",
        discountLabel: "Discount (Rs.)",
        cashReceivedLabel: "Cash Received (Rs.)",
        changeDueLabel: "Change Due:",
        subtotalLabel: "Subtotal:",
        discountSummaryLabel: "Discount:",
        netTotalLabel: "NET TOTAL:",
        btnCompleteBill: "✅ COMPLETE BILL & PRINT",
        // Receipt Modal
        invoiceTitle: "INVOICE",
        customerLabel: "CUSTOMER:",
        phoneLabel: "Phone:",
        dueDateRecLabel: "Due Date:",
        colItem: "Item",
        colQty: "Qty",
        colPrice: "Price",
        colTotal: "Total",
        paymentLabel: "Payment:",
        statusLabel: "Status:",
        statusPaid: "PAID",
        statusDue: "DUE / UNPAID",
        thankYouMsg: "Thank you for your business!",
        btnPrintBt: "🖨️ PRINT (Bluetooth)",
        btnPrintBrowser: "📄 PRINT (Browser)",
        btnWhatsapp: "📲 WhatsApp",
        btnSaveImage: "🖼️ Save Image",
        btnDone: "✅ Done / New Bill",
        // Catalog Modal
        catalogTitle: "📦 Manage Products & Pricing",
        newProductHeading: "➕ Add New Product",
        newProductNamePh: "Item Name *",
        newProductPricePh: "Price (LKR) *",
        btnSaveItem: "💾 Save Item",
        catalogSearchPh: "Search catalog items...",
        emptyCatalogMsg: "No catalog items saved yet.",
        // Customer Modal
        customerModalTitle: "👥 Customer Directory",
        newCustomerHeading: "➕ Add New Customer",
        custNamePh: "Customer Name *",
        custPhonePh: "Phone Number *",
        custAreaPh: "Area / City (Optional)",
        btnSaveCustomer: "💾 Save Customer",
        customerSearchPh: "Search customer name or phone...",
        emptyCustMsg: "No registered customers yet.",
        // History Modal
        historyModalTitle: "📜 Bills History & Revenue",
        historySearchPh: "Search Customer / Bill #...",
        totalBillsLabel: "Total Bills:",
        revenueLabel: "Revenue:"
    },
    si: {
        terminalHeader: "⚡ ක්ෂණික බිල්පත් පර්යන්තය",
        // Step 1: Customer
        step1Title: "පාරිභෝගිකයා (CUSTOMER)",
        guestCustomer: "🛍️ සාමාන්‍ය පාරිභෝගිකයා (Guest)",
        btnNew: "➕ අලුත්",
        custSummaryGuest: "සාමාන්‍ය",
        custPhone: "දුරකථන",
        custArea: "ප්‍රදේශය",
        custBal: "ණය ශේෂය",
        // Step 2: Items
        step2Title: "භාණ්ඩ එකතු කිරීම (ITEMS)",
        itemSearchPh: "භාණ්ඩයේ නම (Type කරන්න)...",
        itemPricePh: "මිල (රු.)",
        btnAdd: "➕ එකතු කරන්න",
        itemsStepSummaryZero: "අයිතම 0",
        emptyCartNotice: "බිල්පත හිස්ය. ඉහළින් අයිතම එකතු කරන්න.",
        // Step 3: Payment
        step3Title: "ගෙවීම් ක්‍රමය (PAYMENT METHOD)",
        dueDateLabel: "📅 මුදල් ගෙවන දිනය (Due Date):",
        dueDays7: "+දින 7",
        dueDays14: "+දින 14",
        dueDays30: "+දින 30",
        // Step 4: Totals
        step4Title: "මුළු එකතුව සහ වට්ටම් (TOTALS)",
        discountLabel: "වට්ටම් (රු.)",
        cashReceivedLabel: "ලැබුණු මුදල (රු.)",
        changeDueLabel: "ඉතිරි මුදල:",
        subtotalLabel: "එකතුව:",
        discountSummaryLabel: "වට්ටම:",
        netTotalLabel: "ශුද්ධ එකතුව:",
        btnCompleteBill: "✅ බිල්පත නිකුත් කරන්න & මුද්‍රණය",
        // Receipt Modal
        invoiceTitle: "බිල්පත (INVOICE)",
        customerLabel: "පාරිභෝගිකයා:",
        phoneLabel: "දුරකථන:",
        dueDateRecLabel: "ගෙවිය යුතු දිනය:",
        colItem: "අයිතමය",
        colQty: "ප්‍රමාණය",
        colPrice: "මිල",
        colTotal: "එකතුව",
        paymentLabel: "ගෙවීම් මාධ්‍යය:",
        statusLabel: "තත්ත්වය:",
        statusPaid: "ගෙවා ඇත",
        statusDue: "ණය මුදලක්",
        thankYouMsg: "ඔබගේ ගනුදෙනුවට ස්තූතියි! නැවත එන්න!",
        btnPrintBt: "🖨️ මුද්‍රණය (Bluetooth)",
        btnPrintBrowser: "📄 මුද්‍රණය (Browser)",
        btnWhatsapp: "📲 WhatsApp",
        btnSaveImage: "🖼️ Image එක ගන්න",
        btnDone: "✅ අවසන් / නව බිල්පත",
        // Catalog Modal
        catalogTitle: "📦 භාණ්ඩ සහ මිල කළමනාකරණය",
        newProductHeading: "➕ නව භාණ්ඩයක් එක් කරන්න",
        newProductNamePh: "භාණ්ඩයේ නම *",
        newProductPricePh: "මිල (රු.) *",
        btnSaveItem: "💾 සුරකින්න",
        catalogSearchPh: "භාණ්ඩ සොයන්න...",
        emptyCatalogMsg: "ගබඩා කළ භාණ්ඩ කිසිවක් නැත.",
        // Customer Modal
        customerModalTitle: "👥 පාරිභෝගික නාමාවලිය",
        newCustomerHeading: "➕ නව පාරිභෝගිකයෙකු ඇතුළත් කරන්න",
        custNamePh: "පාරිභෝගිකයාගේ නම *",
        custPhonePh: "දුරකථන අංකය *",
        custAreaPh: "ප්‍රදේශය / නගරය (විකල්ප)",
        btnSaveCustomer: "💾 සුරකින්න",
        customerSearchPh: "නම හෝ දුරකථන අංකයෙන් සොයන්න...",
        emptyCustMsg: "පාරිභෝගිකයින් කිසිවෙක් නැත.",
        // History Modal
        historyModalTitle: "📜 පෙර බිල්පත් සහ ආදායම",
        historySearchPh: "පාරිභෝගිකයා හෝ Bill # සොයන්න...",
        totalBillsLabel: "මුළු බිල්පත්:",
        revenueLabel: "ආදායම:"
    },
    ta: {
        terminalHeader: "⚡ விரைவு பில்லிங் முனையம்",
        // Step 1: Customer
        step1Title: "வாடிக்கையாளர் (CUSTOMER)",
        guestCustomer: "🛍️ சாதாரண வாடிக்கையாளர் (Guest)",
        btnNew: "➕ புதிய",
        custSummaryGuest: "சாதாரண",
        custPhone: "தொலைபேசி",
        custArea: "பகுதி",
        custBal: "நிலுவை",
        // Step 2: Items
        step2Title: "பொருட்கள் சேர்த்தல் (ITEMS)",
        itemSearchPh: "பொருளின் பெயர்...",
        itemPricePh: "விலை (ரூ.)",
        btnAdd: "➕ சேர்",
        itemsStepSummaryZero: "0 பொருட்கள்",
        emptyCartNotice: "விற்பனை பட்டியல் காலியாக உள்ளது.",
        // Step 3: Payment
        step3Title: "செலுத்தும் முறை (PAYMENT)",
        dueDateLabel: "📅 செலுத்த வேண்டிய தேதி:",
        dueDays7: "+7 நாட்கள்",
        dueDays14: "+14 நாட்கள்",
        dueDays30: "+30 நாட்கள்",
        // Step 4: Totals
        step4Title: "மொத்தத் தொகை மற்றும் தள்ளுபடி",
        discountLabel: "தள்ளுபடி (ரூ.)",
        cashReceivedLabel: "பெறப்பட்ட பணம் (ரூ.)",
        changeDueLabel: "மீதி தொகை:",
        subtotalLabel: "கூட்டுத்தொகை:",
        discountSummaryLabel: "தள்ளுபடி:",
        netTotalLabel: "மொத்தத் தொகை:",
        btnCompleteBill: "✅ பில் உறுதி & அச்சிடுக",
        // Receipt Modal
        invoiceTitle: "விலைப்பட்டியல் (INVOICE)",
        customerLabel: "வாடிக்கையாளர்:",
        phoneLabel: "தொலைபேசி:",
        dueDateRecLabel: "செலுத்த வேண்டிய தேதி:",
        colItem: "பொருள்",
        colQty: "அளவு",
        colPrice: "விலை",
        colTotal: "மொத்தம்",
        paymentLabel: "செலுத்தும் முறை:",
        statusLabel: "நிலை:",
        statusPaid: "செலுத்தப்பட்டது",
        statusDue: "நிலுவைத் தொகை",
        thankYouMsg: "உங்கள் வருகைக்கு மிக்க நன்றி!",
        btnPrintBt: "🖨️ அச்சிடுக (Bluetooth)",
        btnPrintBrowser: "📄 அச்சிடுக (Browser)",
        btnWhatsapp: "📲 WhatsApp",
        btnSaveImage: "🖼️ படம் சேமி",
        btnDone: "✅ முடிந்தது / புதிய பில்",
        // Catalog Modal
        catalogTitle: "📦 பொருட்கள் & விலை மேலாண்மை",
        newProductHeading: "➕ புதிய பொருள் சேர்க்க",
        newProductNamePh: "பொருள் பெயர் *",
        newProductPricePh: "விலை (ரூ.) *",
        btnSaveItem: "💾 சேமி",
        catalogSearchPh: "பொருட்களைத் தேடுக...",
        emptyCatalogMsg: "பொருட்கள் எதுவும் சேமிக்கப்படவில்லை.",
        // Customer Modal
        customerModalTitle: "👥 வாடிக்கையாளர் பட்டியல்",
        newCustomerHeading: "➕ புதிய வாடிக்கையாளர்",
        custNamePh: "வாடிக்கையாளர் பெயர் *",
        custPhonePh: "தொலைபேசி எண் *",
        custAreaPh: "பகுதி / நகரம்",
        btnSaveCustomer: "💾 சேமி",
        customerSearchPh: "பெயர் அல்லது தொலைபேசியில் தேடுக...",
        emptyCustMsg: "வாடிக்கையாளர்கள் இல்லை.",
        // History Modal
        historyModalTitle: "📜 பில் வரலாறு & வருமானம்",
        historySearchPh: "பில் அல்லது வாடிக்கையாளரை தேடுக...",
        totalBillsLabel: "மொத்த பில்கள்:",
        revenueLabel: "வருமானம்:"
    }
};

function setLanguage(lang) {
    if (!I18N_QUICK_BILLING[lang]) lang = 'en';
    currentLang = lang;
    try { localStorage.setItem('preferredLanguage', lang); } catch (e) {}

    document.querySelectorAll('.btn-lang').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-lang') === lang);
    });

    const t = I18N_QUICK_BILLING[lang];
    if (!t) return;

    // Direct Element Text Updates
    const textMap = {
        'lblTerminalHeader': t.terminalHeader,
        'step1TitleText': t.step1Title,
        'step2TitleText': t.step2Title,
        'step3TitleText': t.step3Title,
        'step4TitleText': t.step4Title,
        'lblDueDate': t.dueDateLabel,
        'lblDiscount': t.discountLabel,
        'lblCashReceived': t.cashReceivedLabel,
        'lblChangeDue': t.changeDueLabel,
        'lblSubtotal': t.subtotalLabel,
        'lblDiscountSummary': t.discountSummaryLabel,
        'lblNetTotal': t.netTotalLabel,
        'emptyCartNotice': t.emptyCartNotice,
        'btnQuickCustomer': t.btnNew,
        'btnQuickNewProduct': t.btnNew,
        'btnDirectAdd': t.btnAdd,
        'btnSubmitOrder': t.btnCompleteBill,
        'recCustLabel': t.customerLabel,
        'recPhoneLabel': t.phoneLabel,
        'recDueLabel': t.dueDateRecLabel,
        'recColItem': t.colItem,
        'recColQty': t.colQty,
        'recColPrice': t.colPrice,
        'recColTotal': t.colTotal,
        'recTitleSubtotal': t.subtotalLabel,
        'recTitleDiscount': t.discountSummaryLabel,
        'recTitleNetTotal': t.netTotalLabel,
        'recPayLabel': t.paymentLabel,
        'recStatusLabel': t.statusLabel,
        'recThankYou': t.thankYouMsg,
        'btnPrintBluetooth': t.btnPrintBt,
        'btnPrintBrowser': t.btnPrintBrowser,
        'btnShareWhatsapp': t.btnWhatsapp,
        'btnDownloadImage': t.btnSaveImage
    };

    for (const id in textMap) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = textMap[id];
    }

    // Input Placeholders
    const phMap = {
        'itemNameInput': t.itemSearchPh,
        'itemPriceInput': t.itemPricePh,
        'catalogSearchInput': t.catalogSearchPh,
        'newCatName': t.newProductNamePh,
        'newCatPrice': t.newProductPricePh,
        'dirCustName': t.custNamePh,
        'dirCustPhone': t.custPhonePh,
        'dirCustArea': t.custAreaPh,
        'manageCustomerSearch': t.customerSearchPh,
        'historySearchInput': t.historySearchPh
    };

    for (const id in phMap) {
        const el = document.getElementById(id);
        if (el) el.placeholder = phMap[id];
    }

    // Due Presets
    const duePresets = document.querySelectorAll('.btn-due-preset');
    if (duePresets.length >= 3) {
        duePresets[0].textContent = t.dueDays7;
        duePresets[1].textContent = t.dueDays14;
        duePresets[2].textContent = t.dueDays30;
    }

    // Modal Titles & Buttons
    const catTitle = document.querySelector('#catalogModal .modal-header span');
    if (catTitle) catTitle.textContent = t.catalogTitle;
    const btnSaveCat = document.querySelector('#catalogModal button[onclick="handleSaveNewCatalogItem()"]');
    if (btnSaveCat) btnSaveCat.innerHTML = t.btnSaveItem;

    const custModalTitle = document.querySelector('#customerDirectoryModal .modal-header span');
    if (custModalTitle) custModalTitle.textContent = t.customerModalTitle;
    const btnSaveCust = document.querySelector('#customerDirectoryModal button[onclick="handleSaveDirectoryCustomer()"]');
    if (btnSaveCust) btnSaveCust.innerHTML = t.btnSaveCustomer;

    const histModalTitle = document.querySelector('#historyModal .modal-header span');
    if (histModalTitle) histModalTitle.textContent = t.historyModalTitle;

    renderCustomerDropdown();
    renderCartList();
}

window.setLanguage = setLanguage;

window.addEventListener('digibiz:languageChanged', (e) => {
    if (e && e.detail && e.detail.lang) {
        setLanguage(e.detail.lang);
    }
});

function getScopedKey(name) {
    const bid = appCtx && appCtx.businessId ? appCtx.businessId : (localStorage.getItem('currentBusinessId') || 'local');
    return `digibiz_qb_${bid}_${name}`;
}

// --- INITIALIZATION ---
async function initApp() {
    addDiagLog('initApp starting with instant catalog bootstrap...');

    // 1. Resolve business ID immediately from all sources
    const resolvedBid = localStorage.getItem('businessId')
        || localStorage.getItem('currentBusinessId')
        || localStorage.getItem('activeBusinessId')
        || localStorage.getItem('digibiz_business_id')
        || localStorage.getItem('digibiz_qb_uid')
        || 'TuyqnDOCjadkMJY2hGu7Iz7Ezm93';

    const resolvedBizName = localStorage.getItem('digibiz_qb_biz_name')
        || localStorage.getItem('businessName')
        || localStorage.getItem('currentBusinessName')
        || 'Royal Arabian Restaurant';

    if (!appCtx) {
        appCtx = {
            userId: localStorage.getItem('digibiz_qb_uid') || 'TuyqnDOCjadkMJY2hGu7Iz7Ezm93',
            businessId: resolvedBid,
            businessName: resolvedBizName,
            userEmail: localStorage.getItem('digibiz_qb_email') || 'asminmoho1998@gmail.com'
        };
    }

    // Wire Language Switcher Buttons (if any exist)
    document.querySelectorAll('.btn-lang').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = btn.getAttribute('data-lang');
            setLanguage(lang);
        });
    });

    setLanguage(currentLang);
    setupConnectivityListener();

    // Instant local load: ensures products & autocomplete work in 0ms!
    loadCachedData();
    setupEvents();
    setupAutocomplete();
    setupCreditDueDatePresets();
    startNewBill();
    checkUrlViewParam();
    updateCatalogBadgeCount();
    applyClientSpecificCustomizations();

    window.addEventListener('pageshow', () => {
        if (!cart.length) startNewBill();
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && !cart.length) {
            startNewBill();
        }
    });

    // Background asynchronous cloud sync without blocking the UI
    loadInitialData().then(() => {
        updateCatalogBadgeCount();
    });

    guardAppSession().then(ctx => {
        if (ctx) {
            appCtx = ctx;
            loadInitialData();
        }
    });

    addDiagLog(`initApp completed! Active items in memory: ${allCatalogItems.length}`);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// --- CONNECTIVITY STATUS ---
function setupConnectivityListener() {
    const updateStatus = () => {
        const isOnline = navigator.onLine;
        const pill = document.getElementById('connectionPill');
        const dot = document.getElementById('connectionDot');
        const text = document.getElementById('connectionText');

        if (pill && dot && text) {
            if (isOnline) {
                pill.className = 'connection-pill online';
                dot.className = 'status-dot online';
                dot.style.background = '#10b981';
                text.textContent = 'ONLINE';
            } else {
                pill.className = 'connection-pill offline';
                dot.className = 'status-dot offline';
                dot.style.background = '#ef4444';
                text.textContent = 'OFFLINE';
            }
        }

        if (isOnline) {
            processPendingSyncQueue();
        }
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    updateStatus();
}

function checkUrlViewParam() {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'history') {
        setTimeout(openBillHistoryModal, 400);
    } else if (view === 'products' || view === 'catalog') {
        setTimeout(openCatalogModal, 400);
    } else if (view === 'customers') {
        setTimeout(openCustomerDirectoryModal, 400);
    } else if (view === 'credit') {
        window.location.href = 'credit.html';
    }
}

async function handleBillLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const em = document.getElementById('loginEmailInput').value.trim();
    const pw = document.getElementById('loginPasswordInput').value;
    const errEl = document.getElementById('loginErrorMsg');
    const submitBtn = document.getElementById('btnBillLoginSubmit');

    if (!em || !pw) {
        if (errEl) errEl.textContent = 'Please enter email and password.';
        return;
    }

    try {
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '⏳ LOGGING IN...';
        }
        if (errEl) errEl.textContent = '';
        await firebase.auth().signInWithEmailAndPassword(em, pw);
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        window.location.reload();
    } catch (err) {
        if (errEl) errEl.textContent = 'Login Error: ' + err.message;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '🔐 LOGIN (ඇතුල් වන්න)';
        }
    }
}

async function executeSignOut() {
    if (navigator.onLine === false) {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'warning',
                title: 'Offline Warning (අවවාදයයි)',
                text: 'Offline තත්ත්වයේදී Log Out විය නොහැක! අන්තර්ජාලය (Internet Signal) නොමැතිව Log Out වුවහොත් නැවත Login වීමට නොහැකි වනු ඇත. කරුණාකර අන්තර්ජාලය සම්බන්ධ වන තෙක් රැඳෙන්න.',
                confirmButtonColor: '#047857'
            });
        } else {
            alert('⚠️ Cannot log out while offline! Internet connection is required to safely sign in again.');
        }
        return;
    }

    let confirmed = false;
    if (typeof Swal !== 'undefined') {
        const result = await Swal.fire({
            title: 'Sign Out? (ඉවත් වීමට අවශ්‍යද?)',
            text: 'ඔබට මෙම DIGIBIZ BILL ගිණුමෙන් Log Out වීමට අවශ්‍ය බව තහවුරු කරන්න.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#64748b',
            confirmButtonText: '🚪 Yes, Sign Out',
            cancelButtonText: 'Cancel'
        });
        confirmed = result.isConfirmed;
    } else {
        confirmed = confirm('Are you sure you want to sign out?');
    }

    if (!confirmed) return;

    localStorage.setItem('digibiz_qb_logged_out', 'true');
    Object.keys(localStorage).forEach(k => {
        if (k.startsWith('digibiz_qb_')) {
            localStorage.removeItem(k);
        }
    });
    localStorage.removeItem('currentBusinessId');
    sessionStorage.clear();

    const loginModal = document.getElementById('loginModal');
    if (loginModal) loginModal.style.display = 'flex';

    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().finally(() => {
            window.location.replace('/modules/quick_billing/app.html?showLogin=true');
        });
    } else {
        window.location.replace('/modules/quick_billing/app.html?showLogin=true');
    }
}
window.executeSignOut = executeSignOut;

function addDiagLog(msg) {
    console.log(`[QuickBilling] ${msg}`);
}

async function guardAppSession() {
    return new Promise((resolve) => {
        const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
        if (!auth) {
            addDiagLog('Firebase Auth not available on page');
            window.__dgDiagnostics.authStatus = 'NO_FIREBASE_AUTH';
            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'flex';
            return resolve(null);
        }

        let resolvedAlready = false;

        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                addDiagLog('onAuthStateChanged: No active Firebase Auth user');
                window.__dgDiagnostics.authStatus = 'UNAUTHENTICATED';
                const cachedUid = localStorage.getItem('digibiz_qb_uid');
                const cachedBid = localStorage.getItem('currentBusinessId') || cachedUid;

                if (cachedUid && cachedBid) {
                    const ctx = {
                        userId: cachedUid,
                        businessId: cachedBid,
                        businessName: localStorage.getItem('digibiz_qb_biz_name') || 'Business Store',
                        userEmail: localStorage.getItem('digibiz_qb_email') || ''
                    };
                    appCtx = ctx;
                    window.__dgDiagnostics.businessId = cachedBid;
                    window.__dgDiagnostics.businessName = ctx.businessName;
                    renderAppBranding(ctx);
                    addDiagLog(`Using cached session context for BID: ${cachedBid}`);
                    if (!resolvedAlready) {
                        resolvedAlready = true;
                        resolve(ctx);
                    }
                } else {
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) {
                        loginModal.style.display = 'flex';
                    } else {
                        window.location.href = '/auth/login.html?app=bill';
                    }
                    if (!resolvedAlready) {
                        resolvedAlready = true;
                        resolve(null);
                    }
                }
                return;
            }

            // Authenticated user detected!
            window.__dgDiagnostics.authStatus = 'AUTHENTICATED';
            window.__dgDiagnostics.user = { uid: user.uid, email: user.email };
            addDiagLog(`Authenticated as: ${user.email} (UID: ${user.uid})`);

            const loginModal = document.getElementById('loginModal');
            if (loginModal) loginModal.style.display = 'none';

            try {
                const db = window.firebase.firestore();
                const uDoc = await db.collection('users').doc(user.uid).get().catch((e) => {
                    addDiagLog(`User doc read notice: ${e.message}`);
                    return null;
                });
                const uData = uDoc && uDoc.exists ? uDoc.data() : {};
                const bid = uData.businessId || localStorage.getItem('currentBusinessId') || user.uid;

                const bDoc = await db.collection('businesses').doc(bid).get().catch(() => null);
                const bData = bDoc && bDoc.exists ? bDoc.data() : {};

                const ctx = {
                    userId: user.uid,
                    businessId: bid,
                    businessName: bData.name || bData.businessName || uData.businessName || 'Business Store',
                    address: bData.address || '',
                    phone: bData.phone || '',
                    userEmail: user.email
                };

                appCtx = ctx;
                window.__dgDiagnostics.businessId = bid;
                window.__dgDiagnostics.businessName = ctx.businessName;

                localStorage.setItem('digibiz_qb_uid', user.uid);
                localStorage.setItem('currentBusinessId', bid);
                localStorage.setItem('digibiz_qb_biz_name', ctx.businessName);
                localStorage.setItem('digibiz_qb_email', ctx.userEmail);
                localStorage.setItem('digibiz_qb_phone', ctx.phone);
                localStorage.setItem('digibiz_qb_address', ctx.address);

                renderAppBranding(ctx);
                addDiagLog(`Session ready! BID: ${bid} (${ctx.businessName})`);

                // Always fetch fresh remote catalog upon auth confirmation
                fetchRemoteCatalog();
                fetchRemoteCustomers();
                fetchRemoteBillsHistory();

                if (!resolvedAlready) {
                    resolvedAlready = true;
                    resolve(ctx);
                }
            } catch (err) {
                console.warn('[QuickBilling] Context load notice:', err);
                addDiagLog(`Context resolution err: ${err.message}`);
                window.__dgDiagnostics.lastError = err.message;
                const ctx = {
                    userId: user.uid,
                    businessId: user.uid,
                    businessName: 'Business Store',
                    userEmail: user.email
                };
                appCtx = ctx;
                renderAppBranding(ctx);
                if (!resolvedAlready) {
                    resolvedAlready = true;
                    resolve(ctx);
                }
            }
        });
    });
}

function renderAppBranding(ctx) {
    const hdrName = document.getElementById('hdrBizName');
    if (hdrName) hdrName.textContent = ctx.businessName || 'DIGIBIZ POS';
    applyClientSpecificCustomizations();
}

// --- DATA LOADERS ---
async function loadInitialData() {
    loadCachedData();
    if (navigator.onLine && appCtx) {
        await Promise.all([
            fetchRemoteCustomers(),
            fetchRemoteCatalog(),
            fetchRemoteBillsHistory()
        ]);
    }
}

function loadCachedData() {
    try {
        const rawCust = localStorage.getItem(getScopedKey('customers')) || localStorage.getItem('digibiz_qb_customers');
        allCustomers = rawCust ? JSON.parse(rawCust) : [];

        const rawCat = localStorage.getItem(getScopedKey('catalog')) || localStorage.getItem('digibiz_qb_catalog');
        allCatalogItems = rawCat ? JSON.parse(rawCat) : [];

        // If catalog memory is empty, auto-seed with standard items so the user is NEVER blocked!
        if (!allCatalogItems || allCatalogItems.length === 0) {
            allCatalogItems = [
                { id: 'ITEM_BIRIYANI_500', name: 'Biriyani', price: 500, unitPrice: 500, stock: 999, isActive: true },
                { id: 'ITEM_BUN_100', name: 'Bun', price: 100, unitPrice: 100, stock: 999, isActive: true }
            ];
            try {
                localStorage.setItem(getScopedKey('catalog'), JSON.stringify(allCatalogItems));
                localStorage.setItem('digibiz_qb_catalog', JSON.stringify(allCatalogItems));
            } catch(e) {}
        }

        const rawBills = localStorage.getItem(getScopedKey('bills')) || localStorage.getItem('digibiz_qb_bills');
        allBillsHistory = rawBills ? JSON.parse(rawBills) : [];

        renderCustomerDropdown();
        renderCartList();
        updateCatalogBadgeCount();
    } catch (e) {
        console.warn('Cached data notice:', e);
        if (!allCatalogItems || allCatalogItems.length === 0) {
            allCatalogItems = [
                { id: 'ITEM_BIRIYANI_500', name: 'Biriyani', price: 500, unitPrice: 500, stock: 999, isActive: true },
                { id: 'ITEM_BUN_100', name: 'Bun', price: 100, unitPrice: 100, stock: 999, isActive: true }
            ];
        }
        updateCatalogBadgeCount();
    }
}

function mergeCatalogLists(localList, remoteList) {
    if (!remoteList || !remoteList.length) {
        return (localList || []).filter(i => i && i.name && i.name.trim().length > 0 && i.isActive !== false);
    }

    const map = new Map();

    // 1. Remote items (authoritative)
    remoteList.forEach(item => {
        if (item && item.name && item.name.trim().length > 0 && item.name !== 'Item' && item.isActive !== false) {
            const key = item.name.trim().toLowerCase();
            map.set(key, {
                id: item.id || `qb_prod_${Date.now()}`,
                name: item.name.trim(),
                price: Number(item.price != null ? item.price : (item.unitPrice != null ? item.unitPrice : 0)),
                unit: item.unit || '',
                stock: item.stock != null ? item.stock : 999,
                isActive: true
            });
        }
    });

    // 2. Only preserve pending offline items
    try {
        const raw = localStorage.getItem('digibiz_qb_pending_products');
        if (raw) {
            const queue = JSON.parse(raw);
            queue.forEach(item => {
                if (item && item.name && item.name.trim().length > 0 && item.isActive !== false) {
                    const key = item.name.trim().toLowerCase();
                    if (!map.has(key)) {
                        map.set(key, item);
                        if (navigator.onLine) {
                            saveProductToRemote(item);
                        }
                    }
                }
            });
        }
    } catch(e) {}

    return Array.from(map.values());
}

function queueProductOfflineSync(item, bid) {
    try {
        let queue = [];
        const raw = localStorage.getItem('digibiz_qb_pending_products');
        if (raw) queue = JSON.parse(raw);
        const filtered = queue.filter(q => q.id !== item.id && q.name.toLowerCase() !== item.name.toLowerCase());
        filtered.push({ ...item, businessId: bid, queuedAt: Date.now() });
        localStorage.setItem('digibiz_qb_pending_products', JSON.stringify(filtered));
    } catch(e) {}
}

function removeFromPendingProductsQueue(itemId) {
    try {
        const raw = localStorage.getItem('digibiz_qb_pending_products');
        if (!raw) return;
        const queue = JSON.parse(raw);
        const filtered = queue.filter(q => q.id !== itemId);
        localStorage.setItem('digibiz_qb_pending_products', JSON.stringify(filtered));
    } catch(e) {}
}

async function processPendingProductsQueue() {
    if (!navigator.onLine || !window.firebase || !window.firebase.firestore) return;
    try {
        const raw = localStorage.getItem('digibiz_qb_pending_products');
        if (!raw) return;
        const queue = JSON.parse(raw);
        if (!queue || !queue.length) return;

        const db = window.firebase.firestore();
        const remaining = [];

        for (const p of queue) {
            const bid = p.businessId || (appCtx && appCtx.businessId) || localStorage.getItem('currentBusinessId');
            if (!bid) { remaining.push(p); continue; }
            try {
                await db.collection('products').doc(bid).collection('list').doc(p.id).set({
                    id: p.id,
                    businessId: bid,
                    name: p.name,
                    price: Number(p.price) || 0,
                    unitPrice: Number(p.price) || 0,
                    stock: p.stock || 999,
                    unit: p.unit || '',
                    isActive: p.isActive !== false,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            } catch (err) {
                remaining.push(p);
            }
        }
        localStorage.setItem('digibiz_qb_pending_products', JSON.stringify(remaining));
    } catch (e) {
        console.warn('Process product queue notice:', e);
    }
}

async function saveProductToRemote(item) {
    const bid = (appCtx && appCtx.businessId) || localStorage.getItem('currentBusinessId') || (window.firebase && window.firebase.auth && window.firebase.auth().currentUser ? window.firebase.auth().currentUser.uid : null);
    if (!bid) return;

    queueProductOfflineSync(item, bid);

    if (navigator.onLine && window.firebase && window.firebase.firestore) {
        try {
            const db = window.firebase.firestore();
            await db.collection('products').doc(bid).collection('list').doc(item.id).set({
                id: item.id,
                businessId: bid,
                name: item.name,
                price: Number(item.price) || 0,
                unitPrice: Number(item.price) || 0,
                stock: item.stock || 999,
                unit: item.unit || '',
                isActive: item.isActive !== false,
                updatedAt: new Date().toISOString()
            }, { merge: true });
            removeFromPendingProductsQueue(item.id);
        } catch (e) {
            console.warn('[QuickBilling] Product queued for offline background sync:', e);
        }
    }
}

async function fetchRemoteCustomers() {
    if (!appCtx || !window.firebase) return;
    try {
        const db = window.firebase.firestore();
        const snap = await db.collection('customers').doc(appCtx.businessId).collection('list').get()
            .catch(() => db.collection('coconut_customers').where('businessId', '==', appCtx.businessId).get());

        if (snap && snap.docs) {
            allCustomers = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => c.isActive !== false);
        } else {
            allCustomers = [];
        }
        localStorage.setItem(getScopedKey('customers'), JSON.stringify(allCustomers));
        renderCustomerDropdown();
    } catch (e) { console.warn('Customers fetch notice:', e); }
}

function updateCatalogBadgeCount() {
    const summaryEl = document.getElementById('itemsStepSummary');
    if (!summaryEl) return;
    if (cart.length === 0) {
        const count = allCatalogItems.length;
        if (count === 0) {
            summaryEl.textContent = '📦 භාණ්ඩ වර්ග 0';
        } else {
            if (currentLang === 'si') {
                summaryEl.textContent = `📦 භාණ්ඩ වර්ග ${count}`;
            } else {
                summaryEl.textContent = `📦 ${count} Products`;
            }
        }
        summaryEl.style.background = '#f0fdf4';
        summaryEl.style.color = '#166534';
        summaryEl.style.fontWeight = '700';
        summaryEl.style.border = '1px solid #bbf7d0';
        summaryEl.style.padding = '3px 8px';
        summaryEl.style.borderRadius = '8px';
    }
}

async function fetchRemoteCatalog() {
    const bid = (appCtx && appCtx.businessId && appCtx.businessId !== 'local') ? appCtx.businessId : (localStorage.getItem('currentBusinessId') || localStorage.getItem('activeBusinessId'));
    if (!bid || bid === 'local') {
        addDiagLog('Cannot fetch catalog: Business ID is missing or local');
        return;
    }

    addDiagLog(`Querying Firestore collection: products/${bid}/list...`);
    window.__dgDiagnostics.firestoreStatus = `QUERYING products/${bid}/list`;

    try {
        processPendingProductsQueue();
        const db = window.firebase.firestore();

        // 1. Try subcollection products/{bid}/list
        let snap = await db.collection('products').doc(bid).collection('list').get().catch(err => {
            addDiagLog(`Subcollection fetch err: ${err.message}`);
            window.__dgDiagnostics.lastError = err.message;
            return null;
        });
        let loadedItems = [];

        if (snap && !snap.empty) {
            loadedItems = snap.docs.map(d => {
                const data = d.data() || {};
                return {
                    id: d.id,
                    name: data.name || data.productName || '',
                    price: Number(data.price != null ? data.price : (data.unitPrice != null ? data.unitPrice : data.sellingPrice || 0)),
                    unit: data.unit || '',
                    isActive: data.isActive !== false
                };
            }).filter(i => i.name && i.name.trim().length > 0 && i.name !== 'Item' && i.isActive !== false);
        }

        // 2. If subcollection returned 0, try root collection query
        if (loadedItems.length === 0) {
            const rootSnap = await db.collection('products').where('businessId', '==', bid).get().catch(() => null);
            if (rootSnap && !rootSnap.empty) {
                loadedItems = rootSnap.docs.map(d => {
                    const data = d.data() || {};
                    return {
                        id: d.id,
                        name: data.name || data.productName || '',
                        price: Number(data.price != null ? data.price : (data.unitPrice != null ? data.unitPrice : data.sellingPrice || 0)),
                        unit: data.unit || '',
                        isActive: data.isActive !== false
                    };
                }).filter(i => i.name && i.name.trim().length > 0 && i.name !== 'Item' && i.isActive !== false);
            }
        }

        window.__dgDiagnostics.lastRemoteCount = loadedItems.length;
        window.__dgDiagnostics.firestoreStatus = `SUCCESS (${loadedItems.length} items from Firestore)`;
        addDiagLog(`Firestore returned ${loadedItems.length} items: ${loadedItems.map(i => i.name).join(', ') || '(Empty/0)'}`);

        // 3. Merge local and remote so items never get overwritten or vanish
        allCatalogItems = mergeCatalogLists(allCatalogItems, loadedItems);
        localStorage.setItem(getScopedKey('catalog'), JSON.stringify(allCatalogItems));
        localStorage.setItem('digibiz_qb_catalog', JSON.stringify(allCatalogItems));

        updateCatalogBadgeCount();
        renderCartList();

        // 4. Attach REAL-TIME Listener so device 2 receives items instantly when device 1 adds/edits items!
        if (!window.__catalogListenerAttached) {
            window.__catalogListenerAttached = true;
            db.collection('products').doc(bid).collection('list').onSnapshot(liveSnap => {
                if (liveSnap && !liveSnap.empty) {
                    const remoteLive = liveSnap.docs.map(d => {
                        const data = d.data() || {};
                        return {
                            id: d.id,
                            name: data.name || data.productName || '',
                            price: Number(data.price != null ? data.price : (data.unitPrice != null ? data.unitPrice : data.sellingPrice || 0)),
                            unit: data.unit || '',
                            isActive: data.isActive !== false
                        };
                    }).filter(i => i.name && i.name.trim().length > 0 && i.name !== 'Item' && i.isActive !== false);

                    addDiagLog(`Realtime Snapshot: received ${remoteLive.length} items from cloud`);
                    allCatalogItems = mergeCatalogLists(allCatalogItems, remoteLive);
                    localStorage.setItem(getScopedKey('catalog'), JSON.stringify(allCatalogItems));
                    localStorage.setItem('digibiz_qb_catalog', JSON.stringify(allCatalogItems));
                    updateCatalogBadgeCount();
                    renderCartList();
                    if (document.getElementById('diagnosticModal')?.style.display === 'flex') {
                        renderDiagnosticsPanel();
                    }
                }
            }, err => {
                console.warn('Catalog live listener notice:', err);
                addDiagLog(`Snapshot listener notice: ${err.message}`);
            });
        }
    } catch (e) {
        console.warn('Catalog fetch notice:', e);
        addDiagLog(`Catalog fetch notice: ${e.message}`);
        window.__dgDiagnostics.lastError = e.message;
    }

    if (document.getElementById('diagnosticModal')?.style.display === 'flex') {
        renderDiagnosticsPanel();
    }
}

async function fetchRemoteBillsHistory() {
    if (!appCtx || !window.firebase) return;
    try {
        const db = window.firebase.firestore();
        const snap = await db.collection('orders').doc(appCtx.businessId).collection('list')
            .orderBy('createdAt', 'desc')
            .limit(50)
            .get();

        if (snap && snap.docs) {
            allBillsHistory = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
            allBillsHistory = [];
        }
        localStorage.setItem(getScopedKey('bills'), JSON.stringify(allBillsHistory));
    } catch (e) { console.warn('Bills history fetch notice:', e); }
}

// --- STEP ACCORDION CONTROL ---
function toggleStep(stepId) {
    const card = document.getElementById(stepId);
    if (!card) return;
    card.classList.toggle('collapsed');
}

function openStep(stepId) {
    const card = document.getElementById(stepId);
    if (card) card.classList.remove('collapsed');
}

function selectPaymentMode(mode) {
    if (isRoyalArabianUser()) {
        selectedPaymentMode = 'CASH';
    } else {
        selectedPaymentMode = mode || 'CASH';
    }

    document.querySelectorAll('.pay-chip').forEach(c => {
        if (c.getAttribute('data-mode') === selectedPaymentMode) {
            c.classList.add('active');
        } else {
            c.classList.remove('active');
        }
    });

    const cashBox = document.getElementById('cashReceivedBox');
    const changeBox = document.getElementById('changeDueContainer');
    const creditBox = document.getElementById('creditDueBox');
    const paySummary = document.getElementById('payStepSummary');

    if (paySummary) paySummary.textContent = selectedPaymentMode;

    if (selectedPaymentMode === 'CASH') {
        if (cashBox) cashBox.style.display = 'block';
        if (changeBox) changeBox.style.display = 'flex';
        if (creditBox) creditBox.classList.remove('open');
    } else if (selectedPaymentMode === 'CREDIT') {
        if (cashBox) cashBox.style.display = 'none';
        if (changeBox) changeBox.style.display = 'none';
        if (creditBox) {
            creditBox.classList.add('open');
            setCreditDueDateByDays(7);
        }
    } else {
        if (cashBox) cashBox.style.display = 'none';
        if (changeBox) changeBox.style.display = 'none';
        if (creditBox) creditBox.classList.remove('open');
    }

    applyClientSpecificCustomizations();
    calculateCartTotals();
}

// --- SETUP EVENTS ---
function setupEvents() {
    // Direct item add
    const btnDirect = document.getElementById('btnDirectAdd');
    if (btnDirect) btnDirect.onclick = handleAddDirectCustomItem;

    const itemName = document.getElementById('itemNameInput');
    if (itemName) {
        itemName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const priceInp = document.getElementById('itemPriceInput');
                if (priceInp && !priceInp.value) {
                    priceInp.focus();
                } else {
                    handleAddDirectCustomItem();
                }
            }
        });
    }

    const itemPrice = document.getElementById('itemPriceInput');
    if (itemPrice) {
        itemPrice.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAddDirectCustomItem();
        });
    }

    // Customer
    const custSelect = document.getElementById('customerSelect');
    if (custSelect) custSelect.onchange = handleCustomerChange;

    const btnQuickCust = document.getElementById('btnQuickCustomer');
    if (btnQuickCust) btnQuickCust.onclick = openNewCustomerModal;

    const newCustForm = document.getElementById('newCustomerForm');
    if (newCustForm) newCustForm.onsubmit = handleSaveNewCustomer;

    // Payment Mode Chips
    document.querySelectorAll('.pay-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            const mode = chip.getAttribute('data-mode') || 'CASH';
            selectPaymentMode(mode);
            openStep('stepTotalsCard');
        });
    });

    // Discount & Cash Tendered
    const discInput = document.getElementById('discountInput');
    if (discInput) discInput.addEventListener('input', calculateCartTotals);

    const cashInput = document.getElementById('cashReceivedInput');
    if (cashInput) cashInput.addEventListener('input', updateChangeDueCalculation);

    // Submit Bill
    const btnSubmit = document.getElementById('btnSubmitBill');
    if (btnSubmit) btnSubmit.onclick = handleSubmitBill;

    // Print & Share
    const btnPrint = document.getElementById('btnPrintBluetooth');
    if (btnPrint) btnPrint.onclick = handleBluetoothPrint;

    const btnPrintBrowser = document.getElementById('btnPrintBrowser');
    if (btnPrintBrowser) btnPrintBrowser.onclick = handleBrowserPrint;

    const btnWa = document.getElementById('btnShareWhatsapp');
    if (btnWa) btnWa.onclick = handleShareWhatsapp;

    const btnImg = document.getElementById('btnDownloadImage');
    if (btnImg) btnImg.onclick = handleDownloadReceiptImage;
}

// --- LIVE INSTANT AUTOCOMPLETE ---
function setupAutocomplete() {
    const input = document.getElementById('itemNameInput');
    const dropdown = document.getElementById('autocompleteDropdown');
    if (!input || !dropdown) return;

    const renderMatches = (query) => {
        let catalog = (allCatalogItems && allCatalogItems.length) ? allCatalogItems : [];
        if (!catalog.length) {
            try {
                const raw = localStorage.getItem(getScopedKey('catalog')) || localStorage.getItem('digibiz_qb_catalog');
                if (raw) catalog = JSON.parse(raw);
            } catch(e) {}
        }

        if (!catalog || !catalog.length) {
            dropdown.style.display = 'none';
            return;
        }

        let matches = [];
        if (!query) {
            matches = catalog.slice(0, 10);
        } else {
            const qLower = query.toLowerCase();
            matches = catalog.filter(item => {
                const name = String(item.name || '').toLowerCase();
                return name.includes(qLower);
            });
        }

        if (!matches.length) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = matches.slice(0, 10).map(item => `
            <div class="autocomplete-item" data-name="${escapeHtml(item.name)}" data-price="${item.price}">
                <span style="font-weight:700; font-size:13.5px; color:#0f172a;">${escapeHtml(item.name)}</span>
                <span style="font-weight:800; font-size:13px; color:#059669;">Rs. ${Number(item.price).toFixed(2)}</span>
            </div>
        `).join('');

        dropdown.style.display = 'block';

        dropdown.querySelectorAll('.autocomplete-item').forEach(itemEl => {
            itemEl.addEventListener('click', () => {
                const name = itemEl.getAttribute('data-name');
                const price = Number(itemEl.getAttribute('data-price')) || 0;

                input.value = name;
                document.getElementById('itemPriceInput').value = price;
                dropdown.style.display = 'none';
                document.getElementById('itemQtyInput').focus();
            });
        });
    };

    input.addEventListener('input', (e) => {
        renderMatches(e.target.value.trim());
    });

    input.addEventListener('focus', (e) => {
        renderMatches(e.target.value.trim());
    });

    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

function adjustDirectQty(delta) {
    const input = document.getElementById('itemQtyInput');
    if (!input) return;
    const current = Number(input.value) || 1;
    input.value = Math.max(1, current + delta);
}

// --- CREDIT DUE DATE PRESETS ---
function setupCreditDueDatePresets() {
    document.querySelectorAll('.btn-due-preset').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-due-preset').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const days = parseInt(btn.getAttribute('data-days')) || 7;
            setCreditDueDateByDays(days);
        });
    });
}

function setCreditDueDateByDays(days) {
    const dt = new Date();
    dt.setDate(dt.getDate() + days);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, '0');
    const dd = String(dt.getDate()).padStart(2, '0');
    const input = document.getElementById('creditDueDateInput');
    if (input) input.value = `${yyyy}-${mm}-${dd}`;

    const paySummary = document.getElementById('payStepSummary');
    if (paySummary) paySummary.textContent = `CREDIT (Due: ${yyyy}-${mm}-${dd})`;
}

// --- CUSTOMER MANAGEMENT ---
function renderCustomerDropdown() {
    const select = document.getElementById('customerSelect');
    if (!select) return;
    const curVal = select.value || 'GUEST';
    const t = I18N_QUICK_BILLING[currentLang] || I18N_QUICK_BILLING.en;

    select.innerHTML = `<option value="GUEST">${t.guestCustomer}</option>` +
        allCustomers.map(c => `<option value="${c.id}">${escapeHtml(c.name || 'Customer')} ${c.phone ? '(' + c.phone + ')' : ''}</option>`).join('');

    select.value = curVal;
    handleCustomerChange();
}

function handleCustomerChange() {
    const sel = document.getElementById('customerSelect');
    const val = sel ? sel.value : 'GUEST';
    const badge = document.getElementById('customerInfoBadge');
    const custSummary = document.getElementById('custStepSummary');
    const t = I18N_QUICK_BILLING[currentLang] || I18N_QUICK_BILLING.en;

    if (val === 'GUEST' || !val) {
        if (badge) badge.style.display = 'none';
        if (custSummary) custSummary.textContent = t.custSummaryGuest;
        return;
    }

    const c = allCustomers.find(x => x.id === val);
    if (c) {
        if (badge) badge.style.display = 'block';
        const pSpan = document.getElementById('custPhoneSpan');
        if (pSpan) pSpan.textContent = c.phone || 'No phone';
        const aSpan = document.getElementById('custAreaSpan');
        if (aSpan) aSpan.textContent = c.area || c.city || 'General';
        const bSpan = document.getElementById('custBalSpan');
        if (bSpan) bSpan.textContent = `Rs. ${(Number(c.balance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (custSummary) custSummary.textContent = c.name;

        // Auto open next step (Items)
        openStep('stepItemsCard');
        const itm = document.getElementById('itemNameInput');
        if (itm) itm.focus();
    } else {
        if (badge) badge.style.display = 'none';
        if (custSummary) custSummary.textContent = t.custSummaryGuest;
    }
}

function openNewCustomerModal() {
    document.getElementById('newCustomerForm').reset();
    document.getElementById('newCustomerModal').classList.add('open');
}

function closeNewCustomerModal() {
    document.getElementById('newCustomerModal').classList.remove('open');
}

async function handleSaveNewCustomer(e) {
    e.preventDefault();
    const name = document.getElementById('custNameInput').value.trim();
    const phone = document.getElementById('custPhoneInput').value.trim();
    const area = document.getElementById('custAreaInput').value.trim();

    if (!name) return;

    const newCust = {
        id: `CUST_${Date.now().toString().slice(-6)}`,
        name,
        phone,
        area,
        balance: 0,
        isActive: true,
        createdAt: new Date().toISOString()
    };

    allCustomers.unshift(newCust);
    localStorage.setItem(getScopedKey('customers'), JSON.stringify(allCustomers));
    renderCustomerDropdown();
    document.getElementById('customerSelect').value = newCust.id;
    handleCustomerChange();

    closeNewCustomerModal();

    if (navigator.onLine && window.firebase && appCtx) {
        try {
            const db = window.firebase.firestore();
            await db.collection('customers').doc(appCtx.businessId).collection('list').doc(newCust.id).set(newCust);
        } catch (err) { console.warn('Customer sync notice:', err); }
    }
}

// --- ITEM & CART LOGIC ---
function handleAddDirectCustomItem() {
    const nameInput = document.getElementById('itemNameInput');
    const priceInput = document.getElementById('itemPriceInput');
    const qtyInput = document.getElementById('itemQtyInput');

    const name = nameInput.value.trim();
    const price = Number(priceInput.value) || 0;
    const qty = Number(qtyInput.value) || 1;

    if (!name) {
        nameInput.focus();
        return;
    }

    addItemToCart(name, price, qty);

    // Auto-save item to catalog memory
    let existing = allCatalogItems.find(i => i.name && i.name.toLowerCase() === name.toLowerCase());
    if (!existing) {
        const newItem = {
            id: `qb_prod_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            name,
            price,
            unitPrice: price,
            stock: 999,
            isActive: true,
            createdAt: new Date().toISOString()
        };
        allCatalogItems.unshift(newItem);
        localStorage.setItem(getScopedKey('catalog'), JSON.stringify(allCatalogItems));
        localStorage.setItem('digibiz_qb_catalog', JSON.stringify(allCatalogItems));
        updateCatalogBadgeCount();
        saveProductToRemote(newItem);
    } else if (price > 0 && existing.price !== price) {
        existing.price = price;
        existing.unitPrice = price;
        localStorage.setItem(getScopedKey('catalog'), JSON.stringify(allCatalogItems));
        localStorage.setItem('digibiz_qb_catalog', JSON.stringify(allCatalogItems));
        saveProductToRemote(existing);
    }

    nameInput.value = '';
    priceInput.value = '';
    qtyInput.value = '1';
    nameInput.focus();

    // Auto open Payment & Totals steps
    openStep('stepPaymentCard');
    openStep('stepTotalsCard');
}

function addItemToCart(name, price, qty = 1) {
    const existing = cart.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            id: `CART_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            name,
            price: Number(price) || 0,
            quantity: Number(qty) || 1
        });
    }
    renderCartList();
    calculateCartTotals();
}

function renderCartList() {
    const container = document.getElementById('cartItemsList');
    const emptyNotice = document.getElementById('emptyCartNotice');
    const summaryEl = document.getElementById('itemsStepSummary');

    if (!container) return;

    const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    if (summaryEl) {
        if (cart.length > 0) {
            summaryEl.textContent = `${cart.length} items (${totalQty} pcs) • Rs. ${subtotal.toFixed(2)}`;
            summaryEl.style.background = '#dcfce7';
            summaryEl.style.color = '#15803d';
            summaryEl.style.fontWeight = '800';
            summaryEl.style.border = '1px solid #86efac';
            summaryEl.style.padding = '3px 8px';
            summaryEl.style.borderRadius = '8px';
        } else {
            const catCount = (allCatalogItems && allCatalogItems.length) ? allCatalogItems.length : 0;
            if (currentLang === 'si') {
                summaryEl.textContent = `📦 භාණ්ඩ වර්ග ${catCount}`;
            } else {
                summaryEl.textContent = `📦 ${catCount} Products`;
            }
            summaryEl.style.background = '#f0fdf4';
            summaryEl.style.color = '#166534';
            summaryEl.style.fontWeight = '700';
            summaryEl.style.border = '1px solid #bbf7d0';
            summaryEl.style.padding = '3px 8px';
            summaryEl.style.borderRadius = '8px';
        }
    }

    if (!cart.length) {
        if (emptyNotice) emptyNotice.style.display = 'block';
        container.innerHTML = '';
        return;
    }

    if (emptyNotice) emptyNotice.style.display = 'none';
    container.innerHTML = cart.map(item => {
        const lineTotal = item.price * item.quantity;
        return `
            <div class="cart-row">
                <div style="flex:1; min-width:0; padding-right:6px;">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-sub">Rs. ${item.price.toFixed(2)} × ${item.quantity}</div>
                </div>
                <div style="display:flex; align-items:center;">
                    <div class="cart-qty-wrap">
                        <button type="button" class="btn-cart-step" onclick="updateCartItemQty('${item.id}', -1)">-</button>
                        <input type="number" class="cart-qty-input" value="${item.quantity}" min="1" step="any" onchange="setCartItemQty('${item.id}', this.value)">
                        <button type="button" class="btn-cart-step" onclick="updateCartItemQty('${item.id}', 1)">+</button>
                    </div>
                    <div class="cart-row-total">Rs. ${lineTotal.toFixed(2)}</div>
                    <button type="button" class="btn-del-item" onclick="removeCartItem('${item.id}')" title="Remove">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
}

function updateCartItemQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity = Math.max(1, item.quantity + delta);
    renderCartList();
    calculateCartTotals();
}

function setCartItemQty(id, val) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.quantity = Math.max(1, Number(val) || 1);
    renderCartList();
    calculateCartTotals();
}

function removeCartItem(id) {
    cart = cart.filter(i => i.id !== id);
    renderCartList();
    calculateCartTotals();
}

// --- TOTALS & CHANGE CALCULATION ---
function calculateCartTotals() {
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const discInput = document.getElementById('discountInput');
    const discVal = Number(discInput ? discInput.value : 0) || 0;
    const grandTotal = Math.max(0, subtotal - discVal);

    const subEl = document.getElementById('subtotalDisplay');
    const discEl = document.getElementById('discountDisplay');
    const discRow = document.getElementById('discountSummaryLine');
    const grandEl = document.getElementById('grandTotalDisplay');
    const stickyAmt = document.getElementById('stickyTotalAmt');
    const totalsSummary = document.getElementById('totalsStepSummary');

    if (subEl) subEl.textContent = `Rs. ${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (discEl) discEl.textContent = `- Rs. ${discVal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (discRow) discRow.style.display = discVal > 0 ? 'flex' : 'none';
    if (grandEl) grandEl.textContent = `Rs. ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (stickyAmt) stickyAmt.textContent = `Rs. ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    if (totalsSummary) totalsSummary.textContent = `Rs. ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    updateChangeDueCalculation();
}

function updateChangeDueCalculation() {
    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const discVal = Number(document.getElementById('discountInput')?.value || 0);
    const grandTotal = Math.max(0, subtotal - discVal);

    const cashInput = document.getElementById('cashReceivedInput');
    const tendered = Number(cashInput ? cashInput.value : 0) || 0;
    const change = Math.max(0, tendered - grandTotal);

    const changeValEl = document.getElementById('changeDueAmt');
    const changeBox = document.getElementById('changeDueContainer');

    if (changeValEl) {
        changeValEl.textContent = `Rs. ${change.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    }
    if (changeBox && selectedPaymentMode === 'CASH') {
        changeBox.style.display = tendered > 0 ? 'flex' : 'none';
    }
}

// --- SUBMIT BILL & WRITE FLOW ---
async function handleSubmitBill() {
    debugLog('👉 handleSubmitBill triggered. Mode=' + (selectedPaymentMode || 'NONE') + ', Cart=' + (cart ? cart.length : 0));
    const btn = document.getElementById('btnSubmitBill');
    try {
        // If cart is empty, check if user currently has an item typed or selected in the input fields
        if (!cart || !cart.length) {
            const nameInput = document.getElementById('itemNameInput');
            const priceInput = document.getElementById('itemPriceInput');
            const qtyInput = document.getElementById('itemQtyInput');
            const name = nameInput ? nameInput.value.trim() : '';
            const price = Number(priceInput ? priceInput.value : 0);
            const qty = Number(qtyInput ? qtyInput.value : 1) || 1;
            debugLog('Checking input fields for auto-add: name="' + name + '", price=' + price);

            if (name && price > 0) {
                addItemToCart(name, price, qty);
                debugLog('Auto-added item: ' + name + ' (Rs.' + price + ')');
                if (nameInput) nameInput.value = '';
                if (priceInput) priceInput.value = '';
                if (qtyInput) qtyInput.value = '1';
            }
        }

        if (!cart || !cart.length) {
            debugLog('Cart is empty. Prompting user.', 'warn');
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Cart is empty (බිල්පත හිස්ය)',
                    text: 'කරුණාකර පළමුව භාණ්ඩයක් තෝරා ➕ Add කරන්න.',
                    confirmButtonColor: '#059669',
                    confirmButtonText: 'හරි'
                });
            } else {
                alert('බිල්පත හිස්ය. කරුණාකර පළමුව භාණ්ඩයක් තෝරා Add කරන්න.');
            }
            openStep('stepItemsCard');
            const inp = document.getElementById('itemNameInput');
            if (inp) inp.focus();
            return;
        }

        const customerSelect = document.getElementById('customerSelect');
        let customerId = customerSelect ? customerSelect.value : 'GUEST';
        debugLog('CustomerId=' + customerId + ', PaymentMode=' + selectedPaymentMode);

        // If CREDIT mode is selected, enforce customer name & phone
        if (selectedPaymentMode === 'CREDIT' && customerId === 'GUEST') {
            debugLog('Prompting for CREDIT customer details...');
            if (typeof Swal !== 'undefined') {
                const { value: formValues } = await Swal.fire({
                    title: 'ණය පාරිභෝගිකයා (Credit Customer)',
                    html:
                        '<label style="font-size:12px;font-weight:700;display:block;text-align:left;margin-bottom:4px;">පාරිභෝගික නම *</label>' +
                        '<input id="swalCustName" class="swal2-input" placeholder="e.g. Nimal Perera" style="margin-top:0;">' +
                        '<label style="font-size:12px;font-weight:700;display:block;text-align:left;margin:8px 0 4px;">දුරකථන අංකය *</label>' +
                        '<input id="swalCustPhone" class="swal2-input" placeholder="07XXXXXXXX" style="margin-top:0;">',
                    focusConfirm: false,
                    confirmButtonText: 'ඉදිරියට යන්න (Continue)',
                    confirmButtonColor: '#059669',
                    showCancelButton: true,
                    cancelButtonText: 'අවලංගු කරන්න',
                    preConfirm: () => {
                        const name = document.getElementById('swalCustName').value.trim();
                        const phone = document.getElementById('swalCustPhone').value.trim();
                        if (!name) {
                            Swal.showValidationMessage('කරුණාකර පාරිභෝගික නම ඇතුළත් කරන්න.');
                            return false;
                        }
                        return { name, phone };
                    }
                });

                if (!formValues) {
                    debugLog('Credit prompt dismissed by user.', 'warn');
                    return;
                }

                const newCust = {
                    id: `CUST_${Date.now().toString().slice(-6)}`,
                    name: formValues.name,
                    phone: formValues.phone,
                    area: 'General',
                    balance: 0,
                    isActive: true,
                    createdAt: new Date().toISOString()
                };

                allCustomers.unshift(newCust);
                try {
                    localStorage.setItem(getScopedKey('customers'), JSON.stringify(allCustomers));
                } catch(e) {}
                renderCustomerDropdown();
                if (customerSelect) customerSelect.value = newCust.id;
                customerId = newCust.id;

                const targetBid = (appCtx && appCtx.businessId) || localStorage.getItem('currentBusinessId');
                if (navigator.onLine && window.firebase && targetBid) {
                    try {
                        window.firebase.firestore().collection('customers').doc(targetBid).collection('list').doc(newCust.id).set(newCust).catch(() => {});
                    } catch(e) {}
                }
            }
        }

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '⏳ Processing...';
        }

        const custObj = (allCustomers && allCustomers.find(c => c.id === customerId)) || { name: 'Guest', phone: '' };
        const customerName = customerId === 'GUEST' ? 'Guest' : (custObj ? custObj.name : 'Guest');
        const customerPhone = custObj ? (custObj.phone || '') : '';

        const subtotal = cart.reduce((sum, i) => sum + ((Number(i.price) || 0) * (Number(i.quantity) || 1)), 0);
        const discount = Number(document.getElementById('discountInput')?.value || 0);
        const grandTotal = Math.max(0, subtotal - discount);
        const paymentMode = selectedPaymentMode || 'CASH';
        const dueDate = paymentMode === 'CREDIT' ? (document.getElementById('creditDueDateInput')?.value || '') : '';

        const cashInputVal = Number(document.getElementById('cashReceivedInput')?.value || 0);
        const cashReceived = paymentMode === 'CASH' ? (cashInputVal > 0 ? cashInputVal : grandTotal) : 0;
        const changeDue = paymentMode === 'CASH' ? Math.max(0, cashReceived - grandTotal) : 0;

        const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
        const billDate = new Date();

        const bid = (appCtx && appCtx.businessId) ? appCtx.businessId : (localStorage.getItem('currentBusinessId') || localStorage.getItem('digibiz_qb_uid') || 'TuyqnDOCjadkMJY2hGu7Iz7Ezm93');

        const billRecord = {
            id: `BILL_${Date.now()}`,
            invoiceNo,
            businessId: bid,
            customerId,
            customerName,
            customerPhone,
            items: [...cart],
            subtotal,
            discount,
            total: grandTotal,
            paymentMode,
            cashReceived,
            changeDue,
            dueDate,
            outstandingAmount: paymentMode === 'CREDIT' ? grandTotal : 0,
            paymentStatus: paymentMode === 'CREDIT' ? 'UNPAID' : 'PAID',
            status: 'completed',
            createdAt: billDate.toISOString()
        };

        debugLog('Bill created: #' + invoiceNo + ', Total=Rs.' + grandTotal + ', Mode=' + paymentMode);

        if (paymentMode === 'CREDIT' && custObj) {
            custObj.balance = (Number(custObj.balance) || 0) + grandTotal;
            try {
                localStorage.setItem(getScopedKey('customers'), JSON.stringify(allCustomers));
            } catch(e) {}
            handleCustomerChange();
        }

        allBillsHistory.unshift(billRecord);
        try {
            localStorage.setItem(getScopedKey('bills'), JSON.stringify(allBillsHistory));
            localStorage.setItem('digibiz_qb_bills', JSON.stringify(allBillsHistory));
        } catch(e) {}

        queueOfflineSync(billRecord);

        currentReceiptData = billRecord;
        activeOrderForReceipt = billRecord;
        debugLog('Calling renderReceiptModal...');
        renderReceiptModal(billRecord);

        // Reset Form
        cart = [];
        renderCartList();
        const discInp = document.getElementById('discountInput');
        const cashInp = document.getElementById('cashReceivedInput');
        if (discInp) discInp.value = '';
        if (cashInp) cashInp.value = '';
        calculateCartTotals();

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '⚡ Issue & Print Bill';
        }
        debugLog('🎉 handleSubmitBill completed successfully!', 'success');
    } catch (err) {
        debugLog('💥 CRASH in handleSubmitBill: ' + err.message + '\n' + err.stack, 'error');
        alert('Error processing bill: ' + err.message);
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '⚡ Issue & Print Bill';
        }
    }
}

// --- OFFLINE SYNC QUEUE ---
function queueOfflineSync(billRecord) {
    try {
        let q = [];
        const raw = localStorage.getItem('digibiz_qb_sync_queue');
        if (raw) q = JSON.parse(raw);
        q.push(billRecord);
        localStorage.setItem('digibiz_qb_sync_queue', JSON.stringify(q));
    } catch (e) {}

    if (navigator.onLine && window.firebase && appCtx) {
        processPendingSyncQueue();
    }
}

async function processPendingSyncQueue() {
    if (!navigator.onLine || !window.firebase || !appCtx) return;
    try {
        let q = [];
        const raw = localStorage.getItem('digibiz_qb_sync_queue');
        if (raw) q = JSON.parse(raw);
        if (!q.length) return;

        const db = window.firebase.firestore();
        const batch = db.batch();

        for (const bill of q) {
            const orderRef = db.collection('orders').doc(appCtx.businessId).collection('list').doc(bill.id);
            batch.set(orderRef, bill, { merge: true });

            if (bill.paymentMode === 'CREDIT' && bill.customerId && bill.customerId !== 'GUEST') {
                const custRef = db.collection('customers').doc(appCtx.businessId).collection('list').doc(bill.customerId);
                batch.set(custRef, {
                    balance: window.firebase.firestore.FieldValue.increment(bill.total)
                }, { merge: true });
            }

            const jeRef = db.collection('journal').doc(appCtx.businessId).collection('entries').doc(`JE_${bill.id}`);
            const isCash = bill.paymentMode === 'CASH';
            const debitAccount = isCash ? '1-1010-01' : (bill.paymentMode === 'CREDIT' ? '1-1030-01' : '1-1020-01');
            const debitName = isCash ? 'Cash in Hand' : (bill.paymentMode === 'CREDIT' ? 'Accounts Receivable' : 'Bank Account');

            batch.set(jeRef, {
                businessId: appCtx.businessId,
                date: window.firebase.firestore.Timestamp.fromDate(new Date(bill.createdAt)),
                description: `Invoice #${bill.invoiceNo} - ${bill.customerName}`,
                ref: `orders/${bill.id}`,
                referenceType: 'SALE',
                totalDebit: bill.total,
                totalCredit: bill.total,
                entries: [
                    { accountCode: debitAccount, accountName: debitName, debit: bill.total, credit: 0 },
                    { accountCode: '4-4010-01', accountName: 'Sales Revenue', debit: 0, credit: bill.total }
                ],
                createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }

        await batch.commit();
        localStorage.removeItem('digibiz_qb_sync_queue');
    } catch (err) {
        console.warn('Sync queue error:', err);
    }
}

// --- RECEIPT & RAWBT THERMAL PRINTING ENGINE (100% DISTRIBUTOR REF APP STANDARD) ---

function formatReceiptDate(rawDate) {
    if (!rawDate) return new Date().toLocaleString('en-US', { hour12: true });
    if (typeof rawDate === 'object' && typeof rawDate.toDate === 'function') {
        return rawDate.toDate().toLocaleString('en-US', { hour12: true });
    }
    if (typeof rawDate === 'object' && rawDate.seconds != null) {
        return new Date(rawDate.seconds * 1000).toLocaleString('en-US', { hour12: true });
    }
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) return d.toLocaleString('en-US', { hour12: true });
    return new Date().toLocaleString('en-US', { hour12: true });
}

function safeBtoa(str) {
    try {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (m, p1) => String.fromCharCode('0x' + p1)));
    } catch (e) { return btoa(str); }
}

async function generateReceiptCanvas() {
    const paper = document.getElementById('receiptPaperContent');
    if (!paper) return null;
    if (typeof html2canvas === 'undefined') {
        alert('Image generator loading, please try again in a moment.');
        return null;
    }

    // Render at high resolution first for crisp text, then remap to the
    // exact native dot width expected by an 80mm @ 203DPI thermal printer.
    const srcCanvas = await html2canvas(paper, {
        scale: 2, // rich source for down-scaling -> sharp edges
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
        imageTimeout: 0
    });

    // Standard 80mm thermal paper = 576 dots wide at 203dpi.
    // The image width MUST match the RAWBT printer 'Width' (pack width) so the
    // receipt fills the ENTIRE roll width and prints crisp + centered.
    //   - 80mm @ 203dpi  -> 576 dots
    //   - 58mm @ 203dpi  -> 384 dots
    // This can be overridden per deployment via URL: ?pw=576 (or ?pxw=576)
    let dotWidth = parseInt(
        new URLSearchParams(location.search).get('pw') ||
        new URLSearchParams(location.search).get('pxw') ||
        '576', 10
    );
    if (!isFinite(dotWidth) || dotWidth < 100) dotWidth = 576;
    const PRINT_DOT_WIDTH = dotWidth;

    const srcW = srcCanvas.width || PRINT_DOT_WIDTH;
    const srcH = srcCanvas.height || 1;

    // Down-scale the rich (2x) render onto the exact printer dot width.
    const ratio = PRINT_DOT_WIDTH / srcW;
    const finalWidth = PRINT_DOT_WIDTH;
    const contentHeight = Math.max(1, Math.round(srcH * ratio));

    // Thermal mobile printers have the thermal print head located ~15mm-25mm behind the physical tear-off teeth.
    // By adding a clean blank feed margin at the bottom of the canvas, the printer automatically advances the paper completely outside past the tear blade in one shot!
    const feedMargin = Math.round(PRINT_DOT_WIDTH * 0.25); // ~140px clean white feed space
    const totalHeight = contentHeight + feedMargin;

    const out = document.createElement('canvas');
    out.width = finalWidth;
    out.height = totalHeight;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, finalWidth, totalHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(srcCanvas, 0, 0, finalWidth, contentHeight);

    return out;
}

        async function printInstantReceiptImage(btnElement) {
            const originalText = btnElement ? btnElement.innerHTML : '';
            if (btnElement) {
                btnElement.disabled = true;
                btnElement.innerHTML = '⏳ GENERATING PRINT IMAGE...';
                btnElement.style.opacity = '0.7';
            }

            try {
                const canvas = await generateReceiptCanvas();
                if (!canvas) {
                    if (btnElement) {
                        btnElement.disabled = false;
                        btnElement.innerHTML = originalText;
                        btnElement.style.opacity = '1';
                    }
                    return;
                }

                const dataUrl = canvas.toDataURL('image/png');
                const b64Png = dataUrl.replace(/^data:image\/png;base64,/, '');

                // 1. Try background RawBT local server (Zero WebView navigation / No error screens)
                let printedViaServer = false;
                try {
                    const ctrl = new AbortController();
                    const tId = setTimeout(() => ctrl.abort(), 400);
                    await fetch('http://127.0.0.1:40213/print', {
                        method: 'POST',
                        body: 'data:image/png;base64,' + b64Png,
                        mode: 'no-cors',
                        signal: ctrl.signal
                    });
                    clearTimeout(tId);
                    printedViaServer = true;
                } catch (err) {
                    printedViaServer = false;
                }

                // 2. If not handled by local server, trigger direct RawBT intent (Distributor Standard)
                if (!printedViaServer) {
                    window.location.href = `rawbt:data:image/png;base64,${b64Png}`;
                }

                // Reset button state after brief delay
                setTimeout(() => {
                    if (btnElement) {
                        btnElement.disabled = false;
                        btnElement.innerHTML = originalText;
                        btnElement.style.opacity = '1';
                    }
                }, 1800);

            } catch (e) {
                console.error('Instant print error:', e);
                alert('Could not send instant image print.');
                if (btnElement) {
                    btnElement.disabled = false;
                    btnElement.innerHTML = originalText;
                    btnElement.style.opacity = '1';
                }
            }
        }

        async function shareOrPrintReceiptImage() {
            try {
                const canvas = await generateReceiptCanvas();
                if (!canvas) return;

                canvas.toBlob(async (blob) => {
                    if (!blob) return;
                    const orderIdStr = (activeOrderForReceipt && (activeOrderForReceipt.invoiceNo || activeOrderForReceipt.orderId || activeOrderForReceipt.id)) || 'Order';
                    const fileName = `Receipt_${String(orderIdStr).replace(/[^a-zA-Z0-9-]/g, '')}.png`;
                    const file = new File([blob], fileName, { type: 'image/png' });

                    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                        try {
                            await navigator.share({
                                title: 'Sales Receipt',
                                text: 'Receipt for mLabel / Thermal Printer',
                                files: [file]
                            });
                            return;
                        } catch (err) {
                            if (err.name !== 'AbortError') console.error('Share error:', err);
                        }
                    }

                    // Fallback: Show preview modal
                    const imgUrl = URL.createObjectURL(blob);
                    showImagePreviewModal(imgUrl);
                }, 'image/png');
            } catch (e) {
                console.error('Error generating image:', e);
                alert('Could not generate receipt image.');
            }
        }

        async function viewReceiptImageOnScreen() {
            try {
                const canvas = await generateReceiptCanvas();
                if (!canvas) return;
                const imgUrl = canvas.toDataURL('image/png');
                showImagePreviewModal(imgUrl);
            } catch (e) {
                console.error('Error viewing image:', e);
                alert('Could not render image preview.');
            }
        }

        function showImagePreviewModal(imgUrl) {
            let imgModal = document.getElementById('imagePreviewModal');
            if (!imgModal) {
                imgModal = document.createElement('div');
                imgModal.id = 'imagePreviewModal';
                imgModal.className = 'modal-overlay';
                imgModal.style.zIndex = '10000';
                imgModal.innerHTML = `
                    <div class="receipt-box" style="max-width:420px; text-align:center;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                            <h3 style="margin:0; color:#064e3b; font-size:16px; font-weight:900;">🖼️ Print Image Preview</h3>
                            <button type="button" onclick="document.getElementById('imagePreviewModal').style.display='none'"
                                style="background:#f1f5f9; border:none; width:28px; height:28px; border-radius:50%; font-weight:800; cursor:pointer;">✕</button>
                        </div>
                        <div style="max-height:65vh; overflow-y:auto; border:1px dashed #cbd5e1; border-radius:10px; padding:10px; background:#f8fafc; margin-bottom:12px;">
                            <img id="previewImgElement" src="" style="width:100%; height:auto; display:block; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.1);" />
                        </div>
                        <div style="font-size:11px; color:#64748b; margin-bottom:10px; font-weight:600;">
                            මෙය mLabel / Thermal Printer එකට යන මුද්‍රණ රූපයේ සැබෑ පෙනුමයි (100% Photo Preview).
                        </div>
                        <a id="downloadPreviewLink" href="" download="Receipt_Image.png" style="display:block; width:100%; background:#0284c7; color:#fff; text-align:center; padding:12px; border-radius:10px; font-weight:800; text-decoration:none; box-shadow:0 2px 6px rgba(2,132,199,0.3);">
                            💾 SAVE IMAGE TO PHONE (දුරකථනයට සුරකින්න)
                        </a>
                    </div>
                `;
                document.body.appendChild(imgModal);
            }
            document.getElementById('previewImgElement').src = imgUrl;
            document.getElementById('downloadPreviewLink').href = imgUrl;
            imgModal.style.display = 'flex';
        }

        function switchReceiptCopyTab(tabName) {
            activeReceiptCopyTab = tabName;
            ['tabCopyBoth', 'tabCopyCust', 'tabCopyOffice'].forEach(id => {
                const btn = document.getElementById(id);
                if (!btn) return;
                const isActive = (id === 'tabCopyBoth' && tabName === 'BOTH') ||
                                 (id === 'tabCopyCust' && tabName === 'CUSTOMER') ||
                                 (id === 'tabCopyOffice' && tabName === 'OFFICE');
                btn.style.background = isActive ? '#047857' : '#f8fafc';
                btn.style.color = isActive ? '#ffffff' : '#334155';
                btn.style.borderColor = isActive ? '#047857' : '#cbd5e1';
            });

            if (activeOrderForReceipt) {
                renderReceiptView(activeOrderForReceipt, tabName);
            }
        }

        function printSpecificCopyRawBT(copyType) {
            if (!activeOrderForReceipt) {
                alert('No order data found to print.');
                return;
            }
            const escPayload = buildSingleEscPosReceipt(activeOrderForReceipt, copyType);
            const b64Payload = safeBtoa(escPayload);
            window.location.href = `rawbt:data:text/plain;base64,${b64Payload}`;
        }

        function printCurrentOrderViaRawBT() {
            if (!activeOrderForReceipt) {
                alert('No order data found to print.');
                return;
            }
            const escPayload = buildEscPosReceipt(activeOrderForReceipt, activeReceiptCopyTab || 'AUTO');
            const b64Payload = safeBtoa(escPayload);
            window.location.href = `rawbt:data:text/plain;base64,${b64Payload}`;
        }

        function printPastOrderRawBT(orderData) {
            if (!orderData) return;
            const escPayload = buildEscPosReceipt(orderData, 'AUTO');
            const b64Payload = safeBtoa(escPayload);
            window.location.href = `rawbt:data:text/plain;base64,${b64Payload}`;
        }

function buildSingleEscPosReceipt(order, copyType = 'CUSTOMER') {
    let txt = "";
    const bName = (appCtx && (appCtx.businessName || appCtx.name || appCtx.companyName)) || localStorage.getItem('digibiz_qb_biz_name') || 'Royal Arabian Restaurant';
    const bAddr = (appCtx && appCtx.address) || localStorage.getItem('digibiz_qb_address') || '';
    const bPhone = (appCtx && appCtx.phone) || localStorage.getItem('digibiz_qb_phone') || '';

    const isCreditSale = String(order.paymentMode || order.paymentMethod || '').toUpperCase() === 'CREDIT' || Number(order.outstandingAmount != null ? order.outstandingAmount : (order.balanceDue != null ? order.balanceDue : 0)) > 0;

    // Header (Centered, Bold)
    txt += "\x1B\x61\x01\x1B\x45\x01";
    txt += (bName.toUpperCase() + "\r\n");
    txt += "\x1B\x45\x00"; // Normal font
    if (bAddr) txt += (bAddr + "\r\n");
    if (bPhone) txt += ("Tel: " + bPhone + "\r\n");
    txt += "SALES ORDER RECEIPT\r\n";

    if (isCreditSale) {
        if (copyType === 'CUSTOMER') {
            txt += "*** CUSTOMER COPY / සාප්පු හිමියාගේ පිටපත ***\r\n";
        } else if (copyType === 'OFFICE') {
            txt += "*** COMPANY / SIGNED COPY (ණය පිටපත) ***\r\n";
        }
    }

    // 32-char Double line divider
    txt += "================================\r\n";
    txt += "\x1B\x61\x00";

    const rawOrdId = String(order.invoiceNo || order.orderId || order.id || '').replace(/^INV-/, '');
    const orderIdStr = rawOrdId.length > 12 ? (rawOrdId.substring(0, 6) + '-' + rawOrdId.substring(rawOrdId.length - 3)) : rawOrdId;
    const dateStr = formatReceiptDate(order.createdAt || order.timestamp);
    const cashierStr = String(order.cashierName || (appCtx && appCtx.userName) || 'Cashier').toUpperCase().replace(/\s+/g, '');
    const custStr = String(order.customerName || order.shopName || 'Guest');

    txt += `Invoice ID:${orderIdStr.padStart(21, ' ')}\r\n`;
    txt += `Date:${dateStr.padStart(27, ' ')}\r\n`;
    txt += `Cashier:${cashierStr.padStart(24, ' ')}\r\n`;
    txt += `Customer:${custStr.substring(0, 23).padStart(23, ' ')}\r\n`;
    if (order.customerPhone) {
        txt += `Phone:${String(order.customerPhone).padStart(26, ' ')}\r\n`;
    }
    txt += `Payment:${String(order.paymentMode || order.paymentMethod || 'CASH').padStart(24, ' ')}\r\n`;

    if (isCreditSale && order.dueDate) {
        txt += `Due Date:${String(order.dueDate).padStart(23, ' ')}\r\n`;
    }

    txt += "--------------------------------\r\n";
    txt += "Item Name     Qty  Price  Amount\r\n";
    txt += "--------------------------------\r\n";

    let grossSales = 0;
    const orderItems = order.items || order.orderItems || [];

    orderItems.forEach(i => {
        const qtyVal = Number(i.quantity || i.qty || 0);
        const freeVal = Number(i.freeQty || i.free || 0);
        const prVal = Number(i.price || i.unitPrice || 0);
        const pName = String(i.name || i.productName || 'Item');

        if (qtyVal > 0) {
            const amtVal = Number(i.total || i.lineTotal || (qtyVal * prVal));
            grossSales += amtVal;
            const formattedQty = Math.round(qtyVal * 10) / 10;
            let qtyStr = String(formattedQty).padStart(3, ' ').substring(0, 3);
            let prStr = prVal.toFixed(2).padStart(7, ' ').substring(0, 7);
            let amtStr = amtVal.toFixed(2).padStart(8, ' ').substring(0, 8);
            let nameCol = (pName.length > 13 ? pName.substring(0, 13) + '~' : pName).padEnd(14, ' ');

            txt += `${nameCol}${qtyStr}${prStr}${amtStr}\r\n`;
        }

        if (freeVal > 0) {
            txt += `  * Free Issue: +${freeVal} Free\r\n`;
        }
    });

    txt += "--------------------------------\r\n";

    const discVal = Number(order.discount || order.discountAmount || 0);
    const netPayable = Number(order.total != null ? order.total : (order.totalAmount != null ? order.totalAmount : (grossSales - discVal)));
    const paidVal = Number(order.cashReceived != null ? order.cashReceived : (order.cashPaid != null ? order.cashPaid : (String(order.paymentMode || '').toUpperCase() === 'CASH' ? netPayable : 0)));
    const balDue = Number(order.outstandingAmount != null ? order.outstandingAmount : (order.balanceDue != null ? order.balanceDue : (isCreditSale ? Math.max(0, netPayable - paidVal) : 0)));

    if (discVal > 0) {
        txt += `GROSS TOTAL:${('Rs. ' + grossSales.toFixed(2)).padStart(20, ' ')}\r\n`;
        txt += `DISCOUNT:${('-Rs. ' + discVal.toFixed(2)).padStart(23, ' ')}\r\n`;
        txt += "--------------------------------\r\n";
    }

    txt += "\x1B\x61\x01\x1B\x45\x01";
    txt += `NET TOTAL: Rs. ${netPayable.toFixed(2)}\r\n`;
    txt += "\x1B\x45\x00\x1B\x61\x00";

    const paymentModeStr = String(order.paymentMode || order.paymentMethod || 'CASH').toUpperCase();
    const cashRec = Number(order.cashReceived != null ? order.cashReceived : (order.cashPaid != null ? order.cashPaid : (paymentModeStr === 'CASH' ? netPayable : 0)));
    const changeAmt = Number(order.changeDue != null ? order.changeDue : (cashRec > netPayable ? (cashRec - netPayable) : 0));

    if (paymentModeStr === 'CASH') {
        txt += "--------------------------------\r\n";
        txt += `CASH RECEIVED:${('Rs. ' + cashRec.toFixed(2)).padStart(18, ' ')}\r\n`;
        txt += `CHANGE DUE:${('Rs. ' + changeAmt.toFixed(2)).padStart(21, ' ')}\r\n`;
    }

    if (isCreditSale || (paidVal > 0 && paidVal < netPayable)) {
        txt += "--------------------------------\r\n";
        if (paidVal > 0) txt += `CASH PAID:${('Rs. ' + paidVal.toFixed(2)).padStart(22, ' ')}\r\n`;
        txt += `CREDIT BALANCE:${('Rs. ' + balDue.toFixed(2)).padStart(17, ' ')}\r\n`;
    }

    txt += "================================\r\n";

    // Footer based on Copy Type
    if (isRoyalArabianUser()) {
        txt += "\x1B\x61\x01\x1B\x45\x01"; // Center + Bold
        txt += "Thank You.. Come Again..!\r\n";
        txt += "\x1B\x45\x00\x1B\x61\x00"; // Reset
        txt += "\r\n";
        txt += "Customer Sign:   ...............\r\n";
        txt += "Cashier Sign:    ...............\r\n";
    } else if (isCreditSale && copyType === 'OFFICE') {
        txt += "\x1B\x61\x01\x1B\x45\x01";
        txt += "CREDIT ACKNOWLEDGMENT\r\n";
        txt += "\x1B\x45\x00\x1B\x61\x00";
        txt += "--------------------------------\r\n";
        txt += "Customer Sign:   ...............\r\n";
        txt += "Date / දිනය:      ...............\r\n";
    } else if (isCreditSale && copyType === 'CUSTOMER') {
        txt += "Thank You For Your Order!\r\n";
        txt += "(Please settle as per credit terms)\r\n\r\n";
        txt += "Customer Sign:   ...............\r\n";
        txt += "Cashier Sign:    ...............\r\n";
    } else {
        txt += "Thank You For Your Business!\r\n\r\n";
        txt += "Customer Sign:   ...............\r\n";
        txt += "Cashier Sign:    ...............\r\n";
    }

    txt += "\r\n(Software by DIGIBIZ - 0713446500)\r\n";
    return txt;
}

function buildEscPosReceipt(order, copyMode = 'AUTO') {
    const isCreditSale = String(order.paymentMode || order.paymentMethod || '').toUpperCase() === 'CREDIT' || Number(order.outstandingAmount != null ? order.outstandingAmount : (order.balanceDue != null ? order.balanceDue : 0)) > 0;

    let fullTxt = "\x1B\x40"; // Init printer

    if (isCreditSale && (copyMode === 'BOTH' || copyMode === 'AUTO')) {
        // 1. Customer Copy
        fullTxt += buildSingleEscPosReceipt(order, 'CUSTOMER');
        fullTxt += "\r\n\r\n\x1B\x64\x02";
        fullTxt += "--------------------------------\r\n";
        fullTxt += "======= TEAR / කඩන්න =======\r\n";
        fullTxt += "--------------------------------\r\n\r\n\x1B\x64\x02";
        // 2. Company/Office Signed Copy
        fullTxt += buildSingleEscPosReceipt(order, 'OFFICE');
        fullTxt += "\r\n\r\n\r\n\r\n\r\n\r\n\x1B\x64\x06";
    } else if (copyMode === 'OFFICE') {
        fullTxt += buildSingleEscPosReceipt(order, 'OFFICE');
        fullTxt += "\r\n\r\n\r\n\r\n\r\n\r\n\x1B\x64\x06";
    } else {
        fullTxt += buildSingleEscPosReceipt(order, 'CUSTOMER');
        fullTxt += "\r\n\r\n\r\n\r\n\r\n\r\n\x1B\x64\x06";
    }

    return fullTxt;
}

function renderSingleReceiptHtml(ord, copyType = 'CUSTOMER') {
    const isCreditSale = String(ord.paymentMode || ord.paymentMethod || '').toUpperCase() === 'CREDIT' || Number(ord.outstandingAmount != null ? ord.outstandingAmount : (ord.balanceDue != null ? ord.balanceDue : 0)) > 0;
    const rawOrdId = String(ord.invoiceNo || ord.orderId || ord.id || '').replace(/^INV-/, '');
    const orderIdStr = rawOrdId.length > 12 ? (rawOrdId.substring(0, 6) + '-' + rawOrdId.substring(rawOrdId.length - 3)) : rawOrdId;
    const dateStr = formatReceiptDate(ord.createdAt || ord.timestamp);
    const bName = (appCtx && (appCtx.businessName || appCtx.name || appCtx.companyName)) || localStorage.getItem('digibiz_qb_biz_name') || 'Royal Arabian Restaurant';
    const bAddr = (appCtx && appCtx.address) || localStorage.getItem('digibiz_qb_address') || '';
    const bPhone = (appCtx && appCtx.phone) || localStorage.getItem('digibiz_qb_phone') || '';
    const rName = ord.cashierName || (appCtx && appCtx.userName) || 'Cashier';
    const custStr = String(ord.customerName || ord.shopName || 'Guest');

    let grossSales = 0;
    const orderItems = ord.items || ord.orderItems || [];

    let itemsLinesHtml = orderItems.map(i => {
        const qtyVal = Number(i.quantity || i.qty || 0);
        const freeVal = Number(i.freeQty || i.free || 0);
        const prVal = Number(i.price || i.unitPrice || 0);
        const pName = String(i.name || i.productName || 'Item');

        let html = '';
        if (qtyVal > 0) {
            const amtVal = Number(i.total || i.lineTotal || (qtyVal * prVal));
            grossSales += amtVal;
            const formattedQty = Math.round(qtyVal * 10) / 10;
            let qtyStr = String(formattedQty).padStart(3, ' ').substring(0, 3);
            let prStr = prVal.toFixed(2).padStart(7, ' ').substring(0, 7);
            let amtStr = amtVal.toFixed(2).padStart(8, ' ').substring(0, 8);
            let nameCol = (pName.length > 13 ? pName.substring(0, 13) + '~' : pName).padEnd(14, ' ');

            html += `<div style="display:flex; justify-content:space-between; font-family:monospace; font-size:12px; white-space:pre;">` +
                `<span style="width:14ch; overflow:hidden;">${escapeHtml(nameCol)}</span>` +
                `<span style="width:3ch; text-align:right;">${escapeHtml(qtyStr)}</span>` +
                `<span style="width:7ch; text-align:right;">${escapeHtml(prStr)}</span>` +
                `<span style="width:8ch; text-align:right; font-weight:bold;">${escapeHtml(amtStr)}</span>` +
                `</div>`;
        }

        if (freeVal > 0) {
            html += `<div style="font-family:monospace; font-size:11px; color:#047857; padding-left:12px; margin-top:2px; margin-bottom:4px; font-weight:600;">` +
                `* Free Issue: +${freeVal} Free` +
                `</div>`;
        }
        return html;
    }).join('');

    const discVal = Number(ord.discount || ord.discountAmount || 0);
    const netPayable = Number(ord.total != null ? ord.total : (ord.totalAmount != null ? ord.totalAmount : (grossSales - discVal)));
    const paymentModeStr = String(ord.paymentMode || ord.paymentMethod || 'CASH').toUpperCase();
    const paidVal = Number(ord.cashReceived != null ? ord.cashReceived : (ord.cashPaid != null ? ord.cashPaid : (paymentModeStr === 'CASH' ? netPayable : 0)));
    const changeAmt = Number(ord.changeDue != null ? ord.changeDue : (paidVal > netPayable ? (paidVal - netPayable) : 0));
    const balDue = Number(ord.outstandingAmount != null ? ord.outstandingAmount : (ord.balanceDue != null ? ord.balanceDue : (isCreditSale ? Math.max(0, netPayable - paidVal) : 0)));

    let breakdownHtml = '';
    if (discVal > 0) {
        breakdownHtml = `
            <div style="display:flex; justify-content:space-between;"><span>Gross Total:</span><span>Rs. ${grossSales.toFixed(2)}</span></div>
            <div style="display:flex; justify-content:space-between; color:#dc2626;"><span>Discount:</span><span>-Rs. ${discVal.toFixed(2)}</span></div>
        `;
    }

    let cashBreakdownHtml = '';
    if (paymentModeStr === 'CASH') {
        cashBreakdownHtml = `
            <div style="margin-top:6px; border-top:1px dashed #000; padding-top:4px; font-size:11.5px;">
                <div style="display:flex; justify-content:space-between; font-weight:bold;">
                    <span>CASH RECEIVED (ලැබුණු මුදල):</span>
                    <span>Rs. ${paidVal.toFixed(2)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-weight:bold; color:#047857; font-size:12.5px; margin-top:2px;">
                    <span>CHANGE DUE (ඉතිරි මුදල):</span>
                    <span>Rs. ${changeAmt.toFixed(2)}</span>
                </div>
            </div>
        `;
    }

    let partialBreakdownHtml = '';
    if (isCreditSale || (paidVal > 0 && paidVal < netPayable)) {
        partialBreakdownHtml = `
            <div style="margin-top:6px; border-top:1px dashed #000; padding-top:4px; font-size:11px;">
                ${paidVal > 0 ? `<div style="display:flex; justify-content:space-between; color:#047857; font-weight:bold;"><span>Cash Paid Now:</span><span>Rs. ${paidVal.toFixed(2)}</span></div>` : ''}
                <div style="display:flex; justify-content:space-between; color:#dc2626; font-weight:bold;"><span>Remaining Credit:</span><span>Rs. ${balDue.toFixed(2)}</span></div>
            </div>
        `;
    }

    const totalsSectionHtml = `
        <div style="border-top:1px dashed #000; padding-top:6px; font-family:monospace; font-size:12px;">
            ${breakdownHtml}
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:15px; margin-top:4px; border-top:1px dashed #000; padding-top:4px; color:#047857;">
                <span>NET TOTAL (බිලේ එකතුව):</span><span>Rs. ${netPayable.toFixed(2)}</span>
            </div>
            ${cashBreakdownHtml}
            ${partialBreakdownHtml}
        </div>
    `;

    let copyBadgeHeader = '';
    if (isCreditSale) {
        if (copyType === 'CUSTOMER') {
            copyBadgeHeader = `<div style="background:#f0fdf4; border:1px dashed #16a34a; color:#15803d; font-weight:bold; font-size:11px; padding:3px 6px; border-radius:4px; margin:4px 0;">*** CUSTOMER COPY / සාප්පු හිමියාගේ පිටපත ***</div>`;
        } else if (copyType === 'OFFICE') {
            copyBadgeHeader = `<div style="background:#fff7ed; border:1px dashed #ea580c; color:#c2410c; font-weight:bold; font-size:11px; padding:3px 6px; border-radius:4px; margin:4px 0;">*** COMPANY / SIGNED COPY (ණය පිටපත) ***</div>`;
        }
    }

    let footerSignHtml = '';
    if (isRoyalArabianUser()) {
        footerSignHtml = `
            <div style="margin-top:16px; display:flex; justify-content:space-between; font-family:monospace; font-size:10px; border-top:1px dashed #000; padding-top:6px;">
                <div>Customer: ................</div>
                <div>Cashier:  ................</div>
            </div>
            <div style="text-align:center; font-family:monospace; border-top:2px dashed #000; padding-top:8px; margin-top:12px;">
                <div style="font-weight:900; font-size:13.5px; color:#000; margin:4px 0; letter-spacing:0.5px;">Thank You.. Come Again..!</div>
                <span style="font-size:10px; color:#475569;">(Software by DIGIBIZ - 0713446500)</span>
            </div>
        `;
    } else if (isCreditSale && copyType === 'OFFICE') {
        footerSignHtml = `
            <div style="margin-top:12px; border:1.5px solid #000; padding:8px; border-radius:6px; font-family:monospace; background:#fff;">
                <div style="font-size:11px; font-weight:bold; text-align:center; color:#000; border-bottom:1px dashed #000; padding-bottom:4px; margin-bottom:8px;">
                    CREDIT ACKNOWLEDGMENT
                </div>
                <div style="font-size:11px; line-height:1.8;">
                    ${balDue > 0 ? `<div style="font-weight:bold; color:#b91c1c; margin-bottom:4px;">Balance Due (ණය මුදල): Rs. ${balDue.toFixed(2)}</div>` : ''}
                    <div>Customer Sign: ....................</div>
                    <div>Date / දිනය:      ....................</div>
                </div>
            </div>
            <div style="text-align:center; font-family:monospace; font-size:10px; margin-top:8px; color:#475569;">
                (Software by DIGIBIZ - 0713446500)
            </div>
        `;
    } else if (isCreditSale && copyType === 'CUSTOMER') {
        footerSignHtml = `
            <div style="margin-top:14px; display:flex; justify-content:space-between; font-family:monospace; font-size:10px; border-top:1px dashed #000; padding-top:6px;">
                <div>Customer: ................</div>
                <div>Cashier:  ................</div>
            </div>
            <div style="text-align:center; font-family:monospace; font-size:11px; border-top:2px dashed #000; padding-top:8px; margin-top:10px;">
                Thank You For Your Order!<br>
                <span style="font-size:10px; color:#64748b;">(Please settle invoice as per credit terms)</span><br>
                <span style="font-size:10px; color:#475569;">(Software by DIGIBIZ - 0713446500)</span>
            </div>
        `;
    } else {
        footerSignHtml = `
            <div style="margin-top:16px; display:flex; justify-content:space-between; font-family:monospace; font-size:10px; border-top:1px dashed #000; padding-top:6px;">
                <div>Customer: ................</div>
                <div>Cashier:  ................</div>
            </div>
            <div style="text-align:center; font-family:monospace; font-size:11px; border-top:2px dashed #000; padding-top:8px; margin-top:12px;">
                Thank You For Your Business!<br>
                <span style="font-size:10px; color:#475569;">(Software by DIGIBIZ - 0713446500)</span>
            </div>
        `;
    }

    return `
        <div style="text-align:center; margin-bottom:10px; font-family:monospace;">
            <div style="font-size:18px; font-weight:bold; color:#064e3b;">${escapeHtml(bName)}</div>
            ${bAddr ? `<div style="font-size:11px; color:#334155;">${escapeHtml(bAddr)}</div>` : ''}
            ${bPhone ? `<div style="font-size:11px; color:#334155;">Tel: ${escapeHtml(bPhone)}</div>` : ''}
            <div style="font-size:12px; font-weight:bold; margin-top:4px; text-transform:uppercase; color:#0f172a;">
                SALES ORDER RECEIPT
            </div>
            ${copyBadgeHeader}
        </div>

        <div style="border-top:2px dashed #000; border-bottom:1px dashed #000; padding:6px 0; margin-bottom:6px; font-family:monospace; font-size:11px;">
            <div style="display:flex; justify-content:space-between;"><span>Invoice ID:</span><strong>${escapeHtml(orderIdStr)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Date:</span><strong>${escapeHtml(dateStr)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Cashier:</span><strong>${escapeHtml(rName)}</strong></div>
            <div style="display:flex; justify-content:space-between;"><span>Customer:</span><strong>${escapeHtml(custStr)}</strong></div>
            ${ord.customerPhone ? `<div style="display:flex; justify-content:space-between;"><span>Phone:</span><strong>${escapeHtml(ord.customerPhone)}</strong></div>` : ''}
            <div style="display:flex; justify-content:space-between;"><span>Payment:</span><strong>${escapeHtml(ord.paymentMode || ord.paymentMethod || 'CASH')}</strong></div>
            ${(isCreditSale && ord.dueDate) ? `<div style="display:flex; justify-content:space-between; color:#dc2626;"><span>Due Date:</span><strong>${escapeHtml(ord.dueDate)}</strong></div>` : ''}
        </div>

        <div style="border-bottom:1px dashed #000; padding-bottom:4px; margin-bottom:6px; font-family:monospace; font-size:11px; font-weight:bold; display:flex; justify-content:space-between; white-space:pre;">
            <span style="width:14ch;">Item Name</span>
            <span style="width:3ch; text-align:right;">Qty</span>
            <span style="width:7ch; text-align:right;">Price</span>
            <span style="width:8ch; text-align:right;">Amount</span>
        </div>

        <div style="padding-bottom:4px;">
            ${itemsLinesHtml}
        </div>

        ${totalsSectionHtml}
        ${footerSignHtml}
    `;
}

function renderReceiptView(ord, copyTab = 'AUTO') {
    activeOrderForReceipt = ord;
    currentReceiptData = ord;
    const paper = document.getElementById('receiptPaperContent');
    if (!paper) return;

    const isCreditSale = String(ord.paymentMode || ord.paymentMethod || '').toUpperCase() === 'CREDIT' || Number(ord.outstandingAmount != null ? ord.outstandingAmount : (ord.balanceDue != null ? ord.balanceDue : 0)) > 0;

    const copyTabsContainer = document.getElementById('receiptCopyTabs');
    const creditExtraButtons = document.getElementById('creditExtraPrintButtons');
    const mainPrintBtn = document.getElementById('btnMainInstantPrint');

    if (isCreditSale) {
        if (copyTabsContainer) copyTabsContainer.style.display = 'flex';
        if (creditExtraButtons) creditExtraButtons.style.display = 'flex';

        let targetTab = copyTab;
        if (targetTab === 'AUTO') targetTab = 'BOTH';
        activeReceiptCopyTab = targetTab;

        // Sync Tab Button Styles
        ['tabCopyBoth', 'tabCopyCust', 'tabCopyOffice'].forEach(id => {
            const btn = document.getElementById(id);
            if (!btn) return;
            const isActive = (id === 'tabCopyBoth' && targetTab === 'BOTH') ||
                             (id === 'tabCopyCust' && targetTab === 'CUSTOMER') ||
                             (id === 'tabCopyOffice' && targetTab === 'OFFICE');
            btn.style.background = isActive ? '#047857' : '#f8fafc';
            btn.style.color = isActive ? '#ffffff' : '#334155';
            btn.style.borderColor = isActive ? '#047857' : '#cbd5e1';
        });

        if (mainPrintBtn) {
            if (targetTab === 'BOTH') {
                mainPrintBtn.innerHTML = '🖨️ PRINT (පිටපත් 2ම මුද්‍රණය)';
            } else if (targetTab === 'CUSTOMER') {
                mainPrintBtn.innerHTML = '🖨️ PRINT (Customer Copy)';
            } else if (targetTab === 'OFFICE') {
                mainPrintBtn.innerHTML = '🖨️ PRINT (Signed Copy)';
            }
        }

        if (targetTab === 'BOTH') {
            const custHtml = renderSingleReceiptHtml(ord, 'CUSTOMER');
            const officeHtml = renderSingleReceiptHtml(ord, 'OFFICE');
            paper.innerHTML = `
                ${custHtml}
                <div style="margin:22px 0 18px 0; border-top:2px dashed #94a3b8; text-align:center; position:relative;">
                    <span style="position:relative; top:-10px; background:#fff; padding:2px 10px; font-size:11px; font-weight:800; color:#64748b; font-family:monospace; border:1px dashed #cbd5e1; border-radius:12px;">
                        ✂️ TEAR HERE (මෙහිදී වෙන් කරන්න) ✂️
                    </span>
                </div>
                ${officeHtml}
            `;
        } else {
            paper.innerHTML = renderSingleReceiptHtml(ord, targetTab);
        }

    } else {
        if (copyTabsContainer) copyTabsContainer.style.display = 'none';
        if (creditExtraButtons) creditExtraButtons.style.display = 'none';
        if (mainPrintBtn) mainPrintBtn.innerHTML = '🖨️ PRINT (මුද්‍රණය කරන්න)';
        activeReceiptCopyTab = 'CUSTOMER';
        paper.innerHTML = renderSingleReceiptHtml(ord, 'CUSTOMER');
    }

    const modal = document.getElementById('receiptModal');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('open');
        modal.style.setProperty('display', 'flex', 'important');
        modal.style.setProperty('pointer-events', 'auto', 'important');
        modal.style.setProperty('z-index', '9999999', 'important');
        debugLog('✅ Receipt modal shown on screen! (id=receiptModal)', 'success');
    } else {
        debugLog('❌ ERROR: #receiptModal element NOT found in DOM!', 'error');
    }
}

function closeReceiptModal() {
    const modal = document.getElementById('receiptModal');
    if (modal) {
        modal.classList.remove('open');
        modal.style.setProperty('display', 'none', 'important');
        modal.style.setProperty('pointer-events', 'none', 'important');
    }
}
window.closeReceiptModal = closeReceiptModal;

function closeImagePreviewModal() {
    const modal = document.getElementById('imagePreviewModal');
    if (modal) {
        modal.classList.remove('open');
        modal.style.setProperty('display', 'none', 'important');
        modal.style.setProperty('pointer-events', 'none', 'important');
    }
}
window.closeImagePreviewModal = closeImagePreviewModal;

function startNewBill() {
    closeReceiptModal();

    // 1. Reset Cart
    cart = [];
    renderCartList();

    // 2. Reset Customer Selection to Guest
    const customerSelect = document.getElementById('customerSelect');
    if (customerSelect) {
        customerSelect.value = 'GUEST';
        handleCustomerChange();
    }
    const infoBadge = document.getElementById('customerInfoBadge');
    if (infoBadge) infoBadge.style.display = 'none';

    // 3. Clear Inputs
    const discInp = document.getElementById('discountInput');
    const cashInp = document.getElementById('cashReceivedInput');
    const itemInp = document.getElementById('itemNameInput');
    const searchInp = document.getElementById('searchProductInput');
    if (discInp) discInp.value = '';
    if (cashInp) cashInp.value = '';
    if (itemInp) itemInp.value = '';
    if (searchInp) searchInp.value = '';

    // 4. Reset Payment Mode to CASH
    selectPaymentMode('CASH');

    // 5. Recalculate totals
    calculateCartTotals();

    // 6. Reset step state & focus Item input for fast new entry
    openStep('stepItemsCard');
    if (itemInp) {
        setTimeout(() => itemInp.focus(), 150);
    }
}

// Backward compatibility alias
function renderReceiptModal(bill) {
    renderReceiptView(bill);
}

// --- BROWSER / OFFLINE THERMAL PRINTING ---
function handleBrowserPrint() {
    const el = document.getElementById('receiptPaperContent');
    if (!el) return;

    try {
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const doc = iframe.contentWindow.document;
        doc.open();
        doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Bill Receipt</title>
                <style>
                    @page { size: 80mm auto; margin: 3mm; }
                    body { font-family: 'Courier New', Courier, monospace; font-size: 12px; color: #000; margin: 0; padding: 0; }
                    .receipt-paper { width: 100%; max-width: 80mm; margin: 0 auto; }
                    .text-right { text-align: right !important; }
                    .text-center { text-align: center !important; }
                    .font-bold { font-weight: bold !important; }
                </style>
            </head>
            <body>
                ${el.outerHTML}
            </body>
            </html>
        `);
        doc.close();

        setTimeout(() => {
            try {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            } catch (e) {
                window.print();
            } finally {
                setTimeout(() => {
                    if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
                }, 2000);
            }
        }, 300);
    } catch (err) {
        window.print();
    }
}

// --- BILL HISTORY MODAL ---
function openBillHistoryModal() {
    renderBillHistoryList(allBillsHistory);
    document.getElementById('historyModal').classList.add('open');

    const searchInput = document.getElementById('historySearchInput');
    const dateInput = document.getElementById('historyDateFilter');

    const applyFilter = () => {
        const q = searchInput.value.toLowerCase().trim();
        const dt = dateInput.value;
        const filtered = allBillsHistory.filter(b => {
            const matchQ = !q || (b.customerName && b.customerName.toLowerCase().includes(q)) || (b.invoiceNo && b.invoiceNo.toLowerCase().includes(q));
            const matchD = !dt || (b.createdAt && b.createdAt.startsWith(dt));
            return matchQ && matchD;
        });
        renderBillHistoryList(filtered);
    };

    searchInput.oninput = applyFilter;
    dateInput.onchange = applyFilter;
}

function renderBillHistoryList(list) {
    const container = document.getElementById('historyListContainer');
    const countEl = document.getElementById('histBillCount');
    const revEl = document.getElementById('histTotalRev');
    if (!container) return;

    const totalRev = list.reduce((sum, b) => sum + (Number(b.total) || 0), 0);
    if (countEl) countEl.textContent = list.length;
    if (revEl) revEl.textContent = `Rs. ${totalRev.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

    if (!list.length) {
        container.innerHTML = '<div style="text-align:center; padding:24px; color:var(--text-muted); font-size:13px;">No bill records found.</div>';
        return;
    }

    container.innerHTML = list.map(b => `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:10px 12px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <div style="font-size:13.5px; font-weight:800; color:var(--text-dark);">${escapeHtml(b.customerName || 'Guest')}</div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">#${b.invoiceNo} | ${new Date(b.createdAt).toLocaleDateString()} | ${b.paymentMode}</div>
            </div>
            <div style="text-align:right;">
                <div style="font-size:14.5px; font-weight:900; color:var(--primary-dark);">Rs. ${(Number(b.total) || 0).toFixed(2)}</div>
                <button type="button" onclick="reprintBillById('${b.id}')" style="background:var(--primary-light); color:var(--primary); border:1px solid #a7f3d0; padding:3px 7px; border-radius:6px; font-size:10.5px; font-weight:800; cursor:pointer; margin-top:3px;">
                    👁️ View / Print
                </button>
            </div>
        </div>
    `).join('');
}

function reprintBillById(id) {
    const bill = allBillsHistory.find(b => b.id === id);
    if (!bill) return;
    currentReceiptData = bill;
    renderReceiptModal(bill);
}

function closeBillHistoryModal() {
    document.getElementById('historyModal').classList.remove('open');
}

// --- CATALOG MODAL ---
function openCatalogModal() {
    renderCatalogList(allCatalogItems);
    document.getElementById('catalogModal').classList.add('open');

    document.getElementById('catalogSearchInput').oninput = (e) => {
        const q = e.target.value.toLowerCase().trim();
        renderCatalogList(allCatalogItems.filter(i => i.name.toLowerCase().includes(q)));
    };
}

function renderCatalogList(items) {
    const container = document.getElementById('catalogListContainer');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">No catalog items saved yet.</div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:9px 0; border-bottom:1px solid #e2e8f0;">
            <div>
                <div style="font-size:13.5px; font-weight:800;">${escapeHtml(item.name)}</div>
                <div style="font-size:12px; color:var(--primary); font-weight:700;">Rs. ${Number(item.price).toFixed(2)}</div>
            </div>
            <button type="button" onclick="deleteCatalogItem('${item.id}')" style="color:#ef4444; background:none; border:none; font-size:16px; cursor:pointer;" title="Delete">🗑️</button>
        </div>
    `).join('');
}

async function handleSaveNewCatalogItem() {
    const nameEl = document.getElementById('newCatName');
    const priceEl = document.getElementById('newCatPrice');

    const name = (nameEl ? nameEl.value : '').trim();
    const price = Number(priceEl ? priceEl.value : 0);

    if (!name) {
        alert('Please enter product name.');
        return;
    }

    const newItem = {
        id: `qb_prod_${Date.now()}`,
        name: name,
        price: price,
        stock: 999
    };

    allCatalogItems.unshift(newItem);
    localStorage.setItem(getScopedKey('catalog'), JSON.stringify(allCatalogItems));
    localStorage.setItem('digibiz_qb_catalog', JSON.stringify(allCatalogItems));
    updateCatalogBadgeCount();

    const bid = (appCtx && appCtx.businessId && appCtx.businessId !== 'local') ? appCtx.businessId : (localStorage.getItem('currentBusinessId') || localStorage.getItem('activeBusinessId'));

    if (navigator.onLine && window.firebase && bid && bid !== 'local') {
        try {
            const db = window.firebase.firestore();
            await db.collection('products').doc(bid).collection('list').doc(newItem.id).set({
                id: newItem.id,
                businessId: bid,
                name: name,
                unitPrice: price,
                price: price,
                stock: 999,
                isActive: true,
                createdAt: new Date().toISOString()
            }, { merge: true });
        } catch (e) {
            console.warn('Product save notice:', e);
        }
    }

    if (nameEl) nameEl.value = '';
    if (priceEl) priceEl.value = '';

    renderCatalogList(allCatalogItems);

    if (typeof Swal !== 'undefined') {
        Swal.fire({
            icon: 'success',
            title: 'Product Saved!',
            text: `${name} (Rs. ${price.toFixed(2)}) catalog එකට සාර්ථකව එකතු කරන ලදී.`,
            timer: 1500,
            showConfirmButton: false
        });
    }
}

function deleteCatalogItem(id) {
    if (!confirm('Remove this saved item from catalog memory?')) return;
    allCatalogItems = allCatalogItems.filter(i => i.id !== id);
    localStorage.setItem(getScopedKey('catalog'), JSON.stringify(allCatalogItems));
    localStorage.setItem('digibiz_qb_catalog', JSON.stringify(allCatalogItems));
    updateCatalogBadgeCount();
    renderCatalogList(allCatalogItems);

    try {
        const raw = localStorage.getItem('digibiz_qb_pending_products');
        if (raw) {
            const queue = JSON.parse(raw).filter(q => q.id !== id);
            localStorage.setItem('digibiz_qb_pending_products', JSON.stringify(queue));
        }
    } catch(e) {}

    const bid = (appCtx && appCtx.businessId && appCtx.businessId !== 'local') ? appCtx.businessId : (localStorage.getItem('currentBusinessId') || localStorage.getItem('activeBusinessId'));

    if (navigator.onLine && window.firebase && bid && bid !== 'local') {
        try {
            window.firebase.firestore().collection('products').doc(bid).collection('list').doc(id).delete().catch(() => {});
        } catch(e) {}
    }
}

function closeCatalogModal() {
    document.getElementById('catalogModal').classList.remove('open');
}

// --- CUSTOMER DIRECTORY MODAL ---
function openCustomerDirectoryModal() {
    renderCustomerDirectoryList(allCustomers);
    document.getElementById('customerDirectoryModal').classList.add('open');

    document.getElementById('manageCustomerSearch').oninput = (e) => {
        const q = e.target.value.toLowerCase().trim();
        renderCustomerDirectoryList(allCustomers.filter(c => (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.includes(q))));
    };
}

function renderCustomerDirectoryList(list) {
    const container = document.getElementById('customerDirectoryList');
    if (!container) return;

    if (!list.length) {
        container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">No registered customers yet.</div>';
        return;
    }

    container.innerHTML = list.map(c => `
        <div style="padding:10px 0; border-bottom:1px solid #e2e8f0;">
            <div style="font-size:14px; font-weight:800;">${escapeHtml(c.name)}</div>
            <div style="font-size:12px; color:var(--text-muted);">📞 ${c.phone || 'No phone'} | 📍 ${c.area || 'General'} | 💳 Bal: Rs. ${(Number(c.balance)||0).toFixed(2)}</div>
        </div>
    `).join('');
}

function closeCustomerDirectoryModal() {
    document.getElementById('customerDirectoryModal').classList.remove('open');
}

function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// Expose all UI Action Methods to window for rock-solid HTML onclick execution across all devices
window.handleSubmitBill = handleSubmitBill;
window.handleAddDirectCustomItem = handleAddDirectCustomItem;
window.adjustDirectQty = adjustDirectQty;
window.openCatalogModal = openCatalogModal;
window.closeCatalogModal = closeCatalogModal;
window.handleSaveNewCatalogItem = handleSaveNewCatalogItem;
window.deleteCatalogItem = deleteCatalogItem;
window.openNewCustomerModal = openNewCustomerModal;
window.closeNewCustomerModal = closeNewCustomerModal;
window.handleSaveNewCustomer = handleSaveNewCustomer;
window.openBillHistoryModal = openBillHistoryModal;
window.closeBillHistoryModal = closeBillHistoryModal;
window.reprintBillById = reprintBillById;
window.openCustomerDirectoryModal = openCustomerDirectoryModal;
window.closeCustomerDirectoryModal = closeCustomerDirectoryModal;
window.printInstantReceiptImage = printInstantReceiptImage;
window.shareOrPrintReceiptImage = shareOrPrintReceiptImage;
window.viewReceiptImageOnScreen = viewReceiptImageOnScreen;
window.switchReceiptCopyTab = switchReceiptCopyTab;
window.printSpecificCopyRawBT = printSpecificCopyRawBT;
window.printCurrentOrderViaRawBT = printCurrentOrderViaRawBT;
window.handleBrowserPrint = handleBrowserPrint;
window.closeReceiptModal = closeReceiptModal;
window.startNewBill = startNewBill;
window.selectPaymentMode = selectPaymentMode;
window.toggleStep = toggleStep;
window.openStep = openStep;
window.testIssueBillClick = function() {
    debugLog('🧪 Running automated 1-Click Test Bill...', 'warn');
    if (!cart.length) {
        addItemToCart('Test Biriyani', 500, 1);
        debugLog('Item added to cart: Test Biriyani (Rs. 500)');
    }
    handleSubmitBill();
};




/**
 * DIGIBIZ — Quick Billing Terminal Engine (Progressive Step-by-Step Mobile Edition)
 * Multilingual (English / සිංහල / தமிழ்), Live Online/Offline Status, Instant Autocomplete, Direct Quantity Typing, Bluetooth ESC/POS & WhatsApp Receipts
 */

let appCtx = null;
let currentLang = localStorage.getItem('preferredLanguage') || 'en';
let allCustomers = [];
let allCatalogItems = [];
let cart = [];
let allBillsHistory = [];
let currentReceiptData = null;
let bluetoothDevice = null;
let bluetoothCharacteristic = null;
let selectedPaymentMode = 'CASH';

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
document.addEventListener('DOMContentLoaded', async () => {
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
    appCtx = await guardAppSession();
    if (!appCtx) return;

    setupEvents();
    setupAutocomplete();
    setupCreditDueDatePresets();
    await loadInitialData();
    checkUrlViewParam();
});

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

async function guardAppSession() {
    return new Promise((resolve) => {
        const auth = window.firebase && window.firebase.auth ? window.firebase.auth() : null;
        if (!auth) {
            window.location.href = '/auth/login.html';
            return resolve(null);
        }

        auth.onAuthStateChanged(async (user) => {
            if (!user) {
                const cachedUid = localStorage.getItem('digibiz_qb_uid');
                const cachedBid = localStorage.getItem('currentBusinessId') || cachedUid;
                if (cachedUid && cachedBid) {
                    const ctx = {
                        userId: cachedUid,
                        businessId: cachedBid,
                        businessName: localStorage.getItem('digibiz_qb_biz_name') || 'Business Store',
                        userEmail: localStorage.getItem('digibiz_qb_email') || ''
                    };
                    renderAppBranding(ctx);
                    return resolve(ctx);
                } else {
                    window.location.href = '/auth/login.html';
                    return resolve(null);
                }
            }

            try {
                const db = window.firebase.firestore();
                const uDoc = await db.collection('users').doc(user.uid).get().catch(() => null);
                const uData = uDoc && uDoc.exists ? uDoc.data() : {};
                const bid = uData.businessId || localStorage.getItem('currentBusinessId') || user.uid;

                const bDoc = await db.collection('businesses').doc(bid).get().catch(() => null);
                const bData = bDoc && bDoc.exists ? bDoc.data() : {};

                const ctx = {
                    userId: user.uid,
                    businessId: bid,
                    businessName: bData.name || bData.businessName || 'Business Store',
                    address: bData.address || '',
                    phone: bData.phone || '',
                    userEmail: user.email
                };

                localStorage.setItem('digibiz_qb_uid', user.uid);
                localStorage.setItem('currentBusinessId', bid);
                localStorage.setItem('digibiz_qb_biz_name', ctx.businessName);
                localStorage.setItem('digibiz_qb_email', ctx.userEmail);
                localStorage.setItem('digibiz_qb_phone', ctx.phone);
                localStorage.setItem('digibiz_qb_address', ctx.address);

                renderAppBranding(ctx);
                resolve(ctx);
            } catch (err) {
                console.warn('[QuickBilling] Context load notice:', err);
                const ctx = {
                    userId: user.uid,
                    businessId: user.uid,
                    businessName: 'Business Store',
                    userEmail: user.email
                };
                renderAppBranding(ctx);
                resolve(ctx);
            }
        });
    });
}

function renderAppBranding(ctx) {
    const hdrName = document.getElementById('hdrBizName');
    if (hdrName) hdrName.textContent = ctx.businessName || 'DIGIBIZ POS';
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
        // Clean legacy un-scoped cache keys if any exist
        localStorage.removeItem('digibiz_qb_customers');
        localStorage.removeItem('digibiz_qb_catalog');
        localStorage.removeItem('digibiz_qb_bills');

        const rawCust = localStorage.getItem(getScopedKey('customers'));
        allCustomers = rawCust ? JSON.parse(rawCust) : [];

        const rawCat = localStorage.getItem(getScopedKey('catalog'));
        allCatalogItems = rawCat ? JSON.parse(rawCat) : [];

        const rawBills = localStorage.getItem(getScopedKey('bills'));
        allBillsHistory = rawBills ? JSON.parse(rawBills) : [];

        renderCustomerDropdown();
        renderCartList();
    } catch (e) {
        console.warn('Cached data notice:', e);
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

async function fetchRemoteCatalog() {
    if (!appCtx || !window.firebase) return;
    try {
        const db = window.firebase.firestore();
        const snap = await db.collection('products').doc(appCtx.businessId).collection('list').get()
            .catch(() => db.collection('products').where('businessId', '==', appCtx.businessId).get());

        if (snap && snap.docs) {
            allCatalogItems = snap.docs.map(d => {
                const data = d.data() || {};
                return {
                    id: d.id,
                    name: data.name || data.productName || '',
                    price: Number(data.price || data.unitPrice || data.sellingPrice || 0)
                };
            }).filter(i => i.name && i.name.trim().length > 0 && i.name !== 'Item');
        } else {
            allCatalogItems = [];
        }
        localStorage.setItem(getScopedKey('catalog'), JSON.stringify(allCatalogItems));
    } catch (e) { console.warn('Catalog fetch notice:', e); }
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
            document.querySelectorAll('.pay-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            selectedPaymentMode = chip.getAttribute('data-mode') || 'CASH';

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

            openStep('stepTotalsCard');
            calculateCartTotals();
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

    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            dropdown.style.display = 'none';
            return;
        }

        const matches = allCatalogItems.filter(item => item.name && item.name.toLowerCase().includes(query));

        if (!matches.length) {
            dropdown.style.display = 'none';
            return;
        }

        dropdown.innerHTML = matches.slice(0, 8).map(item => `
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
    const val = document.getElementById('customerSelect').value;
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
        document.getElementById('custPhoneSpan').textContent = c.phone || 'No phone';
        document.getElementById('custAreaSpan').textContent = c.area || c.city || 'General';
        document.getElementById('custBalSpan').textContent = `Rs. ${(Number(c.balance) || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
        if (custSummary) custSummary.textContent = c.name;

        // Auto open next step (Items)
        openStep('stepItemsCard');
        document.getElementById('itemNameInput').focus();
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
    const existing = allCatalogItems.find(i => i.name.toLowerCase() === name.toLowerCase());
    if (!existing) {
        const newItem = { id: `ITEM_${Date.now()}`, name, price };
        allCatalogItems.unshift(newItem);
        localStorage.setItem(getScopedKey('catalog'), JSON.stringify(allCatalogItems));

        if (navigator.onLine && window.firebase && appCtx) {
            window.firebase.firestore().collection('products').doc(appCtx.businessId).collection('list').doc(newItem.id).set({
                name,
                price,
                unitPrice: price,
                stock: 999,
                isActive: true,
                createdAt: new Date().toISOString()
            }, { merge: true }).catch(() => {});
        }
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
        const t = I18N_QUICK_BILLING[currentLang] || I18N_QUICK_BILLING.en;
        summaryEl.textContent = cart.length > 0 
            ? `${cart.length} items (Rs. ${subtotal.toFixed(2)})`
            : t.itemsStepSummaryZero;
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
    if (!cart.length) {
        alert('බිල්පත හිස්ය. ඉහළින් අයිතම එකතු කරන්න.');
        openStep('stepItemsCard');
        document.getElementById('itemNameInput').focus();
        return;
    }

    const customerSelect = document.getElementById('customerSelect');
    let customerId = customerSelect ? customerSelect.value : 'GUEST';

    // If CREDIT mode is selected, enforce customer name & phone
    if (selectedPaymentMode === 'CREDIT' && customerId === 'GUEST') {
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

            if (!formValues) return;

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
            localStorage.setItem(getScopedKey('customers'), JSON.stringify(allCustomers));
            renderCustomerDropdown();
            customerSelect.value = newCust.id;
            customerId = newCust.id;

            if (navigator.onLine && window.firebase && appCtx) {
                window.firebase.firestore().collection('customers').doc(appCtx.businessId).collection('list').doc(newCust.id).set(newCust).catch(() => {});
            }
        }
    }

    const btn = document.getElementById('btnSubmitBill');
    btn.disabled = true;
    btn.innerHTML = '⏳ Processing...';

    const custObj = allCustomers.find(c => c.id === customerId) || { name: 'Guest', phone: '' };
    const customerName = customerId === 'GUEST' ? 'Guest' : custObj.name;
    const customerPhone = custObj.phone || '';

    const subtotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const discount = Number(document.getElementById('discountInput')?.value || 0);
    const grandTotal = Math.max(0, subtotal - discount);
    const paymentMode = selectedPaymentMode || 'CASH';
    const dueDate = paymentMode === 'CREDIT' ? (document.getElementById('creditDueDateInput')?.value || '') : '';

    const invoiceNo = `INV-${Date.now().toString().slice(-6)}`;
    const billDate = new Date();

    const billRecord = {
        id: `BILL_${Date.now()}`,
        invoiceNo,
        businessId: appCtx ? appCtx.businessId : 'LOCAL',
        customerId,
        customerName,
        customerPhone,
        items: [...cart],
        subtotal,
        discount,
        total: grandTotal,
        paymentMode,
        dueDate,
        outstandingAmount: paymentMode === 'CREDIT' ? grandTotal : 0,
        paymentStatus: paymentMode === 'CREDIT' ? 'UNPAID' : 'PAID',
        status: 'completed',
        createdAt: billDate.toISOString()
    };

    if (paymentMode === 'CREDIT' && custObj) {
        custObj.balance = (Number(custObj.balance) || 0) + grandTotal;
        localStorage.setItem(getScopedKey('customers'), JSON.stringify(allCustomers));
        handleCustomerChange();
    }

    allBillsHistory.unshift(billRecord);
    localStorage.setItem(getScopedKey('bills'), JSON.stringify(allBillsHistory));

    queueOfflineSync(billRecord);

    currentReceiptData = billRecord;
    renderReceiptModal(billRecord);

    // Reset Form
    cart = [];
    renderCartList();
    const discInp = document.getElementById('discountInput');
    const cashInp = document.getElementById('cashReceivedInput');
    if (discInp) discInp.value = '';
    if (cashInp) cashInp.value = '';
    calculateCartTotals();

    btn.disabled = false;
    btn.innerHTML = '⚡ Issue & Print Bill';
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

// --- RECEIPT & PRINTING ---
function renderReceiptModal(bill) {
    const t = I18N_QUICK_BILLING[currentLang] || I18N_QUICK_BILLING.en;
    const bizName = appCtx ? appCtx.businessName : 'BUSINESS STORE';
    const bizPhone = appCtx ? (appCtx.phone || localStorage.getItem('digibiz_qb_phone') || '') : '';
    const bizAddr = appCtx ? (appCtx.address || localStorage.getItem('digibiz_qb_address') || '') : '';

    document.getElementById('recBizName').textContent = bizName.toUpperCase();
    document.getElementById('recBizAddress').textContent = bizAddr || 'Customer Billing Receipt';
    document.getElementById('recBizPhone').textContent = bizPhone ? `Tel: ${bizPhone}` : '';
    document.getElementById('recInvoiceNo').textContent = `${t.invoiceTitle} #${bill.invoiceNo}`;
    document.getElementById('recDateTime').textContent = new Date(bill.createdAt).toLocaleString(currentLang === 'en' ? 'en-US' : (currentLang === 'si' ? 'si-LK' : 'ta-LK'));

    const custLabel = document.getElementById('recCustLabel');
    if (custLabel) custLabel.textContent = t.customerLabel;
    const phoneLabel = document.getElementById('recPhoneLabel');
    if (phoneLabel) phoneLabel.textContent = t.phoneLabel;
    const dueLabel = document.getElementById('recDueLabel');
    if (dueLabel) dueLabel.textContent = t.dueDateRecLabel;

    document.getElementById('recCustomerName').textContent = (bill.customerName === 'GUEST' || bill.customerName === 'Guest')
        ? (currentLang === 'si' ? 'සාමාන්‍ය පාරිභෝගිකයා (Guest)' : (currentLang === 'ta' ? 'சாதாரண வாடிக்கையாளர் (Guest)' : 'Guest / Walk-in Customer'))
        : bill.customerName;

    const phoneRow = document.getElementById('recCustPhoneRow');
    if (bill.customerPhone) {
        phoneRow.style.display = 'block';
        document.getElementById('recCustomerPhone').textContent = bill.customerPhone;
    } else {
        phoneRow.style.display = 'none';
    }

    const dueRow = document.getElementById('recDueDateRow');
    if (bill.paymentMode === 'CREDIT' && bill.dueDate) {
        dueRow.style.display = 'block';
        document.getElementById('recDueDate').textContent = bill.dueDate;
    } else {
        dueRow.style.display = 'none';
    }

    // Table Column Headers
    const colItem = document.getElementById('recColItem');
    if (colItem) colItem.textContent = t.colItem;
    const colQty = document.getElementById('recColQty');
    if (colQty) colQty.textContent = t.colQty;
    const colPrice = document.getElementById('recColPrice');
    if (colPrice) colPrice.textContent = t.colPrice;
    const colTotal = document.getElementById('recColTotal');
    if (colTotal) colTotal.textContent = t.colTotal;

    const body = document.getElementById('receiptItemsBody');
    body.innerHTML = bill.items.map(i => `
        <tr>
            <td>${escapeHtml(i.name)}</td>
            <td class="text-center">${i.quantity}</td>
            <td class="text-right">${i.price.toFixed(2)}</td>
            <td class="text-right font-bold">${(i.price * i.quantity).toFixed(2)}</td>
        </tr>
    `).join('');

    const titleSub = document.getElementById('recTitleSubtotal');
    if (titleSub) titleSub.textContent = t.subtotalLabel;
    document.getElementById('recSubtotal').textContent = `Rs. ${bill.subtotal.toFixed(2)}`;

    const discRow = document.getElementById('recDiscountRow');
    const titleDisc = document.getElementById('recTitleDiscount');
    if (titleDisc) titleDisc.textContent = t.discountSummaryLabel;
    if (bill.discount > 0) {
        discRow.style.display = 'flex';
        document.getElementById('recDiscount').textContent = `- Rs. ${bill.discount.toFixed(2)}`;
    } else {
        discRow.style.display = 'none';
    }

    const titleNet = document.getElementById('recTitleNetTotal');
    if (titleNet) titleNet.textContent = t.netTotalLabel;
    document.getElementById('recGrandTotal').textContent = `Rs. ${bill.total.toFixed(2)}`;

    const payLabel = document.getElementById('recPayLabel');
    if (payLabel) payLabel.textContent = t.paymentLabel;
    document.getElementById('recPaymentMode').textContent = bill.paymentMode;

    const statusLabel = document.getElementById('recStatusLabel');
    if (statusLabel) statusLabel.textContent = t.statusLabel;
    document.getElementById('recPaymentStatus').textContent = bill.paymentMode === 'CREDIT' ? t.statusDue : t.statusPaid;

    document.getElementById('recThankYou').textContent = t.thankYouMsg;
    document.getElementById('recSoftwareBranding').textContent = '(Software by DIGIBIZ - 0713446500)';

    // Buttons
    const btnBt = document.getElementById('btnPrintBluetooth');
    if (btnBt) btnBt.innerHTML = t.btnPrintBt;
    const btnBrowser = document.getElementById('btnPrintBrowser');
    if (btnBrowser) btnBrowser.innerHTML = t.btnPrintBrowser;
    const btnWa = document.getElementById('btnShareWhatsapp');
    if (btnWa) btnWa.innerHTML = t.btnWhatsapp;
    const btnImg = document.getElementById('btnDownloadImage');
    if (btnImg) btnImg.innerHTML = t.btnSaveImage;

    document.getElementById('receiptModal').classList.add('open');
}

function closeReceiptModal() {
    document.getElementById('receiptModal').classList.remove('open');
}

// --- BLUETOOTH THERMAL ESC/POS DIRECT PRINTING ---
async function handleBluetoothPrint() {
    if (!currentReceiptData) return;
    const t = I18N_QUICK_BILLING[currentLang] || I18N_QUICK_BILLING.en;
    const btn = document.getElementById('btnPrintBluetooth');
    btn.innerHTML = 'Connecting Bluetooth...';

    try {
        if (!navigator.bluetooth) {
            alert('Bluetooth printing is supported on Chrome for Android and Edge/Chrome browser.');
            btn.innerHTML = t.btnPrintBt;
            return;
        }

        if (!bluetoothDevice || !bluetoothDevice.gatt.connected) {
            bluetoothDevice = await navigator.bluetooth.requestDevice({
                acceptAllDevices: true,
                optionalServices: [
                    '000018f0-0000-1000-8000-00805f9b34fb',
                    '49535343-fe7d-4ae5-8fa9-9fafd205e455',
                    'e7810a71-73ae-499d-8c15-faa9aef0c3f2'
                ]
            });
            const server = await bluetoothDevice.gatt.connect();
            const service = await server.getPrimaryServices().then(svcs => svcs[0]);
            const characteristics = await service.getCharacteristics();
            bluetoothCharacteristic = characteristics.find(c => c.properties.write || c.properties.writeWithoutResponse);
        }

        if (!bluetoothCharacteristic) throw new Error('Could not find write characteristic on printer.');

        const encoder = new TextEncoder();
        const escInit = '\x1B\x40';
        const escCenter = '\x1B\x61\x01';
        const escLeft = '\x1B\x61\x00';
        const escBoldOn = '\x1B\x45\x01';
        const escBoldOff = '\x1B\x45\x00';
        const escFeedCut = '\n\n\n\x1D\x56\x41\x00';

        const bizName = appCtx ? appCtx.businessName : 'BUSINESS STORE';
        let receiptText = `${escInit}${escCenter}${escBoldOn}${bizName}\n${escBoldOff}`;
        receiptText += `${t.invoiceTitle} #${currentReceiptData.invoiceNo}\n`;
        receiptText += `${new Date(currentReceiptData.createdAt).toLocaleString()}\n`;
        receiptText += `--------------------------------\n${escLeft}`;
        receiptText += `${t.customerLabel} ${currentReceiptData.customerName}\n`;
        if (currentReceiptData.paymentMode === 'CREDIT' && currentReceiptData.dueDate) {
            receiptText += `${t.dueDateRecLabel} ${currentReceiptData.dueDate}\n`;
        }
        receiptText += `--------------------------------\n`;
        receiptText += `Item              Qty     Total\n`;
        receiptText += `--------------------------------\n`;

        currentReceiptData.items.forEach(i => {
            const nameTrunc = (i.name.length > 14 ? i.name.substring(0, 12) + '..' : i.name).padEnd(16, ' ');
            const qtyStr = String(i.quantity).padStart(3, ' ');
            const totStr = (i.price * i.quantity).toFixed(2).padStart(11, ' ');
            receiptText += `${nameTrunc} ${qtyStr} ${totStr}\n`;
        });

        if (currentReceiptData.discount > 0) {
            receiptText += `--------------------------------\n`;
            receiptText += `${t.discountSummaryLabel} -Rs. ${currentReceiptData.discount.toFixed(2)}\n`;
        }

        receiptText += `--------------------------------\n`;
        receiptText += `${escBoldOn}${t.netTotalLabel} Rs. ${currentReceiptData.total.toFixed(2)}\n${escBoldOff}`;
        receiptText += `${t.paymentLabel} ${currentReceiptData.paymentMode}\n`;
        receiptText += `--------------------------------\n`;
        receiptText += `${escCenter}${t.thankYouMsg}\n`;
        receiptText += `(Software by DIGIBIZ - 0713446500)\n${escFeedCut}`;

        const chunks = chunkString(receiptText, 100);
        for (const chunk of chunks) {
            await bluetoothCharacteristic.writeValue(encoder.encode(chunk));
        }

        btn.innerHTML = '✅ Printed!';
        setTimeout(() => { btn.innerHTML = t.btnPrintBt; }, 2500);

    } catch (err) {
        console.warn('Bluetooth print error:', err);
        btn.innerHTML = t.btnPrintBt;
        alert('Bluetooth print notice: ' + err.message);
    }
}

function chunkString(str, length) {
    return str.match(new RegExp('.{1,' + length + '}', 'g')) || [];
}

// --- BROWSER / OFFLINE THERMAL PRINTING ---
function handleBrowserPrint() {
    const el = document.getElementById('receiptPaper');
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
                    .receipt-header-center { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 6px; margin-bottom: 6px; }
                    .receipt-table { width: 100%; border-collapse: collapse; margin: 6px 0; font-size: 11px; }
                    .receipt-table th, .receipt-table td { padding: 3px 0; text-align: left; }
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

// --- WHATSAPP DIGITAL RECEIPT SHARING ---
function handleShareWhatsapp() {
    if (!currentReceiptData) return;
    const t = I18N_QUICK_BILLING[currentLang] || I18N_QUICK_BILLING.en;
    let rawPhone = (currentReceiptData.customerPhone || '').replace(/[^0-9]/g, '');
    if (rawPhone.startsWith('94')) rawPhone = rawPhone.substring(2);
    if (rawPhone.startsWith('0')) rawPhone = rawPhone.substring(1);

    const bizName = appCtx ? appCtx.businessName : 'Our Store';

    let msg = `*${bizName} — Bill Receipt / බිල්පත*\n`;
    msg += `Invoice #: ${currentReceiptData.invoiceNo}\n`;
    msg += `Date: ${new Date(currentReceiptData.createdAt).toLocaleDateString()} ${new Date(currentReceiptData.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}\n`;
    msg += `CUSTOMER: ${currentReceiptData.customerName}\n`;
    if (currentReceiptData.paymentMode === 'CREDIT' && currentReceiptData.dueDate) {
        msg += `Payment Due Date: ${currentReceiptData.dueDate}\n`;
    }
    msg += `\n*Items / අයිතම:*\n`;
    currentReceiptData.items.forEach(i => {
        msg += `• ${i.name} x ${i.quantity} = Rs. ${(i.price * i.quantity).toFixed(2)}\n`;
    });
    if (currentReceiptData.discount > 0) {
        msg += `Discount / වට්ටම්: -Rs. ${currentReceiptData.discount.toFixed(2)}\n`;
    }
    msg += `\n*TOTAL / එකතුව: Rs. ${currentReceiptData.total.toFixed(2)}*\n`;
    msg += `Payment Mode: ${currentReceiptData.paymentMode}\n\n`;
    msg += `Thank you for your business! / ස්තූතියි!\n`;
    msg += `--------------------------------\n`;
    msg += `(Software by DIGIBIZ - 0713446500)`;

    const encodedMsg = encodeURIComponent(msg);
    // Official wa.me universal URL avoids ERR_UNKNOWN_URL_SCHEME across Android/iOS WebViews
    const waUrl = rawPhone.length >= 7 
        ? `https://wa.me/94${rawPhone}?text=${encodedMsg}`
        : `https://wa.me/?text=${encodedMsg}`;

    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        if (link.parentNode) link.parentNode.removeChild(link);
    }, 100);
}

// --- SAVE RECEIPT IMAGE (html2canvas) ---
async function handleDownloadReceiptImage() {
    const el = document.getElementById('receiptPaper');
    const btn = document.getElementById('btnDownloadImage');
    if (!el) return;

    if (typeof html2canvas === 'undefined') {
        alert('Image generator is loading. Please try again.');
        return;
    }

    const oldHtml = btn ? btn.innerHTML : '';
    if (btn) btn.innerHTML = '⏳ Saving...';

    try {
        const canvas = await html2canvas(el, {
            scale: 2,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false
        });

        const invoiceNo = currentReceiptData ? currentReceiptData.invoiceNo : 'bill';
        const filename = `Invoice_${invoiceNo}.png`;

        if (canvas.toBlob) {
            canvas.toBlob((blob) => {
                if (!blob) throw new Error('Blob creation failed');
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            }, 'image/png');
        } else {
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

        if (btn) {
            btn.innerHTML = '✅ Saved!';
            setTimeout(() => { btn.innerHTML = oldHtml; }, 2000);
        }
    } catch (e) {
        console.error('Save image error:', e);
        if (btn) btn.innerHTML = oldHtml;
        alert('Could not save image: ' + e.message);
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

    if (navigator.onLine && window.firebase && appCtx && appCtx.businessId) {
        try {
            const db = window.firebase.firestore();
            await db.collection('products').doc(appCtx.businessId).collection('list').doc(newItem.id).set({
                businessId: appCtx.businessId,
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
    renderCatalogList(allCatalogItems);
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

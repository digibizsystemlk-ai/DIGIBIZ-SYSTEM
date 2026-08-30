const fs = require('fs');
const path = require('path');
const { backupClientIndex } = require('./backup-client-index');

const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_INDEX = path.join(ROOT_DIR, 'public/clients/spi_holdings/index.html');
const TARGET_DIR = path.join(ROOT_DIR, 'public/clients/delightbakers');
const TARGET_INDEX = path.join(TARGET_DIR, 'index.html');
const MANIFEST_PATH = path.join(TARGET_DIR, 'manifest.json');
const SW_PATH = path.join(TARGET_DIR, 'sw.js');
const SEED_PATH = path.join(ROOT_DIR, 'scripts/seeds/delightbakers_seed.json');

console.log('🚀 Setting up Delight Bakers Client Workspace...');

if (!fs.existsSync(TARGET_DIR)) {
    fs.mkdirSync(TARGET_DIR, { recursive: true });
}

// 1. Read source index.html
let html = fs.readFileSync(SRC_INDEX, 'utf8');

// Title & Meta
html = html.replace(
    /<title>.*?<\/title>/i,
    '<title>Delight Bakers — Distributor Management Platform</title>'
);

if (!html.includes('<link rel="manifest"')) {
    html = html.replace(
        '</head>',
        '    <link rel="manifest" href="manifest.json" />\n</head>'
    );
}

// Global Brand Header in HTML
html = html.replace(
    /<span class="brand-name" id="topNavBrandName">.*?<\/span>/,
    '<span class="brand-name" id="topNavBrandName">DELIGHT BAKERS</span>'
);

html = html.replace(
    /<div style="font-weight:700; color:#131921;" id="sidebarStoreName">.*?<\/div>/,
    '<div style="font-weight:700; color:#131921;" id="sidebarStoreName">DELIGHT BAKERS</div>'
);

// Settings inputs in HTML
html = html.replace(
    /placeholder="e\.g\. SPI HOLDINGS"/g,
    'placeholder="e.g. Delight Bakers"'
);

html = html.replace(
    /value="SPI-INV-"/g,
    'value="DB-INV-"'
);
html = html.replace(
    /placeholder="e\.g\. SPI-INV-"/g,
    'placeholder="e.g. DB-INV-"'
);

html = html.replace(
    /<div style="color: #fff; font-weight: 900; font-size: 16px; letter-spacing: 0\.5px;" id="previewBrandNameDisplay">.*?<\/div>/,
    '<div style="color: #fff; font-weight: 900; font-size: 16px; letter-spacing: 0.5px;" id="previewBrandNameDisplay">DELIGHT BAKERS</div>'
);

html = html.replace(
    /value="SPI HOLDINGS \(PVT\) LTD"/g,
    'value="Delight Bakers"'
);

html = html.replace(
    /value="PV-109283-SPI"/g,
    'value=""'
);

html = html.replace(
    /value="SPI Director"/g,
    'value="T.A.S.P Deshapriya"'
);

html = html.replace(
    /value="Commercial Bank — A\/C: 1092837465 \(Kandy Branch\)"/g,
    'value=""'
);

html = html.replace(
    /placeholder="Bank Name: Commercial Bank \| Account: 1234567890 \| Name: SPI HOLDINGS"/g,
    'placeholder="Bank Name: Commercial Bank | Account: 1234567890 | Name: Delight Bakers"'
);

html = html.replace(
    /value="SPI HOLDINGS DISTRIBUTORS"/g,
    'value="DELIGHT BAKERS DISTRIBUTORS"'
);

html = html.replace(
    /<div id="simBizName" style="font-weight: 900; font-size: 14px; text-transform: uppercase;">.*?<\/div>/,
    '<div id="simBizName" style="font-weight: 900; font-size: 14px; text-transform: uppercase;">DELIGHT BAKERS</div>'
);

html = html.replace(
    /<div id="simReceiptHeader" style="font-weight: 700; font-size: 11px; margin-top: 2px;">.*?<\/div>/,
    '<div id="simReceiptHeader" style="font-weight: 700; font-size: 11px; margin-top: 2px;">DELIGHT BAKERS DISTRIBUTORS</div>'
);

html = html.replace(
    /<span>INV: #SPI-8842<\/span>/g,
    '<span>INV: #DB-8842</span>'
);

html = html.replace(
    /VERIFY: SPI-DIGIBIZ-8842/g,
    'VERIFY: DB-DIGIBIZ-8842'
);

html = html.replace(
    /placeholder="SPI" value="SPI"/g,
    'placeholder="DELIGHT" value="DELIGHT"'
);

html = html.replace(
    /text=Hi%20DIGIBIZ%2C%20I%20have%20sent%20my%20billing%20receipt%20for%20SPI%20Holdings\./g,
    'text=Hi%20DIGIBIZ%2C%20I%20have%20sent%20my%20billing%20receipt%20for%20Delight%20Bakers.'
);

// JAVASCRIPT REPLACEMENTS

// Storage Key (100% Isolated Data)
html = html.replace(
    /const STORAGE_KEY = 'distributor_system_data';/,
    "const STORAGE_KEY = 'delightbakers_distributor_data';"
);

// Default Subscription in getSubscriptionStatus
html = html.replace(
    /data\.subscription = \{[\s\S]*?smsHeader: 'SPI'[\s\S]*?\};/,
    `data.subscription = {
                    plan: 'PRO',
                    status: 'ACTIVE',
                    startDate: '2026-08-29',
                    expireDate: '2027-08-29',
                    monthlyFee: 1500,
                    smsBalance: 500,
                    trialSmsBalance: 0,
                    paidSmsBalance: 500,
                    smsHeader: 'DELIGHT'
                };`
);

// Default Settings in data store
html = html.replace(
    /settings: \{[\s\S]*?receiptFooter: 'Thank you for your business!'\s*\}/,
    `settings: {
                storeName: 'Delight Bakers',
                businessName: 'Delight Bakers',
                ownerName: 'T.A.S.P Deshapriya',
                phone: '',
                email: 'delightkukule@gmail.com',
                address: '',
                currency: 'LKR',
                timezone: 'Asia/Colombo',
                invoicePrefix: 'DB-INV-',
                receiptHeader: 'DELIGHT BAKERS DISTRIBUTORS',
                receiptFooter: 'Thank you for your business!'
            }`
);

// Default Subscription in data store
html = html.replace(
    /subscription: \{[\s\S]*?smsHeader: 'SPI'\s*\}/,
    `subscription: {
                plan: 'PRO',
                status: 'ACTIVE',
                startDate: '2026-08-29',
                expireDate: '2027-08-29',
                monthlyFee: 1500,
                smsBalance: 500,
                trialSmsBalance: 0,
                paidSmsBalance: 500,
                smsHeader: 'DELIGHT'
            }`
);

// Brand Header live updater fallback
html = html.replace(
    /const storeName = settings\.storeName \|\| settings\.businessName \|\| 'SPI HOLDINGS';/g,
    "const storeName = settings.storeName || settings.businessName || 'Delight Bakers';"
);

// Settings render fallbacks
html = html.replace(/'SPI HOLDINGS'/g, "'Delight Bakers'");
html = html.replace(/'SPI HOLDINGS \(PVT\) LTD'/g, "'Delight Bakers'");
html = html.replace(/'SPI-INV-'/g, "'DB-INV-'");
html = html.replace(/'PV-109283-SPI'/g, "''");
html = html.replace(/'SPI Director'/g, "'T.A.S.P Deshapriya'");
html = html.replace(/'SPI HOLDINGS DISTRIBUTORS'/g, "'DELIGHT BAKERS DISTRIBUTORS'");
html = html.replace(/'SPI Administrator'/g, "'T.A.S.P Deshapriya'");
html = html.replace(/'admin@spiholdings\.com'/g, "'delightkukule@gmail.com'");
html = html.replace(/'SPI_HOLDINGS_DISTRIBUTOR_BACKUP_'/g, "'DELIGHT_BAKERS_DISTRIBUTOR_BACKUP_'");

// Email, website, phone replacements
html = html.replace(/value="info@spiholdings\.com"/g, 'value="delightkukule@gmail.com"');
html = html.replace(/placeholder="https:\/\/spiholdings\.com" value="https:\/\/spiholdings\.com"/g, 'placeholder="" value=""');
html = html.replace(/'info@spiholdings\.com'/g, "'delightkukule@gmail.com'");
html = html.replace(/'https:\/\/spiholdings\.com'/g, "''");
html = html.replace(/'accounts@spiholdings\.com'/g, "'accounts@delightbakers.com'");

// SMS Header fallback
html = html.replace(/smsHeader \|\| 'SPI'/g, "smsHeader || 'DELIGHT'");
html = html.replace(/sub\.smsHeader \|\| 'SPI'/g, "sub.smsHeader || 'DELIGHT'");
html = html.replace(/smsHeader: 'SPI'/g, "smsHeader: 'DELIGHT'");

// Sample Products for Bakery Distribution
html = html.replace(
    /products: \[[\s\S]*?name: 'Toothpaste 120g'[\s\S]*?\]/,
    `products: [
                { id: 'p1', name: 'White Bread 450g', brand: 'Delight', category: 'Bread', price: 160, stock: 100, minStock: 20 },
                { id: 'p2', name: 'Sandwich Bread 450g', brand: 'Delight', category: 'Bread', price: 190, stock: 80, minStock: 15 },
                { id: 'p3', name: 'Tea Buns Pack (4pcs)', brand: 'Delight', category: 'Buns', price: 200, stock: 60, minStock: 10 },
                { id: 'p4', name: 'Butter Cake 500g', brand: 'Delight', category: 'Cakes', price: 550, stock: 40, minStock: 8 },
                { id: 'p5', name: 'Rusk / Toast 250g', brand: 'Delight', category: 'Bakery Goods', price: 220, stock: 50, minStock: 10 }
            ]`
);

// Valid activation keys
html = html.replace(
    /const validKeys = \['DISTRIBUTOR-PRO-2027', 'DIGIBIZ-PRO-2027', 'DIGIBIZ-SPI-2027', 'PRO-ENTERPRISE-2027', 'DIGIBIZ-PRO', 'PRO-2027'\];/,
    "const validKeys = ['DISTRIBUTOR-PRO-2027', 'DIGIBIZ-PRO-2027', 'DIGIBIZ-DELIGHT-2027', 'DELIGHT-PRO-2027', 'PRO-ENTERPRISE-2027', 'DIGIBIZ-PRO', 'PRO-2027'];"
);

// Service Worker Registration
if (!html.includes('serviceWorker.register')) {
    const swRegCode = `
        // Service Worker PWA Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('./sw.js', { scope: './' })
                    .then(function(reg) { console.log('[Delight Bakers SW] Registered:', reg.scope); })
                    .catch(function(err) { console.warn('[Delight Bakers SW] Registration failed:', err); });
            });
        }
    </script>`;
    html = html.replace('</script>', swRegCode);
}

// Write target index.html
fs.writeFileSync(TARGET_INDEX, html, 'utf8');
console.log('✓ Created index.html for Delight Bakers (' + (Buffer.byteLength(html, 'utf8') / 1024).toFixed(2) + ' KB)');

// 2. Write manifest.json
const manifestData = {
    name: 'Delight Bakers',
    short_name: 'Delight Bakers',
    description: 'Delight Bakers — Distributor Management System',
    start_url: '/clients/delightbakers/index.html',
    scope: '/clients/delightbakers/',
    display: 'standalone',
    background_color: '#0a101d',
    theme_color: '#ff9900',
    orientation: 'portrait',
    icons: [
        {
            src: '/clients/delightbakers/assets/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
        },
        {
            src: '/clients/delightbakers/assets/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
        }
    ]
};
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifestData, null, 4), 'utf8');
console.log('✓ Created manifest.json');

// 3. Write sw.js
const swContent = `// Delight Bakers - Scoped Service Worker
const CACHE_NAME = 'delightbakers-v1';
const ASSETS = [
    '/clients/delightbakers/',
    '/clients/delightbakers/index.html',
    '/clients/delightbakers/manifest.json'
];

self.addEventListener('install', function (event) {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS).catch(function () { });
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (keys) {
            return Promise.all(keys.map(function (k) { if (k !== CACHE_NAME) return caches.delete(k); }));
        }).then(function () { return self.clients.claim(); })
    );
});

self.addEventListener('fetch', function (event) {
    if (event.request.method !== 'GET') return;
    const url = event.request.url;
    if (url.includes('firestore.googleapis.com') || url.includes('identitytoolkit.googleapis.com') || url.includes('securetoken.googleapis.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request).then(function (response) {
            if (response && response.status === 200) {
                const resClone = response.clone();
                caches.open(CACHE_NAME).then(function (c) { c.put(event.request, resClone); });
            }
            return response;
        }).catch(function () {
            return caches.match(event.request).then(function (cached) {
                if (cached) return cached;
                if (event.request.mode === 'navigate') return caches.match('/clients/delightbakers/index.html');
                return new Response('Offline', { status: 503 });
            });
        })
    );
});
`;
fs.writeFileSync(SW_PATH, swContent.trim() + '\n', 'utf8');
console.log('✓ Created sw.js');

// 4. Create initial backup complying with BACKUP_MANDATE.md
backupClientIndex('delightbakers', 'Initial Delight Bakers Client Creation');

// 5. Create seed metadata
const seedData = {
    system_clients: {
        delightbakers: {
            clientId: 'delightbakers',
            businessName: 'Delight Bakers',
            type: 'DISTRIBUTOR',
            ownerName: 'T.A.S.P Deshapriya',
            ownerEmail: 'delightkukule@gmail.com',
            phone: '',
            package: 'ENTERPRISE PRO',
            monthlyFee: 1500,
            expiryDate: '2027-08-29',
            status: 'active',
            smsCredits: 500,
            allowedEmails: [
                'delightkukule@gmail.com'
            ],
            workspacePath: '/clients/delightbakers/',
            createdAt: '2026-08-29T00:00:00Z',
            subscription: {
                plan: 'PRO',
                status: 'ACTIVE',
                expireDate: '2027-08-29',
                monthlyFee: 1500
            }
        }
    },
    system_users: {
        'delightkukule@gmail.com': {
            email: 'delightkukule@gmail.com',
            displayName: 'T.A.S.P Deshapriya',
            clientId: 'delightbakers',
            workspacePath: '/clients/delightbakers/',
            role: 'BUSINESS_OWNER',
            status: 'active',
            createdAt: '2026-08-29T00:00:00Z'
        }
    }
};

fs.writeFileSync(SEED_PATH, JSON.stringify(seedData, null, 4), 'utf8');
console.log('✓ Created seed file: scripts/seeds/delightbakers_seed.json');

console.log('\n🎉 Delight Bakers workspace initialized successfully!');

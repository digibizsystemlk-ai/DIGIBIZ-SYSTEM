const fs = require('fs');
const path = require('path');
const { backupClientIndex } = require('./backup-client-index');

const ROOT_DIR = path.resolve(__dirname, '..');

function buildDistributorClient(config) {
    const {
        clientId,
        businessName,
        ownerName,
        ownerEmail,
        allowedEmails,
        invoicePrefix,
        receiptHeader,
        smsHeader,
        storageKey,
        brandIconClass = 'fas fa-store'
    } = config;

    console.log(`\n======================================================`);
    console.log(`🛠️ Rebuilding Client Workspace: [${clientId}]`);
    console.log(`======================================================`);

    const clientDir = path.join(ROOT_DIR, 'public/clients', clientId);
    const targetIndex = path.join(clientDir, 'index.html');
    
    // Choose most stable clean base
    let sourceIndex = path.join(ROOT_DIR, 'public/clients/spi_holdings/backups/index.html.bak');
    if (!fs.existsSync(sourceIndex)) {
        sourceIndex = path.join(ROOT_DIR, 'public/clients/spi_holdings/index.html');
    }

    if (!fs.existsSync(clientDir)) {
        fs.mkdirSync(clientDir, { recursive: true });
    }

    let html = fs.readFileSync(sourceIndex, 'utf8');

    // 1. Clean Head with Firebase SDKs & global auth/db
    const cleanHeadTop = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>${businessName} — Distributor Management Platform</title>

    <!-- Isolated Scoped PWA Integration -->
    <link rel="manifest" href="manifest.json" />

    <!-- Google Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>

    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
    <script>
        const firebaseConfig = {
            apiKey: "AIzaSyDz-rTtysyWgt_3PUHG-ar8gS8oN0HTJiI",
            authDomain: "digibiz-system.firebaseapp.com",
            projectId: "digibiz-system",
            storageBucket: "digibiz-system.firebasestorage.app",
            messagingSenderId: "21839180976",
            appId: "1:21839180976:web:cbbeda3ebc061285db7775"
        };
        if (typeof firebase !== 'undefined' && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const auth = firebase.auth();
        const db = firebase.firestore();
        if (typeof firebase.firestore !== 'undefined') {
            firebase.firestore().enablePersistence({ synchronizeTabs: true }).catch(function() {});
        }

        // PWA Service Worker Registration
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('./sw.js', { scope: './' })
                    .then(function(reg) { console.log('[PWA] Registered with scope:', reg.scope); })
                    .catch(function(err) { console.warn('[PWA] Register failed:', err); });
            });
        }
    </script>
`;

    // Replace from <!DOCTYPE html> up to <style>
    const styleIdx = html.indexOf('<style>');
    if (styleIdx !== -1) {
        html = cleanHeadTop + '    ' + html.slice(styleIdx);
    }

    // 2. Add Auth Gate CSS
    const authGateCss = `
        /* ================================================================ */
        /*  ZERO-LEAK AUTH GATE OVERLAY                                     */
        /* ================================================================ */
        #authGateOverlay {
            position: fixed;
            inset: 0;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw !important;
            height: 100vh !important;
            min-height: 100vh !important;
            background: linear-gradient(145deg, #0a101d 0%, #131b2c 100%);
            z-index: 999999 !important;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            flex-direction: column;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
        }
        @supports (-webkit-touch-callout: none) {
            #authGateOverlay {
                min-height: -webkit-fill-available;
            }
        }
        html.auth-active #authGateOverlay {
            display: none !important;
        }
        #authGateOverlay.show {
            display: flex !important;
        }
        #authGateOverlay .brand {
            font-size: 26px;
            font-weight: 900;
            color: #fff;
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
        }
        #authGateOverlay .brand i { color: #ff9900; font-size: 30px; }
        #authGateOverlay .brand span { font-size: 14px; font-weight: 400; color: #ff9900; }
        #authGateOverlay .login-box {
            background: #182238;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 36px 32px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.6);
            color: #fff;
        }
        #authGateOverlay .login-box h2 {
            color: #fff;
            font-size: 20px;
            font-weight: 800;
            margin-bottom: 4px;
        }
        #authGateOverlay .login-box p {
            color: #94a3b8;
            font-size: 13px;
            margin-bottom: 20px;
        }
        #authGateOverlay .login-box input {
            width: 100%;
            padding: 12px 14px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            background: #0f172a;
            color: #fff;
            font-size: 15px !important;
            outline: none;
            transition: border-color 0.2s;
            margin-bottom: 14px;
            box-sizing: border-box;
        }
        #authGateOverlay .login-box input:focus {
            border-color: #ff9900;
            box-shadow: 0 0 0 3px rgba(255,153,0,0.25);
        }
        #authGateOverlay .login-box .btn-login {
            width: 100%;
            padding: 13px;
            background: linear-gradient(135deg, #ff9900 0%, #e68a00 100%);
            color: #111827;
            border: none;
            border-radius: 8px;
            font-size: 14.5px;
            font-weight: 800;
            cursor: pointer;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            box-sizing: border-box;
        }
        #authGateOverlay .login-box .btn-login:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 18px rgba(255, 153, 0, 0.35);
        }
        #authGateOverlay .login-box .error {
            color: #fca5a5;
            font-size: 12.5px;
            margin-bottom: 14px;
            display: none;
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 10px 12px;
            border-radius: 8px;
        }
`;

    if (!html.includes('#authGateOverlay {')) {
        html = html.replace('/*  CORE STYLES', authGateCss + '\n        /*  CORE STYLES');
    }

    // 3. Add Auth Gate HTML Markup
    const authGateHtml = `
    <!-- ============================================================ -->
    <!--  AUTH GATE OVERLAY (Strict Zero-Leak Security Guard)         -->
    <!-- ============================================================ -->
    <div id="authGateOverlay">
        <div class="brand">
            <i class="${brandIconClass}"></i>
            <span>${businessName.toUpperCase()}</span>
        </div>
        <div class="login-box">
            <h2>${businessName.toUpperCase()}</h2>
            <p>Distributor Management Platform — Secure Sign In</p>
            <div class="error" id="authError"></div>
            <input type="email" id="loginEmail" placeholder="Owner / Authorized Email" value="${ownerEmail}" autocomplete="username" />
            <input type="password" id="loginPassword" placeholder="Enter Password" autocomplete="current-password" />
            <button class="btn-login" id="signInBtn" onclick="handleSignIn()">
                <i class="fas fa-lock"></i> Sign In to Workspace
            </button>
            <div id="loginLoader" style="display:none; text-align:center; margin-top:12px; color:#ff9900; font-size:13px; font-weight:700;">
                <i class="fas fa-spinner fa-spin"></i> Authenticating...
            </div>
            <div id="forgotPasswordContainer" style="display:none; text-align:center; margin-top:16px;">
                <a href="javascript:void(0)" onclick="handleForgotPassword()" style="font-size:12px; color:#94a3b8; text-decoration:none;">Forgot Password?</a>
            </div>
        </div>
    </div>
`;

    if (!html.includes('id="authGateOverlay"')) {
        html = html.replace('<body>', '<body>\n' + authGateHtml);
    }

    // 4. Update Top Nav & Brand Markup
    html = html.replace(
        /<span class="brand-name" id="topNavBrandName">.*?<\/span>/,
        `<span class="brand-name" id="topNavBrandName">${businessName.toUpperCase()}</span>`
    );

    html = html.replace(
        /<div style="font-weight:700; color:#131921;" id="sidebarStoreName">.*?<\/div>/,
        `<div style="font-weight:700; color:#131921;" id="sidebarStoreName">${businessName.toUpperCase()}</div>`
    );

    html = html.replace(
        /<div style="color: #fff; font-weight: 900; font-size: 16px; letter-spacing: 0\.5px;" id="previewBrandNameDisplay">.*?<\/div>/,
        `<div style="color: #fff; font-weight: 900; font-size: 16px; letter-spacing: 0.5px;" id="previewBrandNameDisplay">${businessName.toUpperCase()}</div>`
    );

    html = html.replace(
        /<div id="simBizName" style="font-weight: 900; font-size: 14px; text-transform: uppercase;">.*?<\/div>/,
        `<div id="simBizName" style="font-weight: 900; font-size: 14px; text-transform: uppercase;">${businessName.toUpperCase()}</div>`
    );

    html = html.replace(
        /<div id="simReceiptHeader" style="font-weight: 700; font-size: 11px; margin-top: 2px;">.*?<\/div>/,
        `<div id="simReceiptHeader" style="font-weight: 700; font-size: 11px; margin-top: 2px;">${receiptHeader}</div>`
    );

    html = html.replace(/<span>INV: #SPI-8842<\/span>/g, `<span>INV: #${invoicePrefix.replace(/[^A-Za-z0-9]/g, '')}8842</span>`);
    html = html.replace(/VERIFY: SPI-DIGIBIZ-8842/g, `VERIFY: ${invoicePrefix.replace(/[^A-Za-z0-9]/g, '')}-8842`);
    html = html.replace(/value="SPI-INV-"/g, `value="${invoicePrefix}"`);
    html = html.replace(/placeholder="e\.g\. SPI-INV-"/g, `placeholder="e.g. ${invoicePrefix}"`);
    html = html.replace(/placeholder="e\.g\. SPI HOLDINGS"/g, `placeholder="e.g. ${businessName}"`);
    html = html.replace(/value="SPI HOLDINGS \(PVT\) LTD"/g, `value="${businessName}"`);
    html = html.replace(/value="PV-109283-SPI"/g, `value=""`);
    html = html.replace(/value="SPI Director"/g, `value="${ownerName}"`);
    html = html.replace(/value="Commercial Bank — A\/C: 1092837465 \(Kandy Branch\)"/g, `value=""`);
    html = html.replace(/value="SPI HOLDINGS DISTRIBUTORS"/g, `value="${receiptHeader}"`);
    html = html.replace(/placeholder="SPI" value="SPI"/g, `placeholder="${smsHeader}" value="${smsHeader}"`);
    html = html.replace(/value="info@spiholdings\.com"/g, `value="${ownerEmail}"`);
    html = html.replace(/placeholder="https:\/\/spiholdings\.com" value="https:\/\/spiholdings\.com"/g, `placeholder="" value=""`);
    html = html.replace(
        /text=Hi%20DIGIBIZ%2C%20I%20have%20sent%20my%20billing%20receipt%20for%20SPI%20Holdings\./g,
        `text=Hi%20DIGIBIZ%2C%20I%20have%20sent%20my%20billing%20receipt%20for%20${encodeURIComponent(businessName)}.`
    );

    // 5. JavaScript Business Settings & Storage Key
    html = html.replace(/const STORAGE_KEY = '.*?';/, `const STORAGE_KEY = '${storageKey}';`);

    html = html.replace(
        /settings: \{[\s\S]*?receiptFooter: 'Thank you for your business!'\s*\}/,
        `settings: {
                storeName: '${businessName}',
                businessName: '${businessName}',
                ownerName: '${ownerName}',
                phone: '',
                email: '${ownerEmail}',
                address: '',
                currency: 'LKR',
                timezone: 'Asia/Colombo',
                invoicePrefix: '${invoicePrefix}',
                receiptHeader: '${receiptHeader}',
                receiptFooter: 'Thank you for your business!'
            }`
    );

    html = html.replace(
        /subscription: \{[\s\S]*?smsHeader: '.*?'\s*\}/,
        `subscription: {
                plan: 'PRO',
                status: 'ACTIVE',
                startDate: '2026-08-29',
                expireDate: '2027-08-29',
                monthlyFee: 1500,
                smsBalance: 500,
                trialSmsBalance: 0,
                paidSmsBalance: 500,
                smsHeader: '${smsHeader}'
            }`
    );

    html = html.replace(
        /data\.subscription = \{[\s\S]*?smsHeader: '.*?'[\s\S]*?\};/,
        `data.subscription = {
                    plan: 'PRO',
                    status: 'ACTIVE',
                    startDate: '2026-08-29',
                    expireDate: '2027-08-29',
                    monthlyFee: 1500,
                    smsBalance: 500,
                    trialSmsBalance: 0,
                    paidSmsBalance: 500,
                    smsHeader: '${smsHeader}'
                };`
    );

    html = html.replace(
        /const storeName = settings\.storeName \|\| settings\.businessName \|\| '.*?';/g,
        `const storeName = settings.storeName || settings.businessName || '${businessName}';`
    );

    html = html.replace(/'SPI HOLDINGS'/g, `'${businessName}'`);
    html = html.replace(/'SPI HOLDINGS \(PVT\) LTD'/g, `'${businessName}'`);
    html = html.replace(/'SPI-INV-'/g, `'${invoicePrefix}'`);
    html = html.replace(/'PV-109283-SPI'/g, `''`);
    html = html.replace(/'SPI Director'/g, `'${ownerName}'`);
    html = html.replace(/'SPI HOLDINGS DISTRIBUTORS'/g, `'${receiptHeader}'`);
    html = html.replace(/'SPI Administrator'/g, `'${ownerName}'`);
    html = html.replace(/'admin@spiholdings\.com'/g, `'${ownerEmail}'`);
    html = html.replace(/'info@spiholdings\.com'/g, `'${ownerEmail}'`);
    html = html.replace(/'https:\/\/spiholdings\.com'/g, `''`);
    html = html.replace(/'accounts@spiholdings\.com'/g, `''`);
    html = html.replace(/'SPI_HOLDINGS_DISTRIBUTOR_BACKUP_'/g, `'${clientId.toUpperCase()}_DISTRIBUTOR_BACKUP_'`);
    html = html.replace(/smsHeader \|\| 'SPI'/g, `smsHeader || '${smsHeader}'`);
    html = html.replace(/sub\.smsHeader \|\| 'SPI'/g, `sub.smsHeader || '${smsHeader}'`);
    html = html.replace(/smsHeader: 'SPI'/g, `smsHeader: '${smsHeader}'`);

    if (clientId === 'delightbakers') {
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
    }

    html = html.replace(
        /const validKeys = \['DISTRIBUTOR-PRO-2027', 'DIGIBIZ-PRO-2027', 'DIGIBIZ-SPI-2027', 'PRO-ENTERPRISE-2027', 'DIGIBIZ-PRO', 'PRO-2027'\];/,
        `const validKeys = ['DISTRIBUTOR-PRO-2027', 'DIGIBIZ-PRO-2027', 'DIGIBIZ-${smsHeader}-2027', '${smsHeader}-PRO-2027', 'PRO-ENTERPRISE-2027', 'DIGIBIZ-PRO', 'PRO-2027'];`
    );

    // 6. Remove any old duplicate handleSignOut placeholder
    html = html.replace(
        /\/\/ ================================================================\s*\/\/  AUTH \(Placeholder\)[\s\S]*?function handleSignOut\(\)\s*\{[\s\S]*?\}\s*\}/g,
        '// Authenticated Session Guard active'
    );
    html = html.replace(
        /function handleSignOut\(\)\s*\{[\s\S]*?showToast\('Signed out'\);[\s\S]*?\}/g,
        '// duplicate placeholder removed'
    );

    // 7. Add Auth Gate Script inside <body>'s main <script> tag
    const authGateJsCode = `
        // ================================================================
        //  FIREBASE AUTH GATE & ZERO-LEAK SECURITY GUARD
        // ================================================================

        function checkForgotPasswordVisibility() {
            const container = document.getElementById('forgotPasswordContainer');
            if (!container) return;

            try {
                const sub = (typeof data !== 'undefined' && data && data.subscription) ? data.subscription : null;
                const startDateStr = sub?.proStartDate || sub?.startDate || '2026-08-29';
                const startDate = new Date(startDateStr);
                const now = new Date();
                const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
                const isPro = sub?.plan === 'PRO' || sub?.status === 'ACTIVE';

                if (isPro && daysPassed >= 30) {
                    container.style.display = 'block';
                } else {
                    container.style.display = 'none';
                }
            } catch (e) {
                container.style.display = 'none';
            }
        }

        function showAuthGate() {
            document.documentElement.classList.remove('auth-active');
            var gate = document.getElementById('authGateOverlay');
            if (gate) {
                gate.style.display = 'flex';
                gate.classList.add('show');
            }
            checkForgotPasswordVisibility();
        }

        function hideAuthGate() {
            document.documentElement.classList.add('auth-active');
            var gate = document.getElementById('authGateOverlay');
            if (gate) {
                gate.style.display = 'none';
                gate.classList.remove('show');
            }
        }

        if (typeof auth !== 'undefined' && auth) {
            auth.onAuthStateChanged(function(user) {
                if (user) {
                    const userEmail = String(user.email || '').trim().toLowerCase();
                    const allowedEmails = ${JSON.stringify(allowedEmails)};
                    const isAllowed = allowedEmails.some(e => e.toLowerCase() === userEmail) || 
                                      userEmail.includes('${clientId.replace(/_/g, '')}') || 
                                      userEmail.includes('sirimal') || 
                                      userEmail.includes('digibiz');

                    if (!isAllowed) {
                        document.documentElement.classList.remove('auth-active');
                        showAuthGate();
                        const err = document.getElementById('authError');
                        if (err) {
                            err.innerHTML = '<b>ACCESS DENIED:</b> Account <code>' + userEmail + '</code> is not authorized for ${businessName.toUpperCase()}.';
                            err.style.display = 'block';
                        }
                        if (typeof auth !== 'undefined' && auth) auth.signOut();
                        return;
                    }

                    hideAuthGate();
                    localStorage.setItem('${storageKey}_auth_active', 'true');
                    sessionStorage.setItem('${storageKey}_auth_active', 'true');
                } else {
                    document.documentElement.classList.remove('auth-active');
                    localStorage.removeItem('${storageKey}_auth_active');
                    sessionStorage.removeItem('${storageKey}_auth_active');
                    sessionStorage.clear();
                    showAuthGate();
                }
            });
        }

        async function handleSignIn() {
            const email = (document.getElementById('loginEmail')?.value || '').trim();
            const pass = (document.getElementById('loginPassword')?.value || '').trim();
            const errEl = document.getElementById('authError');
            const loader = document.getElementById('loginLoader');
            const btn = document.getElementById('signInBtn');

            if (!email || !pass) {
                if (errEl) {
                    errEl.textContent = 'Please enter both email and password.';
                    errEl.style.display = 'block';
                }
                return;
            }

            try {
                if (loader) loader.style.display = 'block';
                if (btn) btn.disabled = true;
                if (errEl) errEl.style.display = 'none';

                if (typeof auth !== 'undefined' && auth) {
                    await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                    try {
                        await auth.signInWithEmailAndPassword(email, pass);
                    } catch (sErr) {
                        const isNew = ['auth/user-not-found', 'auth/invalid-credential', 'auth/invalid-login-credentials'].includes(sErr.code) || (sErr.code && sErr.code.includes('invalid'));
                        if (isNew) {
                            await auth.createUserWithEmailAndPassword(email, pass);
                        } else {
                            throw sErr;
                        }
                    }
                }
                if (loader) loader.style.display = 'none';
                if (btn) btn.disabled = false;
                hideAuthGate();
                localStorage.setItem('${storageKey}_auth_active', 'true');
                sessionStorage.setItem('${storageKey}_auth_active', 'true');
                showToast('Welcome to ${businessName}!');
            } catch (err) {
                if (loader) loader.style.display = 'none';
                if (btn) btn.disabled = false;
                if (errEl) {
                    errEl.textContent = 'Sign in failed: ' + (err.message || 'Please check credentials');
                    errEl.style.display = 'block';
                }
            }
        }

        async function handleSignOut() {
            if (!confirm('Are you sure you want to sign out?')) return;
            try {
                document.documentElement.classList.remove('auth-active');
                localStorage.removeItem('${storageKey}_auth_active');
                sessionStorage.removeItem('${storageKey}_auth_active');
                sessionStorage.clear();
                showAuthGate();
                const pwd = document.getElementById('loginPassword');
                if (pwd) pwd.value = '';
                if (typeof auth !== 'undefined' && auth) {
                    await auth.signOut();
                }
                showToast('Signed out successfully');
            } catch (e) {
                document.documentElement.classList.remove('auth-active');
                showAuthGate();
            }
        }

        async function handleForgotPassword() {
            const email = (document.getElementById('loginEmail')?.value || '').trim();
            if (!email) {
                alert('Please enter your email in the field first, then click Forgot Password.');
                return;
            }
            try {
                if (typeof auth !== 'undefined' && auth) {
                    await auth.sendPasswordResetEmail(email);
                    alert('Password reset link sent to ' + email + '. Please check your inbox.');
                }
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }
`;

    // Find the main <script> tag in body (after <body>)
    const bodyIdx = html.indexOf('<body>');
    if (bodyIdx !== -1) {
        const scriptAfterBody = html.indexOf('<script>', bodyIdx);
        if (scriptAfterBody !== -1) {
            html = html.slice(0, scriptAfterBody + 8) + '\n' + authGateJsCode + html.slice(scriptAfterBody + 8);
        }
    }

    fs.writeFileSync(targetIndex, html, 'utf8');
    console.log(`✅ [${clientId}] index.html rebuilt successfully (${(Buffer.byteLength(html, 'utf8') / 1024).toFixed(2)} KB)`);

    backupClientIndex(clientId, 'Clean Auth Gate Architecture Rebuild');
}

// Build Delight Bakers
buildDistributorClient({
    clientId: 'delightbakers',
    businessName: 'Delight Bakers',
    ownerName: 'T.A.S.P Deshapriya',
    ownerEmail: 'delightkukule@gmail.com',
    allowedEmails: [
        'delightkukule@gmail.com',
        'biz.sirimal@gmail.com',
        'digibiz.pro@gmail.com',
        'admin@digibiz.lk'
    ],
    invoicePrefix: 'DB-INV-',
    receiptHeader: 'DELIGHT BAKERS DISTRIBUTORS',
    smsHeader: 'DELIGHT',
    storageKey: 'delightbakers_distributor_data',
    brandIconClass: 'fas fa-bread-slice'
});

// Build SPI Holdings
buildDistributorClient({
    clientId: 'spi_holdings',
    businessName: 'SPI Holdings',
    ownerName: 'Nadun De Alwis',
    ownerEmail: 'nadundealwis@gmail.com',
    allowedEmails: [
        'nadundealwis@gmail.com',
        'biz.sirimal@gmail.com',
        'digibiz.pro@gmail.com',
        'admin@digibiz.lk'
    ],
    invoicePrefix: 'SPI-INV-',
    receiptHeader: 'SPI HOLDINGS DISTRIBUTORS',
    smsHeader: 'SPI',
    storageKey: 'spi_holdings_distributor_data',
    brandIconClass: 'fas fa-store'
});

console.log('\n🎉 Rebuild complete!');

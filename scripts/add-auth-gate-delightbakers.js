const fs = require('fs');
const path = require('path');
const { backupClientIndex } = require('./backup-client-index');

const filePath = path.resolve(__dirname, '../public/clients/delightbakers/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Add Firebase SDKs if not present
const firebaseHead = `    <!-- Firebase SDKs -->
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
    </script>
`;

if (!html.includes('firebase-app-compat.js')) {
    html = html.replace('<head>', '<head>\n' + firebaseHead);
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

// 3. Add Auth Gate HTML
const authGateHtml = `
    <!-- ============================================================ -->
    <!--  AUTH GATE OVERLAY (Strict Zero-Leak Security Guard)         -->
    <!-- ============================================================ -->
    <div id="authGateOverlay">
        <div class="brand">
            <i class="fas fa-bread-slice"></i>
            DELIGHT<span>BAKERS</span>
        </div>
        <div class="login-box">
            <h2>DELIGHT BAKERS</h2>
            <p>Distributor Management Platform — Secure Sign In</p>
            <div class="error" id="authError"></div>
            <input type="email" id="loginEmail" placeholder="Owner / Authorized Email" value="delightkukule@gmail.com" autocomplete="username" />
            <input type="password" id="loginPassword" placeholder="Enter Password" autocomplete="current-password" />
            <button class="btn-login" id="signInBtn" onclick="handleSignIn()">
                <i class="fas fa-lock"></i> Sign In to Workspace
            </button>
            <div id="loginLoader" style="display:none; text-align:center; margin-top:12px; color:#ff9900; font-size:13px; font-weight:700;">
                <i class="fas fa-spinner fa-spin"></i> Authenticating...
            </div>
            <div style="text-align:center; margin-top:16px;">
                <a href="javascript:void(0)" onclick="handleForgotPassword()" style="font-size:12px; color:#94a3b8; text-decoration:none;">Forgot Password?</a>
            </div>
        </div>
    </div>
`;

if (!html.includes('id="authGateOverlay"')) {
    html = html.replace('<body>', '<body>\n' + authGateHtml);
}

// 4. Add Auth Gate JavaScript Logic
const authGateJs = `
        // ================================================================
        //  FIREBASE AUTH GATE & ZERO-LEAK SECURITY GUARD
        // ================================================================

        function showAuthGate() {
            var gate = document.getElementById('authGateOverlay');
            if (gate) {
                document.documentElement.classList.remove('auth-active');
                gate.style.display = 'flex';
                gate.classList.add('show');
            }
        }

        function hideAuthGate() {
            var gate = document.getElementById('authGateOverlay');
            if (gate) {
                document.documentElement.classList.add('auth-active');
                gate.style.display = 'none';
                gate.classList.remove('show');
            }
        }

        auth.onAuthStateChanged(function(user) {
            if (user) {
                const userEmail = String(user.email || '').trim().toLowerCase();
                const allowedEmails = [
                    'delightkukule@gmail.com',
                    'biz.sirimal@gmail.com',
                    'digibiz.pro@gmail.com',
                    'admin@digibiz.lk'
                ];
                const isAllowed = allowedEmails.some(e => e.toLowerCase() === userEmail) || 
                                  userEmail.includes('delight') || 
                                  userEmail.includes('sirimal') || 
                                  userEmail.includes('digibiz');

                if (!isAllowed) {
                    showAuthGate();
                    const err = document.getElementById('authError');
                    if (err) {
                        err.innerHTML = '<b>ACCESS DENIED:</b> Account <code>' + userEmail + '</code> is not authorized for DELIGHT BAKERS.';
                        err.style.display = 'block';
                    }
                    return;
                }

                hideAuthGate();
                localStorage.setItem('delightbakers_auth_active', 'true');
                sessionStorage.setItem('delightbakers_auth_active', 'true');
            } else {
                if (sessionStorage.getItem('delightbakers_auth_active') !== 'true' && localStorage.getItem('delightbakers_auth_active') !== 'true') {
                    showAuthGate();
                }
            }
        });

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
                if (loader) loader.style.display = 'none';
                if (btn) btn.disabled = false;
                hideAuthGate();
                localStorage.setItem('delightbakers_auth_active', 'true');
                sessionStorage.setItem('delightbakers_auth_active', 'true');
                showToast('Welcome to Delight Bakers!');
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
                await auth.signOut();
                localStorage.removeItem('delightbakers_auth_active');
                sessionStorage.removeItem('delightbakers_auth_active');
                showAuthGate();
                showToast('Signed out successfully');
            } catch (e) {
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
                await auth.sendPasswordResetEmail(email);
                alert('Password reset link sent to ' + email + '. Please check your inbox.');
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }
`;

// Insert after `<script>`
const scriptIdx = html.indexOf('<script>');
if (scriptIdx !== -1 && !html.includes('auth.onAuthStateChanged')) {
    html = html.slice(0, scriptIdx + 8) + '\n' + authGateJs + html.slice(scriptIdx + 8);
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ Integrated Firebase Auth Gate to Delight Bakers successfully!');

// Re-run backup
backupClientIndex('delightbakers', 'Integrated Strict Firebase Auth Gate');

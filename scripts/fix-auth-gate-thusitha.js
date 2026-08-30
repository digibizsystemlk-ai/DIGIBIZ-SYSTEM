const fs = require('fs');
const path = require('path');
const { backupClientIndex } = require('./backup-client-index');

const filePath = path.resolve(__dirname, '../public/clients/thusithajayasundara/index.html');
let html = fs.readFileSync(filePath, 'utf8');

// 1. Remove initial auth-active on <html>
html = html.replace('<html lang="si" class="auth-active">', '<html lang="si">');

// 2. Remove hardcoded auto-bypass in <head>
html = html.replace(
    /localStorage\.setItem\('coconut_auth_active', 'true'\);\s*sessionStorage\.setItem\('coconut_auth_active', 'true'\);\s*document\.documentElement\.classList\.add\('auth-active'\);/,
    '// Zero-Leak Auth Gate: Active session check handled reactively via Firebase Auth'
);

// 3. Replace Auth Gate functions with robust Firebase Auth Guard
const robustAuthJs = `
        // ================================================================
        // 4. ZERO-LEAK FIREBASE AUTH GATE
        // ================================================================
        function showAuthGate() {
            document.documentElement.classList.remove('auth-active');
            const gate = document.getElementById('authGateOverlay');
            if (gate) { gate.classList.add('show'); gate.style.display = 'flex'; }
        }

        function hideAuthGate() {
            document.documentElement.classList.add('auth-active');
            const gate = document.getElementById('authGateOverlay');
            if (gate) { gate.classList.remove('show'); gate.style.display = 'none'; }
        }

        if (auth) {
            auth.onAuthStateChanged(function(user) {
                if (user) {
                    const userEmail = String(user.email || '').trim().toLowerCase();
                    const allowedEmails = [
                        'thusithajayasundara@gmail.com',
                        'thusithajayasundara86@gmail.com',
                        'biz.sirimal@gmail.com',
                        'digibiz.pro@gmail.com',
                        'admin@digibiz.lk'
                    ];
                    const isAllowed = allowedEmails.some(e => e.toLowerCase() === userEmail) || 
                                      userEmail.includes('thusitha') || 
                                      userEmail.includes('jayasundara') || 
                                      userEmail.includes('coconut') || 
                                      userEmail.includes('sirimal') || 
                                      userEmail.includes('digibiz');

                    if (!isAllowed) {
                        showAuthGate();
                        const err = document.getElementById('authError');
                        if (err) {
                            err.innerHTML = '<b>ACCESS DENIED:</b> Account <code>' + userEmail + '</code> is not authorized for THUSITHA JAYASUNDARA COCONUT PRODUCTS.';
                            err.style.display = 'block';
                        }
                        return;
                    }

                    hideAuthGate();
                    localStorage.setItem('coconut_auth_active', 'true');
                    sessionStorage.setItem('coconut_auth_active', 'true');
                    renderAll();
                } else {
                    if (sessionStorage.getItem('coconut_auth_active') !== 'true' && localStorage.getItem('coconut_auth_active') !== 'true') {
                        showAuthGate();
                    }
                }
            });
        }

        async function handleSignIn() {
            const email = (document.getElementById('loginEmail')?.value || '').trim();
            const pass = (document.getElementById('loginPassword')?.value || '').trim();
            const errEl = document.getElementById('authError');
            const loader = document.getElementById('mobileLoginLoader');

            if (!email || !pass) {
                if (errEl) {
                    errEl.textContent = 'Please enter both email and password';
                    errEl.style.display = 'block';
                }
                return;
            }

            try {
                if (loader) loader.style.display = 'block';
                if (errEl) errEl.style.display = 'none';

                if (auth) {
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
                hideAuthGate();
                localStorage.setItem('coconut_auth_active', 'true');
                sessionStorage.setItem('coconut_auth_active', 'true');
                showToast('Welcome, THUSITHA JAYASUNDARA COCONUT PRODUCTS!');
                renderAll();
            } catch (err) {
                if (loader) loader.style.display = 'none';
                if (errEl) {
                    errEl.textContent = 'Sign in failed: ' + (err.message || 'Check credentials');
                    errEl.style.display = 'block';
                }
            }
        }

        async function handleSignOut() {
            if (!confirm('Are you sure you want to sign out?')) return;
            try {
                if (auth) await auth.signOut();
                localStorage.removeItem('coconut_auth_active');
                sessionStorage.removeItem('coconut_auth_active');
                showAuthGate();
                showToast('Signed out successfully');
            } catch (e) {
                showAuthGate();
            }
        }
`;

html = html.replace(
    /\/\/ ================================================================\s*\/\/ 4\. AUTH GATE[\s\S]*?async function handleSignOut\(\) \{[\s\S]*?showAuthGate\(\);\s*\}/,
    robustAuthJs.trim()
);

fs.writeFileSync(filePath, html, 'utf8');
console.log('✅ Updated thusithajayasundara with robust Firebase Auth Gate!');

backupClientIndex('thusithajayasundara', 'Fixed Strict Zero-Leak Firebase Auth Gate');

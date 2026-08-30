const fs = require('fs');
const path = require('path');
const { backupClientIndex } = require('./backup-client-index');

const ROOT_DIR = path.resolve(__dirname, '..');

// 1. Update Delight Bakers & SPI Holdings via rebuild script with updated rules
const { execSync } = require('child_process');

console.log('🚀 Applying Strict Auth & 30-Day Password Reset Rules across ALL clients...');

// ----------------------------------------------------
// A. Update script builder for Distributor clients
// ----------------------------------------------------
const distributorBuilderPath = path.join(ROOT_DIR, 'scripts/rebuild-clean-distributor-client.js');
let builderCode = fs.readFileSync(distributorBuilderPath, 'utf8');

// Update authGateJsCode inside builder
const updatedAuthGateJs = `
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
                    const allowedEmails = \${JSON.stringify(allowedEmails)};
                    const isAllowed = allowedEmails.some(e => e.toLowerCase() === userEmail) || 
                                      userEmail.includes('\${clientId.replace(/_/g, '')}') || 
                                      userEmail.includes('sirimal') || 
                                      userEmail.includes('digibiz');

                    if (!isAllowed) {
                        document.documentElement.classList.remove('auth-active');
                        showAuthGate();
                        const err = document.getElementById('authError');
                        if (err) {
                            err.innerHTML = '<b>ACCESS DENIED:</b> Account <code>' + userEmail + '</code> is not authorized for \${businessName.toUpperCase()}.';
                            err.style.display = 'block';
                        }
                        if (typeof auth !== 'undefined' && auth) auth.signOut();
                        return;
                    }

                    hideAuthGate();
                    localStorage.setItem('\${storageKey}_auth_active', 'true');
                    sessionStorage.setItem('\${storageKey}_auth_active', 'true');
                } else {
                    // Strict Zero-Leak: If user is logged out, MUST lock the gate completely
                    document.documentElement.classList.remove('auth-active');
                    localStorage.removeItem('\${storageKey}_auth_active');
                    sessionStorage.removeItem('\${storageKey}_auth_active');
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
                localStorage.setItem('\${storageKey}_auth_active', 'true');
                sessionStorage.setItem('\${storageKey}_auth_active', 'true');
                showToast('Welcome to \${businessName}!');
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
                localStorage.removeItem('\${storageKey}_auth_active');
                sessionStorage.removeItem('\${storageKey}_auth_active');
                sessionStorage.clear();
                showAuthGate();
                if (typeof auth !== 'undefined' && auth) await auth.signOut();
                showToast('Signed out successfully');
                window.location.replace('/');
            } catch (e) {
                document.documentElement.classList.remove('auth-active');
                showAuthGate();
                window.location.replace('/');
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

// Also update HTML markup for forgot password to have id="forgotPasswordContainer"
builderCode = builderCode.replace(
    /<div style="text-align:center; margin-top:16px;">\s*<a href="javascript:void\(0\)" onclick="handleForgotPassword\(\)" style="font-size:12px; color:#94a3b8; text-decoration:none;">Forgot Password\?<\/a>\s*<\/div>/g,
    `<div id="forgotPasswordContainer" style="display:none; text-align:center; margin-top:16px;">
                <a href="javascript:void(0)" onclick="handleForgotPassword()" style="font-size:12px; color:#94a3b8; text-decoration:none;">Forgot Password?</a>
            </div>`
);

builderCode = builderCode.replace(
    /\/\/ ================================================================\s*\/\/  FIREBASE AUTH GATE & ZERO-LEAK SECURITY GUARD[\s\S]*?async function handleForgotPassword\(\) \{[\s\S]*?alert\('Error: ' \+ err\.message\);\s*\}\s*\}/,
    updatedAuthGateJs.trim()
);

fs.writeFileSync(distributorBuilderPath, builderCode, 'utf8');

// Rebuild Delight Bakers & SPI Holdings
execSync('node scripts/rebuild-clean-distributor-client.js', { stdio: 'inherit', cwd: ROOT_DIR });

// ----------------------------------------------------
// B. Update Chisathi Family Products
// ----------------------------------------------------
const chisathiPath = path.join(ROOT_DIR, 'public/clients/chisathifamily/index.html');
let chisathiHtml = fs.readFileSync(chisathiPath, 'utf8');

const chisathiAuthBlock = `
    function checkForgotPasswordVisibility() {
        const container = document.getElementById('forgotPasswordContainer');
        if (!container) return;
        try {
            const startDate = new Date('2026-08-27');
            const now = new Date();
            const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
            container.style.display = daysPassed >= 30 ? 'block' : 'none';
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
            void gate.offsetHeight;
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

    auth.onAuthStateChanged(function(user) {
        if (user) {
            const userEmail = String(user.email || '').trim().toLowerCase();
            const allowedEmails = ['shashinthakumara@gmail.com', 'chisathifamily@gmail.com', 'biz.sirimal@gmail.com', 'digibiz.pro@gmail.com'];
            if (typeof loadUserRoles === 'function') loadUserRoles();
            const isAllowed = allowedEmails.some(e => e.toLowerCase() === userEmail) || userEmail.includes('chisathi') || userEmail.includes('sirimal') || (typeof userRoles !== 'undefined' && userRoles[userEmail]);

            if (!isAllowed) {
                document.documentElement.classList.remove('auth-active');
                showAuthGate();
                const err = document.getElementById('authError');
                if (err) {
                    err.innerHTML = '<b>ACCESS DENIED:</b> Account <code>' + userEmail + '</code> is not authorized for CHISATHI FAMILY PRODUCTS.';
                    err.style.display = 'block';
                }
                auth.signOut();
                return;
            }

            hideAuthGate();
            localStorage.setItem('chisathi_auth_active', 'true');
            sessionStorage.setItem('chisathi_auth_active', 'true');
            if (typeof loadUserRole === 'function') {
                loadUserRole(userEmail);
                updateSidebarByRole();
            }
            syncLiveSubscriptionAndCloudData();
        } else {
            document.documentElement.classList.remove('auth-active');
            localStorage.removeItem('chisathi_auth_active');
            sessionStorage.removeItem('chisathi_auth_active');
            sessionStorage.clear();
            showAuthGate();
        }
    });

    async function handleSignIn() {
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value.trim();
        const errEl = document.getElementById('authError');
        const loader = document.getElementById('mobileLoginLoader');

        if (!email || !pass) {
            if (errEl) {
                errEl.textContent = 'Please enter email and password';
                errEl.style.display = 'block';
            }
            return;
        }

        try {
            if (loader) loader.style.display = 'block';
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
            hideAuthGate();
            localStorage.setItem('chisathi_auth_active', 'true');
            sessionStorage.setItem('chisathi_auth_active', 'true');
            if (typeof loadUserRole === 'function') {
                loadUserRole(email);
                updateSidebarByRole();
            }
            syncLiveSubscriptionAndCloudData();
            showToast('Welcome, CHISATHI FAMILY PRODUCTS!');
        } catch (err) {
            if (loader) loader.style.display = 'none';
            if (errEl) {
                errEl.textContent = 'Invalid credentials: ' + (err.message || 'Please check email & password');
                errEl.style.display = 'block';
            }
        }
    }

    async function handleSignOut() {
        if (!confirm('Are you sure you want to sign out?')) return;
        try {
            document.documentElement.classList.remove('auth-active');
            localStorage.removeItem('chisathi_auth_active');
            sessionStorage.removeItem('chisathi_auth_active');
            sessionStorage.clear();
            showAuthGate();
            await auth.signOut();
            showToast('Signed out successfully');
            window.location.replace('/');
        } catch (e) {
            document.documentElement.classList.remove('auth-active');
            showAuthGate();
            window.location.replace('/');
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

// Add forgot password link to Chisathi login box if not present
if (!chisathiHtml.includes('id="forgotPasswordContainer"')) {
    chisathiHtml = chisathiHtml.replace(
        '</button>\n            <div id="mobileLoginLoader"',
        `</button>
            <div id="forgotPasswordContainer" style="display:none; text-align:center; margin-top:14px;">
                <a href="javascript:void(0)" onclick="handleForgotPassword()" style="font-size:12px; color:#666; text-decoration:none;">Forgot Password?</a>
            </div>
            <div id="mobileLoginLoader"`
    );
}

chisathiHtml = chisathiHtml.replace(
    /function showAuthGate\(\) \{[\s\S]*?async function handleSignOut\(\) \{[\s\S]*?showAuthGate\(\);\s*\}\s*\}/,
    chisathiAuthBlock.trim()
);

fs.writeFileSync(chisathiPath, chisathiHtml, 'utf8');
console.log('✅ Updated chisathifamily with strict sign out & 30-day password reset');
backupClientIndex('chisathifamily', 'Strict Sign Out & 30-Day Password Reset');

// ----------------------------------------------------
// C. Update Sathi Tyre Centre
// ----------------------------------------------------
const sathiPath = path.join(ROOT_DIR, 'public/clients/sathityrecentre/index.html');
let sathiHtml = fs.readFileSync(sathiPath, 'utf8');

const sathiAuthBlock = `
    function checkForgotPasswordVisibility() {
        const container = document.getElementById('forgotPasswordContainer');
        if (!container) return;
        try {
            const startDate = new Date('2026-08-27');
            const now = new Date();
            const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
            container.style.display = daysPassed >= 30 ? 'block' : 'none';
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
            void gate.offsetHeight;
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

    auth.onAuthStateChanged(function(user) {
        if (user) {
            const userEmail = String(user.email || '').trim().toLowerCase();
            const allowedEmails = ['sathityre05@gmail.com', 'biz.sirimal@gmail.com', 'digibiz.pro@gmail.com'];
            if (typeof loadUserRoles === 'function') loadUserRoles();
            const isAllowed = allowedEmails.some(e => e.toLowerCase() === userEmail) || userEmail.includes('sathityre') || userEmail.includes('sirimal') || (typeof userRoles !== 'undefined' && userRoles[userEmail]);

            if (!isAllowed) {
                document.documentElement.classList.remove('auth-active');
                showAuthGate();
                const err = document.getElementById('authError');
                if (err) {
                    err.innerHTML = '<b>ACCESS DENIED:</b> Account <code>' + userEmail + '</code> is not authorized for SATHI TYRE HOUSE.';
                    err.style.display = 'block';
                }
                auth.signOut();
                return;
            }

            hideAuthGate();
            localStorage.setItem('sathi_auth_active', 'true');
            sessionStorage.setItem('sathi_auth_active', 'true');
            if (typeof loadUserRole === 'function') {
                loadUserRole(userEmail);
                updateSidebarByRole();
            }
            syncLiveSubscriptionAndCloudData();
        } else {
            document.documentElement.classList.remove('auth-active');
            localStorage.removeItem('sathi_auth_active');
            sessionStorage.removeItem('sathi_auth_active');
            sessionStorage.clear();
            showAuthGate();
        }
    });

    async function handleSignIn() {
        const email = document.getElementById('loginEmail').value.trim();
        const pass = document.getElementById('loginPassword').value.trim();
        const errEl = document.getElementById('authError');
        const loader = document.getElementById('mobileLoginLoader');

        if (!email || !pass) {
            if (errEl) {
                errEl.textContent = 'Please enter email and password';
                errEl.style.display = 'block';
            }
            return;
        }

        try {
            if (loader) loader.style.display = 'block';
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
            hideAuthGate();
            localStorage.setItem('sathi_auth_active', 'true');
            sessionStorage.setItem('sathi_auth_active', 'true');
            if (typeof loadUserRole === 'function') {
                loadUserRole(email);
                updateSidebarByRole();
            }
            syncLiveSubscriptionAndCloudData();
            showToast('Welcome, SATHI TYRE HOUSE!');
        } catch (err) {
            if (loader) loader.style.display = 'none';
            if (errEl) {
                errEl.textContent = 'Invalid credentials: ' + (err.message || 'Please check email & password');
                errEl.style.display = 'block';
            }
        }
    }

    async function handleSignOut() {
        if (!confirm('Are you sure you want to sign out?')) return;
        try {
            document.documentElement.classList.remove('auth-active');
            localStorage.removeItem('sathi_auth_active');
            sessionStorage.removeItem('sathi_auth_active');
            sessionStorage.clear();
            showAuthGate();
            await auth.signOut();
            showToast('Signed out successfully');
            window.location.replace('/');
        } catch (e) {
            document.documentElement.classList.remove('auth-active');
            showAuthGate();
            window.location.replace('/');
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

if (!sathiHtml.includes('id="forgotPasswordContainer"')) {
    sathiHtml = sathiHtml.replace(
        '</button>\n            <div id="mobileLoginLoader"',
        `</button>
            <div id="forgotPasswordContainer" style="display:none; text-align:center; margin-top:14px;">
                <a href="javascript:void(0)" onclick="handleForgotPassword()" style="font-size:12px; color:#666; text-decoration:none;">Forgot Password?</a>
            </div>
            <div id="mobileLoginLoader"`
    );
}

sathiHtml = sathiHtml.replace(
    /function showAuthGate\(\) \{[\s\S]*?async function handleSignOut\(\) \{[\s\S]*?showAuthGate\(\);\s*\}\s*\}/,
    sathiAuthBlock.trim()
);

fs.writeFileSync(sathiPath, sathiHtml, 'utf8');
console.log('✅ Updated sathityrecentre with strict sign out & 30-day password reset');
backupClientIndex('sathityrecentre', 'Strict Sign Out & 30-Day Password Reset');

// ----------------------------------------------------
// D. Update Thusitha Jayasundara
// ----------------------------------------------------
const thusithaPath = path.join(ROOT_DIR, 'public/clients/thusithajayasundara/index.html');
let thusithaHtml = fs.readFileSync(thusithaPath, 'utf8');

const thusithaAuthBlock = `
        function checkForgotPasswordVisibility() {
            const container = document.getElementById('forgotPasswordContainer');
            if (!container) return;
            try {
                const startDate = new Date('2026-08-28');
                const now = new Date();
                const daysPassed = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
                container.style.display = daysPassed >= 30 ? 'block' : 'none';
            } catch (e) {
                container.style.display = 'none';
            }
        }

        function showAuthGate() {
            document.documentElement.classList.remove('auth-active');
            const gate = document.getElementById('authGateOverlay');
            if (gate) { gate.classList.add('show'); gate.style.display = 'flex'; }
            checkForgotPasswordVisibility();
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
                        document.documentElement.classList.remove('auth-active');
                        showAuthGate();
                        const err = document.getElementById('authError');
                        if (err) {
                            err.innerHTML = '<b>ACCESS DENIED:</b> Account <code>' + userEmail + '</code> is not authorized for THUSITHA JAYASUNDARA COCONUT PRODUCTS.';
                            err.style.display = 'block';
                        }
                        if (auth) auth.signOut();
                        return;
                    }

                    hideAuthGate();
                    localStorage.setItem('coconut_auth_active', 'true');
                    sessionStorage.setItem('coconut_auth_active', 'true');
                    renderAll();
                } else {
                    document.documentElement.classList.remove('auth-active');
                    localStorage.removeItem('coconut_auth_active');
                    sessionStorage.removeItem('coconut_auth_active');
                    sessionStorage.clear();
                    showAuthGate();
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
                document.documentElement.classList.remove('auth-active');
                localStorage.removeItem('coconut_auth_active');
                sessionStorage.removeItem('coconut_auth_active');
                sessionStorage.clear();
                showAuthGate();
                if (auth) await auth.signOut();
                showToast('Signed out successfully');
                window.location.replace('/');
            } catch (e) {
                document.documentElement.classList.remove('auth-active');
                showAuthGate();
                window.location.replace('/');
            }
        }

        async function handleForgotPassword() {
            const email = (document.getElementById('loginEmail')?.value || '').trim();
            if (!email) {
                alert('Please enter your email in the field first, then click Forgot Password.');
                return;
            }
            try {
                if (auth) await auth.sendPasswordResetEmail(email);
                alert('Password reset link sent to ' + email + '. Please check your inbox.');
            } catch (err) {
                alert('Error: ' + err.message);
            }
        }
`;

if (!thusithaHtml.includes('id="forgotPasswordContainer"')) {
    thusithaHtml = thusithaHtml.replace(
        '</button>\n            <div id="mobileLoginLoader"',
        `</button>
            <div id="forgotPasswordContainer" style="display:none; text-align:center; margin-top:14px;">
                <a href="javascript:void(0)" onclick="handleForgotPassword()" style="font-size:12px; color:#666; text-decoration:none;">Forgot Password?</a>
            </div>
            <div id="mobileLoginLoader"`
    );
}

thusithaHtml = thusithaHtml.replace(
    /\/\/ ================================================================\s*\/\/ 4\. ZERO-LEAK FIREBASE AUTH GATE[\s\S]*?async function handleSignOut\(\) \{[\s\S]*?showAuthGate\(\);\s*\}\s*\}/,
    thusithaAuthBlock.trim()
);

fs.writeFileSync(thusithaPath, thusithaHtml, 'utf8');
console.log('✅ Updated thusithajayasundara with strict sign out & 30-day password reset');
backupClientIndex('thusithajayasundara', 'Strict Sign Out & 30-Day Password Reset');

// ----------------------------------------------------
// E. Update Madawala Tea Shop
// ----------------------------------------------------
const madawalaPath = path.join(ROOT_DIR, 'public/clients/madawalateashop/index.html');
let madawalaHtml = fs.readFileSync(madawalaPath, 'utf8');

// Ensure handleSignOut in madawala redirects cleanly to / and clears session
madawalaHtml = madawalaHtml.replace(
    /async function handleSignOut\(\) \{[\s\S]*?showAuthGate\(\);\s*\}\s*\}/,
    `async function handleSignOut() {
        if (!confirm('Are you sure you want to sign out?')) return;
        try {
            document.documentElement.classList.remove('auth-active');
            localStorage.removeItem('madawala_auth_active');
            sessionStorage.removeItem('madawala_auth_active');
            sessionStorage.clear();
            showAuthGate();
            if (typeof auth !== 'undefined' && auth) await auth.signOut();
            showToast('Signed out successfully');
            window.location.replace('/');
        } catch (e) {
            document.documentElement.classList.remove('auth-active');
            showAuthGate();
            window.location.replace('/');
        }
    }`
);

fs.writeFileSync(madawalaPath, madawalaHtml, 'utf8');
console.log('✅ Updated madawalateashop with strict sign out');
backupClientIndex('madawalateashop', 'Strict Sign Out Update');

console.log('\n🎉 Successfully updated all client workspaces with Strict Sign Out & 30-Day Password Reset rules!');

const fs = require('fs');

// 1. Update firebase.json to add explicit /admin rewrites
let fbConfig = JSON.parse(fs.readFileSync('i:/DIGIBIZ-SYSTEM/firebase.json', 'utf8'));

// Check if /admin rewrite exists
const hasAdminRewrite = fbConfig.hosting.rewrites.some(r => r.source === '/admin');
if (!hasAdminRewrite) {
    fbConfig.hosting.rewrites.unshift(
        { "source": "/admin", "destination": "/admin/index.html" },
        { "source": "/admin/", "destination": "/admin/index.html" },
        { "source": "/admin/**", "destination": "/admin/index.html" }
    );
    fs.writeFileSync('i:/DIGIBIZ-SYSTEM/firebase.json', JSON.stringify(fbConfig, null, 2), 'utf8');
    console.log('Added /admin rewrites to firebase.json');
}

// 2. Read public/admin/index.html
let adminHtml = fs.readFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', 'utf8');

// Replace the old securityGateOverlay with the new inline Super Admin login gate
const oldGateHtml = `<div id="securityGateOverlay" style="position: fixed; inset: 0; background: #0a101d; z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
        <div style="width: 60px; height: 60px; border-radius: 18px; background: rgba(255,153,0,0.15); border: 1px solid rgba(255,153,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 26px; color: #ff9900; margin-bottom: 20px; box-shadow: 0 0 30px rgba(255,153,0,0.2);">
            <i class="fas fa-shield-halved fa-beat-fade"></i>
        </div>
        <h2 id="gateTitle" style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 8px;">Securing Command Center...</h2>
        <p id="gateDesc" style="font-size: 13px; color: #94a3b8; max-width: 360px;">Authenticating Super Admin credentials. System content is locked.</p>
    </div>`;

const newGateHtml = `<!-- 🛡️ ZERO-LEAK SECURITY GATE OVERLAY & INLINE SUPER ADMIN LOGIN -->
    <div id="securityGateOverlay" style="position: fixed; inset: 0; background: #0a101d; z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
        <div style="width: 100%; max-width: 420px; background: #131b2c; border: 1px solid rgba(255,153,0,0.3); border-radius: 20px; padding: 32px 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.6);">
            
            <div style="width: 58px; height: 58px; border-radius: 16px; background: rgba(255,153,0,0.15); border: 1px solid rgba(255,153,0,0.4); display: inline-flex; align-items: center; justify-content: center; font-size: 24px; color: #ff9900; margin-bottom: 16px; box-shadow: 0 0 25px rgba(255,153,0,0.2);">
                <i class="fas fa-shield-halved" id="gateIcon"></i>
            </div>
            
            <h2 id="gateTitle" style="font-size: 19px; font-weight: 900; color: #fff; margin-bottom: 6px;">DIGIBIZ Command Center</h2>
            <p id="gateDesc" style="font-size: 12.5px; color: #94a3b8; margin-bottom: 20px;">Super Admin Authentication & Security Gate</p>

            <!-- Loading Spinner (Visible while checking session) -->
            <div id="gateLoadingBox" style="display: block; padding: 12px 0;">
                <i class="fas fa-spinner fa-spin" style="font-size: 24px; color: var(--primary); margin-bottom: 8px;"></i>
                <div style="font-size: 12px; color: #94a3b8;">Verifying administrator session...</div>
            </div>

            <!-- Inline Admin Login Form (Visible if unauthenticated) -->
            <form id="gateLoginForm" onsubmit="handleInlineAdminLogin(event)" style="display: none; text-align: left;">
                <div style="margin-bottom: 14px;">
                    <label style="font-size: 11.5px; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">Admin Email Address</label>
                    <input type="email" id="gateAdminEmail" value="biz.sirimal@gmail.com" placeholder="biz.sirimal@gmail.com" required style="width: 100%; background: rgba(10,16,29,0.8); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 13.5px; outline: none;" />
                </div>

                <div style="margin-bottom: 18px;">
                    <label style="font-size: 11.5px; font-weight: 700; color: #cbd5e1; display: block; margin-bottom: 6px;">Password</label>
                    <input type="password" id="gateAdminPassword" placeholder="••••••••" required style="width: 100%; background: rgba(10,16,29,0.8); border: 1px solid var(--border); border-radius: 10px; padding: 11px 14px; color: #fff; font-size: 13.5px; outline: none;" />
                </div>

                <div id="gateLoginAlert" style="display:none; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #fca5a5; padding: 10px 12px; border-radius: 8px; font-size: 12px; margin-bottom: 14px;">
                    <i class="fas fa-circle-exclamation"></i> <span id="gateLoginAlertMsg">Invalid credentials</span>
                </div>

                <button type="submit" id="btnGateLogin" class="btn-primary" style="width: 100%; justify-content: center; padding: 12px; font-size: 13.5px;">
                    <i class="fas fa-lock-open"></i> Unlock Command Center
                </button>

                <div style="margin-top: 16px; border-top: 1px solid var(--border); padding-top: 14px; text-align: center;">
                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 8px;">Super Admin Accounts:</div>
                    <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
                        <button type="button" class="pill-btn" style="font-size: 10.5px; padding: 3px 8px;" onclick="setGateEmail('biz.sirimal@gmail.com')">biz.sirimal@gmail.com</button>
                        <button type="button" class="pill-btn" style="font-size: 10.5px; padding: 3px 8px;" onclick="setGateEmail('digibiz.pro@gmail.com')">digibiz.pro@gmail.com</button>
                        <button type="button" class="pill-btn" style="font-size: 10.5px; padding: 3px 8px;" onclick="setGateEmail('admin@digibiz.lk')">admin@digibiz.lk</button>
                    </div>
                </div>
            </form>

        </div>
    </div>`;

adminHtml = adminHtml.replace(oldGateHtml, newGateHtml);

// Replace the auth gate JS logic
const oldAuthJs = `auth.onAuthStateChanged(async user => {
            const gate = document.getElementById('securityGateOverlay');
            const mainWrap = document.getElementById('adminMainWrapper');

            if (!user) {
                if (gate) {
                    document.getElementById('gateTitle').innerHTML = '<span style="color:#ef4444;"><i class="fas fa-lock"></i> Authentication Required</span>';
                    document.getElementById('gateDesc').textContent = 'Please log in with Super Admin credentials. Redirecting to security login...';
                }
                setTimeout(() => { window.location.replace('/'); }, 400);
                return;
            }

            const email = String(user.email || '').trim().toLowerCase();
            const isAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === email) || 
                            email.includes('sirimal') || 
                            email.includes('digibiz') || 
                            email.startsWith('admin@');

            if (!isAdmin) {
                if (gate) {
                    document.getElementById('gateTitle').innerHTML = '<span style="color:#ef4444;"><i class="fas fa-ban"></i> Access Denied</span>';
                    document.getElementById('gateDesc').textContent = 'Account ' + email + ' does not possess Super Admin privileges. Redirecting...';
                }
                setTimeout(() => {
                    auth.signOut().then(() => { window.location.replace('/'); });
                }, 1500);
                return;
            }

            // Super Admin Verified: Unlock System
            document.getElementById('adminEmailBadge').textContent = user.email;
            if (mainWrap) mainWrap.style.display = 'flex';
            if (gate) {
                gate.style.transition = 'opacity 0.3s ease';
                gate.style.opacity = '0';
                setTimeout(() => { gate.style.display = 'none'; }, 300);
            }

            await loadClientsData();
            init30DayTrendChart();
        });`;

const newAuthJs = `auth.onAuthStateChanged(async user => {
            const gate = document.getElementById('securityGateOverlay');
            const mainWrap = document.getElementById('adminMainWrapper');
            const loadingBox = document.getElementById('gateLoadingBox');
            const loginForm = document.getElementById('gateLoginForm');

            if (!user) {
                // DO NOT kick the user away! Show clean inline Super Admin login card
                if (loadingBox) loadingBox.style.display = 'none';
                if (loginForm) loginForm.style.display = 'block';
                document.getElementById('gateTitle').textContent = 'Super Admin Login';
                document.getElementById('gateDesc').textContent = 'Please enter Super Admin credentials to unlock the Command Center.';
                return;
            }

            const email = String(user.email || '').trim().toLowerCase();
            const isAdmin = ADMIN_EMAILS.some(e => e.toLowerCase() === email) || 
                            email.includes('sirimal') || 
                            email.includes('digibiz') || 
                            email.startsWith('admin@');

            if (!isAdmin) {
                if (loadingBox) loadingBox.style.display = 'none';
                if (loginForm) loginForm.style.display = 'block';
                document.getElementById('gateTitle').innerHTML = '<span style="color:#ef4444;"><i class="fas fa-ban"></i> Access Denied</span>';
                document.getElementById('gateDesc').textContent = 'Account ' + email + ' is a standard client and does not have Super Admin rights. Please log in with Super Admin credentials below:';
                return;
            }

            // Super Admin Verified: Unlock System
            document.getElementById('adminEmailBadge').textContent = user.email;
            if (mainWrap) mainWrap.style.display = 'flex';
            if (gate) {
                gate.style.transition = 'opacity 0.25s ease';
                gate.style.opacity = '0';
                setTimeout(() => { gate.style.display = 'none'; }, 250);
            }

            await loadClientsData();
            init30DayTrendChart();
        });

        async function handleInlineAdminLogin(e) {
            e.preventDefault();
            const email = document.getElementById('gateAdminEmail').value.trim().toLowerCase();
            const pass = document.getElementById('gateAdminPassword').value;
            const btn = document.getElementById('btnGateLogin');
            const alertBox = document.getElementById('gateLoginAlert');
            const alertMsg = document.getElementById('gateLoginAlertMsg');

            alertBox.style.display = 'none';
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';

            try {
                await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                let cred = null;
                try {
                    cred = await auth.signInWithEmailAndPassword(email, pass);
                } catch (signErr) {
                    if (signErr.code === 'auth/user-not-found' || signErr.code === 'auth/invalid-credential' || (signErr.code && signErr.code.includes('invalid'))) {
                        try {
                            cred = await auth.createUserWithEmailAndPassword(email, pass);
                        } catch (createErr) {
                            throw signErr;
                        }
                    } else {
                        throw signErr;
                    }
                }
            } catch (err) {
                alertBox.style.display = 'block';
                alertMsg.textContent = err.message || 'Failed to authenticate. Please check password.';
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-lock-open"></i> Unlock Command Center';
            }
        }

        function setGateEmail(em) {
            document.getElementById('gateAdminEmail').value = em;
            document.getElementById('gateAdminPassword').focus();
        }`;

adminHtml = adminHtml.replace(oldAuthJs, newAuthJs);

fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', adminHtml, 'utf8');
fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/business-management.html', adminHtml, 'utf8');
fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/live-activity.html', adminHtml, 'utf8');
fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/std/modules/admin/live-activity.html', adminHtml, 'utf8');
console.log('Successfully upgraded admin authentication with inline login and eliminated unwanted redirects!');

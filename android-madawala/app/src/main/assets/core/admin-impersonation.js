// DIGIBIZ Super Admin Direct Client Impersonation & Debug Suite
window.isImpersonating = function() {
    return localStorage.getItem('digibiz_impersonate_active') === 'true';
};

window.getEffectiveBusinessId = function(userDoc, fallbackUid) {
    if (localStorage.getItem('digibiz_impersonate_active') === 'true') {
        const impBizId = localStorage.getItem('digibiz_impersonate_biz_id') || 
                         localStorage.getItem('currentBusinessId') || 
                         localStorage.getItem('businessId');
        if (impBizId) return impBizId;
    }
    if (userDoc) {
        if (typeof userDoc.data === 'function') {
            const data = userDoc.data();
            if (data && data.businessId) return data.businessId;
        } else if (userDoc.businessId) {
            return userDoc.businessId;
        }
    }
    return fallbackUid || (userDoc && userDoc.uid ? userDoc.uid : null);
};

window.getEffectiveUserEmail = function(currentUser) {
    if (localStorage.getItem('digibiz_impersonate_active') === 'true') {
        const impEmail = localStorage.getItem('digibiz_impersonate_email') ||
                         localStorage.getItem('userEmail') ||
                         localStorage.getItem('activeUserEmail');
        if (impEmail) return impEmail;
    }
    if (currentUser && currentUser.email) return currentUser.email;
    return localStorage.getItem('userEmail') || '';
};

window.getEffectiveBusinessType = function() {
    if (localStorage.getItem('digibiz_impersonate_active') === 'true') {
        return localStorage.getItem('digibiz_impersonate_type') || localStorage.getItem('currentBusinessType') || 'retail';
    }
    return localStorage.getItem('currentBusinessType') || sessionStorage.getItem('currentBusinessType') || 'retail';
};

(function initSuperAdminImpersonation() {
    const urlParams = new URLSearchParams(window.location.search);
    const isParamImpersonate = urlParams.get('impersonate') === 'true';

    if (isParamImpersonate) {
        const paramEmail = urlParams.get('email');
        const paramBizId = urlParams.get('bizId');
        const paramBizType = urlParams.get('bizType');

        if (paramEmail) {
            localStorage.setItem('digibiz_impersonate_active', 'true');
            localStorage.setItem('digibiz_impersonate_email', paramEmail);
            localStorage.setItem('userEmail', paramEmail);
            localStorage.setItem('activeUserEmail', paramEmail);
        }
        if (paramBizId) {
            localStorage.setItem('digibiz_impersonate_biz_id', paramBizId);
            localStorage.setItem('businessId', paramBizId);
            localStorage.setItem('currentBusinessId', paramBizId);
            sessionStorage.setItem('currentBusinessId', paramBizId);
            localStorage.setItem('activeBusinessId', paramBizId);
            localStorage.setItem('selectedBusinessId', paramBizId);
            sessionStorage.setItem('selectedBusinessId', paramBizId);
        }
        if (paramBizType) {
            localStorage.setItem('digibiz_impersonate_type', paramBizType);
            localStorage.setItem('currentBusinessType', paramBizType);
            sessionStorage.setItem('currentBusinessType', paramBizType);
        }
    }

    const currentPath = window.location.pathname.toLowerCase();
    if (!isParamImpersonate && (currentPath.startsWith('/admin/') || currentPath === '/' || currentPath === '/index.html' || currentPath.includes('/auth/login.html'))) {
        localStorage.removeItem('digibiz_impersonate_active');
        localStorage.removeItem('digibiz_impersonate_email');
        localStorage.removeItem('digibiz_impersonate_biz_id');
        localStorage.removeItem('digibiz_impersonate_type');
        localStorage.removeItem('digibiz_impersonate_biz_name');
        localStorage.removeItem('digibiz_impersonate_owner_name');
    }

    const isActive = localStorage.getItem('digibiz_impersonate_active') === 'true';
    if (!isActive) return;

    let targetEmail = localStorage.getItem('digibiz_impersonate_email') || 'Client Business';
    let targetBizId = localStorage.getItem('digibiz_impersonate_biz_id') || 'CLIENT_BIZ';
    let targetType = String(localStorage.getItem('digibiz_impersonate_type') || 'retail').toLowerCase();

    // Force business context keys in Local and Session storage
    localStorage.setItem('digibiz_impersonate_active', 'true');
    localStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
    sessionStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
    localStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');
    sessionStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');

    localStorage.setItem('currentBusinessId', targetBizId);
    sessionStorage.setItem('currentBusinessId', targetBizId);
    localStorage.setItem('businessId', targetBizId);
    sessionStorage.setItem('businessId', targetBizId);
    localStorage.setItem('selectedBusinessId', targetBizId);
    sessionStorage.setItem('selectedBusinessId', targetBizId);

    localStorage.setItem('currentBusinessType', targetType);
    sessionStorage.setItem('currentBusinessType', targetType);

    const paramToken = urlParams.get('token');
    if (paramToken) {
        localStorage.setItem('digibiz_impersonate_token', paramToken);
    }

    // Auto-authenticate via Official Firebase Custom Auth Token if provided
    const ensureImpersonatedAuth = async () => {
        if (window.firebase && window.firebase.auth) {
            try {
                const authInst = window.firebase.auth();
                const customToken = localStorage.getItem('digibiz_impersonate_token');
                if (customToken) {
                    await authInst.signInWithCustomToken(customToken).then(() => {
                        console.log('[Impersonation] Signed in with OFFICIAL FIREBASE CUSTOM TOKEN!');
                    }).catch(async (eTok) => {
                        console.warn('[Impersonation] Custom token fallback to anonymous auth:', eTok);
                        if (!authInst.currentUser) await authInst.signInAnonymously().catch(() => {});
                    });
                } else if (!authInst.currentUser) {
                    await authInst.signInAnonymously().catch(e => console.warn('[Impersonation] Anonymous auth warn:', e));
                }
            } catch (err) {
                console.warn('[Impersonation] Auth init warn:', err);
            }
        }
    };

    ensureImpersonatedAuth();

    // Link Click Interceptor to attach tenant parameters on internal links
    document.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a');
        if (a && a.href && a.href.startsWith(window.location.origin)) {
            try {
                const url = new URL(a.href);
                if (!url.searchParams.get('impersonate')) {
                    url.searchParams.set('impersonate', 'true');
                    const cEmail = localStorage.getItem('digibiz_impersonate_email') || targetEmail;
                    const cBizId = localStorage.getItem('digibiz_impersonate_biz_id') || targetBizId;
                    const cType = localStorage.getItem('digibiz_impersonate_type') || targetType;
                    if (cEmail) url.searchParams.set('email', cEmail);
                    if (cBizId) url.searchParams.set('bizId', cBizId);
                    if (cType) url.searchParams.set('bizType', cType);
                    a.href = url.toString();
                }
            } catch (_err) {}
        }
    }, true);

    // ONLY redirect if on Landing Page or Login page
    const landingPath = window.location.pathname.toLowerCase();
    if (landingPath === '/' || landingPath === '/index.html' || landingPath.includes('/auth/login.html')) {
        const normType = String(targetType || 'retail').toLowerCase().trim();
                let clientPrefix = '';
        const clientMatch = window.location.pathname.match(/^\/clients\/[^\/]+/i);
        if (clientMatch) {
            clientPrefix = clientMatch[0];
        } else {
            const bId = String(targetBizId || '').toLowerCase();
            const eMail = String(targetEmail || '').toLowerCase();
            if (bId === 'qmha16kgjogfrq93rdayvcizynj1' || bId === 'xclawqzjbzs5uhsrmbsx0xxeoz63' || eMail.includes('chisathi') || eMail.includes('shashintha')) {
                clientPrefix = '/clients/chisathifamilyproducts';
            } else if (bId === 'fsajw3qptngp3rf7x3t7cskor6s1' || bId === '12jjihkbm8zolrf5iakaol667fe2' || eMail.includes('my@retail') || eMail.includes('myretail')) {
                clientPrefix = '/clients/myretail';
            } else if (bId === '13gu7xibcbzjfs61ub42suv7ger1' || bId === '13gu7xibcbzjfs61ub42suv7ger1' || eMail.includes('nadundealwis') || eMail.includes('mwtrading') || eMail.includes('spiholdings')) {
                clientPrefix = '/clients/spiholdings';
            } else if (bId === 'yszk1wzgo9xnoversyehjhp5soci3' || bId === 'yszk1wzgo9xnoversyehjh5soci3' || eMail.includes('sunroselanka')) {
                clientPrefix = '/clients/sunroselanka';
            } else if (bId === 'ndhxszkwhahf3pnbtsqgkphmwer1' || bId === 'ozcln4szrvtmqbvveqqso7abdq42' || eMail.includes('sathityre')) {
                clientPrefix = '/clients/sathityrecentre';
            } else if (eMail.includes('darshanamadawala') || eMail.includes('darshana') || eMail.includes('madawala')) {
                clientPrefix = '/clients/madawalateashop';
            } else if (eMail.includes('royalarabian') || eMail.includes('asminmoho')) {
                clientPrefix = '/clients/royalarabian';
            }
        }

        let targetModulePath = clientPrefix + '/modules/retail/dashboard.html';
        if (clientPrefix === '/clients/chisathifamilyproducts') {
            targetModulePath = clientPrefix + '/modules/retail/pos.html';
        } else if (clientPrefix === '/clients/madawalateashop') {
            targetModulePath = clientPrefix + '/modules/credit/dashboard.html';
        } else if (clientPrefix === '/clients/spiholdings') {
            targetModulePath = clientPrefix + '/modules/distributor/web/dashboard.html';
        } else if (clientPrefix === '/clients/sathityrecentre') {
            targetModulePath = clientPrefix + '/modules/tire_centre/dashboard.html';
        } else if (clientPrefix === '/clients/sunroselanka') {
            targetModulePath = clientPrefix + '/modules/manufacturer/dashboard.html';
        } else if (clientPrefix === '/clients/royalarabian') {
            targetModulePath = clientPrefix + '/modules/auto_care/dashboard.html';
        } else if (normType === 'distributor') targetModulePath = clientPrefix + '/modules/distributor/web/dashboard.html';
        else if (normType === 'attendance_payroll' || normType === 'attendance') targetModulePath = clientPrefix + '/modules/attendance_payroll/dashboard.html';
        else if (normType === 'auto_care') targetModulePath = clientPrefix + '/modules/auto_care/dashboard.html';
        else if (normType === 'bakery') targetModulePath = clientPrefix + '/modules/bakery/dashboard.html';
        else if (normType === 'coconut') targetModulePath = clientPrefix + '/modules/coconut/dashboard.html';
        else if (normType === 'hardware') targetModulePath = clientPrefix + '/modules/hardware/dashboard.html';
        else if (normType === 'manufacturer') targetModulePath = clientPrefix + '/modules/manufacturer/dashboard.html';
        else if (normType === 'pharmacy') targetModulePath = clientPrefix + '/modules/pharmacy/dashboard.html';
        else if (normType === 'quick_billing') targetModulePath = clientPrefix + '/modules/quick_billing/dashboard.html';
        else if (normType === 'scrap_collection_center') targetModulePath = clientPrefix + '/modules/scrap_collection_center/dashboard.html';
        else if (normType === 'tire_centre') targetModulePath = clientPrefix + '/modules/tire_centre/dashboard.html';
        else targetModulePath = clientPrefix + `/modules/${normType}/dashboard.html`;

        const targetDashboardUrl = `${targetModulePath}?impersonate=true&email=${encodeURIComponent(targetEmail)}&bizId=${encodeURIComponent(targetBizId)}&bizType=${encodeURIComponent(targetType)}`;
        window.location.href = targetDashboardUrl;
        return;
    }

    let resolvedBizName = localStorage.getItem('digibiz_impersonate_biz_name') || '';
    let resolvedOwnerName = localStorage.getItem('digibiz_impersonate_owner_name') || '';

    const fetchLiveTenantProfile = async () => {
        if (window.db) {
            try {
                let foundBizDoc = null;
                // 1. Try targetBizId direct lookup
                if (targetBizId && targetBizId !== 'CLIENT_BIZ') {
                    const directDoc = await window.db.collection('businesses').doc(targetBizId).get().catch(() => null);
                    if (directDoc && directDoc.exists) {
                        foundBizDoc = directDoc;
                    }
                }

                // 2. If not found or targetEmail provided, query users & businesses by email
                if (!foundBizDoc && targetEmail && targetEmail !== 'Client Business') {
                    const uSnap = await window.db.collection('users').where('email', '==', targetEmail).limit(1).get().catch(() => null);
                    if (uSnap && !uSnap.empty) {
                        const uData = uSnap.docs[0].data() || {};
                        const realBizId = uData.businessId || uSnap.docs[0].id;
                        if (realBizId) {
                            targetBizId = realBizId;
                            localStorage.setItem('digibiz_impersonate_biz_id', realBizId);
                            localStorage.setItem('currentBusinessId', realBizId);
                            sessionStorage.setItem('currentBusinessId', realBizId);
                            localStorage.setItem('businessId', realBizId);
                            localStorage.setItem('selectedBusinessId', realBizId);
                            sessionStorage.setItem('selectedBusinessId', realBizId);
                        }
                        if (uData.businessType) {
                            targetType = String(uData.businessType).toLowerCase();
                            localStorage.setItem('digibiz_impersonate_type', targetType);
                            localStorage.setItem('currentBusinessType', targetType);
                        }
                        if (uData.ownerName || uData.name) resolvedOwnerName = uData.ownerName || uData.name;
                        if (uData.businessName) resolvedBizName = uData.businessName;

                        foundBizDoc = await window.db.collection('businesses').doc(realBizId).get().catch(() => null);
                    }

                    if (!foundBizDoc) {
                        const bSnapEmail = await window.db.collection('businesses').where('email', '==', targetEmail).limit(1).get().catch(() => null);
                        if (bSnapEmail && !bSnapEmail.empty) {
                            foundBizDoc = bSnapEmail.docs[0];
                            targetBizId = foundBizDoc.id;
                            localStorage.setItem('digibiz_impersonate_biz_id', targetBizId);
                            localStorage.setItem('currentBusinessId', targetBizId);
                            sessionStorage.setItem('currentBusinessId', targetBizId);
                            localStorage.setItem('businessId', targetBizId);
                        }
                    }
                }

                if (foundBizDoc && foundBizDoc.exists) {
                    const bd = foundBizDoc.data() || {};
                    resolvedBizName = bd.businessName || bd.name || bd.companyName || bd.title || resolvedBizName;
                    resolvedOwnerName = bd.ownerName || bd.name || resolvedOwnerName;
                    if (bd.businessType || bd.type) {
                        targetType = String(bd.businessType || bd.type).toLowerCase();
                        localStorage.setItem('digibiz_impersonate_type', targetType);
                        localStorage.setItem('currentBusinessType', targetType);
                    }
                    if (resolvedBizName) {
                        localStorage.setItem('digibiz_impersonate_biz_name', resolvedBizName);
                        localStorage.setItem('currentBusinessName', resolvedBizName);
                        sessionStorage.setItem('currentBusinessName', resolvedBizName);
                    }
                    if (resolvedOwnerName) {
                        localStorage.setItem('digibiz_impersonate_owner_name', resolvedOwnerName);
                    }
                }
            } catch (e) {
                console.warn('[Impersonation] Live Profile Fetch Failed', e);
            }
        }
        if (!resolvedBizName || resolvedBizName === 'Client Business') {
            const handle = targetEmail.split('@')[0].toUpperCase();
            resolvedBizName = `${handle} BUSINESS`;
        }
        if (!resolvedOwnerName) resolvedOwnerName = targetEmail;
    };

    fetchLiveTenantProfile();

    // Continuous 150ms DOM & State Enforcer
    const enforceDOMState = () => {
        const roleBadge = document.getElementById('sidebarRoleBadge');
        if (roleBadge && roleBadge.textContent !== 'BUSINESS OWNER') {
            roleBadge.textContent = 'BUSINESS OWNER';
        }

        const bizNameEl = document.getElementById('sidebarBusinessName');
        if (bizNameEl && (bizNameEl.textContent === 'BUSINESS' || bizNameEl.textContent === 'MY BUSINESS' || !bizNameEl.textContent)) {
            const bName = resolvedBizName || localStorage.getItem('digibiz_impersonate_biz_name') || `${targetEmail.split('@')[0].toUpperCase()} BUSINESS`;
            bizNameEl.textContent = bName.toUpperCase();
            bizNameEl.title = bName.toUpperCase();
        }

        const mobileBizEl = document.getElementById('digibizMobileBusinessName');
        if (mobileBizEl && (mobileBizEl.textContent === 'BUSINESS' || mobileBizEl.textContent === 'MY BUSINESS' || !mobileBizEl.textContent)) {
            const bName = resolvedBizName || localStorage.getItem('digibiz_impersonate_biz_name') || `${targetEmail.split('@')[0].toUpperCase()} BUSINESS`;
            mobileBizEl.textContent = bName.toUpperCase();
        }

        const userNameEl = document.getElementById('sidebarUserName');
        if (userNameEl && (userNameEl.textContent === 'User' || !userNameEl.textContent)) {
            userNameEl.textContent = resolvedOwnerName || targetEmail;
        }

        if (window.sidebarInstance) {
            window.sidebarInstance.currentRole = 'BUSINESS_OWNER';
            window.sidebarInstance.businessNavRole = 'BUSINESS_OWNER';
            if (targetBizId) window.sidebarInstance.businessId = targetBizId;
            if (resolvedBizName) window.sidebarInstance.businessName = resolvedBizName;
        }
    };

    setInterval(enforceDOMState, 150);

    const setupBanner = () => {
        const existingBanner = document.getElementById('super-admin-impersonation-banner');
        if (existingBanner) return;

        const banner = document.createElement('div');
        banner.id = 'super-admin-impersonation-banner';
        banner.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 999999;
            background: linear-gradient(90deg, #d97706 0%, #b45309 100%);
            color: #ffffff;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 8px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.35);
            font-size: 13px;
            font-weight: 700;
            box-sizing: border-box;
        `;

        banner.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                <span style="background:#fef3c7; color:#b45309; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:800;">👑 SUPER ADMIN IMPERSONATION MODE</span>
                <span>Viewing Live Client: <strong>${targetEmail}</strong> (${targetType})</span>
            </div>
            <div style="display:flex; gap:8px; align-items:center;">
                <button id="exit-impersonation-btn" style="background:#ffffff; color:#b45309; border:none; padding:5px 14px; border-radius:6px; font-size:12px; font-weight:800; cursor:pointer; box-shadow:0 2px 6px rgba(0,0,0,0.2);" type="button">
                    ❌ Exit & Close Tab
                </button>
            </div>
        `;

        document.body.prepend(banner);
        document.body.style.marginTop = '42px';

        const exitBtn = document.getElementById('exit-impersonation-btn');
        if (exitBtn) {
            exitBtn.onclick = () => {
                localStorage.removeItem('digibiz_impersonate_active');
                localStorage.removeItem('digibiz_impersonate_email');
                localStorage.removeItem('digibiz_impersonate_biz_id');
                localStorage.removeItem('digibiz_impersonate_type');
                localStorage.removeItem('digibiz_impersonate_biz_name');
                localStorage.removeItem('digibiz_impersonate_owner_name');
                localStorage.removeItem('currentBusinessId');
                sessionStorage.removeItem('currentBusinessId');
                localStorage.removeItem('selectedBusinessId');
                sessionStorage.removeItem('selectedBusinessId');
                localStorage.removeItem('businessId');
                sessionStorage.removeItem('businessId');
                localStorage.removeItem('currentUserRole');
                sessionStorage.removeItem('currentUserRole');
                localStorage.removeItem('currentBusinessNavRole');
                sessionStorage.removeItem('currentBusinessNavRole');
                localStorage.removeItem('currentBusinessType');
                sessionStorage.removeItem('currentBusinessType');
                try {
                    window.close();
                } catch (_e) {}
                window.location.href = '/admin/super-dashboard.html';
            };
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupBanner();
            enforceDOMState();
        });
    } else {
        setupBanner();
        enforceDOMState();
    }
})();

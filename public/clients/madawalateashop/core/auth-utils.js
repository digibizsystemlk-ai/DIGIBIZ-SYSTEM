/**
 * Auth Utilities - Shared authentication, deterministic workspace resolution, and strict Client Jail enforcement.
 * Single-Tenant Dedicated Client Workspace Engine for DIGIBIZ PRO.
 */

window.DigibizDedicatedClients = {
    chisathifamilyproducts: {
        slug: 'chisathifamilyproducts',
        businessId: 'qmha16kgjogfrq93rdayvcizynj1',
        fallbackIds: ['qmha16kgjogfrq93rdayvcizynj1', 'xclawqzjbzs5uhsrmbsx0xxeoz63'],
        businessType: 'retail',
        businessName: 'CHISATHI FAMILY PRODUCTS',
        ownerName: 'Shashintha Kumara',
        ownerEmail: 'shashinthakumara@gmail.com',
        ownerEmails: ['shashinthakumara@gmail.com', 'chisathi', 'shashintha'],
        dashboardUrl: '/clients/chisathifamilyproducts/modules/retail/dashboard.html'
    },
    sathityrecentre: {
        slug: 'sathityrecentre',
        businessId: 'ndhxszkwhahf3pnbtsqgkphmwer1',
        fallbackIds: ['ndhxszkwhahf3pnbtsqgkphmwer1', 'ozcln4szrvtmqbvveqqso7abdq42'],
        businessType: 'tire_centre',
        businessName: 'SATHI TYRE & AUTO CARE CENTRE',
        ownerName: 'Sathi Tyre Centre',
        ownerEmail: 'sathityre05@gmail.com',
        ownerEmails: ['sathityre05@gmail.com', 'sathityre', 'sathi'],
        dashboardUrl: '/clients/sathityrecentre/modules/tire_centre/dashboard.html'
    },
    bawantharandipa: {
        slug: 'bawantharandipa',
        businessId: 'nzunkp8hfnnhy5f4jldrnivf96u2',
        fallbackIds: ['nzunkp8hfnnhy5f4jldrnivf96u2', 'ezkjlusswjntolc2ssfantlz37q2'],
        businessType: 'manufacturer',
        businessName: 'RANDIPA BUSINESS HOUSE',
        ownerName: 'Bawantha Randipa',
        ownerEmail: 'bawanthavisal12@gmail.com',
        ownerEmails: ['bawanthavisal12@gmail.com', 'bawanthavisal', 'randipa', 'bawantha'],
        dashboardUrl: '/clients/bawantharandipa/modules/manufacturer/dashboard.html'
    },
    micro_tech: {
        slug: 'micro_tech',
        businessId: 'micro_tech',
        fallbackIds: ['micro_tech'],
        businessType: 'retail',
        businessName: 'MICRO TECH',
        ownerName: 'H.D.D. Silva',
        ownerEmail: 'pulasthigama@gmail.com',
        ownerEmails: ['pulasthigama@gmail.com', 'micro_tech', 'microtech'],
        dashboardUrl: '/clients/micro_tech/index.html'
    },
    thusithajayasundara: {
        slug: 'thusithajayasundara',
        businessId: 'cdregezom9vxr48wkggrlcrffc63',
        fallbackIds: ['cdregezom9vxr48wkggrlcrffc63', 'mtc7rx9ly0ytyrckgkckkdlgqkk1'],
        businessType: 'coconut',
        businessName: 'THUSITHA JAYASUNDARA',
        ownerName: 'Thusitha Jayasundara',
        ownerEmail: 'thusithajayasundara@gmail.com',
        ownerEmails: ['thusithajayasundara', 'thusitha'],
        dashboardUrl: '/clients/thusithajayasundara/modules/coconut/dashboard.html'
    },
    spiholdings: {
        slug: 'spiholdings',
        businessId: '13gu7xibcbzjfs61ub42suv7ger1',
        fallbackIds: ['13gu7xibcbzjfs61ub42suv7ger1', 'yrmbb6aq4cmevsrlwkqvovmtc8b2'],
        businessType: 'distributor',
        businessName: 'SPI HOLDINGS',
        ownerName: 'Nadun De Alwis',
        ownerEmail: 'mwtradingsolutions@gmail.com',
        ownerEmails: ['mwtradingsolutions@gmail.com', 'nadundealwis', 'mwtrading', 'spiholdings'],
        dashboardUrl: '/clients/spiholdings/modules/distributor/web/dashboard.html'
    },
    madawalateashop: {
        slug: 'madawalateashop',
        businessId: 'Qxl4JRGfBZTZOFMoQYhocFR2pfp2',
        fallbackIds: ['Qxl4JRGfBZTZOFMoQYhocFR2pfp2'],
        businessType: 'credit_ledger',
        businessName: 'MADAWALA TEA SHOP',
        ownerName: 'Madawala Tea Shop',
        ownerEmail: 'madawalateashop@gmail.com',
        ownerEmails: ['madawalateashop', 'darshana', 'digibizcredit'],
        dashboardUrl: '/clients/madawalateashop/modules/credit/dashboard.html'
    },
    sunroselanka: {
        slug: 'sunroselanka',
        businessId: 'yszk1wzgo9xnoversyehjhp5soci3',
        fallbackIds: ['yszk1wzgo9xnoversyehjhp5soci3', 'yszk1wzgo9xnoversyehjh5soci3'],
        businessType: 'attendance_payroll',
        businessName: 'SUNROSE LANKA',
        ownerName: 'Champika',
        ownerEmail: 'sunroselanka@gmail.com',
        ownerEmails: ['sunroselanka', 'champika'],
        dashboardUrl: '/clients/sunroselanka/modules/attendance_payroll/dashboard.html'
    },
    royalarabian: {
        slug: 'royalarabian',
        businessId: 'tuyqndocjadkmjy2hgu7iz7ezm93',
        fallbackIds: ['tuyqndocjadkmjy2hgu7iz7ezm93'],
        businessType: 'quick_billing',
        businessName: 'ROYAL ARABIAN',
        ownerName: 'Asmin Moho',
        ownerEmail: 'royalarabian@gmail.com',
        ownerEmails: ['asminmoho', 'royalarabian'],
        dashboardUrl: '/clients/royalarabian/modules/quick_billing/app.html'
    }
};

window.DigibizClientMap = {
    resolveDedicatedClient(user, customSlug = null) {
        const email = String((user && user.email) || '').trim().toLowerCase();
        const pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname.toLowerCase() : '';
        const pathMatch = pathname.match(/^\/clients\/([^\/]+)/i);
        const urlSlug = customSlug || (pathMatch ? pathMatch[1] : null);

        // 1. Direct match by URL slug if known
        if (urlSlug && window.DigibizDedicatedClients[urlSlug]) {
            return window.DigibizDedicatedClients[urlSlug];
        }

        // 2. Direct match by user email
        if (email) {
            for (const key in window.DigibizDedicatedClients) {
                const item = window.DigibizDedicatedClients[key];
                if (item.ownerEmails && item.ownerEmails.some(em => email.includes(em))) {
                    return item;
                }
            }
        }

        return null;
    },

    resolveClientInfo(user, userData, businessDocData) {
        const email = String((user && user.email) || '').trim().toLowerCase();
        const bId = String((userData && userData.businessId) || (businessDocData && businessDocData.id) || (user && user.uid) || localStorage.getItem('currentBusinessId') || '').trim();
        const bType = String((businessDocData && businessDocData.businessType) || (userData && userData.businessType) || localStorage.getItem('currentBusinessType') || 'retail').trim().toLowerCase();

        // 1. Check if user is Super Admin
        const role = String((userData && userData.role) || localStorage.getItem('currentUserRole') || '').toUpperCase();
        if (role === 'SUPER_ADMIN' || role === 'SUPERADMIN' || email.includes('superadmin') || email.startsWith('chinthaka') || email === 'biz.sirimal@gmail.com' || email === '2biz.sirimal@gmail.com') {
            return {
                isSuperAdmin: true,
                clientSlug: 'admin',
                businessId: null,
                businessType: 'retail',
                businessName: 'DIGIBIZ SYSTEM ADMIN',
                ownerName: 'Super Admin',
                role: 'SUPER_ADMIN',
                dashboardUrl: '/admin/super-dashboard.html'
            };
        }

        // 2. Deterministic Client Mapping for Verified Dedicated Workspaces
        const dedicated = this.resolveDedicatedClient(user);
        if (dedicated) {
            return {
                isSuperAdmin: false,
                clientSlug: dedicated.slug,
                businessId: dedicated.businessId,
                businessType: dedicated.businessType,
                businessName: dedicated.businessName,
                ownerName: dedicated.ownerName,
                role: 'BUSINESS_OWNER',
                dashboardUrl: dedicated.dashboardUrl
            };
        }

        // 3. Specific Registered Dedicated Client Slug (Custom Tenant)
        const customSlug = (userData && userData.clientSlug) || (businessDocData && businessDocData.clientSlug) || localStorage.getItem('currentClientSlug');
        if (customSlug) {
            return {
                isSuperAdmin: false,
                clientSlug: customSlug,
                businessId: bId,
                businessType: bType,
                businessName: (businessDocData && businessDocData.name) || 'Client Business',
                ownerName: (userData && (userData.ownerName || userData.name)) || 'Business Owner',
                role: (userData && userData.role) || 'BUSINESS_OWNER',
                dashboardUrl: `/clients/${customSlug}/modules/${bType}/dashboard.html`
            };
        }

        return {
            isSuperAdmin: false,
            clientSlug: '',
            businessId: bId,
            businessType: bType,
            businessName: 'My Business',
            ownerName: 'Business Owner',
            role: (userData && userData.role) || 'BUSINESS_OWNER',
            dashboardUrl: `/modules/${bType}/dashboard.html`
        };
    },

    enforceJail(user, userData, businessDocData) {
        if (!user) return;
        const info = this.resolveClientInfo(user, userData, businessDocData);
        if (info.isSuperAdmin) return; // Super Admin has unrestricted access

        const currentPath = String(window.location.pathname || '').toLowerCase();
        if (currentPath.includes('/auth/') || currentPath === '/' || currentPath === '/index.html') return;

        if (info.clientSlug) {
            const allowedPrefix = `/clients/${info.clientSlug.toLowerCase()}/`;
            if (!currentPath.startsWith(allowedPrefix)) {
                console.warn(`[SECURITY JAIL] Unauthorized path ${currentPath} for client ${info.clientSlug}. Hard redirecting to ${info.dashboardUrl}`);
                window.location.replace(info.dashboardUrl);
            }
        }
    }
};

window.AuthUI = {
    async routeToUniversalDashboard(user) {
        if (!user) return;
        try {
            let retry = 0;
            while (!window.db && retry < 50) {
                await new Promise(r => setTimeout(r, 100));
                retry++;
            }
            if (!window.db) {
                window.location.href = '/';
                return;
            }

            let businessId = user.uid;
            let userData = {};
            let businessData = {};

            // 1. Check Dedicated Client Map First
            const dedicated = window.DigibizClientMap.resolveDedicatedClient(user);
            if (dedicated) {
                businessId = dedicated.businessId;
                businessData.businessType = dedicated.businessType;
                businessData.name = dedicated.businessName;
                userData.role = 'BUSINESS_OWNER';
                userData.name = dedicated.ownerName;
            } else {
                // Fetch business doc directly
                try {
                    const businessDoc = await window.db.collection('businesses').doc(businessId).get().catch(() => null);
                    if (businessDoc && businessDoc.exists) {
                        businessData = businessDoc.data() || {};
                    }
                } catch (eBiz) {
                    console.warn('[AuthUI] Business fetch notice:', eBiz);
                }

                // Fetch business user doc from subcollection
                try {
                    const bizUserDoc = await window.db.collection('businesses').doc(businessId).collection('users').doc(user.uid).get().catch(() => null);
                    if (bizUserDoc && bizUserDoc.exists) {
                        userData = bizUserDoc.data() || {};
                    }
                } catch (eBizUser) {}

                // Fallback to root users if available
                if (!userData.role) {
                    try {
                        const userDoc = await window.db.collection('users').doc(user.uid).get().catch(() => null);
                        if (userDoc && userDoc.exists) {
                            userData = { ...userDoc.data(), ...userData };
                            if (userData.businessId) businessId = userData.businessId;
                        }
                    } catch (eUser) {}
                }
            }

            const businessType = businessData.businessType || userData.businessType || 'retail';
            const userRole = userData.role || 'BUSINESS_OWNER';

            localStorage.setItem('currentBusinessId', businessId);
            sessionStorage.setItem('currentBusinessId', businessId);
            localStorage.setItem('currentBusinessType', businessType);
            sessionStorage.setItem('currentBusinessType', businessType);
            localStorage.setItem('currentUserRole', userRole);
            sessionStorage.setItem('currentUserRole', userRole);
            localStorage.setItem('currentBusinessNavRole', userRole);
            sessionStorage.setItem('currentBusinessNavRole', userRole);

            const info = window.DigibizClientMap.resolveClientInfo(user, userData, businessData);
            if (info.clientSlug) {
                localStorage.setItem('currentClientSlug', info.clientSlug);
                sessionStorage.setItem('currentClientSlug', info.clientSlug);
            }

            window.location.href = info.dashboardUrl;
        } catch (err) {
            console.error('[AuthUI] Routing fallback:', err);
            const fallbackInfo = window.DigibizClientMap.resolveClientInfo(user, {}, {});
            window.location.href = fallbackInfo.dashboardUrl;
        }
    }
};

// Automatic background jail check on auth state change
if (typeof window !== 'undefined' && window.firebase && window.firebase.auth) {
    window.firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
            try {
                if (window.db) {
                    const userDoc = await window.db.collection('users').doc(user.uid).get().catch(() => null);
                    const userData = userDoc && userDoc.exists ? userDoc.data() : {};
                    window.DigibizClientMap.enforceJail(user, userData, {});
                } else {
                    window.DigibizClientMap.enforceJail(user, {}, {});
                }
            } catch (eJail) {
                window.DigibizClientMap.enforceJail(user, {}, {});
            }
        }
    });
}

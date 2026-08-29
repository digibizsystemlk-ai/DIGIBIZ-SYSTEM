// 🛡️ Comprehensive Auto-Purge Test Sandbox Engine (Wipes subcollections AND flat root collections)

(function removeAnyLegacySandboxBar() {
    try {
        const killBar = () => {
            const el = document.getElementById('digibizSandboxBar');
            if (el) el.remove();
            const scriptEl = document.querySelector('script[src*="sandbox-data-bridge"]');
            if (scriptEl) scriptEl.remove();
        };
        killBar();
        if (typeof document !== 'undefined') {
            document.addEventListener('DOMContentLoaded', killBar);
            setTimeout(killBar, 500);
            setTimeout(killBar, 1500);
        }
    } catch(e) {}
})();

// Global Developer Sandbox Purge Helper
window.forceWipeMySandbox = async function () {
    try {
        const user = window.firebase && firebase.auth ? firebase.auth().currentUser : null;
        if (!user || !window.db) {
            alert("User not logged in or database not ready.");
            return;
        }
        const uid = user.uid;
        const collectionsToWipe = [
            ['products', 'list'], ['services', 'list'], ['customers', 'list'],
            ['suppliers', 'list'], ['purchases', 'orders'], ['purchases', 'list'],
            ['orders', 'list'], ['expenses', 'list'], ['journal', 'entries'],
            ['banks', 'accounts'], ['banks', 'transactions'], ['cheques', 'list'],
            ['job_cards', 'list'], ['appointments', 'list'], ['activityLogs', 'entries'],
            ['businesses', 'products'], ['businesses', 'orders'], ['businesses', 'expenses'],
            ['businesses', 'customers'], ['businesses', 'suppliers'], ['businesses', 'staff']
        ];
        for (const [col, sub] of collectionsToWipe) {
            const snap = await window.db.collection(col).doc(uid).collection(sub).get().catch(() => ({ docs: [] }));
            if (snap.docs && snap.docs.length > 0) {
                const batch = window.db.batch();
                snap.docs.forEach(d => batch.delete(d.ref));
                await batch.commit();
            }
        }
        await window.db.collection('counters').doc(uid).delete().catch(() => {});
        alert("✅ All test data for this Sandbox has been purged! Reloading...");
        window.location.reload();
    } catch (err) {
        console.error("Purge error:", err);
        alert("Purge error: " + err.message);
    }
};

(function autoInjectAdminImpersonation() {
    try {
        const search = (typeof window !== 'undefined' && window.location && window.location.search) ? window.location.search : '';
        if ((typeof localStorage !== 'undefined' && localStorage.getItem('digibiz_impersonate_active') === 'true') || search.includes('impersonate=true')) {
            if (document.querySelector && !document.querySelector('script[src*="admin-impersonation.js"]')) {
                const s = document.createElement('script');
                s.src = '/admin/scripts/admin-impersonation.js';
                if (document.head) document.head.appendChild(s);
            }
        }
    } catch(e) {}
})();

(function autoInjectVersionUpdateNotifier() {
    try {
        if (typeof window !== 'undefined' && document.head && !document.querySelector('script[src*="version-update-banner.js?v=20260822_nobanner_v25"]')) {
            const s = document.createElement('script');
            s.src = '/core/version-update-banner.js?v=20260822_nobanner_v25';
            s.async = true;
            document.head.appendChild(s);
        }
    } catch(e) {}
})();


// TWA & Android App Environment Detection
const searchStr = (typeof window !== 'undefined' && window.location && window.location.search) ? window.location.search : '';
const referrerStr = (typeof document !== 'undefined' && document.referrer) ? document.referrer : '';
const isAndroidAppEnv = searchStr.includes('platform=android') 
    || referrerStr.startsWith('android-app://') 
    || (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('is_android_app') === 'true')
    || (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.includes('DIGIBIZ_ANDROID_APP'));

if (isAndroidAppEnv) {
    try {
        sessionStorage.setItem('is_android_app', 'true');
        localStorage.setItem('preferredLanguage', 'en');
    } catch(e) {}
}

window.i18n = function(key) {
    return key || '';
};

const SIDEBAR_WIDTH = 260;
const DIGIBIZ_UPDATE_VERSION = '2026.04.17.2';
/** Open primary nav links in a new tab (product default). */
const SIDEBAR_NAV_LINK_TARGET = '_self';
const SIDEBAR_NAV_LINK_REL = 'noopener noreferrer';
const DIGIBIZ_UPDATE_TITLE = "What's New";
const DIGIBIZ_UPDATE_POINTS = [
    'Custom SMS Header is now editable from SMS Settings.',
    'All trial accounts now receive reliable free 300 SMS seeding.',
    'Sidebar business-type locking is stabilized for correct menus on every load.',
    'Manufacturer account, reports, and SMS queue logging are restored.',
    'SMS wallet: 300 trial credits (7 days) + paid credits; Billing & Super Admin show usage (1 credit per SMS).'
];

/** 
 * Comprehensive pool of all available menus for Distributor.
 * IDs are used for persistence in sidebarConfig.
 */
const DISTRIBUTOR_MENU_POOL = [
    { id: 'dashboard', permissionId: 'canViewDashboard', icon: '📊', name: 'Dashboard', link: '/modules/distributor/web/dashboard.html' },
    { id: 'grn', permissionId: 'canStockEdit', icon: '📜', name: 'GRN', link: '/modules/distributor/web/grn.html' },
    { id: 'new_sales_order', permissionId: 'canInvoiceCreateEdit', icon: '🛒', name: 'New sales order', link: '/modules/distributor/web/new-order.html' },
    { id: 'orders', permissionId: 'canOrderWorkflowApprove', icon: '📋', name: 'All Orders', link: '/modules/distributor/web/index.html?tab=pending' },
    { id: 'product_sales_history', permissionId: 'canSalesView', icon: '📊', name: 'Product Sales History', link: '/modules/distributor/web/sales-history.html' },
    { id: 'invoices', permissionId: 'canInvoiceCreateEdit', icon: '📜', name: 'Invoices', link: '/modules/distributor/web/invoices.html' },
    { id: 'products', permissionId: 'canProductView', icon: '📦', name: 'Products', link: '/modules/distributor/web/products.html' },
    { id: 'warehouse', permissionId: 'canStockView', icon: '🏬', name: 'Warehouse', link: '/modules/distributor/web/warehouse.html' },
    { id: 'deliveries', permissionId: 'canDeliveriesManage', icon: '🚚', name: 'Deliveries', link: '/modules/distributor/web/deliveries.html' },
    { id: 'free_issues', permissionId: 'canStockView', icon: '🎁', name: 'Free issues log', link: '/modules/distributor/web/free-items.html' },
    { id: 'returns', permissionId: 'canStockView', icon: '🔄', name: 'Returns & Claims', link: '/modules/distributor/web/returns.html' },
    { id: 'shops', permissionId: 'canCustomerView', icon: '🏪', name: 'Shops', link: '/modules/distributor/web/my-shops.html' },
    { id: 'staff_salary', permissionId: 'canManageRepsWeb', icon: '👥', name: 'Staff Salary', link: '/modules/distributor/web/staff-salary.html' },
    { id: 'cheques', permissionId: 'canChequesManage', icon: '📝', name: 'Cheques', link: '/modules/distributor/web/cheques.html' },
    { id: 'credit_aging', permissionId: 'canCreditAgingView', icon: '📉', name: 'Credit Aging', link: '/modules/distributor/web/credit-aging.html' },
    { id: 'commission_config', permissionId: 'canSettingsChange', icon: '⚙️', name: 'Commission Config', link: '/modules/distributor/web/commission-config.html' },
    { id: 'rep_commission', permissionId: 'canRepCommissionView', icon: '💰', name: 'Rep Commission', link: '/modules/distributor/web/rep-commission-report.html' },
    { id: 'distributor_revenue', permissionId: 'canViewFinancialsProfit', icon: '📈', name: 'Revenue', link: '/modules/distributor/web/revenue.html' },
    { id: 'distributor_expenses', permissionId: 'canViewFinancialsProfit', icon: '💸', name: 'Expenses', link: '/modules/distributor/web/expenses.html' },
    { id: 'finance', permissionId: 'canViewFinancialsProfit', icon: '🏛️', name: 'Finance Ledger', link: '/modules/distributor/web/finance-ledger.html' },
    { id: 'accounting', permissionId: 'canViewAccounting', icon: '📁', name: 'Accounting', link: '/modules/distributor/web/accounting.html' },
    { id: 'distributor_reports', permissionId: 'canViewReportsFull', icon: '📊', name: 'Distributor Reports', link: '/modules/distributor/web/reports.html' },
    { id: 'user_manual', permissionId: '', icon: '📖', name: 'User Manual', link: '/modules/distributor/web/user-manual.html' }
];
/** Only the marketing root should skip the app sidebar — not module pages named index.html */
const SHOULD_RESERVE_SIDEBAR_SPACE = (() => {
    const raw = (window.location.pathname || '').split('?')[0];
    const p = raw.replace(/\/+/g, '') || '/';
    return p !== '/' && p !== '/index.html';
})();

function digibizSmsEffectiveTotal(w) {
    if (!w || typeof w !== 'object') return 0;
    if (window.SmsWalletCore && typeof window.SmsWalletCore.effectiveTotal === 'function') {
        return window.SmsWalletCore.effectiveTotal(w);
    }
    const paid = Math.max(0, Number(w.paidSmsBalance ?? w.paidBalance ?? 0));
    let trial = Math.max(0, Number(w.trialSmsBalance ?? w.trialBalance ?? 0));
    const exp = w.trialSmsExpiresAt || w.trialExpiresAt;
    if (exp) {
        const t = typeof exp.toDate === 'function' ? exp.toDate().getTime() : new Date(exp).getTime();
        if (!Number.isNaN(t) && Date.now() > t) trial = 0;
    }
    const sum = paid + trial;
    if (sum >= 1) return sum;
    return Math.max(0, Number(w.smsBalance || 0));
}

function ensureSubscriptionManagerLoaded() {
    return new Promise((resolve) => {
        if (window.subscriptionManager) {
            resolve();
            return;
        }
        if (document.getElementById('subscription-manager-script')) {
            document.getElementById('subscription-manager-script').addEventListener('load', () => resolve());
            return;
        }
        const script = document.createElement('script');
        script.id = 'subscription-manager-script';
        script.src = '/subscription/subscription-manager.js';
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
    });
}

function ensureSidebarStyles() {
    if (document.getElementById('sidebar-main-styles')) return;
    const style = document.createElement('style');
    style.id = 'sidebar-main-styles';
    style.textContent = `
        /* Body left gutter: set only in each page\'s first <style> (avoids duplicate margin with module CSS). */
        .retail-navbar{position:fixed;left:0;top:0;width:${SIDEBAR_WIDTH}px;height:100vh;background:linear-gradient(135deg,#0a2a44 0%,#1e3c72 100%);color:#fff;z-index:10005 !important;overflow-y:auto;display:flex;flex-direction:column;justify-content:space-between;font-family:'Inter',sans-serif;pointer-events:auto;}
        .retail-navbar *{pointer-events:auto;}
        .digibiz-mobile-menu-toggle{position:fixed;top:15px;left:15px;z-index:10001;width:46px;height:46px;border:none;border-radius:12px;background:rgba(15,59,44,.95);color:#fff;display:none;align-items:center;justify-content:center;box-shadow:0 10px 24px rgba(0,0,0,.35);cursor:pointer;font-size:20px;padding:0;margin:0;backdrop-filter:blur(2px);}
        .digibiz-mobile-topbar{position:fixed;top:15px;left:70px;right:15px;height:46px;background:rgba(10,42,68,.96);border-radius:12px;z-index:10000;display:none;align-items:center;padding:0 12px;box-shadow:0 10px 24px rgba(0,0,0,.28);gap:10px;}
        .digibiz-mobile-biz-logo{width:34px;height:34px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,.2);flex-shrink:0;display:none;background:rgba(0,0,0,.15);}
        .digibiz-mobile-biz-logo.is-visible{display:block;}
        .digibiz-mobile-brand-wrap{position:relative;display:inline-flex;align-items:center;padding-right:6px;gap:6px;}
        .digibiz-mobile-brand{font-size:16px;font-weight:900;letter-spacing:.55px;color:#ffd966;white-space:nowrap;line-height:1;}
        .digibiz-mobile-status-dot{width:9px;height:9px;border-radius:50%;display:inline-block;flex-shrink:0;transition:all .3s ease;}
        .digibiz-mobile-status-dot.online{background:#10b981;box-shadow:0 0 0 2.5px rgba(16,185,129,.35);animation:pulseGreenDot 2s infinite;}
        .digibiz-mobile-status-dot.offline{background:#ef4444;box-shadow:0 0 0 2.5px rgba(239,68,68,.35);animation:none;}
        @keyframes pulseGreenDot{0%{transform:scale(0.95);opacity:0.8;}50%{transform:scale(1.2);opacity:1;}100%{transform:scale(0.95);opacity:0.8;}}
        .digibiz-mobile-business-name{font-size:12px;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1;text-transform:uppercase;font-weight:700;letter-spacing:.35px;text-align:center;}
        /* Permanently suppress install app prompt banner across entire DigiBiz system */
        .install-prompt, #installPrompt { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; height: 0 !important; overflow: hidden !important; margin: 0 !important; padding: 0 !important; border: none !important; }
        .digibiz-mobile-right-spacer{width:18px;flex:0 0 18px;}
        .biz-name{text-transform:uppercase !important;}
        .digibiz-sidebar-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9998;opacity:0;pointer-events:none;transition:opacity .2s ease;}
        html.digibiz-sidebar-open .digibiz-sidebar-overlay{opacity:1;pointer-events:auto;}
        .trial-sidebar-banner{background:#dc2626;color:#fff;text-align:center;padding:6px 8px;font-size:11px;font-weight:700;letter-spacing:.5px;animation:pulseRed 1s infinite;border-bottom:1px solid rgba(255,255,255,.2);}
        @keyframes pulseRed{0%{background:#dc2626;}50%{background:#b91c1c;}100%{background:#dc2626;}}
        .sidebar-header{padding:16px 24px;border-bottom:1px solid rgba(255,255,255,.15);}
        .logo{font-size:24px;font-weight:700;text-align:center;margin-bottom:12px;}
        .logo span{color:#ffd966;}
        .sidebar-business-logo-wrap{display:flex;justify-content:center;align-items:center;min-height:48px;margin:0 0 10px;}
        .sidebar-business-logo-img{max-height:52px;max-width:200px;width:auto;object-fit:contain;border-radius:12px;border:1px solid rgba(255,255,255,.22);background:rgba(0,0,0,.12);display:none;}
        .sidebar-business-logo-img.is-visible{display:block;}
        .sidebar-business-logo-icon{font-size:38px;line-height:1;display:none;}
        .sidebar-business-logo-icon.is-visible{display:block;}
        .sidebar-business-name{font-size:13px;font-weight:800;text-align:center;color:#e5f3ff;margin:0 0 14px;text-transform:uppercase !important;letter-spacing:.4px;min-height:18px;display:block !important;visibility:visible !important;}
        .user-info-sidebar{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:rgba(255,255,255,.1);padding:14px 12px 28px 12px;border-radius:12px;position:relative;overflow:hidden;width:100%;box-sizing:border-box;}
        .connection-status-sidebar{position:absolute;bottom:6px;left:0;right:0;text-align:center;font-size:9px;font-weight:800;letter-spacing:.6px;}
        .user-avatar-sidebar{display:none;}
        .user-name-sidebar{font-size:14px;font-weight:700;color:#fff;margin-bottom:4px;word-break:break-word;text-align:center;}
        .user-role-sidebar{font-size:8.5px;padding:3px 10px;border-radius:20px;background:rgba(0,0,0,.35);display:inline-block;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;letter-spacing:0.2px;box-sizing:border-box;}
        .sidebar-subscription-status{margin-top:8px;font-size:11px;color:#fde68a;font-weight:700;}
        .nav-links{flex:1;padding:16px 0;}
        .menu-section-label{padding:8px 24px;font-size:10px;letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.6);font-weight:700;}
        .menu-item{padding:12px 24px;display:flex;align-items:center;gap:14px;color:rgba(255,255,255,.85);text-decoration:none;font-size:14px;transition:all .2s;border-left:3px solid transparent;}
        .menu-item:hover{background:rgba(255,255,255,.12);color:#ffd966;border-left:3px solid #ffd966;}
        .menu-item.active{background:rgba(255,255,255,.18) !important;color:#ffd966 !important;border-left:4px solid #ffd966 !important;font-weight:800 !important;box-shadow:inset 4px 0 12px rgba(255,217,102,0.15);}
        .menu-badge-new{background:#10b981;color:#fff;font-size:9px;font-weight:900;padding:2px 6px;border-radius:6px;margin-left:auto;text-transform:uppercase;animation:pulseGreen 2s infinite;}
        @keyframes pulseGreen{0%{box-shadow:0 0 0 0 rgba(16,185,129,0.7);}70%{box-shadow:0 0 0 6px rgba(16,185,129,0);}100%{box-shadow:0 0 0 0 rgba(16,185,129,0);}}
        .menu-dropdown-toggle{width:100%;text-align:left;background:transparent;border:none;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:14px;color:rgba(255,255,255,.85);font-size:14px;cursor:pointer;border-left:3px solid transparent;}
        .menu-dropdown-toggle:hover{background:rgba(255,255,255,.12);color:#ffd966;border-left:3px solid #ffd966;}
        .menu-dropdown-items{display:none;background:rgba(255,255,255,.06);}
        .menu-dropdown.open .menu-dropdown-items{display:block;}
        .menu-dropdown-items .menu-item{padding-left:52px;font-size:13px;}
        .sidebar-footer{padding:16px 20px;}
        .sidebar-lang-switch{display:flex;background:rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:3px;margin-bottom:10px;gap:3px;box-sizing:border-box;}
        .sidebar-lang-btn{flex:1;border:none;background:transparent;color:rgba(255,255,255,.7);font-size:11.5px;font-weight:800;padding:6px 0;border-radius:9px;cursor:pointer;transition:all .2s ease;text-align:center;}
        .sidebar-lang-btn:hover{color:#fff;}
        .sidebar-lang-btn.active{background:#10b981;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.3);}
        .logout-sidebar-btn{background:rgba(220,38,38,.8);border:none;color:#fff;padding:10px 20px;border-radius:8px;cursor:pointer;width:100%;font-size:14px;}
        .logout-sidebar-btn:hover{background:#dc2626;}
        .ledger-section-title{padding:8px 24px 4px 24px;font-size:10px;letter-spacing:.8px;text-transform:uppercase;color:#38bdf8;font-weight:700;}
        .ledger-sub-item{padding:10px 24px 10px 52px;display:flex;align-items:center;justify-content:space-between;color:rgba(255,255,255,.75);text-decoration:none;font-size:13px;transition:all .2s;border-left:3px solid transparent;}
        .ledger-sub-item:hover{background:rgba(255,255,255,.1);color:#ffd966;}
        .ledger-balance-badge{font-size:11px;font-weight:700;}
        .swal2-container{z-index:9999999 !important;}
        @media (max-width:768px){
            html.digibiz-mobile-toggle-space body{padding-top:72px;} html.digibiz-credit-app body, body.credit-app-body{padding-top:0 !important; margin-top:0 !important;} 
            .digibiz-mobile-menu-toggle{display:flex;} 
            .digibiz-mobile-topbar{display:flex;} 
            .retail-navbar{transform:translateX(-100%);transition:transform .2s ease;z-index:10005 !important;} 
            .retail-navbar .sidebar-business-name{display:block !important;visibility:hidden !important;} 
            html.digibiz-sidebar-open .retail-navbar{transform:translateX(0);}
            html.digibiz-sidebar-open .digibiz-mobile-topbar{display:none !important;}
            html.digibiz-sidebar-open .digibiz-mobile-menu-toggle{display:none !important;}
        }
    `;
    document.head.appendChild(style);
}

function closeMobileSidebar() {
    document.documentElement.classList.remove('digibiz-sidebar-open');
}

function ensureMobileSidebarControls() {
    ensureSidebarStyles();
    document.documentElement.classList.add('digibiz-mobile-toggle-space');
    if (!document.getElementById('digibizMobileMenuToggle')) {
        const toggle = document.createElement('button');
        toggle.id = 'digibizMobileMenuToggle';
        toggle.className = 'digibiz-mobile-menu-toggle';
        toggle.type = 'button';
        toggle.setAttribute('aria-label', 'Open menu');
        toggle.innerHTML = 'â˜°';
        document.body.appendChild(toggle);
        toggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('digibiz-sidebar-open');
        });
    }
    if (!document.getElementById('digibizSidebarOverlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'digibizSidebarOverlay';
        overlay.className = 'digibiz-sidebar-overlay';
        document.body.appendChild(overlay);
        overlay.addEventListener('click', closeMobileSidebar);
        overlay.addEventListener('touchstart', closeMobileSidebar, { passive: true });
    }
    const pathLowerCurrent = String(window.location.pathname || '').toLowerCase();
    const isCreditApp = pathLowerCurrent.includes('/madawalateashop/') || pathLowerCurrent.includes('/credit/');
    if (isCreditApp) {
        document.documentElement.classList.remove('digibiz-mobile-toggle-space');
        const tb = document.getElementById('digibizMobileTopbar');
        if (tb) tb.remove();
        const tg = document.getElementById('digibizMobileMenuToggle');
        if (tg) tg.remove();
    } else if (!document.getElementById('digibizMobileTopbar')) {
        const topbar = document.createElement('div');
        topbar.id = 'digibizMobileTopbar';
        topbar.className = 'digibiz-mobile-topbar';
        topbar.innerHTML = `
            <img id="digibizMobileBusinessLogoImg" class="digibiz-mobile-biz-logo" alt="" decoding="async" />
            <div class="digibiz-mobile-brand-wrap">
                <div class="digibiz-mobile-brand">DIGIBIZ</div>
                <span class="digibiz-mobile-status-dot online" id="digibizMobileStatusDot" title="Network Connection Status"></span>
            </div>
            <div class="digibiz-mobile-business-name biz-name" id="digibizMobileBusinessName"></div>
            <div class="digibiz-mobile-right-spacer"></div>
        `;
        document.body.appendChild(topbar);
    }
    
    window.addEventListener('online', () => {
        if (window.sidebar && typeof window.sidebar.updateConnectionStatusText === 'function') {
            window.sidebar.updateConnectionStatusText();
        }
    });
    window.addEventListener('offline', () => {
        if (window.sidebar && typeof window.sidebar.updateConnectionStatusText === 'function') {
            window.sidebar.updateConnectionStatusText();
        }
    });
    if (!document.body.dataset.sidebarOutsideCloseBound) {
        const outsideCloseHandler = (event) => {
            if (!document.documentElement.classList.contains('digibiz-sidebar-open')) return;
            const sidebar = document.querySelector('.retail-navbar.digibiz-sidebar');
            const toggle = document.getElementById('digibizMobileMenuToggle');
            const target = event.target;
            if (sidebar && sidebar.contains(target)) return;
            if (toggle && toggle.contains(target)) return;
            closeMobileSidebar();
        };
        document.addEventListener('click', outsideCloseHandler, true);
        document.addEventListener('touchstart', outsideCloseHandler, true);
        document.body.dataset.sidebarOutsideCloseBound = 'true';
    }
}

function preReserveSidebarSpace() {
    if (!SHOULD_RESERVE_SIDEBAR_SPACE) return;
    ensureSidebarStyles();
    document.documentElement.classList.add('digibiz-sidebar-reserved');
}

class Sidebar {
    constructor() {
        preReserveSidebarSpace();
        this.mwBusinessId = '13Gu7XIBcBZJFS61Ub42sUV7ger1';
        this.spranzaBusinessId = 'SPRANZA_PVT_LTD';
        this.kduTeaBusinessId = '0Uled5estVeQVN8cChmMTNRDNIE3';
        this.scrapOwnerUid = 'oDhSDYHQ2dV1DP33koysmZAqaY13';
        this.superAdmin = false;
        this.businessLogoUrl = '';
        this.sidebarConfig = null; // Stores array of menu IDs and visibility Base
        // Instant cached boot to render connection status instantly offline
        this.bootCachedSidebarNow();
        this.init();
        window.addEventListener('online', () => this.updateConnectionStatusText());
        window.addEventListener('offline', () => this.updateConnectionStatusText());
        setInterval(() => this.updateConnectionStatusText(), 1500); // Polling status check every 1.5 seconds

        // ULTIMATE CACHE BUSTER: Clear all permission caches on every load/refresh for staff sync
        try {
            const bid = localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId');
            if (bid) {
                sessionStorage.removeItem(`digibiz_perms_v2_${bid}`);
                sessionStorage.removeItem(`digibiz_perm_v_${bid}`);
                sessionStorage.removeItem(`digibiz_sidebar_cache_v2`);
                localStorage.removeItem(`digibiz_sidebar_cache_${this.currentUserId}`);
            }
        } catch (e) { }
    }

    getStoredBusinessType() {
        return this.normalizeBusinessType(localStorage.getItem('currentBusinessType') || sessionStorage.getItem('currentBusinessType') || '');
    }

    normalizeBusinessType(typeRaw) {
        const raw = String(typeRaw || '').trim().toLowerCase();
        if (!raw) return '';
        const compact = raw.replace(/[\s\-_]+/g, '');
        if (compact.includes('scrap')) return 'scrap_collection_center';
        if (compact === 'teafactory') return 'manufacturer';
        if (compact === 'distributor') return 'distributor';
        if (compact === 'bakery' || compact === 'baking') return 'bakery';
        if (compact === 'manufacturer') return 'manufacturer';
        if (compact === 'pharmacy') return 'pharmacy';
        if (compact === 'hardware') return 'hardware';
        if (compact === 'service') return 'service';
        if (compact === 'attendancepayroll' || compact === 'attendance_payroll') return 'attendance_payroll';
        if (compact === 'retail') return 'retail';
        if (compact === 'coconut' || compact === 'coconutwholesale') return 'coconut';
        if (compact === 'autocare' || compact === 'vehiclerepair' || compact === 'auto_care') return 'auto_care';
        if (compact === 'creditledger' || compact === 'credit' || compact.includes('credit') || compact.includes('darshana') || compact.includes('madawala')) return 'credit_ledger';
        if (compact === 'quickbilling' || compact === 'quickbill' || compact === 'easybill' || compact === 'billing' || compact === 'quick_billing' || compact === 'easy_bill') return 'quick_billing';
        return raw;
    }

    isMobileView() {
        return window.innerWidth <= 768;
    }

    shouldForceManufacturerMode() {
        const path = String(window.location.pathname || '').toLowerCase();
        return this.getStoredBusinessType() === 'manufacturer' || path.includes('/modules/manufacturer/');
    }

    primeFromCache(userId) {
        const storedType = this.getStoredBusinessType();
        const storedBusinessId = localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId') || null;
        const storedBusinessName = localStorage.getItem('currentBusinessName') || sessionStorage.getItem('currentBusinessName') || 'Business';
        const storedRole = localStorage.getItem('currentUserRole')
            || sessionStorage.getItem('currentUserRole')
            || window.__DIGIBIZ_LOCAL_ROLE__
            || 'VIEWER';
        const storedBizRole = localStorage.getItem('currentBusinessNavRole')
            || sessionStorage.getItem('currentBusinessNavRole')
            || storedRole;

        this.currentUserId = userId;
        this.currentRole = String(storedRole || 'VIEWER');
        this.businessNavRole = String(storedBizRole || this.currentRole || 'VIEWER');
        this.businessId = storedBusinessId;
        const pathIsBakery = String(window.location.pathname || '').toLowerCase().includes('/modules/bakery/');
        const pathIsManufacturer = String(window.location.pathname || '').toLowerCase().includes('/modules/manufacturer/');
        const pathIsScrap = String(window.location.pathname || '').toLowerCase().includes('/scrap') || String(window.location.pathname || '').toLowerCase().includes('/admin/scrap');
        const pathIsCredit = String(window.location.pathname || '').toLowerCase().includes('/modules/credit/') || String(window.location.pathname || '').toLowerCase().includes('/clients/digibizcredit/');
        const pathIsQuickBilling = String(window.location.pathname || '').toLowerCase().includes('/modules/quick_billing/');

        const storedPlan = (userId ? localStorage.getItem(`digibiz_user_plan_${userId}`) : null)
            || (storedBusinessId ? localStorage.getItem(`digibiz_cached_plan_${storedBusinessId}`) : null)
            || '';
        this.cachedPlan = storedPlan;

        if (pathIsCredit || storedType === 'credit_ledger' || storedType === 'creditledger') {
            this.businessType = 'credit_ledger';
        } else if (pathIsScrap) {
            this.businessType = 'scrap_collection_center';
        } else if (pathIsQuickBilling || storedType === 'quick_billing') {
            this.businessType = 'quick_billing';
        } else if (pathIsBakery) {
            this.businessType = 'bakery';
        } else if (pathIsManufacturer && storedType !== 'scrap_collection_center') {
            this.businessType = 'manufacturer';
        } else {
            this.businessType = storedType || (this.shouldForceManufacturerMode() ? 'manufacturer' : 'retail');
        }
        this.businessName = storedBusinessName || 'Business';
        this.businessLogoUrl = localStorage.getItem('digibizBusinessLogoUrl') || sessionStorage.getItem('digibizBusinessLogoUrl') || '';
        this.ownerName = this.ownerName || '';
        this.manufacturerDueAlert = null;
        this.smsLowBalanceAlert = null;
    }

    bootCachedSidebarNow() {
        try {
            this.primeFromCache(this.currentUserId || null);
            this.render();
            this.attachEvents();
        } catch (e) {
            // ignore bootstrap paint errors; async init will still recover
        }
    }

    async init() {
        // Load subscription manager in background so sidebar can paint immediately.
        const subscriptionReady = ensureSubscriptionManagerLoaded();
        firebase.auth().onAuthStateChanged(async (user) => {
            const cachedTypeBeforeLoad = String(localStorage.getItem('currentBusinessType') || sessionStorage.getItem('currentBusinessType') || '').toLowerCase();
            if (user && SHOULD_RESERVE_SIDEBAR_SPACE) {
                this.primeFromCache(user.uid);

                // Paint sidebar immediately with cached state (single initial paint)
                this.render();
                this.attachEvents();

                // Load database profile details asynchronously in the background
                (async () => {
                    try {
                        const previousType = this.businessType;
                        await this.loadUserData(user.uid);
                        await this.refreshBusinessNameFromProfile();
                        
                        try {
                            const token = await user.getIdTokenResult(false);
                            this.superAdmin = !!(token && token.claims && (token.claims.admin === true || token.claims.superAdmin === true));
                        } catch (e) {
                            this.superAdmin = false;
                        }
                        if (!this.superAdmin && String(this.currentRole || '').toUpperCase() === 'SUPER_ADMIN') {
                            this.superAdmin = true;
                        }

                        if (this.businessType === 'manufacturer') {
                            const reloadKey = 'digibiz_sidebar_mfg_reload_once';
                            if (cachedTypeBeforeLoad && cachedTypeBeforeLoad !== 'manufacturer' && sessionStorage.getItem(reloadKey) !== '1') {
                                sessionStorage.setItem(reloadKey, '1');
                                window.location.reload();
                                return;
                            }
                            sessionStorage.removeItem(reloadKey);
                        }

                        // Only re-render full sidebar if the business type actually changed, otherwise update in-place
                        if (previousType !== this.businessType) {
                            this.render();
                            this.attachEvents();
                        } else {
                            this.updateUserInfo();
        if (isCreditLedger) {
            const ob = document.getElementById('onboardingBanner');
            if (ob) ob.remove();
        }
                        }
                    } catch (e) {
                        console.warn('[Sidebar] Async background load failed:', e);
                    }
                })();

                // Non-critical tasks continue after first paint.
                Promise.resolve().then(() => this.maybeShowAppPromotionBanner(user)).catch(() => { });
                Promise.resolve().then(() => this.maybeShowUpdateAnnouncement(user)).catch(() => { });

                Promise.resolve(subscriptionReady).then(async () => {
                    this.subscriptionState = window.subscriptionManager
                        ? await window.subscriptionManager.initializeForUser(user, this.currentRole, this.businessId || user.uid)
                        : null;
                    if (this.subscriptionState && this.subscriptionState.plan) {
                        localStorage.setItem(`digibiz_user_plan_${user.uid}`, this.subscriptionState.plan);
                        if (this.businessId) {
                            localStorage.setItem(`digibiz_cached_plan_${this.businessId}`, this.subscriptionState.plan);
                        }
                    }
                    this.updateUserInfo();
                    this.checkOnboardingStatus(user);
                    this.triggerDailySurveyIfApplicable(user);
                }).catch(() => { });
            }
        });
    }

    async triggerDailySurveyIfApplicable(user) {
        try {
            if (!user) return;
            if (!window.DailySurvey) {
                await new Promise((resolve) => {
                    if (document.querySelector('script[src*="daily-survey.js"]')) return resolve();
                    const s = document.createElement('script');
                    s.src = '/admin/core/daily-survey.js';
                    s.charset = 'UTF-8';
                    s.setAttribute('charset', 'utf-8');
                    s.async = true;
                    s.onload = () => resolve();
                    s.onerror = () => resolve();
                    document.head.appendChild(s);
                });
            }
            if (window.DailySurvey && typeof window.DailySurvey.checkAndTrigger === 'function') {
                const plan = (this.subscriptionState && this.subscriptionState.plan) || this.cachedPlan || 'PRO';
                window.DailySurvey.checkAndTrigger(user, {
                    businessId: this.businessId,
                    businessName: this.businessName,
                    businessType: this.businessType,
                    role: this.currentRole,
                    plan: plan
                });
            }
        } catch (e) {
            console.warn('[Sidebar] Daily survey check warning:', e);
        }
    }

    injectOnboardingStyles() {
        if (document.getElementById('onboardingStyles')) return;
        const style = document.createElement('style');
        style.id = 'onboardingStyles';
        style.textContent = `
            #onboardingBanner {
                background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
                color: #f8fafc;
                padding: 12px 24px;
                font-family: 'Inter', sans-serif;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: sticky;
                top: 0;
                z-index: 9999;
                box-shadow: 0 4px 10px rgba(0,0,0,0.15);
                border-bottom: 2px solid #10b981;
            }
            #onboardingBanner .progress-wrap {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            #onboardingBanner .progress-bar-bg {
                background: #475569;
                border-radius: 8px;
                width: 150px;
                height: 8px;
                overflow: hidden;
            }
            #onboardingBanner .progress-bar-fill {
                background: #10b981;
                height: 100%;
                width: 20%;
                transition: width 0.3s ease;
            }
            #onboardingBanner .btn-setup {
                background: #10b981;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                font-weight: 700;
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            }
            #onboardingBanner .btn-setup:hover {
                background: #059669;
            }
        `;
        document.head.appendChild(style);
    }

        async checkOnboardingStatus(user) {
        if (!user) return;
        const bizType = this.normalizeBusinessType(localStorage.getItem('currentBusinessType') || this.businessType || '');
        if (bizType === 'credit_ledger' || this.businessType === 'credit_ledger' || window.location.pathname.includes('/madawalateashop/') || window.location.pathname.includes('/credit/')) {
            const ob = document.getElementById('onboardingBanner');
            if (ob) ob.remove();
            return;
        }
        const isRetail = (bizType === 'retail' || window.location.pathname.includes('/retail/')) && bizType !== 'quick_billing';
        if (!isRetail) return;

        try {
            const opt = navigator.onLine ? {} : { source: 'cache' };
            const bizDoc = await db.collection('businesses').doc(this.businessId || user.uid).get(opt);
            if (bizDoc.exists) {
                const bData = bizDoc.data() || {};
                if (bData.distributionModel) {
                    localStorage.setItem('digibiz_dist_model', bData.distributionModel);
                    localStorage.setItem('distributionModel', bData.distributionModel);
                }
            }
            if (!bizDoc.exists) return;
            const bizData = bizDoc.data();
            
            // Check if user registered after July 10, 2026
            let isNewUser = false;
            if (bizData.createdAt) {
                const createdDate = bizData.createdAt.toDate ? bizData.createdAt.toDate() : new Date(bizData.createdAt);
                if (createdDate >= new Date('2026-07-10')) {
                    isNewUser = true;
                }
            }

            // Show setup to anyone who has not completed onboarding and is registered after July 10, 2026
            if (bizData.onboardingCompleted !== true && isNewUser) {
                this.injectOnboardingStyles();
                this.showOnboardingBanner(user, bizData);
            }
        } catch (e) {
            console.error('[Onboarding] Error checking status:', e);
        }
    }

    showOnboardingBanner(user, bizData) {
        if (document.getElementById('onboardingBanner')) return;
        
        const completed = bizData.onboardingStepsCompleted || {};
        let completedCount = 0;
        if (completed.cash) completedCount++;
        if (completed.bank) completedCount++;
        if (completed.receivables) completedCount++;
        if (completed.payables) completedCount++;
        const pct = Math.round((completedCount / 4) * 100);
        
        const lang = localStorage.getItem('preferredLanguage') || 'en';
        const bannerText = lang === 'si' ? "à·€à·Šâ€" : "Shop Initial Setup:";
        const btnText = lang === 'si' ? "à·ƒà·" : "Setup Menu â†’";
        
        const banner = document.createElement('div');
        banner.id = 'onboardingBanner';
        banner.innerHTML = `
            <div class="progress-wrap">
                <span style="font-weight:700; font-size:14px; letter-spacing:0.02em;">📦 ${bannerText}</span>
                <div class="progress-bar-bg"><div class="progress-bar-fill" id="bannerProgressFill" style="width: ${pct}%;"></div></div>
                <span style="font-size:12px; font-weight:700; color:#10b981;" id="bannerProgressPct">${pct}%</span>
            </div>
            <button class="btn-setup" onclick="window.sidebar.openOnboardingWizard()">${btnText}</button>
        `;
        
        document.body.prepend(banner);
    }

    openOnboardingWizard(user = null) {
        if (!user) user = firebase.auth().currentUser;
        const businessId = this.businessId || (user ? user.uid : localStorage.getItem('currentBusinessId'));
        let modal = document.getElementById('onboardingWizardModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'onboardingWizardModal';
            modal.className = 'modal';
            modal.style.cssText = "display:none; position:fixed; inset:0; background:rgba(15,23,42,0.6); z-index:100000; align-items:center; justify-content:center; padding:16px; backdrop-filter:blur(4px);";
            
            modal.innerHTML = `
                <div class="modal-content" style="background:white; border-radius:24px; padding:30px; width:100%; max-width:480px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
                    <h3 id="wizardTitle" style="font-family:'Outfit', sans-serif; font-size:20px; font-weight:800; color:#0f3b2c; margin-bottom:12px;">Initial Shop Setup</h3>
                    
                    <div style="background:#f1f5f9; border-radius:10px; height:6px; overflow:hidden; margin-bottom:20px; position:relative;">
                        <div id="wizardProgressFill" style="background:#10b981; height:100%; width:0%; transition:width 0.3s;"></div>
                    </div>
                    
                    <div id="wizardStepContent" style="margin-bottom:24px; font-size:14px; color:#334155; line-height:1.6; min-height:150px;"></div>
                    
                    <div class="modal-buttons" style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;" id="wizardButtonsArea">
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        modal.style.display = 'flex';
        
        let wizardState = {
            onboardingBalances: { cash: 0, bank: 0, receivables: 0, payables: 0 },
            onboardingStepsCompleted: { cash: false, bank: false, receivables: false, payables: false }
        };
        
        const lang = localStorage.getItem('preferredLanguage') || 'en';
        
        const loadStateAndRender = async () => {
            try {
                const opt = navigator.onLine ? {} : { source: 'cache' };
                const doc = await db.collection('businesses').doc(businessId).get(opt);
                if (doc.exists) {
                    const data = doc.data();
                    wizardState.onboardingBalances = data.onboardingBalances || { cash: 0, bank: 0, receivables: 0, payables: 0 };
                    wizardState.onboardingStepsCompleted = data.onboardingStepsCompleted || { cash: false, bank: false, receivables: false, payables: false };
                }
            } catch (e) {
                console.error(e);
            }
            renderMenu();
        };

        const renderMenu = () => {
            const titleH = document.getElementById('wizardTitle');
            const contentDiv = document.getElementById('wizardStepContent');
            const progressFill = document.getElementById('wizardProgressFill');
            const buttonsArea = document.getElementById('wizardButtonsArea');
            
            titleH.textContent = "Initial Business Setup";
            
            const completed = wizardState.onboardingStepsCompleted || {};
            let completedCount = 0;
            if (completed.cash) completedCount++;
            if (completed.bank) completedCount++;
            if (completed.receivables) completedCount++;
            if (completed.payables) completedCount++;
            
            const pct = Math.round((completedCount / 4) * 100);
            progressFill.style.width = `${pct}%`;
            
            const bannerFill = document.getElementById('bannerProgressFill');
            const bannerPct = document.getElementById('bannerProgressPct');
            if (bannerFill) bannerFill.style.width = `${pct}%`;
            if (bannerPct) bannerPct.style.width = `${pct}%`;
            
            const formatLkr = (val) => 'Rs. ' + Number(val).toLocaleString('en-LK', { minimumFractionDigits: 2 });
            
            const getStatusBadge = (isDone, val) => {
                if (isDone) {
                    return `<span style="background:#d1fae5; color:#059669; font-weight:700; font-size:11px; padding:2px 8px; border-radius:30px;">✓ ${formatLkr(val)}</span>`;
                } else {
                    return `<span style="background:#f1f5f9; color:#64748b; font-weight:700; font-size:11px; padding:2px 8px; border-radius:30px;">Pending</span>`;
                }
            };

            contentDiv.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                        <div>
                            <strong style="display:block;">Cash in Hand</strong>
                            ${getStatusBadge(completed.cash, wizardState.onboardingBalances.cash)}
                        </div>
                        <button class="btn-setup" style="padding:6px 12px; font-size:12px;" onclick="window.sidebar.enterSetupStep('cash')">Setup</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                        <div>
                            <strong style="display:block;">Bank Balance</strong>
                            ${getStatusBadge(completed.bank, wizardState.onboardingBalances.bank)}
                        </div>
                        <button class="btn-setup" style="padding:6px 12px; font-size:12px;" onclick="window.sidebar.enterSetupStep('bank')">Setup</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                        <div>
                            <strong style="display:block;">Receivables (Customer Credit)</strong>
                            ${getStatusBadge(completed.receivables, wizardState.onboardingBalances.receivables)}
                        </div>
                        <button class="btn-setup" style="padding:6px 12px; font-size:12px;" onclick="window.sidebar.enterSetupStep('receivables')">Setup</button>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px;">
                        <div>
                            <strong style="display:block;">Payables (Supplier Debts)</strong>
                            ${getStatusBadge(completed.payables, wizardState.onboardingBalances.payables)}
                        </div>
                        <button class="btn-setup" style="padding:6px 12px; font-size:12px;" onclick="window.sidebar.enterSetupStep('payables')">Setup</button>
                    </div>
                </div>
            `;

            buttonsArea.innerHTML = `
                <button class="btn-cancel" onclick="window.sidebar.closeOnboardingWizard()" style="padding:10px 20px; border-radius:10px; cursor:pointer;">Close</button>
                <button class="btn-setup" onclick="window.sidebar.completeOnboardingSetup()" style="padding:10px 20px; border-radius:10px; cursor:pointer;">Complete Setup</button>
            `;
        };

        window.sidebar.enterSetupStep = (stepKey) => {
            const titleH = document.getElementById('wizardTitle');
            const contentDiv = document.getElementById('wizardStepContent');
            const buttonsArea = document.getElementById('wizardButtonsArea');
            
            let label = '';
            let desc = '';
            if (stepKey === 'cash') {
                label = "Cash in Hand";
                desc = "Enter the initial cash amount in your drawer or hand:";
            } else if (stepKey === 'bank') {
                label = "Bank Balance";
                desc = "Enter your business bank account balance:";
            } else if (stepKey === 'receivables') {
                label = "Receivables Balance";
                desc = "Enter individual outstanding balances others owe you (or leave empty & save):";
            } else if (stepKey === 'payables') {
                label = "Payables Balance";
                desc = "Enter individual outstanding debts you owe (or leave empty & save):";
            }
            
            titleH.textContent = label;
            
            if (stepKey === 'cash' || stepKey === 'bank') {
                contentDiv.innerHTML = `
                    <p style="margin-bottom:12px;">${desc}</p>
                    <label style="display:block; font-size:12px; font-weight:700; color:#64748b; margin-bottom:6px;">LKR Amount</label>
                    <input type="number" id="wizardInputVal" value="${wizardState.onboardingBalances[stepKey] || 0}" style="width:100%; padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:16px; font-weight:700;" min="0">
                `;
            } else {
                this.wizardTempRows = [{ name: '', amount: '' }];
                const btnLabel = stepKey === 'receivables' ? "+ Add Customer" : "+ Add Supplier";
                
                contentDiv.innerHTML = `
                    <p style="margin-bottom:12px;">${desc}</p>
                    <div style="max-height: 200px; overflow-y: auto; margin-bottom: 12px; border: 1px solid #cbd5e1; border-radius: 8px; padding: 5px; background: #f8fafc;">
                        <table style="width:100%; border-collapse:collapse; font-size:13px;">
                            <thead>
                                <tr style="border-bottom:1px solid #cbd5e1; text-align:left; color:#64748b; font-weight:700;">
                                    <th style="padding:6px 4px;">Name</th>
                                    <th style="padding:6px 4px; text-align:right;">Amount (Rs.)</th>
                                    <th style="padding:6px 4px; text-align:center;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="wizardTableRows">
                            </tbody>
                        </table>
                    </div>
                    <button type="button" onclick="window.sidebar.addWizardTableRow()" style="background:#0f3b2c; color:white; border:none; padding:8px 14px; border-radius:8px; font-weight:700; font-size:12px; cursor:pointer;">
                        ${btnLabel}
                    </button>
                `;
                
                window.sidebar.addWizardTableRow = () => {
                    this.wizardTempRows.push({ name: '', amount: '' });
                    this.renderWizardTableRows();
                };
                window.sidebar.removeWizardTableRow = (idx) => {
                    this.wizardTempRows.splice(idx, 1);
                    this.renderWizardTableRows();
                };
                window.sidebar.updateWizardRow = (idx, key, val) => {
                    this.wizardTempRows[idx][key] = val;
                };
                
                this.renderWizardTableRows = () => {
                    const body = document.getElementById('wizardTableRows');
                    if (!body) return;
                    if (this.wizardTempRows.length === 0) {
                        body.innerHTML = '<tr><td colspan="3" style="text-align:center; padding:15px; color:#94a3b8;">No rows added yet.</td></tr>';
                        return;
                    }
                    body.innerHTML = this.wizardTempRows.map((row, idx) => `
                        <tr>
                            <td style="padding:4px;"><input type="text" value="${row.name}" oninput="window.sidebar.updateWizardRow(${idx}, 'name', this.value)" style="width:100%; padding:6px 8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px;" placeholder="Name"></td>
                            <td style="padding:4px;"><input type="number" value="${row.amount}" oninput="window.sidebar.updateWizardRow(${idx}, 'amount', this.value)" style="width:100%; padding:6px 8px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; text-align:right;" placeholder="0.00" min="0"></td>
                            <td style="padding:4px; text-align:center;"><button type="button" onclick="window.sidebar.removeWizardTableRow(${idx})" style="background:#fee2e2; color:#ef4444; border:none; padding:4px 8px; border-radius:6px; font-size:11px; cursor:pointer; font-weight:700;">X</button></td>
                        </tr>
                    `).join('');
                };

                this.renderWizardTableRows();
            }

            buttonsArea.innerHTML = `
                <button class="btn-cancel" onclick="window.sidebar.returnToWizardMenu()" style="padding:10px 20px; border-radius:10px; cursor:pointer;">Back</button>
                <button class="btn-setup" id="saveStepBtn" onclick="window.sidebar.saveSetupStepValue('${stepKey}')" style="padding:10px 20px; border-radius:10px; cursor:pointer;">Save Balance</button>
            `;
        };
        
        window.sidebar.returnToWizardMenu = () => {
            renderMenu();
        };
        
        window.sidebar.saveSetupStepValue = async (stepKey) => {
            const btn = document.getElementById('saveStepBtn');
            btn.disabled = true;
            btn.textContent = lang === 'si' ? "à·ƒà·”" : "Saving...";
            
            try {
                let val = 0;
                let rows = [];
                
                if (stepKey === 'cash' || stepKey === 'bank') {
                    const input = document.getElementById('wizardInputVal');
                    val = Math.max(0, parseFloat(input.value) || 0);
                } else {
                    rows = (this.wizardTempRows || []).filter(r => r.name.trim() !== '' && parseFloat(r.amount) > 0);
                    val = rows.reduce((sum, r) => sum + parseFloat(r.amount), 0);
                }
                
                const updatePayload = {};
                updatePayload[`onboardingBalances.${stepKey}`] = val;
                updatePayload[`onboardingStepsCompleted.${stepKey}`] = true;
                
                await db.collection('businesses').doc(businessId).update(updatePayload);
                
                // Clear existing onboarding entries for this step
                const entriesRef = db.collection('journal').doc(businessId).collection('entries');
                const snap = await entriesRef.where('refType', '==', 'ONBOARDING').get();
                const batch = db.batch();
                snap.forEach(doc => {
                    const ref = doc.data().ref || '';
                    if (ref === `onboarding_${stepKey}` || ref.startsWith(`onboarding_${stepKey}_`)) {
                        batch.delete(doc.ref);
                    }
                });
                await batch.commit();
                
                if (stepKey === 'cash' || stepKey === 'bank') {
                    if (val > 0) {
                        let journalEntries = [];
                        if (stepKey === 'cash') {
                            journalEntries = [
                                { accountId: '1-1010-01', amount: val, type: 'debit' },
                                { accountId: '3-3010-01', amount: val, type: 'credit' }
                            ];
                        } else {
                            journalEntries = [
                                { accountId: '1-1020-01', amount: val, type: 'debit' },
                                { accountId: '3-3010-01', amount: val, type: 'credit' }
                            ];
                        }
                        
                        const journalDoc = {
                            date: new Date(),
                            memo: `Opening Balance Initialization - ${stepKey.toUpperCase()}`,
                            entries: journalEntries,
                            ref: `onboarding_${stepKey}`,
                            refType: 'ONBOARDING',
                            businessId: businessId,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        };
                        await entriesRef.add(journalDoc);
                    }
                } else if (stepKey === 'receivables') {
                    // Loop debtors and save
                    for (const r of rows) {
                        const amt = parseFloat(r.amount);
                        const custRef = await db.collection('customers').add({
                            businessId: businessId,
                            fullName: r.name.trim(),
                            mobile: '0700000000',
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        
                        const journalDoc = {
                            date: new Date(),
                            memo: `Opening Balance Customer - ${r.name.trim()}`,
                            entries: [
                                { accountId: '1-1030-01', amount: amt, type: 'debit' },
                                { accountId: '3-3010-01', amount: amt, type: 'credit' }
                            ],
                            ref: `onboarding_receivables_${custRef.id}`,
                            refType: 'ONBOARDING',
                            businessId: businessId,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        };
                        await entriesRef.add(journalDoc);
                    }
                } else if (stepKey === 'payables') {
                    // Loop creditors and save
                    for (const r of rows) {
                        const amt = parseFloat(r.amount);
                        const supplierRef = db.collection('suppliers').doc(businessId).collection('list').doc();
                        await supplierRef.set({
                            id: supplierRef.id,
                            name: r.name.trim(),
                            mobile: '0700000000',
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                        
                        const journalDoc = {
                            date: new Date(),
                            memo: `Opening Balance Supplier - ${r.name.trim()}`,
                            entries: [
                                { accountId: '3-3010-01', amount: amt, type: 'debit' },
                                { accountId: '2-2010-01', amount: amt, type: 'credit' }
                            ],
                            ref: `onboarding_payables_${supplierRef.id}`,
                            refType: 'ONBOARDING',
                            businessId: businessId,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        };
                        await entriesRef.add(journalDoc);
                    }
                }
                
                wizardState.onboardingBalances[stepKey] = val;
                wizardState.onboardingStepsCompleted[stepKey] = true;
                
                const noticeMsg = lang === 'si' ? "ශේෂය සාර්ථකව සුරකින ලදී!" : "Balance saved successfully!";
                alert(noticeMsg);
                
                renderMenu();
            } catch (err) {
                console.error(err);
                alert('Error saving step: ' + err.message);
                btn.disabled = false;
                btn.textContent = lang === 'si' ? "සුරකින්න" : "Save Balance";
            }
        };
        
        window.sidebar.closeOnboardingWizard = () => {
            const modal = document.getElementById('onboardingWizardModal');
            if (modal) modal.style.display = 'none';
        };
        
        window.sidebar.completeOnboardingSetup = async () => {
            const btn = document.querySelector('button[onclick="window.sidebar.completeOnboardingSetup()"]');
            btn.disabled = true;
            btn.textContent = lang === 'si' ? "" : "Completing...";
            
            try {
                await db.collection('businesses').doc(businessId).update({
                    onboardingCompleted: true
                });
                
                modal.style.display = 'none';
                const banner = document.getElementById('onboardingBanner');
                if (banner) banner.remove();
                
                alert(lang === 'si' ? "" : "Onboarding setup completed successfully!");
                window.location.reload();
            } catch (err) {
                console.error(err);
                alert('Error completing setup: ' + err.message);
                btn.disabled = false;
                btn.textContent = lang === 'si' ? "à·ƒà·" : "Finish Setup";
            }
        };

        loadStateAndRender();
    }

    parseVersion(v) {
        return String(v || '0').split('.').map((x) => Number(x) || 0);
    }

    isVersionNewer(current, seen) {
        const a = this.parseVersion(current);
        const b = this.parseVersion(seen);
        const len = Math.max(a.length, b.length);
        for (let i = 0; i < len; i += 1) {
            const x = a[i] || 0;
            const y = b[i] || 0;
            if (x > y) return true;
            if (x < y) return false;
        }
        return false;
    }

    showNewFeatureAnnouncement(user) {
        if (!user) return;

        const roleNorm = String(this.currentRole || '').toUpperCase();
        const isOwner = this.isSuperAdminUser() || roleNorm === 'DISTRIBUTOR_OWNER' || roleNorm === 'BUSINESS_OWNER';

        // ONLY show these announcements to Owners/Admins
        if (!isOwner) return;

        const menus = this.getMenus();
        let hasNewFeatures = menus.some(m => m.isNew);

        if (!hasNewFeatures) {
            const isDistributor = this.businessType === 'distributor' || this.isMwTradingContext();
            if (isDistributor) {
                hasNewFeatures = true;
            }
        }

        if (!hasNewFeatures) return;

        const countKey = `new_feature_announce_count_${user.uid}`;
        const hideKey = `new_feature_announce_hide_${user.uid}`;

        if (localStorage.getItem(hideKey) === 'true') return;

        let count = parseInt(localStorage.getItem(countKey) || '0');
        if (count >= 50) return;

        if (window.location.pathname.includes('sidebar-config.html') || window.location.pathname.includes('permissions-config.html')) return;

        const modalId = 'newFeatureAnnouncementModal';
        if (document.getElementById(modalId)) return;

        const overlay = document.createElement('div');
        overlay.id = modalId;
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex; align-items: center;
            justify-content: center; z-index: 10005; backdrop-filter: blur(4px); padding: 20px;
        `;

        const content = document.createElement('div');
        content.style.cssText = `
            background: #fff; padding: 30px; border-radius: 20px; max-width: 450px;
            width: 100%; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);
            animation: fadeInScale 0.3s ease-out;
        `;

        content.innerHTML = `
            <div style="font-size: 50px; margin-bottom: 15px;">🔄</div>
            <h2 style="color: #0f172a; margin-bottom: 15px; font-size: 20px; font-weight: 800;">"color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
                ඔබගේ à·€à·Šâ€"NEW"</b> "display: flex; flex-direction: column; gap: 10px;">
                <button id="goConfigBtn" style="background: #2563eb; color: #fff; border: none; padding: 12px; border-radius: 10px; font-weight: 700; cursor: pointer;">à·ƒà·"hideAnnounceBtn" style="background: #f1f5f9; color: #475569; border: none; padding: 10px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer;">"closeAnnounceBtn" style="background: transparent; color: #94a3b8; border: none; font-size: 13px; cursor: pointer; margin-top: 5px;">"display:flex;justify-content:space-between;align-items:center;gap:8px;">
                <b>${DIGIBIZ_UPDATE_TITLE}</b>
                <span style="font-size:11px;color:#475569;">v${DIGIBIZ_UPDATE_VERSION}</span>
            </div>
            <ul style="margin:8px 0 0 18px;padding:0;font-size:13px;line-height:1.4;">
                ${DIGIBIZ_UPDATE_POINTS.map((p) => `<li>${p}</li>`).join('')}
            </ul>
            <div style="margin-top:10px;text-align:right;">
                <button id="digibizUpdateOkBtn" style="background:#2563eb;color:#fff;border:none;border-radius:8px;padding:7px 12px;cursor:pointer;">Got it</button>
            </div>
        `;
        document.body.appendChild(banner);
        const markSeen = async () => {
            localStorage.setItem(lsKey, DIGIBIZ_UPDATE_VERSION);
            try {
                await db.collection('users').doc(user.uid).set({
                    lastSeenUpdateVersion: DIGIBIZ_UPDATE_VERSION,
                    lastSeenUpdateAt: new Date()
                }, { merge: true });
            } catch (e) { /* ignore */ }
            banner.remove();
        };
        const okBtn = document.getElementById('digibizUpdateOkBtn');
        if (okBtn) okBtn.addEventListener('click', markSeen);
    }

    async loadUserData(userId) {
        const storedType = this.getStoredBusinessType();
        try {
            this.currentUserId = userId;
            const db = window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
            if (!db) return;
            const opt = navigator.onLine ? {} : { source: 'cache' };
            const userDoc = await db.collection('users').doc(userId).get(opt);
            const userData = userDoc.exists ? (userDoc.data() || {}) : {};
        if (!firebase.auth().currentUser) {
            await new Promise(resolve => {
                const unsubscribe = firebase.auth().onAuthStateChanged(user => {
                    unsubscribe();
                    resolve(user);
                });
                setTimeout(() => { unsubscribe(); resolve(null); }, 5000); // 5s safety timeout
            });
        }
        
        const user = firebase.auth().currentUser;
        const userEmail = String(user && user.email || '').toLowerCase();
        console.log('[Sidebar Debug] Resolved Email:', userEmail);
        if (window.syncClientVersionLockWithFirestore && user) {
            window.syncClientVersionLockWithFirestore(user);
        }

        const isStaging = typeof window !== 'undefined' && window.location && typeof window.location.hostname === 'string' && window.location.hostname.includes('digibiz-test');
        const currentBid = localStorage.getItem('currentBusinessId');
        const isSirimal = (userId === 'oDhSDYHQ2dV1DP33koysmZAqaY13' || 
                           userEmail === 'biz.sirimal@gmail.com' ||
                           userEmail === '2biz.sirimal@gmail.com' ||
                           (isStaging && (currentBid === 'STAGING_TEST_SCRAP_BIZ' || currentBid === '8KlnS39HmqYwtcNzM0NZMkq6om63')));
        const isImpersonating = localStorage.getItem('digibiz_impersonate_active') === 'true';

        // Check Global Staff Registry (Takes priority for invited staff members)
        let staffRegistryData = null;
        if (userEmail && !isImpersonating && !isSirimal) {
            try {
                const opt = navigator.onLine ? {} : { source: 'cache' };
                const regDoc = await db.collection('staff_registry').doc(userEmail).get(opt);
                if (regDoc.exists && regDoc.data().businessId) {
                    staffRegistryData = regDoc.data();
                    console.log('[Sidebar] Resolved staff member from registry:', userEmail, staffRegistryData);
                }
            } catch (eReg) { console.warn('[Sidebar StaffRegistry Warn]', eReg); }
        }

        if (staffRegistryData) {
            this.businessId = staffRegistryData.businessId;
            this.currentRole = String(staffRegistryData.role || userData.role || 'CASHIER').toUpperCase();
            this.businessNavRole = this.currentRole;
            this.currentUserEmail = userEmail;
            this.ownerName = userData.name || userData.ownerName || staffRegistryData.name || userEmail;
            try {
                localStorage.setItem('currentBusinessId', this.businessId);
                sessionStorage.setItem('currentBusinessId', this.businessId);
                localStorage.setItem('currentUserRole', this.currentRole);
                sessionStorage.setItem('currentUserRole', this.currentRole);
                localStorage.setItem('currentBusinessNavRole', this.currentRole);
                sessionStorage.setItem('currentBusinessNavRole', this.currentRole);
            } catch (e) {}
        } else {
            const isTireContext = window.location.pathname.includes('/tire_centre/');
        const isTestSandboxUser = userEmail.includes('.test@') || window.location.pathname.includes('/sandbox/');
        const dedicatedClient = (window.DigibizClientMap && typeof window.DigibizClientMap.resolveDedicatedClient === 'function')
            ? window.DigibizClientMap.resolveDedicatedClient(firebase.auth().currentUser)
            : null;

        if (isTestSandboxUser) {
            this.currentRole = 'BUSINESS_OWNER';
            this.businessNavRole = 'BUSINESS_OWNER';
            this.businessType = isTireContext ? 'tire_centre' : (this.businessType || 'tire_centre');
            this.businessName = isTireContext ? 'SATHI TYRE & AUTO CARE CENTRE' : (this.businessName || 'SANDBOX BUSINESS');
        } else if (dedicatedClient && !isSirimal && !isImpersonating && !staffRegistryData) {
            this.currentRole = 'BUSINESS_OWNER';
            this.businessNavRole = 'BUSINESS_OWNER';
            this.businessId = dedicatedClient.businessId || this.businessId;
            this.businessType = dedicatedClient.businessType || this.businessType;
            this.businessName = dedicatedClient.businessName || this.businessName;
            this.ownerName = dedicatedClient.ownerName || this.ownerName;
            try {
                localStorage.setItem('currentBusinessId', this.businessId);
                sessionStorage.setItem('currentBusinessId', this.businessId);
                localStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
                sessionStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
                localStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');
                sessionStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');
                localStorage.setItem('currentBusinessType', this.businessType);
                sessionStorage.setItem('currentBusinessType', this.businessType);
                localStorage.setItem('currentBusinessName', this.businessName);
                sessionStorage.setItem('currentBusinessName', this.businessName);
            } catch (e) {}
        } else {
            this.currentRole = isImpersonating ? 'BUSINESS_OWNER' : (isSirimal ? 'SUPER_ADMIN' : (userData.role || 'BUSINESS_OWNER'));
        }
            this.currentUserEmail = String((userData.email || (firebase.auth().currentUser && firebase.auth().currentUser.email) || '')).trim().toLowerCase();
            this.ownerName = this.ownerName || userData.ownerName || userData.name || '';
        }
        const mustChangePassword = userData.mustChangePassword === true;
        if (isImpersonating) {
            this.businessId = localStorage.getItem('digibiz_impersonate_biz_id') || localStorage.getItem('currentBusinessId');
            this.businessType = localStorage.getItem('digibiz_impersonate_type') || localStorage.getItem('currentBusinessType') || 'retail';
            this.currentUserEmail = localStorage.getItem('digibiz_impersonate_email') || this.currentUserEmail;
            this.ownerName = localStorage.getItem('digibiz_impersonate_owner_name') || this.ownerName || this.currentUserEmail;
        } else if (userEmail === 'biz.sirimal@gmail.com' || userEmail === '2biz.sirimal@gmail.com' || userEmail === 'scrap@chinthaka.com') {
            this.businessId = localStorage.getItem('currentBusinessId') || userId;
            this.businessType = localStorage.getItem('currentBusinessType') || 'retail';
        } else if (!staffRegistryData) {
            const cachedAuthUid = localStorage.getItem('digibiz_auth_uid') || sessionStorage.getItem('digibiz_auth_uid');
            if (cachedAuthUid && cachedAuthUid !== userId) {
                localStorage.removeItem('currentBusinessId');
                localStorage.removeItem('currentBusinessType');
                localStorage.removeItem('currentBusinessName');
                localStorage.removeItem('currentUserRole');
                sessionStorage.clear();
            }
            this.businessId = userData.businessId || (cachedAuthUid === userId ? localStorage.getItem('currentBusinessId') : null);
        }

        if (!this.businessId && window.dashboardCore && typeof window.dashboardCore.getContext === 'function' && firebase.auth().currentUser) {
            try {
                const ctx = await window.dashboardCore.getContext(firebase.auth().currentUser);
                this.businessId = ctx && ctx.businessId ? ctx.businessId : this.businessId;
            } catch (ctxErr) { /* ignore */ }
        }
        if (this.businessId && String(this.businessId).trim()) {
            const opt = navigator.onLine ? {} : { source: 'cache' };
            const businessDoc = await db.collection('businesses').doc(String(this.businessId).trim()).get(opt);
            if (businessDoc.exists) {
                const bData = businessDoc.data() || {};
                const isOwnerOfBiz = !staffRegistryData && ((bData.ownerId === userId) ||
                                     (bData.ownerEmail && String(bData.ownerEmail).toLowerCase() === userEmail) ||
                                     (String(this.businessId).trim() === userId));
                if (isOwnerOfBiz && !isSirimal && !isImpersonating) {
                    this.currentRole = 'BUSINESS_OWNER';
                    this.businessNavRole = 'BUSINESS_OWNER';
                    try {
                        localStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
                        sessionStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
                        localStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');
                        sessionStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');
                    } catch (e) {}
                }
                this.businessType = this.normalizeBusinessType(bData.businessType || bData.type || userData.businessType || userData.type || 'retail');
                console.log(`[Sidebar] Detected BusinessType: ${this.businessType} for BID: ${this.businessId}, Role: ${this.currentRole}`);
                this.sidebarConfig = bData.sidebarConfig || null;

                // RE-POPULATE SESSION CACHE WITH LATEST RBAC CONFIG FOR AUTH-ROLES
                console.log('[Sidebar RBAC] Checking for rbacConfig in business doc:', this.businessId);
                if (bData.rbacConfig) {
                    try {
                        const configStr = JSON.stringify(bData.rbacConfig);
                        sessionStorage.setItem(`digibiz_perms_v2_${this.businessId}`, configStr);
                        console.log('[Sidebar RBAC] Injected rbacConfig into session storage.');
                    } catch (e) { console.warn('[Sidebar RBAC] Could not populate rbac session cache', e); }
                } else {
                    console.warn('[Sidebar RBAC] No rbacConfig found in business document.');
                }
            } else {
                this.businessType = this.normalizeBusinessType(userData.businessType || 'retail');
                this.sidebarConfig = null;
            }
            const bDocData = businessDoc.exists ? (businessDoc.data() || {}) : {};
            this.businessName = bDocData.businessName || bDocData.name || bDocData.companyName || bDocData.title || localStorage.getItem('digibiz_impersonate_biz_name') || 'Client Business';
            if (isImpersonating && (this.businessName === 'Client Business' || this.businessName === 'My Business')) {
                const impEmail = localStorage.getItem('digibiz_impersonate_email') || '';
                if (impEmail) {
                    const clientHandle = impEmail.split('@')[0].toUpperCase();
                    this.businessName = `${clientHandle} BUSINESS`;
                }
            }
            try {
                if (this.businessName && this.businessName !== 'My Business') {
                    localStorage.setItem('currentBusinessName', this.businessName);
                    sessionStorage.setItem('currentBusinessName', this.businessName);
                }
            } catch (e) {}
            if (businessDoc.exists && bDocData.ownerName) this.ownerName = bDocData.ownerName;
            const logoFromDoc = businessDoc.exists ? String(bDocData.logoUrl || '').trim() : '';
            this.businessLogoUrl = logoFromDoc;
            try {
                if (logoFromDoc) {
                    localStorage.setItem('digibizBusinessLogoUrl', logoFromDoc);
                    sessionStorage.setItem('digibizBusinessLogoUrl', logoFromDoc);
                } else {
                    localStorage.removeItem('digibizBusinessLogoUrl');
                    sessionStorage.removeItem('digibizBusinessLogoUrl');
                }
            } catch (e) { /* ignore */ }
            if (businessDoc.exists) {
                localStorage.setItem('currentBusinessType', this.businessType);
                sessionStorage.setItem('currentBusinessType', this.businessType);
            }
            const isDistributorTenant = bDocData.businessType === 'distributor' || this.businessId === this.mwBusinessId || this.businessId === this.spranzaBusinessId;
            if (isDistributorTenant && this.businessType !== 'scrap_collection_center') {
                this.businessType = 'distributor';
                localStorage.setItem('currentBusinessType', 'distributor');
                sessionStorage.setItem('currentBusinessType', 'distributor');
            }
            } else {
                this.businessType = storedType || (this.shouldForceManufacturerMode() ? 'manufacturer' : 'retail');
                this.businessName = 'No Business Connected';
                this.businessLogoUrl = '';
                try {
                    localStorage.removeItem('digibizBusinessLogoUrl');
                    sessionStorage.removeItem('digibizBusinessLogoUrl');
                } catch (e) { /* ignore */ }
            }
            const p = String(window.location.pathname || '').toLowerCase();
            if (mustChangePassword && !p.includes('/modules/core/change-password.html') && !p.includes('/auth/login.html')) {
                try {
                    localStorage.setItem('forcePasswordChangeNotice', 'Please change your password before continuing');
                    sessionStorage.setItem('forcePasswordChangeNotice', 'Please change your password before continuing');
                } catch (e) { /* ignore */ }
                window.location.href = this.resolveSidebarLink('/modules/core/change-password.html');
                return;
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.currentRole = 'VIEWER';
            this.ownerName = '';
            this.businessType = storedType || (this.shouldForceManufacturerMode() ? 'manufacturer' : 'retail');
            this.businessName = 'No Business Connected';
            this.businessLogoUrl = '';
        }
        if (this.shouldForceManufacturerMode()) {
            this.businessType = 'manufacturer';
            localStorage.setItem('currentBusinessType', 'manufacturer');
            sessionStorage.setItem('currentBusinessType', 'manufacturer');
        }
        const emailCheck = String((typeof userData !== 'undefined' && userData && userData.email) || this.currentUserEmail || (this.currentUser && this.currentUser.email) || '').toLowerCase();
        if (emailCheck.includes('madawalateashop')) {
            this.currentRole = 'BUSINESS_OWNER';
            this.businessNavRole = 'BUSINESS_OWNER';
            this.businessType = 'credit_ledger';
            this.businessName = 'DARSHANA MADAWALA';
            this.ownerName = 'DARSHANA MADAWALA';
            try {
                localStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
                sessionStorage.setItem('currentUserRole', 'BUSINESS_OWNER');
                localStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');
                sessionStorage.setItem('currentBusinessNavRole', 'BUSINESS_OWNER');
                localStorage.setItem('currentBusinessType', 'credit_ledger');
                sessionStorage.setItem('currentBusinessType', 'credit_ledger');
                localStorage.setItem('currentBusinessName', 'DARSHANA MADAWALA');
                sessionStorage.setItem('currentBusinessName', 'DARSHANA MADAWALA');
            } catch(e) {}
        }
        this.businessNavRole = String(this.currentRole || '').toUpperCase();
        if (this.businessId && userId) {
            try {
                const opt = navigator.onLine ? {} : { source: 'cache' };
                const bizUser = await db.collection('businesses').doc(this.businessId).collection('users').doc(userId).get(opt);
                if (bizUser.exists && bizUser.data().role) {
                    this.businessNavRole = String(bizUser.data().role).toUpperCase();
                }
            } catch (e) {
                console.warn('Sidebar business role lookup failed:', e?.message || e);
            }
        }
        this.manufacturerDueAlert = null;
        this.smsLowBalanceAlert = null;
        if (this.businessId) {
            try {
                const opt = navigator.onLine ? {} : { source: 'cache' };
                const settingsDoc = await db.collection('settings').doc(this.businessId).get(opt);
                const smsWallet = settingsDoc.exists ? ((settingsDoc.data() || {}).smsWallet || {}) : {};
                const bal = digibizSmsEffectiveTotal(smsWallet);
                const threshold = Number(smsWallet.lowBalanceThreshold || 50);
                if (bal < threshold) {
                    this.smsLowBalanceAlert = { bal, threshold };
                }
            } catch (e) {
                console.warn('SMS wallet lookup failed:', e?.message || e);
            }
        }
        if (this.businessType === 'manufacturer' && this.businessId) {
            try {
                const [payables, receivables] = await Promise.all([
                    db.collection("businesses").doc(this.businessId).collection('manufacturer_raw_material_history')
                        .where('paymentStatus', 'in', ['PENDING', 'PENDING_CLEARANCE'])
                        .limit(40).get().catch(() => ({ docs: [] })),
                    db.collection("businesses").doc(this.businessId).collection('manufacturer_sales')
                        .where('paymentStatus', 'in', ['PENDING', 'PENDING_CLEARANCE'])
                        .limit(40).get().catch(() => ({ docs: [] }))
                ]);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const overdue = (payables.docs || []).concat(receivables.docs || []).reduce((n, doc) => {
                    const row = doc.data() || {};
                    const dueStr = row.dueDate || row.chequeClearanceDate;
                    if (!dueStr) return n;
                    const due = new Date(dueStr);
                    if (Number.isNaN(due.getTime())) return n;
                    due.setHours(0, 0, 0, 0);
                    return due < now ? n + 1 : n;
                }, 0);
                const pendingCount = (payables.size || 0) + (receivables.size || 0);
                if (pendingCount > 0) {
                    this.manufacturerDueAlert = {
                        pendingCount,
                        overdue
                    };
                    if (window.eventBus && typeof window.eventBus.publish === 'function') {
                        window.eventBus.publish('MANUFACTURER_DUE_ALERT', {
                            businessId: this.businessId,
                            pendingCount,
                            overdue
                        });
                    }
                }
            } catch (e) {
                console.warn('Manufacturer due alert check failed:', e?.message || e);
            }
        }

        // Cache resolved identity/context for instant sidebar paint on next page load.
        try {
            localStorage.setItem('currentUserRole', String(this.currentRole || 'VIEWER'));
            sessionStorage.setItem('currentUserRole', String(this.currentRole || 'VIEWER'));
            localStorage.setItem('currentBusinessNavRole', String(this.businessNavRole || this.currentRole || 'VIEWER'));
            sessionStorage.setItem('currentBusinessNavRole', String(this.businessNavRole || this.currentRole || 'VIEWER'));
            if (this.businessName) {
                localStorage.setItem('currentBusinessName', String(this.businessName));
                sessionStorage.setItem('currentBusinessName', String(this.businessName));
            }
            if (this.currentUserEmail) {
                localStorage.setItem('digibizSidebarUserEmail', this.currentUserEmail);
                sessionStorage.setItem('digibizSidebarUserEmail', this.currentUserEmail);
            }
        } catch (e) { /* ignore */ }
    }

    isAdminRole() {
        return ['SUPER_ADMIN', 'ADMIN'].includes(this.currentRole) || String(this.currentRole || '').includes('ADMIN');
    }

    isSuperAdminConsoleView() {
        const path = String(window.location.pathname || '').toLowerCase();
        return path.includes('/admin/') || 
               path.includes('super-dashboard') ||
               path.includes('business-management') ||
               path.includes('register-client') ||
               path.includes('vertical-sync') ||
               path.includes('developer-sandboxes') ||
               path.includes('client-version-control') ||
               path.includes('live-activity') ||
               path.includes('inactive-accounts');
    }

    isSuperAdminUser() {
        const u = (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) || (typeof window !== 'undefined' && window.auth && window.auth.currentUser);
        const em = String((u && u.email) || this.currentUserEmail || (typeof localStorage !== 'undefined' && (localStorage.getItem('digibizSidebarUserEmail') || localStorage.getItem('digibiz_impersonate_email'))) || '').toLowerCase().trim();
        const role = String(this.currentRole || (typeof localStorage !== 'undefined' && (localStorage.getItem('currentUserRole') || localStorage.getItem('currentBusinessNavRole'))) || '').toUpperCase();
        
        return this.superAdmin === true 
            || role === 'SUPER_ADMIN' 
            || role === 'ADMIN' 
            || em === 'biz.sirimal@gmail.com'
            || em === '2biz.sirimal@gmail.com'
            || em === 'scrap@chinthaka.com'
            || em.includes('superadmin');
    }

    isRepRole() {
        return String(this.currentRole || '').toUpperCase() === 'REP';
    }

    isMwTradingContext() {
        const bid = String(this.businessId || '').trim().toUpperCase();
        return bid === String(this.mwBusinessId || '').toUpperCase() || bid === String(this.spranzaBusinessId || '').toUpperCase();
    }

    isStrictMwTradingBusiness() {
        return this.businessType === 'distributor';
    }

    isPilotTenant(email, businessId) {
        return false;
    }

    isBdkAccountingTenant() {
        return false;
    }

    isKdkumbukaTenant() {
        return String(this.businessId || '') === this.kduTeaBusinessId;
    }

    isCommissionPilotEnabled() {
        const authEmail = (firebase.auth && firebase.auth.currentUser && firebase.auth.currentUser.email) || '';
        const fromStorage = localStorage.getItem('digibizMwSyncEmail') || sessionStorage.getItem('digibizMwSyncEmail') || '';
        const email = String(authEmail || fromStorage || '').trim().toLowerCase();
        const bid = String(this.businessId || localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId') || '').trim();
        const activeResult = !!(window.DigiBizDistributorLorryStock
            && window.DigiBizDistributorLorryStock.activeForSession(email, bid));
        const pilotByEmail = this.isPilotTenant(email, bid);
        console.log('isPilotTenant:', pilotByEmail);
        console.log('activeForSession result:', activeResult);
        const bidTenant = bid === this.mwBusinessId || bid === this.spranzaBusinessId;
        return pilotByEmail || activeResult || bidTenant;
    }

    isWarehouseDisabledForCurrentTenant() {
        const authEmail = (firebase.auth && firebase.auth.currentUser && firebase.auth.currentUser.email) || '';
        const fromStorage = localStorage.getItem('digibizMwSyncEmail') || sessionStorage.getItem('digibizMwSyncEmail') || '';
        const email = String(authEmail || fromStorage || '').trim().toLowerCase();
        const bid = String(this.businessId || localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId') || '').trim();
        return this.isPilotTenant(email, bid);
    }

    getDistributorPermissionProfile() {
        const P = window.DigibizDistributorPermissions;
        const roleRaw = this.businessNavRole || this.currentRole || '';
        const roleNorm = String(roleRaw).toUpperCase().replace(/\s+/g, '_');
        
        const isOwnerOrAdmin = !roleNorm || ['OWNER', 'BUSINESS_OWNER', 'DISTRIBUTOR_OWNER', 'SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BUSINESS_STAFF'].includes(roleNorm) || (roleNorm !== 'REP');

        if (isOwnerOrAdmin || !P) {
            return {
                canViewDashboard: true,
                canViewAccounting: true,
                canViewReportsFull: true,
                canViewFinancialsProfit: true,
                canInvoiceCreateEdit: true,
                canManageRepsWeb: true,
                canCustomerView: true,
                canOrderWorkflowApprove: true,
                canSalesView: true,
                canStockEdit: true,
                canProductView: true,
                canStockView: true,
                canDeliveriesManage: true,
                canChequesManage: true,
                canCreditAgingView: true,
                canSettingsChange: true,
                canRepCommissionView: true,
                canScrapBillCreate: true,
                canScrapRevenueView: true,
                canScrapExpensesManage: true,
                canScrapSellCreate: true,
                canScrapStockView: true,
                canScrapBuyingHistoryView: true,
                canScrapSellingHistoryView: true,
                canScrapAdvanceManage: true,
                canScrapLoansManage: true
            };
        }
        return P.permissionsForRole(roleRaw, this.businessId);
    }

    getDistributorWebMenuBase() {
        const base = [
            { icon: '📜', name: 'GRN', link: '/modules/distributor/web/grn.html' },
            { icon: '🛒', name: 'New sales order', link: '/modules/distributor/web/new-order.html' },
            { icon: '📜‘', name: 'All Orders', link: '/modules/distributor/web/index.html?tab=pending' },
            { icon: '📊', name: 'Product Sales History', link: '/modules/distributor/web/sales-history.html' },
            { icon: '📜', name: 'Invoices', link: '/modules/distributor/web/invoices.html' },
            { icon: '📦', name: 'Products', link: '/modules/distributor/web/products.html' },
            { icon: '✨Ž', name: 'Free issues log', link: '/modules/distributor/web/free-items.html' },
            { icon: '✨”„', name: 'Returns & Claims', link: '/modules/distributor/web/returns.html' },
            { icon: '✨­', name: 'Warehouse', link: '/modules/distributor/web/warehouse.html' },
            { icon: '🚚', name: 'Deliveries', link: '/modules/distributor/web/deliveries.html' },
            { icon: '✨ª', name: 'Shops', link: '/modules/distributor/web/my-shops.html' },
            { icon: '💰', name: 'Staff Salary', link: '/modules/distributor/web/staff-salary.html' },
            { icon: '📈', name: 'Revenue', link: '/modules/distributor/web/revenue.html' },
            { icon: '💰', name: 'Expenses', link: '/modules/distributor/web/expenses.html' },
            { icon: '💳', name: 'Finance', link: '/modules/distributor/web/finance-ledger.html' },
            { icon: '📜', name: 'Accounting', link: '/modules/distributor/web/accounting.html' },
            { icon: '📊', name: 'Distributor Reports', link: '/modules/distributor/web/reports.html' },
            { icon: '📖', name: 'User Manual', link: '/modules/distributor/web/user-manual.html' }
        ];
        if (this.isWarehouseDisabledForCurrentTenant()) {
            return base.filter((item) => item.link !== '/modules/distributor/web/warehouse.html');
        }
        if (this.isCommissionPilotEnabled()) {
            base.splice(base.length - 1, 0,
                { icon: '✨¦', name: 'Cheques', link: '/modules/distributor/web/cheques.html' },
                { icon: '📉', name: 'Credit Aging', link: '/modules/distributor/web/credit-aging.html' },
                { icon: '⚙️', name: 'Commission Config', link: '/modules/distributor/web/commission-config.html' },
                { icon: '💰', name: 'Rep Commission', link: '/modules/distributor/web/rep-commission-report.html' }
            );
        }
        return base;
    }

    
    filterDistributorMenusByModel(menuList) {
        const distModel = localStorage.getItem('digibiz_dist_model') || 
                          localStorage.getItem('distributionModel') || 
                          (this.businessData && this.businessData.distributionModel) || 
                          'DIRECT_MAIN';
        
        return (menuList || []).filter(m => {
            if (!m) return false;
            const link = String(m.link || '').toLowerCase();
            const id = String(m.id || '').toLowerCase();
            const name = String(m.name || '').toLowerCase();

            const isWarehouse = id === 'warehouse' || link.includes('warehouse.html') || name === 'warehouse';
            const isDeliveries = id === 'deliveries' || link.includes('deliveries.html') || name === 'deliveries';

            if (distModel === 'DIRECT_MAIN') {
                if (isWarehouse || isDeliveries) return false;
            } else if (distModel === 'BRANCH_LOCATIONS') {
                if (isDeliveries) return false;
            }
            return true;
        });
    }

    buildDistributorMenusForCurrentRole() {
        const perms = this.getDistributorPermissionProfile();

        // 1. Filter the comprehensive pool based on granular RBAC
        let menus = DISTRIBUTOR_MENU_POOL.filter(item => {
            const pid = item.permissionId;
            if (!pid) return true; // Public menus if any
            return !!perms[pid];
        });

        // 2. Filter crosscut menus (Accounting, Reports, etc.)
        let tail = this.getSharedCrosscutMenus().filter(m => {
            if (m.name === 'Accounting') return !!perms.canViewAccounting;
            if (m.name === 'Reports') return !!perms.canViewReportsFull;
            if (m.name === 'Finance') return !!perms.canViewFinancialsProfit;
            return true;
        });

        const assembled = this.assembleSidebarMenus(menus, tail);
        return this.filterDistributorMenusByModel(assembled);
    }

    isScrapMasterOwner() {
        return this.currentUserId === this.scrapOwnerUid;
    }

    isScrapSuiteContext() {
        const pathLower = String(window.location.pathname || '').toLowerCase();
        const isScrapPath = pathLower.includes('/scrap') || pathLower.includes('/admin/scrap');
        const isScrapType = this.businessType === 'scrap_collection_center' || isScrapPath;
        return isScrapType;
    }

        getDashboardMenu() {
        const bTypeNorm = String(this.businessType || localStorage.getItem("currentBusinessType") || "").toLowerCase();
        if (bTypeNorm === 'credit_ledger' || bTypeNorm === 'creditledger' || String(window.location.pathname || '').includes('/clients/madawalateashop/') || String(window.location.pathname || '').includes('/clients/digibizcredit/')) {
            return [{ icon: "📊", name: "Dashboard", link: "/clients/madawalateashop/modules/credit/dashboard.html" }];
        }
        const verticalPrefix = bTypeNorm === 'distributor' ? '/modules/distributor/web' : `/modules/${bTypeNorm}`;
        const dashboardLink = `${verticalPrefix}/dashboard.html`;
        return [{ icon: '📊', name: 'Dashboard', link: dashboardLink }];
    }





    /** Customers + Accounting + Reports — always last block after business-specific links. */
    getSharedCrosscutMenus() {
        const bTypeNorm = String(this.businessType || localStorage.getItem('currentBusinessType') || '').toLowerCase();
        const verticalPrefix = bTypeNorm === 'distributor' ? '/modules/distributor/web' : `/modules/${bTypeNorm}`;
        const customersLink = `${verticalPrefix}/customers.html`;
        const accountingLink = `${verticalPrefix}/accounting.html`;
        const reportsLink = `${verticalPrefix}/reports.html`;
        const ledgersLink = `${verticalPrefix}/ledgers.html`;
        const financeLink = `${verticalPrefix}/finance-ledger.html`;
        const loansLink = `${verticalPrefix}/loans.html`;
        const expensesLink = this.businessType === 'tire_centre' ? '/modules/tire_centre/expenses.html' : (this.businessType === 'bakery' ? '/modules/bakery/expenses.html' : (this.businessType === 'manufacturer' ? '/modules/manufacturer/expenses.html' : (this.businessType === 'coconut' ? '/modules/coconut/expenses.html' : '/modules/retail/expenses.html')));
        const revenueLink = this.businessType === 'tire_centre' ? '/modules/tire_centre/revenue.html' : (this.businessType === 'bakery' ? '/modules/bakery/sales.html' : (this.businessType === 'manufacturer' ? '/modules/manufacturer/sales.html' : (this.businessType === 'coconut' ? '/modules/coconut/sales.html' : '/modules/retail/revenue.html')));
        const workbenchLink = this.businessType === 'tire_centre' ? '/modules/tire_centre/workbench.html' : (this.businessType === 'bakery' ? '/modules/bakery/history.html' : (this.businessType === 'manufacturer' ? '/modules/manufacturer/history.html' : (this.businessType === 'coconut' ? '/modules/coconut/history.html' : '/modules/retail/workbench.html')));
        const isCoreBusinessWithFullSuite = this.businessType === 'retail' || this.businessType === 'tire_centre' || this.businessType === 'manufacturer' || this.businessType === 'bakery' || this.businessType === 'coconut';
        
        const menus = [
            { icon: '👥', name: 'Customers', link: customersLink },
            ...(isCoreBusinessWithFullSuite ? [
                { icon: '💰', name: 'Expenses', link: expensesLink },
                { icon: '📖', name: 'Ledger', link: ledgersLink },
                { icon: '💰', name: 'Revenue', link: revenueLink },
                { icon: '📋', name: 'Daily Transactions', link: workbenchLink }
            ] : []),
            ...(isCoreBusinessWithFullSuite ? [] : [{ icon: '💳', name: 'Finance', link: financeLink }]),
            { icon: '📜', name: 'Accounting', link: accountingLink },
            { icon: '📈', name: 'Reports', link: reportsLink }
        ];
        if (this.isSuperAdminUser()) {
            menus.splice(1, 0, { icon: '💰', name: 'Loans', link: loansLink });
        }
        return menus;
    }

    getSharedModuleMenus() {
        return [...this.getDashboardMenu(), ...this.getSharedCrosscutMenus()];
    }

    /**
     * Order: Dashboard â†’ coreMenus â†’ tail (default: Customers, Accounting, Reports).
     * Drops duplicates from core that match dashboard or any tail item (same name+link).
     */
    assembleSidebarMenus(coreMenus, tailMenus) {
        const tail = Array.isArray(tailMenus) && tailMenus.length ? tailMenus : this.getSharedCrosscutMenus();
        const dash = this.getDashboardMenu();
        const core = (coreMenus || []).filter((m) => {
            if (!m) return false;
            const nameNorm = String(m.name || '').trim().toLowerCase();
            if (nameNorm === 'dashboard') return false;
            return true;
        });
        const assembled = this.dedupeMenus([...dash, ...core, ...tail]);
        return this.filterMenusByRoleAndPermissions(assembled);
    }

    filterMenusByRoleAndPermissions(menuList) {
        if (!menuList || !menuList.length) return [];
        const isImpersonating = localStorage.getItem('digibiz_impersonate_active') === 'true';
        if (this.isSuperAdminUser() || isImpersonating) return menuList;

        const roleRaw = String(this.businessNavRole || this.currentRole || '').trim().toUpperCase().replace(/\s+/g, '_');
        
        // Only restricted staff roles are filtered. All other users (Owners, Admins, default views) see everything.
        const restrictedStaffRoles = ['CASHIER', 'STORE_KEEPER', 'STAFF', 'STAFF_CLERK', 'REP', 'MANAGER', 'ACCOUNTANT'];
        if (!restrictedStaffRoles.includes(roleRaw)) {
            return menuList;
        }

        // Get dynamic RBAC overrides if present in sessionStorage
        let roleOverrides = null;
        if (this.businessId) {
            try {
                const cached = sessionStorage.getItem(`digibiz_perms_v2_${this.businessId}`);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (parsed && typeof parsed === 'object') {
                        roleOverrides = parsed[roleRaw] || parsed[roleRaw.replace('BUSINESS_', '')] || null;
                    }
                }
            } catch (e) {}
        }

        return menuList.filter(item => {
            if (!item) return false;
            const name = String(item.name || '').toLowerCase();
            const link = String(item.link || '').toLowerCase();

            // User Manual is always visible to all
            if (name.includes('user manual') || link.includes('user-manual')) return true;

            // If dynamic Granular Permissions Matrix overrides are set for this role, honor them strictly:
            if (roleOverrides && typeof roleOverrides === 'object') {
                if (name === 'dashboard' || link.includes('dashboard.html')) {
                    return !!roleOverrides.canViewDashboard;
                }
                if (name.includes('point of sale') || name.includes('pos') || name.includes('billing terminal') || link.includes('pos.html') || link.includes('quick_billing/app.html')) {
                    return !!roleOverrides.canInvoiceCreateEdit;
                }
                if (name.includes('new sales order') || link.includes('new-order.html')) {
                    return !!roleOverrides.canInvoiceCreateEdit;
                }
                if (name.includes('sales history') || name.includes('bill history') || name.includes('today\'s sales') || link.includes('sales-history.html') || link.includes('sales.html') || link.includes('invoices.html')) {
                    return !!roleOverrides.canSalesView;
                }
                if (name.includes('customers') || name.includes('shops') || link.includes('customers.html') || link.includes('my-shops.html')) {
                    return !!roleOverrides.canCustomerView;
                }
                if (name.includes('stock') || name.includes('inventory') || link.includes('inventory.html') || link.includes('stock.html')) {
                    return !!roleOverrides.canStockView;
                }
                if (name.includes('spoil') || name.includes('damage') || name.includes('wastage') || link.includes('spoilage.html') || link.includes('wastage.html')) {
                    return !!roleOverrides.canStockEdit;
                }
                if (name.includes('purchases') || name.includes('grn') || name.includes('raw materials') || link.includes('grn.html') || link.includes('inbound.html') || link.includes('purchases.html')) {
                    return !!roleOverrides.canStockEdit;
                }
                if (name.includes('suppliers') || link.includes('suppliers.html')) {
                    return !!roleOverrides.canStockView;
                }
                if (name.includes('banking') || link.includes('banking.html')) {
                    return !!roleOverrides.canChequesManage;
                }
                if (name.includes('expenses') || link.includes('expenses.html')) {
                    return !!roleOverrides.canExpensesCreate;
                }
                if (name.includes('revenue') || link.includes('revenue.html')) {
                    return !!roleOverrides.canViewFinancialsProfit;
                }
                if (name.includes('ledger') || link.includes('ledgers.html') || link.includes('finance-ledger.html')) {
                    return !!roleOverrides.canViewAccounting;
                }
                if (name.includes('accounting') || link.includes('accounting.html')) {
                    return !!roleOverrides.canViewAccounting;
                }
                if (name.includes('reports') || link.includes('reports.html')) {
                    return !!roleOverrides.canViewReportsFull;
                }
                return false;
            }

            // Standard default fallback if no custom RBAC Matrix is saved yet:
            if (roleRaw === 'CASHIER' || roleRaw === 'STAFF' || roleRaw === 'STAFF_CLERK') {
                if (name.includes('point of sale') || name.includes('pos') || name.includes('billing terminal') || link.includes('pos.html') || link.includes('quick_billing/app.html')) return true;
                if (name.includes('sales history') || name.includes('bill history') || link.includes('sales-history.html') || link.includes('sales.html')) return true;
                if (name.includes('customers') || link.includes('customers.html')) return true;
                return false;
            }

            if (roleRaw === 'STORE_KEEPER') {
                if (name.includes('stock') || name.includes('inventory') || link.includes('inventory.html') || link.includes('stock.html')) return true;
                if (name.includes('spoil') || name.includes('damage') || name.includes('wastage') || link.includes('spoilage.html') || link.includes('wastage.html')) return true;
                if (name.includes('purchases') || name.includes('grn') || name.includes('raw materials') || link.includes('grn.html') || link.includes('inbound.html')) return true;
                if (name.includes('suppliers') || link.includes('suppliers.html')) return true;
                return false;
            }

            if (roleRaw === 'REP') {
                if (name.includes('new sales order') || name.includes('billing') || name.includes('point of sale') || link.includes('new-order.html') || link.includes('pos.html')) return true;
                if (name.includes('sales history') || name.includes('invoices') || link.includes('sales-history.html') || link.includes('invoices.html')) return true;
                if (name.includes('customers') || name.includes('shops') || link.includes('customers.html') || link.includes('my-shops.html')) return true;
                return false;
            }

            return false;
        });
    }

    /**
     * Keep only first occurrence of menu items.
     * Guaranteed single Dashboard and zero duplicate links/names.
     */
    dedupeMenus(menuItems) {
        const seenNames = new Set();
        const seenLinks = new Set();
        const out = [];
        (menuItems || []).forEach((m) => {
            if (!m || !m.link) return;
            const name = String(m.name || '').trim();
            const nameLower = name.toLowerCase();
            const link = String(m.link || '').trim();

            if (nameLower === 'dashboard') {
                if (seenNames.has('dashboard')) return;
                seenNames.add('dashboard');
            }

            let canonicalLink = link.split('#')[0].replace(/\/+/g, '');
            if (link.includes('?')) {
                const parts = link.split('?');
                const path = parts[0].replace(/\/+/g, '');
                const query = parts[1] || '';
                if (query.includes('view=')) {
                    const match = query.match(/view=([^&]+)/);
                    if (match) canonicalLink = `${path}?view=${match[1]}`;
                } else if (query.includes('tab=')) {
                    const match = query.match(/tab=([^&]+)/);
                    if (match) canonicalLink = `${path}?tab=${match[1]}`;
                } else {
                    canonicalLink = path;
                }
            }

            const k = `${name.toLowerCase()}|${canonicalLink}`;
            if (seenLinks.has(k) || (canonicalLink && seenLinks.has(canonicalLink))) return;
            if (canonicalLink) seenLinks.add(canonicalLink);
            seenLinks.add(k);

            out.push(m);
        });
        return out;
    }

        getMenus() {
        if (this.isSuperAdminConsoleView()) {
            return [
                { section: 'MAIN CONSOLE', icon: '👑', name: 'Super Dashboard', link: '/admin/super-dashboard.html' },
                { icon: '👥', name: 'User Management', link: '/admin/super-dashboard.html#users' },
                { icon: '➕', name: 'Register New Client', link: '/admin/register-client.html' },
                { icon: '✨¢', name: 'Business Management', link: '/admin/business-management.html' },
                { icon: '🏢', name: 'User-Biz Assignment', link: '/admin/super-dashboard.html#assignment' },
                
                
                { icon: '📦', name: 'Client Version Control', link: '/admin/client-version-control.html' },
                { section: 'MONITORING & SECURITY', icon: '⚡', name: 'Live System Activity', link: '/admin/live-activity.html' },
                { icon: 'â³', name: 'Inactive Accounts', link: '/admin/inactive-accounts.html' },
                { icon: '🛡️', name: 'Security & Audit Logs', link: '/admin/super-dashboard.html#security' },
                { section: 'SYSTEM TOOLS', icon: '⚙️', name: 'System Config & Dev Tools', link: '/admin/super-dashboard.html#system' },
                { icon: '✨ª', name: 'Client Application', link: '/modules/core/dashboard.html' }
            ];
        }

        const user = firebase.auth && firebase.auth.currentUser;
        const authEmail = (user && user.email) || '';
        const storedEmail = localStorage.getItem('digibizMwSyncEmail') || sessionStorage.getItem('digibizMwSyncEmail') || '';
        const emailNorm = String(authEmail || storedEmail || '').trim().toLowerCase();
        const pathLower = String(window.location.pathname || '').toLowerCase();
        const normalizedBusinessType = this.normalizeBusinessType(this.businessType || localStorage.getItem('currentBusinessType') || sessionStorage.getItem('currentBusinessType') || '');

                if (this.businessType === 'credit_ledger' || normalizedBusinessType === 'credit_ledger' || emailNorm.includes('darshana') || pathLower.includes('/credit/') || pathLower.includes('/madawalateashop/')) {
            return [
                { icon: "📊", name: "Dashboard", link: "/clients/madawalateashop/modules/credit/dashboard.html" },
                { icon: "📜", name: "Credit Ledger", link: "/clients/madawalateashop/modules/credit/credits.html" },
                { icon: "👥", name: "Customers", link: "/clients/madawalateashop/modules/credit/customers.html" },
                { icon: "✨›ï¸", name: "Banking & Cash", link: "/clients/madawalateashop/modules/credit/banking.html" },
                { icon: "📈", name: "Reports (à·€à·", link: "/clients/madawalateashop/modules/credit/reports.html" },
                { icon: "✨¢", name: "Business Profile", link: "/clients/madawalateashop/modules/credit/profile.html" },
                { icon: "★", name: "Subscription", link: "/clients/madawalateashop/modules/core/billing.html" },
                { icon: "🔑", name: "Change Password", link: "/clients/madawalateashop/modules/credit/change-password.html" },
                { icon: "📖", name: "User Manual", link: "/clients/madawalateashop/modules/credit/user-manual.html" }
            ];
        }


        

        const onBakeryModule = pathLower.includes('/modules/bakery/');
        const onManufacturerModule = pathLower.includes('/modules/manufacturer/');
        const onAutoCareModule = pathLower.includes('/modules/auto_care/');
        const onTireCentreModule = pathLower.includes('/modules/tire_centre/');
        const onPharmacyModule = pathLower.includes('/modules/pharmacy/');
        const onCoconutModule = pathLower.includes('/modules/coconut/');
        const onAttendanceModule = pathLower.includes('/modules/attendance_payroll/') || pathLower.includes('/modules/attendance/');
        const onQuickBillingModule = pathLower.includes('/modules/quick_billing/');
        const menuBusinessType = (normalizedBusinessType === 'quick_billing' || onQuickBillingModule)
            ? 'quick_billing'
            : (onBakeryModule
                ? 'bakery'
                : ((onManufacturerModule && normalizedBusinessType !== 'scrap_collection_center')
                    ? 'manufacturer'
                    : (onAutoCareModule ? 'auto_care' : (onTireCentreModule ? 'tire_centre' : (onPharmacyModule ? 'pharmacy' : (onCoconutModule ? 'coconut' : (onAttendanceModule ? 'attendance_payroll' : normalizedBusinessType)))))));

        if (this.isScrapSuiteContext()) {
            const verticalPrefix = '/modules/core';
            const scrapPool = [
                { id: 'scrap_bill', permissionId: 'canScrapBillCreate', icon: '📜', name: 'Bill', link: '/modules/admin/scrap-buying.html?v=102' },
                { id: 'scrap_leads', icon: '📜', name: 'DUST TO CASH', link: '/modules/admin/scrap-leads.html' },
                { id: 'scrap_revenue', permissionId: 'canScrapRevenueView', icon: '📈', name: 'Revenue', link: '/modules/admin/scrap-revenue.html' },
                { id: 'scrap_revenue_mgmt', permissionId: 'canScrapRevenueView', icon: '📊', name: 'Revenue Mgmt', link: '/modules/admin/scrap-revenue-management.html' },
                { id: 'scrap_expenses', permissionId: 'canScrapExpensesManage', icon: '📉', name: 'Expenses', link: '/modules/admin/scrap-expenses.html' },
                { id: 'scrap_banking', permissionId: 'canViewAccounting', icon: '✨›ï¸', name: 'Banking', link: '/modules/admin/scrap-banking.html' },
                { id: 'scrap_income', permissionId: 'canViewFinancialsProfit', icon: '💰', name: 'Income', link: '/modules/admin/scrap-income.html' },
                { id: 'scrap_sell', permissionId: 'canScrapSellCreate', icon: '💰', name: 'Sell', link: '/modules/admin/scrap-sell.html' },
                { id: 'mobile_sell', permissionId: 'canScrapSellCreate', icon: '📱', name: 'Mobile Sell', link: '/modules/admin/mobile-sell.html' },
                { id: 'scrap_sms', permissionId: 'canSettingsChange', icon: '📲', name: 'Scrap SMS', link: '/modules/admin/scrap-sms-settings.html' },
                { id: 'scrap_stock', permissionId: 'canScrapStockView', icon: '📦', name: 'Stock', link: '/modules/admin/scrap-workbench.html?view=STOCK' },
                { id: 'scrap_buy', permissionId: 'canScrapBuyingHistoryView', icon: '📋', name: 'Buying History', link: '/modules/admin/scrap-workbench.html?view=BUY' },
                { id: 'scrap_history', permissionId: 'canScrapSellingHistoryView', icon: '📜', name: 'Selling History', link: '/modules/admin/scrap-selling-history.html' },
                { id: 'scrap_advance', permissionId: 'canScrapAdvanceManage', icon: '✨¦', name: 'Advance', link: '/modules/admin/scrap-advance.html?v=102' },
                { id: 'scrap_vehicles', permissionId: 'canScrapStockView', icon: '🚗', name: 'Vehicles', link: '/modules/admin/scrap-vehicles.html' },
                { id: 'scrap_dailytr', permissionId: 'canScrapRevenueView', icon: '📋', name: 'Daily Transactions', link: '/modules/admin/scrap-workbench.html?view=DAILYTR' },
                { id: 'shared_customers', permissionId: 'canCustomerView', icon: '👥', name: 'Customers', link: '/modules/core/customers.html' },
                { id: 'shared_finance', permissionId: 'canViewFinancialsProfit', icon: '💳', name: 'Finance', link: '/modules/core/finance-ledger.html' },
                { id: 'shared_accounting', permissionId: 'canViewAccounting', icon: '📜', name: 'Accounting', link: '/modules/tire_centre/accounting.html' },
                { id: 'shared_reports', permissionId: 'canViewReportsFull', icon: '📈', name: 'Reports', link: '/modules/tire_centre/reports.html' },
                { id: 'shared_loans', permissionId: 'canScrapLoansManage', icon: '💰', name: 'Loans', link: '/modules/core/loans.html' }
            ];
            let finalMenus = [];
            if (this.sidebarConfig && Array.isArray(this.sidebarConfig)) {
                const configMap = new Map();
                this.sidebarConfig.forEach((item, index) => {
                    if (typeof item === 'string') configMap.set(item, { visible: true, order: index });
                    else if (item && item.id) configMap.set(item.id, { visible: item.visible !== false, order: index });
                });

                if (!configMap.has('scrap_revenue_mgmt') && configMap.has('scrap_revenue')) {
                    configMap.set('scrap_revenue_mgmt', { visible: true, order: configMap.get('scrap_revenue').order + 0.5 });
                }

                const perms = this.getDistributorPermissionProfile();
                const ordered = [];
                const newItems = [];
                scrapPool.forEach(m => {
                    // RBAC Hard Filter
                    if (m.permissionId && !perms[m.permissionId]) return;

                    if (configMap.has(m.id)) {
                        const cfg = configMap.get(m.id);
                        if (cfg.visible) ordered.push({ ...m, order: cfg.order });
                    } else {
                        newItems.push({ ...m, isNew: true, order: 999 });
                    }
                });
                ordered.sort((a, b) => a.order - b.order);
                finalMenus = [...ordered, ...newItems];
            } else {
                const perms = this.getDistributorPermissionProfile();
                finalMenus = scrapPool.filter(m => !m.permissionId || !!perms[m.permissionId]);
            }

            // FORCE RESTORATION OF CRITICAL SCRAP LINKS (Bypassing permission/config filters for urgency)
            const scrapForced = [
                { id: 'scrap_master', icon: '⚙️', name: 'Scrap Master', link: '/modules/admin/scrap-master.html' },
                { id: 'scrap_buy', icon: '📋', name: 'Buying History', link: '/modules/admin/scrap-workbench.html?view=BUY' },
                { id: 'scrap_history', icon: '📜', name: 'Selling History', link: '/modules/admin/scrap-selling-history.html' },
                { id: 'shared_loans', icon: '💰', name: 'Loans', link: '/modules/core/loans.html' }
            ];

            const scrapMenus = this.dedupeMenus([ ...this.getDashboardMenu(), ...finalMenus, ...scrapForced ]);
            
            // ABSOLUTE OVERRIDE FOR HIMESHI - EXPENSES & CASH COUNTING ONLY + REDIRECT
            const email = (firebase.auth && firebase.auth.currentUser && firebase.auth.currentUser.email) || '';
            if (String(email).trim().toLowerCase() === 'biz.himeshi@gmail.com') {
                const himeshiMenus = [
                    { id: 'scrap_expenses', icon: '💰', name: 'EXPENSES', link: '/modules/admin/scrap-expenses.html' },
                    { id: 'scrap_cash_counting', icon: '✨§', name: 'Cash Counting', link: '/modules/admin/cash-counting.html' }
                ];
                
                // If on dashboard or anywhere else (except allowed pages), force redirect to expenses
                const path = window.location.pathname;
                const allowedPaths = ['/modules/admin/scrap-expenses.html', '/modules/admin/cash-counting.html'];
                if (path.includes('dashboard.html') || path === '/' || path.includes('index.html')) {
                    setTimeout(() => {
                        window.location.href = this.resolveSidebarLink('/modules/admin/scrap-expenses.html');
                    }, 500);
                }
                return himeshiMenus;
            }

            if (this.isSuperAdminUser()) {
                scrapMenus.push(
                    { icon: '👑', name: 'Super Admin', link: '/admin/super-dashboard.html' },
                    { icon: '👥', name: 'User Management', link: '/admin/super-dashboard.html#tab-users' }
                );
            }
            return scrapMenus;
        }

        if (!onManufacturerModule && (this.isMwTradingContext() || normalizedBusinessType === 'distributor' || (typeof window !== 'undefined' && window.location && window.location.pathname.includes('/distributor/')))) {
            const pool = DISTRIBUTOR_MENU_POOL;
            const perms = this.getDistributorPermissionProfile();
            const isMobile = this.isMobileView();

            // Dynamic Distribution Model Rules:
            // Option 1: DIRECT_MAIN (Default) -> Hide Warehouse and Hide Deliveries
            // Option 2: BRANCH_LOCATIONS -> Show Warehouse, Hide Deliveries
            // Option 3: LORRY_DISTRIBUTION -> Show Both Warehouse and Deliveries
            const distModel = localStorage.getItem('digibiz_dist_model') || 
                              localStorage.getItem('distributionModel') || 
                              (this.businessData && this.businessData.distributionModel) || 
                              'DIRECT_MAIN';

            const availableMenus = pool.filter(m => {
                if (!isMobile && String(m.link || '').includes('/mobile/')) {
                    return false;
                }

                if (distModel === 'DIRECT_MAIN') {
                    if (m.id === 'warehouse' || String(m.link || '').includes('warehouse.html')) return false;
                    if (m.id === 'deliveries' || String(m.link || '').includes('deliveries.html')) return false;
                } else if (distModel === 'BRANCH_LOCATIONS') {
                    if (m.id === 'deliveries' || String(m.link || '').includes('deliveries.html')) return false;
                }

                if (m.permissionId) {
                    return !!perms[m.permissionId];
                }
                return true;
            });

            if (!availableMenus.some(m => String(m.link || '').includes('user-manual.html'))) {
                availableMenus.push({ icon: '📖', name: 'User Manual', link: '/modules/distributor/web/user-manual.html' });
            }

            return availableMenus;
        }

                const isCreditLedger = normalizedBusinessType === 'credit_ledger' || ['credit_ledger', 'creditledger', 'credit'].includes(String(menuBusinessType || '').toLowerCase()) || String(window.location.pathname || '').includes('/clients/madawalateashop/') || String(window.location.pathname || '').includes('/clients/digibizcredit/') || String(window.location.pathname || '').includes('/modules/credit/');
        if (isCreditLedger) {
            return [
                { icon: "📊", name: "Dashboard", link: "/clients/madawalateashop/modules/credit/dashboard.html" },
                { icon: "📜", name: "Credit Ledger", link: "/clients/madawalateashop/modules/credit/credits.html" },
                { icon: "👥", name: "Customers", link: "/clients/madawalateashop/modules/credit/customers.html" },
                { icon: "✨›ï¸", name: "Banking & Cash", link: "/clients/madawalateashop/modules/credit/banking.html" },
                { icon: "✨¢", name: "Business Profile", link: "/clients/madawalateashop/modules/credit/profile.html" },
                { icon: "★", name: "Subscription", link: "/modules/core/billing.html" },
                { icon: "🔑", name: "Change Password", link: "/clients/madawalateashop/modules/credit/change-password.html" },
                { icon: "📖", name: "User Manual", link: "/clients/madawalateashop/modules/credit/user-manual.html" }
            ];
        }

        const isQuickBilling = normalizedBusinessType === 'quick_billing' || ['quick_billing', 'easy_bill', 'quick_bill', 'billing'].includes(String(menuBusinessType || '').toLowerCase()) || onQuickBillingModule;
        if (isQuickBilling) {
            const dynamicConfig = window.BUSINESS_TYPES ? (window.BUSINESS_TYPES.quick_billing || window.BUSINESS_TYPES[menuBusinessType]) : null;
            if (dynamicConfig && dynamicConfig.menus) {
                return dynamicConfig.menus;
            }
            return [
                { icon: "📜", name: "Billing Terminal (", link: "/modules/quick_billing/app.html" },
                { icon: "💳", name: "Customer Credit (", link: "/modules/quick_billing/credit.html" },
                { icon: "📜", name: "Bill History & Summary", link: "/modules/quick_billing/app.html?view=history" },
                { icon: "📦", name: "Manage Products & Prices", link: "/modules/quick_billing/products.html" },
                { icon: "👥", name: "Customers Directory", link: "/modules/quick_billing/customers.html" },
                { icon: "★", name: "Billing & Subscription", link: "/modules/core/billing.html" },
                { icon: "✨¢", name: "Business Profile & Header", link: "/modules/company/profile.html" },
                { icon: "📖", name: "User Manual (", link: "/modules/quick_billing/user-manual.html" }
            ];
        }

        // 1. Try dynamic configuration from BUSINESS_TYPES
        const dynamicConfig = window.BUSINESS_TYPES ? window.BUSINESS_TYPES[menuBusinessType] : null;
        if (dynamicConfig && dynamicConfig.menus && this.businessId !== this.kduTeaBusinessId && menuBusinessType !== 'distributor') {
            let menus = dynamicConfig.menus;
            return this.assembleSidebarMenus(menus);
        }

        // 2. Fallback to legacy hardcoded logic for special tenants (like KUBUKA)
        let menus;
        if (menuBusinessType === 'pharmacy') {
            menus = [
                { icon: '🛒', name: 'Point of Sale', link: '/modules/pharmacy/pos.html' },
                { icon: '📦', name: 'Inventory', link: '/modules/pharmacy/inventory.html' },
                { icon: '⚠️', name: 'Expiry Alerts', link: '/modules/pharmacy/expiry.html' },
                { icon: '📥', name: 'Purchases', link: '/modules/pharmacy/purchases.html' }
            ];
        } else if (menuBusinessType === 'hardware') {
            menus = [
                { icon: '📜', name: 'POS / Quotation', link: '/modules/hardware/pos.html' },
                { icon: '📦', name: 'Inventory', link: '/modules/hardware/inventory.html' }
            ];
        } else if (menuBusinessType === 'manufacturer') {
            if (this.businessId === this.kduTeaBusinessId) {
                const roleNorm = String(this.businessNavRole || this.currentRole || '')
                    .trim()
                    .toUpperCase()
                    .replace(/\s+/g, '_');
                if (this.isKdkumbukaTenant() && roleNorm === 'TEA_LEAFER') {
                    menus = [{ icon: '🌿', name: 'Raw Materials', link: '/modules/manufacturer/inbound.html' }];
                } else if (this.isKdkumbukaTenant()) {
                    menus = [
                        { icon: '📊', name: 'Dashboard', link: '/modules/manufacturer/dashboard.html' },
                        { icon: '🌿', name: 'Raw Materials', link: '/modules/manufacturer/inbound.html' },
                        { icon: '📦', name: 'Inventory', link: '/modules/retail/inventory.html' },
                        { icon: '🛒', name: 'Point of Sale', link: '/modules/retail/pos.html' },
                        { icon: '📜', name: 'Sales History', link: '/modules/retail/sales-history.html' },
                        { icon: '📜', name: 'Expenses', link: '/modules/retail/expenses.html' },
                        { icon: '📜', name: 'Accounting Dashboard', link: '/modules/manufacturer/accounting.html' },
                        { icon: '👥', name: 'Customers', link: '/modules/manufacturer/customers.html' },
                        { icon: '💳', name: 'Finance', link: '/modules/manufacturer/finance-ledger.html' },
                        { icon: '📈', name: 'Reports', link: '/modules/manufacturer/reports.html' }
                    ];
                } else {
                    menus = [
                        { icon: '🌿', name: 'Raw Materials', link: '/modules/manufacturer/inbound.html' },
                        { icon: '✨­', name: 'Production / Manufacturing', link: '/modules/manufacturer/outbound.html' },
                        { icon: '📦', name: 'Finished Goods', link: '/modules/manufacturer/stock.html' },
                        { icon: '✨›ï¸', name: 'Sales', link: '/modules/manufacturer/sales.html' },
                        { icon: '📜', name: 'Expenses', link: '/modules/manufacturer/expenses.html' },
                        { icon: '📋', name: 'History', link: '/modules/manufacturer/history.html' }
                    ];
                }
            } else {
                menus = [
                    { icon: '🌿', name: 'Raw Materials', link: '/modules/manufacturer/inbound.html' },
                    { icon: '✨­', name: 'Production / Manufacturing', link: '/modules/manufacturer/outbound.html' },
                    { icon: '📦', name: 'Finished Goods', link: '/modules/manufacturer/stock.html' },
                    { icon: '🗑️', name: 'Wasted Goods Log', link: '/modules/manufacturer/wastage.html' },
                    { icon: '✨›ï¸', name: 'Sales', link: '/modules/manufacturer/sales.html' },
                    { icon: '🚚', name: 'Sales Route Plan', link: '/modules/manufacturer/route-plan.html' },
                    { icon: '📜', name: 'Expenses', link: '/modules/manufacturer/expenses.html' },
                    { icon: '📋', name: 'History', link: '/modules/manufacturer/history.html' }
                ];
            }
        } else {
            menus = [
                { icon: '🛒', name: 'Point of Sale', link: '/modules/retail/pos.html' },
                { icon: '📜', name: 'Sales History', link: '/modules/retail/sales-history.html' },
                { icon: '📦', name: 'Stock', link: '/modules/retail/inventory.html' },
                { icon: '⚠️', name: 'Spoil / Damage', link: '/modules/retail/spoilage.html' },
                { icon: '📥', name: 'Purchases / GRN', link: '/modules/retail/grn.html' },
                { icon: '🚚', name: 'Suppliers', link: '/modules/retail/suppliers.html' },
                { icon: '✨›ï¸', name: 'Banking & Cash', link: '/modules/retail/banking.html' }
            ];
        }
        const isKduManufacturer = menuBusinessType === 'manufacturer' && this.businessId === this.kduTeaBusinessId;
        if (isKduManufacturer) {
            const roleNorm = String(this.businessNavRole || this.currentRole || '')
                .trim()
                .toUpperCase()
                .replace(/\s+/g, '_');
            if (roleNorm !== 'TEA_LEAFER') {
                menus = this.dedupeMenus(menus);
            }
        } else {
            menus = this.assembleSidebarMenus(menus);
        }

        if (this.isSuperAdminUser()) {
            menus.push(
                { icon: '👑', name: 'Super Admin', link: '/admin/super-dashboard.html' },
                { icon: '👥', name: 'User Management', link: '/admin/super-dashboard.html#tab-users' }
            );
        }

        // Final KUBUKA hard guard: never show supplier menu entries.
        if (this.businessId === this.kduTeaBusinessId) {
            menus = (menus || []).filter((m) => {
                const text = String((m && (m.text || m.name)) || '').toLowerCase();
                const link = String((m && m.link) || '').toLowerCase();
                if (text.includes('supplier')) return false;
                if (link.includes('supplier')) return false;
                return true;
            });
        }
        return this.dedupeMenus(menus);
    }

    resolveSidebarLink(rawLink) {
        if (!rawLink || rawLink.startsWith('http') || rawLink.startsWith('#') || rawLink.startsWith('javascript:')) return rawLink;
        if (rawLink.startsWith('/admin/') || rawLink.startsWith('/modules/core/billing.html')) return rawLink; // Super Admin pages always stay universal
        const pathname = window.location.pathname;

        // Dedicated sandbox and client folder prefix handlers
        const sandboxMatch = pathname.match(/^\/sandbox\/([^\/]+)/i);
        if (sandboxMatch) {
            const currentVertical = sandboxMatch[1]; // e.g. 'tire_centre'
            let cleanLink = rawLink.startsWith('/') ? rawLink : '/' + rawLink;

            // Map generic legacy links to current vertical in sandbox
            if (cleanLink.includes('/reports/index.html') || cleanLink.endsWith('/reports.html')) {
                return `/sandbox/${currentVertical}/reports.html`;
            }
            if (cleanLink.includes('/accounts/advanced-accounting') || cleanLink.endsWith('/accounting.html')) {
                return `/sandbox/${currentVertical}/accounting.html`;
            }

            if (cleanLink.startsWith('/modules/')) {
                return cleanLink.replace('/modules/', '/sandbox/');
            }
            if (!cleanLink.startsWith('/sandbox/')) {
                return `/sandbox/${currentVertical}` + cleanLink;
            }
            return cleanLink;
        }

        const user = firebase.auth && firebase.auth.currentUser;
        const authEmail = (user && user.email) || '';
        const storedEmail = localStorage.getItem('digibizMwSyncEmail') || sessionStorage.getItem('digibizMwSyncEmail') || '';
        const emailNorm = String(authEmail || storedEmail || '').trim().toLowerCase();
        const isTestUser = emailNorm.includes('test@') || emailNorm.includes('demo') || emailNorm === 'test@test.com';

        // Dedicated client folder prefix handler ONLY for isolated client sessions
        const clientMatch = pathname.match(/^\/clients\/([^\/]+)/i);
        if (clientMatch && !isTestUser && !pathname.startsWith('/modules/')) {
            const prefix = `/clients/${clientMatch[1]}`;
            const cleanLink = rawLink.startsWith('/') ? rawLink : '/' + rawLink;
            if (!cleanLink.startsWith(prefix + '/')) {
                return prefix + cleanLink;
            }
            return cleanLink;
        }

        const match = pathname.match(/^\/(snapshots\/[^\/]+|v[0-9_]+|std|[a-z0-9_-]+)\/(modules|admin|core|css|scripts|icons|assets)\//);
        if (match) {
            const prefix = '/' + match[1];
            const cleanLink = rawLink.startsWith('/') ? rawLink : '/' + rawLink;
            if (!cleanLink.startsWith(prefix + '/')) {
                return prefix + cleanLink;
            }
        }
        return rawLink;
    }

    isMenuActive(link, pathname) {
        if (!link) return false;
        const currentPathname = pathname || (typeof window !== 'undefined' && window.location && window.location.pathname) || '';
        const currentHash = (typeof window !== 'undefined' && window.location && window.location.hash ? window.location.hash : '').replace(/^#/, '').replace(/^tab-/, '').trim().toLowerCase();

        const [linkNoHash, linkHashRaw = ''] = link.split('#');
        const [linkPathRaw, linkQueryRaw = ''] = linkNoHash.split('?');
        const linkHash = linkHashRaw.replace(/^tab-/, '').trim().toLowerCase();

        const stripSnapshotPrefix = (p) => {
            if (!p) return '';
            return p.replace(/^\/sandbox\/[^\/]+/i, '')
                    .replace(/^\/clients\/[^\/]+(?:\/modules)?\/[^\/]+/i, '')
                    .replace(/^\/clients\/[^\/]+/i, '')
                    .replace(/^\/modules\/[^\/]+/i, '')
                    .replace(/^\/(snapshots\/[^\/]+|v\d{4}_\d{2}_\d{2}|std|sunrose)(?=\/(modules|admin|core|company|auth|reports|accounts|css|scripts)\/)/i, '');
        };

        const normalizedPath = stripSnapshotPrefix(currentPathname);
        const normalizedLink = stripSnapshotPrefix(linkPathRaw || '');

        const cleanLink = normalizedLink.replace(/\/+/g, '/').toLowerCase();
        const cleanPath = normalizedPath.split('#')[0].split('?')[0].replace(/\/+/g, '/').toLowerCase();

        const currentParams = new URLSearchParams((typeof window !== 'undefined' && window.location && window.location.search) || '');
        const linkParams = linkQueryRaw ? new URLSearchParams(linkQueryRaw) : null;

        if (cleanPath === cleanLink) {
            // Check hash match
            if (linkHash) {
                return currentHash === linkHash;
            }
            if (currentHash && !linkHash) {
                return currentHash === 'dashboard' || currentHash === 'overview';
            }

            if (linkParams) {
                let allMatch = true;
                for (const [k, v] of linkParams.entries()) {
                    if (currentParams.get(k) !== v) {
                        allMatch = false;
                        break;
                    }
                }
                return allMatch;
            }
            // If the link has no view query param, but the current URL has a specific view param, do not highlight
            const currentView = currentParams.get('view');
            if (currentView) {
                return false;
            }
            return true;
        }

        let tab = '';
        try {
            tab = currentParams.get('tab') || '';
        } catch (e) {
            tab = '';
        }
        const distributorOrderStatusPath = '/modules/distributor/web/index.html';
        if (cleanLink === distributorOrderStatusPath) {
            if (cleanPath.endsWith(distributorOrderStatusPath)) return true;
            return false;
        }
        if (cleanLink.includes('pending-orders.html')) {
            if (cleanPath.endsWith('pending-orders.html')) return true;
            if (cleanPath.endsWith(distributorOrderStatusPath) && tab === 'pending') return true;
            return false;
        }
        if (cleanLink.includes('orders.html')) {
            if (cleanPath.endsWith('orders.html')) return true;
            if (cleanPath.endsWith(distributorOrderStatusPath) && ['approved', 'dispatched', 'rejected', 'delivered', 'all'].includes(tab)) {
                return true;
            }
            return false;
        }
        if (cleanLink.includes('/modules/distributor/web/new-order.html')) {
            return cleanPath.endsWith('new-order.html');
        }
        if (cleanLink.includes('/modules/admin/scrap-sms-settings.html')) {
            return cleanPath.endsWith('scrap-sms-settings.html');
        }
        if (cleanLink.endsWith('/index.html')) {
            const linkDir = cleanLink.replace(/\/index\.html$/, '');
            return cleanPath === linkDir;
        }
        if (cleanPath.endsWith(cleanLink)) return true;
        return cleanPath.startsWith(`${cleanLink}/`);
    }

    formatBusinessName(name) {
        return String(name || '').trim().toUpperCase();
    }

    renderBusinessName(name) {
        const businessNameUpper = this.formatBusinessName(name);
        const sidebarBizEl = document.getElementById('sidebarBusinessName');
        if (sidebarBizEl) {
            sidebarBizEl.textContent = businessNameUpper;
            sidebarBizEl.title = businessNameUpper;
        }
        const mobileBizEl = document.getElementById('digibizMobileBusinessName');
        if (mobileBizEl) {
            mobileBizEl.textContent = businessNameUpper;
            mobileBizEl.title = businessNameUpper;
        }
        this.renderBusinessLogo();
    }

    renderBusinessLogo() {
        const url = String(this.businessLogoUrl || '').trim();
        const img = document.getElementById('sidebarBusinessLogoImg');
        const icon = document.getElementById('sidebarBusinessLogoIcon');
        const mimg = document.getElementById('digibizMobileBusinessLogoImg');
        if (img) {
            if (url) {
                img.src = url;
                img.alt = 'Business logo';
                img.onerror = () => {
                    img.removeAttribute('src');
                    img.classList.remove('is-visible');
                    if (icon) icon.classList.add('is-visible');
                };
                img.classList.add('is-visible');
            } else {
                img.removeAttribute('src');
                img.alt = '';
                img.classList.remove('is-visible');
            }
        }
        if (icon) {
            if (url) icon.classList.remove('is-visible');
            else icon.classList.add('is-visible');
        }
        if (mimg) {
            if (url) {
                mimg.src = url;
                mimg.alt = 'Business logo';
                mimg.onerror = () => {
                    mimg.removeAttribute('src');
                    mimg.classList.remove('is-visible');
                };
                mimg.classList.add('is-visible');
            } else {
                mimg.removeAttribute('src');
                mimg.alt = '';
                mimg.classList.remove('is-visible');
            }
        }
    }

    async refreshBusinessNameFromProfile() {
        const isImpersonating = localStorage.getItem('digibiz_impersonate_active') === 'true';
        if (isImpersonating) {
            this.currentRole = 'BUSINESS_OWNER';
            this.businessNavRole = 'BUSINESS_OWNER';
            this.businessId = localStorage.getItem('digibiz_impersonate_biz_id') || localStorage.getItem('currentBusinessId') || this.businessId;
            this.businessType = localStorage.getItem('digibiz_impersonate_type') || localStorage.getItem('currentBusinessType') || 'retail';
            
            const impEmail = localStorage.getItem('digibiz_impersonate_email') || '';
            if (this.businessId) {
                try {
                    const bDoc = await window.db.collection('businesses').doc(this.businessId).get();
                    if (bDoc.exists) {
                        const bd = bDoc.data() || {};
                        this.businessName = bd.businessName || bd.name || bd.companyName || bd.title || localStorage.getItem('digibiz_impersonate_biz_name') || 'Client Business';
                        this.ownerName = bd.ownerName || bd.name || localStorage.getItem('digibiz_impersonate_owner_name') || impEmail;
                    }
                } catch (eB) {}
            }
            if (!this.businessName || this.businessName === 'Client Business' || this.businessName === 'My Business' || this.businessName === 'SANDBOX BUSINESS') {
                this.businessName = localStorage.getItem('digibiz_impersonate_biz_name') || (impEmail ? `${impEmail.split('@')[0].toUpperCase()} BUSINESS` : 'CLIENT BUSINESS');
            }
            this.renderBusinessName(this.businessName);
            const ownerEl = document.getElementById('sidebarUserName');
            if (ownerEl) ownerEl.textContent = this.ownerName || impEmail;
            const roleBadgeEl = document.getElementById('sidebarRoleBadge');
            if (roleBadgeEl) roleBadgeEl.textContent = 'BUSINESS OWNER';
            return;
        }

        const user = firebase.auth().currentUser;
        if (!user) return;
        try {
            const userEmail = String(user.email || '').toLowerCase();
            const isSirimal = (user.uid === 'oDhSDYHQ2dV1DP33koysmZAqaY13' || 
                               userEmail === 'biz.sirimal@gmail.com' ||
                               userEmail === '2biz.sirimal@gmail.com' ||
                               userEmail === 'scrap@chinthaka.com');
            const isImpersonating = localStorage.getItem('digibiz_impersonate_active') === 'true';

            const opt = navigator.onLine ? {} : { source: 'cache' };
            const userDoc = await window.db.collection('users').doc(user.uid).get(opt);
            const userData = userDoc.exists ? userDoc.data() : {};
            this.ownerName = String(userData.ownerName || userData.name || this.ownerName || '').trim();
            const resolvedBusinessId = userData.businessId || this.businessId || localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId') || user.uid;
            let resolvedName = '';

            if (resolvedBusinessId) {
                this.businessId = resolvedBusinessId;

                // Fetch Business Info & Permissions Bridge
                try {
                    const opt = navigator.onLine ? {} : { source: 'cache' };
                    const businessDoc = await window.db.collection('businesses').doc(resolvedBusinessId).get(opt);
                    if (businessDoc.exists) {
                        const bd = businessDoc.data() || {};
                        resolvedName = String(bd.name || bd.businessName || '').trim();

                        // Sync Permissions from Bridge with Version Tracking
                        const cachedVersion = sessionStorage.getItem(`digibiz_perm_v_${resolvedBusinessId}`);
                        const remoteVersion = String(bd.permVersion || '0');

                        if (bd.rbacConfig) {
                            if (cachedVersion !== remoteVersion) {
                                console.log('[Sidebar] Permission version changed, refreshing bridge...');
                                sessionStorage.setItem(`digibiz_perms_v2_${resolvedBusinessId}`, JSON.stringify(bd.rbacConfig));
                                sessionStorage.setItem(`digibiz_perm_v_${resolvedBusinessId}`, remoteVersion);
                                setTimeout(() => this.render(), 100);
                            }
                        } else {
                            if (cachedVersion !== remoteVersion || !sessionStorage.getItem(`digibiz_perms_v2_${resolvedBusinessId}`)) {
                                console.log('[Sidebar] Refreshing direct permissions...');
                                try {
                                    const opt = navigator.onLine ? {} : { source: 'cache' };
                                    const snap = await window.db.collection('businesses').doc(resolvedBusinessId).collection('configs').doc('permissions').get(opt);
                                    if (snap.exists) {
                                        sessionStorage.setItem(`digibiz_perms_v2_${resolvedBusinessId}`, JSON.stringify(snap.data()));
                                        sessionStorage.setItem(`digibiz_perm_v_${resolvedBusinessId}`, remoteVersion);
                                        setTimeout(() => this.render(), 100);
                                    }
                                } catch (eDirect) { /* ignore */ }
                            }
                        }

                        this.businessDocData = bd;
                        if (bd.ownerName) this.ownerName = String(bd.ownerName || '').trim();
                        const logo = String(bd.logoUrl || '').trim();
                        if (logo) {
                            this.businessLogoUrl = logo;
                            try { localStorage.setItem('digibizBusinessLogoUrl', logo); } catch (e) { }
                            try { sessionStorage.setItem('digibizBusinessLogoUrl', logo); } catch (e) { }
                        } else {
                            this.businessLogoUrl = '';
                            try { localStorage.removeItem('digibizBusinessLogoUrl'); } catch (e) { }
                            try { sessionStorage.removeItem('digibizBusinessLogoUrl'); } catch (e) { }
                        }
                        const bType = bd.businessType || bd.type || userData.businessType || userData.type;
                        if (bType) {
                            const norm = this.normalizeBusinessType(bType);
                            if (norm) {
                                this.businessType = norm;
                                try {
                                    localStorage.setItem('currentBusinessType', norm);
                                    sessionStorage.setItem('currentBusinessType', norm);
                                } catch (e) { }
                            }
                        }
                        this.updateUserInfo();
                    }
                } catch (eBiz) { console.warn('Sidebar biz lookup failed:', eBiz); }
            }

            if (!resolvedName) resolvedName = String(this.businessName || 'No Business Connected').trim();

            if (localStorage.getItem('digibiz_impersonate_active') === 'true') {
                if (!resolvedName || resolvedName === 'No Business Connected' || resolvedName === 'Client Business') {
                    const impBizName = localStorage.getItem('digibiz_impersonate_biz_name');
                    const impEmail = localStorage.getItem('digibiz_impersonate_email') || 'CLIENT';
                    const impOwner = localStorage.getItem('digibiz_impersonate_owner_name') || impEmail.split('@')[0].toUpperCase();
                    resolvedName = impBizName || (impOwner + ' BUSINESS');
                }
            }

            this.businessId = resolvedBusinessId;
            this.businessName = resolvedName;

            
        const clientMatch = window.location.pathname.match(/^\/clients\/([^\/]+)/i);
        const clientSlug = clientMatch ? clientMatch[1].toLowerCase() : '';
        if (!this.ownerName || this.ownerName.toUpperCase() === String(this.businessName || '').toUpperCase() || this.ownerName === 'USER') {
            if (clientSlug === 'spiholdings') this.ownerName = 'Nadun De Alwis';
            else if (clientSlug === 'sathityrecentre') this.ownerName = 'Sathi';
            else if (clientSlug === 'madawalateashop') this.ownerName = 'Darshana Madawala';
            else if (clientSlug === 'chisathifamilyproducts') this.ownerName = 'Shashintha';
            else if (clientSlug === 'sunroselanka') this.ownerName = 'Roshan';
            else if (clientSlug === 'royalarabian') this.ownerName = 'Asmin';
        }

        const ownerEl = document.getElementById('sidebarUserName');
        if (ownerEl) ownerEl.textContent = this.ownerName || 'Business Owner';

            this.renderBusinessName(resolvedName);
            this.renderBusinessLogo();
            const emailToCheck = this.userEmail || (typeof auth !== 'undefined' && auth.currentUser && auth.currentUser.email) || null;
            if (emailToCheck) {
                this.checkClientVersionLock(emailToCheck).catch(() => {});
            }
        } catch (error) {
            console.error('refreshBusinessNameFromProfile failed:', error);
        }
    }

    async checkClientVersionLock(email) {
        if (!email || typeof window.db === 'undefined') return;
        try {
            const docId = String(email).trim().toLowerCase().replace(/[^a-z0-9@]/g, '_');
            const snap = await window.db.collection('client_version_control').doc(docId).get();
            if (snap.exists) {
                const config = snap.data() || {};
                if (config.isLocked || config.lockStatus === 'LOCKED') {
                    window.__DIGIBIZ_VERSION_LOCK__ = config;
                    sessionStorage.setItem('digibiz_client_version_lock', JSON.stringify(config));
                }
            }
        } catch (e) {
            console.warn('[VersionControl] Lock check warn:', e);
        }
    }

    applyVersionSuppression() {
        if (!window.isClientVersionLocked || !window.isClientVersionLocked()) return;
    }

    render() {
        this.applyVersionSuppression();
        ensureSidebarStyles();
        const pathname = window.location.pathname;
        const bTypeNorm = String(this.businessType || localStorage.getItem('currentBusinessType') || sessionStorage.getItem('currentBusinessType') || '').toLowerCase();
        const isDistributorContext = bTypeNorm === 'distributor' || pathname.includes('/distributor/');

        const settingsItemsBase = isDistributorContext ? [
            { icon: '🏢', name: 'Business Profile', link: '/modules/distributor/web/profile.html' },
            { icon: '💳', name: 'Billing & Subscription', link: '/modules/core/billing.html' },
            { icon: '👥', name: 'Staff Management', link: '/modules/distributor/web/staff.html' },
            { icon: '⚙️', name: 'General Settings', link: '/modules/distributor/web/settings.html' },
            { icon: '🖨️', name: 'Print Settings', link: '/modules/distributor/web/print-settings.html' },
            { icon: '📲', name: 'SMS Settings', link: '/modules/distributor/web/sms-settings.html' },
            { icon: '📜', name: 'SMS Log', link: '/modules/distributor/web/sms-log.html' },
            { icon: '📋', name: 'Activity Log', link: '/modules/distributor/web/activity-log.html' },
            { icon: '🔔', name: 'Notifications', link: '/modules/distributor/web/notifications.html' }
        ] : [
            { icon: '🏢', name: 'Business Profile', link: '/modules/company/profile.html' },
            { icon: '🌐', name: 'Language Settings', link: '/modules/company/language.html', isNew: true },
            { icon: '👥', name: 'Staff Management', link: '/modules/company/staff.html' },
            { icon: '⚙️', name: 'Sidebar Config', link: '/modules/core/sidebar-config.html', isNew: true },
            { icon: '🔑', name: 'Change Password', link: '/modules/core/change-password.html' },
            { icon: '⚙️', name: 'General Settings', link: '/modules/company/settings.html' },
            { icon: '🖨️', name: 'Print Settings', link: '/modules/company/print-settings.html', isNew: true },
            { icon: '📲', name: 'SMS Settings', link: '/modules/company/sms-settings.html' },
            { icon: '📜', name: 'SMS Log', link: '/modules/company/sms-log.html' },
            { icon: '💳', name: 'Billing & Charges', link: '/modules/core/billing.html' },
            { icon: '📄', name: 'Document Settings', link: '/modules/core/document-settings.html' }
        ];
        const user = firebase.auth && firebase.auth.currentUser;
        const authEmail = (user && user.email) || '';
        const storedEmail = localStorage.getItem('digibizMwSyncEmail') || sessionStorage.getItem('digibizMwSyncEmail') || '';
        const emailNorm = String(authEmail || storedEmail || '').trim().toLowerCase();
        const isRasika = emailNorm === 'biz.himeshi@gmail.com' || (this.ownerName && this.ownerName.includes('Rasika'));

        let settingsItems = (this.isRepRole() || isRasika) ? [] : settingsItemsBase.slice();
        if (this.businessType === 'distributor' && window.DigibizDistributorPermissions && !this.isRepRole()) {
            const p = window.DigibizDistributorPermissions.permissionsForRole(this.businessNavRole || this.currentRole || '');
            const rb = p.roleBand;
            const smsLogOk = rb === 'OWNER' || rb === 'SALES_COORDINATOR' || rb === 'AREA_MANAGER';
            settingsItems = settingsItems.filter((item) => {
                if (item.name === 'Business Profile') return !!p.canBusinessInfoEdit;
                if (item.name === 'Staff' || item.name === 'Staff Management') return true;
                if (item.name === 'Staff Permissions') return rb === 'OWNER';
                if (item.name === 'Settings' || item.name === 'General Settings') return !!p.canSettingsChange;
                if (item.name === 'SMS Settings') return !!p.canSettingsChange;
                if (item.name === 'SMS Log') return smsLogOk;
                if (item.name === 'Billing & Charges') return !!p.canViewFinancialsProfit;
                return true;
            });
        }
        const settingsActive = settingsItems.some((item) => this.isMenuActive(item.link, pathname));
                const loanItems = [
            { icon: '🏦', name: 'Loan Hub', link: '/modules/core/loans.html' },
            { icon: '📅', name: 'Weekly Loan', link: '/modules/admin/scrap-weekly-loans.html' },
            { icon: '📆', name: 'Daily Loan', link: '/modules/core/loan-daily.html' },
            { icon: '🤝', name: 'Hand Loans', link: '/modules/core/hand-loans.html' },
            { icon: '🤲', name: 'No-interest Loan', link: '/modules/core/loan-no-interest.html' },
            { icon: '📈', name: 'Interest Loan (10%)', link: '/modules/core/loan-interest.html' },
            { icon: '💼', name: 'Advanced Loan', link: '/modules/core/loan-advanced-investor.html' },
            { icon: '👤', name: 'Investor', link: '/modules/core/investor.html' },
            { icon: '🛡️', name: 'Risk Management', link: '/modules/core/loan-risk-management.html' }
        ];
        const loansActive = loanItems.some((item) => this.isMenuActive(item.link, pathname));
        const financeActive = pathname.includes('receivables.html') || pathname.includes('payables.html') || pathname.includes('credit-aging.html');
        const bTypeCurrent = this.normalizeBusinessType(this.businessType || localStorage.getItem('currentBusinessType') || sessionStorage.getItem('currentBusinessType') || '');
        const isCreditLedger = bTypeCurrent === 'credit_ledger' || this.businessType === 'credit_ledger' || String(pathname || '').includes('/madawalateashop/') || String(pathname || '').includes('/credit/');
        const isQuickBilling = bTypeCurrent === 'quick_billing' || String(pathname || '').includes('/quick_billing/') || isCreditLedger;
        const isFullSuiteBiz = (bTypeNorm === 'retail' || bTypeNorm === 'tire_centre' || bTypeNorm === 'manufacturer' || window.location.pathname.includes('/tire_centre/')) && !isQuickBilling;
        const roleNorm = String(this.businessNavRole || this.currentRole || '').trim().toUpperCase().replace(/\s+/g, '_');
        const restrictedRoles = ['CASHIER', 'STORE_KEEPER', 'STAFF', 'STAFF_CLERK', 'REP'];
        const isOwnerOrSuper = !restrictedRoles.includes(roleNorm);
        const canViewFinance = isOwnerOrSuper || ['ACCOUNTANT', 'MANAGER'].includes(roleNorm);
        const canViewSettings = isOwnerOrSuper;
        const isSuperAdminConsole = this.isSuperAdminConsoleView();
        let rawMenus = isSuperAdminConsole ? this.getMenus() : this.getMenus().filter((item) => !['Super Admin', 'User Management', 'Loans'].includes(item.name));
        const menuItems = isDistributorContext ? this.filterDistributorMenusByModel(rawMenus) : rawMenus;

        const html = `
            <div class="retail-navbar digibiz-sidebar">
                <div>
                    <div id="sidebarTrialBanner" style="display:none;" class="trial-sidebar-banner">TRIAL MODE ACTIVE</div>
                    <div class="sidebar-header" style="position: relative;">
                        <div class="logo">DIGIBIZ<span>™</span></div>
                        <div class="sidebar-business-logo-wrap">
                            <img id="sidebarBusinessLogoImg" class="sidebar-business-logo-img" alt="" decoding="async" />
                            <span id="sidebarBusinessLogoIcon" class="sidebar-business-logo-icon is-visible" aria-hidden="true"><i class="fa-solid fa-store" style="font-size:28px; color:#ffd966;"></i></span>
                        </div>
                        <div class="sidebar-business-name biz-name" id="sidebarBusinessName"></div>
                        <div class="user-info-sidebar" style="display:flex !important; flex-direction:column !important; align-items:center !important; text-align:center !important; background:linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%) !important; padding:12px 10px 24px 10px !important; border-radius:12px !important; border:1px solid rgba(255,255,255,0.08) !important; position:relative !important; overflow:hidden !important; width:100% !important; box-sizing:border-box !important; margin-top:8px;">
                            <div style="width:100%; text-align:center; box-sizing:border-box;">
                                <div class="user-name-sidebar" id="sidebarUserName" style="font-size:14px; font-weight:700; color:#fff; margin-bottom:4px; text-align:center;">Loading...</div>
                                <div class="user-role-sidebar" id="sidebarUserRole" style="font-size:8.5px; padding:3px 10px; border-radius:20px; background:rgba(0,0,0,.35); display:inline-block; white-space:nowrap; max-width:100%; overflow:hidden; text-overflow:ellipsis; letter-spacing:0.2px; box-sizing:border-box;">USER</div>
                                <div class="sidebar-subscription-status" id="sidebarSubscriptionStatus" style="color: #a7f3d0; font-weight: 700;">★ PRO</div>
                            </div>
                            <div id="sidebarConnectionStatus" style="position:absolute !important; bottom:6px !important; left:0 !important; right:0 !important; text-align:center !important; font-size:9.5px !important; font-weight:800 !important; letter-spacing:0.6px !important; text-transform:uppercase !important; display:block !important; visibility:visible !important;">Checking connection...</div>
                        </div>
                    </div>
                    <div class="nav-links" id="sidebarNavLinks">
                        ${(!isSuperAdminConsole && (['retail', 'tire_centre'].includes(String(this.businessType || '').toLowerCase()) || window.location.pathname.includes('/tire_centre/') || window.location.pathname.includes('/retail/'))) ? `
                            <div class="sidebar-metrics-strip" style="display:flex !important; justify-content:space-between !important; align-items:center !important; padding:4px 14px 6px 14px !important; margin:0 8px 6px 8px !important; border-bottom:1px solid rgba(255,255,255,0.08) !important; box-sizing:border-box !important; gap:8px !important;">
                                <span id="sidebarLiveCashBadge" style="font-size:11px !important; font-weight:800 !important; padding:3px 10px !important; border-radius:6px !important; background:rgba(59,130,246,0.25) !important; color:#93c5fd !important; white-space:nowrap !important; display:inline-block !important;">Rs. 0</span>
                                <span id="sidebarRetailRevenueBadge" style="font-size:11px !important; font-weight:800 !important; padding:3px 10px !important; border-radius:6px !important; background:rgba(16,185,129,0.25) !important; color:#6ee7b7 !important; white-space:nowrap !important; display:inline-block !important;">Sales: +Rs. 0</span>
                            </div>
                        ` : ''}
                        ${menuItems.map((item) => {
                            const isDashboard = String(item.name).toLowerCase() === 'dashboard' || String(item.link).toLowerCase().includes('dashboard.html');
                            const isExpenses = item.name === 'EXPENSES';
                            const isScrapPage = window.location.pathname.includes('/scrap-');
                            const showScrapBadge = !isSuperAdminConsole && isDashboard && (this.businessType === 'scrap_collection_center' || isScrapPage);
                            const bTypeCurrent = String(this.businessType || localStorage.getItem('currentBusinessType') || sessionStorage.getItem('currentBusinessType') || '').toLowerCase().trim();
                            const showRetailRevenueBadge = !isSuperAdminConsole && isDashboard && (['retail', 'tire_centre'].includes(bTypeCurrent) || window.location.pathname.includes('/tire_centre/') || window.location.pathname.includes('/retail/'));
                            const showDistributorRevenueBadge = !isSuperAdminConsole && isDashboard && (bTypeCurrent === 'distributor' || window.location.pathname.includes('/distributor/'));
                            const resolvedItemLink = this.resolveSidebarLink(item.link);
                            
                            let html = '';
                            if (item.section) {
                                html += `<div class="menu-section-label" style="padding: 12px 24px 4px 24px; font-size: 9.5px; font-weight: 800; letter-spacing: 0.8px; color: #94a3b8; text-transform: uppercase;">${item.section}</div>`;
                            }
                            html += `
                            <a href="${resolvedItemLink}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive(item.link, pathname) ? 'active' : ''}" style="position: relative;">
                                <span class="menu-icon">${item.icon}</span>
                                <span>${window.i18n(item.name)}</span>
                                ${item.isNew ? '<span class="menu-badge-new">NEW</span>' : ''}
                                ${showScrapBadge ? '<span id="sidebarScrapPoolBadge" style="position: absolute; right: 10px; top: -15px; font-size: 10px; font-weight: 900; color: #34d399; display: none;"></span>' : ''}
                                
                                ${showDistributorRevenueBadge ? `
                                    <span id="sidebarDistributorProfitBadge" style="position: absolute; right: 10px; top: -15px; font-size: 10px; font-weight: 900; display: none; padding: 2px 6px; border-radius: 4px;"></span>
                                ` : ''}
                            </a>
                            `;

                            if (item.name === 'Customers' && isFullSuiteBiz && canViewFinance) {
                                const bTypeModule = (bTypeNorm === 'manufacturer' || (!bTypeNorm && !window.location.pathname.includes('/tire_centre/'))) ? 'retail' : (window.location.pathname.includes('/tire_centre/') ? 'tire_centre' : bTypeNorm);
                                const agingLink = this.resolveSidebarLink(`/modules/${bTypeModule}/credit-aging.html`);
                                const receivablesLink = this.resolveSidebarLink(`/modules/${bTypeModule}/receivables.html`);
                                const payablesLink = this.resolveSidebarLink(`/modules/${bTypeModule}/payables.html`);
                                html += `
                                <div class="menu-dropdown ${financeActive ? 'open' : ''}" id="financeDropdown">
                                    <button type="button" class="menu-dropdown-toggle ${financeActive ? 'active' : ''}" id="financeDropdownToggle">
                                        <span style="display: flex; align-items: center; gap: 14px;"><span class="menu-icon">💳</span><span>${window.i18n('Finance')}</span></span><span>${financeActive ? '▾' : '▸'}</span>
                                    </button>
                                    <div class="menu-dropdown-items">
                                        <a href="${receivablesLink}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive(receivablesLink, pathname) ? 'active' : ''}"><span class="menu-icon">📈</span><span>Receivables</span></a>
                                        <a href="${payablesLink}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive(payablesLink, pathname) ? 'active' : ''}"><span class="menu-icon">📉</span><span>Payables</span></a>
                                        <a href="${agingLink}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive(agingLink, pathname) ? 'active' : ''}"><span class="menu-icon">â³</span><span>Credit Aging</span></a>
                                    </div>
                                </div>
                                `;
                            }
                            
                            if (isExpenses && isRasika) {
                                html += `<div id="sidebarScrapPoolLabel" style="font-size: 16px; font-weight: 900; color: #34d399; padding: 15px 15px 30px 15px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05); margin-bottom: 10px;">Checking pool...</div>`;
                            }
                            
                            return html;
                        }).join('')}
                        ${(!isQuickBilling && !isSuperAdminConsole && this.businessType === 'scrap_collection_center') ? `<div class="menu-dropdown ${loansActive ? 'open' : ''}" id="loansDropdown">
                            <button type="button" class="menu-dropdown-toggle ${loansActive ? 'active' : ''}" id="loansDropdownToggle">
                                <span style="display: flex; align-items: center; gap: 14px;"><span class="menu-icon">💰</span><span>Loans</span></span><span>${loansActive ? '▾' : '▸'}</span>
                            </button>
                            <div class="menu-dropdown-items">
                                ${loanItems.map((item) => `<a href="${this.resolveSidebarLink(item.link)}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive(item.link, pathname) ? 'active' : ''}"><span class="menu-icon">${item.icon}</span><span>${item.name}</span></a>`).join('')}
                            </div>
                        </div>` : ''}
                        ${(!isQuickBilling && !isSuperAdminConsole && this.businessType !== 'attendance_payroll' && canViewSettings && settingsItems.length > 0) ? `<div class="menu-dropdown ${settingsActive ? 'open' : ''}" id="settingsDropdown">
                            <button type="button" class="menu-dropdown-toggle ${settingsActive ? 'active' : ''}" id="settingsDropdownToggle">
                                <span style="display: flex; align-items: center; gap: 14px;"><span class="menu-icon">⚙️</span><span>${window.i18n('Settings')}</span></span><span>${settingsActive ? '▾' : '▸'}</span>
                            </button>
                            <div class="menu-dropdown-items">
                                ${settingsItems.map((item) => `<a href="${this.resolveSidebarLink(item.link)}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive(item.link, pathname) ? 'active' : ''}"><span class="menu-icon">${item.icon}</span><span>${window.i18n(item.name)}</span></a>`).join('')}
                            </div>
                        </div>` : ''}
                        ${(this.isSuperAdminUser() && !isSuperAdminConsole) ? `<div class="menu-section-label" style="padding: 14px 24px 4px 24px; font-size: 9.5px; font-weight: 800; letter-spacing: 0.8px; color: #38bdf8; text-transform: uppercase;">👑 Super Admin Console</div>
                        <a href="${this.resolveSidebarLink('/admin/super-dashboard.html')}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive('/admin/super-dashboard.html', pathname) ? 'active' : ''}"><span class="menu-icon">👑</span><span>${window.i18n('Super Dashboard')}</span></a>
                        <a href="${this.resolveSidebarLink('/admin/register-client.html')}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive('/admin/register-client.html', pathname) ? 'active' : ''}"><span class="menu-icon">➕</span><span>${window.i18n('Register New Client')}</span></a>
                        <a href="${this.resolveSidebarLink('/admin/vertical-sync.html')}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive('/admin/vertical-sync.html', pathname) ? 'active' : ''}"><span class="menu-icon">🔄</span><span>${window.i18n('Vertical Sync & Release Hub')}</span></a>
                        <a href="${this.resolveSidebarLink('/admin/developer-sandboxes.html')}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive('/admin/developer-sandboxes.html', pathname) ? 'active' : ''}"><span class="menu-icon">🧪</span><span>${window.i18n('Developer Sandboxes')}</span></a>
                        <a href="${this.resolveSidebarLink('/admin/business-management.html')}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive('/admin/business-management.html', pathname) ? 'active' : ''}"><span class="menu-icon">✨¢</span><span>${window.i18n('Business Management')}</span></a>
                        <a href="${this.resolveSidebarLink('/admin/live-activity.html')}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive('/admin/live-activity.html', pathname) ? 'active' : ''}"><span class="menu-icon">⚡</span><span>${window.i18n('Live Activity Monitor')}</span></a>
                        <a href="${this.resolveSidebarLink('/admin/inactive-accounts.html')}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive('/admin/inactive-accounts.html', pathname) ? 'active' : ''}"><span class="menu-icon">â³</span><span>${window.i18n('Inactive Accounts')}</span></a>
                        <a href="${this.resolveSidebarLink('/admin/super-dashboard.html#security')}" target="${SIDEBAR_NAV_LINK_TARGET}" rel="${SIDEBAR_NAV_LINK_REL}" class="menu-item ${this.isMenuActive('/admin/super-dashboard.html#security', pathname) ? 'active' : ''}"><span class="menu-icon">🛡️</span><span>${window.i18n('Security & Audit Logs')}</span></a>` : ''}
                </div>
                <div class="sidebar-footer">
                    <button type="button" class="support-sidebar-btn" id="sidebarSupportBtn" style="background:linear-gradient(135deg, #0f3b2c 0%, #166534 100%); border:none; color:#fff; padding:10px 14px; border-radius:8px; cursor:pointer; width:100%; font-size:13px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:8px; box-shadow:0 2px 6px rgba(0,0,0,0.15);">
                        <i class="fa-solid fa-headset" style="font-size:15px; color:#ffd966;"></i>
                        <span>සහාය / ගැටළු (Support)</span>
                    </button>
                    <button class="logout-sidebar-btn" id="sidebarLogoutBtn">Logout</button>
                </div>
            </div>
        `;

        const existingSidebar = document.querySelector('.retail-navbar');
        const mountPoint = document.getElementById('sidebar-container');
        if (mountPoint) {
            if (mountPoint.innerHTML !== html) {
                mountPoint.innerHTML = html;
            }
        } else {
            if (existingSidebar) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const newSidebar = tempDiv.querySelector('.retail-navbar');
                if (newSidebar && existingSidebar.innerHTML !== newSidebar.innerHTML) {
                    existingSidebar.innerHTML = newSidebar.innerHTML;
                }
            } else {
                document.body.insertAdjacentHTML('afterbegin', html);
            }
        }
        this.updateUserInfo();
        this.refreshScrapPoolBadge();
        this.initRetailRevenueBadge();
        this.initDistributorRevenueBadge();
        this.initLiveCashBadge();
        this.updateConnectionStatusText();
        this.attachEvents();
    }

    async refreshScrapPoolBadge() {
        if (this.isSuperAdminConsoleView()) return;
        const el = document.getElementById('sidebarScrapPoolBadge');
        if (!el) return;
        const bid = this.businessId || localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId');
        if (!bid) return;
        
        // Context detection
        const isScrapBiz = this.businessType === 'scrap_collection_center';
        const isScrapPage = window.location.pathname.includes('/scrap-');
        if (!isScrapBiz && !isScrapPage) return;

        try {
            // Ensure core library is available
            if (!window.scrapVbaCore) {
                if (!document.getElementById('scrap-vba-core-script')) {
                    const s = document.createElement('script');
                    s.id = 'scrap-vba-core-script';
                    s.src = '/admin/core/scrap-vba-core.js?v=78';
                    document.head.appendChild(s);
                }
                setTimeout(() => this.refreshScrapPoolBadge(), 1000);
                return;
            }

            if (!window.scrapVbaCore.getProfitPool) {
                setTimeout(() => this.refreshScrapPoolBadge(), 1000);
                return;
            }



            const bal = await window.scrapVbaCore.getProfitPool(bid);
            el.textContent = Math.floor(bal).toLocaleString();
            el.style.display = 'block';
            el.style.color = bal < 0 ? '#f87171' : '#34d399';
            el.style.background = bal < 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
        } catch (e) {
            console.warn('Scrap pool badge refresh failed:', e);
        }
    }

    async initRetailRevenueBadge(retryCount = 0) {
        if (this.isSuperAdminConsoleView()) return;
        const u = typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser;
        const bid = this.businessId || localStorage.getItem('selectedBusinessId') || localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId') || (u && u.uid);
        if (!bid) {
            if (retryCount < 10) setTimeout(() => this.initRetailRevenueBadge(retryCount + 1), 300);
            return;
        }

        const bType = String(this.businessType || localStorage.getItem('currentBusinessType') || sessionStorage.getItem('currentBusinessType') || '').toLowerCase().trim();
        const isTireOrRetail = ['retail', 'tire_centre'].includes(bType) || window.location.pathname.includes('/tire_centre/') || window.location.pathname.includes('/retail/');
        if (!isTireOrRetail) return;

        const el = document.getElementById('sidebarRetailRevenueBadge');
        if (!el) {
            if (retryCount < 10) {
                setTimeout(() => this.initRetailRevenueBadge(retryCount + 1), 300);
            }
            return;
        }

        const extractDateStr = (v) => {
            const now = new Date();
            const todayFallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            if (!v) return todayFallback;
            if (typeof v.toDate === 'function') { const d = v.toDate(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
            if (v.seconds) { const d = new Date(v.seconds * 1000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
            if (typeof v === 'number') { const d = new Date(v); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
            if (typeof v === 'string') {
                if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
                const d = new Date(v);
                if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
            return todayFallback;
        };

        // Listen in real-time to today's sales (orders)
        if (typeof this.retailRevenueUnsubscribe === 'function') {
            this.retailRevenueUnsubscribe();
        }

        try {
            const fs = (typeof db !== 'undefined' && db) ? db : (window.db || (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore()));
            
            const handleOrderSnap = () => {
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                
                Promise.all([
                    fs.collection('orders').doc(bid).collection('list').get().catch(() => ({ docs: [] })),
                    fs.collection("businesses").doc(bid).collection('orders').get().catch(() => ({ docs: [] }))
                ]).then(([nestedSnap, flatSnap]) => {
                    const docsMap = {};
                    [...nestedSnap.docs, ...flatSnap.docs].forEach(d => { docsMap[d.id] = d.data(); });
                    
                    let totalRevenue = 0;
                    Object.values(docsMap).forEach(d => {
                        const status = String(d.status || '').toLowerCase();
                        if (status === 'cancelled' || d.isReversed) return;
                        const dtStr = extractDateStr(d.createdAt || d.orderDate || d.date);
                        if (dtStr === todayStr) {
                            totalRevenue += parseFloat(d.total || d.totalAmount || d.netTotal || 0);
                        }
                    });

                    const val = Math.floor(totalRevenue);
                    if (val >= 0) {
                        el.textContent = `Profit: +Rs. ${val.toLocaleString()}`;
                        el.style.color = '#34d399';
                        el.style.background = 'rgba(16, 185, 129, 0.15)';
                    } else {
                        el.textContent = `Profit: -Rs. ${Math.abs(val).toLocaleString()}`;
                        el.style.color = '#f87171';
                        el.style.background = 'rgba(239, 68, 68, 0.15)';
                    }
                    el.style.display = 'inline-block';
                }).catch(() => {});
            };

            this.retailRevenueUnsubscribe = (fs.collection('orders').doc(bid).collection('list').get().then(handleOrderSnap), () => {});
            this.retailRevenueUnsubscribeFlat = (fs.collection("businesses").doc(bid).collection('orders').get().then(handleOrderSnap), () => {});
            handleOrderSnap();
        } catch (e) {
            console.warn('[Sidebar] Retail revenue badge initialization failed:', e);
        }
    }

    async initDistributorRevenueBadge(retryCount = 0) {
        if (this.isSuperAdminConsoleView()) return;
        const bid = this.businessId || localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId');
        if (!bid) return;
        if (String(this.businessType).toLowerCase().trim() !== 'distributor') return;

        const roleNorm = String(this.currentRole || '').toUpperCase();
        const isOwner = this.currentUserId === bid || roleNorm === 'OWNER' || roleNorm === 'BUSINESS_OWNER' || roleNorm === 'DISTRIBUTOR_OWNER' || roleNorm === 'SUPER_ADMIN';
        if (!isOwner) return;

        const el = document.getElementById('sidebarDistributorProfitBadge');
        if (!el) {
            if (retryCount < 5) {
                setTimeout(() => this.initDistributorRevenueBadge(retryCount + 1), 200);
            }
            return;
        }

        const startOfToday = new Date();
        startOfToday.setHours(0,0,0,0);
        const endOfToday = new Date();
        endOfToday.setHours(23,59,59,999);

        try {
            const fs = (typeof db !== 'undefined' && db) ? db : (window.db || (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore()));
            if (!fs) return;

            const prodMap = {};
            try {
                const pSnap = await fs.collection('products').doc(bid).collection('list').get();
                pSnap.forEach(d => {
                    const data = d.data() || {};
                    prodMap[d.id] = data;
                    if (data.productCode) prodMap[String(data.productCode).trim()] = data;
                });
            } catch(e) {}

            const [ordersSnap, expSnap] = await Promise.all([
                fs.collection('orders').doc(bid).collection('list')
                    .where('createdAt', '>=', startOfToday)
                    .where('createdAt', '<=', endOfToday).get().catch(() => ({ docs: [] })),
                fs.collection('expenses').doc(bid).collection('list')
                    .where('createdAt', '>=', startOfToday)
                    .where('createdAt', '<=', endOfToday).get().catch(() => ({ docs: [] }))
            ]);

            let todayRevenue = 0;
            let todayCogs = 0;
            ordersSnap.docs.forEach(doc => {
                const b = doc.data() || {};
                const status = String(b.status || '').toLowerCase();
                if (status === 'rejected' || status === 'cancelled') return;
                const items = Array.isArray(b.items) ? b.items : [];
                items.forEach(line => {
                    const soldQty = Math.max(0, Number(line.orderedQty != null ? line.orderedQty : line.qty) || 0);
                    const freeQty = Math.max(0, Number(line.freeQty) || 0);
                    const returnQty = Math.max(0, Number(line.returnResellQty != null ? line.returnResellQty : line.returnQty) || 0);
                    const billedQty = Math.max(0, soldQty - returnQty);
                    const unitPrice = Number(line.unitPrice) || 0;
                    let buyPrice = Number(line.buyingPrice || line.buyingPriceRaw || line.costPrice);
                    if (isNaN(buyPrice) || buyPrice <= 0) {
                        const pRef = prodMap[line.productId] || prodMap[line.productCode];
                        buyPrice = pRef ? (Number(pRef.buyingPrice) || Number(pRef.unitPrice) * 0.93) : (unitPrice * 0.93);
                    }
                    todayRevenue += billedQty * unitPrice;
                    todayCogs += (billedQty + freeQty) * buyPrice;
                });
            });

            let todayExp = 0;
            expSnap.docs.forEach(doc => {
                const r = doc.data() || {};
                todayExp += Number(r.amount) || 0;
            });

            const netProfit = Math.floor(todayRevenue - todayCogs - todayExp);
            if (netProfit >= 0) {
                el.textContent = `Today Profit: Rs. ${netProfit.toLocaleString()}`;
                el.style.color = '#34d399';
                el.style.background = 'rgba(16, 185, 129, 0.15)';
            } else {
                el.textContent = `Today Profit: -Rs. ${Math.abs(netProfit).toLocaleString()}`;
                el.style.color = '#f87171';
                el.style.background = 'rgba(239, 68, 68, 0.15)';
            }
            el.style.display = 'inline-block';
        } catch (e) {
            console.warn('[Sidebar] Distributor profit badge failed:', e);
        }
    }

    async initLiveCashBadge(retryCount = 0) {
        if (this.isSuperAdminConsoleView()) return;
        const u = typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser;
        const bid = this.businessId || localStorage.getItem('selectedBusinessId') || localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId') || (u && u.uid);
        if (!bid) {
            if (retryCount < 10) setTimeout(() => this.initLiveCashBadge(retryCount + 1), 300);
            return;
        }

        const bType = String(this.businessType || localStorage.getItem('currentBusinessType') || sessionStorage.getItem('currentBusinessType') || '').toLowerCase().trim();
        const isTireOrRetail = ['retail', 'tire_centre'].includes(bType) || window.location.pathname.includes('/tire_centre/') || window.location.pathname.includes('/retail/');
        if (!isTireOrRetail) return;

        const el = document.getElementById('sidebarLiveCashBadge');
        if (!el) {
            if (retryCount < 10) {
                setTimeout(() => this.initLiveCashBadge(retryCount + 1), 300);
            }
            return;
        }

        const fs = (typeof db !== 'undefined' && db) ? db : (window.db || (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore()));
        
        const extractDateStr = (v) => {
            const now = new Date();
            const todayFallback = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            if (!v) return todayFallback;
            if (typeof v.toDate === 'function') { const d = v.toDate(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
            if (v.seconds) { const d = new Date(v.seconds * 1000); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
            if (typeof v === 'number') { const d = new Date(v); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
            if (typeof v === 'string') {
                if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
                const d = new Date(v);
                if (!isNaN(d.getTime())) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            }
            return todayFallback;
        };

        try {
            let initCash = 0;
            let cashSales = 0;
            let cashExp = 0;
            let cashDep = 0;

            const updateDisplay = () => {
                const liveCash = (initCash + cashSales) - cashExp - cashDep;
                el.textContent = `Rs. ${Math.max(0, Math.floor(liveCash)).toLocaleString()}`;
                el.style.display = 'inline-block';
            };

            // 1. Onboarding initial cash from businesses doc and journal entries
            if (typeof this.liveCashUnsubscribeWizard === 'function') this.liveCashUnsubscribeWizard();
            this.liveCashUnsubscribeWizard = (fs.collection('businesses').doc(bid).get().then(doc => {
                let foundCash = 0;
                if (doc.exists && doc.data().onboardingBalances?.cash) {
                    foundCash = Number(doc.data().onboardingBalances.cash) || 0;
                }
                if (foundCash > 0) {
                    initCash = foundCash;
                    updateDisplay();
                } else {
                    fs.collection('journal').doc(bid).collection('entries')
                        .where('refType', '==', 'ONBOARDING').get().then(snap => {
                            snap.docs.forEach(d => {
                                if (d.data().ref === 'onboarding_cash') {
                                    const entry = (d.data().entries || [])[0];
                                    if (entry) initCash = Number(entry.amount || entry.debit) || 0;
                                }
                            });
                            updateDisplay();
                        }).catch(() => updateDisplay());
                }
            }), () => {});

            // 2. Cash Sales today
            if (typeof this.liveCashUnsubscribeSales === 'function') this.liveCashUnsubscribeSales();
            
            const handleCashSalesSnap = () => {
                const now = new Date();
                const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                
                Promise.all([
                    fs.collection('orders').doc(bid).collection('list').get().catch(() => ({ docs: [] })),
                    fs.collection("businesses").doc(bid).collection('orders').get().catch(() => ({ docs: [] }))
                ]).then(([nestedSnap, flatSnap]) => {
                    const docsMap = {};
                    [...nestedSnap.docs, ...flatSnap.docs].forEach(d => { docsMap[d.id] = d.data(); });
                    
                    cashSales = 0;
                    Object.values(docsMap).forEach(d => {
                        const status = String(d.status || '').toLowerCase();
                        if (status === 'cancelled' || d.isReversed) return;
                        const dtStr = extractDateStr(d.createdAt || d.orderDate || d.date);
                        const pm = String(d.paymentMethod || 'cash').toLowerCase();
                        if (dtStr === todayStr && pm === 'cash') {
                            cashSales += parseFloat(d.total || d.totalAmount || d.netTotal || 0);
                        }
                    });
                    updateDisplay();
                }).catch(() => {});
            };

            this.liveCashUnsubscribeSales = (fs.collection('orders').doc(bid).collection('list').get().then(handleCashSalesSnap), () => {});
            this.liveCashUnsubscribeSalesFlat = (fs.collection("businesses").doc(bid).collection('orders').get().then(handleCashSalesSnap), () => {});
            handleCashSalesSnap();

            // 3. Cash Expenses today
            if (typeof this.liveCashUnsubscribeExp === 'function') this.liveCashUnsubscribeExp();
            this.liveCashUnsubscribeExp = (fs.collection('expenses').doc(bid).collection('list').get().then(snap => {
                    const now = new Date();
                    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
                    cashExp = 0;
                    snap.forEach(dDoc => {
                        const d = dDoc.data() || {};
                        const dtStr = extractDateStr(d.expenseDate || d.createdAt || d.date);
                        const pm = String(d.paymentMethod || 'cash').toLowerCase();
                        if (dtStr === todayStr && pm === 'cash') {
                            cashExp += parseFloat(d.amount || 0);
                        }
                    });
                    updateDisplay();
                }), () => {});

            // 4. Cash Deposits from Drawer to Bank
            if (typeof this.liveCashUnsubscribeDep === 'function') this.liveCashUnsubscribeDep();
            this.liveCashUnsubscribeDep = (fs.collection('banks').doc(bid).collection('transactions')
                .where('type', '==', 'CASH_DEPOSIT').get().then(snap => {
                    cashDep = 0;
                    snap.forEach(dDoc => {
                        cashDep += parseFloat(dDoc.data().amount || 0);
                    });
                    updateDisplay();
                }), () => {});

        } catch (e) {
            console.warn('[Sidebar] Live cash badge failed:', e);
        }
    }

    getBusinessTypePrefix() {
        const raw = String(this.businessType || '').toLowerCase().trim();
        const map = {
            retail: 'RETAIL',
            quick_billing: 'QUICK BILLING',
            easy_bill: 'QUICK BILLING',
            manufacturer: 'MANUFACTURER',
            distributor: 'DISTRIBUTOR',
            tire_centre: 'TIRE CENTER',
            pharmacy: 'PHARMACY',
            restaurant: 'RESTAURANT',
            garment: 'GARMENT',
            hardware: 'HARDWARE',
            service: 'SERVICE',
            scrap_collection_center: 'SCRAP',
            tea_factory: 'TEA FACTORY'
        };
        if (map[raw]) return map[raw];
        if (!raw) return '';
        return raw.replace(/_/g, ' ').toUpperCase();
    }

    updateUserInfo() {
        if (this.isSuperAdminConsoleView()) {
            this.businessName = 'DIGIBIZ SYSTEM ADMIN';
            this.renderBusinessName('DIGIBIZ SYSTEM ADMIN');
            const logoIcon = document.getElementById('sidebarBusinessLogoIcon');
            const logoImg = document.getElementById('sidebarBusinessLogoImg');
            if (logoIcon) {
                logoIcon.textContent = '👑';
                logoIcon.classList.add('is-visible');
            }
            if (logoImg) {
                logoImg.style.display = 'none';
            }
            const nameEl = document.getElementById('sidebarUserName');
            const roleEl = document.getElementById('sidebarUserRole');
            const subEl = document.getElementById('sidebarSubscriptionStatus');
            if (nameEl) nameEl.textContent = this.ownerName || this.businessName || '';
            if (roleEl) {
                roleEl.textContent = '👑 SUPER ADMIN';
                roleEl.style.background = 'rgba(2, 132, 199, 0.35)';
                roleEl.style.border = '1px solid rgba(56, 189, 248, 0.4)';
                roleEl.style.color = '#38bdf8';
                roleEl.style.fontWeight = '800';
            }
            if (subEl) {
                subEl.textContent = '⚡ ROOT ACCESS';
                subEl.style.color = '#38bdf8';
                subEl.style.fontWeight = '800';
            }
            const trialBanner = document.getElementById('sidebarTrialBanner');
            if (trialBanner) trialBanner.style.display = 'none';
            return;
        }
        const user = firebase.auth().currentUser;
        const authEmail = (user && user.email) || '';
        const emailNorm = String(authEmail).trim().toLowerCase();

        // ULTIMATE OVERRIDE FOR HIMESHI
        if (emailNorm === 'biz.himeshi@gmail.com') {
            this.businessId = 'oDhSDYHQ2dV1DP33koysmZAqaY13';
            this.businessType = 'scrap_collection_center';
            this.ownerName = 'Rasika (Accountant)';
            this.businessName = 'Scrap Business';
        }

        
        const clientMatch = window.location.pathname.match(/^\/clients\/([^\/]+)/i);
        const clientSlug = clientMatch ? clientMatch[1].toLowerCase() : '';
        if (!this.ownerName || this.ownerName.toUpperCase() === String(this.businessName || '').toUpperCase() || this.ownerName === 'USER') {
            if (clientSlug === 'spiholdings') this.ownerName = 'Nadun De Alwis';
            else if (clientSlug === 'sathityrecentre') this.ownerName = 'Sathi';
            else if (clientSlug === 'madawalateashop') this.ownerName = 'Darshana Madawala';
            else if (clientSlug === 'chisathifamilyproducts') this.ownerName = 'Shashintha';
            else if (clientSlug === 'sunroselanka') this.ownerName = 'Roshan';
            else if (clientSlug === 'royalarabian') this.ownerName = 'Asmin';
        }

        const nameEl = document.getElementById('sidebarUserName');
        const roleEl = document.getElementById('sidebarUserRole');
        if (nameEl) nameEl.textContent = this.ownerName || 'Business Owner';
        if (!this.businessName || this.businessName === 'Client Business' || this.businessName === 'My Business') {
            if (window.location.pathname.includes('/tire_centre/')) this.businessName = 'SATHI TYRE & AUTO CARE CENTRE';
        }
        this.renderBusinessName(this.businessName || '');
        if (roleEl) {
            const isTire = window.location.pathname.includes('/tire_centre/') || this.businessType === 'tire_centre';
            if (isTire) {
                this.businessType = 'tire_centre';
            }
            if (!this.currentRole || this.currentRole === 'VIEWER' || this.currentRole === 'USER') {
                this.currentRole = 'BUSINESS_OWNER';
            }
            const role = String(this.currentRole || 'BUSINESS_OWNER').replace(/_/g, ' ');
            const prefix = this.getBusinessTypePrefix();
            let fullRoleText = role;
            if (prefix && !role.toUpperCase().startsWith(prefix.toUpperCase()) && !role.toUpperCase().includes('SUPER ADMIN')) {
                fullRoleText = `${prefix} ${role}`;
            }
            fullRoleText = fullRoleText.replace(/BUSINESS OWNER/i, 'OWNER');
            roleEl.textContent = fullRoleText;
            if (fullRoleText.length > 20) {
                roleEl.style.fontSize = '7.5px';
            } else if (fullRoleText.length > 15) {
                roleEl.style.fontSize = '8.5px';
            } else {
                roleEl.style.fontSize = '9.5px';
            }
            roleEl.style.whiteSpace = 'nowrap';
        }
        const subEl = document.getElementById('sidebarSubscriptionStatus');
        if (subEl) {
            let statusText = 'Free';
            const bData = this.businessDocData || {};
            const plan = String((this.subscriptionState && this.subscriptionState.plan) || bData.plan || bData.subscriptionPlan || bData.status || this.cachedPlan || '').toUpperCase();
            const rawStatus = String((this.subscriptionState && this.subscriptionState.status) || bData.status || bData.subscriptionStatus || this.cachedPlan || '').toUpperCase();
            const trialEnd = (this.subscriptionState && (this.subscriptionState.expireDate || this.subscriptionState.trialEnd)) ||
                             bData.trialEndsAt || bData.trialEnd || bData.trialEndDate || bData.trialExpiresAt;
            const subEnd = (this.subscriptionState && this.subscriptionState.expireDate) ||
                           bData.subscriptionExpiresAt || bData.expiresAt || bData.renewalDate;

            const officialDemoEmails = [
                'test@retail.com', 'test@hardware.com', 'test@pharmacy.com', 'test@tire.com',
                'test@tyrecentre.com', 'test@tirecentre.com', 'test@tyre.com', 'test@autocare.com',
                'test@distributor.com', 'test@factory.com', 'test@manufacturer.com', 'test@garment.com',
                'test@restaurant.com', 'test@salon.com', 'test@service.com', 'test@coconut.com',
                'test@attendance.com', 'test@easybill.com', 'test@quickbill.com', 'test@scrap.com',
                'test@teafactory.com', 'test@tea.com', 'demo@digibiz.lk'
            ];
            const emailNorm = String(this.currentUserId || (window.firebase && firebase.auth && firebase.auth().currentUser ? firebase.auth().currentUser.email : '')).toLowerCase();
            const isDemo = officialDemoEmails.includes(emailNorm)
                || (emailNorm.startsWith('test@') && emailNorm.endsWith('.com') && emailNorm !== 'test@bill.com')
                || rawStatus === 'DEMO'
                || plan === 'LIVE_DEMO'
                || (this.subscriptionState && this.subscriptionState.plan === 'LIVE_DEMO');

            const isTrial = !isDemo && (plan === 'TRIAL' || plan.includes('TRIAL') || rawStatus === 'TRIAL' || rawStatus === 'TRIAL_ACTIVE');
            const isPro = !isDemo && !isTrial && (plan === 'PRO' || plan === 'ENTERPRISE' || plan === 'PAID' || rawStatus === 'PRO' || rawStatus === 'ACTIVE' || rawStatus === 'PAID');

            if (isDemo) {
                statusText = '✨Ž® LIVE DEMO';
                subEl.style.color = '#38bdf8';
            } else if (isPro) {
                let expStr = '';
                if (subEnd) {
                    const endDate = typeof subEnd.toDate === 'function' ? subEnd.toDate() : new Date(subEnd);
                    expStr = ` (Expires: ${endDate.toLocaleDateString()})`;
                }
                statusText = `★ PRO${expStr}`;
                subEl.style.color = '#a7f3d0';
            } else if (isTrial) {
                let daysLeft = '';
                if (this.subscriptionState && typeof this.subscriptionState.remainingDays === 'number') {
                    if (this.subscriptionState.expired) {
                        daysLeft = ' (Expired)';
                    } else if (this.subscriptionState.remainingDays > 0) {
                        daysLeft = ` (${this.subscriptionState.remainingDays}d left)`;
                    } else {
                        daysLeft = ' (Expires today)';
                    }
                } else if (trialEnd) {
                    const endDate = typeof trialEnd.toDate === 'function' ? trialEnd.toDate() : new Date(trialEnd);
                    const diffDays = Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    if (diffDays > 0) {
                        daysLeft = ` (${diffDays}d left)`;
                    } else if (diffDays === 0) {
                        daysLeft = ' (Expires today)';
                    } else {
                        daysLeft = ' (Expired)';
                    }
                }
                statusText = `★ TRIAL${daysLeft}`;
                subEl.style.color = '#fde68a';
            } else if (plan) {
                statusText = this.subscriptionState ? this.subscriptionState.statusText : (rawStatus || 'Free');
            } else {
                statusText = '★ PRO';
                subEl.style.color = '#a7f3d0';
            }
            subEl.textContent = statusText;

            if (this.manufacturerDueAlert) {
                const extra = document.createElement('div');
                extra.style.fontSize = '11px';
                extra.style.marginTop = '4px';
                extra.style.color = this.manufacturerDueAlert.overdue > 0 ? '#fecaca' : '#fde68a';
                extra.textContent = `Due alerts: ${this.manufacturerDueAlert.pendingCount} pending, ${this.manufacturerDueAlert.overdue} overdue`;
                subEl.appendChild(extra);
            }
            if (this.smsLowBalanceAlert) {
                const low = document.createElement('div');
                low.style.fontSize = '11px';
                low.style.marginTop = '4px';
                low.style.color = '#fecaca';
                low.textContent = `Low SMS balance: ${this.smsLowBalanceAlert.bal} left`;
                subEl.appendChild(low);
            }
        }
    }

    updateConnectionStatusText() {
        const isOnline = navigator.onLine;
        const el = document.getElementById('sidebarConnectionStatus');
        if (el) {
            if (isOnline) {
                el.style.color = '#34d399'; // green matching badge
                el.textContent = 'ONLINE SYNCHRONIZED';
            } else {
                el.style.color = '#f87171'; // red matching badge
                el.textContent = 'OFFLINE';
            }
        }
        const mDot = document.getElementById('digibizMobileStatusDot');
        if (mDot) {
            if (isOnline) {
                mDot.className = 'digibiz-mobile-status-dot online';
                mDot.style.background = '#10b981';
            } else {
                mDot.className = 'digibiz-mobile-status-dot offline';
                mDot.style.background = '#ef4444';
            }
        }
    }

    attachEvents() {
        // Smooth in-page tab switching for Super Admin Console
        if (this.isSuperAdminConsoleView()) {
            document.querySelectorAll('.retail-navbar a.menu-item').forEach((link) => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href') || '';
                    if (href.includes('#')) {
                        const [path, hash] = href.split('#');
                        const curPath = window.location.pathname.toLowerCase();
                        if (path.toLowerCase().endsWith(curPath) || curPath.endsWith(path.toLowerCase())) {
                            window.location.hash = hash;
                            if (typeof window.setTab === 'function') {
                                window.setTab(hash.replace(/^tab-/, ''));
                            }
                        }
                    }
                });
            });
        }
        // Smooth in-page tab switching for Super Admin Console
        if (this.isSuperAdminConsoleView()) {
            document.querySelectorAll('.retail-navbar a.menu-item').forEach((link) => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href') || '';
                    if (href.includes('#')) {
                        const [path, hash] = href.split('#');
                        const curPath = window.location.pathname.toLowerCase();
                        if (path.toLowerCase().endsWith(curPath) || curPath.endsWith(path.toLowerCase())) {
                            window.location.hash = hash;
                            if (typeof window.setTab === 'function') {
                                window.setTab(hash.replace(/^tab-/, ''));
                            }
                        }
                    }
                });
            });
        }
        const supportBtn = document.getElementById('sidebarSupportBtn');
        if (supportBtn) {
            supportBtn.onclick = () => {
                if (typeof window.openDigibizSupport === 'function') {
                    window.openDigibizSupport();
                } else {
                    const fab = document.getElementById('digibizSupportFab');
                    if (fab) fab.click();
                    else {
                        const modal = document.getElementById('digibizSupportModal');
                        if (modal) modal.style.display = 'flex';
                    }
                }
            };
        }

                const logoutBtn = document.getElementById('sidebarLogoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = async () => {
                closeMobileSidebar();
                if (!navigator.onLine) {
                    if (typeof Swal !== 'undefined') {
                        Swal.fire({
                            icon: 'warning',
                            title: 'Offline Warning',
                            text: 'You are currently offline. Logging out may require an internet connection to log back in.',
                            showCancelButton: true,
                            confirmButtonText: 'Logout Anyway',
                            cancelButtonText: 'Stay Logged In'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                firebase.auth().signOut().then(() => { window.location.href = '/index.html'; });
                            }
                        });
                        return;
                    }
                }
                await firebase.auth().signOut();
                window.location.href = '/index.html';
            };
        }
    }

    updateSidebarLedgerBalances(activeGL = [], activeCustomers = [], activeSuppliers = []) {
        const formatLKR = (val) => 'Rs. ' + Number(val || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 });
        let html = '';

        if (Array.isArray(activeGL) && activeGL.length > 0) {
            html += '<div class="ledger-section-title">General Accounts</div>' + activeGL.map(acc => `
                <a href="javascript:void(0)" onclick="window.sidebar.openLedgerModal('GL', '${acc.code}', '${acc.name}')" class="ledger-sub-item">
                    <span>📜 ${acc.code.replace('-01','')} - ${acc.name}</span>
                    <span class="ledger-balance-badge" style="color: ${acc.balance >= 0 ? '#34d399' : '#f87171'};">${formatLKR(acc.balance)}</span>
                </a>
            `).join('');
        }

        if (Array.isArray(activeCustomers) && activeCustomers.length > 0) {
            html += '<div class="ledger-section-title" style="margin-top: 10px;">Customers (Debtors)</div>' + activeCustomers.map(cust => `
                <a href="javascript:void(0)" onclick="window.sidebar.openLedgerModal('CUSTOMER', 'debtor_${cust.name}', '${cust.name}')" class="ledger-sub-item">
                    <span>👤 ${cust.name}</span>
                    <span class="ledger-balance-badge" style="color: #f87171;">${formatLKR(cust.balance)}</span>
                </a>
            `).join('');
        }

        if (Array.isArray(activeSuppliers) && activeSuppliers.length > 0) {
            html += '<div class="ledger-section-title" style="margin-top: 10px;">Suppliers (Creditors)</div>' + activeSuppliers.map(supp => `
                <a href="javascript:void(0)" onclick="window.sidebar.openLedgerModal('SUPPLIER', 'creditor_${supp.name}', '${supp.name}')" class="ledger-sub-item">
                    <span>🏢 ${supp.name}</span>
                    <span class="ledger-balance-badge" style="color: #fde68a;">${formatLKR(supp.balance)}</span>
                </a>
            `).join('');
        }

        if ((!activeGL || activeGL.length === 0) && (!activeCustomers || activeCustomers.length === 0) && (!activeSuppliers || activeSuppliers.length === 0)) {
            html = '<div style="padding: 10px; font-size: 11px; color: rgba(255,255,255,0.4); text-align: center;">No active ledgers recorded yet.</div>';
        }

        const container = document.getElementById('sidebarLedgerBalancesContainer');
        if (container) container.innerHTML = html;
    }

    openLedgerModal(type, key, name) {
        let modal = document.getElementById('universalLedgerAuditorModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'universalLedgerAuditorModal';
            document.body.appendChild(modal);
        }
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 1000000; font-family: 'Inter', sans-serif;">
                <div style="background: white; border-radius: 24px; width: 90%; max-width: 850px; max-height: 85vh; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); border: 1px solid rgba(226, 232, 240, 0.8); display: flex; flex-direction: column;">
                    <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
                        <div>
                            <h3 style="font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; color: #0f3b2c; margin: 0;">${name}</h3>
                            <span style="font-size: 13px; color: #64748b; font-weight: 500;">Account Code / ID: ${key}</span>
                        </div>
                        <button onclick="document.getElementById('universalLedgerAuditorModal').style.display='none'" style="background: #f1f5f9; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; color: #475569; cursor: pointer; transition: all 0.2s;">Close</button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; flex: 1;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 13.5px;">
                            <thead>
                                <tr style="border-bottom: 2px solid #e2e8f0; background: #f8fafc;">
                                    <th style="padding: 10px; color: #475569; font-weight: 700;">Date</th>
                                    <th style="padding: 10px; color: #475569; font-weight: 700;">Description</th>
                                    <th style="padding: 10px; color: #475569; font-weight: 700; text-align: right;">Dr (+)</th>
                                    <th style="padding: 10px; color: #475569; font-weight: 700; text-align: right;">Cr (-)</th>
                                    <th style="padding: 10px; color: #475569; font-weight: 700; text-align: right;">Balance</th>
                                </tr>
                            </thead>
                            <tbody id="ledgerModalTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        const body = document.getElementById('ledgerModalTableBody');
        const entries = this.cachedJournalEntries || [];
        
        const lines = [];
        entries.forEach(entry => {
            if (entry.isReversed || entry.reversalOf) return;
            
            const memo = entry.memo || '';
            const ref = entry.ref || '';
            let entryDate = null;
            if (entry.date) {
                entryDate = entry.date.toDate ? entry.date.toDate() : new Date(entry.date);
            }
            if (!entryDate || isNaN(entryDate.getTime())) {
                if (entry.createdAt) {
                    entryDate = entry.createdAt.toDate ? entry.createdAt.toDate() : new Date(entry.createdAt);
                }
            }
            if (!entryDate || isNaN(entryDate.getTime())) {
                entryDate = new Date();
            }
            
            (entry.entries || []).forEach(row => {
                const code = row.accountCode || row.accountId || '';
                
                let isMatch = false;
                const nameLower = String(name || '').toLowerCase().trim();
                const memoLower = String(memo || '').toLowerCase();
                const refLower = String(ref || '').toLowerCase();
                const rowAccNameLower = String(row.accountName || '').toLowerCase();
                const entrySuppLower = String(entry.supplierName || '').toLowerCase();
                const entryCustLower = String(entry.customerName || '').toLowerCase();

                if (type === 'GL') {
                    isMatch = (code === key || row.accountId === key);
                } else if (type === 'CUSTOMER') {
                    isMatch = (code.startsWith('1-1030') || code === 'AC-10300') && (
                        memoLower.includes(nameLower) ||
                        refLower.includes(nameLower) ||
                        rowAccNameLower.includes(nameLower) ||
                        entryCustLower.includes(nameLower)
                    );
                } else if (type === 'SUPPLIER') {
                    isMatch = (code.startsWith('2-2010') || code.startsWith('2-1010') || code === 'AC-21000') && (
                        memoLower.includes(nameLower) ||
                        refLower.includes(nameLower) ||
                        rowAccNameLower.includes(nameLower) ||
                        entrySuppLower.includes(nameLower)
                    );
                }
                
                if (isMatch) {
                    let dr = Number(row.debit) || 0;
                    let cr = Number(row.credit) || 0;
                    if (row.amount !== undefined && row.type !== undefined) {
                        if (row.type === 'debit') dr = Number(row.amount) || 0;
                        if (row.type === 'credit') cr = Number(row.amount) || 0;
                    }
                    lines.push({
                        entryId: entry.id,
                        date: entryDate,
                        ref: ref,
                        memo: memo,
                        debit: dr,
                        credit: cr,
                        code: code
                    });
                }
            });
        });
        
        // Sort chronologically ascending to compute live running balances
        lines.sort((a, b) => a.date - b.date);
        
        if (lines.length === 0) {
            body.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #94a3b8;">No transactions found for this account.</td></tr>';
            return;
        }

        let runningBalance = 0;
        body.innerHTML = lines.map(line => {
            const dr = Number(line.debit || 0);
            const cr = Number(line.credit || 0);
            runningBalance += (dr - cr);
            line.balance = runningBalance;

            return `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px 10px; white-space: nowrap;">${line.date.toLocaleDateString()}</td>
                    <td style="padding: 12px 10px;">
                        <div style="font-weight: 600; color: #1e293b;">${line.memo || line.ref || 'Transaction'}</div>
                    </td>
                    <td style="padding: 12px 10px; text-align: right; color: #059669; font-weight: 600;">${dr > 0 ? formatLKR(dr) : '-'}</td>
                    <td style="padding: 12px 10px; text-align: right; color: #ef4444; font-weight: 600;">${cr > 0 ? formatLKR(cr) : '-'}</td>
                    <td style="padding: 12px 10px; text-align: right; font-weight: 700; color: #0f3b2c;">${formatLKR(line.balance)}</td>
                </tr>
            `;
        }).join('');
    }
}

window.reverseJournalEntrySystemWide = async function(entryId) {
    if (!confirm('🗑️ Are you sure you want to REVERSE / DELETE this transaction?\n\nThis will safely mark the entry as reversed, update bank/cash balances, and void the linked sales/purchases/expenses across the system.')) return;
    
    try {
        const fs = (typeof db !== 'undefined' && db) ? db : (window.db || (typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore()));
        if (!fs) throw new Error('Firestore not initialized.');
        
        const bid = window.currentBusinessId || localStorage.getItem('currentBusinessId');
        if (!bid) throw new Error('Business ID not found.');
        
        const entryRef = fs.collection('journal').doc(bid).collection('entries').doc(entryId);
        const entrySnap = await entryRef.get();
        if (!entrySnap.exists) {
            alert('Transaction not found or already deleted.');
            return;
        }
        
        const originalEntry = { id: entrySnap.id, ...entrySnap.data() };
        const batch = fs.batch();
        
        // 1. Mark as reversed (do not delete for accounting compliance)
        batch.update(entryRef, { isReversed: true, reversedAt: firebase.firestore.FieldValue.serverTimestamp() });
        
        // 2. Process linked document reversals
        const refRaw = originalEntry.ref || '';
        const refType = originalEntry.refType || '';
        const refId = refRaw.replace(/^purchases\//, '').replace(/^orders\//, '').replace(/^expenses\//, '').replace(/^banks\//, '');
        
        if (refId) {
            // Purchases/GRN
            if (refRaw.startsWith('purchases/') || refType === 'GRN') {
                const poRef = fs.collection('purchases').doc(bid).collection('orders').doc(refId);
                const poSnap = await poRef.get().catch(() => null);
                if (poSnap && poSnap.exists) {
                    batch.update(poRef, { status: 'cancelled', isReversed: true });
                    const poData = poSnap.data();
                    (poData.items || []).forEach(line => {
                        const pId = line.productId || line.id;
                        const qty = Number(line.receivedQty || line.qty) || 0;
                        if (pId && qty > 0) {
                            const pRef = fs.collection('products').doc(bid).collection('list').doc(pId);
                            batch.update(pRef, { stock: firebase.firestore.FieldValue.increment(-qty) });
                        }
                    });
                }
            }
            // Sales/Orders
            else if (refRaw.startsWith('orders/') || refType === 'SALE') {
                const orderRef = fs.collection('orders').doc(bid).collection('list').doc(refId);
                const oSnap = await orderRef.get().catch(() => null);
                if (oSnap && oSnap.exists) {
                    batch.update(orderRef, { status: 'cancelled', isReversed: true });
                    const oData = oSnap.data();
                    (oData.items || []).forEach(line => {
                        const pId = line.productId || line.id;
                        const qty = Number(line.quantity || line.orderedQty || line.qty) || 0;
                        if (pId && qty > 0) {
                            const pRef = fs.collection('products').doc(bid).collection('list').doc(pId);
                            batch.update(pRef, { stock: firebase.firestore.FieldValue.increment(qty) });
                        }
                    });
                }
            }
            // Expenses
            else if (refRaw.startsWith('expenses/') || refType === 'EXPENSE') {
                const expRef = fs.collection('expenses').doc(bid).collection('list').doc(refId);
                const eSnap = await expRef.get().catch(() => null);
                if (eSnap && eSnap.exists) {
                    batch.delete(expRef);
                }
            }
        }
        
        await batch.commit();
        alert('Transaction reversed successfully!');
        
        // Remove from UI immediately
        if (window.sidebar && window.sidebar.cachedJournalEntries) {
            window.sidebar.cachedJournalEntries = window.sidebar.cachedJournalEntries.filter(e => e.id !== entryId);
            
            // Re-render the modal using the exact arguments previously used (they are usually tied to UI state, 
            // but we can simply hide the row in the DOM for an immediate feel).
            const trs = document.querySelectorAll('#ledgerModalTableBody tr');
            trs.forEach(tr => {
                if (tr.innerHTML.includes(`'${entryId}'`)) {
                    tr.style.opacity = '0.3';
                    tr.style.textDecoration = 'line-through';
                    const btn = tr.querySelector('button');
                    if(btn) btn.style.display = 'none';
                }
            });
        }
        
    } catch (err) {
        console.error('Error reversing transaction:', err);
        alert('Error reversing transaction: ' + err.message);
    }
};

function runPageTranslation() {
    // Disabled to preserve pristine typography and eliminate Mojibake encoding artifacts
    return;
}

function bootstrapSidebarImmediate() {
    if (window.__DIGIBIZ_SIDEBAR_BOOTSTRAPPED__) return;
    if (!SHOULD_RESERVE_SIDEBAR_SPACE) return;
    if (!document.body) {
        setTimeout(bootstrapSidebarImmediate, 0);
        return;
    }
    window.__DIGIBIZ_SIDEBAR_BOOTSTRAPPED__ = true;
    ensureMobileSidebarControls();
    preReserveSidebarSpace();
    window.sidebar = new Sidebar();
    // runPageTranslation();
}

// Global event delegation for sidebar dropdown menus
document.addEventListener('click', (e) => {
    const btn = e.target.closest('#settingsDropdownToggle, #loansDropdownToggle, #financeDropdownToggle');
    if (!btn) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    let ddId = '';
    if (btn.id === 'settingsDropdownToggle') ddId = 'settingsDropdown';
    else if (btn.id === 'loansDropdownToggle') ddId = 'loansDropdown';
    else if (btn.id === 'financeDropdownToggle') ddId = 'financeDropdown';
    
    const dd = document.getElementById(ddId);
    if (dd) {
        dd.classList.toggle('open');
        const marker = btn.lastElementChild;
        if (marker) marker.textContent = dd.classList.contains('open') ? '▾' : '▸';
    }
});

bootstrapSidebarImmediate();
document.addEventListener('DOMContentLoaded', bootstrapSidebarImmediate);

console.log('✅ Sidebar Component Initialized cleanly');
/**
 * DigiBiz PWA bootstrap: manifest + install meta + service worker cache invalidation.
 */
(function () {
    function appendHead(node) {
        document.head.appendChild(node);
    }

    function ensureManifest() {
        if (document.querySelector('link[rel="manifest"]')) return;
        var l = document.createElement('link');
        l.rel = 'manifest';
        l.href = '/clients/madawalateashop/manifest.json';
        appendHead(l);
    }

    function ensureMeta(name, content) {
        if (document.querySelector('meta[name="' + name + '"]')) return;
        var m = document.createElement('meta');
        m.setAttribute('name', name);
        m.setAttribute('content', content);
        appendHead(m);
    }

    function ensureLink(rel, href, extra) {
        var sel = 'link[rel="' + rel + '"][href="' + href + '"]';
        if (document.querySelector(sel)) return;
        var l = document.createElement('link');
        l.rel = rel;
        l.href = href;
        if (extra) {
            Object.keys(extra).forEach(function (k) {
                l.setAttribute(k, extra[k]);
            });
        }
        appendHead(l);
    }

    function ensureScript(src) {
        if (document.querySelector('script[src="' + src + '"]')) return;
        var s = document.createElement('script');
        s.src = src;
        s.async = false;
        appendHead(s);
    }

    // Universal Mobile Guard: Hide floating support on all mobile phones & small touch screens
    (function injectUniversalMobileOverrides() {
        if (document.getElementById('dgbzUniversalMobileSupportOverrides')) return;
        var style = document.createElement('style');
        style.id = 'dgbzUniversalMobileSupportOverrides';
        style.textContent = '@media (max-width:900px),(pointer:coarse),(max-height:500px){#digibizSupportFab,.digibiz-support-fab{display:none!important;visibility:hidden!important;opacity:0!important;pointer-events:none!important;width:0!important;height:0!important;margin:0!important;padding:0!important;}}';
        if (document.head) document.head.appendChild(style);
        else document.addEventListener('DOMContentLoaded', function(){ document.head.appendChild(style); });
    })();

    ensureManifest();
    ensureScript('/admin/core/snapshot-data-bridge.js');
    ensureScript('/admin/core/daily-survey.js');
    ensureScript('/admin/core/universal-support.js');
    ensureScript('/admin/core/demo-seeder.js');
    ensureScript('/admin/core/demo-cleaner.js');
    ensureScript('/admin/core/live-presence.js?v=1');
    ensureMeta('theme-color', '#064e3b');
    ensureMeta('mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    ensureMeta('apple-mobile-web-app-title', 'Madawala Tea');

    ensureLink('apple-touch-icon', '/clients/madawalateashop/assets/icon-192.png');
    ensureLink('icon', '/clients/madawalateashop/assets/icon-192.svg', { type: 'image/svg+xml', sizes: '192x192' });
    ensureLink('icon', '/clients/madawalateashop/assets/icon-512.svg', { type: 'image/svg+xml', sizes: '512x512' });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/clients/madawalateashop/sw.js?v=20260824_v3_seamless_nav', { scope: '/clients/madawalateashop/' }).then(function(reg) {
                if (reg && reg.update) reg.update();

                // PWA update notification awareness
                if (reg.waiting) onSWUpdateReady();
                reg.addEventListener('updatefound', function() {
                    const w = reg.installing;
                    if (w) {
                        w.addEventListener('statechange', function() {
                            if (w.state === 'installed' && navigator.serviceWorker.controller) {
                                onSWUpdateReady();
                            }
                        });
                    }
                });

                function onSWUpdateReady() {
                    if (window.isFlagSuppressed && window.isFlagSuppressed('bypassPwaPrompt')) return;
                    showReloadToast();
                }
            }).catch(function (err) {
                console.warn('[PWA] Service worker registration error:', err);
            });
        });
    }

    function showReloadToast() {
        return;
    }

    // Global Client Version Lock Helper Guards
    window.isClientVersionLocked = function() {
        try {
            const raw = sessionStorage.getItem('digibiz_client_version_lock') || localStorage.getItem('digibiz_client_version_lock');
            if (!raw) return false;
            const config = JSON.parse(raw);
            return !!(config.isLocked || config.lockStatus === 'LOCKED');
        } catch (e) {
            return false;
        }
    };

    window.getClientVersionLockConfig = function() {
        try {
            const raw = sessionStorage.getItem('digibiz_client_version_lock') || localStorage.getItem('digibiz_client_version_lock');
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    };

    window.isFlagSuppressed = function(flagName) {
        const config = window.getClientVersionLockConfig && window.getClientVersionLockConfig();
        if (!config || !config.flags) return false;
        return config.flags[flagName] !== false;
    };

    window.syncClientVersionLockWithFirestore = async function(user) {
        const activeEmail = (window.getEffectiveUserEmail && window.getEffectiveUserEmail(user)) || (user && user.email) || localStorage.getItem('digibiz_impersonate_email') || '';
        if (!activeEmail) return;
        const email = String(activeEmail).trim().toLowerCase();
        const docId = email.replace(/[^a-z0-9@]/g, '_');

        try {
            const db = window.db || (window.firebase && typeof firebase.firestore === 'function' ? firebase.firestore() : null);
            if (db) {
                let vcDoc = await db.collection('client_version_control').doc(docId).get().catch(() => null);
                let data = (vcDoc && vcDoc.exists) ? vcDoc.data() : null;

                if (!data) {
                    const uSnap = await db.collection('users').where('email', '==', email).limit(1).get().catch(() => ({ empty: true }));
                    if (uSnap && !uSnap.empty) {
                        const uData = uSnap.docs[0].data() || {};
                        if (uData.versionLock) {
                            data = {
                                isLocked: true,
                                lockStatus: 'LOCKED',
                                versionTag: uData.lockedVersionTag || 'STABLE_FREEZE_2026_08_11',
                                flags: { suppressAutoUpdates: true, suppressBetaFeatures: true, lockBusinessType: true }
                            };
                        }
                    }
                }

                const isLockedDoc = !!(data && (data.isLocked || data.lockStatus === 'LOCKED') && data.versionTag !== 'LATEST_DEV');
                if (isLockedDoc) {
                    const lockConfig = {
                        isLocked: true,
                        lockStatus: 'LOCKED',
                        versionTag: data.versionTag || 'STABLE_FREEZE_2026_08_11',
                        flags: data.flags || { suppressAutoUpdates: true, suppressBetaFeatures: true, lockBusinessType: true }
                    };
                    localStorage.setItem('digibiz_client_version_lock', JSON.stringify(lockConfig));
                } else {
                    localStorage.removeItem('digibiz_client_version_lock');
                    sessionStorage.removeItem('digibiz_client_version_lock');
                }
            }
        } catch (e) {
            console.warn('[SandboxGate] Firestore lock sync warn:', e);
        }
    };

    function getSnapshotPrefix(versionTag, snapshotPath) {
        return '';
    }

    window.evaluateSandboxRouting = function() {
        return;
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(window.evaluateSandboxRouting, 10);
    } else {
        document.addEventListener('DOMContentLoaded', window.evaluateSandboxRouting);
    }

    // Auto-listen to Auth state changes to fetch version lock status
    function initPwaAuthLockListener() {
        if (window.firebase && firebase.apps && firebase.apps.length > 0 && typeof firebase.auth === 'function') {
            try {
                firebase.auth().onAuthStateChanged(function(user) {
                    if (user) {
                        window.syncClientVersionLockWithFirestore(user);
                    }
                });
            } catch(e) {
                console.warn('[PWA Init] Auth notice:', e);
            }
        } else {
            window.addEventListener('load', function() {
                if (window.firebase && firebase.apps && firebase.apps.length > 0 && typeof firebase.auth === 'function') {
                    try {
                        firebase.auth().onAuthStateChanged(function(user) {
                            if (user) {
                                window.syncClientVersionLockWithFirestore(user);
                            }
                        });
                    } catch(e) {}
                }
            });
        }
    }
    initPwaAuthLockListener();
})();

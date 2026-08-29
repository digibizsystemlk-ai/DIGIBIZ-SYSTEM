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
        if (window.location.pathname.indexOf('/quick_billing/') !== -1) {
            l.href = '/modules/quick_billing/manifest.json';
        } else {
            l.href = '/manifest.json';
        }
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

    ensureManifest();
    ensureScript('/core/snapshot-data-bridge.js');
    ensureScript('/core/daily-survey.js');
    ensureScript('/core/universal-support.js');
    ensureScript('/core/demo-seeder.js');
    ensureScript('/core/demo-cleaner.js');
    ensureScript('/core/live-presence.js?v=1');
    ensureMeta('theme-color', '#0f3b2c');
    ensureMeta('mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-capable', 'yes');
    ensureMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    ensureMeta('apple-mobile-web-app-title', 'DigiBiz');

    ensureLink('apple-touch-icon', '/icons/icon-192.svg');
    ensureLink('icon', '/icons/icon-192.svg', { type: 'image/svg+xml', sizes: '192x192' });
    ensureLink('icon', '/icons/icon-512.svg', { type: 'image/svg+xml', sizes: '512x512' });

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js?v=3211').then(function(reg) {
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
                    sessionStorage.setItem('digibiz_client_version_lock', JSON.stringify(lockConfig));
                } else {
                    localStorage.removeItem('digibiz_client_version_lock');
                    sessionStorage.removeItem('digibiz_client_version_lock');
                }

                window.evaluateSandboxRouting();
            }
        } catch (e) {
            console.warn('[SandboxGate] Firestore lock sync warn:', e);
        }
    };

    function getSnapshotPrefix(versionTag, snapshotPath) {
        if (snapshotPath && typeof snapshotPath === 'string' && snapshotPath.startsWith('/')) {
            return snapshotPath.endsWith('/') ? snapshotPath : snapshotPath + '/';
        }
        if (!versionTag || versionTag === 'LATEST_DEV') return '';
        if (versionTag === 'STD' || versionTag === 'STANDARD') return '/std/';
        const dateMatch = String(versionTag).match(/(\d{4}_\d{2}_\d{2})/);
        if (dateMatch) {
            return `/v${dateMatch[1]}/`;
        }
        return `/${String(versionTag).toLowerCase().replace(/[^a-z0-9_-]/g, '_')}/`;
    }

    window.evaluateSandboxRouting = function() {
        try {
            const config = window.getClientVersionLockConfig && window.getClientVersionLockConfig();
            const currentPath = window.location.pathname;
            const snapshotMatch = currentPath.match(/^\/(snapshots\/[^\/]+|v\d{4}_\d{2}_\d{2}|std|sunrose)\/(modules|admin|core|css|scripts|icons|assets)\//i);
            const isAlreadyInSnapshot = !!snapshotMatch;
            const currentSnapshotPrefix = snapshotMatch ? `/${snapshotMatch[1]}/` : null;

            if (currentPath.startsWith('/auth/') || currentPath.startsWith('/admin/') || currentPath.includes('/auth/login')) {
                // Do not sandbox login / authentication portal or Super Admin portal
                return;
            }

            const isLocked = !!(config && (config.isLocked || config.lockStatus === 'LOCKED') && config.versionTag !== 'LATEST_DEV');
            const versionTag = (config && config.versionTag) || 'STD';

            if (isLocked) {
                const targetSnapshotPrefix = getSnapshotPrefix(versionTag, config && config.snapshotPath);
                if (!isAlreadyInSnapshot && currentPath.startsWith('/modules/')) {
                    const targetUrl = targetSnapshotPrefix + currentPath.replace(/^\//, '') + window.location.search + window.location.hash;
                    console.log('[SandboxGate] 🔒 Routing locked client to standard release: ' + targetUrl);
                    window.location.replace(targetUrl);
                } else if (isAlreadyInSnapshot && targetSnapshotPrefix && currentSnapshotPrefix !== targetSnapshotPrefix) {
                    // Client locked to a different snapshot version than current path
                    const purePath = currentPath.replace(/^\/(snapshots\/[^\/]+|v\d{4}_\d{2}_\d{2}|std|sunrose)\//i, '');
                    const targetUrl = targetSnapshotPrefix + purePath + window.location.search + window.location.hash;
                    console.log('[SandboxGate] 🔒 Switching locked client to assigned release: ' + targetUrl);
                    window.location.replace(targetUrl);
                }
            } else {
                // Unlocked (Demo, Trial, Free, Dev) -> Automatically redirect out of any snapshot or std folder to Live Master
                if (isAlreadyInSnapshot) {
                    const livePath = currentPath.replace(/^\/(snapshots\/[^\/]+|v\d{4}_\d{2}_\d{2}|std|sunrose)\//i, '/');
                    console.log('[SandboxGate] 🔓 Routing unlocked/demo client back to live codebase: ' + livePath);
                    window.location.replace(livePath + window.location.search + window.location.hash);
                }
            }
        } catch(e) {
            console.warn('[SandboxGate] Routing check warn:', e);
        }
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

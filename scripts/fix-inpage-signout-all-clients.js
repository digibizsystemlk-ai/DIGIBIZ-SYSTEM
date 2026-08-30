const fs = require('fs');
const path = require('path');
const { backupClientIndex } = require('./backup-client-index');
const { filterMutableClients } = require('./utils/client-guard');

const ROOT_DIR = path.resolve(__dirname, '..');

const clients = filterMutableClients([
    { id: 'delightbakers', storageKey: 'delightbakers_distributor_data' },
    { id: 'spi_holdings', storageKey: 'spi_holdings_distributor_data' },
    { id: 'chisathifamily', storageKey: 'chisathi_auth_active' },
    { id: 'sathityrecentre', storageKey: 'sathi_auth_active' },
    { id: 'madawalateashop', storageKey: 'madawala_auth_active' },
    { id: 'thusithajayasundara', storageKey: 'coconut_auth_active' }
]);

console.log('🔧 Updating Sign Out behavior across active mutable clients...');

clients.forEach(({ id, storageKey }) => {
    const filePath = path.join(ROOT_DIR, 'public/clients', id, 'index.html');
    if (!fs.existsSync(filePath)) return;

    let html = fs.readFileSync(filePath, 'utf8');

    // Remove window.location.replace('/') from handleSignOut
    html = html.replace(
        /async function handleSignOut\(\)\s*\{[\s\S]*?showAuthGate\(\);[\s\S]*?\}\s*\}/g,
        `async function handleSignOut() {
            if (!confirm('Are you sure you want to sign out?')) return;
            try {
                document.documentElement.classList.remove('auth-active');
                localStorage.removeItem('${storageKey}');
                localStorage.removeItem('${storageKey}_auth_active');
                sessionStorage.removeItem('${storageKey}');
                sessionStorage.removeItem('${storageKey}_auth_active');
                sessionStorage.clear();
                const pwd = document.getElementById('loginPassword');
                if (pwd) pwd.value = '';
                showAuthGate();
                if (typeof auth !== 'undefined' && auth) {
                    await auth.signOut();
                }
                showToast('Signed out successfully');
            } catch (e) {
                document.documentElement.classList.remove('auth-active');
                showAuthGate();
            }
        }`
    );

    // Also check for regular function handleSignOut in any files
    html = html.replace(
        /function handleSignOut\(\)\s*\{[\s\S]*?showAuthGate\(\);[\s\S]*?\}\s*\}/g,
        `async function handleSignOut() {
            if (!confirm('Are you sure you want to sign out?')) return;
            try {
                document.documentElement.classList.remove('auth-active');
                localStorage.removeItem('${storageKey}');
                localStorage.removeItem('${storageKey}_auth_active');
                sessionStorage.removeItem('${storageKey}');
                sessionStorage.removeItem('${storageKey}_auth_active');
                sessionStorage.clear();
                const pwd = document.getElementById('loginPassword');
                if (pwd) pwd.value = '';
                showAuthGate();
                if (typeof auth !== 'undefined' && auth) {
                    await auth.signOut();
                }
                showToast('Signed out successfully');
            } catch (e) {
                document.documentElement.classList.remove('auth-active');
                showAuthGate();
            }
        }`
    );

    // Ensure no remaining window.location.replace('/') inside handleSignOut
    html = html.replace(
        /(async function handleSignOut\(\)[\s\S]*?)window\.location\.replace\('\/'\);?([\s\S]*?\})/g,
        '$1$2'
    );

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ [${id}] Updated to stay on in-page login modal upon Sign Out.`);
    backupClientIndex(id, 'In-page Sign Out to Client Login Modal');
});

console.log('\n🎉 All clients updated successfully!');

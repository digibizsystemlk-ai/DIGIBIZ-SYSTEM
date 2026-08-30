const fs = require('fs');
const path = require('path');
const { backupClientIndex } = require('./backup-client-index');

const ROOT_DIR = path.resolve(__dirname, '..');

const clients = [
    { id: 'delightbakers', storageKey: 'delightbakers_distributor_data' },
    { id: 'spi_holdings', storageKey: 'spi_holdings_distributor_data' },
    { id: 'chisathifamily', storageKey: 'chisathi_auth_active' },
    { id: 'sathityrecentre', storageKey: 'sathi_auth_active' },
    { id: 'madawalateashop', storageKey: 'madawala_auth_active' },
    { id: 'thusithajayasundara', storageKey: 'coconut_auth_active' }
];

clients.forEach(({ id, storageKey }) => {
    const filePath = path.join(ROOT_DIR, 'public/clients', id, 'index.html');
    if (!fs.existsSync(filePath)) return;

    let html = fs.readFileSync(filePath, 'utf8');

    // Fix double async
    html = html.replace(/async\s+async\s+function/g, 'async function');

    // Replace the entire handleSignOut block cleanly
    const cleanSignOutCode = `async function handleSignOut() {
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
        }`;

    html = html.replace(
        /(?:async\s+)?(?:async\s+)?function\s+handleSignOut\s*\(\s*\)\s*\{[\s\S]*?showAuthGate\(\);[\s\S]*?\}\s*\}/g,
        cleanSignOutCode
    );

    // Ensure no broken syntax
    html = html.replace(/async\s+async\s+/g, 'async ');

    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`✅ [${id}] Cleaned handleSignOut`);
    backupClientIndex(id, 'Clean In-page Sign Out');
});

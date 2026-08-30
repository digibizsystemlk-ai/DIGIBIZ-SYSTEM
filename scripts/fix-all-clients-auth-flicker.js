const fs = require('fs');
const path = require('path');

const clients = [
    { dir: 'delightbakers', key: 'delightbakers_distributor_data_auth_active' },
    { dir: 'spi_holdings', key: 'spi_holdings_distributor_data_auth_active' },
    { dir: 'chisathifamily', key: 'chisathi_auth_active' },
    { dir: 'madawalateashop', key: 'madawala_auth_active' },
    { dir: 'sathityrecentre', key: 'sathi_auth_active' },
    { dir: 'thusithajayasundara', key: 'coconut_auth_active' }
];

clients.forEach(c => {
    const p = path.join(__dirname, '..', 'public', 'clients', c.dir, 'index.html');
    if (!fs.existsSync(p)) return;

    let html = fs.readFileSync(p, 'utf8');

    // Check if script already exists
    if (!html.includes('Zero-Flash Instant Auth Guard')) {
        const guard = `
    <!-- Zero-Flash Instant Auth Guard -->
    <script>
        (function() {
            var k = '${c.key}';
            if (localStorage.getItem(k) === 'true' || sessionStorage.getItem(k) === 'true') {
                document.documentElement.classList.add('auth-active');
            }
        })();
    </script>`;

        html = html.replace('<head>', '<head>' + guard);
        fs.writeFileSync(p, html, 'utf8');
        console.log(`✅ Added Zero-Flash Instant Auth Guard to [${c.dir}]`);
    } else {
        console.log(`ℹ️ [${c.dir}] already has Zero-Flash Instant Auth Guard`);
    }
});

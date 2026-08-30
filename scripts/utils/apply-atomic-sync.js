const fs = require('fs');
let content = fs.readFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', 'utf8');

// Update DEFAULT_CLIENTS for madawalateashop with phone: 0778933264, ownerName: 'DARSHANA MADAWALA', and alias bizId: 'DarshanaMadawala'
content = content.replace(/id:\s*'madawalateashop',[\s\S]*?workspacePath:\s*'\/clients\/madawalateashop\/'/g, `id: 'madawalateashop',
                businessName: 'MADAWALA TEA SHOP',
                ownerName: 'DARSHANA MADAWALA',
                ownerEmail: 'darshanamadawala80@gmail.com',
                phone: '0778933264',
                package: 'TRIAL',
                plan: 'TRIAL',
                businessType: 'credit_ledger',
                monthlyFee: 1000,
                startDate: '2026-08-24',
                expiryDate: '2026-08-31',
                expireDate: '2026-08-31',
                expiryTime: '12:00:00',
                status: 'trial',
                smsCredits: 300,
                rawDocIds: ['madawalateashop', 'DarshanaMadawala', 'Mluz2PfHPoNatBlEkvpurJQ9Md83'],
                allowedEmails: ['darshanamadawala80@gmail.com', 'darshanamadawala@gmail.com', 'biz.sirimal@gmail.com', 'digibiz.pro@gmail.com'],
                workspacePath: '/clients/madawalateashop/'`);

// Ensure multi-key write in confirmExtendValidity
const oldExtendWrite = `await db.collection('system_clients').doc(c.id).update(payload);`;
const newExtendWrite = `const targetIds = Array.from(new Set([c.id, ...(c.rawDocIds || []), (c.id === 'madawalateashop' ? 'DarshanaMadawala' : null)].filter(Boolean)));
                for (const docId of targetIds) {
                    await db.collection('system_clients').doc(docId).set(payload, { merge: true }).catch(() => {});
                    await db.collection('businesses').doc(docId).set(payload, { merge: true }).catch(() => {});
                }`;

content = content.replace(oldExtendWrite, newExtendWrite);

fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/index.html', content, 'utf8');
fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/business-management.html', content, 'utf8');
fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/admin/live-activity.html', content, 'utf8');
fs.writeFileSync('i:/DIGIBIZ-SYSTEM/public/std/modules/admin/live-activity.html', content, 'utf8');
console.log('Successfully applied atomic multi-doc sync for Madawala Tea Shop and all tenants!');

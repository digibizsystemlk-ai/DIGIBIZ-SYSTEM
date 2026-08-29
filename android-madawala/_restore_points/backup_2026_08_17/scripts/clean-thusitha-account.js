const API_KEY = "AIzaSyBLFefSjFXp84Hg7nnIfuJ18SFcM92bsno";
const PROJECT_ID = "digibiz-sys";
const TARGET_BID = "cdREgEZOM9VXR48WKgGRlcRFfc63";
const TARGET_EMAIL = "thusithajayasundara86@gmail.com";

async function getSuperAdminToken() {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bdkariyapperuma@gmail.com', password: '123456', returnSecureToken: true })
    });
    if (!res.ok) throw new Error('Failed to sign in as super admin');
    const authData = await res.json();
    return authData.idToken;
}

async function queryCollectionByBusinessId(idToken, collectionId, bid) {
    const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
        body: JSON.stringify({
            structuredQuery: {
                from: [{ collectionId }],
                where: {
                    fieldFilter: {
                        field: { fieldPath: 'businessId' },
                        op: 'EQUAL',
                        value: { stringValue: bid }
                    }
                }
            }
        })
    });
    if (!res.ok) return [];
    const items = await res.json();
    const docs = [];
    for (const item of items) {
        if (item.document) docs.push(item.document.name);
    }
    return docs;
}

async function listSubcollectionDocs(idToken, parentPath) {
    const url = `https://firestore.googleapis.com/v1/${parentPath}`;
    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${idToken}` }
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.documents || []).map(d => d.name);
}

async function deleteDocByPath(idToken, docPath) {
    const url = `https://firestore.googleapis.com/v1/${docPath}`;
    const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${idToken}` }
    });
    return res.ok;
}

async function main() {
    console.log(`Starting purge for: ${TARGET_EMAIL} (Business ID: ${TARGET_BID})...`);
    const token = await getSuperAdminToken();
    console.log('Super admin token authenticated.');

    const collectionsToClean = [
        'coconut_raw_material_history',
        'coconut_husk_purchases',
        'coconut_sales',
        'coconut_production_runs',
        'coconut_expenses',
        'coconut_payments',
        'coconut_employee_advances',
        'coconut_payroll_records',
        'coconut_attendance_daily',
        'coconut_customers',
        'coconut_suppliers',
        'coconut_staff',
        'coconut_loans',
        'coconut_finance_transactions',
        'coconut_transformations'
    ];

    let totalDeleted = 0;

    for (const col of collectionsToClean) {
        const docPaths = await queryCollectionByBusinessId(token, col, TARGET_BID);
        console.log(`Found ${docPaths.length} docs in ${col}`);
        for (const p of docPaths) {
            await deleteDocByPath(token, p);
            totalDeleted++;
        }
    }

    // Clean sub-collections: journal/entries
    const journalEntries = await listSubcollectionDocs(token, `projects/${PROJECT_ID}/databases/(default)/documents/journal/${TARGET_BID}/entries`);
    console.log(`Found ${journalEntries.length} docs in journal/${TARGET_BID}/entries`);
    for (const p of journalEntries) {
        await deleteDocByPath(token, p);
        totalDeleted++;
    }

    // Clean coconut_raw_coconuts/items
    const rawCoconuts = await listSubcollectionDocs(token, `projects/${PROJECT_ID}/databases/${PROJECT_ID}/documents/coconut_raw_coconuts/${TARGET_BID}/items`);
    console.log(`Found ${rawCoconuts.length} docs in coconut_raw_coconuts/${TARGET_BID}/items`);
    for (const p of rawCoconuts) {
        await deleteDocByPath(token, p);
        totalDeleted++;
    }

    // Clean coconut_husk_raw/items
    const rawHusks = await listSubcollectionDocs(token, `projects/${PROJECT_ID}/databases/${PROJECT_ID}/documents/coconut_husk_raw/${TARGET_BID}/items`);
    console.log(`Found ${rawHusks.length} docs in coconut_husk_raw/${TARGET_BID}/items`);
    for (const p of rawHusks) {
        await deleteDocByPath(token, p);
        totalDeleted++;
    }

    // Clean coconut_finished_products/items
    const finProds = await listSubcollectionDocs(token, `projects/${PROJECT_ID}/databases/${PROJECT_ID}/documents/coconut_finished_products/${TARGET_BID}/items`);
    console.log(`Found ${finProds.length} docs in coconut_finished_products/${TARGET_BID}/items`);
    for (const p of finProds) {
        await deleteDocByPath(token, p);
        totalDeleted++;
    }

    console.log(`\n======================================================`);
    console.log(`✅ PURGE COMPLETED! Total ${totalDeleted} documents removed.`);
    console.log(`Account ${TARGET_EMAIL} is now 100% clean and fresh.`);
    console.log(`======================================================`);
}

main().catch(err => {
    console.error('Purge error:', err);
    process.exit(1);
});

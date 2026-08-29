const API_KEY = "AIzaSyBLFefSjFXp84Hg7nnIfuJ18SFcM92bsno";
const PROJECT_ID = "digibiz-sys";

const OFFICIAL_DEMO_EMAILS = [
  'test@retail.com', 'test@hardware.com', 'test@pharmacy.com', 'test@tire.com',
  'test@tyrecentre.com', 'test@tirecentre.com', 'test@tyre.com', 'test@autocare.com',
  'test@distributor.com', 'test@bakery.com', 'test@factory.com', 'test@manufacturer.com',
  'test@garment.com', 'test@restaurant.com', 'test@salon.com', 'test@service.com',
  'test@coconut.com', 'test@attendance.com', 'test@easybill.com', 'test@quickbill.com',
  'test@scrap.com', 'test@teafactory.com', 'test@tea.com', 'demo@digibiz.lk'
];

async function getSuperAdminToken() {
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bdkariyapperuma@gmail.com', password: '123456', returnSecureToken: true })
  });
  if (!res.ok) {
    throw new Error('Failed to sign in as super admin');
  }
  const data = await res.json();
  return data.idToken;
}

async function runQuery(idToken, collectionId, whereFilter = null) {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`;
  const structuredQuery = {
    from: [{ collectionId }]
  };
  if (whereFilter) {
    structuredQuery.where = whereFilter;
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ structuredQuery })
  });
  if (!res.ok) return [];
  const items = await res.json();
  const docs = [];
  for (const item of items) {
    if (item.document) {
      const doc = item.document;
      const id = doc.name.split('/').pop();
      const fields = {};
      for (const k in doc.fields || {}) {
        const vObj = doc.fields[k];
        const vType = Object.keys(vObj)[0];
        fields[k] = vObj[vType];
      }
      docs.push({ id, path: doc.name, fields });
    }
  }
  return docs;
}

async function deleteDoc(idToken, docPath) {
  const url = `https://firestore.googleapis.com/v1/${docPath}`;
  await fetch(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${idToken}` }
  });
}

async function patchDoc(idToken, docPath, fields) {
  const firestoreFields = {};
  for (const [k, v] of Object.entries(fields)) {
    if (typeof v === 'string') firestoreFields[k] = { stringValue: v };
    else if (typeof v === 'number') firestoreFields[k] = { doubleValue: v };
    else if (typeof v === 'boolean') firestoreFields[k] = { booleanValue: v };
    else if (typeof v === 'object' && v !== null) {
      const mapVal = {};
      for (const [mk, mv] of Object.entries(v)) {
        mapVal[mk] = typeof mv === 'number' ? { doubleValue: mv } : { stringValue: String(mv) };
      }
      firestoreFields[k] = { mapValue: { fields: mapVal } };
    }
  }
  const mask = Object.keys(fields).map(k => `updateMask.fieldPaths=${k}`).join('&');
  const url = `https://firestore.googleapis.com/v1/${docPath}?${mask}`;
  await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ fields: firestoreFields })
  });
}

async function wipeAllDemoAccounts() {
  console.log('=====================================================');
  console.log('🧹 Purging All Legacy Demo Data from Firebase...');
  console.log('=====================================================\n');

  const token = await getSuperAdminToken();
  console.log('🔑 Authenticated successfully!\n');

  // 1. Get all Demo Businesses
  const allBizs = await runQuery(token, 'businesses');
  const demoBizs = [];
  
  allBizs.forEach(b => {
    const ownerEmail = String(b.fields.ownerEmail || b.fields.email || '').toLowerCase().trim();
    const status = String(b.fields.status || '').toUpperCase().trim();
    if (
      status === 'DEMO' ||
      status === 'LIVE_DEMO' ||
      OFFICIAL_DEMO_EMAILS.includes(ownerEmail) ||
      (ownerEmail.startsWith('test@') && ownerEmail.endsWith('.com') && ownerEmail !== 'test@bill.com')
    ) {
      demoBizs.push({ id: b.id, path: b.path, email: ownerEmail });
    }
  });

  console.log(`Found ${demoBizs.length} Demo Accounts in Firestore:`);
  demoBizs.forEach(d => console.log(`  - [${d.id}] ${d.email}`));

  const collectionsToClean = [
    "products", "customers", "suppliers", "sales", "invoices", "bills",
    "expenses", "orders", "reps", "shops", "appointments", "services",
    "journal_entries", "account_balances", "supplier_ledger"
  ];

  let totalPurged = 0;

  for (const biz of demoBizs) {
    console.log(`\n🧹 Cleaning Demo Business: ${biz.id} (${biz.email})...`);
    
    // Reset onboardingBalances and balances in business doc
    try {
      await patchDoc(token, biz.path, {
        onboardingBalances: { cash: 0, bank: 0 },
        cashInDrawer: 0,
        bankBalance: 0,
        openingCash: 0,
        openingBank: 0
      });
      console.log(`  ✅ Reset onboardingBalances & drawer cash to 0 for ${biz.id}`);
    } catch(e) {
      console.warn(`  Failed to patch business doc:`, e.message);
    }

    // Clean top level collections
    for (const col of collectionsToClean) {
      const docs = await runQuery(token, col, {
        fieldFilter: {
          field: { fieldPath: "businessId" },
          op: "EQUAL",
          value: { stringValue: biz.id }
        }
      });

      if (docs.length > 0) {
        console.log(`  Deleting ${docs.length} records from '${col}'...`);
        for (const d of docs) {
          await deleteDoc(token, d.path);
          totalPurged++;
        }
      }
    }
  }

  console.log(`\n=====================================================`);
  console.log(`🎉 Demo Purge Complete! Total deleted records: ${totalPurged}`);
  console.log(`=====================================================`);
}

wipeAllDemoAccounts().catch(console.error);

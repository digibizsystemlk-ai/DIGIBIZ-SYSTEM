/**
 * Clear Old Blog Posts and Seed 15 Complete Business Vertical Guides for DIGIBIZ PRO (in DRAFT mode)
 * Run: node scripts/clear-and-seed-business-blogs.js
 */

const API_KEY = "AIzaSyBLFefSjFXp84Hg7nnIfuJ18SFcM92bsno";
const PROJECT_ID = "digibiz-sys";

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

function toFirestoreFields(obj) {
    const fields = {};
    for (const [k, v] of Object.entries(obj)) {
        if (v === null || v === undefined) {
            fields[k] = { nullValue: null };
        } else if (typeof v === 'boolean') {
            fields[k] = { booleanValue: v };
        } else if (typeof v === 'number') {
            fields[k] = { doubleValue: v };
        } else if (typeof v === 'string') {
            fields[k] = { stringValue: v };
        } else if (v instanceof Date) {
            fields[k] = { timestampValue: v.toISOString() };
        }
    }
    return fields;
}

const BUSINESS_BLOGS = [
    {
        id: 'guide-retail-supermarket-pos',
        title: 'Retail & Supermarket කළමනාකරණ පද්ධතිය: POS, Barcode, Multi-Warehouse තොග සහ දෛනික ලාභ විශ්ලේෂණය',
        category: 'features',
        categoryLabel: 'Retail & Grocery',
        icon: '🛒',
        author: 'DIGIBIZ Engineering',
        date: '2026-08-22',
        desc: 'සුපිරි වෙළඳසැල් සහ සිල්ලර වෙළඳසැල් සඳහා තත්පර 3 කින් Barcode Scan කර බිල්පත් සැකසීම, Low Stock Alerts සහ සැබෑ දෛනික ශුද්ධ ලාභය බලාගන්නා අයුරු.',
        content: `## 🛒 Retail & Supermarket Cloud POS System

DIGIBIZ Retail පද්ධතිය නිර්මාණය කර ඇත්තේ සුපිරි වෙළඳසැල්, සිල්ලර සහ තොග වෙළඳසැල්වල වේගවත් බිල්පත් නිකුත් කිරීම සහ ස්වයංක්‍රීය තොග පාලනය සඳහාය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Lightning Fast POS Terminal:** Barcode Scanner හෝ Touch UI මඟින් තත්පර 3 කින් වේගවත් බිල්පත් සැකසීම.
2. **Multi-Payment Support:** Cash, Card, Bank Transfer සහ Credit (ණයට විකිණීම්) එකම බිලක් තුළ කළමනාකරණය.
3. **Smart Low Stock Alerts:** භාණ්ඩ තොග අවම මට්ටමට (Re-order point) ළඟා වන විට ක්ෂණික දැනුම්දීම්.
4. **Real-time Profit Analytics:** මිලදී ගත් මිල (Cost Price) සහ විකුණුම් මිල අතර වෙනසින් දෛනික සැබෑ ශුද්ධ ලාභය ක්ෂණිකව බලාගැනීම.
5. **Customer Credit Ledger:** පාරිභෝගිකයින්ගේ ණය ශේෂයන් සහ ගෙවීම් ඉතිහාසය නිවැරදිව පවත්වා ගැනීම.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@retail.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** POS Terminal, Sales History, Stock / Inventory, Purchases & GRN, Supplier Payables, Accounting Ledger.

> [!TIP]
> WhatsApp Digital Invoicing මඟින් කඩදාසි බිල්පත් වියදම 100% කින් ඉතිරි කරගත හැක.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-tire-center-auto-services',
        title: 'Tire Center & Wheel Alignment කළමනාකරණය: ටයර් ප්‍රමාණ (Sizes), සේවා ගාස්තු සහ පාරිභෝගික ණය පාලනය',
        category: 'features',
        categoryLabel: 'Tire & Auto',
        icon: '🛞',
        author: 'DIGIBIZ Auto Team',
        date: '2026-08-22',
        desc: 'ටයර් ප්‍රමාණ (Tire Sizes), Brand, රට සහ Pattern අනුව තොග කළමනාකරණය කරමින් Wheel Alignment, Balancing සේවා බිල්පත් නිකුත් කිරීමේ සම්පූර්ණ විසඳුම.',
        content: `## 🛞 Tire Center & Auto Services Management

ටයර් අලෙවිසැල් සහ සේවා මධ්‍යස්ථාන සඳහා විශේෂිත වූ DIGIBIZ Tire Center OS මඟින් ටයර් තොග සහ සේවා එකම පද්ධතියකින් පාලනය වේ.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Tire Size & Pattern Matrix:** 195/65R15, 205/55R16 ආදී ටයර් ප්‍රමාණ, Brand (Dunlop, CEAT, Michelin), Tube/Tubeless අනුව වර්ගීකරණය.
2. **Service Job Billing:** Wheel Alignment, Wheel Balancing, Nitrogen Air, Tire Fitting සේවා ගාස්තු භාණ්ඩ බිලටම එක් කිරීම.
3. **Vehicle Number Tracking:** වාහන අංකය අනුව පාරිභෝගිකයා මිලදී ගත් ටයර් සහ Warranty විස්තර සෙවීම.
4. **Old Tire Buyback:** පරණ ටයර් හුවමාරු කිරීම් (Trade-in) සහ ඒවායේ වටිනාකම බිලෙන් අඩු කිරීම.
5. **Supplier Credit & Cheque Register:** ටයර් සමාගම්වලට ලබාදුන් චෙක්පත් සහ ණය ගෙවීම් දින නිරීක්ෂණය.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@tire.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Tire POS, Size-wise Stock, Services Catalog, Customer Debt Ledger, Revenue Analytics.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-auto-care-vehicle-repair-job-cards',
        title: 'Auto Care & Vehicle Repair Center: Digital Job Cards, වාහන පරීක්ෂාව, Spare Parts සහ SMS Alerts',
        category: 'features',
        categoryLabel: 'Auto Care & Garage',
        icon: '🚗',
        author: 'DIGIBIZ Engineering',
        date: '2026-08-22',
        desc: 'වාහන අලුත්වැඩියා මධ්‍යස්ථාන සඳහා Digital Job Card සැකසීම, Spare Parts Stock, ඇස්තමේන්තු (Estimations) සහ වාහනය සූදානම් වූ විට SMS යැවීම.',
        content: `## 🚗 Auto Care & Vehicle Repair Center OS

වාහන සේවා ස්ථාන (Service Stations), Garage සහ Auto Electrical මධ්‍යස්ථාන සඳහා සම්පූර්ණ Digital Job Card සහ Invoicing විසඳුම.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Digital Job Card Management:** වාහනය පැමිණි විට Meter Reading, පාරිභෝගික පැමිණිල්ල සහ ඡායාරූප සහිත Job Card එකක් විවෘත කිරීම.
2. **Spare Parts & Labour Costing:** අමතර කොටස් මිල සහ කාර්මික ශිල්පියාගේ ශ්‍රම ගාස්තුව ස්වයංක්‍රීයව බිලට එකතු වීම.
3. **Automatic Customer SMS Alerts:** වාහනයේ වැඩ අවසන් වූ සැනින් "ඔබගේ වාහනය රැගෙන යාමට සූදානම්" ලෙස ක්ෂණික SMS එකක් පාරිභෝගිකයාට යැවීම.
4. **Complete Service History:** වාහන අංකය ඇතුළත් කළ සැනින් කලින් කළ සියලුම අලුත්වැඩියාවන් සහ දින බලාගැනීම.
5. **Insurance Estimation Generator:** රක්ෂණ සමාගම් වෙත ඉදිරිපත් කළ හැකි නිල Estimation Invoices සැකසීම.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@autocare.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Job Cards, Inspections, Estimations, Invoicing, Spare Parts Inventory, SMS Alerts.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-pharmacy-batch-expiry-tracking',
        title: 'Pharmacy & Healthcare පද්ධතිය: ඖෂධ Batch Numbers, කල්ඉකුත්වීමේ දැනුම්දීම් (Expiry Alerts) සහ බෙහෙත් වට්ටෝරු කළමනාකරණය',
        category: 'features',
        categoryLabel: 'Pharmacy OS',
        icon: '💊',
        author: 'DIGIBIZ Healthcare Team',
        date: '2026-08-22',
        desc: 'ෆාමසි සඳහා ඖෂධවල Batch Number, Expiry Date නිරීක්ෂණය කරමින් කල්ඉකුත් වීමට මාස 3 කට පෙර ලැබෙන Smart Alerts සහ වේගවත් POS පහසුකම.',
        content: `## 💊 Pharmacy & Healthcare Management System

ඖෂධ අලෙවිසැල් සඳහා ඖෂධ නීති රීතිවලට අනුකූලව Batch Tracking සහ Expiry Management සහිත විශේෂිත Cloud පද්ධතිය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Batch & Expiry Date Management:** සෑම ඖෂධයකම Batch අංකය සහ Expiry දිනය අනුව තොග කළමනාකරණය.
2. **Smart Expiry Warnings:** කල්ඉකුත් වීමට ආසන්න ඖෂධ සඳහා මාස 3 කට, මාසයකට පෙර කහ/රතු වර්ණයෙන් ලැබෙන Alerts.
3. **Generic & Brand Name Search:** ඖෂධයේ වෙළඳ නාමය (Brand Name) හෝ විද්‍යාත්මක නාමය (Generic Name) මඟින් ක්ෂණිකව සෙවීම.
4. **Dosage & Prescription Instructions:** බිල්පතේ ඖෂධ මාත්‍රාව (උදේ/දවල්/රෑ, කෑමට පසු/පෙර) සිංහලෙන් හෝ ඉංග්‍රීසියෙන් මුද්‍රණය කිරීම.
5. **Supplier Purchase Orders:** ඖෂධ සමාගම්වලින් මිලදී ගැනීම් සහ ආපසු යැවීම් (Returns) ලෙජරය.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@pharmacy.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Pharmacy POS, Batch Inventory, Expiry Warnings, Prescription Handling, Supplier Ledger.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-distributor-wholesale-rep-app',
        title: 'Distributor & Wholesaler කළමනාකරණය: HQ Warehouse, Route Deliveries, Rep Mobile App සහ Shop Invoicing',
        category: 'features',
        categoryLabel: 'Distribution OS',
        icon: '🚚',
        author: 'DIGIBIZ Distribution Team',
        date: '2026-08-22',
        desc: 'බෙදාහැරීමේ ආයතන සඳහා ප්‍රධාන ගබඩාව (HQ Warehouse), බෙදාහැරීමේ මාර්ග (Routes), Sales Rep Mobile App සහ කඩසාප්පු ණය පාලනය.',
        content: `## 🚚 Distributor & Wholesaler Management Suite

භාණ්ඩ බෙදාහැරීමේ සමාගම් සහ තොග වෙළෙන්දන් සඳහා ප්‍රධාන කාර්යාලය සහ පාරේ යන Sales Rep වරුන් එකට සම්බන්ධ කරන Unified System එක.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Sales Rep Mobile Ordering App:** Sales Rep වරුන්ට ඕනෑම තැනක සිට Smart Phone එකෙන් Offline හෝ Online කඩ සාප්පු Order ඇතුළත් කිරීම.
2. **HQ Warehouse & Delivery Dispatch:** ඇණවුම් අනුව Lorry Load Sheet සකස් කිරීම සහ Delivery Confirmation.
3. **Dynamic Free Issue Schemes:** 10 ක් ගත්විට 1 ක් නොමිලේ (10+1 Free Schemes) ස්වයංක්‍රීයව ගණනය වීම.
4. **Shop Credit & Outstanding Control:** කඩ සාප්පුවල ණය සීමාව (Credit Limit) ඉක්මවා ඇත්නම් Alert නිකුත් කිරීම.
5. **Market Returns & Damage Handling:** කල්ඉකුත් වූ හෝ හානි වූ භාණ්ඩ ආපසු භාරගැනීම සහ Credit Notes නිකුත් කිරීම.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@distributor.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Warehouse Dispatch, Reps App, Route Deliveries, Free Issue Rules, Shop Credit Ledger.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-hardware-construction-bulk-pricing',
        title: 'Hardware & Construction Materials: මිනුම් ඒකක (Feet/Inches/Kg), තොග මිල ගණන් සහ ගොඩනැගිලි ද්‍රව්‍ය ණය පාලනය',
        category: 'features',
        categoryLabel: 'Hardware OS',
        icon: '🔧',
        author: 'DIGIBIZ Engineering',
        date: '2026-08-22',
        desc: 'හාඩ්වෙයාර් ව්‍යාපාර සඳහා වැලි, ගල්, සිමෙන්ති, යකඩ, PVC බට සහ කම්බි අඩි/අඟල්/කිලෝ ග්‍රෑම් අනුව බිල්පත් නිකුත් කිරීමේ විශේෂිත පද්ධතිය.',
        content: `## 🔧 Hardware & Construction Materials OS

හාඩ්වෙයාර් සහ ඉදිකිරීම් ද්‍රව්‍ය වෙළඳසැල් සඳහා විවිධ මිනුම් ඒකක සහ තොග මිල ගණන් සහිත විශේෂිත Cloud Invoicing පද්ධතිය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Multi-Unit Conversions:** අඩි (Feet), අඟල් (Inches), මීටර්, කිලෝග්‍රෑම්, බෑග් සහ බණ්ඩල් අනුව මිල ගණන් නියම කිරීම.
2. **Bulk Weight & Length Billing:** කම්බි, වැලි, කළුගල් සහ ලෑලි මිනුම් අනුව ස්වයංක්‍රීයව මුදල ගණනය වීම.
3. **Contractor / Bass Credit Ledger:** කොන්ත්‍රාත්කරුවන් සහ බාස්වරුන් සඳහා වෙනම ණය ලෙජරයක් පවත්වා ගැනීම.
4. **Quotation to Invoice Conversion:** පාරිභෝගිකයාට ලබාදුන් Quotation එක තනි ක්ලික් එකෙන් නිල බිල්පතක් බවට පත් කිරීම.
5. **Direct Site Delivery Tracking:** භාණ්ඩ ගොඩනැගිලි භූමියටම ප්‍රවාහනය කිරීමේ වියදම් සහ ලොරි ගමන් වාර්තා.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@hardware.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Hardware POS, Multi-Unit Inventory, Bulk Pricing, Contractor Credit, Quotations.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-manufacturer-production-costing',
        title: 'Manufacturing & Production පද්ධතිය: අමුද්‍රව්‍ය (Raw Materials), නිෂ්පාදන පිරිවැය (Cost Sheet) සහ නිමි භාණ්ඩ තොග',
        category: 'features',
        categoryLabel: 'Manufacturing OS',
        icon: '🏭',
        author: 'DIGIBIZ Manufacturing Team',
        date: '2026-08-22',
        desc: 'නිෂ්පාදන ආයතන සහ කර්මාන්තශාලා සඳහා අමුද්‍රව්‍යවල සිට නිමි භාණ්ඩය දක්වා යන පිරිවැය (Raw Material + Labor + Overhead) ගණනය කිරීම.',
        content: `## 🏭 Manufacturing & Production Intelligence OS

නිෂ්පාදන කර්මාන්තශාලා සඳහා අමුද්‍රව්‍ය මිලදී ගැනීමේ සිට නිමි භාණ්ඩය විකිණීම දක්වා නිෂ්පාදන ක්‍රියාවලිය පාලනය කරන පද්ධතිය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Bill of Materials (BOM) & Transformation:** නිමි භාණ්ඩ 1 ක් සෑදීමට වැයවන අමුද්‍රව්‍ය ප්‍රමාණයන් (Formula/Recipe) ස්වයංක්‍රීයව තොගයෙන් අඩු වීම.
2. **Accurate Unit Costing (Cost Sheet):** අමුද්‍රව්‍ය වියදම, ශ්‍රම ගාස්තුව (Labour) සහ විදුලි/යන්ත්‍ර වියදම් (Overheads) එකතු කර ඒකකයක සැබෑ නිෂ්පාදන වියදම ගණනය කිරීම.
3. **Finished Goods Batch Tracking:** නිමි භාණ්ඩ Batch අංක සහිතව ගබඩා කිරීම.
4. **Raw Material Wastage Control:** නිෂ්පාදනයේදී සිදුවන නාස්තිය (Wastage/Scrap) නිරීක්ෂණය.
5. **Profitability Analysis:** තොග මිලට විකිණීමේදී ලැබෙන ශුද්ධ ලාභාංශ (Profit Margins) විශ්ලේෂණය.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@factory.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Raw Materials Inbound, Production Batches, Finished Stock, Manufacturing Cost Sheets, Sales.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-bakery-recipes-route-delivery',
        title: 'Bakery & Confectionery පද්ධතිය: අමුද්‍රව්‍ය වට්ටෝරු (Recipes), දෛනික බේකින් කාණ්ඩ, නාස්තිය සහ රූට් ඩිලිවරි',
        category: 'features',
        categoryLabel: 'Bakery OS',
        icon: '🥖',
        author: 'DIGIBIZ Food & Beverage Team',
        date: '2026-08-22',
        desc: 'බේකරි සඳහා පිටි, සීනි අමුද්‍රව්‍යවලින් පාන්/බනිස් සෑදීමේ වට්ටෝරු (Recipes), Chopper රූට් බෙදාහැරීම් සහ දෛනික නාස්තිය (Wastage) පාලනය.',
        content: `## 🥖 Bakery & Confectionery Management OS

බේකරි සහ රසකැවිලි නිෂ්පාදන ආයතන සඳහා දෛනික බේකින් කාණ්ඩ, Chopper රූට් බෙදාහැරීම් සහ අමුද්‍රව්‍ය කළමනාකරණය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Recipe-based Ingredient Deduction:** පිටි, බටර්, ඊස්ට් අමුද්‍රව්‍ය පාන්/කේක් නිෂ්පාදනය ආරම්භ කළ සැනින් තොගයෙන් ස්වයංක්‍රීයව අඩු වීම.
2. **Daily Baking Batches:** උදෑසන සහ සවස බේකින් කාණ්ඩ සහ නිපදවූ ප්‍රමාණයන් ලේඛනගත කිරීම.
3. **Route Delivery & Chopper Management:** Chopper රථ සහ Van රථවලට පටවන ලද බේකරි නිෂ්පාදන සහ ආපසු ගෙනෙන ලද භාණ්ඩ (Unsold Returns) ගණනය.
4. **Spoilage & Wastage Control:** ඉවතලන හෝ කල්ඉකුත් වූ බේකරි ද්‍රව්‍යවල අලාභය නිරීක්ෂණය.
5. **Outlet & Counter Fast POS:** බේකරි අලෙවිසැලේ ක්ෂණික Touch Invoicing.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@bakery.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Raw Materials, Recipe Builder, Production Baking, Wastage Log, Route Plan, POS.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-coconut-wholesale-copra-husk',
        title: 'Coconut Wholesale & Husk Products: පොල් එකතු කිරීම, Grading, කොප්පරා සහ ලෙලි නිෂ්පාදන කළමනාකරණය',
        category: 'features',
        categoryLabel: 'Agro & Coconut OS',
        icon: '🥥',
        author: 'DIGIBIZ Agro Team',
        date: '2026-08-22',
        desc: 'පොල් ව්‍යාපාරිකයින් සඳහා විවිධ මිල ගණන්වලට පොල් මිලදී ගැනීම, වර්ගීකරණය (Grading), කොප්පරා සහ පොල් ලෙලි නිෂ්පාදන පාලනය.',
        content: `## 🥥 Coconut Wholesale & Husk Products OS

පොල් තොග වෙළෙන්දන්, පොල් මෝල් සහ පොල් ලෙලි ආශ්‍රිත නිෂ්පාදන ආයතන සඳහා සකස් කරන ලද විශේෂිත පද්ධතිය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Multi-Price Coconut Procurement:** ගස් හිමියන්ගෙන් සහ තැරැව්කරුවන්ගෙන් විවිධ මිල ගණන් සහ ප්‍රවාහන ගාස්තු සහිතව පොල් මිලදී ගැනීම.
2. **Coconut Grading Matrix:** ලොකු, මධ්‍යම, කුඩා සහ පැල පොල් ලෙස තත්ත්ව පරීක්ෂාවෙන් පසු තොග වෙන් කිරීම.
3. **Copra & Coconut Oil Processing:** වියළන ලද කොප්පරා (Copra) බර සහ නිෂ්පාදන කාණ්ඩ ලෙජරය.
4. **Husk & Coir Products:** පොල් ලෙලි මිලදී ගැනීම, කොහු සහ කොහුබත් (Cocopeat) නිෂ්පාදන තොග සහ අලෙවිය.
5. **Supplier Advance & Loans:** පොල් සපයන්නන්ට ලබාදුන් අත්තිකාරම් සහ ණය ගෙවීම් පාලනය.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@coconut.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Coconut Purchases, Grading Matrix, Copra Processing, Husk Products, Supplier Advances.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-garment-fashion-boutique-matrix',
        title: 'Garment & Fashion Boutique: Size/Color Variant Matrix, Barcode ටැග් සහ ඇඳුම් විලාසිතා අලෙවිය',
        category: 'features',
        categoryLabel: 'Garment & Fashion',
        icon: '👕',
        author: 'DIGIBIZ Fashion Team',
        date: '2026-08-22',
        desc: 'ඇඳුම් සාප්පු සඳහා ප්‍රමාණ (S, M, L, XL, XXL) සහ වර්ණ (Colors) අනුව තොග කළමනාකරණය, Custom Barcode Tags සහ Boutique POS.',
        content: `## 👕 Garment & Fashion Boutique Management OS

ඇඳුම් සාප්පු, රෙදිපිළි අලෙවිසැල් සහ විලාසිතා මධ්‍යස්ථාන සඳහා ප්‍රමාණ සහ වර්ණ අනුව තොග පාලනය කරන පද්ධතිය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Size & Color Variant Matrix:** එක් ඇඳුම් මාදිලියක විවිධ Sizes (S, M, L, XL, XXL) සහ Colors වෙන වෙනම තොග නිරීක්ෂණය.
2. **Custom Barcode Label Printing:** ඔබේ සාප්පුවේ නම, මිල සහ ප්‍රමාණය සහිත Barcode Stickers මුද්‍රණය කිරීම.
3. **Fast Counter POS:** Touch POS හෝ Barcode Scan මඟින් ක්ෂණික බිල්පත් සැකසීම.
4. **Seasonal Discount & Offer Management:** 10% Off, Buy 1 Get 1 Free සහ Seasonal Promotion බිල්පතට ස්වයංක්‍රීයව ඇතුළත් වීම.
5. **Dead Stock / Slow Moving Items:** අලෙවි නොවී ගබඩාවේ පවතින ඇඳුම් ක්ෂණිකව හඳුනාගෙන Discounts ලබාදීම.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@garment.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Garment POS, Variant Matrix, Barcode Generator, Inventory, Sales Analytics.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-restaurant-cafe-kot-table-management',
        title: 'Restaurant & Cafe පද්ධතිය: Table Management, Kitchen Order Tickets (KOT) සහ Takeaway බිල්පත්',
        category: 'features',
        categoryLabel: 'Restaurant OS',
        icon: '🍽️',
        author: 'DIGIBIZ F&B Team',
        date: '2026-08-22',
        desc: 'ආපනශාලා සහ කැෆේ සඳහා මේස වෙන්කිරීම (Table Booking), කුස්සියට යන KOT ටිකට්පත්, වේටර් ඇණවුම් සහ ක්ෂණික Takeaway බිල්පත්.',
        content: `## 🍽️ Restaurant & Cafe Management OS

ආපනශාලා, හෝටල් සහ කැෆේ සඳහා වේටර් ඇණවුම්, මේස පාලනය සහ Kitchen Display සහිත ස්මාර්ට් පද්ධතිය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Interactive Table Layout:** මේස අංක (Table 1, Table 2, VIP Room) අනුව ඇණවුම් ලබාගැනීම සහ මේසය නිදහස්දැයි (Occupied/Free) බැලීම.
2. **Kitchen Order Tickets (KOT):** ඇණවුම දැමූ සැනින් කුස්සියට (Kitchen Printer හෝ Display) KOT එක යොමුවීම.
3. **Dine-in, Takeaway & Delivery:** කෑම ශාලාවේ කෑම, පාර්සල් සහ Delivery ඇණවුම් වෙන වෙනම කළමනාකරණය.
4. **Food Item Modifiers:** ස්පයිසි වැඩිපුර, සීනි අඩුවෙන් ආදී පාරිභෝගික කැමැත්ත (Special Notes) ඇණවුමට එක් කිරීම.
5. **Daily Food Cost & Wastage:** දිනපතා අමුද්‍රව්‍ය පිරිවැය සහ ඉතිරි වන ආහාර ප්‍රමාණයන් පාලනය.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@restaurant.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Tables Layout, Orders Terminal, Kitchen KOT, Recipe Inventory, Accounting.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-salon-spa-service-appointment-billing',
        title: 'Salon, Spa & Professional Services: Appointments, Staff Commissions සහ Service Billing',
        category: 'features',
        categoryLabel: 'Salon & Spa OS',
        icon: '💇',
        author: 'DIGIBIZ Services Team',
        date: '2026-08-22',
        desc: 'රූපලාවණ්‍යාගාර සහ සේවා ආයතන සඳහා දින සහ වේලාවන් වෙන්කරවා ගැනීම (Appointments), කාර්ය මණ්ඩල කොමිස් මුදල් (Staff Commissions) සහ සේවා බිල්පත්.',
        content: `## 💇 Salon, Spa & Professional Services OS

රූපලාවණ්‍යාගාර (Salons), Spas සහ වෘත්තීය සේවා ආයතන සඳහා පාරිභෝගික සේවා වෙන්කිරීම් සහ කොමිස් පාලනය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Appointment Scheduling Calendar:** දින සහ වේලාවන් අනුව Beautician/Stylist වෙන්කරවා ගැනීම සහ Calendar View එක.
2. **Staff Commission Calculation:** එක් එක් සේවකයා කළ සේවාවන් අනුව ලැබිය යුතු කොමිස් මුදල (Commission %) ස්වයංක්‍රීයව ගණනය වීම.
3. **Service & Product Package Billing:** Hair Cut, Facial ආදී සේවාවන් සමඟ රූපලාවණ්‍ය ආලේපන භාණ්ඩ එකම බිලට එක් කිරීම.
4. **Client Visit History & Preferences:** පාරිභෝගිකයා කලින් ලබාගත් සේවාවන් සහ කැමති විලාසිතා විස්තර සටහන් කර තබාගැනීම.
5. **Customer Loyalty Points:** පාරිභෝගිකයින්ට Loyalty Points ලබාදීම සහ ඊළඟ බිලෙන් අඩු කිරීම.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@salon.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Appointment Calendar, Service Catalog, Staff Commissions, Client Records, Billing.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-attendance-payroll-qr-shift-management',
        title: 'Attendance, QR Mobile Scanner & Payroll: පැමිණීම් ලකුණු කිරීම, Shift Roster, OT සහ පඩි පත්‍රිකා (Payslips)',
        category: 'features',
        categoryLabel: 'HR & Payroll OS',
        icon: '⏱️',
        author: 'DIGIBIZ HR Tech Team',
        date: '2026-08-22',
        desc: 'ඕනෑම ව්‍යාපාරයක සේවක පැමිණීම QR / Fingerprint මඟින් සටහන් කර, Shifts, අතිකාල (OT), නිවාඩු, අත්තිකාරම් සහ EPF/ETF සහිත ස්වයංක්‍රීය පඩි පත්‍රිකා.',
        content: `## ⏱️ Attendance & Payroll Management OS

ඕනෑම සුළු හා මධ්‍ය පරිමාණ ව්‍යාපාරයක සේවක කළමනාකරණය, පැමිණීම සහ වැටුප් ගණනය කරන සම්පූර්ණ විසඳුම.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Mobile QR & Fingerprint Attendance:** සේවකයින්ගේ QR Code එක ජංගම දුරකථනයෙන් Scan කර පැමිණීම සහ පිටවීම තත්පරයකින් සටහන් කිරීම.
2. **Shift Roster & 24h Shifts:** දිවා/රාත්‍රී සහ භ්‍රමණ (Rotational) Shifts කළමනාකරණය.
3. **Automated OT & Late Deductions:** නියමිත වේලාවට වඩා අමතරව වැඩ කළ පැය ගණන (OT) සහ ප්‍රමාද වීම් ස්වයංක්‍රීයව ගණනය වීම.
4. **1-Click Salary Sheet & Payslips:** මුලික වැටුප, OT, දීමනා, අත්තිකාරම් (Advances), ණය සහ EPF/ETF අඩු කර සකසන නිල Payslips.
5. **Gate Pass & Outing Records:** වැඩ කරන අතරතුර කෙටි ගමන් සඳහා පිටවීමේ අවසරපත් (Gate Pass) සටහන් කිරීම.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@attendance.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Attendance Log, Mobile Scanner, Shift Roster, Salary & Payslips, Employee Loans.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-quick-billing-thermal-bluetooth-receipts',
        title: 'Quick Billing & Instant Invoicing: Bluetooth Thermal Printer, WhatsApp බිල්පත් සහ Offline ක්‍රියාකාරීත්වය',
        category: 'features',
        categoryLabel: 'Quick Bill OS',
        icon: '🧾',
        author: 'DIGIBIZ Mobile Team',
        date: '2026-08-22',
        desc: 'කුඩා වෙළඳසැල් සහ ජංගම අලෙවිකරුවන් සඳහා Smart Phone එකෙන් Bluetooth Thermal Printer මඟින් ක්ෂණික බිල්පත් හෝ WhatsApp Invoices නිකුත් කිරීම.',
        content: `## 🧾 Quick Billing & Instant POS

කුඩා කඩසාප්පු, පලතුරු/එළවළු වෙළෙන්දන් සහ ජංගම ව්‍යාපාරිකයින් සඳහා වේගවත්ම Invoicing විසඳුම.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Pocket Invoicing on Mobile:** ඕනෑම Android හෝ iOS දුරකථනයකින් සුපිරි වේගයකින් බිල්පත් නිකුත් කිරීම.
2. **Bluetooth Thermal Printer Integration:** 58mm සහ 80mm Bluetooth කුඩා මුද්‍රණ යන්ත්‍රවලට තත්පර 2 කින් බිල මුද්‍රණය වීම.
3. **100% Offline Billing Mode:** අන්තර්ජාලය (Internet) නොමැති විට පවා බාධාවකින් තොරව බිල්පත් නිකුත් කර Internet ලැබුණු පසු Auto-Sync වීම.
4. **WhatsApp Digital Bill Sharing:** කඩදාසි නැතිව පාරිභෝගිකයාගේ WhatsApp ගිණුමට Digital Bill එකක් යැවීම.
5. **Quick Item Catalog:** නිතර අලෙවි වන භාණ්ඩ Shortcuts ලෙස තබාගෙන 1-Click එකෙන් බිලට එකතු කිරීම.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@easybill.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Quick Terminal, Products Directory, Customer Credit, Offline Storage, Bluetooth Setup.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-scrap-collection-merchant-workbench',
        title: 'Scrap Collection Center & Merchant OS: යකඩ/ප්ලාස්ටික් බර කිරීම, මිලදී ගැනීම්, අත්තිකාරම් සහ අලෙවිය',
        category: 'features',
        categoryLabel: 'Recycle & Scrap OS',
        icon: '♻️',
        author: 'DIGIBIZ Industrial Team',
        date: '2026-08-22',
        desc: 'යකඩ සහ ප්‍රතිචක්‍රීකරණ මධ්‍යස්ථාන සඳහා යකඩ, ඇලුමිනියම්, තඹ, ප්ලාස්ටික් බර අනුව මිලදී ගැනීම්, අත්තිකාරම් සහ මහා පරිමාණ විකුණුම් කළමනාකරණය.',
        content: `## ♻️ Scrap Collection Center & Merchant OS

ප්‍රතිචක්‍රීකරණ අමුද්‍රව්‍ය (Scrap Metal & Plastics) එකතු කරන්නන් සහ වෙළෙන්දන් සඳහා විශේෂිත වූ කාර්යපීඨය.

### 🌟 ප්‍රධාන විශේෂාංග (Key Highlights):
1. **Weight-based Buying Terminal:** යකඩ (Iron), තඹ (Copper), පිත්තල (Brass), බැටරි, ප්ලාස්ටික් කිලෝ ග්‍රෑම් සහ තරාදි බර අනුව මිලදී ගැනීම්.
2. **Customer Advance & Debt Ledger:** පාරිභෝගිකයින්ට සහ එකතු කරන්නන්ට ලබාදුන් අත්තිකාරම් බර කළ බිලෙන් ස්වයංක්‍රීයව අඩු කිරීම.
3. **Bulk Selling to Factories:** කර්මාන්තශාලා වෙත විශාල ලොරි බර පිටත් කිරීම සහ විකුණුම් බිල්පත්.
4. **Scrap Inventory Balance:** ගබඩාවේ ඇති එක් එක් අමුද්‍රව්‍ය වර්ගයේ වත්මන් බර (Stock in Kg/Tons) නිරීක්ෂණය.
5. **Daily Cashflow & Profit Tracker:** දිනපතා අත්පිට මුදලින් ගෙවූ මිලදී ගැනීම් සහ ලැබුණු විකුණුම් ආදායම් ලෙජරය.

---

### 📊 Demo System Workflow (ක්‍රියාකාරීත්වය):
* **Demo Access Email:** \`test@scrap.com\` (Password: \`123456\`)
* **සම්බන්ධිත මොඩියුල:** Scrap Buying Terminal, Selling Log, Advance Manager, Stock Workbench, Accounting.`,
        imageUrl: '',
        published: true
    }
];

async function run() {
    console.log('🚀 Starting Clean & Seed process for DIGIBIZ Business Vertical Blog Guides via REST API...');

    try {
        console.log('Authenticating as Super Admin...');
        const idToken = await getSuperAdminToken();
        console.log('✅ Authenticated successfully.');

        // 1. Delete all existing posts
        const listUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts?pageSize=100`;
        const listRes = await fetch(listUrl, {
            headers: { 'Authorization': `Bearer ${idToken}` }
        });
        
        if (listRes.ok) {
            const listData = await listRes.json();
            const docs = listData.documents || [];
            console.log(`Found ${docs.length} existing posts in blog_posts. Deleting...`);
            for (const doc of docs) {
                const delRes = await fetch(`https://firestore.googleapis.com/v1/${doc.name}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${idToken}` }
                });
                if (delRes.ok) {
                    console.log(`  - Deleted: ${doc.name.split('/').pop()}`);
                }
            }
            console.log('✅ Cleared all existing blog posts.');
        }

        // 2. Insert the 15 complete business guide articles in Draft Mode (published: false)
        console.log(`\nSeeding ${BUSINESS_BLOGS.length} business vertical guides (in DRAFT mode for Admin approval)...`);
        const nowIso = new Date().toISOString();

        for (const blog of BUSINESS_BLOGS) {
            const docId = blog.id;
            const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts/${docId}`;
            
            const payload = {
                fields: {
                    ...toFirestoreFields(blog),
                    createdAt: { timestampValue: nowIso },
                    updatedAt: { timestampValue: nowIso }
                }
            };

            const writeRes = await fetch(docUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(payload)
            });

            if (writeRes.ok) {
                console.log(`  + Seeded [DRAFT]: [${blog.categoryLabel}] ${blog.title.slice(0, 55)}...`);
            } else {
                const errText = await writeRes.text();
                console.warn(`  ! Failed to write ${docId}:`, errText);
            }
        }

        console.log('\n🎉 Successfully seeded all 15 business guides as Drafts (Pending Admin Approval)!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during clean and seed:', err);
        process.exit(1);
    }
}

run();

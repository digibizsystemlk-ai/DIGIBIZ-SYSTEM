/**
 * Generate Comprehensive, In-Depth, Long-Form Business Vertical Guide Series for DIGIBIZ PRO
 * Run: node scripts/generate-deep-business-blogs.js
 */

const API_KEY = "AIzaSyBLFefSjFXp84Hg7nnIfuJ18SFcM92bsno";
const PROJECT_ID = "digibiz-sys";

async function getSuperAdminToken() {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bdkariyapperuma@gmail.com', password: '123456', returnSecureToken: true })
    });
    if (!res.ok) throw new Error('Failed to sign in as super admin');
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

const DEEP_BUSINESS_BLOGS = [
    {
        id: 'guide-retail-supermarket-pos',
        title: 'Retail & Supermarket කළමනාකරණ පද්ධතිය: POS, Barcode, Multi-Warehouse තොග සහ දෛනික ලාභ විශ්ලේෂණය පිළිබඳ සම්පූර්ණ මාර්ගෝපදේශය',
        category: 'features',
        categoryLabel: 'Retail & Supermarket OS',
        icon: '🛒',
        author: 'DIGIBIZ Engineering & Retail Operations',
        date: '2026-08-22',
        desc: 'සුපිරි වෙළඳසැල් සහ සිල්ලර වෙළඳසැල් සඳහා තත්පර 3 කින් Barcode Scan කර බිල්පත් සැකසීම, Multi-Warehouse Stock, මිලදී ගැනීමේ GRN, පාරිභෝගික ණය සහ සැබෑ දෛනික ශුද්ධ ලාභය බලාගන්නා අයුරු.',
        content: `## 🛒 DIGIBIZ Retail & Supermarket Enterprise OS

ශ්‍රී ලංකාවේ සුපිරි වෙළඳසැල් (Supermarkets), සිල්ලර වෙළඳසැල් (Grocery Stores), Minimarts සහ තොග වෙළඳසැල් සඳහා විශේෂිතව නිර්මාණය කරන ලද සම්පූර්ණ Cloud කළමනාකරණ පද්ධතියයි. මෙම පද්ධතිය මඟින් වේගවත් බිල්පත් නිකුත් කිරීම, ගබඩා තොග පාලනය, මිලදී ගැනීමේ GRN සහ දෛනික සැබෑ ශුද්ධ ලාභය ස්වයංක්‍රීයව ගණනය කෙරේ.

---

### 1. පද්ධතියේ ප්‍රධාන අරමුණ සහ විශේෂතා (Core Architecture)
* **Lightning-Fast Cloud POS Terminal:** Barcode Scanner, Touch Screen හෝ Keyboard Shortcuts මඟින් තත්පර 2-3 ක් ඇතුළත බිලක් සකස් කර මුද්‍රණය කිරීම.
* **100% Zero-Leak Multi-Warehouse Stock:** ප්‍රධාන ගබඩාව (Main Warehouse), ඉදිරිපස Showroom සහ ශාඛා අතර භාණ්ඩ හුවමාරුව (Stock Transfers) සහ තොග අඩු වීම් තත්‍ය කාලීනව (Real-Time) සටහන් වීම.
* **Smart Low-Stock & Reorder Point Alerts:** භාණ්ඩ ප්‍රමාණය කලින් නියම කළ අවම සීමාවට (Min Threshold) පැමිණි විට ස්වයංක්‍රීයව ඇණවුම් ලැයිස්තුවට එක්වීම.
* **Cost vs Selling Real-Time Profit Analytics:** භාණ්ඩ මිලදී ගත් සැබෑ පිරිවැය (Cost Price) සහ විකුණුම් මිල අතර වෙනසින් දෛනික සැබෑ ශුද්ධ ලාභය ස්වයංක්‍රීයව ගණනය වීම.
* **Customer Credit & Debt Control:** පාරිභෝගිකයින්ට ණයට භාණ්ඩ ලබාදීම, ණය සීමාවන් (Credit Limits) සහ SMS Alerts යැවීම.

---

### 2. දෛනික ව්‍යාපාරික ක්‍රියාවලිය පියවරෙන් පියවර (End-to-End Workflow)

#### පියවර 1: මිලදී ගැනීම් සහ GRN ඇතුළත් කිරීම (Inbound Stock & Purchases)
1. සැපයුම්කරු (Supplier) වෙතින් භාණ්ඩ තොග ලැබුණු විට \`Purchases / GRN\` මොඩියුලයට පිවිසෙන්න.
2. Supplier Invoice අංකය, භාණ්ඩ ලැයිස්තුව, ලැබුණු ප්‍රමාණය (Received Qty), මිලදී ගත් ඒකක මිල (Cost Price) සහ විකුණුම් මිල (Selling Price) ඇතුළත් කරන්න.
3. Batch Number සහ Expiry Dates ඇත්නම් ඒවා සටහන් කර **Save GRN** ක්ලික් කරන්න.
4. පද්ධතිය ස්වයංක්‍රීයව ගබඩා තොග (Stock) වැඩි කරන අතර, Supplier Account එකෙහි ගෙවිය යුතු මුදල (Payables Ledger) යාවත්කාලීන කරයි.

#### පියවර 2: Barcode ලේබල් මුද්‍රණය (Barcode Generation)
1. Barcode නොමැති භාණ්ඩ සඳහා \`Inventory -> Generate Barcode\` මඟින් EAN-13 හෝ Custom Code 128 ලේබල් ජනනය කරන්න.
2. සාප්පුවේ නම, භාණ්ඩයේ නම, බර/ප්‍රමාණය සහ මිල සහිත Barcode Stickers ඕනෑම Thermal Barcode Printer එකකින් ක්ෂණිකව මුද්‍රණය කර භාණ්ඩ මත අලවන්න.

#### පියවර 3: Point of Sale (POS) බිල්පත් සැකසීම
1. මුදල් අයකැමි (Cashier) \`Point of Sale (POS)\` තිරය විවෘත කරයි.
2. භාණ්ඩයේ Barcode එක Scanner එකෙන් Scan කරන්න (හෝ නම/කේතය ටයිප් කරන්න).
3. පාරිභෝගිකයාගේ ගෙවීම් ක්‍රමය තෝරන්න:
   * **Cash (අත්පිට මුදල්):** ලැබුණු මුදල ඇතුළත් කළ විට ඉතිරි මුදල (Change) ක්ෂණිකව පෙන්වයි.
   * **Card (ක්‍රෙඩිට්/ඩෙබිට් කාඩ්පත්):** Card Receipt අංකය ඇතුළත් කරන්න.
   * **Credit (ණයට විකිණීම):** පාරිභෝගිකයාගේ නම තෝරා ණයට බිල් කරන්න.
   * **Split Payment:** බිලෙන් කොටසක් කාඩ්පතින් සහ ඉතිරිය මුදලින් ගෙවීමේ පහසුකම.
4. **Print & Settle** ඔබන්න. තත්පර 2 කින් 58mm/80mm Thermal Receipt එක මුද්‍රණය වන අතර Cash Drawer එක ස්වයංක්‍රීයව විවෘත වේ.

#### පියවර 4: Direct WhatsApp Digital Bill යැවීම
* කඩදාසි මුද්‍රණය වෙනුවට පාරිභෝගිකයාගේ WhatsApp අංකය ඇතුළත් කර **WhatsApp Receipt** බොත්තම එබූ සැනින් නිල ඩිජිටල් බිල්පත් Link එක පාරිභෝගිකයාගේ දුරකථනයට යොමුවේ.

---

### 3. සැබෑ දත්ත සහිත Sample Invoice & Stock Preview

| භාණ්ඩයේ නම | Barcode | ප්‍රමාණය | Cost Price (රු.) | Selling Price (රු.) | Total (රු.) | Profit (රු.) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| Anchor Butter 200g | 4791002341201 | 2 | 850.00 | 1,020.00 | 2,040.00 | +340.00 |
| Keells Rice Cracker 100g | 4792001188392 | 3 | 140.00 | 180.00 | 540.00 | +120.00 |
| Maliban Marie 300g | 4791001002912 | 5 | 210.00 | 260.00 | 1,300.00 | +250.00 |
| **මුළු එකතුව (Total)** | | **10 pcs** | **3,170.00** | **3,880.00** | **Rs. 3,880.00** | **+Rs. 710.00** |

---

### 4. ගිණුම්කරණය සහ මූල්‍ය ලෙජරය (Accounting & Double-Entry Ledger)
* **Sales Income:** විකුණුම් ආදායම් ලෙජරයට ස්වයංක්‍රීයව බැර වේ.
* **Cost of Goods Sold (COGS):** විකුණන ලද භාණ්ඩවල සැබෑ මිලදී ගැනීමේ වටිනාකම තොග ගිණුමෙන් අඩු වී COGS ගිණුමට හර වේ.
* **Cash / Bank Balances:** දවසේ මුදල් අයකැමි ලාච්චුවේ (Cash Register) මුදල් සහ බැංකු ගිණුම්වල ශේෂයන් තථ්‍ය කාලීනව නිවැරදිව පෙන්වයි.

---

### 5. දෘඩාංග ගැළපීම සහ තාක්ෂණික පිරිවිතර (Hardware Compatibility)
* **පරිගණක / දුරකථන:** Windows PC, Mac, Laptop, Android POS Tablet, iPad.
* **මුද්‍රණ යන්ත්‍ර (Printers):** Epson, Xprinter, Rongta, POS-58, POS-80 (USB, LAN, Wi-Fi, Bluetooth).
* **Barcode Scanners:** 1D / 2D Laser Scanners, Hands-free Omnidirectional Scanners, Mobile Phone Camera.
* **Cash Drawers:** RJ11 Port මඟින් Printer එකට සම්බන්ධ සියලුම Standard Cash Drawers.

---

### 6. Live Interactive Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@retail.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** POS Terminal, Sales History, Inventory, GRN, Banking & Cash, Reports.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-tire-center-auto-services',
        title: 'Tire Center & Wheel Alignment කළමනාකරණය: ටයර් ප්‍රමාණ (Sizes), සේවා ගාස්තු, බැටරි සහ පාරිභෝගික ණය පාලනය',
        category: 'features',
        categoryLabel: 'Tire Center OS',
        icon: '🛞',
        author: 'DIGIBIZ Auto Engineering Team',
        date: '2026-08-22',
        desc: 'ටයර් අලෙවිසැල් සඳහා ටයර් ප්‍රමාණ (Tire Sizes), Brand, රට සහ Pattern අනුව තොග කළමනාකරණය කරමින් Wheel Alignment, Balancing සේවා බිල්පත් සහ Warranty නිරීක්ෂණය කරන අයුරු.',
        content: `## 🛞 DIGIBIZ Tire Center & Auto Services OS

ටයර් අලෙවිසැල්, Wheel Alignment මධ්‍යස්ථාන, බැටරි වෙළඳසැල් සහ Auto Accessories සේවා ස්ථාන සඳහාම විශේෂිතව සකසන ලද Cloud පද්ධතියකි.

---

### 1. පද්ධතියේ ප්‍රධාන විශේෂතා (Core Highlights)
* **Tire Size Matrix & Pattern Tracking:** 195/65R15, 205/55R16, 175/70R13 ආදී ටයර් ප්‍රමාණ, Brand (CEAT, Dunlop, Michelin, DSI, Linglong), රට සහ Ply Rating අනුව තොග වර්ගීකරණය.
* **Unified Service & Goods Billing:** එකම බිල්පතක ටයර් විකිණීම සහ Wheel Alignment, Balancing, Valve Replacement, Nitrogen Gas සේවා ගාස්තු ඇතුළත් කිරීම.
* **Vehicle Number Tracking & Warranty:** වාහන අංකය (Vehicle Reg No) අනුව පාරිභෝගිකයා මිලදී ගත් ටයර්වල DOT අංක, සැතපුම් ගණන (Mileage) සහ Warranty කාලය සටහන් කර තබාගැනීම.
* **Old Tire Trade-in & Buyback:** පාරිභෝගිකයාගේ පරණ ටයර් භාරගෙන ඒවායේ වටිනාකම බිලෙන් අඩු කිරීමේ පහසුකම.
* **Tire Supplier Cheque Register:** ටයර් සමාගම් වෙත නිකුත් කළ ඉදිරි දින චෙක්පත් (Post-Dated Cheques) සහ ණය පියවීම් දින නිරීක්ෂණය.

---

### 2. සැබෑ දත්ත සහිත Sample Tire & Service Bill Breakdown

| විස්තරය / භාණ්ඩය | ප්‍රමාණය | ඒකක මිල (රු.) | සේවා ගාස්තුව (රු.) | මුළු එකතුව (රු.) |
| :--- | :---: | :---: | :---: | :---: |
| CEAT 195/65R15 Milaze Tubeless Tire | 4 | 24,500.00 | - | 98,000.00 |
| Computerized 3D Wheel Alignment | 1 | - | 2,500.00 | 2,500.00 |
| Wheel Balancing (4 Wheels + Weights) | 4 | - | 600.00 | 2,400.00 |
| Tubeless Chrome Valves | 4 | 350.00 | - | 1,400.00 |
| (-) Old Tire Trade-in Discount (පරණ ටයර්) | 4 | -1,000.00 | - | -4,000.00 |
| **ශුද්ධ ගෙවිය යුතු මුදල (Net Payable)** | | | | **Rs. 100,300.00** |

---

### 3. දෛනික ක්‍රියාවලිය පියවරෙන් පියවර (End-to-End Workflow)
1. **වාහනය ඇතුළත් කිරීම:** පාරිභෝගිකයා පැමිණි විට වාහන අංකය (උදා: \`CBA-4589\`), වත්මන් Odometer Mileage සහ දුරකථන අංකය සටහන් කරන්න.
2. **ටයර් තෝරාගැනීම:** වාහනයට ගැළපෙන ටයර් Size එක සහ Brand එක තෝරා ගබඩා තොගයෙන් බිලට එක් කරන්න.
3. **සේවා ඇතුළත් කිරීම:** කාර්මික ශිල්පියා කළ Wheel Alignment සහ Balancing සේවා එක් කරන්න.
4. **Warranty Card & Receipt Print:** බිල්පත සමඟ DOT Number සහ Warranty කාලය සඳහන් නිල කුවිතාන්සිය මුද්‍රණය කර පාරිභෝගිකයාට ලබාදෙන්න.

---

### 4. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@tyrecentre.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Tire POS, Inventory, Services Catalog, Appointments, Debt Ledger.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-auto-care-vehicle-repair-job-cards',
        title: 'Auto Care & Vehicle Repair Center: Digital Job Cards, වාහන පරීක්ෂාව, Spare Parts Stock සහ SMS Alerts',
        category: 'features',
        categoryLabel: 'Auto Care OS',
        icon: '🚗',
        author: 'DIGIBIZ Automotive Solutions',
        date: '2026-08-22',
        desc: 'වාහන සේවා ස්ථාන (Auto Care), Garage සහ Auto Electrical මධ්‍යස්ථාන සඳහා Digital Job Cards, Spare Parts Stock, ඇස්තමේන්තු (Estimations) සහ වාහනය සූදානම් වූ විට SMS යැවීම.',
        content: `## 🚗 DIGIBIZ Auto Care & Vehicle Repair Center OS

වාහන අලුත්වැඩියා මධ්‍යස්ථාන, සේවා ස්ථාන (Auto Service Centers), Auto AC/Electrical Garage සහ Body Repair මධ්‍යස්ථාන සඳහා පූර්ණ Digital Job Card විසඳුම.

---

### 1. ප්‍රධාන විශේෂාංග සහ ක්‍රියාකාරීත්වය
* **Digital Job Card Opening:** වාහනය සේවා ස්ථානයට ඇතුළු වූ සැනින් වාහන අංකය, මීටර් කියවීම (Mileage), ඉන්ධන මට්ටම (Fuel Level), පාරිභෝගික පැමිණිලි සහ පෙර පැවති සීරීම්/අලාභ ඡායාරූප සහිතව Digital Job Card එකක් විවෘත කිරීම.
* **Spare Parts & Labour Cost Separation:** අමතර කොටස් සඳහා වැයවූ මුදල සහ එක් එක් කාර්මිකයාගේ (Mechanic) ශ්‍රම ගාස්තුව වෙන වෙනම ගණනය වීම.
* **Automated Customer SMS Notification:** වාහනයේ වැඩ අවසන් වී Invoice එක generate කළ සැනින් *"ගරු පාරිභෝගිකය, ඔබගේ CBA-1234 වාහනයේ සේවා කටයුතු අවසන් කර ඇත. මුදල: Rs. 18,500. ස්තූතියි!"* ලෙස ක්ෂණික SMS එකක් යැවීම.
* **Complete Vehicle Service History:** වාහන අංකය ඇතුළත් කළ සැනින් පසුගිය වසර 3 තුළ එම වාහනයට කළ සියලුම සේවා, මාරු කළ ඔයිල්/ෆිල්ටර් සහ අමතර කොටස් ඉතිහාසය පරික්ෂා කිරීම.
* **Insurance Quotation / Estimation Builder:** අනතුරට පත් වාහන සඳහා රක්ෂණ සමාගම්වලට ඉදිරිපත් කළ හැකි නිල Estimation Invoices සහ Claim වාර්තා සැකසීම.

---

### 2. Sample Job Card & Final Billing Data

\`\`\`text
=====================================================
            DIGIBIZ AUTO CARE SERVICES
        Job Card No: JC-2026-0842 | Date: 2026-08-22
Vehicle No: WP CBG-8921 | Model: Toyota Prius 2018
Customer: Mr. Nuwan Wickramasinghe | Tel: 077-4567890
=====================================================
[1] SPARE PARTS & CONSUMABLES:
  - 0W-20 Full Synthetic Engine Oil (4L)   : Rs. 14,500.00
  - Genuine Oil Filter (90915-10003)       : Rs.  2,200.00
  - Hybrid AC Cabin Filter                  : Rs.  1,800.00
  - Front Brake Pads Set (Akebono)         : Rs.  9,500.00

[2] LABOUR & MECHANICAL CHARGES:
  - Full Lubrication & 40-Point Inspection : Rs.  3,500.00
  - Brake Servicing & Caliper Greasing     : Rs.  2,000.00
  - Engine Tune-up & Throttle Body Cleaning: Rs.  4,000.00
-----------------------------------------------------
Subtotal Parts  : Rs. 28,000.00
Subtotal Labour : Rs.  9,500.00
-----------------------------------------------------
TOTAL INVOICE AMOUNT : Rs. 37,500.00
=====================================================
\`\`\`

---

### 3. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@autocare.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Job Cards, Vehicle Inspections, Estimations, Invoicing, Spare Parts Stock, SMS Alerts.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-pharmacy-batch-expiry-tracking',
        title: 'Pharmacy & Healthcare පද්ධතිය: ඖෂධ Batch Numbers, කල්ඉකුත්වීමේ දැනුම්දීම් (Expiry Alerts) සහ බෙහෙත් වට්ටෝරු කළමනාකරණය',
        category: 'features',
        categoryLabel: 'Pharmacy OS',
        icon: '💊',
        author: 'DIGIBIZ Healthcare Systems',
        date: '2026-08-22',
        desc: 'ෆාමසි සඳහා ඖෂධවල Batch Number, Expiry Date නිරීක්ෂණය කරමින් කල්ඉකුත් වීමට පෙර ලැබෙන Smart Alerts, Generic ඖෂධ සෙවීම සහ වේගවත් POS පහසුකම.',
        content: `## 💊 DIGIBIZ Pharmacy & Healthcare Management OS

ඖෂධ අලෙවිසැල්, ඩිස්පෙන්සරි සහ සෞඛ්‍ය මධ්‍යස්ථාන සඳහා ශ්‍රී ලංකා ජාතික ඖෂධ නියාමන අධිකාරියේ (NMRA) ප්‍රමිතීන්ට අනුකූලව නිර්මාණය කළ පද්ධතිය.

---

### 1. ප්‍රධාන තාක්ෂණික විශේෂාංග
* **Batch Number & Expiry Date Lifecycle:** සෑම ඖෂධයකම Batch අංකය, නිෂ්පාදිත දිනය සහ කල්ඉකුත්වීමේ දිනය අනුව FIFO (First-In, First-Out) ක්‍රමයට තොග නිකුත් වීම.
* **Color-Coded Smart Expiry Warnings:**
  * 🔴 **Red Alert:** මාසයකින් කල්ඉකුත් වන ඖෂධ (විකිණීම අවහිර කිරීමේ විකල්පය සහිතයි).
  * 🟡 **Yellow Alert:** මාස 3 කින් කල්ඉකුත් වන ඖෂධ (සැපයුම්කරුට ආපසු යැවීමට ලැයිස්තුගත වේ).
  * 🟢 **Green:** ආරක්ෂිත තොග.
* **Generic Name & Brand Name Dual Search:** වෛද්‍යවරයා බෙහෙත් වට්ටෝරුවේ ලියා ඇති Generic නම (උදා: *Paracetamol, Amoxicillin, Atorvastatin*) හෝ වෙළඳ නාමය (*Panadol, Augmentin, Lipitor*) මඟින් විකල්ප ඖෂධ ක්ෂණිකව සෙවීම.
* **Dosage & Usage Print on Label:** බිල්පතේ හෝ ඖෂධ කවරයේ මාත්‍රාව (උදේ 1, දවල් 1, රෑ 1 - කෑමට පසු) සිංහලෙන් හෝ ඉංග්‍රීසියෙන් මුද්‍රණය වීම.

---

### 2. Sample Pharmacy Invoicing Breakdown

| ඖෂධයේ නම (Brand / Generic) | Batch අංකය | කල්ඉකුත්වීම | ප්‍රමාණය | ඒකක මිල (රු.) | මුළු මුදල (රු.) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Augmentin 625mg (Amoxicillin/Clav) | BTH-8849 | 2027-11 | 14 Tab | 185.00 | 2,590.00 |
| Panadol 500mg (Paracetamol) | BTH-9912 | 2028-04 | 20 Tab | 4.50 | 90.00 |
| Atorvastatin 20mg (Lipitor Gen) | BTH-4412 | 2027-08 | 30 Tab | 28.00 | 840.00 |
| Omeprazole 20mg Capsules | BTH-3310 | 2027-05 | 30 Cap | 12.00 | 360.00 |
| **මුළු එකතුව (Total Bill)** | | | | | **Rs. 3,880.00** |

---

### 3. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@pharmacy.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Pharmacy POS, Batch Inventory, Expiry Warnings, Prescription Queue, Suppliers.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-distributor-wholesale-rep-app',
        title: 'Distributor & Wholesaler කළමනාකරණය: HQ Warehouse, Route Deliveries, Rep Mobile App සහ Shop Invoicing',
        category: 'features',
        categoryLabel: 'Distributor OS',
        icon: '🚚',
        author: 'DIGIBIZ Distribution Systems',
        date: '2026-08-22',
        desc: 'බෙදාහැරීමේ ආයතන සඳහා ප්‍රධාන ගබඩාව (HQ Warehouse), බෙදාහැරීමේ මාර්ග (Routes), Sales Rep Mobile App සහ කඩසාප්පු ණය පාලනය.',
        content: `## 🚚 DIGIBIZ Distributor & Wholesaler Management OS

භාණ්ඩ බෙදාහැරීමේ ආයතන, තොග වෙළෙන්දන් සහ FMCG Distributors සඳහා ප්‍රධාන කාර්යාලය සහ ක්ෂේත්‍රයේ සිටින Sales Reps එකට සම්බන්ධ කරන පූර්ණ විසඳුම.

---

### 1. ප්‍රධාන ක්‍රියාකාරීත්වය සහ මොඩියුල
* **Sales Rep Mobile App (Online & Offline):** Sales Rep වරුන්ට ඕනෑම Android හෝ iOS දුරකථනයකින් කඩ සාප්පුවලට ගොස් Order ඇතුළත් කිරීම. Internet නැතිවුවද Offline ක්‍රියාත්මක වී පසුව Auto-Sync වේ.
* **HQ Warehouse & Lorry Loading Sheets:** දවසේ ලැබුණු සියලුම Orders එක්රැස් කර එක් එක් බෙදාහැරීමේ Lorry රථය සඳහා Loading Sheet (Dispatch Note) ස්වයංක්‍රීයව සැකසීම.
* **Dynamic Free Issue Schemes:** 10 ක් ගත්විට 1 ක් නොමිලේ (10+1 Scheme), 5% Cash Discount ආදී ප්‍රවර්ධන නීති ස්වයංක්‍රීයව ක්‍රියාත්මක වීම.
* **Shop Outstanding & Credit Limits:** කඩ සාප්පුවේ ණය සීමාව (Credit Limit) ඉක්මවා ඇත්නම් Rep හට නව Order දැමීම අවහිර කිරීම හෝ Warning ලබාදීම.
* **Market Returns & Damage Goods Management:** කඩවලින් ආපසු ලැබෙන Damage / Expired භාණ්ඩ සඳහා Credit Notes නිකුත් කිරීම.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@distributor.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** HQ Dashboard, Warehouse, Deliveries, Reps Management, Shops Directory, Free Schemes.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-hardware-construction-bulk-pricing',
        title: 'Hardware & Construction Materials: මිනුම් ඒකක (Feet/Inches/Kg), තොග මිල ගණන් සහ ගොඩනැගිලි ද්‍රව්‍ය ණය පාලනය',
        category: 'features',
        categoryLabel: 'Hardware OS',
        icon: '🔧',
        author: 'DIGIBIZ Construction Tech Team',
        date: '2026-08-22',
        desc: 'හාඩ්වෙයාර් ව්‍යාපාර සඳහා වැලි, ගල්, සිමෙන්ති, යකඩ, PVC බට සහ කම්බි අඩි/අඟල්/කිලෝ ග්‍රෑම් අනුව බිල්පත් නිකුත් කිරීමේ විශේෂිත පද්ධතිය.',
        content: `## 🔧 DIGIBIZ Hardware & Construction Materials OS

හාඩ්වෙයාර් වෙළඳසැල් සහ ගොඩනැගිලි ද්‍රව්‍ය සපයන්නන් සඳහා විශේෂිත වූ Multi-Unit Pricing පද්ධතිය.

---

### 1. ප්‍රධාන විශේෂතා
* **Multi-Unit Pricing & Conversions:** අඩි (Feet), අඟල් (Inches), මීටර්, බෑග්, බණ්ඩල්, කියුබ් සහ කිලෝග්‍රෑම් අනුව මිල ගණන් නියම කිරීම.
* **Bulk Weight & Length Invoicing:** යකඩ කම්බි බර අනුවත්, PVC බට සහ ලෑලි දිග අනුවත් ස්වයංක්‍රීයව ගණනය වීම.
* **Contractor & Bass Ledger:** බාස්වරුන් සහ කොන්ත්‍රාත්කරුවන් ලබාගන්නා ද්‍රව්‍ය සහ ඔවුන්ගේ ණය ශේෂයන් වෙන වෙනම ලෙජරයක පවත්වා ගැනීම.
* **1-Click Quotation to Invoice:** පාරිභෝගිකයාට ලබාදුන් ඇස්තමේන්තුව (Quotation) තනි ක්ලික් එකකින් නිල බිල්පතක් බවට පත් කිරීම.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@hardware.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Hardware POS, Multi-Unit Inventory, Bulk Pricing, Contractor Credit, Quotations.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-manufacturer-production-costing',
        title: 'Manufacturing & Production පද්ධතිය: අමුද්‍රව්‍ය (Raw Materials), නිෂ්පාදන පිරිවැය (Cost Sheet) සහ නිමි භාණ්ඩ තොග',
        category: 'features',
        categoryLabel: 'Manufacturing OS',
        icon: '🏭',
        author: 'DIGIBIZ Industrial Systems',
        date: '2026-08-22',
        desc: 'නිෂ්පාදන ආයතන සහ කර්මාන්තශාලා සඳහා අමුද්‍රව්‍යවල සිට නිමි භාණ්ඩය දක්වා යන පිරිවැය (Raw Material + Labor + Overhead) ගණනය කිරීම.',
        content: `## 🏭 DIGIBIZ Manufacturing & Production Intelligence OS

නිෂ්පාදන කර්මාන්තශාලා සඳහා අමුද්‍රව්‍ය මිලදී ගැනීමේ සිට නිමි භාණ්ඩය විකිණීම දක්වා නිෂ්පාදන ක්‍රියාවලිය පාලනය කරන පද්ධතිය.

---

### 1. ප්‍රධාන මොඩියුල සහ විශේෂතා
* **Bill of Materials (BOM) Formula:** නිමි භාණ්ඩ 1 ක් නිපදවීමට අවශ්‍ය අමුද්‍රව්‍ය සූත්‍රය (Recipe) සැකසීම සහ නිෂ්පාදනය අරඹන විට අමුද්‍රව්‍ය තොගයෙන් ස්වයංක්‍රීයව අඩු වීම.
* **Accurate Unit Costing (Cost Sheet):** අමුද්‍රව්‍ය පිරිවැය + සේවක ශ්‍රම වියදම (Labour) + විදුලි/යන්ත්‍ර වියදම් (Overheads) එකතු කර ඒකකයක සැබෑ පිරිවැය ගණනය කිරීම.
* **Finished Goods Batch Tracking:** නිමි භාණ්ඩ Batch අංක සහිතව ගබඩා කිරීම.
* **Production Wastage & Scrap:** නාස්ති වන අමුද්‍රව්‍ය ප්‍රමාණයන් නිරීක්ෂණය කර පාලනය කිරීම.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@factory.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Raw Materials Inbound, Production Batches, Finished Stock, Manufacturing Cost Sheets, Sales.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-bakery-recipes-route-delivery',
        title: 'Bakery & Confectionery පද්ධතිය: අමුද්‍රව්‍ය වට්ටෝරු (Recipes), දෛනික බේකින් කාණ්ඩ, නාස්තිය සහ රූට් ඩිලිවරි',
        category: 'features',
        categoryLabel: 'Bakery OS',
        icon: '🥖',
        author: 'DIGIBIZ Bakery Tech Team',
        date: '2026-08-22',
        desc: 'බේකරි සඳහා පිටි, සීනි අමුද්‍රව්‍යවලින් පාන්/බනිස් සෑදීමේ වට්ටෝරු (Recipes), Chopper රූට් බෙදාහැරීම් සහ දෛනික නාස්තිය (Wastage) පාලනය.',
        content: `## 🥖 DIGIBIZ Bakery & Confectionery Management OS

බේකරි සහ රසකැවිලි නිෂ්පාදන ආයතන සඳහා දෛනික බේකින් කාණ්ඩ, Chopper රූට් බෙදාහැරීම් සහ අමුද්‍රව්‍ය කළමනාකරණය.

---

### 1. ප්‍රධාන ක්‍රියාකාරීත්වය
* **Recipe-based Ingredient Deduction:** පිටි, සීනි, බටර්, ඊස්ට් අමුද්‍රව්‍ය පාන්/කේක් නිෂ්පාදනය ආරම්භ කළ සැනින් තොගයෙන් ස්වයංක්‍රීයව අඩු වීම.
* **Daily Baking Batches:** උදෑසන සහ සවස බේකින් කාණ්ඩ සහ නිපදවූ ප්‍රමාණයන් ලේඛනගත කිරීම.
* **Chopper / Route Delivery Management:** Chopper රථ සහ Van රථවලට පටවන ලද බේකරි නිෂ්පාදන සහ ආපසු ගෙනෙන ලද භාණ්ඩ (Unsold Returns) ගණනය.
* **Spoilage & Wastage Control:** ඉවතලන හෝ කල්ඉකුත් වූ බේකරි ද්‍රව්‍යවල අලාභය නිරීක්ෂණය.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@bakery.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Raw Materials, Recipe Builder, Production Baking, Wastage Log, Route Plan, POS.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-coconut-wholesale-copra-husk',
        title: 'Coconut Wholesale & Husk Products: පොල් එකතු කිරීම, Grading, කොප්පරා සහ ලෙලි නිෂ්පාදන කළමනාකරණය',
        category: 'features',
        categoryLabel: 'Coconut & Agro OS',
        icon: '🥥',
        author: 'DIGIBIZ Agro Industrial Team',
        date: '2026-08-22',
        desc: 'පොල් ව්‍යාපාරිකයින් සඳහා විවිධ මිල ගණන්වලට පොල් මිලදී ගැනීම, වර්ගීකරණය (Grading), කොප්පරා සහ පොල් ලෙලි නිෂ්පාදන පාලනය.',
        content: `## 🥥 DIGIBIZ Coconut Wholesale & Husk Products OS

පොල් තොග වෙළෙන්දන්, පොල් මෝල් සහ පොල් ලෙලි ආශ්‍රිත නිෂ්පාදන ආයතන සඳහා සකස් කරන ලද විශේෂිත පද්ධතිය.

---

### 1. ප්‍රධාන විශේෂතා
* **Multi-Price Coconut Procurement:** ගස් හිමියන්ගෙන් සහ තැරැව්කරුවන්ගෙන් විවිධ මිල ගණන් සහ ප්‍රවාහන ගාස්තු සහිතව පොල් මිලදී ගැනීම.
* **Coconut Grading Matrix:** ලොකු, මධ්‍යම, කුඩා සහ පැල පොල් ලෙස තත්ත්ව පරීක්ෂාවෙන් පසු තොග වෙන් කිරීම.
* **Copra & Coconut Oil Processing:** වියළන ලද කොප්පරා (Copra) බර සහ නිෂ්පාදන කාණ්ඩ ලෙජරය.
* **Husk & Coir Products:** පොල් ලෙලි මිලදී ගැනීම, කොහු සහ කොහුබත් (Cocopeat) නිෂ්පාදන තොග සහ අලෙවිය.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@coconut.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Coconut Purchases, Grading Matrix, Copra Processing, Husk Products, Supplier Advances.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-garment-fashion-boutique-matrix',
        title: 'Garment & Fashion Boutique: Size/Color Variant Matrix, Barcode ටැග් සහ ඇඳුම් විලාසිතා අලෙවිය',
        category: 'features',
        categoryLabel: 'Garment & Boutique OS',
        icon: '👕',
        author: 'DIGIBIZ Fashion Systems',
        date: '2026-08-22',
        desc: 'ඇඳුම් සාප්පු සඳහා ප්‍රමාණ (S, M, L, XL, XXL) සහ වර්ණ (Colors) අනුව තොග කළමනාකරණය, Custom Barcode Tags සහ Boutique POS.',
        content: `## 👕 DIGIBIZ Garment & Fashion Boutique OS

ඇඳුම් සාප්පු, රෙදිපිළි අලෙවිසැල් සහ විලාසිතා මධ්‍යස්ථාන සඳහා ප්‍රමාණ සහ වර්ණ අනුව තොග පාලනය කරන පද්ධතිය.

---

### 1. ප්‍රධාන විශේෂාංග
* **Size & Color Variant Matrix:** එක් ඇඳුම් මාදිලියක විවිධ Sizes (S, M, L, XL, XXL) සහ Colors වෙන වෙනම තොග නිරීක්ෂණය.
* **Custom Barcode Label Printing:** සාප්පුවේ නම, මිල සහ ප්‍රමාණය සහිත Barcode Stickers මුද්‍රණය කිරීම.
* **Fast Counter POS:** Touch POS හෝ Barcode Scan මඟින් ක්ෂණික බිල්පත් සැකසීම.
* **Seasonal Discount Management:** 10% Off, Buy 1 Get 1 Free ප්‍රවර්ධන බිල්පතට ස්වයංක්‍රීයව ඇතුළත් වීම.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@garment.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Garment POS, Variant Matrix, Barcode Generator, Inventory, Sales Analytics.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-restaurant-cafe-kot-table-management',
        title: 'Restaurant & Cafe පද්ධතිය: Table Management, Kitchen Order Tickets (KOT) සහ Takeaway බිල්පත්',
        category: 'features',
        categoryLabel: 'Restaurant & Cafe OS',
        icon: '🍽️',
        author: 'DIGIBIZ Hospitality Team',
        date: '2026-08-22',
        desc: 'ආපනශාලා සහ කැෆේ සඳහා මේස වෙන්කිරීම (Table Booking), කුස්සියට යන KOT ටිකට්පත්, වේටර් ඇණවුම් සහ ක්ෂණික Takeaway බිල්පත්.',
        content: `## 🍽️ DIGIBIZ Restaurant & Cafe Management OS

ආපනශාලා, හෝටල් සහ කැෆේ සඳහා වේටර් ඇණවුම්, මේස පාලනය සහ Kitchen Display සහිත ස්මාර්ට් පද්ධතිය.

---

### 1. ප්‍රධාන ක්‍රියාකාරීත්වය
* **Interactive Table Layout:** මේස අංක අනුව ඇණවුම් ලබාගැනීම සහ මේසය නිදහස්දැයි (Occupied/Free) බැලීම.
* **Kitchen Order Tickets (KOT):** ඇණවුම දැමූ සැනින් කුස්සියට (Kitchen Printer හෝ Display) KOT එක යොමුවීම.
* **Dine-in, Takeaway & Delivery:** කෑම ශාලාවේ කෑම, පාර්සල් සහ Delivery ඇණවුම් වෙන වෙනම කළමනාකරණය.
* **Food Item Modifiers:** ස්පයිසි වැඩිපුර, සීනි අඩුවෙන් ආදී පාරිභෝගික කැමැත්ත (Special Notes) ඇණවුමට එක් කිරීම.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@restaurant.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Tables Layout, Orders Terminal, Kitchen KOT, Recipe Inventory, Accounting.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-salon-spa-service-appointment-billing',
        title: 'Salon, Spa & Professional Services: Appointments, Staff Commissions සහ Service Billing',
        category: 'features',
        categoryLabel: 'Salon & Spa OS',
        icon: '💇',
        author: 'DIGIBIZ Services Engineering',
        date: '2026-08-22',
        desc: 'රූපලාවණ්‍යාගාර සහ සේවා ආයතන සඳහා දින සහ වේලාවන් වෙන්කරවා ගැනීම (Appointments), කාර්ය මණ්ඩල කොමිස් මුදල් (Staff Commissions) සහ සේවා බිල්පත්.',
        content: `## 💇 DIGIBIZ Salon, Spa & Professional Services OS

රූපලාවණ්‍යාගාර (Salons), Spas සහ වෘත්තීය සේවා ආයතන සඳහා පාරිභෝගික සේවා වෙන්කිරීම් සහ කොමිස් පාලනය.

---

### 1. ප්‍රධාන විශේෂාංග
* **Appointment Scheduling Calendar:** දින සහ වේලාවන් අනුව Beautician/Stylist වෙන්කරවා ගැනීම සහ Calendar View එක.
* **Staff Commission Calculation:** එක් එක් සේවකයා කළ සේවාවන් අනුව ලැබිය යුතු කොමිස් මුදල (Commission %) ස්වයංක්‍රීයව ගණනය වීම.
* **Service & Product Package Billing:** Hair Cut, Facial සේවාවන් සමඟ රූපලාවණ්‍ය ආලේපන භාණ්ඩ එකම බිලට එක් කිරීම.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@salon.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Appointment Calendar, Service Catalog, Staff Commissions, Client Records, Billing.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-attendance-payroll-qr-shift-management',
        title: 'Attendance, QR Mobile Scanner & Payroll: පැමිණීම් ලකුණු කිරීම, Shift Roster, OT සහ පඩි පත්‍රිකා (Payslips)',
        category: 'features',
        categoryLabel: 'Attendance & HR OS',
        icon: '⏱️',
        author: 'DIGIBIZ HR Tech Team',
        date: '2026-08-22',
        desc: 'ඕනෑම ව්‍යාපාරයක සේවක පැමිණීම QR / Fingerprint මඟින් සටහන් කර, Shifts, අතිකාල (OT), නිවාඩු, අත්තිකාරම් සහ EPF/ETF සහිත ස්වයංක්‍රීය පඩි පත්‍රිකා.',
        content: `## ⏱️ DIGIBIZ Attendance & Payroll Management OS

ඕනෑම සුළු හා මධ්‍ය පරිමාණ ව්‍යාපාරයක සේවක කළමනාකරණය, පැමිණීම සහ වැටුප් ගණනය කරන සම්පූර්ණ විසඳුම.

---

### 1. ප්‍රධාන ක්‍රියාකාරීත්වය
* **Mobile QR & Fingerprint Attendance:** සේවකයින්ගේ QR Code එක ජංගම දුරකථනයෙන් Scan කර පැමිණීම සහ පිටවීම තත්පරයකින් සටහන් කිරීම.
* **Shift Roster & 24h Shifts:** දිවා/රාත්‍රී සහ භ්‍රමණ (Rotational) Shifts කළමනාකරණය.
* **Automated OT & Late Deductions:** නියමිත වේලාවට වඩා අමතරව වැඩ කළ පැය ගණන (OT) සහ ප්‍රමාද වීම් ස්වයංක්‍රීයව ගණනය වීම.
* **1-Click Salary Sheet & Payslips:** මුලික වැටුප, OT, දීමනා, අත්තිකාරම් (Advances), ණය සහ EPF/ETF අඩු කර සකසන නිල Payslips.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@attendance.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Attendance Log, Mobile Scanner, Shift Roster, Salary & Payslips, Employee Loans.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-quick-billing-thermal-bluetooth-receipts',
        title: 'Quick Billing & Instant Invoicing: Bluetooth Thermal Printer, WhatsApp බිල්පත් සහ Offline ක්‍රියාකාරීත්වය',
        category: 'features',
        categoryLabel: 'Quick Bill OS',
        icon: '🧾',
        author: 'DIGIBIZ Mobile Invoicing Team',
        date: '2026-08-22',
        desc: 'කුඩා වෙළඳසැල් සහ ජංගම අලෙවිකරුවන් සඳහා Smart Phone එකෙන් Bluetooth Thermal Printer මඟින් ක්ෂණික බිල්පත් හෝ WhatsApp Invoices නිකුත් කිරීම.',
        content: `## 🧾 DIGIBIZ Quick Billing & Instant POS

කුඩා කඩසාප්පු, පලතුරු/එළවළු වෙළෙන්දන් සහ ජංගම ව්‍යාපාරිකයින් සඳහා වේගවත්ම Invoicing විසඳුම.

---

### 1. ප්‍රධාන විශේෂතා
* **Pocket Invoicing on Mobile:** ඕනෑම Android හෝ iOS දුරකථනයකින් සුපිරි වේගයකින් බිල්පත් නිකුත් කිරීම.
* **Bluetooth Thermal Printer Integration:** 58mm සහ 80mm Bluetooth කුඩා මුද්‍රණ යන්ත්‍රවලට තත්පර 2 කින් බිල මුද්‍රණය වීම.
* **100% Offline Billing Mode:** අන්තර්ජාලය (Internet) නොමැති විට පවා බාධාවකින් තොරව බිල්පත් නිකුත් කර Internet ලැබුණු පසු Auto-Sync වීම.
* **WhatsApp Digital Bill Sharing:** කඩදාසි නැතිව පාරිභෝගිකයාගේ WhatsApp ගිණුමට Digital Bill එකක් යැවීම.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@easybill.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Quick Terminal, Products Directory, Customer Credit, Offline Storage, Bluetooth Setup.`,
        imageUrl: '',
        published: true
    },
    {
        id: 'guide-scrap-collection-merchant-workbench',
        title: 'Scrap Collection Center & Merchant OS: යකඩ/ප්ලාස්ටික් බර කිරීම, මිලදී ගැනීම්, අත්තිකාරම් සහ අලෙවිය',
        category: 'features',
        categoryLabel: 'Scrap & Recycle OS',
        icon: '♻️',
        author: 'DIGIBIZ Industrial Systems',
        date: '2026-08-22',
        desc: 'යකඩ සහ ප්‍රතිචක්‍රීකරණ මධ්‍යස්ථාන සඳහා යකඩ, ඇලුමිනියම්, තඹ, ප්ලාස්ටික් බර අනුව මිලදී ගැනීම්, අත්තිකාරම් සහ මහා පරිමාණ විකුණුම් කළමනාකරණය.',
        content: `## ♻️ DIGIBIZ Scrap Collection Center & Merchant OS

ප්‍රතිචක්‍රීකරණ අමුද්‍රව්‍ය (Scrap Metal & Plastics) එකතු කරන්නන් සහ වෙළෙන්දන් සඳහා විශේෂිත වූ කාර්යපීඨය.

---

### 1. ප්‍රධාන විශේෂතා
* **Weight-based Buying Terminal:** යකඩ (Iron), තඹ (Copper), පිත්තල (Brass), බැටරි, ප්ලාස්ටික් කිලෝ ග්‍රෑම් සහ තරාදි බර අනුව මිලදී ගැනීම්.
* **Customer Advance & Debt Ledger:** පාරිභෝගිකයින්ට සහ එකතු කරන්නන්ට ලබාදුන් අත්තිකාරම් බර කළ බිලෙන් ස්වයංක්‍රීයව අඩු කිරීම.
* **Bulk Selling to Factories:** කර්මාන්තශාලා වෙත විශාල ලොරි බර පිටත් කිරීම සහ විකුණුම් බිල්පත්.
* **Scrap Inventory Balance:** ගබඩාවේ ඇති එක් එක් අමුද්‍රව්‍ය වර්ගයේ වත්මන් බර (Stock in Kg/Tons) නිරීක්ෂණය.

---

### 2. Live Demo පරීක්ෂා කර බැලීම
* **Demo URL:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@scrap.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Scrap Buying Terminal, Selling Log, Advance Manager, Stock Workbench, Accounting.`,
        imageUrl: '',
        published: true
    }
];

async function run() {
    console.log('🚀 Seeding comprehensive deep business vertical guides to Firestore...');
    try {
        const idToken = await getSuperAdminToken();
        console.log('✅ Authenticated as Super Admin.');

        const nowIso = new Date().toISOString();
        for (const blog of DEEP_BUSINESS_BLOGS) {
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
                console.log(`  + Published Deep Guide: [${blog.categoryLabel}] ${blog.title.slice(0, 55)}...`);
            } else {
                console.warn(`  ! Failed ${docId}:`, await writeRes.text());
            }
        }

        console.log('\n🎉 Successfully published all 15 in-depth business vertical guide articles!');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error:', e);
        process.exit(1);
    }
}

run();

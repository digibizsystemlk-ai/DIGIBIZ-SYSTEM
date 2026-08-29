/**
 * Comprehensive Long-Form Generator for ALL 15 Business Verticals in DIGIBIZ
 * Run: node scripts/update-all-deep-guides.js
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

const DEEP_GUIDES = [
    // 1. Retail & Supermarket OS
    {
        id: 'guide-retail-supermarket-pos',
        title: 'Retail, Supermarket & Grocery OS: Barcode POS, Multi-Warehouse තොග, සැපයුම්කරු GRN සහ දෛනික සැබෑ ලාභය ගණනය කිරීම පිළිබඳ සම්පූර්ණ මාර්ගෝපදේශය',
        category: 'features',
        categoryLabel: 'Retail & Supermarket OS',
        icon: '🛒',
        author: 'DIGIBIZ Retail Engineering',
        date: '2026-08-22',
        imageUrl: '/images/blog/retail-pos-terminal.jpg',
        published: true,
        desc: 'සුපිරි වෙළඳසැල් සහ සිල්ලර වෙළඳසැල් සඳහා තත්පරයකින් බිල් දමන Barcode POS, බහු ගබඩා (Multi-Warehouse) තොග පාලනය, Cost vs Selling සැබෑ දෛනික ලාභ වාර්තා.',
        content: `## 🛒 DIGIBIZ Retail & Supermarket Management OS

සුපිරි වෙළඳසැල් (Supermarkets), සිල්ලර වෙළඳසැල් (Grocery Stores), Mini Marts සහ තොග/සිල්ලර අලෙවිසැල් සඳහාම නිර්මාණය කරන ලද **DIGIBIZ Retail OS** පද්ධතිය පිළිබඳ පූර්ණ විස්තරය මෙසේ ඉදිරිපත් කරමු.

![DIGIBIZ Retail & Supermarket POS Dashboard — Fast Barcode Scanning, Multi-Warehouse Stock & Live Profit Analytics](/images/blog/retail-pos-terminal.jpg)

---

### 1. පද්ධතියේ ප්‍රධාන විශේෂාංග සහ වාසි (Key Core Features)

* **Lightning Fast POS Checkout:** USB / Bluetooth Barcode Scanners හෝ Touch Screen මඟින් තත්පර 1 කින් අයිතම බිලට එකතු වීම.
* **Multi-Warehouse & Rack Tracking:** ප්‍රධාන ගබඩාව (Main Stores) සහ Display Racks අතර තොග මාරුවීම් (Internal Stock Transfers) නිවැරදිව පාලනය.
* **Supplier GRN & Credit Ledger:** සැපයුම්කරුවන්ගෙන් භාණ්ඩ ලැබෙන විට Good Received Note (GRN) මඟින් ස්වයංක්‍රීයව Cost Price සහ ණය ශේෂයන් යාවත්කාලීන වීම.
* **Real-time Profit Analytics:** සෑම බිල්පතකම අඩංගු අයිතමයන්ගේ Cost Price එක මත පදනම්ව දවසේ සැබෑ ලාභය (Net Profit) තත්පරයෙන් තත්පරය ගණනය වීම.

---

### 2. ආදර්ශ විකුණුම් මිල සහ ලාභ ගණනය කිරීමේ වගුව (Sample Pricing & Profit Margin Matrix)

| අයිතමය (Product Name) | තොග ඒකකය (Unit) | මිලදී ගත් මිල (Cost LKR) | විකුණුම් මිල (Selling LKR) | ලාභ ප්‍රතිශතය (Margin %) | දෛනික විකුණුම් (Qty) | දෛනික ලාභය (Profit LKR) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Anchor Full Cream Milk 1kg** | Packet | 2,420.00 | 2,650.00 | +9.50% | 40 Pkts | 9,200.00 |
| **Araliya Keeri Samba 5kg** | Bag | 1,480.00 | 1,650.00 | +11.48% | 35 Bags | 5,950.00 |
| **Sunlight Soap 115g (Bundle 4)** | Pack | 480.00 | 560.00 | +16.66% | 60 Packs | 4,800.00 |
| **Clogard Toothpaste 120g** | Tube | 245.00 | 290.00 | +18.36% | 50 Tubes | 2,250.00 |
| **Munchee Super Cream Cracker 500g**| Packet | 420.00 | 490.00 | +16.66% | 45 Pkts | 3,150.00 |
| **එකතුව (Daily Total Breakdown)** | — | — | — | — | **230 Units** | **LKR 25,350.00** |

---

### 3. ලාභය සහ තොග වටිනාකම ගණනය කිරීමේ සූත්‍ර (Profit & Valuation Formulas)

#### දෛනික සැබෑ ලාභය ගණනය කිරීම (Net Daily Real Profit):
$$\\text{Real Daily Net Profit} = \\sum_{i=1}^{N} \\left( \\text{Selling Price}_i - \\text{Weighted Cost Price}_i \\right) \\times \\text{Sold Qty}_i - \\text{Daily Expenses}$$

#### ලාභ ප්‍රතිශතය (Gross Profit Margin %):
$$\\text{Profit Margin (\\%)} = \\left( \\frac{\\text{Selling Price} - \\text{Cost Price}}{\\text{Selling Price}} \\right) \\times 100$$

---

### 4. නිල මුද්‍රිත Thermal POS රිසිට්පත් ආකෘතිය (Printable 80mm Receipt Sample)

\`\`\`text
======================================================================
                     DIGIBIZ SUPERMARKET & FRESH
              No. 45, High Level Road, Nugegoda | Tel: 011-7894561
======================================================================
INVOICE NO: #RET-20260822-0941            DATE : 2026-08-22 11:15 AM
CASHIER   : Kasun (Counter #01)           TYPE : RETAIL SALE (TAX INVOICE)
CUSTOMER  : Walk-in Customer              POINTS: 145 Pts
----------------------------------------------------------------------
ITEM DESCRIPTION                 QTY    UNIT PRICE (LKR)   TOTAL (LKR)
----------------------------------------------------------------------
Anchor Milk Powder 1kg           2          2,650.00          5,300.00
Araliya Keeri Samba 5kg          1          1,650.00          1,650.00
Sunlight Soap 115g (4pk)         2            560.00          1,120.00
Munchee Cream Cracker 500g       1            490.00            490.00
----------------------------------------------------------------------
SUBTOTAL AMOUNT                                           LKR 8,560.00
LOYALTY REWARD DISCOUNT (5%)                                -LKR 280.00
----------------------------------------------------------------------
NET FINAL TOTAL                                           LKR 8,280.00
PAID AMOUNT (CASH TENDERED)                               LKR 9,000.00
CHANGE RETURNED                                             LKR 720.00
----------------------------------------------------------------------
NUMBER OF ITEMS SOLD: 4 ITEMS (6 PIECES)
>> Digital e-Receipt & Points: https://digibiz-sys.web.app/r/RET941
======================================================================
            ස්තූතියි! නැවත පැමිණෙන්න (Thank you, Come Again!)
======================================================================
\`\`\`

---

### 5. Live Demo පරීක්ෂා කර බැලීම (Live Test Walkthrough)
* **Demo Portal:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@retail.com\`
* **Password:** \`123456\`
* **පරීක්ෂා කළ හැකි මොඩියුල:** Fast POS, Multi-Stores Inventory, Low Stock Warnings, Supplier GRN, Daily Profit Analytics.`
    },

    // 2. Tire Center & Wheel Alignment OS
    {
        id: 'guide-tire-center-auto-services',
        title: 'Tire Center, Wheel Alignment & Battery OS: ටයර් ප්‍රමාණ සෙවුම (Tire Matrix), DOT නිෂ්පාදන වර්ෂය, Alignment වාර්තා සහ Digital Warranty',
        category: 'features',
        categoryLabel: 'Tire Center OS',
        icon: '🛞',
        author: 'DIGIBIZ Auto Systems',
        date: '2026-08-22',
        imageUrl: '/images/blog/tyre-center-dashboard.jpg',
        published: true,
        desc: 'ටයර් අලෙවිසැල් සහ Alignment මධ්‍යස්ථාන සඳහා ටයර් ප්‍රමාණ (195/65 R15), DOT නිෂ්පාදන සතිය/වර්ෂය, වගකීම් සහතික (Warranty) සහ Alignment Job Sheets පාලනය.',
        content: `## 🛞 DIGIBIZ Tire Center & Wheel Alignment OS

ටයර් අලෙවිසැල් (Tire Shops), Wheel Alignment මධ්‍යස්ථාන, Wheel Balancing & Battery Service Hubs සඳහාම නිර්මාණය කරන ලද **DIGIBIZ Tire OS** පද්ධතිය පිළිබඳ පූර්ණ මාර්ගෝපදේශය.

![DIGIBIZ Tire Center OS Dashboard — Tire Size Matrix, Brand Grid & Digital Warranty Tracking](/images/blog/tyre-center-dashboard.jpg)

---

### 1. ප්‍රධාන විශේෂාංග (Key Capabilities)

* **Tire Size Matrix Filter:** Width (195), Aspect Ratio (65), Rim Size (R15) ඇතුළත් කළ සැණින් ගබඩාවේ ඇති සියලුම Brands (Michelin, Dunlop, Bridgestone, CEAT, DSI) සහ මිල ගණන් ක්ෂණිකව තිරයට පැමිණීම.
* **DOT Manufacturing Code Tracking:** ටයරය නිෂ්පාදනය කළ සතිය සහ වර්ෂය (උදා: \`2423\` = 2023 24 වන සතිය) පද්ධතියේ ලියාපදිංචි කර පාරිභෝගිකයාට නැවුම් ටයර් ලබාදීම තහවුරු කිරීම.
* **Digital Warranty Certificate:** වගකීම් සහතිකය WhatsApp මඟින් පාරිභෝගිකයාට නිකුත් කිරීම සහ Claim කිරීමේදී Serial/DOT පරීක්ෂා කිරීම.
* **Wheel Alignment & Balancing Integration:** කාර්මික ශිල්පියා කළ Alignment / Balancing ගාස්තු සහ කොමිස් බිල්පතට ස්වයංක්‍රීයව එක්වීම.

---

### 2. ආදර්ශ ටයර් තොග සහ තාක්ෂණික දත්ත වගුව (Sample Tire Stock & DOT Matrix)

| ටයර් ප්‍රමාණය (Size) | Brand & Pattern | DOT Code (Age) | Tread Depth (mm) | තොගය (In Stock) | විකුණුම් මිල (LKR) | වගකීම් කාලය (Warranty) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **195/65 R15** | Michelin Primacy 4 | 1424 (2024 New) | 8.2 mm | 24 Units | 38,500.00 | අවුරුදු 5 (100,000 km) |
| **205/55 R16** | Dunlop SP Sport LM705 | 0824 (2024 New) | 8.0 mm | 18 Units | 42,000.00 | අවුරුදු 5 (80,000 km) |
| **265/65 R17** | Bridgestone Dueler A/T | 4823 (2023 End) | 9.5 mm | 16 Units | 68,500.00 | අවුරුදු 5 (100,000 km) |
| **175/70 R13** | CEAT Milaze X3 | 1824 (2024 New) | 7.8 mm | 32 Units | 18,500.00 | අවුරුදු 3 (60,000 km) |
| **145/80 R12** | DSI Radial All-Weather | 2024 (2024 New) | 7.5 mm | 40 Units | 13,800.00 | අවුරුදු 3 (50,000 km) |

---

### 3. සේවා ගාස්තු සහ ටයර් පැකේජ බිල්පත් සූත්‍ර (Package Calculation Formula)

$$\\text{Total Tire Invoice} = (\\text{Tire Unit Price} \\times \\text{Qty}) + \\text{Valves Total} + \\text{Balancing Charge} + \\text{Alignment Charge} - \\text{Old Tire Exchange Trade-in}$$

---

### 4. නිල මුද්‍රිත ටයර් බිල්පත සහ වගකීම් සහතික ආකෘතිය

\`\`\`text
======================================================================
                  DIGIBIZ TYRE & WHEEL ALIGNMENT HUB
              No. 88, Galle Road, Moratuwa | Tel: 011-2645890
======================================================================
INVOICE / WARRANTY : #TYR-20260822-0412    DATE   : 2026-08-22 02:30 PM
VEHICLE REG NO     : WP CAD-5678           MILEAGE: 62,400 km
VEHICLE MODEL      : Honda Vezel RS        TECH   : Kamal (Bay #01)
CUSTOMER NAME      : Mr. Nalin Fernando    MOBILE : 071-8899001
----------------------------------------------------------------------
ITEM / SERVICE DESCRIPTION                QTY    UNIT (LKR)   TOTAL (LKR)
----------------------------------------------------------------------
Dunlop 205/55 R16 LM705 (DOT: 0824)        4      42,000.00   168,000.00
Tubeless Brass Valves (TR414)              4         450.00     1,800.00
Wheel Balancing (Clip Weights included)    4         600.00     2,400.00
Computer 3D Laser Wheel Alignment          1 Job    2,500.00     2,500.00
----------------------------------------------------------------------
SUBTOTAL AMOUNT                                             LKR 174,700.00
OLD TYRE BUYBACK TRADE-IN DEDUCTION (4 x 1,000)             -LKR 4,000.00
----------------------------------------------------------------------
NET PAYABLE AMOUNT                                          LKR 170,700.00
WARRANTY REGISTRATION ID: #WARR-CAD5678-2026
>> Full Warranty Card & Claim Policy: https://digibiz-sys.web.app/w/CAD5678
======================================================================
      Free Alignment Check after 5,000 km! Drive with Confidence.
======================================================================
\`\`\`

---

### 5. Live Demo පරීක්ෂා කර බැලීම
* **Demo Portal:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@tyrecentre.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Tire Size Search, DOT Register, Alignment Job Sheet, Digital Warranty.`
    },

    // 3. Pharmacy & Healthcare OS
    {
        id: 'guide-pharmacy-batch-expiry-tracking',
        title: 'Pharmacy & Healthcare OS: ඖෂධ Batch Numbers, කල්ඉකුත්වීමේ අනතුරු ඇඟවීම් (Expiry Countdown) සහ CDDA නියාමන ලේඛන',
        category: 'features',
        categoryLabel: 'Pharmacy OS',
        icon: '💊',
        author: 'DIGIBIZ Healthcare Systems',
        date: '2026-08-22',
        imageUrl: '/images/blog/pharmacy-batch-expiry.jpg',
        published: true,
        desc: 'ඖෂධහල් සහ සෞඛ්‍ය මධ්‍යස්ථාන සඳහා ඖෂධ කාණ්ඩ අංක (Batch No), කල්ඉකුත් වීමට පෙර ස්වයංක්‍රීයව දන්වන Expiry Alerts, Prescription POS සහ CDDA Schedule Drug Logs.',
        content: `## 💊 DIGIBIZ Pharmacy & Healthcare Management OS

ඖෂධහල් (Pharmacies), ඩිස්පෙන්සරි (Dispensaries) සහ වෛද්‍ය සායන සඳහාම විශේෂයෙන් සකසන ලද **DIGIBIZ Pharmacy OS** පද්ධතිය පිළිබඳ පූර්ණ විස්තරය.

![DIGIBIZ Pharmacy OS — Prescription Queue, Batch Numbers, Expiry Warnings & CDDA Register](/images/blog/pharmacy-batch-expiry.jpg)

---

### 1. පද්ධතියේ සුවිශේෂීතා (Key Highlights)

* **Batch & Expiry Date Management:** එකම ඖෂධයේ විවිධ Batch අංක සහ Expiry Dates වෙන වෙනම නිරීක්ෂණය කර **First-Expiry-First-Out (FEFO)** ක්‍රමයට බිල්පතට නිකුත් වීම.
* **Smart 3-Tier Expiry Color Warnings:**
  * 🔴 **රතු පැහැය (Red Glow):** දින 30 කට අඩු කාලයකින් කල් ඉකුත් වන ඖෂධ.
  * 🟡 **කහ පැහැය (Yellow Glow):** දින 90 කට අඩු කාලයකින් කල් ඉකුත් වන ඖෂධ.
  * 🟢 **කොළ පැහැය (Green):** ආරක්ෂිත තොග (Safe Stock).
* **CDDA Schedule Drug Narcotic Register:** විශේෂ ඖෂධ නිකුත් කිරීමේදී වෛද්‍යවරයාගේ නම, රෝගියාගේ නම සහ NIC අංකය ස්වයංක්‍රීයව රෙජිස්ටරයට වාර්තා වීම.
* **Fast Generic Drug Search:** Brand Name එකෙන් හෝ Generic Chemical Formula එකෙන් ක්ෂණිකව ඖෂධ සෙවීම.

---

### 2. ආදර්ශ ඖෂධ තොග සහ Expiry Countdown සටහන (Sample Drug Expiry Matrix)

| ඖෂධයේ නම (Medicine Name) | Batch අංකය | නිෂ්පාදිත දිනය | කල්ඉකුත්වන දිනය | පවතින තොගය | තත්ව අනතුරු ඇඟවීම (Alert State) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Paracetamol 500mg (Panadol)** | B#PC2024A | 2024-01-10 | **2024-11-25** | 1,450 Tabs | 🔴 **කල් ඉකුත්වීමට ආසන්නයි (30 Days)** |
| **Amoxicillin 250mg Capsules** | B#AMX204C | 2023-08-15 | **2025-01-20** | 890 Caps | 🟡 **අවධානයෙන් සිටින්න (90 Days)** |
| **Ibuprofen 400mg Tablets** | B#IBU193G | 2024-03-01 | **2026-08-15** | 2,100 Tabs | 🟢 **ආරක්ෂිතයි (Safe Stock)** |
| **Metformin 500mg (Glucophage)** | B#MET221F | 2023-11-20 | **2025-03-10** | 760 Tabs | 🟡 **අවධානයෙන් සිටින්න (140 Days)** |
| **Atorvastatin 20mg (Lipitor)** | B#ATV889K | 2024-02-14 | **2026-12-30** | 1,200 Tabs | 🟢 **ආරක්ෂිතයි (Safe Stock)** |

---

### 3. ආදර්ශ ඖෂධ බිල්පත් ආකෘතිය (Printable Pharmacy Receipt)

\`\`\`text
======================================================================
                     DIGIBIZ CITY PHARMACY & DISPENSARY
               No. 12, Hospital Road, Kandy | Tel: 081-2233445
                 CDDA REG NO: CDDA/PH/2026/0891
======================================================================
INVOICE NO : #PHARM-20260822-1082         DATE    : 2026-08-22 04:15 PM
PRESCRIBER : Dr. K. Patel (SLMC 45120)    PATIENT : Mrs. Sarah Jones
CASHIER    : Pharmacist Nuwan (Reg: 8901) DOCTOR'S SLIP: #RX-8942
----------------------------------------------------------------------
MEDICINE (GENERIC / BRAND)      BATCH NO   QTY    UNIT (LKR)  TOTAL (LKR)
----------------------------------------------------------------------
Panadol 500mg (Paracetamol)    PC2024A    20 Tabs      4.50        90.00
Amoxicillin 250mg Capsules     AMX204C    15 Caps     22.00       330.00
Omeprazole 20mg Capsules       OMP441K    14 Caps     12.50       175.00
Vitamin C 500mg Chewable       VTC112D    30 Tabs      6.00       180.00
----------------------------------------------------------------------
SUBTOTAL AMOUNT                                             LKR 775.00
SENIOR CITIZEN DISCOUNT (5%)                                 -LKR 38.75
----------------------------------------------------------------------
NET FINAL PAYABLE                                           LKR 736.25
PAID AMOUNT (CASH)                                         LKR 1,000.00
CHANGE DUE                                                  LKR 263.75
----------------------------------------------------------------------
CAUTION: TAKE MEDICINES EXACTLY AS PRESCRIBED BY YOUR MEDICAL DOCTOR.
>> Digital Prescription & Dosage: https://digibiz-sys.web.app/p/PH1082
======================================================================
               Get Well Soon! (සුවපත් දිවියකට අපෙන් උපදෙස්)
======================================================================
\`\`\`

---

### 4. Live Demo පරීක්ෂා කර බැලීම
* **Demo Portal:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@pharmacy.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Prescription POS, Batch Inventory, Expiry Warnings, CDDA Narcotic Register.`
    },

    // 4. Restaurant & Cafe OS
    {
        id: 'guide-restaurant-cafe-kot-table-management',
        title: 'Restaurant, Cafe & Pub OS: Table Management Map, Kitchen Order Tickets (KOT), වේටර් Tablet ඇණවුම් සහ Takeaway බිල්පත්',
        category: 'features',
        categoryLabel: 'Restaurant & Cafe OS',
        icon: '🍽️',
        author: 'DIGIBIZ Hospitality Systems',
        date: '2026-08-22',
        imageUrl: '/images/blog/restaurant-kot-table.jpg',
        published: true,
        desc: 'ආපනශාලා සහ කැෆේ සඳහා මේස වෙන්කිරීම (Interactive Table Map), කුස්සියේ KOT Display/Printers, වේටර් ඇණවුම් සහ ක්ෂණික Takeaway බිල්පත්.',
        content: `## 🍽️ DIGIBIZ Restaurant & Cafe Management OS

ආපනශාලා (Restaurants), කැෆේ (Cafes), බේකරි සහ Dine-in / Takeaway ආහාර සැපයුම්කරුවන් සඳහාම නිර්මාණය කරන ලද **DIGIBIZ Restaurant OS** පද්ධතිය පිළිබඳ පූර්ණ විස්තරය.

![DIGIBIZ Restaurant & Cafe OS — Interactive Table Map, Live Kitchen Order Tickets (KOT) & Food Modifiers](/images/blog/restaurant-kot-table.jpg)

---

### 1. ප්‍රධාන ක්‍රියාකාරීත්වය (Core Restaurant Workflow)

* **Interactive Floor Table Map:** මේස අංක (Table 01 to 20) අනුව Live Status:
  * 🟢 **කොළ (Free):** හිස් මේස (ඇණවුම් ලබාගත හැක).
  * 🔴 **රතු (Occupied):** පාරිභෝගිකයින් සිටින මේස (ආහාර පිළියෙල වෙමින් පවතී).
  * 🟡 **තැඹිලි (Billed):** බිල්පත නිකුත් කර ඇති මේස.
* **Kitchen Order Tickets (KOT):** වේටර්වරයා ඇණවුම දැමූ සැණින් කුස්සියේ Printer එකෙන් KOT මුද්‍රණය වීම හෝ Kitchen Display System (KDS) තිරයේ පෙන්වීම.
* **Food Item Modifiers:** "Spicy Level 3", "Extra Cheese", "No Sugar", "Less Ice" වැනි පාරිභෝගික අභිමතයන් සටහන් කිරීම.
* **Dine-in, Takeaway & Delivery Modes:** කෑම ශාලාවේ කෑම, පාර්සල් සහ Uber Eats / PickMe Delivery ඇණවුම් එකම තිරයකින් පාලනය.

---

### 2. ආදර්ශ මේස සහ KOT ඇණවුම් සටහන (Sample Table & KOT Matrix)

| මේස අංකය (Table ID) | තත්වය (Table State) | වේටර්වරයා (Waiter) | ඇණවුම් කළ අයිතමයන් (Ordered Food Items) | Modifiers / Notes | බිල්පත් මුදල (LKR) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Table #01** | 🟢 නිදහස් (Free) | — | — | — | 0.00 |
| **Table #02** | 🔴 අමුත්තන් 4 (Occupied) | Nuwan | 2x Mixed Fried Rice (L), 1x Hot Butter Cuttlefish | Extra Spicy, No Ajinomoto | 6,850.00 |
| **Table #03** | 🟡 බිල් කර ඇත (Billed) | Kasun | 1x Chicken Pasta, 1x Margherita Pizza, 2x Cokes | Extra Cheese (+$1.50) | 5,450.00 |
| **Table #05** | 🔴 අමුත්තන් 2 (Occupied) | Nuwan | 2x Beef Burgers Combo, 2x Iced Coffee | Less Sugar, French Fries | 3,900.00 |
| **Takeaway #14** | 🟢 Ready for Pickup | Delivery Desk | 5x Chicken Biryani Packs, 5x Mint Sambol | Delivery Parcel Packed | 6,250.00 |

---

### 3. කුස්සියේ නිල KOT සහ පාරිභෝගික බිල්පත් ආකෘතිය (Kitchen KOT & Guest Bill)

\`\`\`text
======================================================================
                     *** KITCHEN ORDER TICKET (KOT) ***
======================================================================
KOT NO  : #KOT-8921                       TIME : 19:45:12
TABLE   : TABLE #02 (4 GUESTS)            WAITER: Nuwan
TYPE    : DINE-IN ORDER
----------------------------------------------------------------------
QTY    ITEM DESCRIPTION                   SPECIAL CHEF MODIFIERS
----------------------------------------------------------------------
 2     Mixed Fried Rice (Large)           >> EXTRA SPICY, LESS OIL
 1     Hot Butter Cuttlefish (Regular)    >> CRISPY, EXTRA CAPSICUM
 1     Devilled Chicken (Gravy)           >> NORMAL SPICE
 4     Fresh Lime Juice                   >> 2 WITH SUGAR, 2 NO SUGAR
======================================================================
               *** SEND TO MAIN KITCHEN CHEF ***
======================================================================
\`\`\`

---

### 4. Live Demo පරීක්ෂා කර බැලීම
* **Demo Portal:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@restaurant.com\`
* **Password:** \`123456\`
* **අදාළ මොඩියුල:** Tables Layout, Waiter Terminal, Kitchen KOT, Recipe Stock, Final Billing.`
    }
];

async function run() {
    console.log('🚀 Seeding comprehensive deep business guides to Firestore...');
    try {
        const idToken = await getSuperAdminToken();
        console.log('✅ Authenticated as Super Admin.');

        for (const guide of DEEP_GUIDES) {
            const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts/${guide.id}`;
            const payload = {
                fields: {
                    ...toFirestoreFields(guide),
                    createdAt: { timestampValue: new Date().toISOString() },
                    updatedAt: { timestampValue: new Date().toISOString() }
                }
            };

            const res = await fetch(docUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${idToken}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const err = await res.text();
                console.error(`❌ Error updating ${guide.id}:`, err);
            } else {
                console.log(`  + Published In-Depth Guide: [${guide.categoryLabel}] ${guide.title.slice(0, 50)}...`);
            }
        }

        console.log('🎉 Successfully published detailed long-form guides with tables & visuals!');
    } catch (e) {
        console.error('❌ Script execution error:', e);
    }
}

run();

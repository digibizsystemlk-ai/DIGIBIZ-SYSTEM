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

const AUTOCARE_POST = {
    id: 'guide-auto-care-vehicle-repair-job-cards',
    title: 'Auto Care, Garage & Vehicle Repair OS: Digital Job Cards, වාහන පරීක්ෂාව (Inspection), ඇස්තමේන්තු, අමතර කොටස් සහ SMS සේවා මතක්කිරීම් පිළිබඳ සම්පූර්ණ මාර්ගෝපදේශය',
    category: 'features',
    categoryLabel: 'Auto Care & Garage OS',
    icon: '🚗',
    author: 'DIGIBIZ Auto Care Engineering Systems',
    date: '2026-08-22',
    imageUrl: '/images/blog/autocare-jobcard-dashboard.jpg',
    published: true,
    desc: 'වාහන අලුත්වැඩියා මධ්‍යස්ථාන, සර්විස් ස්ටේෂන් සහ Garages සඳහා Digital Job Cards, 360° පරීක්ෂණ Checklist, කාර්මික ශිල්පී කොමිස් සහ ඊළඟ සර්විස් එකට ස්වයංක්‍රීය SMS යවන පූර්ණ Cloud පද්ධතිය.',
    content: `## 🚗 DIGIBIZ Auto Care & Vehicle Repair Management OS

ශ්‍රී ලංකාවේ මෝටර් රථ සේවා මධ්‍යස්ථාන (Auto Care Stations), ගැරේජ් (Garages), Body Wash & Service Centres සහ Hybrid / EV Repairing Hubs සඳහාම විශේෂයෙන් නිර්මාණය කරන ලද **DIGIBIZ Auto Care OS** පද්ධතිය පිළිබඳ සවිස්තරාත්මක මාර්ගෝපදේශය මෙසේ ඉදිරිපත් කරමු.

![DIGIBIZ Auto Care OS Master Dashboard — Real-time Job Cards Queue, Vehicle Status & Mechanics Allocation](/images/blog/autocare-jobcard-dashboard.jpg)

---

### 1. පද්ධතියේ ප්‍රධාන දැක්ම සහ විසඳුම් (Overview & Architecture)

සාම්ප්‍රදායිකව කඩදාසි Job Cards භාවිතයෙන් වාහන භාරගැනීමේදී සිදුවන අඩුපාඩු (වාහනයේ මුල් සීරීම් සහ අලාභහානි ලකුණු නොවීම, අමතර කොටස් අවභාවිතය, කාර්මික ශිල්පීන්ගේ වැඩ කොටස සහ කොමිස් නිවැරදිව නොගණනය වීම සහ පාරිභෝගිකයාට පසු විපරම් SMS නොයෑම) සම්පූර්ණයෙන්ම වළක්වා **100% Cloud-Enabled Smart Workshop** එකක් බවට ඔබේ ආයතනය පත් කිරීම මෙම පද්ධතියේ අරමුණයි.

> [!NOTE]
> ඕනෑම Android Tablet, iPad, Laptop හෝ Smart Mobile Phone එකකින් වැඩබිමේ සිටම Job Cards විවෘත කිරීම සහ ඡායාරූප සහිත වාහන පරීක්ෂාවන් සිදුකිරීමේ හැකියාව ඇත.

---

### 2. පියවරෙන් පියවර සේවා ක්‍රියාවලිය (End-to-End Workshop Workflow)

DIGIBIZ Auto Care OS තුළ වාහනයක් ඇතුළු වූ මොහොතේ සිට පාරිභෝගිකයා වෙත භාරදීම දක්වා වූ ක්‍රියාවලිය ප්‍රධාන පියවර 6 කින් ස්වයංක්‍රීයව සිදු වේ:

![Automobile Service Technician utilizing DIGIBIZ Digital Vehicle Inspection (DVI) Tablet in modern workshop](/images/blog/autocare-inspection-workflow.jpg)

| පියවර අංකය | ක්‍රියාවලිය (Workflow Stage) | විස්තරය සහ පද්ධති ක්‍රියාකාරීත්වය |
| :--- | :--- | :--- |
| **01. Gate-In & Registry** | වාහනය ඇතුළු කරගැනීම | අංක තහඩුව (Vehicle Reg No.) ඇතුළත් කළ සැණින් කලින් කළ සේවා ඉතිහාසය (Service History) ක්ෂණිකව තිරයට පැමිණේ. |
| **02. 360° Digital Inspection** | වාහන තත්ව පරීක්ෂාව (DVI) | 3D Car Diagram එක මත පවතින Scratches/Dents සටහන් කිරීම, ඉන්ධන මට්ටම (Fuel Level) සහ මීටර් කියවීම (Mileage) සටහන් කර පාරිභෝගික ඩිජිටල් අත්සන ලබාගැනීම. |
| **03. Live Job Card & Estimation** | ඇස්තමේන්තුව සකස් කිරීම | අවශ්‍ය සේවා (Labor) සහ අමතර කොටස් (Spare Parts) තෝරා ඇස්තමේන්තුව WhatsApp මඟින් පාරිභෝගිකයාට යවා අනුමැතිය ලබාගැනීම. |
| **04. Mechanic Assignment & Inventory** | වැඩ බෙදාදීම සහ තොග නිකුතුව | සුදුසු කාර්මික ශිල්පියාට Job එක පැවරීම. Main Stores වෙතින් Oil, Filters, Brake Pads නිකුත් වන විට Job Card එකට සෘජුවම Cost එක එකතු වීම. |
| **05. Quality Check & Testing** | තත්ත්ව පාලනය | Supervisor විසින් සියලු Checklist සම්පූර්ණ දැයි පරීක්ෂා කර "Ready for Delivery" තත්වයට පත් කිරීම. |
| **06. Final Invoice & Reminders** | අවසන් බිල්පත සහ SMS | මුද්‍රිත බිල්පත සහ WhatsApp Digital Invoice එක ලබා දීම. කි.මී. 5,000 කින් හෝ මාස 3 කින් ඊළඟ සර්විස් එක සඳහා Automated SMS Schedule වීම. |

---

### 3. සැබෑ වාහන පරීක්ෂා කිරීමේ ආදර්ශ සටහන (Sample Vehicle Inspection Matrix)

වාහනයක් භාරගන්නා අවස්ථාවේදී පද්ධතිය මඟින් සිදුකරන පූර්ණ පරීක්ෂණ දත්ත පහත පරිදි වාර්තාගත වේ:

| පරීක්ෂා කළ අංගය | ලියාපදිංචි තත්වය (Inspection Item) | සටහන් / මිණුම් (Status & Reading) | පාරිභෝගික අනුමැතිය |
| :--- | :--- | :--- | :--- |
| **Vehicle Registration** | WP CAA-1234 (Toyota Hilux Revo 2021) | Mileage: 45,210 km | ✅ තහවුරු කළා |
| **Fuel Level** | 3/4 Tank | Sensor Indicator Verified | ✅ තහවුරු කළා |
| **Engine Oil Condition** | කළු පැහැ වී ඇත (Degraded) | Full Flush & Change Required | ✅ මාරු කිරීමට අනුමතයි |
| **Brake Pads (Front/Rear)** | 2.8 mm (Low Thickness) | Replacement Recommended | ✅ අලුතින් යෙදීමට අනුමතයි |
| **Tire Tread Depth** | FL: 5.2mm, FR: 5.1mm, RL: 4.8mm, RR: 4.9mm | Good Condition | ✅ පරීක්ෂා කළා |
| **Body Condition / Scratches** | Rear Bumper වම්පස සුළු සීරීමක් ඇත | Photo Attached with Timestamp | ✅ පාරිභෝගිකයා දැනුවත්ය |

---

### 4. බිල්පත් සහ කාර්මික කොමිස් ගණනය කිරීමේ සූත්‍ර (Calculation Formulas)

DIGIBIZ Auto Care OS මඟින් අමතර කොටස් ලාභය, සේවා ගාස්තු සහ කාර්මික ශිල්පීන්ට හිමි කොමිස් මුදල් නිවැරදිව ගණනය කරන සූත්‍ර:

#### සේවා බිල්පතේ මුළු එකතුව (Total Service Invoice):
$$\text{Total Invoice Amount} = \text{Spare Parts Total} + \text{Labor Charges} + \text{Special Diagnostic Fees} - \text{Discount}$$

#### කාර්මික ශිල්පී කොමිස් මුදල (Mechanic Commission Calculation):
$$\text{Mechanic Commission} = \text{Labor Charge (Allocated Job)} \times \left(\frac{\text{Commission Rate \%}}{100}\right)$$

> [!TIP]
> උදාහරණයක් ලෙස, රු. 8,500 ක Labor Charge එකක් සඳහා 15% ක කාර්මික කොමිස් අනුපාතයක් තිබේ නම්, කාර්මික ශිල්පියාට හිමි මුදල $\text{LKR } 8,500 \times 0.15 = \text{LKR } 1,275$ ලෙස ස්වයංක්‍රීයව ඔහුගේ දෛනික වැටුප් ලෙජරයට බැර වේ.

---

### 5. ආදර්ශ අවසන් බිල්පත් සටහන (Sample Final Service Bill Breakdown)

පාරිභෝගික WP CAA-1234 (Toyota Hilux) සඳහා නිකුත් කරන ලද සැබෑ විස්තරාත්මක බිල්පත පහත දැක්වේ:

![DIGIBIZ Auto Care OS Final Printed Invoice & Digital WhatsApp Receipt Interface](/images/blog/autocare-final-invoice-slip.jpg)

| අයිතමය / සේවාව (Item / Service Description) | වර්ගය (Type) | ප්‍රමාණය | ඒකක මිල (LKR) | එකතුව (LKR) |
| :--- | :--- | :--- | :--- | :--- |
| **Toyota Fully Synthetic 5W-30 (4L + 1L)** | Spare Part | 1 Set | 24,500.00 | 24,500.00 |
| **Toyota Genuine Oil Filter (90915-YZZD2)** | Spare Part | 1 Nos | 4,000.00 | 4,000.00 |
| **Advics Front Ceramic Brake Pads Set** | Spare Part | 1 Set | 14,200.00 | 14,200.00 |
| **Full Engine Flush & Oil Change Labor** | Labor | 1 Job | 2,500.00 | 2,500.00 |
| **Front & Rear Brake Caliper Service Labor** | Labor | 1 Job | 4,500.00 | 4,500.00 |
| **Computer Engine Diagnostic Scan & Health Report**| Labor | 1 Scan | 1,500.00 | 1,500.00 |
| **මුළු එකතුව (Total Invoice Amount)** | **FINAL** | — | — | **LKR 51,200.00** |

---

### 6. නිල මුද්‍රිත Job Card සහ පාරිභෝගික WhatsApp රිසිට් ආකෘතිය

\`\`\`text
======================================================================
                   DIGIBIZ AUTO CARE & SERVICE HUB
             No. 128, Kandy Road, Kadawatha | Tel: 011-2345678
======================================================================
JOB CARD INVOICE : #DAC23102601           DATE   : 2026-08-22 10:45 AM
VEHICLE REG NO   : WP CAA-1234            MILEAGE: 45,210 km
VEHICLE MODEL    : Toyota Hilux Revo      ENGINE : 2.8L 1GD-FTV
CUSTOMER NAME    : Mr. Duminda Silva      MOBILE : 077-1234567
ASSIGNED MECHANIC: Liam M. (Bay #02)      STATUS : COMPLETED & TESTED
----------------------------------------------------------------------
ITEM / SERVICE DESCRIPTION                QTY    UNIT (LKR)   TOTAL (LKR)
----------------------------------------------------------------------
Toyota Synthetic 5W-30 Engine Oil (5L)   1 Set    24,500.00    24,500.00
Toyota Genuine Oil Filter                 1 Pcs     4,000.00     4,000.00
Advics Front Brake Pads Set               1 Set    14,200.00    14,200.00
Engine Periodic Service Labor             1 Job     2,500.00     2,500.00
Brake Caliper Servicing Labor             1 Job     4,500.00     4,500.00
ECU Diagnostic Health Scan                1 Job     1,500.00     1,500.00
----------------------------------------------------------------------
SUBTOTAL AMOUNT                                              LKR 51,200.00
SPECIAL WORKSHOP DISCOUNT                                         LKR 0.00
----------------------------------------------------------------------
NET TOTAL AMOUNT                                             LKR 51,200.00
PAID AMOUNT (Cash / Visa / Master)                           LKR 51,200.00
BALANCE DUE                                                       LKR 0.00
----------------------------------------------------------------------
NEXT SERVICE REMINDER SCHEDULE:
>> Recommended Next Service : At 50,210 km or within 90 Days.
>> Free WhatsApp Inspection Report: https://digibiz-sys.web.app/b/DAC231
======================================================================
         Thank you for your valued trust! Drive Safely.
======================================================================
\`\`\`

---

### 7. අමතර කොටස් තොග කළමනාකරණය (Spare Parts & Inventory Sync)

* **ස්වයංක්‍රීය අඩු වීම (Auto Deduct on Job Card):** Job Card එකකට Brake Pads හෝ Engine Oil එක් කළ සැනින් Main Stores හි තොග ප්‍රමාණය ස්වයංක්‍රීයව අඩු වේ.
* **Low Stock Reorder Alerts:** Oil Filters හෝ විශේෂිත Spark Plugs අවම තොග මට්ටමට (Re-order Level) ළඟා වූ විට Stores Manager ට ක්ෂණික SMS / Dashboard Alerts ලැබේ.
* **Part Number & Compatibility Matrix:** OEM Part Number හෝ Vehicle Chassis Model එක ඇතුළත් කර ගැලපෙන අමතර කොටස් සොයාගැනීමේ පහසුකම.

---

### 8. පාරිභෝගික සබඳතා සහ ස්වයංක්‍රීය SMS (Customer Retention & SMS CRM)

1. **Service Completion Alert:** වාහනයේ වැඩ අවසන් වූ සැණින් *"ගරු පාරිභෝගිකතුමනි, ඔබගේ WP CAA-1234 වාහනයේ සේවා කටයුතු අවසන් කර ඇත. රැගෙන යාමට පැමිණෙන්න."* ලෙස SMS පණිවිඩයක් නිකුත් වේ.
2. **Next Periodic Service Due Reminder:** දින 80 කට පසු හෝ ගණනය කරන ලද Mileage එක අනුව ඊළඟ සර්විස් එක සඳහා මතක් කිරීමේ පණිවිඩය (Automated SMS) පාරිභෝගිකයාගේ දුරකථනයට යැවේ.
3. **Vehicle Service History QR Code:** පාරිභෝගිකයාට තම වාහනයේ සම්පූර්ණ සේවා ඉතිහාසය QR Code එකක් Scan කර තමන්ගේ දුරකථනයෙන්ම බලාගත හැක.

---

### 9. Live Demo පද්ධතිය සජීවීව පරීක්ෂා කර බැලීම (Live Test Walkthrough)

* **Demo Access Portal:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@autocare.com\`
* **Password:** \`123456\`

#### පරීක්ෂා කළ හැකි පියවර:
1. ඉහත Credentials මඟින් Login වන්න.
2. වම්පස මෙනුවේ ඇති **🚗 Job Cards -> Active Work Orders** විවෘත කරන්න.
3. නව වාහනයක් සඳහා Job Card එකක් විවෘත කර, 360 Inspection ලකුණු කර, Spare Parts සහ Labor එක් කරන්න.
4. **Final Invoice** සකසා WhatsApp Digital PDF Receipt එක සහ SMS Reminders ක්‍රියාත්මක වන අයුරු සජීවීව අත්විඳින්න!

> [!TIP]
> ඔබේ Service Station එක හෝ Garage එක සඳහා අභිරුචිකරණය කර ගැනීමට DIGIBIZ ඉංජිනේරු කණ්ඩායම අමතන්න.`
};

async function run() {
    console.log('🚀 Updating Auto Care & Vehicle Repair Guide in Firestore...');
    try {
        const idToken = await getSuperAdminToken();
        console.log('✅ Authenticated as Super Admin.');

        const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts/${AUTOCARE_POST.id}`;
        
        function toFirestoreFields(obj) {
            const fields = {};
            for (const [k, v] of Object.entries(obj)) {
                if (typeof v === 'string') fields[k] = { stringValue: v };
                else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
                else if (typeof v === 'number') fields[k] = { integerValue: String(v) };
            }
            return fields;
        }

        const payload = {
            fields: {
                ...toFirestoreFields(AUTOCARE_POST),
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
            const errText = await res.text();
            throw new Error(`Firestore REST error: ${res.status} ${errText}`);
        }

        console.log('🎉 Successfully updated Auto Care Guide with Rich Long-Form Content & Visuals!');
    } catch (e) {
        console.error('❌ Error updating Auto Care Guide:', e);
    }
}

run();

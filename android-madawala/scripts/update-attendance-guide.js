/**
 * Update Attendance & Payroll Deep Guide with Full Rich Text & Visual Assets
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

const ATTENDANCE_POST = {
    id: 'guide-attendance-payroll-qr-shift-management',
    title: 'Attendance, QR Mobile Scanner & Payroll කළමනාකරණය: පැමිණීම් ලකුණු කිරීම, Shift Roster, OT සහ EPF/ETF වැටුප් පත්‍රිකා (Payslips) පිළිබඳ සර්ව සම්පූර්ණ මාර්ගෝපදේශය',
    category: 'features',
    categoryLabel: 'HR, Attendance & Payroll OS',
    icon: '⏱️',
    author: 'DIGIBIZ HR Engineering & Labour Systems',
    date: '2026-08-22',
    imageUrl: '/images/blog/attendance-payroll-banner.jpg',
    desc: 'ඕනෑම ව්‍යාපාරයක සේවක පැමිණීම Smartphone QR Scanner මඟින් තත්පර 1 කින් සටහන් කර, පැය 24 Shift Rosters, අතිකාල (OT), නිවාඩු, අත්තිකාරම් සහ ශ්‍රී ලංකා කම්කරු නීතියට අනුකූල EPF (8%/12%), ETF (3%) සහිත ස්වයංක්‍රීය පඩි පත්‍රිකා (Payslips) සකසන අයුරු.',
    published: true,
    content: `## ⏱️ DIGIBIZ Attendance, QR Scanner & Payroll Enterprise OS

ශ්‍රී ලංකාවේ සුළු හා මධ්‍ය පරිමාණ ව්‍යාපාර, කර්මාන්තශාලා (Factories), සුපිරි වෙළඳසැල්, හෝටල්, අවන්හල් සහ බෙදාහැරීමේ ආයතන සඳහා සේවක පැමිණීම (Staff Attendance), කාර්ය මුර (Shift Rosters) සහ මාසික වැටුප් (Monthly Payroll) 100% ස්වයංක්‍රීයව කළමනාකරණය කරන පූර්ණ Cloud පද්ධතියයි.

![DIGIBIZ Attendance & Payroll Dashboard Overview](/images/blog/attendance-payroll-banner.jpg)

---

### 1. පද්ධතියේ ප්‍රධාන අරමුණ සහ විශේෂතා (Enterprise HR Overview)

සාම්ප්‍රදායික පැමිණීමේ පොත් (Attendance Registers) සහ අධික නඩත්තු වියදම් සහිත Fingerprint යන්ත්‍ර වෙනුවට, ඕනෑම සාමාන්‍ය Smartphone එකක් හෝ Tablet එකක් හරහා ක්‍රියාත්මක වන මෙම පද්ධතිය මඟින්:
* **Zero-Hardware Attendance Scanner:** කිසිදු මිල අධික Fingerprint මැෂින් එකක් අවශ්‍ය නොවේ. ආරක්ෂක නිලධාරියාගේ හෝ Supervisor ගේ Smartphone එකෙන් සේවක QR Badge එක Scan කළ සැනින් In/Out සටහන් වේ.
* **Instant 1-Second Verification:** එක් සේවකයෙකුගේ පැමිණීම සටහන් කිරීමට ගතවන්නේ තත්පර 1 කටත් අඩු කාලයකි. උදෑසන පෝලිම් ගැසීම් සම්පූර්ණයෙන්ම නැතිවේ.
* **24/7 Multi-Shift Roster Engine:** Day Shift, Night Shift, Rotational Shift සහ Split Shift ස්වයංක්‍රීයව හඳුනාගෙන ක්‍රියාත්මක වේ.
* **Automated Day & Night Overtime (OT):** පැමිණි සහ පිටවූ වේලාව අනුව සාමාන්‍ය OT (1.5x) සහ නිවාඩු දින Double OT (2.0x) ස්වයංක්‍රීයව ගණනය වීම.
* **Sri Lanka Labour Law Compliant Payroll:** Employee EPF 8%, Employer EPF 12%, Employer ETF 3%, Budgetary Relief Allowances (BRA), Attendance Incentive සහ Stamp Duty නිවැරදිව ගණනය වීම.
* **1-Click WhatsApp & Email Payslips:** මාසය අවසානයේ එක් ක්ලික් එකකින් සියලුම සේවකයින්ගේ WhatsApp ගිණුම්වලට නිල PDF Payslip එක යොමු වීම.

---

### 2. Smartphone QR Code Scanner ක්‍රියාකාරීත්වය (Mobile QR Attendance Architecture)

![Smartphone Staff QR Badge Scanner in Action](/images/blog/attendance-qr-scanner.jpg)

#### පියවරෙන් පියවර ක්‍රියාත්මක වන ආකාරය:
1. **සේවක QR Badge එක මුද්‍රණය කිරීම:**
   * \`Employees -> ID Cards\` මොඩියුලයට ගොස් එක් එක් සේවකයාගේ ඡායාරූපය, නම, තනතුර, සේවක අංකය (Staff ID) සහ Unique QR Code එක සහිත ID Badge එක තනි ක්ලික් එකකින් Print කර ලබාදෙන්න.
2. **ආරක්ෂක මුරපොළේදී (Gate / Reception) Scan කිරීම:**
   * ඕනෑම Android Phone එකකින් හෝ Tablet එකකින් DIGIBIZ Mobile Scanner තිරය විවෘත කරන්න.
   * සේවකයා තම QR Badge එක කැමරාව ඉදිරියට ඇල්ලූ සැණින්:
     * 🟢 **කොළ පැහැති Verification Tick එකක් සමඟින් සේවකයාගේ ඡායාරූපය සහ නම තිරයේ දිස්වේ.**
     * ⏰ **Clock-In වේලාව සහ දිනය සටහන් වේ.**
     * 📍 **GPS Location එක තහවුරු වේ.**
3. **පිටවීම (Clock-Out) ස්වයංක්‍රීයව හඳුනාගැනීම:**
   * සේවකයා සවස පිටවන විට නැවත Badge එක Scan කළ විට පද්ධතිය එය ස්වයංක්‍රීයව Clock-Out ලෙස හඳුනාගෙන එදින වැඩ කළ මුළු පැය ගණන (Total Working Hours) සටහන් කරයි.

> [!TIP]
> **Buddy Punching වැළැක්වීම:** සෑම Scan එකකදීම සේවකයාගේ සත්‍ය ඡායාරූපය සහ සේවක අංකය තිරයේ ලොකුවට දිස්වන බැවින් එක් අයෙකුගේ කාඩ්පතක් වෙනත් අයෙකුට Scan කළ නොහැක.

---

### 3. කාර්ය මුර (Shift Rosters) සහ ප්‍රමාද සහන කාලය (Late Deductions)

කර්මාන්තශාලා, හෝටල් සහ 24/7 ක්‍රියාත්මක වන ආයතන සඳහා ඕනෑම Shift වර්ගයක් පහසුවෙන් සැකසිය හැක:

| Shift නම | ආරම්භක වේලාව | අවසන් වේලාව | සහන කාලය (Grace Period) | OT ආරම්භය |
| :--- | :---: | :---: | :---: | :---: |
| **Morning General Shift** | 08:00 AM | 05:00 PM | විනාඩි 15 (08:15 AM දක්වා) | 05:00 PM පසු |
| **Day Shift (Industrial)** | 06:00 AM | 02:00 PM | විනාඩි 10 (06:10 AM දක්වා) | 02:00 PM පසු |
| **Evening / Night Shift** | 02:00 PM | 10:00 PM | විනාඩි 10 (02:10 PM දක්වා) | 10:00 PM පසු |
| **Overnight Full Shift** | 10:00 PM | 06:00 AM | විනාඩි 15 (10:15 PM දක්වා) | 06:00 AM පසු |

#### ප්‍රමාද වී පැමිණීම් (Late Penalty System):
* සේවකයෙකු සහන කාලය (Grace Period) ඉක්මවා ප්‍රමාද වූ විට (උදා: උදෑසන 08:30 ට පැමිණි විට), පද්ධතිය ස්වයංක්‍රීයව විනාඩි 30 ක ප්‍රමාදයක් සටහන් කරයි.
* ආයතනයේ ප්‍රතිපත්තිය අනුව මසකට ප්‍රමාද වීම් 3 කට වඩා සිදුවුවහොත් පැය බාගයක හෝ පැයක වැටුප් කැපීමක් ස්වයංක්‍රීයව වැටුප් පත්‍රිකාවට එක් කළ හැක.

---

### 4. අතිකාල (OT) සහ නිවාඩු දින ගණනය කිරීමේ සූත්‍ර (Automated OT Engine)

ශ්‍රී ලංකා කම්කරු නීතියට අනුව සාමාන්‍ය සේවා පැය 8 ඉක්මවා වැඩ කරන සෑම පැයකටම සහ නිවාඩු දින සඳහා OT ගණනය කෙරේ:

#### 1. සාමාන්‍ය දින අතිකාල (Normal Day OT - 1.5x):
$$\text{Hourly Basic Rate} = \frac{\text{Basic Salary} + \text{BRA Allowances}}{200 \text{ Hours}}$$
$$\text{Normal OT Amount} = \text{Hourly Rate} \times 1.5 \times \text{Normal OT Hours}$$

#### 2. ඉරිදා සහ නිවාඩු දින අතිකාල (Holiday Double OT - 2.0x):
$$\text{Double OT Amount} = \text{Hourly Rate} \times 2.0 \times \text{Holiday Hours}$$

---

### 5. ශ්‍රී ලංකා EPF/ETF සහ මාසික වැටුප් පද්ධතිය (Statutory Payroll Breakdown)

![Monthly Payroll Summary Table and Individual Payslip Breakdown](/images/blog/attendance-payroll-payslip.jpg)

#### සේවක සහ සේවායෝජක දායකත්වයන් (Statutory Contributions):
* **Employee EPF (සේවක දායකත්වය):** මුලික වැටුපෙන් **8%** ක් සේවකයාගේ වැටුපෙන් අඩු වේ.
* **Employer EPF (සේවායෝජක දායකත්වය):** ආයතනය මඟින් මුලික වැටුපට අමතරව **12%** ක් EPF අරමුදලට ගෙවයි.
* **Employer ETF (සේවායෝජක භාරකාර අරමුදල):** ආයතනය මඟින් මුලික වැටුපට අමතරව **3%** ක් ETF අරමුදලට ගෙවයි.

---

### 6. සැබෑ දත්ත සහිත Sample Master Payroll Sheet (මාසික වැටුප් සටහන)

පහත දැක්වෙන්නේ විවිධ තනතුරු 5 ක සේවකයින් සඳහා DIGIBIZ පද්ධතියෙන් ගණනය කරන ලද සැබෑ මාසික වැටුප් ලැයිස්තුවකි:

| සේවක අංකය | සේවකයාගේ නම | තනතුර | මුලික වැටුප (රු.) | OT පැය | OT මුදල (රු.) | දීමනා (රු.) | Gross Salary (රු.) | EPF 8% (රු.) | අත්තිකාරම් / ණය (රු.) | ශුද්ධ වැටුප (Net Pay) |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **EMP-001** | කසුන් පෙරේරා | Senior Machine Operator | 55,000.00 | 24.5 | 10,106.25 | 8,000.00 | 73,106.25 | 4,400.00 | 5,000.00 | **Rs. 63,706.25** |
| **EMP-002** | නිමාලි ප්‍රනාන්දු | Cashier & Customer Care | 45,000.00 | 12.0 | 4,050.00 | 5,000.00 | 54,050.00 | 3,600.00 | 0.00 | **Rs. 50,450.00** |
| **EMP-003** | සුනිල් ජයවර්ධන | Delivery Driver (Heavy) | 50,000.00 | 38.0 | 14,250.00 | 12,000.00 | 76,250.00 | 4,000.00 | 10,000.00 | **Rs. 62,250.00** |
| **EMP-004** | චතුරංග දිසානායක | Quality Control Supervisor | 75,000.00 | 10.0 | 5,625.00 | 10,000.00 | 90,625.00 | 6,000.00 | 0.00 | **Rs. 84,625.00** |
| **EMP-005** | රුවනි වික්‍රමසිංහ | Office Admin & Accounts | 60,000.00 | 5.0 | 2,250.00 | 6,000.00 | 68,250.00 | 4,800.00 | 2,000.00 | **Rs. 61,450.00** |
| **මුළු එකතුව** | **(5 Employees Total)** | | **285,000.00** | **89.5h** | **36,281.25** | **41,000.00** | **362,281.25** | **22,800.00** | **17,000.00** | **Rs. 322,481.25** |

---

### 7. නිල මුද්‍රිත පඩි පත්‍රිකාව (Official Digital / Print Payslip Breakdown)

\`\`\`text
================================================================================
                           DIGIBIZ ENTERPRISES (PVT) LTD
                       124, Galle Road, Colombo 03, Sri Lanka
                          PAYSLIP FOR THE MONTH: MAY 2026
================================================================================
Employee No   : EMP-001                     Designation   : Senior Machine Operator
Employee Name : Mr. Kasun Perera            Department    : Production & Maintenance
EPF Number    : 45892                       Bank Account  : Commercial Bank - 8001429811
Days Worked   : 26 Days                     Normal OT Hrs : 24.5 Hours
--------------------------------------------------------------------------------
[1] EARNINGS (ආදායම් විස්තරය)               [2] DEDUCTIONS (අඩුකිරීම් විස්තරය)
--------------------------------------------------------------------------------
Basic Salary              : Rs. 55,000.00   Employee EPF (8%)         : Rs.  4,400.00
Budgetary Relief (BRA)    : Rs.  3,000.00   Salary Advance Deducted   : Rs.  5,000.00
Attendance Incentive      : Rs.  5,000.00   Staff Loan Monthly Inst.  : Rs.  3,000.00
Normal Overtime (24.5h)   : Rs. 10,106.25   Late Attendance Fine      : Rs.    500.00
Traveling Allowance       : Rs.  4,000.00   Stamp Duty                : Rs.     25.00
--------------------------------------------------------------------------------
TOTAL GROSS EARNINGS      : Rs. 77,106.25   TOTAL DEDUCTIONS          : Rs. 12,925.00
================================================================================
NET SALARY PAYABLE (ගෙවිය යුතු ශුද්ධ වැටුප) : Rs. 64,181.25
(In Words: Sri Lankan Rupees Sixty Four Thousand One Hundred Eighty One and 25/100 Only)
================================================================================
EMPLOYER CONTRIBUTIONS (ආයතනික දායකත්වය):
  * Employer EPF (12%) : Rs. 6,600.00
  * Employer ETF (3%)  : Rs. 1,650.00
--------------------------------------------------------------------------------
Prepared By: Accounts Dept.     Checked By: HR Manager      Employee Signature: ________
================================================================================
\`\`\`

---

### 8. 1-Click Bank Direct Transfer (බැංකු හරහා වැටුප් ගෙවීම)

* වැටුප් ලැයිස්තුව අනුමත කළ පසු, **Bank Direct Upload (CSV / TXT)** බොත්තම මඟින්:
  * Commercial Bank (PayMaster Format)
  * Bank of Ceylon (BOC Online Format)
  * People's Bank (Corporate Bulk Pay)
  * Sampath Bank (Set-e-Pay Format)
  * Hatton National Bank (HNB Bulk Transfer)
* සඳහා වන ගොනුව තත්පර 2 කින් Download කර ගත හැක. අතින් එක් එක් ගිණුමට මුදල් දැමීම අවශ්‍ය නොවේ.

---

### 9. දෘඩාංග ගැළපීම සහ ආරක්ෂාව (Hardware Specs & Security)
* **පැමිණීම් උපාංග:** ඕනෑම Android Phone, iPhone, iPad, Android Tablet හෝ Webcam සහිත Laptop.
* **මුද්‍රණ යන්ත්‍ර:** A4 Laser Printers, Thermal Receipt Printers (Slip මුද්‍රණයට).
* **Cloud Security:** බැංකු මට්ටමේ SSL 256-bit Encryption, දෛනික Automated Firestore Backups සහ Staff Role-Based Permissions (HR Manager ට පමණක් වැටුප් බැලීමේ හැකියාව).

---

### 10. Live Demo පද්ධතිය සජීවීව පරීක්ෂා කර බැලීම (Live Test Walkthrough)

* **Demo Access Portal:** [https://digibiz-sys.web.app/#demo](https://digibiz-sys.web.app/#demo)
* **Demo Email:** \`test@attendance.com\`
* **Password:** \`123456\`

#### පරීක්ෂා කර බැලිය හැකි ප්‍රධාන පියවර:
1. ඉහත Credentials මඟින් Login වන්න.
2. වම්පස මෙනුවේ ඇති **⏱️ Attendance -> QR Scanner** විවෘත කරන්න.
3. සේවකයින්ගේ QR Code එකක් Scan කර තත්පර 1 කින් In/Out ලකුණු වන අයුරු බලන්න.
4. **Shift Roster** වෙත ගොස් සේවකයින්ගේ Shifts සහ නිවාඩු සකසන්න.
5. **Payroll Engine** විවෘත කර **"Calculate Monthly Payroll"** ක්ලික් කර EPF/ETF සහිත සම්පූර්ණ වැටුප් වාර්තාව සහ WhatsApp Payslip සකසන ආකාරය සජීවීව අත්විඳින්න!

> [!TIP]
> ඔබේ ආයතනයට ගැලපෙන අයුරින් අභිරුචිකරණය කර ගැනීමට අපගේ ඉංජිනේරු කණ්ඩායම අමතන්න.`
};

async function run() {
    console.log('🚀 Updating Attendance & Payroll Guide in Firestore...');
    try {
        const idToken = await getSuperAdminToken();
        console.log('✅ Authenticated as Super Admin.');

        const docUrl = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/blog_posts/${ATTENDANCE_POST.id}`;
        const payload = {
            fields: {
                ...toFirestoreFields(ATTENDANCE_POST),
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

        if (res.ok) {
            console.log('🎉 Successfully updated Attendance & Payroll Guide with Rich Long-Form Content & Visuals!');
        } else {
            console.error('❌ Failed:', await res.text());
        }
    } catch(e) {
        console.error('❌ Error:', e);
    }
}

run();

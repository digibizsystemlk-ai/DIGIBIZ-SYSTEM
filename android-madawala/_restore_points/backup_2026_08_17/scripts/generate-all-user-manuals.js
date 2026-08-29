/**
 * User Manuals Generator for All DIGIBIZ Business Models
 * Generates beautiful, responsive, Sinhala step-by-step User Manuals (user-manual.html)
 * for each vertical with real links, workflow tips, and accounting integration.
 */
const fs = require('fs');
const path = require('path');

const manuals = [
    {
        verticalId: 'retail',
        dir: path.resolve(__dirname, '../public/modules/retail'),
        title: 'Retail / Supermarket භාවිත මාර්ගෝපදේශය',
        badge: '🛒 Retail & Supermarket POS Guide',
        desc: 'DIGIBIZ Retail පද්ධතිය මගින් සුපිරි වෙළඳසැල් සහ සිල්ලර වෙළඳසැල් වල Point of Sale (POS), Barcode Scanning, තොග කළමනාකරණය, සහ ආදායම් වාර්තා නිවැරදිව පවත්වාගෙන යාමේ අත්පොත.',
        steps: [
            {
                num: '01',
                title: 'පද්ධතියට ප්‍රවේශ වීම සහ Business Profile',
                subtitle: 'Login, Store Details & Cashier Accounts',
                items: [
                    'ඔබේ ලියාපදිංචි Email හා Password මගින් Login වන්න.',
                    'Profile පිටුවට ගොස් ආයතනයේ නම, ලිපිනය, සහ දුරකථන අංක නිවැරදි කරන්න (බිල්පත් මත මෙම තොරතුරු මුද්‍රණය වේ).',
                    'Cashier සහ Store Keeper සඳහා අවශ්‍ය පරිශීලක ගිණුම් සාදා බලතල ලබාදෙන්න.'
                ],
                tip: 'බිල්පත් මුද්‍රණයේදී Header එකෙහි ඔබේ කඩේ නම හා ලිපිනය නිවැරදිව දිස්වීමට Profile තොරතුරු යාවත්කාලීන කරන්න.',
                link: '/modules/company/profile.html',
                linkText: '🏢 Profile පිටුවට යන්න ➔'
            },
            {
                num: '02',
                title: 'භාණ්ඩ සහ තොග ඇතුළත් කිරීම (Products & Inventory)',
                subtitle: 'Barcodes, Categories, Selling Prices & Cost Prices',
                items: [
                    'Inventory පිටුවට ගොස් නව භාණ්ඩ එක් කරන්න.',
                    'භාණ්ඩයේ Barcode අංකය, නම, විකුණුම් මිල, පිරිවැය සහ පවතින තොගය ඇතුළත් කරන්න.',
                    'අවම තොග මට්ටම (Low Stock Alert Level) නියම කරන්න.'
                ],
                tip: 'Barcode Scanner එකක් භාවිතයෙන් ඉතා වේගයෙන් භාණ්ඩ වල Barcodes පද්ධතියට Scan කර ඇතුළත් කළ හැක.',
                link: '/modules/retail/inventory.html',
                linkText: '📦 Inventory පිටුවට යන්න ➔'
            },
            {
                num: '03',
                title: 'Point of Sale (POS) මගින් බිල්පත් මුද්‍රණය',
                subtitle: 'Barcode Scanning, Cash / Card Payments & Thermal Receipt Print',
                items: [
                    'POS තිරයට ගොස් Barcode Scan කරන්න හෝ භාණ්ඩ නම ටයිප් කර තෝරන්න.',
                    'මුදල් (Cash), කාඩ්පත් (Card), හෝ ණය (Credit) ආකාරයෙන් ගෙවීම් ලබාගන්න.',
                    'Print Bill ක්ලික් කර 58mm හෝ 80mm POS Thermal Receipt එක ක්ෂණිකව ලබාදෙන්න.'
                ],
                tip: 'බිල්පතක් නිකුත් කළ සැණින් භාණ්ඩ තොගය ස්වයංක්‍රීයව අඩු වී Sales Journal එකක් ಲියවේ.',
                link: '/modules/retail/pos.html',
                linkText: '🛒 POS තිරයට යන්න ➔'
            },
            {
                num: '04',
                title: 'සැපයුම්කරුවන් සහ GRN මිලදී ගැනීම් (Purchases & Suppliers)',
                subtitle: 'Supplier Invoices, Goods Received Notes & Cost Valuation',
                items: [
                    'Suppliers පිටුවෙන් ඔබේ තොග සැපයුම්කරුවන් ලියාපදිංචි කරන්න.',
                    'GRN පිටුව හරහා ලැබුණු බඩු තොග පද්ධතියට ඇතුළත් කර ගබඩා තොගය යාවත්කාලීන කරන්න.',
                    'සැපයුම්කරුවන්ට ගෙවීමට ඇති මුදල් (Accounts Payable) පාලනය කරන්න.'
                ],
                link: '/modules/retail/grn.html',
                linkText: '📥 GRN පිටුවට යන්න ➔'
            },
            {
                num: '05',
                title: 'හානිවූ සහ කල්ඉකුත් වූ භාණ්ඩ (Spoilage & Damage)',
                subtitle: 'Expired Goods, Damage Stock Write-off & Loss Accounting',
                items: [
                    'කල්ඉකුත් වූ හෝ හානිවූ භාණ්ඩ Spoilage පිටුව හරහා සටහන් කරන්න.',
                    'එම භාණ්ඩ වල පිරිවැය Loss Expense එකක් ලෙස ස්වයංක්‍රීයව ගණනය වේ.'
                ],
                link: '/modules/retail/spoilage.html',
                linkText: '⚠️ Spoilage පිටුවට යන්න ➔'
            },
            {
                num: '06',
                title: 'මූල්‍ය ලෙජරය සහ ආදායම් වාර්තා (Accounting & Daily Reports)',
                subtitle: 'Daily Sales Totals, Cash Drawer Balance & P&L Statement',
                items: [
                    'දවසේ මුළු අලෙවිය, ලාභය සහ Cash Drawer එකේ ඇති මුදල් Dashboard එකෙන් නිරීක්ෂණය කරන්න.',
                    'Advanced Accounting Dashboard මගින් Income Statement, Balance Sheet හා Trial Balance බලාගන්න.'
                ],
                link: '/modules/accounts/advanced-accounting-dashboard.html',
                linkText: '📁 Accounting වෙත යන්න ➔'
            }
        ]
    },
    {
        verticalId: 'tire_centre',
        dir: path.resolve(__dirname, '../public/modules/tire_centre'),
        title: 'Tire Center භාවිත මාර්ගෝපදේශය',
        badge: '🛞 Tire & Battery Center Guide',
        desc: 'ටයර් අලෙවිය, වීල් එලයින්මන්ට්, බැටරි සේවා සහ පාරිභෝගික වාහන ඉතිහාසය කාර්යක්ෂමව පාලනය කිරීමේ සම්පූර්ණ අත්පොත.',
        steps: [
            {
                num: '01',
                title: 'ටයර් සහ බැටරි තොග ඇතුළත් කිරීම (Tire & Battery Stock)',
                subtitle: 'Sizes, Brands (DSI, CEAT, Dunlop), Batch & Selling Rates',
                items: [
                    'Inventory පිටුවට ගොස් ටයර් ප්‍රමාණය (Size - උදා: 185/65 R15), Brand එක සහ විකුණුම් මිල ඇතුළත් කරන්න.',
                    'බැටරි වර්ග (Exide, Amaron) සහ Warranty කාලසීමාවන් සටහන් කරන්න.'
                ],
                link: '/modules/tire_centre/inventory.html',
                linkText: '📦 Inventory පිටුවට යන්න ➔'
            },
            {
                num: '02',
                title: 'සේවා ලැයිස්තුව සැකසීම (Services Catalog)',
                subtitle: '3D Alignment, Wheel Balancing, Puncture Repairs & Nitrogen Air',
                items: [
                    'Services පිටුවෙන් Wheel Alignment, Wheel Balancing, Tube/Tubeless Repairs සඳහා වන ගාස්තු ඇතුළත් කරන්න.'
                ],
                link: '/modules/tire_centre/services.html',
                linkText: '🛠️ Services පිටුවට යන්න ➔'
            },
            {
                num: '03',
                title: 'POS බිල්පත් සහ වාහන අංකය ඇතුළත් කිරීම (POS & Vehicle Billing)',
                subtitle: 'Vehicle Number, Tire Serial Numbers, Warranty & Combined Bill',
                items: [
                    'POS තිරයේදී පාරිභෝගිකයාගේ වාහන අංකය (Vehicle No) ඇතුළත් කරන්න.',
                    'අලෙවි කරන ටයර් සහ සිදුකළ සේවා එකම බිල්පතකට ඇතුළත් කර මුද්‍රණය කරන්න.'
                ],
                link: '/modules/tire_centre/pos.html',
                linkText: '🛒 POS තිරයට යන්න ➔'
            },
            {
                num: '04',
                title: 'පාරිභෝගික සහ වාහන සේවා ඉතිහාසය (Customer Vehicle History)',
                subtitle: 'Mileage Tracking, Previous Tire Sizes & Repeat Service',
                items: [
                    'Customers පිටුවෙන් ඕනෑම වාහන අංකයක් සෙවීම මගින් කලින් දැමූ ටයර් වර්ග සහ දිනයන් ක්ෂණිකව බලාගත හැක.'
                ],
                link: '/modules/tire_centre/customers.html',
                linkText: '👥 Customers පිටුවට යන්න ➔'
            },
            {
                num: '05',
                title: 'දෛනික ගනුදෙනු සහ මූල්‍ය පාලනය (Daily Workbench & Accounts)',
                subtitle: 'Daily Cash Inflow, Card Settlements, Expenses & P&L',
                items: [
                    'Workbench සහ Accounting පිටු මගින් දවසේ ශුද්ධ ආදායම හා වියදම් නිරීක්ෂණය කරන්න.'
                ],
                link: '/modules/tire_centre/workbench.html',
                linkText: '📋 Workbench වෙත යන්න ➔'
            }
        ]
    },
    {
        verticalId: 'auto_care',
        dir: path.resolve(__dirname, '../public/modules/auto_care'),
        title: 'Auto Care & Repair Center භාවිත මාර්ගෝපදේශය',
        badge: '🚗 Auto Care & Garage Guide',
        desc: 'වාහන අලුත්වැඩියා මධ්‍යස්ථාන සහ සේවා පියසවල් සඳහා Job Cards, Vehicle Inspection, Spare Parts, Invoicing සහ SMS Alerts කළමනාකරණ අත්පොත.',
        steps: [
            {
                num: '01',
                title: 'නව Job Card එකක් ආරම්භ කිරීම (Opening a Job Card)',
                subtitle: 'Vehicle No, Mileage, Customer Phone, Fuel Level & Complaints',
                items: [
                    'Job Cards පිටුවට ගොස් ➕ New Job Card ඔබන්න.',
                    'වාහන අංකය, මාදිලිය (Model), ධාවනය කර ඇති කිලෝමීටර් ගණන (Mileage) සහ පාරිභෝගිකයාගේ පැමිණිලි සටහන් කරන්න.',
                    'අදාළ කාර්මික ශිල්පියා (Assigned Mechanic) තෝරන්න.'
                ],
                link: '/modules/auto_care/job-cards.html',
                linkText: '📋 Job Cards පිටුවට යන්න ➔'
            },
            {
                num: '02',
                title: 'වාහන පරීක්ෂාව සහ තක්සේරු (Vehicle Inspection & Estimations)',
                subtitle: 'Checklist, Required Spare Parts, Labor Estimation & Customer Approval',
                items: [
                    'Inspections පිටුවෙන් වාහනයේ තත්ත්වය පරීක්ෂා කර ලකුණු කරන්න.',
                    'Estimations පිටුවෙන් ඇස්තමේන්තුගත මුදල සකසා පාරිභෝගික අනුමැතිය ලබාගන්න.'
                ],
                link: '/modules/auto_care/estimations.html',
                linkText: '📄 Estimations පිටුවට යන්න ➔'
            },
            {
                num: '03',
                title: 'መለዋወට කොටස් සහ සේවා ගාස්තු (Spare Parts & Services)',
                subtitle: 'Filters, Engine Oils, Brake Pads, Labor Charges & Inventory',
                items: [
                    'වාහනයට යෙදූ Engine Oil, Filters, Spark Plugs ඇතුළු අමතර කොටස් Job Card එකට එක් කරන්න.',
                    'Spare Parts Inventory එකෙන් තොග ස්වයංක්‍රීයව අඩු වේ.'
                ],
                link: '/modules/auto_care/inventory.html',
                linkText: '⚙️ Spare Parts පිටුවට යන්න ➔'
            },
            {
                num: '04',
                title: 'අවසන් ඉන්වොයිසිය සහ SMS දැනුම්දීම් (Final Invoicing & SMS)',
                subtitle: 'Final Invoice Print, Next Service Date & Automatic SMS to Customer',
                items: [
                    'වැඩ අවසන් වූ පසු Invoicing පිටුවෙන් අංගසම්පූර්ණ Detailed Invoice එකක් මුද්‍රණය කර දෙන්න.',
                    'වාහනය සූදානම් බවට පාරිභෝගිකයාගේ දුරකථනයට SMS පණිවිඩයක් යවන්න.'
                ],
                link: '/modules/auto_care/invoicing.html',
                linkText: '🧾 Invoicing පිටුවට යන්න ➔'
            }
        ]
    },
    {
        verticalId: 'pharmacy',
        dir: path.resolve(__dirname, '../public/modules/pharmacy'),
        title: 'Pharmacy (ඖෂධහල්) භාවිත මාර්ගෝපදේශය',
        badge: '💊 Pharmacy & Medicine Guide',
        desc: 'ඖෂධ අලෙවිය, කල්ඉකුත් වීමේ අනතුරු ඇඟවීම් (Expiry Alerts), Generic Names සහ බෙහෙත් වට්ටෝරු පාලනය කිරීමේ නිල අත්පොත.',
        steps: [
            {
                num: '01',
                title: 'ඖෂධ තොග ඇතුළත් කිරීම (Medicine Master & Batch Tracking)',
                subtitle: 'Generic Name, Brand Name, Batch No, Expiry Date & Pack Size',
                items: [
                    'Inventory පිටුවට ගොස් ඖෂධයේ වෙළඳ නාමය සහ Generic නාමය ඇතුළත් කරන්න.',
                    'Batch අංකය සහ කල්ඉකුත් වන දිනය (Expiry Date) අනිවාර්යයෙන් සටහන් කරන්න.'
                ],
                link: '/modules/pharmacy/inventory.html',
                linkText: '📦 Pharmacy Inventory වෙත යන්න ➔'
            },
            {
                num: '02',
                title: 'Pharmacy Point of Sale (POS)',
                subtitle: 'Dosage Selection, Fast Generic Search & Prescription Billing',
                items: [
                    'POS තිරයේදී Brand නමෙන් හෝ Generic නමෙන් ඖෂධ සොයා තෝරන්න.',
                    'පෙති (Tablets), කරල් (Capsules) හෝ Bottles ප්‍රමාණය අනුව ඉක්මනින් බිල් කරන්න.'
                ],
                link: '/modules/pharmacy/pos.html',
                linkText: '🛒 Pharmacy POS වෙත යන්න ➔'
            },
            {
                num: '03',
                title: 'කල්ඉකුත් වීමේ අනතුරු ඇඟවීම් (Expiry Alerts)',
                subtitle: 'Near-Expiry Tracking, Expired Drug Segregation & Supplier Returns',
                items: [
                    'Expiry Alerts පිටුවෙන් ඉදිරි මාස 1, 3, 6 තුළ කල්ඉකුත් වීමට නියමිත ඖෂධ කල්තියා හඳුනාගන්න.',
                    'අවදානම් තොග සැපයුම්කරු වෙත ආපසු භාරදීමට කටයුතු කරන්න.'
                ],
                link: '/modules/pharmacy/expiry.html',
                linkText: '⚠️ Expiry Alerts පිටුවට යන්න ➔'
            }
        ]
    },
    {
        verticalId: 'hardware',
        dir: path.resolve(__dirname, '../public/modules/hardware'),
        title: 'Hardware & Construction භාවිත මාර්ගෝපදේශය',
        badge: '🔧 Hardware & Materials Guide',
        desc: 'සිමෙන්ති, යකඩ, පීවීසී, තීන්ත, බර මිනුම් සහ කොන්ත්‍රාත්කරුවන්ගේ ණය කළමනාකරණ අත්පොත.',
        steps: [
            {
                num: '01',
                title: 'දෘඩාංග තොග සහ ඒකක පරිවර්තනය (Units & Bulk Stock)',
                subtitle: 'Pieces, Kilograms, Feet, Liters & Bundle Measurements',
                items: [
                    'සිමෙන්ති, වැලි, වානේ කම්බි සහ PVC බට වල දිග/බර ඒකක අනුව තොග ඇතුළත් කරන්න.',
                    'තොග මිල (Wholesale) සහ සිල්ලර මිල (Retail) වෙන් වෙන්ව නියම කරන්න.'
                ],
                link: '/modules/hardware/inventory.html',
                linkText: '📦 Hardware Stock පිටුවට යන්න ➔'
            },
            {
                num: '02',
                title: 'Hardware POS & Quotations (මිල ගණන් සහ බිල්පත්)',
                subtitle: 'Instant Delivery Orders, Loading Slips & Contractor Credit',
                items: [
                    'POS පිටුවෙන් සාමාන්‍ය බිල්පත් මෙන්ම කොන්ත්‍රාත්කරුවන් සඳහා Quotations සකසන්න.',
                    'ණය සීමාවන් (Credit Limits) නිරීක්ෂණය කරමින් අලෙවිය සිදුකරන්න.'
                ],
                link: '/modules/hardware/pos.html',
                linkText: '🛒 Hardware POS වෙත යන්න ➔'
            }
        ]
    },
    {
        verticalId: 'manufacturer',
        dir: path.resolve(__dirname, '../public/modules/manufacturer'),
        title: 'Manufacturer (නිෂ්පාදන ආයතන) භාවිත මාර්ගෝපදේශය',
        badge: '🏭 Manufacturing & Production Guide',
        desc: 'අමුද්‍රව්‍ය මිලදී ගැනීම, නිෂ්පාදන ක්‍රියාවලිය (BOM), නිමි භාණ්ඩ තොග සහ නිෂ්පාදන පිරිවැය ලාභය ගණනය කිරීමේ අත්පොත.',
        steps: [
            {
                num: '01',
                title: 'අමුද්‍රව්‍ය තොග ඇතුළත් කිරීම (Raw Materials Management)',
                subtitle: 'Raw Stock, Unit Costs, Reorder Levels & Inbound Purchases',
                items: [
                    'Inbound පිටුවට ගොස් නිෂ්පාදනය සඳහා අවශ්‍ය අමුද්‍රව්‍ය මිලදී ගැනීම් සටහන් කරන්න.',
                    'අමුද්‍රව්‍ය තොගය සහ ඒකක පිරිවැය ස්වයංක්‍රීයව ලෙජරයට එකතු වේ.'
                ],
                link: '/modules/manufacturer/inbound.html',
                linkText: '🧱 Raw Materials වෙත යන්න ➔'
            },
            {
                num: '02',
                title: 'නිෂ්පාදන ධාවනය සහ නිමි භාණ්ඩ (Production & Finished Goods)',
                subtitle: 'Transformation Recipe, Labor/Electricity Overhead & Finished Stock',
                items: [
                    'Outbound පිටුවෙන් නිෂ්පාදන කාණ්ඩයක් (Production Run) ආරම්භ කරන්න.',
                    'අමුද්‍රව්‍ය කැපී ගොස් නිමි භාණ්ඩ (Finished Goods) ගබඩා තොගයට එකතු වේ.'
                ],
                link: '/modules/manufacturer/outbound.html',
                linkText: '🏭 Production පිටුවට යන්න ➔'
            },
            {
                num: '03',
                title: 'නිමි භාණ්ඩ අලෙවිය සහ ලාභය (Sales & Cost Analysis)',
                subtitle: 'Bulk Sales Invoices, Factory Overhead Costing & Net Profit',
                items: [
                    'Sales පිටුවෙන් තොග ගැනුම්කරුවන්ට නිමි භාණ්ඩ අලෙවි කර ඉන්වොයිස් නිකුත් කරන්න.'
                ],
                link: '/modules/manufacturer/sales.html',
                linkText: '🛍️ Sales පිටුවට යන්න ➔'
            }
        ]
    },
    {
        verticalId: 'coconut',
        dir: path.resolve(__dirname, '../public/modules/coconut'),
        title: 'Coconut & Husk Products භාවිත මාර්ගෝපදේශය',
        badge: '🥥 Coconut & Husk Industry Guide',
        desc: 'පොල් මිලදී ගැනීම, ග්‍රේඩින් කිරීම, ලෙලි සැකසුම, කොහු බේල්/ග්‍රෝ බෑග් නිෂ්පාදනය සහ මූල්‍ය ලෙජර පාලන අත්පොත.',
        steps: [
            {
                num: '01',
                title: 'පොල් මිලදී ගැනීම සහ වර්ගීකරණය (Coconut Purchase & Grading)',
                subtitle: 'Estate Purchases, Multi-Tier Pricing & Good/Medium/Low Grading',
                items: [
                    'Coconut Purchase පිටුවෙන් වතු වලින් මිලදී ගත් පොල් ගෙඩි ප්‍රමාණය ඇතුළත් කරන්න.',
                    'Grading පිටුව හරහා ලොකු (Good), මධ්‍යම (Medium) සහ කුඩා (Low) ලෙස වර්ග කරන්න.'
                ],
                link: '/modules/coconut/coconut-purchase.html',
                linkText: '🥥 Coconut Purchase වෙත යන්න ➔'
            },
            {
                num: '02',
                title: 'ලෙලි නිෂ්පාදනය සහ අලෙවිය (Husk Processing & Products)',
                subtitle: 'Husk Procurement, Coir Bales, Husk Chips & Export Sales',
                items: [
                    'Husk Purchase සහ Production පිටු හරහා ලෙලි වලින් කොහු සහ චිප්ස් බ්ලොක් සාදන්න.',
                    'Sales පිටුවෙන් ගැනුම්කරුවන්ට අලෙවි කර මුදල් ලෙජරයට බැර කරගන්න.'
                ],
                link: '/modules/coconut/production.html',
                linkText: '🏭 Production වෙත යන්න ➔'
            }
        ]
    },
    {
        verticalId: 'attendance_payroll',
        dir: path.resolve(__dirname, '../public/modules/attendance_payroll'),
        title: 'Attendance & Payroll භාවිත මාර්ගෝපදේශය',
        badge: '⏱️ HR, Attendance & Payroll Guide',
        desc: 'සේවක පැමිණීම, ඇඟිලි සලකුණු/QR ස්කෑන්, වැඩ මුර (Shifts), අතිකාල (OT), වැටුප් පත්‍රිකා (Payslips) සහ EPF/ETF ගණනය කිරීමේ අත්පොත.',
        steps: [
            {
                num: '01',
                title: 'සේවක තොරතුරු ඇතුළත් කිරීම (Employee Directory)',
                subtitle: 'Employee ID, Basic Salary, Department, EPF Number & Allowances',
                items: [
                    'Employees පිටුවට ගොස් ආයතනයේ සියලුම සේවකයින්ගේ තොරතුරු සහ මූලික වැටුප් සටහන් කරන්න.'
                ],
                link: '/modules/attendance_payroll/employees.html',
                linkText: '👥 Employees පිටුවට යන්න ➔'
            },
            {
                num: '02',
                title: 'දෛනික පැමිණීම සහ QR ස්කෑනරය (Attendance & QR Mobile Scanner)',
                subtitle: 'Mobile QR Check-in, Fingerprint Sync, In/Out Times & Gate Pass',
                items: [
                    'Mobile Scanner හෝ Attendance Log පිටුව හරහා සේවකයින්ගේ පැමිණීමේ හා පිටවීමේ වේලාවන් සටහන් කරන්න.'
                ],
                link: '/modules/attendance_payroll/attendancelog.html',
                linkText: '⏱️ Attendance Log වෙත යන්න ➔'
            },
            {
                num: '03',
                title: 'මාසික වැටුප් සැකසීම සහ Payslips (Monthly Payroll & EPF/ETF)',
                subtitle: 'Automated OT, Night Allowance, Salary Advances, Deductions & Payslip Print',
                items: [
                    'Payroll පිටුවට ගොස් තනි ක්ලික් එකකින් සියලුම සේවකයින්ගේ OT, Advances අඩු කිරීම් සහ ශුද්ධ වැටුප ගණනය කර Payslip Print කරගන්න.'
                ],
                link: '/modules/attendance_payroll/payroll.html',
                linkText: '💵 Payroll පිටුවට යන්න ➔'
            }
        ]
    },
    {
        verticalId: 'scrap_collection_center',
        dir: path.resolve(__dirname, '../public/modules/scrap_collection_center'),
        title: 'Scrap Collection Center භාවිත මාර්ගෝපදේශය',
        badge: '♻️ Scrap & Recycling Merchant Guide',
        desc: 'යකඩ, තඹ, පිත්තල, ඇලුමිනියම් ඇතුළු අබලි ද්‍රව්‍ය කිරා මිලදී ගැනීම, තොග පාලනය සහ උණුකරන්නන්ට අලෙවි කිරීමේ අත්පොත.',
        steps: [
            {
                num: '01',
                title: 'අබලි ද්‍රව්‍ය කිරා මිලදී ගැනීම (Scrap Buying Bill)',
                subtitle: 'Live Rates, Gross/Tare Weight, Quality Deductions & Instant Cash Bill',
                items: [
                    'Scrap Buying පිටුවෙන් තඹ, පිත්තල, යකඩ වල බර සහ අදාළ දවසේ මිල අනුව බිල්පතක් සකසන්න.'
                ],
                link: '/modules/admin/scrap-buying.html',
                linkText: '🧾 Scrap Bill පිටුවට යන්න ➔'
            },
            {
                num: '02',
                title: 'තොග විකිණීම සහ ලාභය (Scrap Selling to Smelters)',
                subtitle: 'Lorry Weight Scale, Selling Margin, Smelter Invoices & Ledger',
                items: [
                    'එකතු වූ තොග පිටත් කිරීමේදී Scrap Sell පිටුව මගින් අලෙවි කර ලාභය නිරීක්ෂණය කරන්න.'
                ],
                link: '/modules/admin/scrap-sell.html',
                linkText: '💸 Scrap Sell පිටුවට යන්න ➔'
            }
        ]
    }
];

function generateHtml(m) {
    const stepsHtml = m.steps.map((s, idx) => `
            <!-- STEP ${idx + 1} -->
            <div class="step-card" id="step${idx + 1}">
                <div class="step-header">
                    <div class="step-number-badge">${s.num}</div>
                    <div class="step-title-wrap">
                        <h2>${s.title}</h2>
                        <div class="step-subtitle">${s.subtitle}</div>
                    </div>
                </div>
                <div class="step-body">
                    <ul class="guide-list">
                        ${s.items.map(i => `<li>${i}</li>`).join('\n                        ')}
                    </ul>
                    ${s.tip ? `<div class="tip-box">💡 <strong>ප්‍රයෝජනවත් උපදෙස:</strong> ${s.tip}</div>` : ''}
                    <div class="links-row">
                        ${s.links ? s.links.map(l => `<a href="${l.url}" class="action-link-btn">${l.text}</a>`).join('\n                        ') : (s.link ? `<a href="${s.link}" class="action-link-btn">${s.linkText}</a>` : '')}
                    </div>
                </div>
            </div>
    `).join('\n');

    const featureHtml = (m.features || []).map(f => `
                <div class="feature-tile">
                    <div class="feature-icon">${f.icon}</div>
                    <div class="feature-title">${f.title}</div>
                    <div class="feature-desc">${f.desc}</div>
                </div>
    `).join('\n');

    const heroTagHtml = (m.tags || []).map(t => `<span class="hero-tag">${t}</span>`).join('\n                ');

    const quickChipsHtml = m.steps.map((s, idx) => `
                <a href="#step${idx + 1}" class="quick-chip">${idx + 1}. ${(s.title || '').split('(')[0].trim()}</a>
    `).join('');

    return `<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📖 භාවිත මාර්ගෝපදේශය (User Manual) - DIGIBIZ ${m.title.split(' ')[0]}</title>
    
    <!-- Google Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&display=swap" rel="stylesheet">
    
    <!-- Firebase Standard Scripts -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
    <script src="/core/firebase-init.js"></script>
    <script src="/core/sidebar.js"></script>

    <style>
        :root {
            --primary: #0f172a;
            --primary-emerald: #047857;
            --emerald-light: #ecfdf5;
            --emerald-border: #a7f3d0;
            --accent-amber: #d97706;
            --text-dark: #1e293b;
            --text-muted: #64748b;
            --bg-canvas: #f8fafc;
            --card-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03);
            --radius-lg: 20px;
            --radius-md: 14px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        body { background-color: var(--bg-canvas); color: var(--text-dark); min-height: 100vh; padding-bottom: 60px; }
        #sidebar-container { position: fixed; left: 0; top: 0; z-index: 1000; }
        .main-wrapper { max-width: 1200px; margin: 0 auto; padding: 24px 20px; }

        /* Hero Header */
        .manual-hero {
            background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%);
            border-radius: var(--radius-lg);
            padding: 36px 32px;
            color: #ffffff;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 30px -10px rgba(15, 23, 42, 0.25);
            margin-bottom: 28px;
        }
        .manual-hero::after {
            content: "📖";
            position: absolute;
            right: 20px;
            bottom: -20px;
            font-size: 140px;
            opacity: 0.1;
            pointer-events: none;
        }
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(52, 211, 153, 0.15);
            border: 1px solid rgba(52, 211, 153, 0.3);
            color: #34d399;
            padding: 6px 14px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            margin-bottom: 12px;
        }
        .manual-hero h1 { font-family: 'Outfit','Noto Sans Sinhala', sans-serif; font-size: 30px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 10px; }
        .manual-hero p { color: #cbd5e1; font-size: 14.5px; line-height: 1.7; max-width: 820px; }
        .hero-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
        .hero-tag { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #e2e8f0; padding: 5px 12px; border-radius: 20px; font-size: 11.5px; font-weight: 700; }

        /* Overview Grid */
        .overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 24px; }
        .feature-tile { background: #ffffff; border: 1px solid #e2e8f0; border-radius: var(--radius-md); padding: 18px; box-shadow: var(--card-shadow); transition: transform 0.18s; }
        .feature-tile:hover { transform: translateY(-2px); }
        .feature-icon { font-size: 26px; margin-bottom: 8px; }
        .feature-title { font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px; }
        .feature-desc { font-size: 12.5px; color: var(--text-muted); line-height: 1.6; }
        .feature-grid-title { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 800; color: #0f172a; margin: 4px 0 14px; }

        /* Search & Quick Jump Nav */
        .quick-nav-bar {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: var(--radius-md);
            padding: 16px 20px;
            margin-bottom: 28px;
            box-shadow: var(--card-shadow);
            display: flex;
            align-items: center;
            gap: 16px;
            flex-wrap: wrap;
        }
        .search-box-wrap { position: relative; flex: 1; min-width: 260px; }
        .search-box-wrap input {
            width: 100%;
            padding: 12px 16px 12px 42px;
            border-radius: 12px;
            border: 1px solid #cbd5e1;
            font-size: 14px;
            font-weight: 600;
            outline: none;
            transition: all 0.2s;
        }
        .search-box-wrap input:focus { border-color: var(--primary-emerald); box-shadow: 0 0 0 3px rgba(4, 120, 87, 0.15); }
        .search-box-wrap::before { content: "🔍"; position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; }
        .quick-links { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
        .quick-chip {
            background: #f1f5f9;
            color: #334155;
            padding: 8px 14px;
            border-radius: 20px;
            font-size: 12.5px;
            font-weight: 700;
            text-decoration: none;
            white-space: nowrap;
            transition: all 0.2s;
            border: 1px solid #e2e8f0;
        }
        .quick-chip:hover { background: var(--primary-emerald); color: #ffffff; border-color: var(--primary-emerald); }

        /* Step Card Styling */
        .step-card {
            background: #ffffff;
            border-radius: var(--radius-lg);
            border: 1px solid #e2e8f0;
            padding: 28px 30px;
            margin-bottom: 24px;
            box-shadow: var(--card-shadow);
            position: relative;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .step-card:hover { transform: translateY(-2px); box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.08); }
        .step-header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 18px; }
        .step-number-badge {
            width: 48px;
            height: 48px;
            border-radius: 14px;
            background: linear-gradient(135deg, #047857 0%, #065f46 100%);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Outfit', sans-serif;
            font-size: 20px;
            font-weight: 900;
            flex-shrink: 0;
            box-shadow: 0 4px 10px rgba(4, 120, 87, 0.25);
        }
        .step-title-wrap h2 { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
        .step-subtitle { font-size: 13px; color: var(--text-muted); font-weight: 600; }
        .step-body { color: #334155; font-size: 14px; line-height: 1.7; }
        .guide-list { list-style: none; margin: 14px 0; }
        .guide-list li { position: relative; padding-left: 26px; margin-bottom: 10px; font-size: 14px; color: #1e293b; }
        .guide-list li::before { content: "➔"; position: absolute; left: 0; top: 1px; color: var(--primary-emerald); font-weight: 900; }
        .step-intro { background: #f8fafc; border: 1px solid #eef2f7; border-radius: 10px; padding: 12px 16px; font-size: 13.5px; color: #475569; margin-bottom: 14px; line-height: 1.7; }
        .links-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 6px; }
        .tip-box {
            background: #fffbe6;
            border: 1px solid #ffe58f;
            border-left: 4px solid #d97706;
            border-radius: 12px;
            padding: 14px 18px;
            margin-top: 16px;
            font-size: 13.5px;
            color: #78350f;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }
        .action-link-btn {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: #f0fdf4;
            color: #047857;
            border: 1px solid #a7f3d0;
            padding: 8px 16px;
            border-radius: 10px;
            font-size: 12.5px;
            font-weight: 800;
            text-decoration: none;
            margin-top: 14px;
            transition: all 0.2s;
        }
        .action-link-btn:hover { background: #047857; color: #ffffff; border-color: #047857; }
        .manual-footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 13px; font-weight: 600; }

        @media (max-width: 768px) {
            .manual-hero { padding: 24px 20px; }
            .manual-hero h1 { font-size: 22px; }
            .step-card { padding: 20px 18px; }
        }
    </style>
</head>
<body>
    <div id="sidebar-container"></div>

    <div class="main-wrapper">
        <!-- Hero Header -->
        <div class="manual-hero">
            <div class="hero-badge">${m.badge}</div>
            <h1>${m.title}</h1>
            <p>${m.desc}</p>
            <div class="hero-tags">
                ${heroTagHtml}
            </div>
        </div>

        ${m.features ? `<div class="overview-grid">
            <h3 class="feature-grid-title" style="grid-column:1/-1;">✨ මෙම මදුල මගින් ඔබට හැකි දේ (Capabilities at a Glance)</h3>
            ${featureHtml}
        </div>` : ''}

        <!-- Search & Quick Navigation -->
        <div class="quick-nav-bar">
            <div class="search-box-wrap">
                <input type="text" id="manualSearchInput" placeholder="මාර්ගෝපදේශය තුල සොයන්න..." oninput="filterManualSteps()">
            </div>
            <div class="quick-links">
                ${quickChipsHtml}
            </div>
        </div>

        <!-- STEPS CONTAINER -->
        <div id="stepsContainer">
            ${stepsHtml}
        </div>

        <div class="manual-footer">
            DIGIBIZ Universal Business System • ${m.title} • All Rights Reserved
        </div>
    </div>

    <script>
        function filterManualSteps() {
            const query = (document.getElementById('manualSearchInput').value || '').trim().toLowerCase();
            const cards = document.querySelectorAll('.step-card');

            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                if (!query || text.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
`;
}

function run() {
    console.log('[ManualGenerator] 📖 Generating comprehensive User Manuals for all business verticals...');
    for (const m of manuals) {
        if (!fs.existsSync(m.dir)) {
            fs.mkdirSync(m.dir, { recursive: true });
        }
        const targetPath = path.join(m.dir, 'user-manual.html');
        const content = generateHtml(m);
        fs.writeFileSync(targetPath, content, 'utf8');
        console.log(`✅ Generated: ${targetPath}`);
    }
    console.log('[ManualGenerator] 🎉 All vertical User Manuals generated successfully!');
}

run();

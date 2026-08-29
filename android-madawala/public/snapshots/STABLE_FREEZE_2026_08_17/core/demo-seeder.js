/**
 * DIGIBIZ — Universal Business Demo Data Seeder Engine
 * Seeds realistic medium-sized business datasets for Live Interactive Demo Hub accounts.
 * STRICT SAFETY: Only operates on demo accounts with explicit DEMO status.
 */

(function(window) {
    'use strict';

    const DemoSeeder = {
        /**
         * Main entry point to seed business demo data
         */
        async seedDemoDataForBusiness(db, bid, bType, email) {
            if (!bid || !bType) return false;
            
            const emailNorm = String(email || '').trim().toLowerCase();
            const isDemo = emailNorm.startsWith('test@') || emailNorm.includes('demo');
            if (!isDemo) {
                console.warn('[DemoSeeder] Aborted: Target is not a verified demo account.');
                return false;
            }

            console.log(`[DemoSeeder] 🚀 Seeding medium-sized business dataset for "${bType}" (ID: ${bid})...`);

            try {
                switch (bType) {
                    case 'retail':
                        await this.seedRetail(db, bid);
                        break;
                    case 'distributor':
                        await this.seedDistributor(db, bid);
                        break;
                    case 'tire_centre':
                        await this.seedTireCentre(db, bid);
                        break;
                    case 'auto_care':
                        await this.seedAutoCare(db, bid);
                        break;
                    case 'pharmacy':
                        await this.seedPharmacy(db, bid);
                        break;
                    case 'hardware':
                        await this.seedHardware(db, bid);
                        break;
                    case 'bakery':
                        await this.seedBakery(db, bid);
                        break;
                    case 'manufacturer':
                        await this.seedManufacturer(db, bid);
                        break;
                    case 'scrap_collection_center':
                    case 'scrap':
                        await this.seedScrap(db, bid);
                        break;
                    case 'coconut':
                        await this.seedCoconut(db, bid);
                        break;
                    case 'restaurant':
                        await this.seedRestaurant(db, bid);
                        break;
                    case 'garment':
                        await this.seedGarment(db, bid);
                        break;
                    case 'service':
                        await this.seedService(db, bid);
                        break;
                    case 'attendance_payroll':
                        await this.seedAttendance(db, bid);
                        break;
                    case 'quick_billing':
                    case 'easy_bill':
                        await this.seedQuickBilling(db, bid);
                        break;
                    default:
                        await this.seedRetail(db, bid);
                        break;
                }
                console.log(`[DemoSeeder] ✅ Successfully seeded demo data for ${bType}!`);
                return true;
            } catch (err) {
                console.error(`[DemoSeeder] ❌ Error seeding ${bType}:`, err);
                return false;
            }
        },

        // 1. RETAIL / SUPERMARKET
        async seedRetail(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const products = [
                { id: `PROD_${bid}_1`, name: 'Keells Basmati Rice 5kg', sku: 'RICE-BAS-5KG', barcode: '479201100101', price: 2650, costPrice: 2200, stock: 45, minStock: 10, category: 'Grains & Rice', unit: 'Bag' },
                { id: `PROD_${bid}_2`, name: 'Anchor Full Cream Milk Powder 400g', sku: 'MILK-ANC-400G', barcode: '479201100102', price: 1140, costPrice: 980, stock: 80, minStock: 15, category: 'Dairy', unit: 'Pack' },
                { id: `PROD_${bid}_3`, name: 'Munchee Super Cream Cracker 490g', sku: 'BIS-MUN-490G', barcode: '479201100103', price: 420, costPrice: 350, stock: 120, minStock: 25, category: 'Biscuits & Snacks', unit: 'Pack' },
                { id: `PROD_${bid}_4`, name: 'Sunlight Lemon Fresh Soap 115g (Bundle 4+1)', sku: 'SOAP-SUN-5PK', barcode: '479201100104', price: 460, costPrice: 380, stock: 65, minStock: 15, category: 'Personal Care', unit: 'Bundle' },
                { id: `PROD_${bid}_5`, name: 'Astra Vegetable Fat Spread 250g', sku: 'BUT-AST-250G', barcode: '479201100105', price: 480, costPrice: 395, stock: 50, minStock: 10, category: 'Dairy', unit: 'Tub' },
                { id: `PROD_${bid}_6`, name: 'Clogard Fresh Mint Toothpaste 120g', sku: 'TOOTH-CLO-120G', barcode: '479201100106', price: 240, costPrice: 195, stock: 90, minStock: 20, category: 'Personal Care', unit: 'Tube' },
                { id: `PROD_${bid}_7`, name: 'Dilmah Premium Ceylon Tea 100 Tea Bags', sku: 'TEA-DIL-100TB', barcode: '479201100107', price: 850, costPrice: 710, stock: 40, minStock: 10, category: 'Beverages', unit: 'Box' },
                { id: `PROD_${bid}_8`, name: 'Fortune Coconut Cooking Oil 1L', sku: 'OIL-FORT-1L', barcode: '479201100108', price: 790, costPrice: 660, stock: 70, minStock: 15, category: 'Cooking Essentials', unit: 'Bottle' },
                { id: `PROD_${bid}_9`, name: 'Harpic Power Plus Toilet Cleaner 500ml', sku: 'CLEAN-HARP-500', barcode: '479201100109', price: 490, costPrice: 410, stock: 35, minStock: 8, category: 'Household', unit: 'Bottle' },
                { id: `PROD_${bid}_10`, name: 'Prima Special Wheat Flour 1kg', sku: 'FLOUR-PRI-1KG', barcode: '479201100110', price: 230, costPrice: 190, stock: 150, minStock: 30, category: 'Grains & Rice', unit: 'Pack' }
            ];

            products.forEach(p => {
                const pRef = db.collection('products').doc(p.id);
                batch.set(pRef, { businessId: bid, ...p, currentStock: p.stock, unitPrice: p.price, isActive: true, updatedAt: now }, { merge: true });
                const subRef = db.collection('businesses').doc(bid).collection('products').doc(p.id);
                batch.set(subRef, { businessId: bid, ...p, currentStock: p.stock, unitPrice: p.price, isActive: true, updatedAt: now }, { merge: true });
            });

            // Suppliers
            const suppliers = [
                { id: `SUP_${bid}_1`, name: 'CBL Distributors Ltd (Munchee)', phone: '011 234 5001', address: 'Makumbura, Pannipitiya', contactPerson: 'Nimal Jayasinghe', creditBalance: 45000 },
                { id: `SUP_${bid}_2`, name: 'Fonterra Brands Lanka (Anchor)', phone: '011 482 1000', address: 'Biyagama EPZ, Kelaniya', contactPerson: 'Chandana Perera', creditBalance: 82000 },
                { id: `SUP_${bid}_3`, name: 'Unilever Sri Lanka Logistics', phone: '011 216 0000', address: 'Grandpass, Colombo 14', contactPerson: 'Kapila Silva', creditBalance: 32000 }
            ];
            suppliers.forEach(s => {
                batch.set(db.collection('suppliers').doc(s.id), { businessId: bid, ...s, isActive: true, createdAt: now }, { merge: true });
                batch.set(db.collection('businesses').doc(bid).collection('suppliers').doc(s.id), { businessId: bid, ...s, isActive: true, createdAt: now }, { merge: true });
            });

            // Customers
            const customers = [
                { id: `CUST_${bid}_1`, name: 'Kamal Gunaratne', phone: '077 345 6789', address: 'No 45, Temple Road, Colombo', loyaltyPoints: 240, creditLimit: 15000, currentBalance: 0 },
                { id: `CUST_${bid}_2`, name: 'Suwani Senanayake', phone: '071 890 1234', address: '12/B, Lake Drive, Rajagiriya', loyaltyPoints: 480, creditLimit: 25000, currentBalance: 0 }
            ];
            customers.forEach(c => {
                batch.set(db.collection('customers').doc(c.id), { businessId: bid, ...c, isActive: true, createdAt: now }, { merge: true });
            });

            // Opening GL Journal
            const jRef = db.collection('journal').doc(bid).collection('entries').doc(`JE_INIT_${bid}`);
            batch.set(jRef, {
                businessId: bid,
                date: now,
                description: 'Opening Balances — Supermarket Inventory & Cash in Register',
                referenceType: 'OPENING_BALANCE',
                totalDebit: 450000,
                totalCredit: 450000,
                entries: [
                    { accountCode: '1-1010-01', accountName: 'Cash in Register (Drawer)', debit: 50000, credit: 0 },
                    { accountCode: '1-1040-01', accountName: 'Retail Merchandise Inventory', debit: 400000, credit: 0 },
                    { accountCode: '3-3010-01', accountName: 'Owner Equity & Capital', debit: 0, credit: 450000 }
                ]
            }, { merge: true });

            await batch.commit();
        },

        // 2. DISTRIBUTOR / WHOLESALER
        async seedDistributor(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const products = [
                { id: `PROD_DIST_${bid}_1`, name: 'Anchor Butter 200g (Ctn 40)', sku: 'ANC-BUT-CTN', price: 19200, unitPrice: 19200, costPrice: 16800, stock: 120, minStock: 20, category: 'Dairy Wholesale' },
                { id: `PROD_DIST_${bid}_2`, name: 'Munchee Lemon Puff 200g (Box 24)', sku: 'MUN-LP-BX', price: 4320, unitPrice: 4320, costPrice: 3600, stock: 250, minStock: 40, category: 'Biscuits Wholesale' },
                { id: `PROD_DIST_${bid}_3`, name: 'Maliban Gold Marie 400g (Ctn 30)', sku: 'MAL-GM-CTN', price: 7500, unitPrice: 7500, costPrice: 6300, stock: 180, minStock: 30, category: 'Biscuits Wholesale' },
                { id: `PROD_DIST_${bid}_4`, name: 'Sunlight Clean & Fresh 1kg (Ctn 12)', sku: 'SUN-POW-CTN', price: 8400, unitPrice: 8400, costPrice: 7100, stock: 95, minStock: 15, category: 'Detergents' },
                { id: `PROD_DIST_${bid}_5`, name: 'Vim Dishwash Liquid 500ml (Ctn 24)', sku: 'VIM-LIQ-CTN', price: 6720, unitPrice: 6720, costPrice: 5600, stock: 140, minStock: 20, category: 'Household' },
                { id: `PROD_DIST_${bid}_6`, name: 'Lifebuoy Total 10 Soap (Ctn 72)', sku: 'LIFE-SOAP-CTN', price: 8640, unitPrice: 8640, costPrice: 7200, stock: 110, minStock: 25, category: 'Personal Care' }
            ];

            products.forEach(p => {
                batch.set(db.collection('products').doc(p.id), { businessId: bid, ...p, currentStock: p.stock, isActive: true, updatedAt: now }, { merge: true });
                batch.set(db.collection('businesses').doc(bid).collection('products').doc(p.id), { businessId: bid, ...p, currentStock: p.stock, isActive: true, updatedAt: now }, { merge: true });
            });

            // Sales Reps
            const reps = [
                { id: `REP_${bid}_1`, name: 'Kasun Bandara (Colombo North)', email: 'kasun.rep@demo.com', phone: '077 111 2233', area: 'Colombo 01-15', route: 'Route A - City', targetMonthly: 1500000, isActive: true },
                { id: `REP_${bid}_2`, name: 'Nuwan Pradeep (Gampaha Route)', email: 'nuwan.rep@demo.com', phone: '071 444 5566', area: 'Gampaha / Negombo', route: 'Route B - Outstation', targetMonthly: 2200000, isActive: true }
            ];
            reps.forEach(r => {
                batch.set(db.collection('reps').doc(r.id), { businessId: bid, ...r, createdAt: now }, { merge: true });
            });

            // Retail Shops
            const shops = [
                { id: `SHOP_${bid}_1`, name: 'Wijaya Super Stores', ownerName: 'W. Wijesinghe', phone: '011 289 1234', address: 'Highlevel Road, Nugegoda', route: 'Route A - City', creditLimit: 250000, balance: 42000 },
                { id: `SHOP_${bid}_2`, name: 'New City Grocery & Mart', ownerName: 'M. Farook', phone: '011 268 5678', address: 'Main Street, Pettah', route: 'Route A - City', creditLimit: 500000, balance: 118000 },
                { id: `SHOP_${bid}_3`, name: 'Singhe Supermarket', ownerName: 'Anura Singhe', phone: '033 222 9988', address: 'Kandy Road, Yakkala', route: 'Route B - Outstation', creditLimit: 300000, balance: 0 }
            ];
            shops.forEach(s => {
                batch.set(db.collection('shops').doc(s.id), { businessId: bid, ...s, isActive: true, createdAt: now }, { merge: true });
                batch.set(db.collection('businesses').doc(bid).collection('shops').doc(s.id), { businessId: bid, ...s, isActive: true, createdAt: now }, { merge: true });
            });

            // Recent Orders
            const ord1 = {
                id: `ORD_${bid}_1001`,
                orderId: `ORD-${Date.now() - 3600000}`,
                businessId: bid,
                shopId: `SHOP_${bid}_1`,
                shopName: 'Wijaya Super Stores',
                repEmail: 'test@distributor.com',
                repName: 'Kasun Bandara',
                paymentMethod: 'CREDIT',
                totalAmount: 38400,
                status: 'approved',
                items: [
                    { productId: `PROD_DIST_${bid}_1`, name: 'Anchor Butter 200g (Ctn 40)', unitPrice: 19200, qty: 2, total: 38400 }
                ],
                createdAt: new Date(Date.now() - 3600000).toISOString()
            };
            batch.set(db.collection('orders').doc(ord1.id), ord1, { merge: true });

            // Opening GL Journal
            const jRef = db.collection('journal').doc(bid).collection('entries').doc(`JE_INIT_${bid}`);
            batch.set(jRef, {
                businessId: bid,
                date: now,
                description: 'Opening Balances — Distributor Warehouse Stock & Trade Receivables',
                referenceType: 'OPENING_BALANCE',
                totalDebit: 3200000,
                totalCredit: 3200000,
                entries: [
                    { accountCode: '1-1010-01', accountName: 'Cash in Bank / Float', debit: 450000, credit: 0 },
                    { accountCode: '1-1030-01', accountName: 'Trade Accounts Receivable (Shops)', debit: 160000, credit: 0 },
                    { accountCode: '1-1040-01', accountName: 'Warehouse Merchandise Inventory', debit: 2590000, credit: 0 },
                    { accountCode: '3-3010-01', accountName: 'Distributor Owner Capital', debit: 0, credit: 3200000 }
                ]
            }, { merge: true });

            await batch.commit();
        },

        // 3. TIRE CENTRE
        async seedTireCentre(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const products = [
                { id: `PROD_TIRE_${bid}_1`, name: 'DSI 175/70 R13 Discoverer', brand: 'DSI', size: '175/70 R13', price: 16500, costPrice: 13800, stock: 32, minStock: 8, category: 'Car Tires' },
                { id: `PROD_TIRE_${bid}_2`, name: 'CEAT 185/65 R15 SecuraDrive', brand: 'CEAT', size: '185/65 R15', price: 21500, costPrice: 18200, stock: 24, minStock: 6, category: 'Car Tires' },
                { id: `PROD_TIRE_${bid}_3`, name: 'Dunlop 195/65 R15 SP Sport LM705', brand: 'Dunlop', size: '195/65 R15', price: 28500, costPrice: 24500, stock: 18, minStock: 4, category: 'Car Tires' },
                { id: `PROD_TIRE_${bid}_4`, name: 'Michelin 215/60 R16 Primacy 4', brand: 'Michelin', size: '215/60 R16', price: 44000, costPrice: 38000, stock: 12, minStock: 4, category: 'SUV / Premium Tires' },
                { id: `PROD_TIRE_${bid}_5`, name: 'Exide Matrix Car Battery 12V 45Ah (Maintenance Free)', brand: 'Exide', size: '45Ah', price: 34500, costPrice: 29500, stock: 15, minStock: 3, category: 'Batteries' },
                { id: `PROD_TIRE_${bid}_6`, name: 'Amaron Hi-Life Battery 12V 65Ah', brand: 'Amaron', size: '65Ah', price: 48000, costPrice: 41000, stock: 10, minStock: 2, category: 'Batteries' }
            ];

            products.forEach(p => {
                batch.set(db.collection('products').doc(p.id), { businessId: bid, ...p, currentStock: p.stock, unitPrice: p.price, isActive: true, updatedAt: now }, { merge: true });
                batch.set(db.collection('businesses').doc(bid).collection('products').doc(p.id), { businessId: bid, ...p, currentStock: p.stock, unitPrice: p.price, isActive: true, updatedAt: now }, { merge: true });
            });

            // Services
            const services = [
                { id: `SRV_${bid}_1`, name: '4-Wheel 3D Computer Alignment', fee: 2500, category: 'Wheel Alignment' },
                { id: `SRV_${bid}_2`, name: 'Computerized Wheel Balancing (Per Wheel)', fee: 600, category: 'Balancing' },
                { id: `SRV_${bid}_3`, name: 'Tubeless Tire Puncture Repair', fee: 500, category: 'Repair' },
                { id: `SRV_${bid}_4`, name: 'Nitrogen Air Inflation & Top-up', fee: 400, category: 'Nitrogen' }
            ];
            services.forEach(s => {
                batch.set(db.collection('tire_services').doc(s.id), { businessId: bid, ...s, isActive: true, createdAt: now }, { merge: true });
            });

            // Customers
            const customers = [
                { id: `CUST_TIRE_${bid}_1`, name: 'Saman Kumara', vehicleNo: 'WP CAB-4521', vehicleModel: 'Toyota Prius', phone: '077 889 9001', address: 'Gampaha' },
                { id: `CUST_TIRE_${bid}_2`, name: 'Dilshan Wickramasinghe', vehicleNo: 'WP CAC-8912', vehicleModel: 'Honda Vezel', phone: '071 223 3445', address: 'Kiribathgoda' }
            ];
            customers.forEach(c => {
                batch.set(db.collection('tire_customers').doc(c.id), { businessId: bid, ...c, createdAt: now }, { merge: true });
            });

            await batch.commit();
        },

        // 4. AUTO CARE & REPAIR
        async seedAutoCare(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const spareParts = [
                { id: `PART_${bid}_1`, name: 'Mobil 1 Fully Synthetic Engine Oil 5W-30 (4L)', sku: 'MOB-5W30-4L', price: 18500, costPrice: 15200, stock: 28, minStock: 6, category: 'Engine Oils' },
                { id: `PART_${bid}_2`, name: 'Toyota Genuine Oil Filter (90915-YZZE1)', sku: 'TOY-OF-E1', price: 2850, costPrice: 2100, stock: 45, minStock: 10, category: 'Filters' },
                { id: `PART_${bid}_3`, name: 'Cabin A/C Filter - Carbon Activated', sku: 'CAB-AC-FILT', price: 3200, costPrice: 2300, stock: 30, minStock: 8, category: 'Filters' },
                { id: `PART_${bid}_4`, name: 'Akebono Ceramic Front Brake Pads Set', sku: 'AKE-BP-FRONT', price: 14500, costPrice: 11800, stock: 16, minStock: 4, category: 'Brake System' },
                { id: `PART_${bid}_5`, name: 'Denso Iridium Spark Plugs (Set of 4)', sku: 'DEN-IR-SPK4', price: 12000, costPrice: 9600, stock: 20, minStock: 5, category: 'Ignition' }
            ];

            spareParts.forEach(p => {
                batch.set(db.collection('products').doc(p.id), { businessId: bid, ...p, currentStock: p.stock, unitPrice: p.price, isActive: true, updatedAt: now }, { merge: true });
                batch.set(db.collection('businesses').doc(bid).collection('products').doc(p.id), { businessId: bid, ...p, currentStock: p.stock, unitPrice: p.price, isActive: true, updatedAt: now }, { merge: true });
            });

            // Services
            const services = [
                { id: `SRV_AC_${bid}_1`, name: 'Full Periodic Lubrication & Safety Service', laborCharge: 4500, category: 'Maintenance' },
                { id: `SRV_AC_${bid}_2`, name: 'Electronic Engine Computer Scanning & Diagnostic', laborCharge: 3500, category: 'Diagnostics' },
                { id: `SRV_AC_${bid}_3`, name: 'Full Brake System Overhaul & Bleeding', laborCharge: 5500, category: 'Brake Service' },
                { id: `SRV_AC_${bid}_4`, name: 'Underwash, Engine Degrease & Body Wash', laborCharge: 2800, category: 'Detailing' }
            ];
            services.forEach(s => {
                batch.set(db.collection('auto_services').doc(s.id), { businessId: bid, ...s, isActive: true, createdAt: now }, { merge: true });
            });

            // Active Job Cards
            const job1 = {
                id: `JOB_${bid}_101`,
                jobNo: 'JC-2026-081',
                businessId: bid,
                customerName: 'Roshan Abeywickrama',
                phone: '077 555 4321',
                vehicleNo: 'WP WP-CBA-9012',
                vehicleMake: 'Toyota',
                vehicleModel: 'Axio WXB 2018',
                mileage: '68,450 km',
                serviceType: 'Full Lubrication & Engine Tune-up',
                status: 'in-progress',
                estimatedAmount: 28500,
                assignedMechanic: 'Sunil Master',
                createdAt: new Date(Date.now() - 7200000).toISOString()
            };
            batch.set(db.collection('job_cards').doc(job1.id), job1, { merge: true });

            await batch.commit();
        },

        // 5. PHARMACY
        async seedPharmacy(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const medicines = [
                { id: `MED_${bid}_1`, name: 'Panadol 500mg (Box of 200 Tabs)', genericName: 'Paracetamol', dosage: '500mg', batchNo: 'BTH-8902', expiryDate: '2027-10-31', price: 1200, unitPrice: 1200, costPrice: 960, stock: 35, category: 'Pain Relief & Fever' },
                { id: `MED_${bid}_2`, name: 'Amoxicillin 500mg Capsules (100s)', genericName: 'Amoxicillin', dosage: '500mg', batchNo: 'BTH-7731', expiryDate: '2027-04-15', price: 2450, unitPrice: 2450, costPrice: 1980, stock: 22, category: 'Antibiotics', prescriptionRequired: true },
                { id: `MED_${bid}_3`, name: 'Atorvastatin 20mg Tablets (30s)', genericName: 'Atorvastatin Calcium', dosage: '20mg', batchNo: 'BTH-4412', expiryDate: '2026-12-31', price: 1650, unitPrice: 1650, costPrice: 1320, stock: 40, category: 'Cardiovascular', prescriptionRequired: true },
                { id: `MED_${bid}_4`, name: 'Metformin 500mg Sustained Release (100s)', genericName: 'Metformin HCl', dosage: '500mg', batchNo: 'BTH-9021', expiryDate: '2027-08-20', price: 1400, unitPrice: 1400, costPrice: 1100, stock: 50, category: 'Diabetes Care', prescriptionRequired: true },
                { id: `MED_${bid}_5`, name: 'Omeprazole 20mg Capsules (100s)', genericName: 'Omeprazole', dosage: '20mg', batchNo: 'BTH-6650', expiryDate: '2027-02-28', price: 1150, unitPrice: 1150, costPrice: 890, stock: 60, category: 'Gastrointestinal' },
                { id: `MED_${bid}_6`, name: 'Vitamin C 500mg Chewable (100s)', genericName: 'Ascorbic Acid', dosage: '500mg', batchNo: 'BTH-3310', expiryDate: '2028-01-30', price: 950, unitPrice: 950, costPrice: 720, stock: 75, category: 'Vitamins & Supplements' }
            ];

            medicines.forEach(m => {
                batch.set(db.collection('products').doc(m.id), { businessId: bid, ...m, currentStock: m.stock, isActive: true, updatedAt: now }, { merge: true });
                batch.set(db.collection('businesses').doc(bid).collection('products').doc(m.id), { businessId: bid, ...m, currentStock: m.stock, isActive: true, updatedAt: now }, { merge: true });
            });

            await batch.commit();
        },

        // 6. HARDWARE / CONSTRUCTION
        async seedHardware(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const items = [
                { id: `HW_${bid}_1`, name: 'Tokyo Super Portland Cement 50kg', sku: 'CEM-TOK-50KG', price: 2350, costPrice: 2150, stock: 240, minStock: 50, category: 'Cement & Building' },
                { id: `HW_${bid}_2`, name: 'Tor Steel Reinforcement Bars 12mm (Per Length)', sku: 'STL-TOR-12MM', price: 3450, costPrice: 3100, stock: 180, minStock: 30, category: 'Steel & Metals' },
                { id: `HW_${bid}_3`, name: 'National PVC Pressure Pipe 1/2" (4m Length)', sku: 'PVC-PIP-05', price: 680, costPrice: 540, stock: 150, minStock: 25, category: 'Plumbing' },
                { id: `HW_${bid}_4`, name: 'S-Lon Ball Valve 1/2" Heavy Duty', sku: 'SLON-BV-05', price: 850, costPrice: 680, stock: 85, minStock: 15, category: 'Plumbing' },
                { id: `HW_${bid}_5`, name: 'Dulux Weathershield Exterior Paint 10L (Brilliant White)', sku: 'DUL-WS-10L', price: 24500, costPrice: 20800, stock: 20, minStock: 4, category: 'Paints & Coatings' },
                { id: `HW_${bid}_6`, name: 'Makita Angle Grinder 4" 840W (GA4030)', sku: 'MAK-GRIND-4', price: 19500, costPrice: 16500, stock: 12, minStock: 2, category: 'Power Tools' }
            ];

            items.forEach(i => {
                batch.set(db.collection('products').doc(i.id), { businessId: bid, ...i, currentStock: i.stock, unitPrice: i.price, isActive: true, updatedAt: now }, { merge: true });
                batch.set(db.collection('businesses').doc(bid).collection('products').doc(i.id), { businessId: bid, ...i, currentStock: i.stock, unitPrice: i.price, isActive: true, updatedAt: now }, { merge: true });
            });

            await batch.commit();
        },

        // BAKERY / CONFECTIONERY
        async seedBakery(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            // Raw Ingredients Matching Spreadsheet Recipes
            const rmItems = [
                { id: `RM_${bid}_FLOUR`, name: 'Flour', sku: 'ING-FLOUR', unit: 'Kg', unitType: 'Kg', stockQty: 1250, unitCost: 230, reorderLevel: 100, supplier: 'Prima Ceylon' },
                { id: `RM_${bid}_SUGAR`, name: 'Sugar', sku: 'ING-SUGAR', unit: 'Kg', unitType: 'Kg', stockQty: 450, unitCost: 260, reorderLevel: 50, supplier: 'Lanka Sugar' },
                { id: `RM_${bid}_MARG`, name: 'Margarine', sku: 'ING-MARGARINE', unit: 'Kg', unitType: 'Kg', stockQty: 150, unitCost: 980, reorderLevel: 25, supplier: 'Unilever Ceylon' },
                { id: `RM_${bid}_CITA`, name: 'Cita', sku: 'ING-CITA', unit: 'Kg', unitType: 'Kg', stockQty: 45, unitCost: 850, reorderLevel: 10, supplier: 'Baker Choice' },
                { id: `RM_${bid}_BP`, name: 'Baking Powder', sku: 'ING-BAKING-POWDER', unit: 'Kg', unitType: 'Kg', stockQty: 25, unitCost: 1200, reorderLevel: 5, supplier: 'Delmege' },
                { id: `RM_${bid}_YEAST`, name: 'Yeast', sku: 'ING-YEAST', unit: 'Kg', unitType: 'Kg', stockQty: 35, unitCost: 1700, reorderLevel: 5, supplier: 'Mauripan' },
                { id: `RM_${bid}_SALT`, name: 'Salt', sku: 'ING-SALT', unit: 'Kg', unitType: 'Kg', stockQty: 100, unitCost: 90, reorderLevel: 20, supplier: 'Raigam' },
                { id: `RM_${bid}_OIL`, name: 'Oil', sku: 'ING-OIL', unit: 'L', unitType: 'L', stockQty: 80, unitCost: 650, reorderLevel: 15, supplier: 'Fortune' },
                { id: `RM_${bid}_CRUMB`, name: 'Biscuit Crumb', sku: 'ING-CRUMB', unit: 'Kg', unitType: 'Kg', stockQty: 200, unitCost: 180, reorderLevel: 30, supplier: 'Maliban' },
                { id: `RM_${bid}_COCONUT`, name: 'Coconut', sku: 'ING-COCONUT', unit: 'Kg', unitType: 'Kg', stockQty: 50, unitCost: 420, reorderLevel: 10, supplier: 'Local Mill' },
                { id: `RM_${bid}_WHEY`, name: 'Whey Powder', sku: 'ING-WHEY', unit: 'Kg', unitType: 'Kg', stockQty: 350, unitCost: 850, reorderLevel: 40, supplier: 'Anchor' },
                { id: `RM_${bid}_EGG`, name: 'Egg', sku: 'ING-EGG', unit: 'Units', unitType: 'Units', stockQty: 450, unitCost: 38, reorderLevel: 60, supplier: 'Happy Farm' },
                { id: `RM_${bid}_RULAN`, name: 'Rulan', sku: 'ING-RULAN', unit: 'Kg', unitType: 'Kg', stockQty: 40, unitCost: 320, reorderLevel: 10, supplier: 'Harischandra' },
                { id: `RM_${bid}_CHOC`, name: 'Chocolate Powder', sku: 'ING-CHOC', unit: 'Kg', unitType: 'Kg', stockQty: 25, unitCost: 1950, reorderLevel: 5, supplier: 'Van Houten' },
                { id: `RM_${bid}_CORN`, name: 'Corn Flour', sku: 'ING-CORN', unit: 'Kg', unitType: 'Kg', stockQty: 30, unitCost: 450, reorderLevel: 5, supplier: 'Edna' }
            ];
            rmItems.forEach(rm => {
                batch.set(db.collection('bakery_raw_materials').doc(rm.id), { businessId: bid, ...rm, lastUnitCost: rm.unitCost, updatedAt: now }, { merge: true });
            });

            // Finished Bakery Goods
            const fgItems = [
                { id: `FG_${bid}_FB`, code: 'FB', name: 'Fish Bun / Savory Pastry (FB)', sku: 'BAKE-FB', stockQty: 250, price: 120, unitPrice: 120, costPrice: 65, minStock: 30 },
                { id: `FG_${bid}_WI`, code: 'WI', name: 'White Bread / White Loaf (WI)', sku: 'BAKE-WI', stockQty: 180, price: 170, unitPrice: 170, costPrice: 105, minStock: 20 },
                { id: `FG_${bid}_SS`, code: 'SS', name: 'Short Sweet Biscuit / Sweet Pastry (SS)', sku: 'BAKE-SS', stockQty: 350, price: 45, unitPrice: 45, costPrice: 22, minStock: 50 },
                { id: `FG_${bid}_RC`, code: 'RC', name: 'Ribbon Cake (RC)', sku: 'BAKE-RC', stockQty: 45, price: 850, unitPrice: 850, costPrice: 460, minStock: 10 },
                { id: `FG_${bid}_CB`, code: 'CB', name: 'Cream Bun / Sweet Cream Bun (CB)', sku: 'BAKE-CB', stockQty: 120, price: 110, unitPrice: 110, costPrice: 58, minStock: 20 }
            ];
            fgItems.forEach(fg => {
                batch.set(db.collection('bakery_finished_products').doc(fg.id), { businessId: bid, productId: fg.id, ...fg, currentStock: fg.stockQty, isActive: true, updatedAt: now }, { merge: true });
                batch.set(db.collection('products').doc(fg.id), { businessId: bid, ...fg, currentStock: fg.stockQty, isActive: true, updatedAt: now }, { merge: true });
            });

            await batch.commit();

            if (window.BakeryModule && typeof window.BakeryModule.seedDefaultRecipes === 'function') {
                await window.BakeryModule.seedDefaultRecipes(bid);
            }
        },

        // 7. MANUFACTURER
        async seedManufacturer(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            // Raw Materials
            const rmItems = [
                { id: `RM_${bid}_1`, name: 'Virgin Polypropylene (PP) Resin Pellets (25kg Bag)', sku: 'RM-PP-RESIN', stockQty: 85, unitCost: 14500, reorderLevel: 20, supplier: 'Lanka Polymers' },
                { id: `RM_${bid}_2`, name: 'Color Masterbatch - Royal Blue (5kg)', sku: 'RM-MB-BLUE', stockQty: 40, unitCost: 4800, reorderLevel: 10, supplier: 'Asian Colorants' },
                { id: `RM_${bid}_3`, name: 'Corrugated Export Carton Boxes (100s)', sku: 'RM-CTN-EXP', stockQty: 350, unitCost: 180, reorderLevel: 50, supplier: 'PrintPack Lanka' }
            ];
            rmItems.forEach(rm => {
                batch.set(db.collection('manufacturer_raw_materials').doc(rm.id), { businessId: bid, ...rm, updatedAt: now }, { merge: true });
            });

            // Finished Goods
            const fgItems = [
                { id: `FG_${bid}_1`, name: 'Industrial Heavy Duty Plastic Crate (50L Blue)', sku: 'FG-CRATE-50L', stockQty: 420, price: 2850, unitPrice: 2850, costPrice: 1750, minStock: 50 },
                { id: `FG_${bid}_2`, name: 'Multi-Utility Storage Basin (30L)', sku: 'FG-BASIN-30L', stockQty: 680, price: 1450, unitPrice: 1450, costPrice: 890, minStock: 100 }
            ];
            fgItems.forEach(fg => {
                batch.set(db.collection('products').doc(fg.id), { businessId: bid, ...fg, currentStock: fg.stockQty, isActive: true, updatedAt: now }, { merge: true });
            });

            await batch.commit();
        },

        // 8. SCRAP COLLECTION CENTER
        async seedScrap(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const scrapItems = [
                { id: `SCRAP_${bid}_1`, name: 'Clean Copper Wire / Piping (No 1)', category: 'Metals', buyRatePerKg: 3200, sellRatePerKg: 3650, currentStockKg: 450 },
                { id: `SCRAP_${bid}_2`, name: 'Brass / Bronze Scrap Mix', category: 'Metals', buyRatePerKg: 2100, sellRatePerKg: 2450, currentStockKg: 620 },
                { id: `SCRAP_${bid}_3`, name: 'Aluminum Extrusion & Casting Scrap', category: 'Metals', buyRatePerKg: 780, sellRatePerKg: 950, currentStockKg: 1250 },
                { id: `SCRAP_${bid}_4`, name: 'Heavy Melting Steel (HMS 1&2)', category: 'Iron & Steel', buyRatePerKg: 125, sellRatePerKg: 165, currentStockKg: 8500 },
                { id: `SCRAP_${bid}_5`, name: 'Scrap Lead Acid Car Batteries (Per Kg)', category: 'Batteries', buyRatePerKg: 420, sellRatePerKg: 510, currentStockKg: 980 },
                { id: `SCRAP_${bid}_6`, name: 'Old Corrugated Cardboard (OCC Carton Paper)', category: 'Paper', buyRatePerKg: 45, sellRatePerKg: 68, currentStockKg: 3400 }
            ];

            scrapItems.forEach(item => {
                batch.set(db.collection('scrap_items').doc(item.id), { businessId: bid, ...item, updatedAt: now }, { merge: true });
            });

            await batch.commit();
        },

        // 9. COCONUT & HUSK
        async seedCoconut(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const catRef1 = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc('GOOD');
            batch.set(catRef1, { businessId: bid, category: 'GOOD', stockQty: 4500, avgCostPerUnit: 85.00, lastUnitCost: 85.00, updatedAt: now }, { merge: true });

            const catRef2 = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc('MEDIUM');
            batch.set(catRef2, { businessId: bid, category: 'MEDIUM', stockQty: 2800, avgCostPerUnit: 75.00, lastUnitCost: 75.00, updatedAt: now }, { merge: true });

            const catRef3 = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc('LOW');
            batch.set(catRef3, { businessId: bid, category: 'LOW', stockQty: 1200, avgCostPerUnit: 60.00, lastUnitCost: 60.00, updatedAt: now }, { merge: true });

            const catRef4 = db.collection('coconut_raw_coconuts').doc(bid).collection('items').doc('UNGRADED');
            batch.set(catRef4, { businessId: bid, category: 'UNGRADED', stockQty: 6000, avgCostPerUnit: 80.00, lastUnitCost: 80.00, updatedAt: now }, { merge: true });

            const huskRef = db.collection('coconut_husk_raw').doc(bid).collection('items').doc('current');
            batch.set(huskRef, { businessId: bid, stockKg: 8500, avgCostPerKg: 14.50, lastCostPerKg: 14.50, updatedAt: now }, { merge: true });

            const prodRef1 = db.collection('coconut_finished_products').doc(bid).collection('items').doc('FP_CHIPS_5KG');
            batch.set(prodRef1, { businessId: bid, productId: 'FP_CHIPS_5KG', name: '5kg Washed Husk Chips Block', sku: 'HC-5KG-01', unitName: 'Block', unitPrice: 650, unitCost: 420, stockQty: 180, lowStockLevel: 25, isActive: true, updatedAt: now }, { merge: true });

            const prodRef2 = db.collection('coconut_finished_products').doc(bid).collection('items').doc('FP_COIR_BALE');
            batch.set(prodRef2, { businessId: bid, productId: 'FP_COIR_BALE', name: 'Coir Fibre Bale (30kg)', sku: 'CF-30KG-01', unitName: 'Bale', unitPrice: 3200, unitCost: 2100, stockQty: 65, lowStockLevel: 15, isActive: true, updatedAt: now }, { merge: true });

            await batch.commit();
        },

        // 10. RESTAURANT / CAFE
        async seedRestaurant(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const menu = [
                { id: `REST_${bid}_1`, name: 'Special Chicken Fried Rice (Large)', category: 'Rice & Mains', price: 1650, costPrice: 780, stock: 999 },
                { id: `REST_${bid}_2`, name: 'Seafood Mixed Nasi Goreng with Fried Egg', category: 'Rice & Mains', price: 1950, costPrice: 920, stock: 999 },
                { id: `REST_${bid}_3`, name: 'Crispy Butter Cuttlefish (Hot Butter)', category: 'Appetizers & Bites', price: 2400, costPrice: 1250, stock: 999 },
                { id: `REST_${bid}_4`, name: 'Devilled Chicken with Cashew Nuts', category: 'Side Dishes', price: 1800, costPrice: 850, stock: 999 },
                { id: `REST_${bid}_5`, name: 'Fresh Lime & Mint Cooler Mojito', category: 'Beverages', price: 650, costPrice: 180, stock: 999 }
            ];

            menu.forEach(m => {
                batch.set(db.collection('products').doc(m.id), { businessId: bid, ...m, currentStock: m.stock, unitPrice: m.price, isActive: true, updatedAt: now }, { merge: true });
            });

            await batch.commit();
        },

        // 11. GARMENT / FASHION
        async seedGarment(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const garments = [
                { id: `GARM_${bid}_1`, name: 'Mens Slim Fit Formal Cotton Shirt (Navy Blue)', sku: 'MSHIRT-NVY', price: 4250, costPrice: 2600, stock: 45, variants: ['S', 'M', 'L', 'XL'] },
                { id: `GARM_${bid}_2`, name: 'Mens Classic Chino Trousers (Beige / Khaki)', sku: 'MCHINO-BGE', price: 4850, costPrice: 3100, stock: 38, variants: ['30', '32', '34', '36'] },
                { id: `GARM_${bid}_3`, name: 'Ladies Floral Printed Linen Casual Dress', sku: 'LDRSS-FLR', price: 5400, costPrice: 3400, stock: 25, variants: ['S', 'M', 'L'] },
                { id: `GARM_${bid}_4`, name: 'Premium Heavy Cotton Crew Neck T-Shirt (Black)', sku: 'TSHIRT-BLK', price: 2150, costPrice: 1200, stock: 80, variants: ['M', 'L', 'XL'] }
            ];

            garments.forEach(g => {
                batch.set(db.collection('products').doc(g.id), { businessId: bid, ...g, currentStock: g.stock, unitPrice: g.price, isActive: true, updatedAt: now }, { merge: true });
            });

            await batch.commit();
        },

        // 12. SERVICE / SALON
        async seedService(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const services = [
                { id: `SRV_SALON_${bid}_1`, name: 'Executive Haircut, Beard Sculpting & Head Massage', fee: 2500, duration: '45 mins', category: 'Grooming' },
                { id: `SRV_SALON_${bid}_2`, name: 'Deep Cleansing Herbal Gold Facial Therapy', fee: 6500, duration: '60 mins', category: 'Skincare' },
                { id: `SRV_SALON_${bid}_3`, name: 'Keratin Hair Smoothing & Conditioning Treatment', fee: 18500, duration: '120 mins', category: 'Hair Treatment' },
                { id: `SRV_SALON_${bid}_4`, name: 'Luxury Spa Pedicure & Foot Reflexology', fee: 4200, duration: '50 mins', category: 'Spa' }
            ];

            services.forEach(s => {
                batch.set(db.collection('services').doc(s.id), { businessId: bid, ...s, price: s.fee, isActive: true, createdAt: now }, { merge: true });
            });

            await batch.commit();
        },

        // 13. ATTENDANCE & PAYROLL
        async seedAttendance(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            const employees = [
                { id: `EMP_${bid}_1`, empId: 'EMP-001', name: 'Nalin Silva', department: 'Management & Accounts', designation: 'Senior Accountant', basicSalary: 110000, epfNo: '1024', status: 'ACTIVE', joinDate: '2022-01-15' },
                { id: `EMP_${bid}_2`, empId: 'EMP-002', name: 'Chaminda Rathnayake', department: 'Warehouse & Logistics', designation: 'Warehouse Supervisor', basicSalary: 75000, epfNo: '1025', status: 'ACTIVE', joinDate: '2023-04-01' },
                { id: `EMP_${bid}_3`, empId: 'EMP-003', name: 'Sanduni Fernando', department: 'Sales & Front Office', designation: 'Cashier / Customer Executive', basicSalary: 55000, epfNo: '1026', status: 'ACTIVE', joinDate: '2024-02-10' },
                { id: `EMP_${bid}_4`, empId: 'EMP-004', name: 'Pradeep Kumara', department: 'Operations & Field', designation: 'Delivery Officer / Driver', basicSalary: 62000, epfNo: '1027', status: 'ACTIVE', joinDate: '2023-08-20' }
            ];

            employees.forEach(emp => {
                batch.set(db.collection('employees').doc(emp.id), { businessId: bid, ...emp, createdAt: now }, { merge: true });
                batch.set(db.collection('businesses').doc(bid).collection('employees').doc(emp.id), { businessId: bid, ...emp, createdAt: now }, { merge: true });
            });

            await batch.commit();
        },

        // 14. QUICK BILLING & INVOICING
        async seedQuickBilling(db, bid) {
            const batch = db.batch();
            const now = new Date().toISOString();

            // Business Profile
            const bizRef = db.collection('businesses').doc(bid);
            batch.set(bizRef, {
                id: bid,
                name: 'The Royal Spices Restaurant & Cafe',
                businessName: 'The Royal Spices Restaurant & Cafe',
                businessType: 'quick_billing',
                phone: '077 123 4567',
                address: 'No. 24, Galle Road, Colombo 03',
                currency: 'LKR',
                subscriptionStatus: 'ACTIVE',
                subscriptionPlan: 'quick_billing_monthly_1000',
                isActive: true,
                updatedAt: now
            }, { merge: true });

            // Products & Services Catalog (Restaurant foods, drinks, desserts & services)
            const catalogItems = [
                { id: `QB_PROD_${bid}_1`, name: 'Special Chicken Fried Rice (Full)', price: 1650, costPrice: 850, category: 'Foods' },
                { id: `QB_PROD_${bid}_2`, name: 'Mixed Chicken & Egg Kottu (Full)', price: 1450, costPrice: 750, category: 'Foods' },
                { id: `QB_PROD_${bid}_3`, name: 'Chicken Cheese Burger with French Fries', price: 1150, costPrice: 600, category: 'Foods' },
                { id: `QB_PROD_${bid}_4`, name: 'Crispy Hot Butter Cuttlefish (Regular)', price: 1600, costPrice: 850, category: 'Appetizers' },
                { id: `QB_PROD_${bid}_5`, name: 'Devilled Chicken with Capsicum (Medium)', price: 1200, costPrice: 650, category: 'Foods' },
                { id: `QB_PROD_${bid}_6`, name: 'Fresh Passion Fruit Juice (Chilled)', price: 380, costPrice: 120, category: 'Beverages' },
                { id: `QB_PROD_${bid}_7`, name: 'Iced Coffee with Vanilla Ice Cream', price: 450, costPrice: 150, category: 'Beverages' },
                { id: `QB_PROD_${bid}_8`, name: 'Warm Chocolate Lava Cake with Ice Cream', price: 650, costPrice: 220, category: 'Desserts' },
                { id: `QB_PROD_${bid}_9`, name: 'Traditional Jaggery Watalappan (Cup)', price: 350, costPrice: 110, category: 'Desserts' },
                { id: `QB_PROD_${bid}_10`, name: 'Dine-In AC Table Service Charge', price: 250, costPrice: 0, category: 'Services' },
                { id: `QB_PROD_${bid}_11`, name: 'Eco Takeaway Box & Packaging Fee', price: 60, costPrice: 25, category: 'Packaging' },
                { id: `QB_PROD_${bid}_12`, name: 'Express City Delivery / Dispatch Fee', price: 300, costPrice: 200, category: 'Delivery' }
            ];

            catalogItems.forEach(p => {
                batch.set(db.collection('products').doc(bid).collection('list').doc(p.id), {
                    businessId: bid,
                    ...p,
                    stock: 999,
                    currentStock: 999,
                    unitPrice: p.price,
                    isActive: true,
                    updatedAt: now
                }, { merge: true });
            });

            // Customers
            const customers = [
                { id: `QB_CUST_${bid}_1`, name: 'Apex Education Campus (Staff Order)', phone: '071 889 9001', area: 'Colombo 03', address: 'Galle Road, Colombo', balance: 0, isActive: true, createdAt: now },
                { id: `QB_CUST_${bid}_2`, name: 'Silva & Associates Legal Chambers', phone: '011 282 3456', area: 'Colombo 05', address: 'Havelock Town', balance: 0, isActive: true, createdAt: now },
                { id: `QB_CUST_${bid}_3`, name: 'TechHub Lanka Software Team', phone: '076 112 2334', area: 'Bambalapitiya', address: 'Duplication Road', balance: 0, isActive: true, createdAt: now }
            ];

            customers.forEach(c => {
                batch.set(db.collection('customers').doc(bid).collection('list').doc(c.id), {
                    businessId: bid,
                    ...c
                }, { merge: true });
            });

            // Recent sample bills
            const sampleBills = [
                {
                    id: `BILL_${Date.now() - 3600000 * 5}`,
                    invoiceNo: 'INV-100234',
                    businessId: bid,
                    customerId: `QB_CUST_${bid}_1`,
                    customerName: 'Apex Education Campus (Staff Order)',
                    customerPhone: '071 889 9001',
                    items: [
                        { name: 'Special Chicken Fried Rice (Full)', price: 1650, quantity: 4 },
                        { name: 'Iced Coffee with Vanilla Ice Cream', price: 450, quantity: 4 }
                    ],
                    subtotal: 8400,
                    discount: 400,
                    total: 8000,
                    paymentMode: 'CASH',
                    status: 'completed',
                    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
                },
                {
                    id: `BILL_${Date.now() - 3600000 * 2}`,
                    invoiceNo: 'INV-100235',
                    businessId: bid,
                    customerId: 'GUEST',
                    customerName: 'Guest Customer (Table 04)',
                    customerPhone: '',
                    items: [
                        { name: 'Mixed Chicken & Egg Kottu (Full)', price: 1450, quantity: 1 },
                        { name: 'Warm Chocolate Lava Cake with Ice Cream', price: 650, quantity: 1 }
                    ],
                    subtotal: 2100,
                    discount: 0,
                    total: 2100,
                    paymentMode: 'CASH',
                    status: 'completed',
                    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
                }
            ];

            sampleBills.forEach(b => {
                batch.set(db.collection('orders').doc(bid).collection('list').doc(b.id), b, { merge: true });
            });

            // Opening Balanced GL Journal Entry
            const jRef = db.collection('journal').doc(bid).collection('entries').doc(`JE_OPENING_${bid}`);
            batch.set(jRef, {
                businessId: bid,
                date: now,
                description: 'Opening Balances — Quick Billing Terminal Working Capital',
                referenceType: 'OPENING_BALANCE',
                ref: 'demo_init',
                totalDebit: 100000,
                totalCredit: 100000,
                entries: [
                    { accountCode: '1-1010-01', accountName: 'Cash in Hand', debit: 50000, credit: 0 },
                    { accountCode: '1-1020-01', accountName: 'Bank Account', debit: 50000, credit: 0 },
                    { accountCode: '3-3010-01', accountName: "Owner's Capital", debit: 0, credit: 100000 }
                ],
                createdAt: now
            }, { merge: true });

            await batch.commit();
            console.log('[DemoSeeder] Quick Billing sample data initialized successfully for:', bid);
        }
    };

    window.DemoSeeder = DemoSeeder;
})(typeof window !== 'undefined' ? window : global);

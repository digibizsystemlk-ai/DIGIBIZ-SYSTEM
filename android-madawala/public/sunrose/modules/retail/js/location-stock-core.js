(function(window) {
/**
 * DigiBiz Retail - Multi-Location Inventory & Stock Transfer Engine
 * LocationStockCore (Enterprise Edition)
 */
const LocationStockCore = {
    DEFAULT_LOCATION_ID: 'MAIN',
    DEFAULT_LOCATION_NAME: 'Main Store',
    DEFAULT_LOCATION_CODE: 'MAIN',

    // Role and permission checks for Stock Management operations
    canUserManageStock(currentUser, userRole, profile = null) {
        if (!currentUser) return false;
        const role = String(userRole || profile?.role || 'BUSINESS_OWNER').toUpperCase();
        return (
            role === 'BUSINESS_OWNER' ||
            role === 'OWNER' ||
            role === 'ADMIN' ||
            role === 'MANAGER' ||
            role === 'STOCK_MANAGER' ||
            role === 'INVENTORY_MANAGER' ||
            role === 'SUPER_ADMIN' ||
            role === 'STAFF' ||
            role === 'CASHIER'
        );
    },

    // Get all Locations for a business (Alias for getLocations)
    async getBusinessLocations(businessId) {
        return await this.getLocations(businessId);
    },

    // Fetch all active Locations
    async getLocations(businessId) {
        if (!businessId) return [{ id: this.DEFAULT_LOCATION_ID, name: this.DEFAULT_LOCATION_NAME, code: this.DEFAULT_LOCATION_CODE, isDefault: true }];
        try {
            const db = window.db || firebase.firestore();
            const snap = await db.collection('locations').doc(businessId).collection('list').get();
            if (snap.empty) {
                return [{ id: this.DEFAULT_LOCATION_ID, name: this.DEFAULT_LOCATION_NAME, code: this.DEFAULT_LOCATION_CODE, isDefault: true }];
            }
            const locs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            return locs.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
        } catch (err) {
            console.warn('[LocationStockCore] Error fetching locations:', err);
            return [{ id: this.DEFAULT_LOCATION_ID, name: this.DEFAULT_LOCATION_NAME, code: this.DEFAULT_LOCATION_CODE, isDefault: true }];
        }
    },

    // Fetch locations alias
    async fetchLocations(businessId) {
        return await this.getLocations(businessId);
    },

    // Add or Update a Location
    async saveLocation(businessId, locationData) {
        if (!businessId || !locationData || !locationData.name) throw new Error('Valid Business ID and Location Name required');
        const db = window.db || firebase.firestore();
        const locId = locationData.id || locationData.code || locationData.name.trim().toUpperCase().replace(/\s+/g, '_').substring(0, 24);
        const locRef = db.collection('locations').doc(businessId).collection('list').doc(locId);

        const locData = {
            id: locId,
            name: locationData.name.trim(),
            code: (locationData.code || locId).toUpperCase(),
            address: locationData.address || '',
            isDefault: locationData.isDefault || false,
            isActive: locationData.isActive !== false,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (!locationData.id) {
            locData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        }
        await locRef.set(locData, { merge: true });
        return locData;
    },

    // Delete a Location
    async deleteLocation(businessId, locationId) {
        if (!businessId || !locationId || !window.db) throw new Error('Business ID and Location ID required');
        await window.db.collection('locations').doc(businessId).collection('list').doc(locationId).delete();
        return { success: true };
    },

    // Set a location as Default
    async setDefaultLocation(businessId, locationId) {
        if (!businessId || !locationId) throw new Error('Business ID and Location ID required');
        const db = window.db || firebase.firestore();
        const batch = db.batch();
        const locSnap = await db.collection('locations').doc(businessId).collection('list').get();
        locSnap.docs.forEach(doc => {
            batch.update(doc.ref, { isDefault: (doc.id === locationId) });
        });
        await batch.commit();
        return { success: true };
    },
/**
     * Bulletproof, Atomic Multi-Location POS Stock Deduction
     */
    async deductStockOnSaleTransactional({ businessId, items, invoiceNo, currentUser, posLocationId }) {
        if (!businessId) throw new Error('Business ID is required for stock deduction');
        if (!Array.isArray(items) || items.length === 0) return { success: true, count: 0 };

        const db = window.db || firebase.firestore();
        const userIdentifier = currentUser ? (currentUser.email || currentUser.uid) : 'cashier';
        const effectiveLocId = String(posLocationId || 'MAIN').trim();

        // 1. Fetch current product and location stocks
        const [locSnap, prodSnap, locationsSnap] = await Promise.all([
            db.collection('product_location_stock').doc(businessId).collection('list').get().catch(() => null),
            db.collection('products').doc(businessId).collection('list').get().catch(() => null),
            db.collection('locations').doc(businessId).collection('list').get().catch(() => null)
        ]);

        const locStockDocs = locSnap ? locSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
        const prodDocs = prodSnap ? prodSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
        const allBizLocations = locationsSnap ? locationsSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
        const activeLocObj = allBizLocations.find(l => l.id === effectiveLocId || l.code === effectiveLocId || l.name === effectiveLocId);
        const locCode = activeLocObj ? (activeLocObj.code || activeLocObj.id) : effectiveLocId;
        const locName = activeLocObj ? (activeLocObj.name || activeLocObj.code || effectiveLocId) : effectiveLocId;

        const batch = db.batch();
        const movements = [];

        for (const item of items) {
            const prodId = item.docId || item.id || item.productId;
            if (!prodId) {
                console.error('[LocationStockCore] Missing product ID on cart item:', item);
                throw new Error(`Missing product ID on cart item "${item.name || 'Unknown'}"`);
            }

            const qtySold = Number(item.quantity || item.qty || 0);
            if (qtySold <= 0) continue;

            const currentProd = prodDocs.find(p => p.id === prodId || p.docId === prodId || p.code === prodId) || {};
            const currentMasterStock = Number(currentProd.stock !== undefined ? currentProd.stock : 0);
            const newMasterStock = Math.max(0, currentMasterStock - qtySold);

            // Find matching location entry for this specific product and selected location
            const matchingLocEntry = locStockDocs.find(d => 
                (d.productId === prodId || d.productName === currentProd.name) && 
                (d.locationId === effectiveLocId || d.locationId === locCode || d.locationId === locName || d.id === `${prodId}__${effectiveLocId}` || d.id === `${prodId}__${locCode}`)
            );

            const currentLocStock = matchingLocEntry ? Number(matchingLocEntry.quantity !== undefined ? matchingLocEntry.quantity : (matchingLocEntry.stock || 0)) : currentMasterStock;
            const newLocStock = Math.max(0, currentLocStock - qtySold);

            // 1. Decrement Master Product Document
            const prodRef = db.collection('products').doc(businessId).collection('list').doc(prodId);
            batch.set(prodRef, {
                stock: Number(newMasterStock),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // 2. Decrement Location Stock Document for EXACT selected location (No redirection!)
            const targetLocKey = `${prodId}__${effectiveLocId}`;
            const locStockRef = db.collection('product_location_stock').doc(businessId).collection('list').doc(targetLocKey);
            batch.set(locStockRef, {
                businessId: businessId,
                productId: prodId,
                productName: item.name || currentProd.name || '',
                locationId: effectiveLocId,
                locationCode: locCode,
                locationName: locName,
                quantity: Number(newLocStock),
                stock: Number(newLocStock),
                lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            // 3. Write Stock Movement Audit Record
            const movementRef = db.collection('stockMovements').doc(businessId).collection('list').doc();
            const movementData = {
                productId: prodId,
                productName: item.name || currentProd.name || '',
                fromLocation: locName,
                fromLocationId: effectiveLocId,
                toLocation: null,
                qty: qtySold,
                unit: item.unit || currentProd.unit || (item.sellType === 'weight' ? 'kg' : 'Pcs'),
                movementType: 'SALE_OUT',
                refType: 'POS_SALE',
                refId: invoiceNo || 'POS',
                oldStock: currentMasterStock,
                newStock: newMasterStock,
                createdBy: userIdentifier,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            batch.set(movementRef, movementData);
            movements.push(movementData);
        }

        await batch.commit();
        console.log(`✅ [LocationStockCore] Committed atomic stock deduction & movements for ${movements.length} items!`);
        return { success: true, count: movements.length };
    },

        getUserPreferredLocationSync(uid) {
            if (!uid) return this.DEFAULT_LOCATION_ID;
            return localStorage.getItem(`retail_pref_loc_${uid}`) || this.DEFAULT_LOCATION_ID;
        },

        async getUserPreferredLocation(uid) {
            const cached = localStorage.getItem('preferredLocation');
            if (cached) return cached;
            if (uid && window.db) {
                try {
                    const userDoc = await window.db.collection('users').doc(uid).get();
                    if (userDoc.exists && userDoc.data().preferredLocation) {
                        const loc = userDoc.data().preferredLocation;
                        localStorage.setItem('preferredLocation', loc);
                        return loc;
                    }
                } catch (e) {
                    console.warn('[LocationStockCore] Could not fetch user preferred location:', e);
                }
            }
            return this.DEFAULT_LOCATION_ID;
        },

        // Set user preferred location
        async setUserPreferredLocation(uid, locationId) {
            if (!locationId) locationId = this.DEFAULT_LOCATION_ID;
            localStorage.setItem('preferredLocation', locationId);
            if (uid && window.db) {
                try {
                    await window.db.collection('users').doc(uid).set({ preferredLocation: locationId }, { merge: true });
                } catch (e) {
                    console.warn('[LocationStockCore] Could not save preferred location to user profile:', e);
                }
            }
        },

        // Fetch stock by location for a product
        async getProductLocationStocks(businessId, productId) {
            if (!businessId || !productId || !window.db) return [];
            try {
                const snapshot = await window.db.collection('product_location_stock').doc(businessId).collection('list')
                    .where('productId', '==', productId)
                    .get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err) {
                console.warn('[LocationStockCore] Error getting product location stocks:', err);
                return [];
            }
        },

        // Fetch stock movements for a product or general audit
        async getStockMovements(businessId, { productId = null, locationId = null, limit = 50 } = {}) {
            if (!businessId || !window.db) return [];
            try {
                let query = window.db.collection('stockMovements').doc(businessId).collection('list');
                if (productId) {
                    query = query.where('productId', '==', productId);
                }
                query = query.orderBy('createdAt', 'desc').limit(limit);
                const snapshot = await query.get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } catch (err) {
                console.warn('[LocationStockCore] Error getting stock movements:', err);
                return [];
            }
        },

        // Check if user has stock edit/reversal permission
        canUserManageStock(userProfile, userRole) {
            // Allow by default for logged-in store owners, admins, and managers
            if (!userProfile && !userRole) return true;
            const role = String(userRole || userProfile?.role || userProfile?.userType || userProfile?.roleName || '').toLowerCase().trim();
            if (!role || role.includes('owner') || role.includes('admin') || role.includes('manager') || role.includes('staff') || role.includes('cashier') || role.includes('business')) {
                return true;
            }
            if (userProfile?.canStockEdit !== false && userProfile?.permissions?.canStockEdit !== false) {
                return true;
            }
            return true;
        },

        /**
         * Atomic Transactional Receive of GRN
         * @param {Object} params
         * - businessId: string
         * - po: Purchase Order object
         * - receiveItems: Array of { productId, productName, locationId, receivedQty, costPrice, unit }
         * - currentUser: Firebase user or session user
         */
        async receiveGRNTransactional({ businessId, po, receiveItems, currentUser }) {
            if (!businessId || !po || !receiveItems || !receiveItems.length) {
                throw new Error('Invalid arguments for receiveGRNTransactional');
            }

            const db = window.db;
            const userIdentifier = currentUser?.email || currentUser?.uid || 'system_user';
            const deterministicJournalId = `JE_PURCHASE_${po.poNo || po.id}`;

            return await db.runTransaction(async (transaction) => {
                // --- STEP 1: ALL READS MUST OCCUR BEFORE ANY WRITES ---
                // 1a. Identify all UNIQUE Product and Location Stock Documents to read
                const uniqueProductIds = new Set();
                const uniqueLocKeys = new Set();
                const itemsToProcess = [];

                for (const item of receiveItems) {
                    const qty = Number(item.receivedQty) || 0;
                    if (qty <= 0 || !item.productId) continue;
                    const locId = item.locationId || this.DEFAULT_LOCATION_ID;
                    const locKey = `${item.productId}__${locId}`;
                    uniqueProductIds.add(item.productId);
                    uniqueLocKeys.add(locKey);
                    itemsToProcess.push({ ...item, locId, locKey, qty });
                }

                const productReads = {};
                for (const prodId of uniqueProductIds) {
                    const prodDocRef = db.collection('products').doc(businessId).collection('list').doc(prodId);
                    productReads[prodId] = { ref: prodDocRef, promise: transaction.get(prodDocRef) };
                }

                const locStockReads = {};
                for (const locKey of uniqueLocKeys) {
                    const [prodId, locId] = locKey.split('__');
                    const locStockDocRef = db.collection('product_location_stock').doc(businessId).collection('list').doc(locKey);
                    locStockReads[locKey] = { ref: locStockDocRef, prodId, locId, promise: transaction.get(locStockDocRef) };
                }

                // 1b. Purchase Order Read
                const poRef = db.collection('purchases').doc(businessId).collection('orders').doc(po.id || po.poNo);
                const poPromise = transaction.get(poRef);

                // 1c. Journal Entry Read (Read before write!)
                const journalRef = db.collection('journal').doc(businessId).collection('entries').doc(deterministicJournalId);
                const journalPromise = transaction.get(journalRef);

                // 1d. Optional Bank Account Read if bank payment
                let bankDocRef = null;
                let bankPromise = null;
                if (po.bankAccountId && (String(po.paymentMode || '').toUpperCase() === 'BANK' || String(po.paymentMode || '').toUpperCase() === 'CARD')) {
                    bankDocRef = db.collection('bank_accounts').doc(businessId).collection('accounts').doc(po.bankAccountId);
                    bankPromise = transaction.get(bankDocRef);
                }

                // Await all snapshot promises
                const productSnapMap = {};
                for (const prodId of uniqueProductIds) {
                    const snap = await productReads[prodId].promise;
                    productSnapMap[prodId] = { ref: productReads[prodId].ref, snap, data: snap.exists ? snap.data() : {} };
                }

                const locSnapMap = {};
                for (const locKey of uniqueLocKeys) {
                    const snap = await locStockReads[locKey].promise;
                    locSnapMap[locKey] = {
                        ref: locStockReads[locKey].ref,
                        prodId: locStockReads[locKey].prodId,
                        locId: locStockReads[locKey].locId,
                        snap,
                        data: snap.exists ? snap.data() : {}
                    };
                }

                const poSnap = await poPromise;
                const journalSnap = await journalPromise;
                const bankSnap = bankPromise ? await bankPromise : null;

                if (poSnap.exists) {
                    const poData = poSnap.data();
                    if (poData.status === 'received') {
                        throw new Error(`GRN ${po.poNo || po.id} has already been received.`);
                    }
                    if (poData.status === 'reversed') {
                        throw new Error(`GRN ${po.poNo || po.id} has been reversed and cannot be received.`);
                    }
                }

                // --- STEP 2: ALL WRITES AFTER ALL READS ARE COMPLETE ---
                // Initialize Running Accumulators from Snapshots
                const runningProductStock = {};
                const latestCostMap = {};
                const runningLocStock = {};

                for (const prodId of uniqueProductIds) {
                    runningProductStock[prodId] = Number(productSnapMap[prodId].data.stock) || 0;
                }
                for (const locKey of uniqueLocKeys) {
                    runningLocStock[locKey] = Number(locSnapMap[locKey].data.quantity) || 0;
                }

                // Accumulate each item line into running totals and write individual stock movements
                for (const item of itemsToProcess) {
                    const prodId = item.productId;
                    const locKey = item.locKey;
                    const locId = item.locId;
                    const qty = item.qty;

                    const currentProdData = productSnapMap[prodId]?.data || {};
                    const oldLocStock = runningLocStock[locKey] || 0;
                    const newLocStock = oldLocStock + qty;
                    runningLocStock[locKey] = newLocStock;

                    const oldProdStock = runningProductStock[prodId] || 0;
                    const newProdStock = oldProdStock + qty;
                    runningProductStock[prodId] = newProdStock;

                    if (item.costPrice && Number(item.costPrice) > 0) {
                        latestCostMap[prodId] = Number(item.costPrice);
                    }

                    // Write Stock Movement Audit Record for each line
                    const movementRef = db.collection('stockMovements').doc(businessId).collection('list').doc();
                    transaction.set(movementRef, {
                        productId: prodId,
                        productName: item.productName || currentProdData.name || '',
                        fromLocation: null,
                        toLocation: locId,
                        qty: qty,
                        unit: item.unit || currentProdData.unit || 'Pcs',
                        movementType: 'GRN_IN',
                        refType: 'GRN',
                        refId: po.poNo || po.id,
                        oldStock: oldLocStock,
                        newStock: newLocStock,
                        createdBy: userIdentifier,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                // Persist final aggregated Product stocks & location tracking
                for (const prodId of uniqueProductIds) {
                    const prodLocs = itemsToProcess.filter(i => i.productId === prodId).map(i => i.locId);
                    const existingLocs = productSnapMap[prodId]?.data?.locations || [];
                    const mergedLocs = Array.from(new Set([...existingLocs, ...prodLocs]));

                    const prodUpdate = {
                        stock: runningProductStock[prodId],
                        locationId: prodLocs[0] || productSnapMap[prodId]?.data?.locationId || 'MAIN',
                        locations: mergedLocs,
                        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    if (latestCostMap[prodId]) {
                        prodUpdate.cost = latestCostMap[prodId];
                    }
                    transaction.set(productSnapMap[prodId].ref, prodUpdate, { merge: true });
                }

                // Persist final aggregated Location stocks
                for (const locKey of uniqueLocKeys) {
                    const locInfo = locSnapMap[locKey];
                    const prodData = productSnapMap[locInfo.prodId]?.data || {};
                    transaction.set(locInfo.ref, {
                        productId: locInfo.prodId,
                        productName: prodData.name || '',
                        locationId: locInfo.locId,
                        quantity: runningLocStock[locKey],
                        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }

                const totalAmount = Number(po.total) || 0;
                const amountPaid = Number(po.amountPaid !== undefined ? po.amountPaid : totalAmount);
                const balanceDue = Number(po.balanceDue !== undefined ? po.balanceDue : Math.max(0, totalAmount - amountPaid));

                // Update Bank Balance & Ledger if bank account utilized
                if (bankDocRef && bankSnap && bankSnap.exists && amountPaid > 0) {
                    transaction.update(bankDocRef, {
                        balance: firebase.firestore.FieldValue.increment(-amountPaid),
                        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    const bankTxnRef = db.collection('banking_transactions').doc(businessId).collection('list').doc();
                    transaction.set(bankTxnRef, {
                        type: 'GRN_PAYMENT',
                        amount: amountPaid,
                        bankId: po.bankAccountId,
                        bankName: po.bankAccountName || bankSnap.data()?.bankName || 'Bank Account',
                        date: po.billDate || new Date().toISOString().split('T')[0],
                        reference: po.poNo || po.id,
                        notes: `GRN payment to ${po.supplierName || 'Supplier'} (${po.paymentMode || 'BANK'})`,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                // Update PO status & payment details
                transaction.set(poRef, {
                    ...po,
                    status: 'received',
                    amountPaid: amountPaid,
                    balanceDue: balanceDue,
                    receivedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    receivedBy: userIdentifier,
                    receivedItemsSummary: receiveItems.map(it => ({
                        productId: it.productId,
                        productName: it.productName,
                        locationId: it.locationId || this.DEFAULT_LOCATION_ID,
                        receivedQty: it.receivedQty,
                        costPrice: it.costPrice,
                        unit: it.unit
                    }))
                }, { merge: true });

                // Idempotent Journal Entry with Split Payment Support
                if (!journalSnap.exists && totalAmount > 0) {
                    const payMethod = String(po.paymentMode || po.paymentMethod || 'CASH').toUpperCase();
                    let creditAccount = '1-1010-01';
                    let creditName = 'Cash in Hand';

                    if (payMethod === 'CHEQUE') {
                        creditAccount = '2-2020-01';
                        creditName = `Issued Cheques Payable (${po.chequeNo || 'CHQ'})`;
                    } else if (payMethod === 'BANK' || payMethod === 'CARD' || payMethod === 'BANK_TRANSFER') {
                        creditAccount = '1-1020-01';
                        creditName = po.bankAccountName ? `Bank Account (${po.bankAccountName})` : 'Bank Account';
                    }

                    const journalEntries = [
                        {
                            accountCode: '1-1040-01',
                            accountId: '1-1040-01',
                            accountName: 'Inventory / Stock',
                            type: 'debit',
                            debit: totalAmount,
                            credit: 0,
                            amount: totalAmount,
                            description: `Stock received under GRN #${po.poNo || po.id}`
                        }
                    ];

                    if (amountPaid > 0) {
                        journalEntries.push({
                            accountCode: creditAccount,
                            accountId: creditAccount,
                            accountName: creditName,
                            type: 'credit',
                            debit: 0,
                            credit: amountPaid,
                            amount: amountPaid,
                            description: `Payment via ${payMethod} for GRN #${po.poNo || po.id}`
                        });
                    }

                    if (balanceDue > 0) {
                        journalEntries.push({
                            accountCode: '2-2010-01',
                            accountId: '2-2010-01',
                            accountName: 'Accounts Payable (Supplier Outstanding)',
                            type: 'credit',
                            debit: 0,
                            credit: balanceDue,
                            amount: balanceDue,
                            description: `Outstanding Liability for GRN #${po.poNo || po.id}`
                        });
                    }

                    const memoStr = `GRN Purchase (${payMethod}: Paid Rs. ${amountPaid.toFixed(2)}${balanceDue > 0 ? `, Due Rs. ${balanceDue.toFixed(2)}` : ''}) from ${po.supplierName || 'Supplier'} (GRN: ${po.poNo || po.id})`;
                    
                    transaction.set(journalRef, {
                        id: deterministicJournalId,
                        ref: `purchases/${po.poNo || po.id}`,
                        referenceType: 'PURCHASE',
                        referenceId: po.poNo || po.id,
                        orderId: po.id,
                        description: memoStr,
                        memo: memoStr,
                        date: firebase.firestore.FieldValue.serverTimestamp(),
                        totalDebit: totalAmount,
                        totalCredit: totalAmount,
                        businessId: businessId,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        createdBy: userIdentifier,
                        entries: journalEntries
                    });
                }

                return { success: true, poId: po.id || po.poNo };
            });
        },

        /**
         * Atomic Transactional Reversal of GRN
         * @param {Object} params
         * - businessId: string
         * - poId: Purchase Order ID
         * - reversalReason: string
         * - currentUser: Firebase user or session user
         * - userProfile: User profile object for role check
         */
        async reverseGRNTransactional({ businessId, poId, reversalReason, currentUser, userProfile }) {
            if (!businessId || !poId) {
                throw new Error('businessId and poId are required for reversal');
            }

            if (!this.canUserManageStock(userProfile, currentUser?.role)) {
                throw new Error('Unauthorized: You do not have permission to reverse GRN transactions.');
            }

            if (!reversalReason || !reversalReason.trim()) {
                throw new Error('Reversal reason is mandatory.');
            }

            const db = window.db;
            const userIdentifier = currentUser?.email || currentUser?.uid || 'admin_user';
            const deterministicReversalJournalId = `JE_PURCHASE_REV_${poId}`;

            return await db.runTransaction(async (transaction) => {
                // --- STEP 1: ALL READS FIRST ---
                // 1a. PO read
                const poRef = db.collection('purchases').doc(businessId).collection('orders').doc(poId);
                const poSnap = await transaction.get(poRef);

                if (!poSnap.exists) {
                    throw new Error(`GRN record ${poId} not found.`);
                }

                const poData = poSnap.data();
                if (poData.status === 'reversed') {
                    throw new Error(`GRN ${poData.poNo || poId} is already reversed.`);
                }
                if (poData.status !== 'received') {
                    throw new Error(`Only RECEIVED GRNs can be reversed. Current status: ${poData.status}`);
                }

                // Determine items to revert
                const itemsToRevert = poData.receivedItemsSummary || poData.items || [];
                if (!itemsToRevert.length) {
                    throw new Error('No item details found on this GRN to revert.');
                }

                // 1b. Reversal Journal Entry read
                const revJournalRef = db.collection('journal').doc(businessId).collection('entries').doc(deterministicReversalJournalId);
                const revJournalPromise = transaction.get(revJournalRef);

                // 1c. Optional Bank Account Read for Reversal
                let bankDocRef = null;
                let bankPromise = null;
                if (poData.bankAccountId && (String(poData.paymentMode || '').toUpperCase() === 'BANK' || String(poData.paymentMode || '').toUpperCase() === 'CARD' || (String(poData.paymentMode || '').toUpperCase() === 'CHEQUE' && poData.chequeStatus === 'cleared'))) {
                    bankDocRef = db.collection('bank_accounts').doc(businessId).collection('accounts').doc(poData.bankAccountId);
                    bankPromise = transaction.get(bankDocRef);
                }

                // 1d. Identify UNIQUE Product and Location Stock Documents to read
                const uniqueProductIds = new Set();
                const uniqueLocKeys = new Set();
                const itemsToProcess = [];

                for (const item of itemsToRevert) {
                    const qty = Number(item.receivedQty !== undefined ? item.receivedQty : (item.inputQty || item.quantity)) || 0;
                    if (qty <= 0 || !item.productId) continue;
                    const locId = item.locationId || this.DEFAULT_LOCATION_ID;
                    const locKey = `${item.productId}__${locId}`;
                    uniqueProductIds.add(item.productId);
                    uniqueLocKeys.add(locKey);
                    itemsToProcess.push({ ...item, locId, locKey, qty });
                }

                const productReads = {};
                for (const prodId of uniqueProductIds) {
                    const prodDocRef = db.collection('products').doc(businessId).collection('list').doc(prodId);
                    productReads[prodId] = { ref: prodDocRef, promise: transaction.get(prodDocRef) };
                }

                const locStockReads = {};
                for (const locKey of uniqueLocKeys) {
                    const [prodId, locId] = locKey.split('__');
                    const locStockDocRef = db.collection('product_location_stock').doc(businessId).collection('list').doc(locKey);
                    locStockReads[locKey] = { ref: locStockDocRef, prodId, locId, promise: transaction.get(locStockDocRef) };
                }

                const revJournalSnap = await revJournalPromise;
                const bankSnap = bankPromise ? await bankPromise : null;

                const productSnapMap = {};
                for (const prodId of uniqueProductIds) {
                    const snap = await productReads[prodId].promise;
                    productSnapMap[prodId] = { ref: productReads[prodId].ref, snap, data: snap.exists ? snap.data() : {} };
                }

                const locSnapMap = {};
                for (const locKey of uniqueLocKeys) {
                    const snap = await locStockReads[locKey].promise;
                    locSnapMap[locKey] = {
                        ref: locStockReads[locKey].ref,
                        prodId: locStockReads[locKey].prodId,
                        locId: locStockReads[locKey].locId,
                        snap,
                        data: snap.exists ? snap.data() : {}
                    };
                }

                // --- STEP 2: ALL WRITES AFTER ALL READS ---
                // Initialize Running Accumulators
                const runningProductStock = {};
                const runningLocStock = {};

                for (const prodId of uniqueProductIds) {
                    runningProductStock[prodId] = Number(productSnapMap[prodId].data.stock) || 0;
                }
                for (const locKey of uniqueLocKeys) {
                    runningLocStock[locKey] = Number(locSnapMap[locKey].data.quantity) || 0;
                }

                // Deduct each item line from running totals and write individual reversal stock movements
                for (const item of itemsToProcess) {
                    const prodId = item.productId;
                    const locKey = item.locKey;
                    const locId = item.locId;
                    const qty = item.qty;

                    const currentProdData = productSnapMap[prodId]?.data || {};
                    const oldLocStock = runningLocStock[locKey] || 0;
                    const newLocStock = Math.max(0, oldLocStock - qty);
                    runningLocStock[locKey] = newLocStock;

                    const oldProdStock = runningProductStock[prodId] || 0;
                    const newProdStock = Math.max(0, oldProdStock - qty);
                    runningProductStock[prodId] = newProdStock;

                    // Write GRN_REVERSAL Stock Movement (Immutable)
                    const movementRef = db.collection('stockMovements').doc(businessId).collection('list').doc();
                    transaction.set(movementRef, {
                        productId: prodId,
                        productName: item.productName || currentProdData.name || '',
                        fromLocation: locId,
                        toLocation: null,
                        qty: qty,
                        unit: item.unit || currentProdData.unit || 'Pcs',
                        movementType: 'GRN_REVERSAL',
                        refType: 'GRN_REVERSAL',
                        refId: poData.poNo || poId,
                        reversalReason: reversalReason.trim(),
                        oldStock: oldLocStock,
                        newStock: newLocStock,
                        createdBy: userIdentifier,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                // Persist final aggregated decremented Product stocks
                for (const prodId of uniqueProductIds) {
                    transaction.set(productSnapMap[prodId].ref, {
                        stock: runningProductStock[prodId],
                        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }

                // Persist final aggregated decremented Location stocks
                for (const locKey of uniqueLocKeys) {
                    const locInfo = locSnapMap[locKey];
                    const prodData = productSnapMap[locInfo.prodId]?.data || {};
                    transaction.set(locInfo.ref, {
                        productId: locInfo.prodId,
                        productName: prodData.name || '',
                        locationId: locInfo.locId,
                        quantity: runningLocStock[locKey],
                        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }

                const totalAmount = Number(poData.total) || 0;
                const amountPaid = Number(poData.amountPaid !== undefined ? poData.amountPaid : totalAmount);
                const balanceDue = Number(poData.balanceDue !== undefined ? poData.balanceDue : Math.max(0, totalAmount - amountPaid));

                // Restore Bank Balance if bank account was debited
                if (bankDocRef && bankSnap && bankSnap.exists && amountPaid > 0) {
                    transaction.update(bankDocRef, {
                        balance: firebase.firestore.FieldValue.increment(amountPaid),
                        lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    const bankTxnRef = db.collection('banking_transactions').doc(businessId).collection('list').doc();
                    transaction.set(bankTxnRef, {
                        type: 'GRN_REVERSAL',
                        amount: amountPaid,
                        bankId: poData.bankAccountId,
                        bankName: poData.bankAccountName || bankSnap.data()?.bankName || 'Bank Account',
                        date: new Date().toISOString().split('T')[0],
                        reference: poData.poNo || poId,
                        notes: `Reversal refund of GRN payment ${poData.poNo || poId}: ${reversalReason.trim()}`,
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }

                // Mark PO status as reversed (No hard delete)
                transaction.update(poRef, {
                    status: 'reversed',
                    reversedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    reversedBy: userIdentifier,
                    reversalReason: reversalReason.trim()
                });

                // Create Corrective Reversal Journal Entry with Split Payment Support
                if (!revJournalSnap.exists && totalAmount > 0) {
                    const payMethod = poData.paymentMode || poData.paymentMethod || 'CASH';
                    let debitAccount = '1-1010-01';
                    let debitName = 'Cash in Hand';

                    if (payMethod === 'CHEQUE') {
                        debitAccount = '2-2020-01';
                        debitName = `Issued Cheques Payable (${poData.chequeNo || 'CHQ'})`;
                    } else if (payMethod === 'BANK' || payMethod === 'CARD' || payMethod === 'BANK_TRANSFER') {
                        debitAccount = '1-1020-01';
                        debitName = poData.bankAccountName ? `Bank Account (${poData.bankAccountName})` : 'Bank Account';
                    }

                    const revEntries = [
                        {
                            accountCode: '1-1040-01',
                            accountId: '1-1040-01',
                            accountName: 'Inventory / Stock',
                            type: 'credit',
                            debit: 0,
                            credit: totalAmount,
                            amount: totalAmount,
                            description: `Reversal of Stock for GRN #${poData.poNo || poId}`
                        }
                    ];

                    if (amountPaid > 0) {
                        revEntries.push({
                            accountCode: debitAccount,
                            accountId: debitAccount,
                            accountName: debitName,
                            type: 'debit',
                            debit: amountPaid,
                            credit: 0,
                            amount: amountPaid,
                            description: `Reversal refund via ${payMethod} for GRN #${poData.poNo || poId}`
                        });
                    }

                    if (balanceDue > 0) {
                        revEntries.push({
                            accountCode: '2-2010-01',
                            accountId: '2-2010-01',
                            accountName: 'Accounts Payable (Supplier Outstanding)',
                            type: 'debit',
                            debit: balanceDue,
                            credit: 0,
                            amount: balanceDue,
                            description: `Reversal of liability for GRN #${poData.poNo || poId}`
                        });
                    }

                    const memoStr = `REVERSAL: GRN Purchase (${payMethod}) from ${poData.supplierName || 'Supplier'} (GRN: ${poData.poNo || poId}) - Reason: ${reversalReason.trim()}`;

                    transaction.set(revJournalRef, {
                        id: deterministicReversalJournalId,
                        ref: `purchases/${poData.poNo || poId}`,
                        referenceType: 'PURCHASE_REVERSAL',
                        referenceId: poData.poNo || poId,
                        orderId: poId,
                        description: memoStr,
                        reversalOf: `JE_PURCHASE_${poData.poNo || poId}`,
                        date: firebase.firestore.FieldValue.serverTimestamp(),
                        memo: memoStr,
                        totalDebit: totalAmount,
                        totalCredit: totalAmount,
                        businessId: businessId,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                        createdBy: userIdentifier,
                        entries: revEntries
                    });
                }

                // Write to System Audit Log
                const auditRef = db.collection('audit_logs').doc(businessId).collection('list').doc();
                transaction.set(auditRef, {
                    action: 'GRN_REVERSAL',
                    targetType: 'PURCHASE_ORDER',
                    targetId: poId,
                    poNo: poData.poNo || poId,
                    reason: reversalReason.trim(),
                    reversedBy: userIdentifier,
                    reversedAt: firebase.firestore.FieldValue.serverTimestamp(),
                    snapshot: poData
                });

                return { success: true, poId };
            });
        },

        /**
         * Migration & Backfill helper
         * Backfills existing products into product_location_stock with locationId = MAIN
         * and writes INITIAL_IMPORT stock movements.
         */
        async runLocationStockMigration(businessId, currentUser, onProgress) {
            if (!businessId || !window.db) throw new Error('Missing businessId or database');
            const db = window.db;
            const userIdentifier = currentUser?.email || currentUser?.uid || 'migration_admin';

            // Ensure MAIN location exists
            await this.ensureDefaultLocation(businessId);

            const productsSnap = await db.collection('products').doc(businessId).collection('list').get();
            const total = productsSnap.docs.length;
            let migrated = 0;
            let skipped = 0;

            console.log(`[Migration] Starting backfill for ${total} products to location: ${this.DEFAULT_LOCATION_ID}...`);

            const batchSize = 250;
            let currentBatch = db.batch();
            let operationsInBatch = 0;

            for (let i = 0; i < total; i++) {
                const doc = productsSnap.docs[i];
                const p = doc.data();
                const stockQty = Number(p.stock) || 0;

                const locStockRef = db.collection('product_location_stock').doc(businessId).collection('list').doc(`${doc.id}__${this.DEFAULT_LOCATION_ID}`);
                
                // Write location stock
                currentBatch.set(locStockRef, {
                    productId: doc.id,
                    productName: p.name || '',
                    locationId: this.DEFAULT_LOCATION_ID,
                    quantity: stockQty,
                    lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                operationsInBatch++;

                // Write INITIAL_IMPORT movement if stock exists
                if (stockQty > 0) {
                    const movementRef = db.collection('stockMovements').doc(businessId).collection('list').doc();
                    currentBatch.set(movementRef, {
                        productId: doc.id,
                        productName: p.name || '',
                        fromLocation: null,
                        toLocation: this.DEFAULT_LOCATION_ID,
                        qty: stockQty,
                        unit: p.unit || 'Pcs',
                        movementType: 'INITIAL_IMPORT',
                        refType: 'MIGRATION',
                        refId: 'MIGRATION_BACKFILL',
                        oldStock: 0,
                        newStock: stockQty,
                        createdBy: userIdentifier,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    operationsInBatch++;
                }

                migrated++;

                if (operationsInBatch >= batchSize) {
                    await currentBatch.commit();
                    currentBatch = db.batch();
                    operationsInBatch = 0;
                }

                if (onProgress) {
                    onProgress({ current: i + 1, total, percent: Math.round(((i + 1) / total) * 100) });
                }
            }

            if (operationsInBatch > 0) {
                await currentBatch.commit();
            }

            console.log(`[Migration] Completed: ${migrated} products backfilled to location ${this.DEFAULT_LOCATION_ID}.`);
            return { total, migrated, skipped };
        }
,

    /**
     * Revert / Cancel a Sale Transactionally & Restore Multi-Location Stock
     */
    async reverseSaleTransactional({ businessId, orderId, orderData, currentUser }) {
        if (!businessId || !orderId) throw new Error('Business ID and Order ID required');
        const db = window.db || firebase.firestore();
        const userIdentifier = currentUser ? (currentUser.email || currentUser.uid) : 'user';

        const orderRef = db.collection('orders').doc(businessId).collection('list').doc(orderId);
        let order = orderData;
        if (!order) {
            const snap = await orderRef.get();
            if (!snap.exists) throw new Error('Order not found');
            order = snap.data();
        }

        const items = Array.isArray(order.items) ? order.items : [];
        const invoiceNo = order.invoiceNo || orderId;
        const posLocationId = order.locationId || 'MAIN';

        // Fetch products, locations, and location stocks
        const [locSnap, prodSnap, locationsSnap] = await Promise.all([
            db.collection('product_location_stock').doc(businessId).collection('list').get().catch(() => null),
            db.collection('products').doc(businessId).collection('list').get().catch(() => null),
            db.collection('locations').doc(businessId).collection('list').get().catch(() => null)
        ]);

        const prodDocs = prodSnap ? prodSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
        const allBizLocations = locationsSnap ? locationsSnap.docs.map(d => ({ id: d.id, ...d.data() })) : [];
        const activeLocObj = allBizLocations.find(l => l.id === posLocationId || l.code === posLocationId || l.name === posLocationId);
        const locName = activeLocObj ? (activeLocObj.name || activeLocObj.code || posLocationId) : posLocationId;

        const batch = db.batch();

        // 1. Revert stock for each product that still exists
        for (const item of items) {
            const prodId = item.docId || item.id || item.productId;
            const qty = Number(item.quantity || item.qty || 0);
            if (!prodId || qty <= 0) continue;

            const existingProd = prodDocs.find(p => p.id === prodId || p.docId === prodId || p.code === prodId);
            if (existingProd) {
                // Restore master product stock using set merge:true so it never errors on missing doc
                const prodRef = db.collection('products').doc(businessId).collection('list').doc(prodId);
                batch.set(prodRef, {
                    stock: firebase.firestore.FieldValue.increment(qty),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                // Restore location stock
                const locKey = `${prodId}__${posLocationId}`;
                const locStockRef = db.collection('product_location_stock').doc(businessId).collection('list').doc(locKey);
                batch.set(locStockRef, {
                    businessId: businessId,
                    productId: prodId,
                    productName: item.name || existingProd.name || '',
                    locationId: posLocationId,
                    quantity: firebase.firestore.FieldValue.increment(qty),
                    stock: firebase.firestore.FieldValue.increment(qty),
                    lastUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                // Log stock movement reversal
                const mRef = db.collection('stockMovements').doc(businessId).collection('list').doc();
                batch.set(mRef, {
                    productId: prodId,
                    productName: item.name || existingProd.name || '',
                    fromLocation: null,
                    toLocation: locName,
                    qty: qty,
                    unit: item.unit || existingProd.unit || 'Pcs',
                    movementType: 'SALE_REVERSAL',
                    refType: 'POS_CANCEL',
                    refId: invoiceNo,
                    createdBy: userIdentifier,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        // 2. Mark order as cancelled
        batch.set(orderRef, {
            status: 'cancelled',
            isReversed: true,
            cancelledAt: firebase.firestore.FieldValue.serverTimestamp(),
            cancelledBy: userIdentifier
        }, { merge: true });

        // 3. Mark journal entries as reversed
        try {
            let journalSnap = await db.collection('journal').doc(businessId).collection('entries').where('ref', '==', `orders/${orderId}`).get();
            if (journalSnap.empty) {
                journalSnap = await db.collection('journal').doc(businessId).collection('entries').where('ref', '==', orderId).get();
            }
            journalSnap.docs.forEach(jDoc => {
                batch.set(jDoc.ref, {
                    isReversed: true,
                    reversalOf: orderId,
                    reversalDate: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            });
        } catch (je) {
            console.warn('[LocationStockCore] Journal reversal lookup notice:', je);
        }

        await batch.commit();
        console.log(`✅ [LocationStockCore] Reversed sale ${invoiceNo} successfully!`);
        return { success: true };
    }
};

window.LocationStockCore = LocationStockCore;
})(window);
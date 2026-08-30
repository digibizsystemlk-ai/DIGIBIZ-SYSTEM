function deduplicateClientsList(rawList) {
    const canonicalMap = new Map();

    rawList.forEach(item => {
        if (!item || !item.id) return;
        
        const emailKey = (item.ownerEmail || '').trim().toLowerCase();
        const nameKey = (item.businessName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const idKey = (item.id || item.clientId || '').trim().toLowerCase();

        let matchKey = null;
        for (const [key, existing] of canonicalMap.entries()) {
            const exEmail = (existing.ownerEmail || '').trim().toLowerCase();
            const exName = (existing.businessName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            const exId = (existing.id || existing.clientId || '').trim().toLowerCase();

            if (emailKey && exEmail && emailKey === exEmail) {
                matchKey = key;
                break;
            }
            if (nameKey && exName && nameKey === exName && nameKey.length > 3) {
                matchKey = key;
                break;
            }
            if (idKey && exId && (idKey === exId || idKey.includes(exId) || exId.includes(idKey))) {
                matchKey = key;
                break;
            }
        }

        if (matchKey) {
            const existing = canonicalMap.get(matchKey);
            const isItemUid = item.id.length > 20 && /[A-Z]/.test(item.id) && /[0-9]/.test(item.id);
            const isExistingUid = existing.id.length > 20 && /[A-Z]/.test(existing.id) && /[0-9]/.test(existing.id);

            const primaryDoc = (!isItemUid && isExistingUid) ? item : existing;
            const secondaryDoc = (!isItemUid && isExistingUid) ? existing : item;

            const mergedDoc = {
                ...secondaryDoc,
                ...primaryDoc,
                id: primaryDoc.id,
                clientId: primaryDoc.clientId || primaryDoc.id,
                businessName: primaryDoc.businessName || secondaryDoc.businessName,
                ownerName: primaryDoc.ownerName && primaryDoc.ownerName !== '—' ? primaryDoc.ownerName : secondaryDoc.ownerName,
                phone: primaryDoc.phone || secondaryDoc.phone,
                ownerEmail: primaryDoc.ownerEmail || secondaryDoc.ownerEmail,
                rawDocIds: Array.from(new Set([...(primaryDoc.rawDocIds || [primaryDoc.id]), ...(secondaryDoc.rawDocIds || [secondaryDoc.id])]))
            };

            canonicalMap.set(matchKey, mergedDoc);
        } else {
            const primaryKey = emailKey || nameKey || idKey;
            canonicalMap.set(primaryKey, {
                ...item,
                rawDocIds: [item.id]
            });
        }
    });

    return Array.from(canonicalMap.values());
}

const testList = [
    { id: 'DarshanaMadawala', businessName: 'MADAWALA TEA SHOP', ownerName: 'DARSHANA MADAWALA', ownerEmail: 'darshanamadawala80@gmail.com', phone: '0778933264' },
    { id: 'Mluz2PfHPoNatBlEkvpurJQ9Md83', businessName: 'MADAWALA TEA SHOP', ownerName: 'DARSHANA MADAWALA', ownerEmail: 'darshanamadawala80@gmail.com', phone: '0778933264' },
    { id: 'chisathifamily', businessName: 'CHISATHI FAMILY PRODUCTS', ownerName: 'Chisathi Family', ownerEmail: 'chisathifamily@gmail.com', phone: '0771234567' }
];

const deduped = deduplicateClientsList(testList);
console.log('Original count:', testList.length);
console.log('Deduped count:', deduped.length);
console.log('Deduped result:', deduped);

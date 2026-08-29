/**
 * Special Business Leads / Callback Todo Banner Logic for Super Admin Dashboard
 */

async function loadSpecialLeadsBanner() {
    try {
        const _db = window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        if (!_db) return;

        const banner = document.getElementById('specialLeadsTodoBanner');
        const listEl = document.getElementById('specialLeadsListContainer');
        const badge = document.getElementById('leadsPendingBadge');
        if (!banner || !listEl) return;

        let leads = [];
        const snap = await _db.collection('special_leads').where('status', '==', 'PENDING').get().catch(() => null);
        if (snap && !snap.empty) {
            snap.forEach(doc => leads.push({ id: doc.id, ...doc.data() }));
        }

        // Fallback: check businesses collection for originalType == 'other' and phone exists
        if (leads.length === 0) {
            const bizSnap = await _db.collection('businesses')
                .where('originalType', '==', 'other')
                .limit(15)
                .get()
                .catch(() => null);
            if (bizSnap && !bizSnap.empty) {
                bizSnap.forEach(doc => {
                    const d = doc.data() || {};
                    if (d.phone && d.leadStatus !== 'CONTACTED') {
                        leads.push({ id: doc.id, ...d });
                    }
                });
            }
        }

        if (leads.length > 0) {
            banner.style.display = 'block';
            if (badge) badge.textContent = leads.length;

            listEl.innerHTML = leads.map(l => {
                const rawPhone = String(l.phone || '').replace(/[^0-9]/g, '');
                const waPhone = rawPhone.startsWith('0') ? '94' + rawPhone.slice(1) : (rawPhone.startsWith('94') ? rawPhone : '94' + rawPhone);
                const cleanPhone = l.phone || 'No phone';
                const desc = l.description || 'Special business inquiry';
                const dateStr = l.createdAt ? (l.createdAt.toDate ? l.createdAt.toDate().toLocaleDateString() : new Date(l.createdAt).toLocaleDateString()) : 'Recent';

                return `
                    <div style="background:#ffffff; border:1.5px solid #a7f3d0; border-radius:10px; padding:10px; font-size:12.5px; box-shadow:0 2px 6px rgba(0,0,0,0.04);">
                        <div style="font-weight:800; color:#064e3b; font-size:13.5px; margin-bottom:2px;">${escapeHtmlLead(l.businessName || 'Special Business')}</div>
                        <div style="color:#334155; font-weight:600; margin-bottom:4px;">👤 ${escapeHtmlLead(l.ownerName || 'Owner')} | 🗓️ ${dateStr}</div>
                        <div style="background:#f8fafc; padding:6px 8px; border-radius:6px; border:1px solid #e2e8f0; color:#475569; font-size:12px; margin-bottom:6px; max-height:50px; overflow-y:auto; line-height:1.4;">
                            📝 ${escapeHtmlLead(desc)}
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:center; gap:6px;">
                            <div style="display:flex; gap:6px;">
                                <a href="tel:${cleanPhone}" style="background:#0284c7; color:#fff; text-decoration:none; padding:5px 8px; border-radius:6px; font-size:11.5px; font-weight:700; display:inline-flex; align-items:center; gap:3px;">
                                    📞 ${cleanPhone}
                                </a>
                                <a href="https://wa.me/${waPhone}?text=Hello%20${encodeURIComponent(l.ownerName || '')},%20DIGIBIZ%20here%20regarding%20your%20business%20inquiry." target="_blank" style="background:#25d366; color:#fff; text-decoration:none; padding:5px 8px; border-radius:6px; font-size:11.5px; font-weight:700; display:inline-flex; align-items:center; gap:3px;">
                                    📲 WhatsApp
                                </a>
                            </div>
                            <button type="button" onclick="markLeadContacted('${l.id}')" style="background:#10b981; color:#fff; border:none; padding:5px 10px; border-radius:6px; font-size:11.5px; font-weight:800; cursor:pointer;">
                                ✓ කතා කළා
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            banner.style.display = 'none';
        }
    } catch (err) {
        console.warn('[SpecialLeads] load notice:', err);
    }
}

async function markLeadContacted(leadId) {
    try {
        const _db = window.db || (typeof firebase !== 'undefined' && firebase.firestore ? firebase.firestore() : null);
        if (!_db) return;
        await _db.collection('special_leads').doc(leadId).set({ status: 'CONTACTED', contactedAt: new Date() }, { merge: true });
        await _db.collection('businesses').doc(leadId).set({ leadStatus: 'CONTACTED', contactedAt: new Date() }, { merge: true }).catch(() => {});
        loadSpecialLeadsBanner();
    } catch (e) {
        alert('Could not update lead: ' + e.message);
    }
}

function escapeHtmlLead(str) {
    return String(str || '').replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
}

// Auto-run on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadSpecialLeadsBanner, 1500);
});

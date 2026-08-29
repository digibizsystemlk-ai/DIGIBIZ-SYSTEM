const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '..', 'public', 'modules', 'admin', 'scrap-buying.html');
let content = fs.readFileSync(targetFile, 'utf8');

// Replace the entire feedback modal and script section cleanly
const startMarker = '<!-- System Feedback Modal -->';
const endMarker = '</body>';

const newModalSection = `<!-- System Feedback Modal -->
    <div id="systemFeedbackModal" style="position:fixed; inset:0; background:rgba(15,23,42,0.65); backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px); z-index:999999; display:none; align-items:center; justify-content:center; padding:16px; font-family:'Inter',system-ui,-apple-system,sans-serif;">
        <div style="background:#fff; width:100%; max-width:720px; max-height:88vh; border-radius:20px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.3); display:flex; flex-direction:column; overflow:hidden; border:1px solid #cbd5e1;">
            
            <!-- Modal Header -->
            <div style="background:linear-gradient(135deg, #0f3b2c 0%, #166534 100%); color:#fff; padding:16px 22px; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="font-size:22px;">🛡️</span>
                    <div>
                        <h3 style="margin:0; font-size:16px; font-weight:800; color:#fff; letter-spacing:-0.2px;">පාරිභෝගික දෛනික මත විමසුම් ප්‍රතිචාර කේන්ද්‍රය</h3>
                        <div style="font-size:11.5px; color:rgba(255,255,255,0.85); margin-top:2px;">Daily Client System Health, Issues & Feedback Hub</div>
                    </div>
                </div>
                <button type="button" onclick="closeSystemFeedbackModal()" style="background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); color:#fff; width:32px; height:32px; border-radius:50%; font-size:15px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s;">✕</button>
            </div>
            
            <!-- Category Tabs -->
            <div style="padding:12px 20px; background:#f8fafc; border-bottom:1px solid #e2e8f0; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <button id="sfTabIssues" onclick="filterFeedback('issues')" style="padding:7px 14px; border-radius:10px; border:1.5px solid #fca5a5; background:#fff; color:#991b1b; font-size:12px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s;">
                    <span>🔴 විසඳිය යුතු ගැටළු</span>
                    <span id="sfCountIssues" style="background:#fee2e2; color:#991b1b; padding:1px 6px; border-radius:10px; font-size:11px;">0</span>
                </button>
                <button id="sfTabResolved" onclick="filterFeedback('resolved')" style="padding:7px 14px; border-radius:10px; border:1.5px solid #fde047; background:#fff; color:#854d0e; font-size:12px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s;">
                    <span>🟡 Admin විසඳුම් ලැබුණි</span>
                    <span id="sfCountResolved" style="background:#fef9c3; color:#854d0e; padding:1px 6px; border-radius:10px; font-size:11px;">0</span>
                </button>
                <button id="sfTabNoIssues" onclick="filterFeedback('no_issues')" style="padding:7px 14px; border-radius:10px; border:1.5px solid #86efac; background:#fff; color:#166534; font-size:12px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s;">
                    <span>🟢 ගැටළු නැත</span>
                    <span id="sfCountNoIssues" style="background:#dcfce7; color:#166534; padding:1px 6px; border-radius:10px; font-size:11px;">0</span>
                </button>
                <button id="sfTabAll" onclick="filterFeedback('all')" style="padding:7px 14px; border-radius:10px; border:1.5px solid #cbd5e1; background:#0f3b2c; color:#fff; font-size:12px; font-weight:800; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all 0.2s;">
                    <span>📋 සියල්ල</span>
                    <span id="sfCountAll" style="background:rgba(255,255,255,0.25); color:#fff; padding:1px 6px; border-radius:10px; font-size:11px;">0</span>
                </button>
            </div>

            <!-- List Container -->
            <div id="systemFeedbackList" style="padding:18px 20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:12px; background:#f1f5f9;">
                <div style="text-align:center; padding:30px; color:#64748b;">ප්‍රතිචාර පූරණය වෙමින් පවතී...</div>
            </div>

            <!-- Footer -->
            <div style="background:#fff; border-top:1px solid #e2e8f0; padding:10px 20px; display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#64748b;">
                <span>💡 පාරිභෝගිකයින්ගේ තෘප්තිය සහ පද්ධති ස්ථායීතාවය සඳහායි</span>
                <button type="button" onclick="closeSystemFeedbackModal()" style="padding:6px 16px; background:#e2e8f0; border:none; border-radius:8px; font-size:12px; font-weight:700; color:#334155; cursor:pointer;">වසන්න</button>
            </div>

        </div>
    </div>

    <script>
        let _sfFeedbacks = [];
        let _sfCurrentFilter = 'all';

        function initSystemFeedbackListener() {
            if (!window.db) {
                setTimeout(initSystemFeedbackListener, 500);
                return;
            }
            try {
                window.db.collection('daily_system_feedback')
                    .orderBy('createdAt', 'desc')
                    .limit(100)
                    .onSnapshot((snapshot) => {
                        _sfFeedbacks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                        renderSystemFeedbackBadge();
                        renderSystemFeedbackList();
                    }, (err) => {
                        console.warn('[SystemFeedback] Listener warning:', err);
                    });
            } catch(e) {
                console.warn('[SystemFeedback] Init error:', e);
            }
        }

        function renderSystemFeedbackBadge() {
            const badgeCont = document.getElementById('systemFeedbackBadgeContainer');
            const countText = document.getElementById('systemFeedbackCountText');
            if (!badgeCont || !countText) return;

            const pendingIssues = _sfFeedbacks.filter(f => f.status === 'pending_admin_action');
            const resolvedCount = _sfFeedbacks.filter(f => f.status === 'resolved_by_admin').length;
            const noIssuesCount = _sfFeedbacks.filter(f => f.status === 'no_issues').length;
            const totalCount = _sfFeedbacks.length;

            // Update Tab Badge Numbers
            const elAll = document.getElementById('sfCountAll');
            const elIssues = document.getElementById('sfCountIssues');
            const elResolved = document.getElementById('sfCountResolved');
            const elNoIssues = document.getElementById('sfCountNoIssues');
            if (elAll) elAll.textContent = totalCount;
            if (elIssues) elIssues.textContent = pendingIssues.length;
            if (elResolved) elResolved.textContent = resolvedCount;
            if (elNoIssues) elNoIssues.textContent = noIssuesCount;

            // ONLY DISPLAY TOP BADGE IF THERE ARE RESPONSES
            if (totalCount === 0) {
                badgeCont.style.display = 'none';
                return;
            }

            badgeCont.style.display = 'inline-block';
            if (pendingIssues.length > 0) {
                countText.textContent = pendingIssues.length + ' Pending Issue' + (pendingIssues.length > 1 ? 's' : '');
                countText.parentElement.style.background = '#fef2f2';
                countText.parentElement.style.borderColor = '#fca5a5';
                countText.parentElement.style.color = '#991b1b';
            } else {
                countText.textContent = totalCount + ' Feedback' + (totalCount > 1 ? 's' : '');
                countText.parentElement.style.background = '#f0fdf4';
                countText.parentElement.style.borderColor = '#bbf7d0';
                countText.parentElement.style.color = '#166534';
            }
        }

        function filterFeedback(filter) {
            _sfCurrentFilter = filter;
            const tabs = [
                { id: 'sfTabIssues', activeBg: '#991b1b', activeColor: '#fff', inactiveBg: '#fff', inactiveColor: '#991b1b', border: '#fca5a5' },
                { id: 'sfTabResolved', activeBg: '#854d0e', activeColor: '#fff', inactiveBg: '#fff', inactiveColor: '#854d0e', border: '#fde047' },
                { id: 'sfTabNoIssues', activeBg: '#166534', activeColor: '#fff', inactiveBg: '#fff', inactiveColor: '#166534', border: '#86efac' },
                { id: 'sfTabAll', activeBg: '#0f3b2c', activeColor: '#fff', inactiveBg: '#fff', inactiveColor: '#334155', border: '#cbd5e1' }
            ];

            tabs.forEach(t => {
                const el = document.getElementById(t.id);
                if (!el) return;
                const isSelected = (filter === 'issues' && t.id === 'sfTabIssues')
                    || (filter === 'resolved' && t.id === 'sfTabResolved')
                    || (filter === 'no_issues' && t.id === 'sfTabNoIssues')
                    || (filter === 'all' && t.id === 'sfTabAll');

                if (isSelected) {
                    el.style.background = t.activeBg;
                    el.style.color = t.activeColor;
                } else {
                    el.style.background = t.inactiveBg;
                    el.style.color = t.inactiveColor;
                }
            });

            renderSystemFeedbackList();
        }

        function renderSystemFeedbackList() {
            const listEl = document.getElementById('systemFeedbackList');
            if (!listEl) return;

            let filtered = _sfFeedbacks;
            if (_sfCurrentFilter === 'issues') {
                filtered = _sfFeedbacks.filter(f => f.status === 'pending_admin_action');
            } else if (_sfCurrentFilter === 'resolved') {
                filtered = _sfFeedbacks.filter(f => f.status === 'resolved_by_admin');
            } else if (_sfCurrentFilter === 'no_issues') {
                filtered = _sfFeedbacks.filter(f => f.status === 'no_issues');
            }

            if (filtered.length === 0) {
                listEl.innerHTML = '<div style="text-align:center; padding:40px 20px; color:#64748b; font-size:14px; font-weight:600; background:#fff; border-radius:14px; border:1px dashed #cbd5e1;">මෙම වර්ගීකරණය යටතේ කිසිදු ප්‍රතිචාරයක් හමු නොවීය.</div>';
                return;
            }

            listEl.innerHTML = filtered.map(item => {
                const isIssue = item.status === 'pending_admin_action';
                const isResolved = item.status === 'resolved_by_admin';
                const isReviewed = item.status === 'reviewed';

                let statusBadge = '<span style="background:#dcfce7; color:#166534; padding:3px 10px; border-radius:8px; font-size:12px; font-weight:800; border:1px solid #bbf7d0;">🟢 ඊයේ ගැටළු නැත (No Issues)</span>';
                if (isIssue) {
                    statusBadge = '<span style="background:#fee2e2; color:#991b1b; padding:3px 10px; border-radius:8px; font-size:12px; font-weight:800; border:1px solid #fecaca;">🔴 විසඳිය යුතු ගැටලුවක් ඇත (Action Needed)</span>';
                } else if (isResolved) {
                    statusBadge = '<span style="background:#fef9c3; color:#854d0e; padding:3px 10px; border-radius:8px; font-size:12px; font-weight:800; border:1px solid #fef08a;">🟡 Admin විසඳුම් ලබා දී ඇත</span>';
                } else if (isReviewed) {
                    statusBadge = '<span style="background:#e0f2fe; color:#0369a1; padding:3px 10px; border-radius:8px; font-size:12px; font-weight:800; border:1px solid #bae6fd;">🔵 විසඳුම් ලබා දුන් බව සලකුණු කර ඇත</span>';
                }

                let timeStr = item.date || '';
                if (item.createdAt && typeof item.createdAt.toDate === 'function') {
                    timeStr = item.createdAt.toDate().toLocaleString('si-LK');
                }

                return \`
                    <div style="background:#fff; border:1.5px solid \${isIssue ? '#fca5a5' : '#e2e8f0'}; border-radius:14px; padding:16px 18px; box-shadow:0 2px 4px rgba(0,0,0,0.03); transition:all 0.2s;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; gap:10px; flex-wrap:wrap;">
                            <div>
                                <div style="font-size:15px; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:8px;">
                                    <span>\${item.businessName || 'Business'}</span>
                                    <span style="font-size:11px; padding:2px 7px; background:#f1f5f9; border-radius:6px; font-weight:800; color:#475569; border:1px solid #e2e8f0;">\${item.planType || 'PRO'}</span>
                                </div>
                                <div style="font-size:12.5px; color:#475569; margin-top:4px; font-weight:500;">
                                    👤 \${item.userName || 'User'} &bull; ✉️ \${item.userEmail || ''} \${item.userPhone ? '&bull; 📞 ' + item.userPhone : ''}
                                </div>
                            </div>
                            <div>\${statusBadge}</div>
                        </div>

                        \${item.feedbackText ? \`
                            <div style="background:#fef2f2; border:1.5px dashed #f87171; border-radius:10px; padding:12px 14px; font-size:13.5px; color:#7f1d1d; margin:10px 0; font-weight:600; line-height:1.5;">
                                <div style="font-size:11px; font-weight:800; text-transform:uppercase; color:#991b1b; margin-bottom:4px;">පාරිභෝගිකයාගේ සටහන (Client Issue Note):</div>
                                \${item.feedbackText}
                            </div>
                        \` : ''}

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px; padding-top:8px; border-top:1px solid #f1f5f9; font-size:11.5px; color:#94a3b8;">
                            <span>🕒 \${timeStr}</span>
                            \${isIssue ? \`
                                <button type="button" onclick="markFeedbackReviewed('\${item.id}')" style="background:#0f3b2c; color:#fff; border:none; padding:6px 14px; border-radius:8px; font-size:12px; font-weight:800; cursor:pointer; transition:background 0.2s;">
                                    ✅ විසඳුමක් ලබා දුන් බව සලකුණු කරන්න
                                </button>
                            \` : ''}
                        </div>
                    </div>
                \`;
            }).join('');
        }

        async function markFeedbackReviewed(id) {
            if (!id || !window.db) return;
            try {
                await window.db.collection('daily_system_feedback').doc(id).update({
                    status: 'reviewed',
                    reviewedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch(e) {
                alert('Error updating feedback: ' + e.message);
            }
        }

        function openSystemFeedbackModal() {
            const m = document.getElementById('systemFeedbackModal');
            if (m) m.style.display = 'flex';
        }

        function closeSystemFeedbackModal() {
            const m = document.getElementById('systemFeedbackModal');
            if (m) m.style.display = 'none';
        }

        window.addEventListener('DOMContentLoaded', () => {
            setTimeout(initSystemFeedbackListener, 800);
        });
    </script>
`;

if (content.includes(startMarker)) {
    const idxStart = content.indexOf(startMarker);
    const idxEnd = content.indexOf(endMarker, idxStart);
    content = content.slice(0, idxStart) + newModalSection + '\n' + content.slice(idxEnd);
    console.log('Modal section replaced cleanly');
} else {
    content = content.replace('</body>', newModalSection + '\n</body>');
    console.log('Modal section appended');
}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('scrap-buying.html updated successfully with categorized lists');

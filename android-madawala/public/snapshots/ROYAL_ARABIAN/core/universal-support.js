/**
 * DIGIBIZ Universal Support & Client Resolution Notification Network
 * Real-time floating support widget & instant admin resolution alerts.
 */
(function() {
    'use strict';

    // Prevent duplicate initialization
    if (window.__DIGIBIZ_UNIVERSAL_SUPPORT_INITIALIZED__) return;
    window.__DIGIBIZ_UNIVERSAL_SUPPORT_INITIALIZED__ = true;

    // Do not show on auth login, attendance QR scan pages, or distributor/van rep apps
    const currentPath = window.location.pathname.toLowerCase();
    if (currentPath.includes('/auth/login') || currentPath.includes('mobile-scan.html') || currentPath.includes('repapp.html') || currentPath.includes('distributor-repapp')) {
        return;
    }

    let _currentUser = null;
    let _userContext = null;
    let _unsubResolutionListener = null;
    let _selectedAttachmentData = null; // Base64 or File

    // --- HELPER: Client Image Compression ---
    function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.82) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                return reject(new Error('Invalid image file'));
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round((height * maxWidth) / width);
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round((width * maxHeight) / height);
                            height = maxHeight;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
                    canvas.toBlob((blob) => {
                        resolve({ blob, dataUrl: compressedDataUrl });
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // --- HELPER: Upload Attachment ---
    async function uploadAttachment(fileOrData, uid) {
        if (!fileOrData) return null;
        const now = new Date();
        const dateFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const fileName = `${Date.now()}_${uid || 'anon'}.jpg`;
        const storagePath = `feedback-attachments/${dateFolder}/${fileName}`;

        try {
            if (window.firebase && firebase.storage && fileOrData.blob) {
                const storageRef = firebase.storage().ref().child(storagePath);
                const snapshot = await storageRef.put(fileOrData.blob, { contentType: 'image/jpeg' });
                return await snapshot.ref.getDownloadURL();
            }
        } catch (e) {
            console.warn('[UniversalSupport] Storage upload fallback to dataURL:', e);
        }
        // Fallback to dataURL if storage fails
        return fileOrData.dataUrl || null;
    }

    // --- INJECT STYLES ---
    function injectStyles() {
        if (document.getElementById('digibizUniversalSupportStyles')) return;
        const style = document.createElement('style');
        style.id = 'digibizUniversalSupportStyles';
        style.textContent = `
            /* Floating Action Button */
            .digibiz-support-fab {
                position: fixed;
                bottom: 22px;
                right: 22px;
                z-index: 999980;
                display: flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #0f3b2c 0%, #166534 100%);
                color: #ffffff;
                padding: 10px 18px;
                border-radius: 50px;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                font-size: 13.5px;
                font-weight: 700;
                cursor: pointer;
                box-shadow: 0 4px 14px rgba(15, 59, 44, 0.35), 0 2px 6px rgba(0, 0, 0, 0.15);
                border: 1.5px solid rgba(255, 255, 255, 0.2);
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                user-select: none;
            }
            .digibiz-support-fab:hover {
                transform: translateY(-2px) scale(1.03);
                box-shadow: 0 8px 20px rgba(15, 59, 44, 0.45);
                background: linear-gradient(135deg, #114d39 0%, #15803d 100%);
            }
            .digibiz-support-fab:active {
                transform: scale(0.97);
            }
            @media (max-width: 768px) {
                .digibiz-support-fab {
                    bottom: 80px;
                    right: 16px;
                    padding: 8px 14px;
                    font-size: 12.5px;
                }
            }

            /* Support Modal Overlay */
            .digibiz-support-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.65);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                z-index: 999995;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 16px;
                font-family: 'Inter', system-ui, -apple-system, sans-serif;
                box-sizing: border-box;
            }
            .digibiz-support-modal-card {
                background: #ffffff;
                width: 100%;
                max-width: 520px;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                animation: dgbzSupFadeIn 0.25s ease-out;
                display: flex;
                flex-direction: column;
                max-height: 90vh;
            }
            @keyframes dgbzSupFadeIn {
                from { opacity: 0; transform: scale(0.96) translateY(10px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            .digibiz-support-header {
                background: linear-gradient(135deg, #0f3b2c 0%, #166534 100%);
                color: #ffffff;
                padding: 18px 22px;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .digibiz-support-body {
                padding: 20px 22px;
                overflow-y: auto;
            }
            .digibiz-support-footer {
                padding: 14px 22px;
                background: #f8fafc;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: flex-end;
                gap: 10px;
            }
            .digibiz-img-preview-box {
                position: relative;
                display: inline-block;
                margin-top: 10px;
                border-radius: 10px;
                overflow: hidden;
                border: 1px solid #cbd5e1;
                max-width: 100%;
            }
            .digibiz-img-preview-box img {
                max-height: 140px;
                display: block;
                object-fit: cover;
                border-radius: 8px;
            }
            .digibiz-img-remove-btn {
                position: absolute;
                top: 4px;
                right: 4px;
                background: rgba(15, 23, 42, 0.75);
                color: #fff;
                border: none;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            }
        `;
        document.head.appendChild(style);
    }

    // --- CREATE FLOATING ACTION BUTTON ---
    function renderFloatingButton() {
        if (document.getElementById('digibizSupportFab')) return;
        const fab = document.createElement('div');
        fab.id = 'digibizSupportFab';
        fab.className = 'digibiz-support-fab';
        fab.innerHTML = `
            <span style="font-size: 17px;">💬</span>
            <span>සහාය / ගැටළු (Support)</span>
        `;
        fab.addEventListener('click', openSupportModal);
        document.body.appendChild(fab);
    }

    // --- CREATE MODALS IN DOM ---
    function renderModals() {
        if (document.getElementById('digibizSupportModal')) return;

        // 1. Support Composer Modal
        const supportModal = document.createElement('div');
        supportModal.id = 'digibizSupportModal';
        supportModal.className = 'digibiz-support-modal-overlay';
        supportModal.innerHTML = `
            <div class="digibiz-support-modal-card">
                <div class="digibiz-support-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 22px;">🛡️</span>
                        <div>
                            <div style="font-size: 15.5px; font-weight: 800; letter-spacing: -0.2px;">DIGIBIZ ක්ෂණික පාරිභෝගික සහාය</div>
                            <div style="font-size: 11.5px; opacity: 0.85; font-weight: 500;">Live Help & Direct Support Center</div>
                        </div>
                    </div>
                    <button type="button" id="dgbzCloseSupportModalBtn" style="background: rgba(255,255,255,0.15); border: none; color: #fff; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center;">✕</button>
                </div>
                <div class="digibiz-support-body">
                    <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 10px; margin-bottom: 14px; font-size: 12.5px; color: #475569; border-left: 4px solid #0f3b2c;">
                        <span style="font-weight: 700;" id="dgbzSupBizInfo">Loading business...</span><br>
                        <span style="font-size: 11.5px; color: #64748b;" id="dgbzSupPageInfo">Current Page</span>
                    </div>

                    <label style="display: block; font-size: 13px; font-weight: 700; color: #1e293b; margin-bottom: 6px;">
                        ඔබ මුහුණ දුන් ගැටලුව හෝ විමසීම විස්තර කරන්න: <span style="color: #ef4444;">*</span>
                    </label>
                    <textarea id="dgbzSupportText" rows="4" placeholder="ඔබට ඇති වූ තාක්ෂණික හෝ ගිණුම් ගැටලුව මෙහි පැහැදිලිව සටහන් කරන්න..." style="width: 100%; border: 1.5px solid #cbd5e1; border-radius: 10px; padding: 12px; font-family: inherit; font-size: 13.5px; outline: none; box-sizing: border-box; resize: vertical; transition: border 0.2s;"></textarea>

                    <div style="margin-top: 14px;">
                        <label style="display: block; font-size: 12.5px; font-weight: 700; color: #334155; margin-bottom: 6px;">
                            📸 Screenshot එකක් හෝ ඡායාරූපයක් (විකල්පයි):
                        </label>
                        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                            <label style="background: #f8fafc; border: 1.5px dashed #94a3b8; border-radius: 10px; padding: 8px 14px; font-size: 12.5px; color: #0f3b2c; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
                                <span>📁 Image එකක් තෝරන්න / Camera</span>
                                <input type="file" id="dgbzSupportFileInput" accept="image/*" style="display: none;">
                            </label>
                            <span style="font-size: 11px; color: #94a3b8;">(Ctrl+V මඟින් Screenshot Paste කළ හැක)</span>
                        </div>
                        <div id="dgbzImagePreviewContainer" style="display: none;"></div>
                    </div>
                </div>
                <div class="digibiz-support-footer">
                    <button type="button" id="dgbzCancelSupportBtn" style="background: #e2e8f0; color: #334155; border: none; padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer;">අවලංගු කරන්න</button>
                    <button type="button" id="dgbzSendSupportBtn" style="background: #0f3b2c; color: #ffffff; border: none; padding: 9px 22px; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px;">
                        <span>🚀 Admin වෙත යොමු කරන්න</span>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(supportModal);

        // 2. Client Resolution Alert Modal
        const alertModal = document.createElement('div');
        alertModal.id = 'digibizResolutionAlertModal';
        alertModal.className = 'digibiz-support-modal-overlay';
        alertModal.innerHTML = `
            <div class="digibiz-support-modal-card" style="border: 2px solid #10b981;">
                <div class="digibiz-support-header" style="background: linear-gradient(135deg, #065f46 0%, #047857 100%);">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 24px;">🎉</span>
                        <div>
                            <div style="font-size: 16px; font-weight: 800;">ගැටලුවට විසඳුමක් ලබා දී ඇත!</div>
                            <div style="font-size: 12px; opacity: 0.9;">Admin Issue Resolution Notification</div>
                        </div>
                    </div>
                </div>
                <div class="digibiz-support-body">
                    <div style="font-size: 13.5px; color: #1e293b; line-height: 1.6; margin-bottom: 14px;">
                        ඔබ විසින් මතු කරන ලද ගැටලුව සඳහා Admin විසින් විසඳුම සකසා අවසන් කර ඇත.
                    </div>

                    <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 14px 16px; margin-bottom: 14px;">
                        <div style="font-size: 11.5px; font-weight: 800; color: #166534; text-transform: uppercase; margin-bottom: 6px;">
                            📌 Admin ලබා දුන් විසඳුම් සටහන (Resolution Note):
                        </div>
                        <div id="dgbzAlertNoteText" style="font-size: 13.5px; color: #064e3b; font-weight: 600; white-space: pre-wrap;">-</div>
                    </div>

                    <div id="dgbzAlertImageContainer" style="display: none; margin-bottom: 14px;">
                        <div style="font-size: 11.5px; font-weight: 800; color: #475569; margin-bottom: 6px;">📸 අමුණා ඇති Screenshot / පැහැදිලි කිරීම:</div>
                        <a id="dgbzAlertImageLink" href="#" target="_blank" style="display: block;">
                            <img id="dgbzAlertImageTag" src="" alt="Resolution proof" style="max-width: 100%; max-height: 200px; border-radius: 10px; border: 1px solid #cbd5e1; object-fit: contain; background: #000;">
                        </a>
                    </div>
                </div>
                <div class="digibiz-support-footer" style="justify-content: center; background: #f0fdf4;">
                    <button type="button" id="dgbzAckResolutionBtn" style="background: #047857; color: #fff; border: none; padding: 10px 28px; border-radius: 10px; font-size: 14px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 8px rgba(4,120,87,0.3);">
                        👍 ස්තූතියි, තහවුරු කළා (Acknowledge)
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(alertModal);

        // Bind events
        document.getElementById('dgbzCloseSupportModalBtn').addEventListener('click', closeSupportModal);
        document.getElementById('dgbzCancelSupportBtn').addEventListener('click', closeSupportModal);
        document.getElementById('dgbzSendSupportBtn').addEventListener('click', handleSendSupport);
        document.getElementById('dgbzSupportFileInput').addEventListener('change', handleFileSelected);

        // Clipboard paste handler on textarea
        document.getElementById('dgbzSupportText').addEventListener('paste', handlePasteImage);
    }

    // --- MODAL CONTROLS ---
    function openSupportModal() {
        const modal = document.getElementById('digibizSupportModal');
        if (!modal) return;

        // Populate business / page info
        const bizName = (_userContext && _userContext.businessName) || localStorage.getItem('businessName') || 'My Business';
        const userEmail = (_currentUser && _currentUser.email) || '';
        document.getElementById('dgbzSupBizInfo').textContent = `🏢 ${bizName} (${userEmail})`;
        document.getElementById('dgbzSupPageInfo').textContent = `📄 ${document.title || window.location.pathname}`;

        _selectedAttachmentData = null;
        document.getElementById('dgbzImagePreviewContainer').innerHTML = '';
        document.getElementById('dgbzImagePreviewContainer').style.display = 'none';
        document.getElementById('dgbzSupportText').value = '';

        modal.style.display = 'flex';
        setTimeout(() => document.getElementById('dgbzSupportText').focus(), 100);
    }

    function closeSupportModal() {
        const modal = document.getElementById('digibizSupportModal');
        if (modal) modal.style.display = 'none';
    }

    // --- IMAGE HANDLING ---
    async function handleFileSelected(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const compressed = await compressImageFile(file);
            _selectedAttachmentData = compressed;
            showImagePreview(compressed.dataUrl);
        } catch (err) {
            alert('ඡායාරූපය සැකසීමේදී දෝෂයක් මතු විය: ' + err.message);
        }
    }

    async function handlePasteImage(e) {
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                try {
                    const compressed = await compressImageFile(blob);
                    _selectedAttachmentData = compressed;
                    showImagePreview(compressed.dataUrl);
                } catch (err) {
                    console.warn('Clipboard image compression warn:', err);
                }
            }
        }
    }

    function showImagePreview(dataUrl) {
        const container = document.getElementById('dgbzImagePreviewContainer');
        if (!container) return;
        container.style.display = 'block';
        container.innerHTML = `
            <div class="digibiz-img-preview-box">
                <img src="${dataUrl}" alt="Preview">
                <button type="button" class="digibiz-img-remove-btn" title="ඉවත් කරන්න">✕</button>
            </div>
        `;
        container.querySelector('.digibiz-img-remove-btn').addEventListener('click', () => {
            _selectedAttachmentData = null;
            container.innerHTML = '';
            container.style.display = 'none';
            document.getElementById('dgbzSupportFileInput').value = '';
        });
    }

    // --- SEND SUPPORT ISSUE ---
    async function handleSendSupport() {
        const text = (document.getElementById('dgbzSupportText').value || '').trim();
        if (!text) {
            alert('කරුණාකර ඔබගේ ගැටලුව හෝ විමසීම සටහන් කරන්න.');
            return;
        }

        const btn = document.getElementById('dgbzSendSupportBtn');
        btn.disabled = true;
        btn.innerHTML = '<span>⏳ යොමු කරමින් පවතී...</span>';

        try {
            const fs = (typeof db !== 'undefined' && db) || (window.db) || (firebase.firestore && firebase.firestore());
            if (!fs) throw new Error('Database connection is not ready.');

            let uploadedImageUrl = null;
            if (_selectedAttachmentData) {
                uploadedImageUrl = await uploadAttachment(_selectedAttachmentData, _currentUser && _currentUser.uid);
            }

            const now = new Date();
            const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const bizId = (_userContext && _userContext.businessId) || localStorage.getItem('currentBusinessId') || localStorage.getItem('selectedBusinessId') || (_currentUser && _currentUser.uid) || 'unknown';
            const bizName = (_userContext && _userContext.businessName) || localStorage.getItem('businessName') || 'Business';
            const plan = (_userContext && _userContext.subscriptionPlan) || localStorage.getItem('userPlan') || 'PRO';

            await fs.collection('daily_system_feedback').add({
                businessId: bizId,
                businessName: bizName,
                planType: plan,
                userId: _currentUser ? _currentUser.uid : 'anon',
                userName: (_userContext && _userContext.displayName) || (_currentUser && _currentUser.displayName) || (_currentUser && _currentUser.email) || 'User',
                userEmail: (_currentUser && _currentUser.email) || '',
                userRole: (_userContext && _userContext.role) || localStorage.getItem('userRole') || 'USER',
                pageUrl: window.location.href,
                pageTitle: document.title || window.location.pathname,
                feedbackText: text,
                clientScreenshotUrl: uploadedImageUrl || null,
                status: 'pending_admin_action',
                source: 'floating_widget',
                date: todayKey,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            closeSupportModal();
            showSuccessToast('✅ ඔබගේ ගැටලුව සාර්ථකව Admin වෙත යොමු කරන ලදී! කඩිනමින් විසඳුමක් ලබා දෙනු ඇත.');
        } catch (e) {
            alert('ගැටලුව යොමු කිරීමේදී දෝෂයක් මතු විය: ' + e.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>🚀 Admin වෙත යොමු කරන්න</span>';
        }
    }

    function showSuccessToast(msg) {
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed; top:24px; left:50%; transform:translateX(-50%); background:#0f3b2c; color:#fff; padding:12px 24px; border-radius:30px; font-family:sans-serif; font-size:14px; font-weight:700; z-index:9999999; box-shadow:0 10px 25px rgba(0,0,0,0.25); border:1.5px solid #22c55e; text-align:center; animation:dgbzSupFadeIn 0.3s ease-out;';
        toast.textContent = msg;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.5s ease';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    // --- CLIENT RESOLUTION NOTIFICATION LISTENER ---
    function initResolutionAlertListener(user) {
        if (!user || _unsubResolutionListener) return;
        const fs = (typeof db !== 'undefined' && db) || (window.db) || (firebase.firestore && firebase.firestore());
        if (!fs) return;

        try {
            _unsubResolutionListener = fs.collection('daily_system_feedback')
                .where('userId', '==', user.uid)
                .where('status', '==', 'resolved_by_admin')
                .where('clientNotificationPending', '==', true)
                .limit(1)
                .onSnapshot((snapshot) => {
                    if (!snapshot.empty) {
                        const doc = snapshot.docs[0];
                        showResolutionAlertModal(doc.id, doc.data());
                    }
                }, (err) => {
                    console.warn('[UniversalSupport] Resolution listener warn:', err);
                });
        } catch (e) {
            console.warn('[UniversalSupport] Resolution listener init warn:', e);
        }
    }

    function showResolutionAlertModal(docId, data) {
        const modal = document.getElementById('digibizResolutionAlertModal');
        if (!modal) return;

        document.getElementById('dgbzAlertNoteText').textContent = data.adminResolutionNote || 'Admin විසින් ඔබගේ ගැටලුව සාර්ථකව පරීක්ෂා කර විසඳා ඇත.';
        
        const imgContainer = document.getElementById('dgbzAlertImageContainer');
        const imgTag = document.getElementById('dgbzAlertImageTag');
        const imgLink = document.getElementById('dgbzAlertImageLink');
        if (data.adminResolutionImageUrl) {
            imgTag.src = data.adminResolutionImageUrl;
            imgLink.href = data.adminResolutionImageUrl;
            imgContainer.style.display = 'block';
        } else {
            imgContainer.style.display = 'none';
        }

        const ackBtn = document.getElementById('dgbzAckResolutionBtn');
        ackBtn.onclick = async () => {
            ackBtn.disabled = true;
            ackBtn.textContent = 'තහවුරු කරමින් පවතී...';
            try {
                const fs = (typeof db !== 'undefined' && db) || (window.db) || (firebase.firestore && firebase.firestore());
                if (fs) {
                    await fs.collection('daily_system_feedback').doc(docId).update({
                        clientNotificationPending: false,
                        acknowledgedAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }
            } catch (e) {
                console.warn('Ack error:', e);
            }
            modal.style.display = 'none';
            ackBtn.disabled = false;
            ackBtn.textContent = '👍 ස්තූතියි, තහවුරු කළා (Acknowledge)';
        };

        modal.style.display = 'flex';
    }

    // --- MAIN INITIALIZATION ---
    function init() {
        injectStyles();
        renderFloatingButton();
        renderModals();

        if (window.firebase && firebase.auth) {
            firebase.auth().onAuthStateChanged(async (user) => {
                if (user) {
                    _currentUser = user;
                    try {
                        if (window.dashboardCore && typeof window.dashboardCore.getContext === 'function') {
                            _userContext = await window.dashboardCore.getContext(user);
                        }
                    } catch (e) {
                        console.warn('[UniversalSupport] User context fetch warn:', e);
                    }
                    initResolutionAlertListener(user);
                } else {
                    _currentUser = null;
                    if (_unsubResolutionListener) {
                        _unsubResolutionListener();
                        _unsubResolutionListener = null;
                    }
                }
            });
        }
    }

    window.openDigibizSupport = openSupportModal;
    window.closeDigibizSupport = closeSupportModal;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

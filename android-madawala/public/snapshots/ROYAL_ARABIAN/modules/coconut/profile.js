/**
 * Coconut Wholesale Module — Profile Logic
 */

let appCtx = null;

document.addEventListener('DOMContentLoaded', async () => {
    appCtx = await window.CoconutModule.guardCoconutPage();
    if (!appCtx) return;

    window.CoconutModule.renderNav('profile');

    await loadBusinessProfile();
    document.getElementById('profileForm').addEventListener('submit', handleSaveProfile);

    // Setup Logo Upload
    setupLogoEvents();
});

function updateLogoDisplay(logoUrl) {
    const previewImg = document.getElementById('logoPreview');
    const placeholder = document.getElementById('logoPlaceholder');
    const removeBtn = document.getElementById('removeLogoBtn');
    const triggerBtn = document.getElementById('btnTriggerUpload');

    const cleanUrl = String(logoUrl || '').trim();
    if (cleanUrl) {
        if (previewImg) {
            previewImg.src = cleanUrl;
            previewImg.onerror = () => {
                previewImg.style.display = 'none';
                if (placeholder) placeholder.style.display = 'flex';
            };
            previewImg.style.display = 'block';
        }
        if (placeholder) placeholder.style.display = 'none';
        if (removeBtn) removeBtn.style.display = 'inline-flex';
        if (triggerBtn) triggerBtn.textContent = 'Change Logo';
    } else {
        if (previewImg) {
            previewImg.removeAttribute('src');
            previewImg.style.display = 'none';
        }
        if (placeholder) placeholder.style.display = 'flex';
        if (removeBtn) removeBtn.style.display = 'none';
        if (triggerBtn) triggerBtn.textContent = 'Upload Logo';
    }
}

async function loadBusinessProfile() {
    const db = window.CoconutModule.getDb();
    try {
        const doc = await db.collection('businesses').doc(appCtx.businessId).get();
        if (!doc.exists) return;
        const b = doc.data();

        document.getElementById('profName').value = b.name || b.businessName || '';
        document.getElementById('profOwner').value = b.ownerName || '';
        document.getElementById('profPhone').value = b.phone || '';
        document.getElementById('profBr').value = b.brNumber || b.taxId || '';
        document.getElementById('profAddress').value = b.address || '';

        updateLogoDisplay(b.logoUrl || '');
        if (b.logoUrl) {
            try { localStorage.setItem('digibizBusinessLogoUrl', b.logoUrl); } catch(e){}
        }

    } catch (e) {
        console.error('Load profile error:', e);
    }
}

async function handleSaveProfile(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSaveProfile');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    const db = window.CoconutModule.getDb();
    const bid = appCtx.businessId;

    const name = document.getElementById('profName').value.trim();
    const ownerName = document.getElementById('profOwner').value.trim();
    const phone = document.getElementById('profPhone').value.trim();
    const brNumber = document.getElementById('profBr').value.trim();
    const address = document.getElementById('profAddress').value.trim();

    try {
        await db.collection('businesses').doc(bid).set({
            name,
            businessName: name,
            ownerName,
            phone,
            brNumber,
            taxId: brNumber,
            address,
            updatedAt: window.CoconutModule.tsToFirestore(new Date())
        }, { merge: true });

        window.CoconutModule.showToast('Profile updated successfully!', 'success');

        try {
            window.dispatchEvent(new CustomEvent('digibiz-profile-updated', { detail: { businessId: bid, businessName: name } }));
        } catch (e) {}

    } catch (err) {
        window.CoconutModule.showToast('Failed to save profile: ' + err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = '💾 Save Profile Changes';
    }
}

function setupLogoEvents() {
    const uploadArea = document.getElementById('logoUploadArea');
    const fileInput = document.getElementById('logoFile');
    const triggerBtn = document.getElementById('btnTriggerUpload');
    const removeBtn = document.getElementById('removeLogoBtn');

    if (uploadArea) {
        uploadArea.onclick = () => fileInput.click();
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleUploadLogo(e.dataTransfer.files[0]);
            }
        });
    }
    if (triggerBtn) triggerBtn.onclick = () => fileInput.click();
    if (removeBtn) removeBtn.onclick = handleRemoveLogo;
    if (fileInput) {
        fileInput.onchange = (e) => {
            if (e.target.files && e.target.files[0]) {
                handleUploadLogo(e.target.files[0]);
            }
        };
    }
}

async function handleUploadLogo(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        window.CoconutModule.showToast('Please select a valid image file', 'error');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        window.CoconutModule.showToast('Logo file size must be 5MB or smaller', 'error');
        return;
    }

    const storageApi = window.storage || (typeof firebase !== 'undefined' && firebase.storage && firebase.storage());
    if (!storageApi) {
        window.CoconutModule.showToast('Storage not initialized', 'error');
        return;
    }

    const bid = appCtx.businessId;
    const progressWrap = document.getElementById('logoUploadProgress');
    const progressBar = document.getElementById('logoProgressBar');
    const progressText = document.getElementById('logoProgressText');
    if (progressWrap) progressWrap.style.display = 'block';

    try {
        const ext = file.type === 'image/svg+xml' ? 'svg' : (file.type === 'image/png' ? 'png' : 'jpg');
        const path = `business-logos/${bid}/logo-${Date.now()}.${ext}`;
        const logoRef = storageApi.ref().child(path);

        const uploadTask = logoRef.put(file, { contentType: file.type });
        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                if (progressBar) progressBar.style.width = `${progress}%`;
                if (progressText) progressText.textContent = `Uploading: ${progress}%`;
            },
            (error) => {
                console.error(error);
                if (progressWrap) progressWrap.style.display = 'none';
                window.CoconutModule.showToast('Upload error: ' + error.message, 'error');
            },
            async () => {
                const logoUrl = await uploadTask.snapshot.ref.getDownloadURL();
                const db = window.CoconutModule.getDb();
                await db.collection('businesses').doc(bid).set({
                    logoUrl: logoUrl,
                    logoUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

                updateLogoDisplay(logoUrl);
                try {
                    localStorage.setItem('digibizBusinessLogoUrl', logoUrl);
                    sessionStorage.setItem('digibizBusinessLogoUrl', logoUrl);
                } catch(e){}

                if (window.digibizSidebar && typeof window.digibizSidebar.renderBusinessLogo === 'function') {
                    window.digibizSidebar.businessLogoUrl = logoUrl;
                    window.digibizSidebar.renderBusinessLogo();
                }

                if (progressWrap) setTimeout(() => { progressWrap.style.display = 'none'; }, 800);
                window.CoconutModule.showToast('Logo uploaded successfully!', 'success');
            }
        );
    } catch(err) {
        if (progressWrap) progressWrap.style.display = 'none';
        window.CoconutModule.showToast('Upload failed: ' + err.message, 'error');
    }
}

async function handleRemoveLogo() {
    if (!confirm('Are you sure you want to remove the business logo?')) return;
    const bid = appCtx.businessId;
    const db = window.CoconutModule.getDb();

    try {
        await db.collection('businesses').doc(bid).update({
            logoUrl: '',
            logoUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        updateLogoDisplay('');
        try {
            localStorage.removeItem('digibizBusinessLogoUrl');
            sessionStorage.removeItem('digibizBusinessLogoUrl');
        } catch(e){}

        if (window.digibizSidebar && typeof window.digibizSidebar.renderBusinessLogo === 'function') {
            window.digibizSidebar.businessLogoUrl = '';
            window.digibizSidebar.renderBusinessLogo();
        }

        window.CoconutModule.showToast('Logo removed successfully!', 'success');
    } catch(err) {
        window.CoconutModule.showToast('Failed to remove logo: ' + err.message, 'error');
    }
}

/**
 * Auth Utilities - Dynamic Dedicated Client Workspace Routing Engine.
 */

window.AuthUI = {
    /**
     * Resolves business context and routes the user to their dedicated client dashboard.
     * @param {firebase.User} user 
     */
    async routeToUniversalDashboard(user) {
        if (!user) return;
        
        let businessType = 'retail';
        let businessId = user.uid;
        let emailNorm = String(user.email || '').trim().toLowerCase();
        let clientSlug = '';
        let businessName = '';
        let dedicatedUrl = '';

        try {
            // Ensure global DB is ready
            let retry = 0;
            while (!window.db && retry < 50) {
                await new Promise(r => setTimeout(r, 100));
                retry++;
            }
            
            if (!window.db) {
                console.error('[AuthUI] Firestore (window.db) not initialized');
                window.location.href = '/clients/my_workspace/#dashboard';
                return;
            }

            if (typeof window.ensureMwTradingOwnerBizMembership === 'function') {
                await window.ensureMwTradingOwnerBizMembership(user);
            }

            const userDoc = await window.db.collection('users').doc(user.uid).get();
            const userData = userDoc.exists ? userDoc.data() : {};
            
            businessId = userData.businessId || user.uid;
            
            // 1. Staff Discovery Override
            if (emailNorm) {
                const regDoc = await window.db.collection('staff_registry').doc(emailNorm).get();
                if (regDoc.exists && regDoc.data().businessId) {
                    businessId = regDoc.data().businessId;
                } else {
                    if (emailNorm === 'biz.himeshi@gmail.com' || emailNorm === 'biz.sirimal@gmail.com' || emailNorm === '2biz.sirimal@gmail.com') {
                        businessId = 'oDhSDYHQ2dV1DP33koysmZAqaY13';
                    }
                }
            }

            const businessDoc = await window.db.collection('businesses').doc(businessId).get();
            if (businessDoc.exists) {
                const bData = businessDoc.data();
                businessType = bData.businessType || businessType;
                businessName = bData.name || bData.businessName || '';
                clientSlug = bData.clientSlug || '';
                dedicatedUrl = bData.dedicatedWorkspaceUrl || '';
            }

            if (!clientSlug && businessName) {
                clientSlug = businessName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
            }
            if (!clientSlug) {
                clientSlug = emailNorm.split('@')[0].replace(/[^a-z0-9]+/g, '_') || 'workspace';
            }

            // Persist context
            localStorage.setItem('currentBusinessId', businessId);
            sessionStorage.setItem('currentBusinessId', businessId);
            localStorage.setItem('currentBusinessType', businessType);
            sessionStorage.setItem('currentBusinessType', businessType);
            localStorage.setItem('currentClientSlug', clientSlug);
            sessionStorage.setItem('currentClientSlug', clientSlug);

            if (window.FinalizationEngine && typeof window.FinalizationEngine.runAutoFinalizationForCurrentUser === 'function') {
                window.FinalizationEngine.runAutoFinalizationForCurrentUser().catch(() => {});
            }

            if (userData.mustChangePassword === true) {
                localStorage.setItem('forcePasswordChangeNotice', 'Please change your password before continuing');
                sessionStorage.setItem('forcePasswordChangeNotice', 'Please change your password before continuing');
                window.location.replace('/modules/core/change-password.html');
                return;
            }

            // Check Subscription Status
            const subStatus = userData.subscriptionStatus || (businessDoc.exists ? businessDoc.data().subscriptionStatus : 'ACTIVE');
            if (subStatus === 'EXPIRED' || subStatus === 'INACTIVE') {
                alert('Your DigiBiz Subscription is currently inactive. Please renew via Google Play App or Contact Support.');
                window.location.href = 'https://play.google.com/store/account/subscriptions';
                return;
            }
        } catch (error) {
            console.warn('[AuthUI] Login context resolution failed:', error);
        }
        
        // 1. Dedicated Client Workspaces Auto-Routing
        if (emailNorm === 'pulasthigama@gmail.com' || emailNorm.includes('pulasthigama') || emailNorm.includes('micro_tech') || clientSlug === 'micro_tech') {
            window.location.replace('/clients/micro_tech/index.html');
            return;
        }
        if (emailNorm === 'sathityre05@gmail.com' || emailNorm.includes('sathityre') || clientSlug === 'sathityrecentre') {
            window.location.replace('/clients/sathityrecentre/index.html');
            return;
        }
        if (emailNorm === 'bawanthavisal12@gmail.com' || emailNorm.includes('bawanthavisal') || emailNorm.includes('randipa') || clientSlug === 'bawantharandipa') {
            window.location.replace('/clients/bawantharandipa/index.html');
            return;
        }
        const compactType = String(businessType || '').toLowerCase().replace(/[\s\-_]+/g, '');
        if (compactType === 'communication' || compactType === 'microcom' || compactType === 'microcommunication' || emailNorm === 'test@communication.com') {
            window.location.replace('/demo/communication#dashboard');
            return;
        }
        if (compactType === 'factory' || compactType === 'manufacturer' || emailNorm === 'test@factory.com' || emailNorm === 'test@manufacturer.com') {
            window.location.replace('/demo/factory#dashboard');
            return;
        }

        if (dedicatedUrl) {
            window.location.replace(dedicatedUrl);
            return;
        }

        if (compactType === 'quickbilling' || compactType === 'easybill' || compactType === 'quickbill' || compactType === 'billing') {
            window.location.replace('/modules/quick_billing/app.html');
            return;
        }

        const targetUrl = (window.dashboardCore && window.dashboardCore.getVerticalDashboardUrl)
            ? window.dashboardCore.getVerticalDashboardUrl(businessType)
            : (businessType === 'distributor' ? '/modules/distributor/web/dashboard.html' : (businessType === 'quick_billing' ? '/modules/quick_billing/app.html' : `/modules/${businessType}/dashboard.html`));
        
        window.location.replace(targetUrl);
    }
};

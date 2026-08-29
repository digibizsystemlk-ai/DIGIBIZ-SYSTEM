/**
 * DIGIBIZ Daily System Health & Stability Check-In Survey
 * Automatically engages Trial & PRO users on their first daily access to ensure platform stability.
 * Appears for Business Owners, Staff/Employees across all businesses, and Distributor Reps.
 * Excludes official Demo accounts and pure Attendance Scanning pages (mobile-scan.html).
 */
(function() {
    if (typeof window === 'undefined') return;

    window.DailySurvey = {
        hasCheckedToday: false,

        getTodayKey() {
            try {
                return new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Colombo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(new Date());
            } catch (e) {
                const d = new Date();
                return d.toISOString().slice(0, 10);
            }
        },

        isDemoAccount(email, plan) {
            const cleanEmail = String(email || '').toLowerCase().trim();
            const cleanPlan = String(plan || '').toUpperCase().trim();
            if (cleanPlan === 'LIVE_DEMO' || cleanPlan === 'DEMO') return true;
            const officialDemos = [
                'test@retail.com', 'test@hardware.com', 'test@pharmacy.com', 'test@tire.com',
                'test@tyrecentre.com', 'test@tirecentre.com', 'test@tyre.com', 'test@autocare.com',
                'test@restaurant.com', 'test@salon.com', 'test@service.com', 'test@coconut.com',
                'test@attendance.com', 'test@easybill.com', 'test@quickbill.com', 'test@scrap.com',
                'test@teafactory.com', 'test@tea.com', 'demo@digibiz.lk'
            ];
            return officialDemos.includes(cleanEmail) || (cleanEmail.startsWith('test@') && cleanEmail.endsWith('.com') && cleanEmail !== 'test@bill.com');
        },

        formatDateKey(dateInput) {
            if (!dateInput) return null;
            try {
                let d = dateInput;
                if (typeof d.toDate === 'function') {
                    d = d.toDate();
                } else if (!(d instanceof Date)) {
                    d = new Date(d);
                }
                if (isNaN(d.getTime())) return null;
                return new Intl.DateTimeFormat('en-CA', {
                    timeZone: 'Asia/Colombo',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).format(d);
            } catch (e) {
                try {
                    const d = new Date(dateInput);
                    return d.toISOString().slice(0, 10);
                } catch(err) {
                    return null;
                }
            }
        },

        isFirstDay(user, uData = {}, bData = {}) {
            const todayKey = this.getTodayKey();
            const now = Date.now();
            const ONE_DAY_MS = 24 * 60 * 60 * 1000;

            // 1. Check Firebase Auth user.metadata.creationTime
            if (user && user.metadata && user.metadata.creationTime) {
                const authCreatedDate = new Date(user.metadata.creationTime);
                if (!isNaN(authCreatedDate.getTime())) {
                    const authKey = this.formatDateKey(authCreatedDate);
                    if (authKey === todayKey || (now - authCreatedDate.getTime()) < ONE_DAY_MS) {
                        return true;
                    }
                }
            }

            // 2. Check Firestore User document createdAt
            if (uData && uData.createdAt) {
                const uKey = this.formatDateKey(uData.createdAt);
                let uDate = typeof uData.createdAt.toDate === 'function' ? uData.createdAt.toDate() : new Date(uData.createdAt);
                if (uKey === todayKey || (!isNaN(uDate.getTime()) && (now - uDate.getTime()) < ONE_DAY_MS)) {
                    return true;
                }
            }

            // 3. Check Firestore Business document createdAt
            if (bData && bData.createdAt) {
                const bKey = this.formatDateKey(bData.createdAt);
                let bDate = typeof bData.createdAt.toDate === 'function' ? bData.createdAt.toDate() : new Date(bData.createdAt);
                if (bKey === todayKey || (!isNaN(bDate.getTime()) && (now - bDate.getTime()) < ONE_DAY_MS)) {
                    return true;
                }
            }

            return false;
        },

        async checkAndTrigger(user, context = {}) {
            if (!user || this.hasCheckedToday) return;

            const currentPath = String(window.location.pathname || '').toLowerCase();

            // EXCLUSION: Do NOT show on QR Attendance Scanning pages (for employees scanning attendance)
            if (currentPath.includes('mobile-scan.html') || currentPath.includes('/attendance_payroll/attendance.html')) {
                return;
            }

            const userEmail = String(user.email || '').toLowerCase().trim();
            let businessId = String(context.businessId || localStorage.getItem('currentBusinessId') || sessionStorage.getItem('currentBusinessId') || user.uid).trim();
            let businessName = String(context.businessName || localStorage.getItem('currentBusinessName') || sessionStorage.getItem('currentBusinessName') || '').trim();
            let userName = String(user.displayName || localStorage.getItem('currentUserName') || userEmail.split('@')[0]).trim();
            let userPhone = String(user.phoneNumber || localStorage.getItem('currentUserPhone') || '').trim();
            let userRole = String(context.role || localStorage.getItem('currentUserRole') || sessionStorage.getItem('currentUserRole') || 'STAFF').toUpperCase().trim();
            let businessType = String(context.businessType || localStorage.getItem('currentBusinessType') || 'retail').trim();
            let plan = String(context.plan || localStorage.getItem(`digibiz_user_plan_${user.uid}`) || localStorage.getItem(`digibiz_cached_plan_${businessId}`) || 'PRO').toUpperCase().trim();

            // Detect Distributor Rep
            const isRep = currentPath.includes('repapp') || userRole === 'REP' || userRole === 'DISTRIBUTOR_REP';
            if (isRep && userRole !== 'REP') {
                userRole = 'REP';
            }

            // Exclude Demo accounts only
            if (this.isDemoAccount(userEmail, plan)) {
                return;
            }

            // Attempt to enrich context and fetch account creation data
            let uData = {};
            let bData = {};
            if (window.db) {
                try {
                    const uDoc = await window.db.collection('users').doc(user.uid).get().catch(() => null);
                    if (uDoc && uDoc.exists) {
                        uData = uDoc.data() || {};
                        businessId = uData.businessId || businessId;
                        userName = uData.name || uData.displayName || userName;
                        userPhone = uData.phone || userPhone;
                        userRole = (uData.role || userRole).toUpperCase();
                    }
                    if (businessId) {
                        const bDoc = await window.db.collection('businesses').doc(businessId).get().catch(() => null);
                        if (bDoc && bDoc.exists) {
                            bData = bDoc.data() || {};
                            businessName = bData.name || bData.businessName || businessName;
                            businessType = bData.businessType || businessType;
                        }
                    }
                } catch(e) {}
            }

            businessName = businessName || 'My Business';

            const todayKey = this.getTodayKey();
            // Track per individual user so each employee/rep gets their own check-in
            const localKey = `digibiz_daily_survey_${user.uid}_${todayKey}`;

            // Check Local Storage cache first
            if (localStorage.getItem(localKey) === 'done' || sessionStorage.getItem(localKey) === 'done') {
                return;
            }

            // EXCLUSION: Do NOT show on the 1st day of registration/account creation
            // The survey asks about yesterday's experience, which is irrelevant for brand new accounts.
            if (this.isFirstDay(user, uData, bData)) {
                localStorage.setItem(localKey, 'done');
                sessionStorage.setItem(localKey, 'done');
                return;
            }

            // Verify with Firestore if already answered today by this user
            try {
                if (window.db) {
                    const snap = await window.db.collection('daily_system_feedback')
                        .where('userId', '==', user.uid)
                        .where('date', '==', todayKey)
                        .limit(1)
                        .get();
                    if (!snap.empty) {
                        localStorage.setItem(localKey, 'done');
                        sessionStorage.setItem(localKey, 'done');
                        return;
                    }
                }
            } catch (err) {
                console.warn('[DailySurvey] Firestore check warning:', err);
            }

            this.hasCheckedToday = true;

            // Display Survey Modal
            this.renderSurveyModal({
                userId: user.uid,
                businessId,
                businessName,
                userEmail,
                userName,
                userPhone,
                userRole,
                businessType,
                plan,
                todayKey,
                localKey
            });
        },

        renderSurveyModal(data) {
            if (document.getElementById('digibizDailySurveyModal')) return;

            const roleDisplay = data.userRole === 'REP' ? 'Distributor Rep' : (data.userRole === 'BUSINESS_OWNER' ? 'Owner' : (data.userRole || 'Staff'));

            const modalHtml = `
                <div id="digibizDailySurveyModal" style="position:fixed; inset:0; background:rgba(15,23,42,0.75); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); z-index:99999999; display:flex; align-items:center; justify-content:center; padding:16px; font-family:'Plus Jakarta Sans','Noto Sans Sinhala',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; animation:dgSurveyFadeIn 0.3s ease-out;">
                    <div style="background:#ffffff; width:100%; max-width:520px; border-radius:20px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); overflow:hidden; border:1px solid #e2e8f0; animation:dgSurveySlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);">
                        
                        <!-- Header Banner -->
                        <div style="background:linear-gradient(135deg, #0f3b2c 0%, #166534 100%); color:#ffffff; padding:22px 24px 18px; text-align:center; position:relative;">
                            <div style="width:46px; height:46px; background:rgba(255,255,255,0.15); border-radius:50%; display:inline-flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:10px; border:1px solid rgba(255,255,255,0.25);">
                                🛡️
                            </div>
                            <h2 style="margin:0 0 4px; font-size:17px; font-weight:800; letter-spacing:-0.3px; color:#ffffff;">දෛනික පද්ධති ස්ථායීතා විමසුම</h2>
                            <div style="font-size:12px; font-weight:700; color:#86efac; margin-bottom:4px;">Daily Platform Stability & Health Check</div>
                            <p style="margin:0; font-size:12px; line-height:1.4; color:rgba(255,255,255,0.9); font-weight:500;">
                                DIGIBIZ පද්ධතියේ නිවැරදි ක්‍රියාකාරිත්වය තහවුරු කරගැනීම සඳහායි.
                            </p>
                        </div>

                        <!-- Content Area -->
                        <div style="padding:22px 20px;">
                            
                            <!-- STEP 1: Has issues yesterday? -->
                            <div id="dgSurveyStep1">
                                <div style="font-size:15px; font-weight:800; color:#1e293b; line-height:1.4; text-align:center; margin-bottom:4px;">
                                    ඊයේ දවසේ ඔබගේ පද්ධතියේ යම් ගැටළු මතු වුණාද?
                                </div>
                                <div style="font-size:12.5px; font-weight:600; color:#64748b; text-align:center; margin-bottom:18px;">
                                    (Did you experience any system issues yesterday?)
                                </div>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                                    <button id="dgBtnNoIssues" type="button" style="background:#f0fdf4; color:#166534; border:2px solid #86efac; padding:14px 10px; border-radius:14px; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center;">
                                        <span style="font-size:24px;">✅</span>
                                        <span style="font-size:14.5px; font-weight:800; color:#15803d;">නැහැ (No Issues)</span>
                                        <span style="font-size:11.5px; font-weight:600; color:#166534; opacity:0.9;">කිසිදු ගැටළුවක් නැත</span>
                                    </button>
                                    <button id="dgBtnHadIssues" type="button" style="background:#fef2f2; color:#991b1b; border:2px solid #fca5a5; padding:14px 10px; border-radius:14px; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center;">
                                        <span style="font-size:24px;">⚠️</span>
                                        <span style="font-size:14.5px; font-weight:800; color:#b91c1c;">ඔව් (Had Issues)</span>
                                        <span style="font-size:11.5px; font-weight:600; color:#991b1b; opacity:0.9;">ගැටළු මතු වුණා</span>
                                    </button>
                                </div>
                            </div>

                            <!-- STEP 2: Did admin resolve it? -->
                            <div id="dgSurveyStep2" style="display:none;">
                                <div style="font-size:15px; font-weight:800; color:#1e293b; line-height:1.4; text-align:center; margin-bottom:4px;">
                                    එම ගැටලුව සඳහා ඔබට Admin ගෙන් විසඳුම් ලැබුණද?
                                </div>
                                <div style="font-size:12.5px; font-weight:600; color:#64748b; text-align:center; margin-bottom:18px;">
                                    (Was the issue resolved by Support/Admin?)
                                </div>
                                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                                    <button id="dgBtnAdminResolved" type="button" style="background:#f0fdf4; color:#166534; border:2px solid #86efac; padding:14px 10px; border-radius:14px; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center;">
                                        <span style="font-size:24px;">👍</span>
                                        <span style="font-size:14.5px; font-weight:800; color:#15803d;">ඔව් (Resolved)</span>
                                        <span style="font-size:11.5px; font-weight:600; color:#166534; opacity:0.9;">විසඳුම් ලැබුණි</span>
                                    </button>
                                    <button id="dgBtnAdminNotResolved" type="button" style="background:#fff7ed; color:#c2410c; border:2px solid #fdba74; padding:14px 10px; border-radius:14px; cursor:pointer; transition:all 0.2s; display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center;">
                                        <span style="font-size:24px;">✍️</span>
                                        <span style="font-size:14.5px; font-weight:800; color:#c2410c;">නැහැ (Not Resolved)</span>
                                        <span style="font-size:11.5px; font-weight:600; color:#9a3412; opacity:0.9;">තවමත් ගැටලුව පවතී</span>
                                    </button>
                                </div>
                            </div>

                            <!-- STEP 3: Describe Problem -->
                            <div id="dgSurveyStep3" style="display:none;">
                                <div style="font-size:14px; font-weight:800; color:#1e293b; margin-bottom:4px;">
                                    ඔබ මුහුණ දුන් ගැටලුව පහත ලියන්න:
                                </div>
                                <div style="font-size:12px; font-weight:600; color:#64748b; margin-bottom:8px;">
                                    (Please describe the issue below):
                                </div>
                                <textarea id="dgFeedbackText" rows="4" placeholder="උදා: බිල්පත් මුද්‍රණය කිරීමේදී හෝ SMS යැවීමේදී ගැටලුවක් ආවා... (Describe here)" style="width:100%; box-sizing:border-box; padding:12px; border:1.5px solid #cbd5e1; border-radius:12px; font-family:inherit; font-size:13.5px; resize:vertical; outline:none; margin-bottom:14px;"></textarea>
                                
                                <button id="dgBtnSubmitFeedback" type="button" style="width:100%; background:#0f3b2c; color:#ffffff; border:none; padding:14px; border-radius:12px; font-size:15px; font-weight:800; cursor:pointer; transition:background 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;">
                                    <span>📩</span>
                                    <span>යවන්න (Submit to Support)</span>
                                </button>
                            </div>

                            <!-- Success / Finished State -->
                            <div id="dgSurveySuccess" style="display:none; text-align:center; padding:10px 0;">
                                <div style="font-size:36px; margin-bottom:8px;">🎉</div>
                                <div style="font-size:16px; font-weight:800; color:#166534; margin-bottom:4px;" id="dgSuccessMsg">ස්තූතියි! ඔබගේ ප්‍රතිචාරය ලැබුණි.</div>
                                <div style="font-size:13px; color:#64748b;">Thank you! Have a great day.</div>
                            </div>

                        </div>

                        <!-- Footer Note -->
                        <div style="background:#f8fafc; border-top:1px solid #f1f5f9; padding:12px 20px; text-align:center; font-size:11.5px; color:#94a3b8;">
                            DIGIBIZ™ Quality Assurance & Support Network &bull; ${data.userName} (${roleDisplay})
                        </div>

                    </div>
                </div>

                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Sinhala:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap');
                    @keyframes dgSurveyFadeIn { from { opacity:0; } to { opacity:1; } }
                    @keyframes dgSurveySlideUp { from { opacity:0; transform:translateY(20px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
                </style>
            `;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = modalHtml;
            document.body.appendChild(wrapper);

            const step1 = document.getElementById('dgSurveyStep1');
            const step2 = document.getElementById('dgSurveyStep2');
            const step3 = document.getElementById('dgSurveyStep3');
            const successDiv = document.getElementById('dgSurveySuccess');
            const successMsg = document.getElementById('dgSuccessMsg');
            const feedbackText = document.getElementById('dgFeedbackText');

            const saveAndClose = async (payload, msg) => {
                try {
                    localStorage.setItem(data.localKey, 'done');
                    sessionStorage.setItem(data.localKey, 'done');

                    if (window.db) {
                        await window.db.collection('daily_system_feedback').add({
                            userId: data.userId,
                            businessId: data.businessId,
                            businessName: data.businessName,
                            userEmail: data.userEmail,
                            userName: data.userName,
                            userPhone: data.userPhone || '',
                            userRole: data.userRole || 'STAFF',
                            businessType: data.businessType,
                            planType: data.plan,
                            date: data.todayKey,
                            ...payload,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                } catch (e) {
                    console.error('[DailySurvey] Save error:', e);
                }

                step1.style.display = 'none';
                step2.style.display = 'none';
                step3.style.display = 'none';
                successMsg.textContent = msg || 'ස්තූතියි! ඔබගේ ප්‍රතිචාරය ලැබුණි.';
                successDiv.style.display = 'block';

                setTimeout(() => {
                    const modal = document.getElementById('digibizDailySurveyModal');
                    if (modal) {
                        modal.style.transition = 'opacity 0.3s ease-out';
                        modal.style.opacity = '0';
                        setTimeout(() => modal.remove(), 300);
                    }
                }, 1400);
            };

            // Event Listeners
            document.getElementById('dgBtnNoIssues').addEventListener('click', () => {
                saveAndClose({
                    hadIssues: false,
                    adminResolved: null,
                    feedbackText: '',
                    status: 'no_issues'
                }, 'ස්තූතියි! කිසිදු ගැටළුවක් නැති බව සටහන් කරගන්නා ලදී.');
            });

            document.getElementById('dgBtnHadIssues').addEventListener('click', () => {
                step1.style.display = 'none';
                step2.style.display = 'block';
            });

            document.getElementById('dgBtnAdminResolved').addEventListener('click', () => {
                saveAndClose({
                    hadIssues: true,
                    adminResolved: true,
                    feedbackText: 'Resolved by Admin',
                    status: 'resolved_by_admin'
                }, 'ස්තූතියි! ගැටලුව විසඳී ඇති බව සටහන් කරගන්නා ලදී.');
            });

            document.getElementById('dgBtnAdminNotResolved').addEventListener('click', () => {
                step2.style.display = 'none';
                step3.style.display = 'block';
                if (feedbackText) feedbackText.focus();
            });

            document.getElementById('dgBtnSubmitFeedback').addEventListener('click', () => {
                const text = String(feedbackText.value || '').trim();
                if (!text) {
                    feedbackText.style.borderColor = '#ef4444';
                    feedbackText.placeholder = 'කරුණාකර ඔබගේ ගැටලුව මෙහි ලියන්න...';
                    return;
                }

                saveAndClose({
                    hadIssues: true,
                    adminResolved: false,
                    feedbackText: text,
                    status: 'pending_admin_action'
                }, 'ස්තූතියි! ඔබගේ ගැටලුව Admin වෙත යොමු කරන ලදී.');
            });
        }
    };

    // Auto-listen on auth state changes across any bookmark/page
    function autoInitDailySurveyAuth() {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    setTimeout(() => {
                        window.DailySurvey.checkAndTrigger(user);
                    }, 800);
                }
            });
        } else {
            setTimeout(autoInitDailySurveyAuth, 300);
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInitDailySurveyAuth);
    } else {
        autoInitDailySurveyAuth();
    }
})();

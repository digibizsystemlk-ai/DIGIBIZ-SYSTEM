/**
 * DIGIBIZ CREDIT — Universal Pull-to-Refresh & Go Home Engine
 * Enables smooth visual pull-down gesture across all pages that redirects to Home Dashboard.
 */

(function() {
    // Inject PTR Styles
    const style = document.createElement('style');
    style.textContent = `
        .ptr-indicator {
            position: fixed;
            top: -65px;
            left: 0;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 999999;
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s;
            pointer-events: none;
            opacity: 0;
        }
        .ptr-content {
            background: #ffffff;
            border: 2px solid #bfdbfe;
            box-shadow: 0 6px 24px rgba(30, 64, 175, 0.18);
            padding: 8px 18px;
            border-radius: 30px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 800;
            color: #1e40af;
        }
        .ptr-icon {
            font-size: 14px;
            transition: transform 0.2s;
        }
        .ptr-icon.spin {
            animation: ptrSpin 0.6s linear infinite;
        }
        @keyframes ptrSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }

        /* Confirmation Dialog */
        .home-confirm-modal {
            display: none;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.6);
            z-index: 1000000;
            align-items: center;
            justify-content: center;
            padding: 16px;
            backdrop-filter: blur(4px);
        }
        .home-confirm-modal.active {
            display: flex;
            animation: fadeInModal 0.2s ease-out;
        }
        @keyframes fadeInModal {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .home-confirm-box {
            background: #ffffff;
            border-radius: 20px;
            padding: 22px;
            width: 100%;
            max-width: 360px;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.25);
            border: 2px solid #e2e8f0;
        }
        .home-confirm-icon {
            width: 50px;
            height: 50px;
            background: #eff6ff;
            color: #2563eb;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            margin: 0 auto 12px auto;
        }
        .home-confirm-title {
            font-size: 16px;
            font-weight: 800;
            color: #0f172a;
            margin-bottom: 6px;
        }
        .home-confirm-desc {
            font-size: 13px;
            color: #64748b;
            margin-bottom: 18px;
            line-height: 1.4;
        }
        .home-confirm-actions {
            display: flex;
            gap: 10px;
        }
        .btn-modal-cancel {
            flex: 1;
            padding: 11px;
            border-radius: 10px;
            background: #f1f5f9;
            color: #475569;
            font-size: 13.5px;
            font-weight: 700;
            border: none;
            cursor: pointer;
        }
        .btn-modal-go {
            flex: 1;
            padding: 11px;
            border-radius: 10px;
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
            color: #ffffff;
            font-size: 13.5px;
            font-weight: 800;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
    `;
    document.head.appendChild(style);

    // Inject PTR DOM
    const ptrEl = document.createElement('div');
    ptrEl.id = 'pullToRefreshIndicator';
    ptrEl.className = 'ptr-indicator';
    ptrEl.innerHTML = `
        <div class="ptr-content">
            <i class="fa-solid fa-house ptr-icon" id="ptrIcon"></i>
            <span id="ptrText">Pull down to go Home...</span>
        </div>
    `;
    document.body.appendChild(ptrEl);

    // Inject Modal DOM
    const modalEl = document.createElement('div');
    modalEl.id = 'homeConfirmModal';
    modalEl.className = 'home-confirm-modal';
    modalEl.innerHTML = `
        <div class="home-confirm-box">
            <div class="home-confirm-icon"><i class="fa-solid fa-house"></i></div>
            <div class="home-confirm-title">Go to Home Dashboard?</div>
            <div class="home-confirm-desc">මුල් තිරයට (Home Dashboard) නැවත යන්නද?</div>
            <div class="home-confirm-actions">
                <button type="button" class="btn-modal-cancel" id="btnCancelGoHome">Stay Here</button>
                <button type="button" class="btn-modal-go" id="btnConfirmGoHome">Yes, Go Home</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalEl);

    document.getElementById('btnCancelGoHome').addEventListener('click', () => {
        modalEl.classList.remove('active');
    });

    document.getElementById('btnConfirmGoHome').addEventListener('click', () => {
        window.location.href = '/clients/madawalateashop/modules/credit/dashboard.html';
    });

    // Touch Event Listeners for Pull to Home
    let touchStartY = 0;
    let touchCurrentY = 0;
    let isPulling = false;
    const PTR_THRESHOLD = 70;
    const isDashboard = window.location.pathname.includes('dashboard.html');

    window.addEventListener('touchstart', (e) => {
        const isAtTop = (window.scrollY <= 2 || document.documentElement.scrollTop <= 2);
        if (isAtTop && e.touches.length === 1) {
            touchStartY = e.touches[0].clientY;
            isPulling = true;
        } else {
            isPulling = false;
        }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (!isPulling || e.touches.length !== 1) return;
        touchCurrentY = e.touches[0].clientY;
        const pullDistance = touchCurrentY - touchStartY;

        if (pullDistance > 10) {
            const isAtTop = (window.scrollY <= 2 || document.documentElement.scrollTop <= 2);
            if (!isAtTop) {
                isPulling = false;
                return;
            }

            const indicator = document.getElementById('pullToRefreshIndicator');
            const icon = document.getElementById('ptrIcon');
            const text = document.getElementById('ptrText');
            const cappedDistance = Math.min(pullDistance * 0.45, 80);

            indicator.style.transform = `translateY(${cappedDistance + 65}px)`;
            indicator.style.opacity = Math.min(pullDistance / PTR_THRESHOLD, 1);

            if (pullDistance >= PTR_THRESHOLD) {
                text.textContent = isDashboard ? 'Release to reload...' : 'Release to go Home 🏠';
                icon.style.transform = 'scale(1.25) rotate(15deg)';
            } else {
                text.textContent = isDashboard ? 'Pull down to reload...' : 'Pull down to go Home 🏠';
                icon.style.transform = 'scale(1)';
            }
        }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
        if (!isPulling) return;
        const pullDistance = touchCurrentY - touchStartY;
        isPulling = false;

        const indicator = document.getElementById('pullToRefreshIndicator');
        const icon = document.getElementById('ptrIcon');
        const text = document.getElementById('ptrText');

        if (pullDistance >= PTR_THRESHOLD) {
            if (isDashboard) {
                text.textContent = 'Reloading...';
                icon.className = 'fa-solid fa-arrows-rotate ptr-icon spin';
                indicator.style.transform = 'translateY(75px)';
                setTimeout(() => window.location.reload(), 200);
            } else {
                indicator.style.transform = 'translateY(0)';
                indicator.style.opacity = '0';
                modalEl.classList.add('active');
            }
        } else {
            indicator.style.transform = 'translateY(0)';
            indicator.style.opacity = '0';
        }

        touchStartY = 0;
        touchCurrentY = 0;
    }, { passive: true });

})();

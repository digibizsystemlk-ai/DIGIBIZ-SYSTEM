const fs = require('fs');
const path = require('path');
let code = '';
code += `<!DOCTYPE html>
<html lang="si">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>DIGIBIZ SYSTEM — Super Admin Command Center & Live Intelligence</title>

    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" />

    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+Sinhala:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />

    <!-- Chart.js for 30-Day Active Trends -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>

    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>

    <script>
        const firebaseConfig = {
            apiKey: "AIzaSyDz-rTtysyWgt_3PUHG-ar8gS8oN0HTJiI",
            authDomain: "digibiz-system.firebaseapp.com",
            projectId: "digibiz-system",
            storageBucket: "digibiz-system.firebasestorage.app",
            messagingSenderId: "21839180976",
            appId: "1:21839180976:web:cbbeda3ebc061285db7775"
        };

        if (typeof firebase !== 'undefined' && !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        const auth = firebase.auth();
        const db = firebase.firestore();

        db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
    </script>
`;
code += `    <style>
        :root {
            --primary: #ff9900;
            --primary-hover: #e68a00;
            --accent: #2563eb;
            --bg-dark: #0a101d;
            --surface: #131b2c;
            --surface-card: #182238;
            --border: rgba(255, 255, 255, 0.08);
            --border-hover: rgba(255, 153, 0, 0.35);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --info: #0284c7;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', 'Noto Sans Sinhala', -apple-system, BlinkMacSystemFont, sans-serif; }
        body { background: var(--bg-dark); color: var(--text-main); min-height: 100vh; display: flex; flex-direction: column; }

        /* Top Navbar */
        .admin-nav {
            background: var(--surface);
            border-bottom: 1px solid var(--border);
            padding: 12px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 1000;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 18px;
            font-weight: 900;
            color: #fff;
        }
        .brand i { color: var(--primary); font-size: 22px; }
        .brand span { color: var(--primary); }
        .brand .badge-admin {
            font-size: 10px;
            background: linear-gradient(135deg, rgba(255,153,0,0.2) 0%, rgba(239,68,68,0.2) 100%);
            color: var(--primary);
            border: 1px solid rgba(255,153,0,0.4);
            padding: 3px 8px;
            border-radius: 6px;
            font-weight: 800;
            text-transform: uppercase;
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .admin-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12.5px;
            color: var(--text-muted);
            background: rgba(255,255,255,0.04);
            padding: 6px 14px;
            border-radius: 20px;
            border: 1px solid var(--border);
        }

        .btn-outline {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--text-muted);
            padding: 7px 14px;
            border-radius: 8px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            text-decoration: none;
        }
        .btn-outline:hover { background: rgba(255,255,255,0.06); color: #fff; border-color: rgba(255,255,255,0.2); }

        .btn-primary {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%);
            color: #111827;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 12px rgba(255, 153, 0, 0.25);
            transition: all 0.2s;
            text-decoration: none;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(255, 153, 0, 0.35); }

        .btn-direct-access {
            background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
            color: #ffffff;
            border: 1px solid #f59e0b;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11.5px;
            font-weight: 800;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 3px 8px rgba(217, 119, 6, 0.3);
            transition: all 0.2s;
            text-decoration: none;
            white-space: nowrap;
        }
        .btn-direct-access:hover {
            transform: translateY(-1px);
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            box-shadow: 0 5px 12px rgba(245, 158, 11, 0.4);
            color: #ffffff;
        }

        .btn-copy-chrome {
            background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
            color: #ffffff;
            border: 1px solid #38bdf8;
            padding: 6px 12px;
            border-radius: 8px;
            font-size: 11.5px;
            font-weight: 800;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            box-shadow: 0 3px 8px rgba(2, 132, 199, 0.3);
            transition: all 0.2s;
            white-space: nowrap;
        }
        .btn-copy-chrome:hover {
            transform: translateY(-1px);
            background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
            box-shadow: 0 5px 12px rgba(56, 189, 248, 0.4);
            color: #ffffff;
        }

        /* Main Container */
        .admin-container {
            max-width: 1440px;
            width: 100%;
            margin: 0 auto;
            padding: 24px;
            flex: 1;
        }

        /* Top KPI Grid */
        .kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .kpi-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 18px 22px;
            position: relative;
            overflow: hidden;
            transition: transform 0.2s, border-color 0.2s;
        }
        .kpi-card:hover { transform: translateY(-2px); border-color: var(--border-hover); }
        .kpi-label { font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .kpi-value { font-size: 26px; font-weight: 900; color: #fff; margin: 6px 0 3px; }
        .kpi-sub { font-size: 11.5px; color: var(--text-muted); }
        .kpi-icon { position: absolute; right: 18px; top: 18px; font-size: 26px; opacity: 0.15; color: var(--primary); }

        /* Navigation Tab Bar */
        .tab-bar {
            display: flex;
            gap: 8px;
            border-bottom: 1px solid var(--border);
            margin-bottom: 22px;
            overflow-x: auto;
            padding-bottom: 4px;
        }
        .tab-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            padding: 11px 18px;
            font-size: 13.5px;
            font-weight: 600;
            cursor: pointer;
            border-bottom: 2px solid transparent;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
            white-space: nowrap;
        }
        .tab-btn:hover { color: #fff; }
        .tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); font-weight: 800; }

        /* Section Cards */
        .panel-card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            margin-bottom: 24px;
        }

        .panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            flex-wrap: wrap;
            gap: 14px;
        }

        .search-input {
            background: rgba(10, 16, 29, 0.6);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 10px 14px 10px 36px;
            color: #fff;
            font-size: 13px;
            outline: none;
            width: 320px;
        }
        .search-input:focus { border-color: var(--primary); }

        /* Data Tables */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
        }
        .data-table th {
            padding: 12px 16px;
            font-size: 11.5px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid var(--border);
            background: rgba(255, 255, 255, 0.02);
        }
        .data-table td {
            padding: 14px 16px;
            font-size: 13px;
            border-bottom: 1px solid var(--border);
            color: #e2e8f0;
            vertical-align: middle;
        }
        .data-table tr:hover td { background: rgba(255, 255, 255, 0.025); }

        .badge-status {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }
        .badge-active { background: rgba(16,185,129,0.15); color: #86efac; border: 1px solid rgba(16,185,129,0.3); }
        .badge-trial { background: rgba(37,99,235,0.15); color: #93c5fd; border: 1px solid rgba(37,99,235,0.3); }
        .badge-expired { background: rgba(239,68,68,0.15); color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }

        /* Radar Pulse Animation */
        .radar-pulse-dot {
            width: 10px;
            height: 10px;
            background: #10b981;
            border-radius: 50%;
            display: inline-block;
            box-shadow: 0 0 10px #10b981;
            animation: radarPulse 1.4s infinite;
        }
        @keyframes radarPulse {
            0% { transform: scale(0.9); opacity: 0.8; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.8); }
            50% { transform: scale(1.2); opacity: 1; box-shadow: 0 0 0 8px rgba(16, 185, 129, 0); }
            100% { transform: scale(0.9); opacity: 0.8; box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        /* 7-Segment Activity Grid */
        .day-segments-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 8px;
            margin: 14px 0;
        }
        .day-segment {
            background: rgba(255,255,255,0.05);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 10px 6px;
            text-align: center;
        }
        .day-segment.active {
            background: rgba(16,185,129,0.18);
            border-color: rgba(16,185,129,0.4);
            color: #86efac;
        }
        .day-segment.missed {
            background: rgba(239,68,68,0.12);
            border-color: rgba(239,68,68,0.3);
            color: #fca5a5;
        }

        /* Deep Dive Grid */
        .dd-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 12px;
            margin-bottom: 20px;
        }
        .dd-item {
            background: rgba(10, 16, 29, 0.5);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 12px 14px;
        }
        .dd-item label {
            display: block;
            font-size: 11px;
            font-weight: 700;
            color: var(--text-muted);
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        .dd-item span {
            font-size: 13.5px;
            font-weight: 600;
            color: #ffffff;
            word-break: break-all;
        }

        /* Filter Chips */
        .filter-chip {
            background: #090e17;
            border: 1px solid #334155;
            color: #cbd5e1;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .filter-chip:hover { border-color: #059669; color: #34d399; }
        .filter-chip.active { background: #064e3b; border-color: #10b981; color: #34d399; box-shadow: 0 0 10px rgba(16, 185, 129, 0.2); }

        /* Modal Overlays */
        .modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(10, 16, 29, 0.85);
            backdrop-filter: blur(10px);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
        }
        .modal-box {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 20px;
            padding: 28px;
            width: 100%;
            max-width: 620px;
            box-shadow: 0 25px 60px rgba(0,0,0,0.6);
            animation: modalIn 0.3s ease-out;
            max-height: 90vh;
            overflow-y: auto;
        }
        @keyframes modalIn {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-control { display: flex; flex-direction: column; gap: 6px; }
        .form-control.full { grid-column: span 2; }
        .form-control label { font-size: 12px; font-weight: 600; color: #cbd5e1; }
        .form-control input, .form-control select {
            background: rgba(10, 16, 29, 0.6);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 10px 14px;
            color: #fff;
            font-size: 13px;
            outline: none;
        }
        .form-control input:focus, .form-control select:focus { border-color: var(--primary); }

        /* Toast */
        .toast {
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: #1e293b;
            border: 1px solid var(--primary);
            color: #fff;
            padding: 12px 20px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            gap: 10px;
            z-index: 99999;
        }
    </style>
</head>
`;
code += `<body>

    <!-- 🛡️ ZERO-LEAK SECURITY GATE OVERLAY -->
    <div id="securityGateOverlay" style="position: fixed; inset: 0; background: #0a101d; z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 20px;">
        <div style="width: 60px; height: 60px; border-radius: 18px; background: rgba(255,153,0,0.15); border: 1px solid rgba(255,153,0,0.4); display: flex; align-items: center; justify-content: center; font-size: 26px; color: #ff9900; margin-bottom: 20px; box-shadow: 0 0 30px rgba(255,153,0,0.2);">
            <i class="fas fa-shield-halved fa-beat-fade"></i>
        </div>
        <h2 id="gateTitle" style="font-size: 18px; font-weight: 800; color: #fff; margin-bottom: 8px;">Securing Command Center...</h2>
        <p id="gateDesc" style="font-size: 13px; color: #94a3b8; max-width: 360px;">Authenticating Super Admin credentials. System content is locked.</p>
    </div>

    <!-- MAIN ADMIN WRAPPER -->
    <div id="adminMainWrapper" style="display: none; width: 100%; min-height: 100vh; flex-direction: column;">

        <!-- Top Navigation -->
        <header class="admin-nav">
            <div class="brand">
                <i class="fas fa-shield-halved"></i>
                <span>DIGIBIZ</span> SYSTEM
                <span class="badge-admin">Super Admin Command Center</span>
            </div>
            <div class="nav-actions">
                <div class="admin-pill">
                    <i class="fas fa-user-shield" style="color:var(--primary);"></i>
                    <span id="adminEmailBadge">Super Admin</span>
                </div>
                <button class="btn-outline" onclick="openNewClientModal()">
                    <i class="fas fa-plus"></i> Onboard Business
                </button>
                <button class="btn-outline" onclick="handleAdminSignOut()">
                    <i class="fas fa-sign-out-alt"></i> Sign Out
                </button>
            </div>
        </header>

        <div class="admin-container">

            <!-- Top Summary KPI Grid -->
            <div class="kpi-grid">
                <div class="kpi-card">
                    <i class="fas fa-building kpi-icon"></i>
                    <div class="kpi-label">Enterprise Businesses</div>
                    <div class="kpi-value" id="kpiTotalClients">0</div>
                    <div class="kpi-sub">Total Single-Tenant Workspaces</div>
                </div>
                <div class="kpi-card">
                    <i class="fas fa-crown kpi-icon" style="color:#10b981;"></i>
                    <div class="kpi-label">Active Subscriptions</div>
                    <div class="kpi-value" id="kpiActiveClients" style="color:#86efac;">0</div>
                    <div class="kpi-sub">Paying & Valid Workspaces</div>
                </div>
                <div class="kpi-card">
                    <i class="fas fa-clock-rotate-left kpi-icon" style="color:#f59e0b;"></i>
                    <div class="kpi-label">Expiring Soon / Trial</div>
                    <div class="kpi-value" id="kpiExpiringSoon" style="color:#fcd34d;">0</div>
                    <div class="kpi-sub">Action Required within 7d</div>
                </div>
                <div class="kpi-card">
                    <i class="fas fa-satellite-dish kpi-icon" style="color:#38bdf8;"></i>
                    <div class="kpi-label">Online Active Now</div>
                    <div class="kpi-value" id="kpiOnlineNow" style="color:#38bdf8;">0</div>
                    <div class="kpi-sub">Real-Time Connected Sessions</div>
                </div>
                <div class="kpi-card">
                    <i class="fas fa-coins kpi-icon" style="color:var(--primary);"></i>
                    <div class="kpi-label">Monthly Rec. Revenue</div>
                    <div class="kpi-value" id="kpiTotalRevenue" style="color:var(--primary);">Rs. 0</div>
                    <div class="kpi-sub">Projected Monthly Yield</div>
                </div>
            </div>

            <!-- Tab Navigation Bar -->
            <div class="tab-bar">
                <button class="tab-btn active" onclick="switchTab('tab-clients', this)">
                    <i class="fas fa-store"></i> Businesses & Workspaces (<span id="tabCountClients">0</span>)
                </button>
                <button class="tab-btn" onclick="switchTab('tab-bizmgmt', this)">
                    <i class="fas fa-bolt"></i> Business Management & Deep Inspection
                </button>
                <button class="tab-btn" onclick="switchTab('tab-liveactivity', this)">
                    <i class="fas fa-satellite-dish"></i> Live User Activity (සජීවී නිරීක්ෂණ)
                </button>
                <button class="tab-btn" onclick="switchTab('tab-users', this)">
                    <i class="fas fa-users-gear"></i> User Routing Matrix
                </button>
                <button class="tab-btn" onclick="switchTab('tab-system', this)">
                    <i class="fas fa-database"></i> Firebase & Scalability Monitor
                </button>
            </div>

            <!-- TAB 1: Businesses & Workspaces -->
            <div id="tab-clients" class="tab-content">
                <div class="panel-card">
                    <div class="panel-header">
                        <div>
                            <h2 style="font-size: 17px; font-weight: 800;">Enterprise Client Workspaces</h2>
                            <p style="font-size: 12.5px; color: var(--text-muted);">Manage single-tenant standalone systems, licensing validity, and 1-click Direct Impersonation</p>
                        </div>
                        <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                            <div style="position:relative;">
                                <i class="fas fa-search" style="position:absolute; left:12px; top:12px; color:var(--text-muted); font-size:13px;"></i>
                                <input type="text" id="clientSearchInput" class="search-input" placeholder="Search business, owner, or ID..." oninput="filterClientsTable()" />
                            </div>
                            <button class="btn-primary" onclick="openNewClientModal()">
                                <i class="fas fa-plus"></i> Onboard Business
                            </button>
                        </div>
                    </div>

                    <div style="overflow-x:auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Business Name & ID</th>
                                    <th>Owner & Contact</th>
                                    <th>Model & Package</th>
                                    <th>Subscription Validity</th>
                                    <th>Status</th>
                                    <th>Super Admin Actions</th>
                                </tr>
                            </thead>
                            <tbody id="clientsTableBody">
                                <tr>
                                    <td colspan="6" style="text-align:center; padding:40px; color:var(--text-muted);">
                                        <i class="fas fa-spinner fa-spin" style="font-size:24px; color:var(--primary); margin-bottom:10px; display:block;"></i>
                                        Loading enterprise workspaces from database...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
`;
code += `            <!-- TAB 2: Business Management & Deep Inspect -->
            <div id="tab-bizmgmt" class="tab-content" style="display:none;">
                
                <!-- Active Accounts Analytics Box -->
                <div class="panel-card" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border: 1px solid #334155;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:16px;">
                        <div>
                            <h2 style="font-size: 18px; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 8px;">
                                ⚡ Active Accounts Overview (සක්‍රීය ගිණුම් විශ්ලේෂණය)
                            </h2>
                            <p style="font-size: 12.5px; color: #94a3b8;">Real-time online users & deduplicated unique daily active accounts (Click any card to inspect list)</p>
                        </div>
                        <button class="btn-outline" onclick="loadClientsData()" style="color:#fff; border-color:#475569;">
                            <i class="fas fa-rotate"></i> Refresh Activity Data
                        </button>
                    </div>

                    <!-- Metrics Grid -->
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap:12px; margin-bottom:20px;">
                        <div onclick="openActiveUsersModal('online')" style="background:rgba(16, 185, 129, 0.18); border:1.5px solid rgba(16, 185, 129, 0.45); padding:14px; border-radius:12px; text-align:center; cursor:pointer;" title="Click to view online users">
                            <div style="font-size:11.5px; font-weight:800; color:#34d399; text-transform:uppercase; display:flex; align-items:center; justify-content:center; gap:6px;">
                                <span class="radar-pulse-dot"></span> Online Now
                            </div>
                            <div style="font-size:28px; font-weight:900; color:#34d399; margin-top:4px;" id="actOnlineRightNow">0</div>
                            <div style="font-size:10px; color:#a7f3d0; margin-top:2px;">🔍 View Online List</div>
                        </div>

                        <div onclick="openActiveUsersModal('today')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:14px; border-radius:12px; text-align:center; cursor:pointer;">
                            <div style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">🌞 Today (අද)</div>
                            <div style="font-size:26px; font-weight:900; color:#10b981; margin-top:4px;" id="actToday">0</div>
                            <div style="font-size:10px; color:#94a3b8; margin-top:2px;">🔍 View List</div>
                        </div>

                        <div onclick="openActiveUsersModal('yesterday')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:14px; border-radius:12px; text-align:center; cursor:pointer;">
                            <div style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">🌙 Yesterday (ඊයේ)</div>
                            <div style="font-size:26px; font-weight:900; color:#38bdf8; margin-top:4px;" id="actYesterday">0</div>
                            <div style="font-size:10px; color:#94a3b8; margin-top:2px;">🔍 View List</div>
                        </div>

                        <div onclick="openActiveUsersModal('week')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:14px; border-radius:12px; text-align:center; cursor:pointer;">
                            <div style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">📅 This Week (සතිය)</div>
                            <div style="font-size:26px; font-weight:900; color:#fbbf24; margin-top:4px;" id="actWeek">0</div>
                            <div style="font-size:10px; color:#94a3b8; margin-top:2px;">🔍 View List</div>
                        </div>

                        <div onclick="openActiveUsersModal('month')" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); padding:14px; border-radius:12px; text-align:center; cursor:pointer;">
                            <div style="font-size:11px; font-weight:700; color:#94a3b8; text-transform:uppercase;">🗓️ This Month (මාසය)</div>
                            <div style="font-size:26px; font-weight:900; color:#c084fc; margin-top:4px;" id="actMonth">0</div>
                            <div style="font-size:10px; color:#94a3b8; margin-top:2px;">🔍 View List</div>
                        </div>
                    </div>

                    <!-- 30-Day Active Trend Chart Canvas -->
                    <div style="background:#ffffff; border-radius:14px; padding:18px; color:#0f172a;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
                            <div style="font-size:14px; font-weight:800; color:#0f172a;">📈 30-Day Active Accounts Trend (ගෙවෙන මාසයේ ගිණුම් සක්‍රීය භාවිතාව)</div>
                            <div style="font-size:11px; font-weight:700; color:#10b981; background:#dcfce7; padding:3px 10px; border-radius:12px;">Unique Daily Active Tenants</div>
                        </div>
                        <div style="position:relative; height:220px; width:100%;">
                            <canvas id="activeTrendChart"></canvas>
                        </div>
                    </div>

                    <!-- Lead Intelligence Panel -->
                    <div style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.12); padding-top:20px;">
                        <h3 style="margin:0 0 12px 0; font-size:15px; font-weight:800; color:#fbbf24; display:flex; align-items:center; gap:8px;">
                            🎯 Subscription & Conversion Lead Intelligence (ගිණුම් වර්ගීකරණය)
                        </h3>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:14px;">
                            <div onclick="openActiveUsersModal('paid')" style="background:rgba(16, 185, 129, 0.14); border:1.5px solid rgba(16, 185, 129, 0.35); padding:16px; border-radius:14px; cursor:pointer;">
                                <div style="font-size:12px; font-weight:800; color:#34d399;">💎 Paid Pro Accounts (ගෙවන ලද)</div>
                                <div style="font-size:30px; font-weight:900; color:#34d399; margin-top:4px;" id="actPaidProCount">0</div>
                                <div style="font-size:11px; color:#a7f3d0; margin-top:2px;">🔍 View Pro Clients</div>
                            </div>
                            <div onclick="openActiveUsersModal('trial')" style="background:rgba(245, 158, 11, 0.14); border:1.5px solid rgba(245, 158, 11, 0.35); padding:16px; border-radius:14px; cursor:pointer;">
                                <div style="font-size:12px; font-weight:800; color:#fbbf24;">🎁 Free / Trial Accounts (නොමිලේ)</div>
                                <div style="font-size:30px; font-weight:900; color:#fbbf24; margin-top:4px;" id="actFreeTrialCount">0</div>
                                <div style="font-size:11px; color:#fde68a; margin-top:2px;">🔍 View Free/Trial Clients</div>
                            </div>
                            <div onclick="openActiveUsersModal('hot')" style="background:linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, rgba(249, 115, 22, 0.25) 100%); border:1.5px solid #f97316; padding:16px; border-radius:14px; cursor:pointer;">
                                <div style="font-size:12px; font-weight:900; color:#ffed4a;">🔥 High-Intent Upgrade Leads</div>
                                <div style="font-size:30px; font-weight:900; color:#ffffff; margin-top:4px;" id="actHighIntentCount">0</div>
                                <div style="font-size:11px; color:#ffed4a; margin-top:2px;">📞 Hot Candidates to Contact</div>
                            </div>
                            <div onclick="openActiveUsersModal('test')" style="background:rgba(148, 163, 184, 0.14); border:1.5px solid rgba(148, 163, 184, 0.35); padding:16px; border-radius:14px; cursor:pointer;">
                                <div style="font-size:12px; font-weight:800; color:#cbd5e1;">🧪 Test Accounts Active</div>
                                <div style="font-size:30px; font-weight:900; color:#cbd5e1; margin-top:4px;" id="actTestTodayCount">0</div>
                                <div style="font-size:11px; color:#94a3b8; margin-top:2px;">🔍 View Test Workspaces</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Business Search & Inspection Box -->
                <div class="panel-card">
                    <h2 style="font-size: 17px; font-weight: 800; margin-bottom: 6px;">Deep-Dive Business & User Inspection</h2>
                    <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 18px;">Select or search any business to inspect 7-day consistency, model settings, and execute direct admin actions</p>

                    <div style="display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap;">
                        <input type="text" id="inspectSearchInput" class="search-input" style="flex:1; min-width:280px;" placeholder="Search by business name, client ID, owner email, or UID..." />
                        <button class="btn-primary" onclick="searchAndInspectBusiness()">
                            <i class="fas fa-search"></i> Inspect Account
                        </button>
                    </div>

                    <!-- Inspected Business Profile & Actions -->
                    <div id="inspectedProfileContainer" style="display:none;">
                        
                        <!-- Header & Status -->
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background:var(--surface-card); border:1px solid var(--border); border-radius:14px; padding:18px; margin-bottom:20px;">
                            <div>
                                <h3 id="insBizTitle" style="font-size:18px; font-weight:900; color:#fff;">Business Name</h3>
                                <p id="insBizOwner" style="font-size:13px; color:var(--text-muted); margin-top:2px;">owner@gmail.com</p>
                            </div>
                            <div id="insStatusBadgeWrap">
                                <span class="badge-status badge-active" id="insStatusBadgeText">ACTIVE</span>
                            </div>
                        </div>

                        <!-- 7-Day Consistency Visual Segments -->
                        <div style="background:var(--surface-card); border:1px solid var(--border); border-radius:14px; padding:18px; margin-bottom:20px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                                <span style="font-size:13px; font-weight:700; color:#cbd5e1;">📊 7-Day System Access Consistency (පසුගිය දින 7 තුළ දිනපතා භාවිතාව)</span>
                                <strong id="insConsistencyScore" style="color:var(--primary); font-size:14px;">100% (7/7 Days Active)</strong>
                            </div>
                            <div id="insDaySegmentsGrid" class="day-segments-grid">
                                <!-- Rendered dynamically -->
                            </div>
                            <p id="insConsistencyNote" style="font-size:12px; color:var(--text-muted); margin:0;">ගිණුම නිසි පරිදි ක්‍රියාත්මක වේ.</p>
                        </div>

                        <!-- Quick Administrative Actions -->
                        <div style="background:var(--surface-card); border:1px solid var(--border); border-radius:14px; padding:18px; margin-bottom:20px;">
                            <h4 style="font-size:14px; font-weight:800; color:#fbbf24; margin-bottom:14px;">⚙️ Quick Administrative Actions</h4>
                            
                            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:14px; align-items:end;">
                                <div>
                                    <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:6px;">Extend Pro Validity (Days):</label>
                                    <div style="display:flex; gap:6px;">
                                        <input type="number" id="quickExtendDays" value="30" style="width:80px; background:rgba(10,16,29,0.6); border:1px solid var(--border); color:#fff; border-radius:8px; padding:8px 10px;" />
                                        <button class="btn-primary" onclick="quickExtendProAction()">Extend</button>
                                    </div>
                                </div>

                                <div>
                                    <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:6px;">Add SMS Credits:</label>
                                    <div style="display:flex; gap:6px;">
                                        <input type="number" id="quickAddSmsAmount" value="500" style="width:90px; background:rgba(10,16,29,0.6); border:1px solid var(--border); color:#fff; border-radius:8px; padding:8px 10px;" />
                                        <button class="btn-primary" onclick="quickAddSmsAction()">Add SMS</button>
                                    </div>
                                </div>

                                <div>
                                    <label style="font-size:11.5px; font-weight:700; color:var(--text-muted); display:block; margin-bottom:6px;">Change Business Model (මාදිලිය):</label>
                                    <div style="display:flex; gap:6px;">
                                        <select id="quickChangeModelSelect" style="background:rgba(10,16,29,0.6); border:1px solid var(--border); color:#fff; border-radius:8px; padding:8px 10px; font-size:12.5px;">
                                            <option value="retail">🛒 Retail / Supermarket</option>
                                            <option value="distributor">🚚 Distributor / Wholesaler</option>
                                            <option value="credit_ledger">📒 Credit Ledger (Madawala)</option>
                                            <option value="tire_centre">🛞 Tire House / Centre</option>
                                            <option value="attendance_payroll">⏱️ Attendance & Payroll</option>
                                            <option value="coconut">🥥 Coconut Products / Factory</option>
                                            <option value="bakery">🥖 Bakery & Confectionery</option>
                                            <option value="manufacturer">🏭 Manufacturer ERP</option>
                                            <option value="pharmacy">💊 Pharmacy</option>
                                        </select>
                                        <button class="btn-primary" onclick="quickUpdateModelAction()">Update</button>
                                    </div>
                                </div>
                            </div>

                            <!-- Super Admin Direct Access Banner -->
                            <div style="margin-top:18px; padding-top:16px; border-top:1px dashed var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.3); border-radius:12px; padding:14px 18px;">
                                <div>
                                    <div style="font-weight:800; color:#fbbf24; font-size:13.5px;">🔑 Super Admin Direct Access (පාරිභෝගික ගිණුමට ඍජුවම ප්‍රවේශ වන්න)</div>
                                    <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">Log in in a new tab, or copy link to open in Google Chrome / 2nd Browser Window for 100% isolated sessions.</div>
                                </div>
                                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                                    <button class="btn-direct-access" id="btnInsDirectLogin" onclick="handleInspectedDirectLogin()">
                                        🔑 Log in as Client Business
                                    </button>
                                    <button class="btn-copy-chrome" id="btnInsCopyChrome" onclick="handleInspectedCopyChrome()">
                                        📋 Copy Link for Chrome
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 4 Detail Grids -->
                        <div class="panel-card" style="padding:18px; margin-bottom:16px;">
                            <h4 style="font-size:13px; font-weight:800; color:var(--primary); margin-bottom:12px;">👤 User Credentials & Access Logs (පරිශීලක සහ ගිණුම් විස්තර)</h4>
                            <div class="dd-grid">
                                <div class="dd-item"><label>Client ID / Slug</label><span id="insDDClientId">-</span></div>
                                <div class="dd-item"><label>Owner Full Name</label><span id="insDDOwnerName">-</span></div>
                                <div class="dd-item"><label>Email Address</label><span id="insDDEmail">-</span></div>
                                <div class="dd-item"><label>Contact Phone</label><span id="insDDPhone">-</span></div>
                                <div class="dd-item"><label>Workspace URL Path</label><span id="insDDPath">-</span></div>
                                <div class="dd-item"><label>Last System Login / Activity</label><span id="insDDLastActive">-</span></div>
                            </div>
                        </div>

                        <div class="panel-card" style="padding:18px; margin-bottom:16px;">
                            <h4 style="font-size:13px; font-weight:800; color:#60a5fa; margin-bottom:12px;">⚙️ Business Model & Subscription Details (ව්‍යාපාරික විස්තර)</h4>
                            <div class="dd-grid">
                                <div class="dd-item"><label>Business Model</label><span id="insDDBizModel">-</span></div>
                                <div class="dd-item"><label>Subscription Plan</label><span id="insDDSubPlan">-</span></div>
                                <div class="dd-item"><label>Subscription Expiry Date</label><span id="insDDSubExpiry">-</span></div>
                                <div class="dd-item"><label>Remaining Validity</label><span id="insDDSubDays">-</span></div>
                                <div class="dd-item"><label>SMS Wallet Total Balance</label><span id="insDDSmsBalance">0 Units</span></div>
                                <div class="dd-item"><label>Monthly Fee</label><span id="insDDMonthlyFee">Rs. 1,000</span></div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
`;
code += `            <!-- TAB 3: Live User Activity Monitor -->
            <div id="tab-liveactivity" class="tab-content" style="display:none;">
                
                <!-- Live Radar Header Banner -->
                <div style="background: linear-gradient(135deg, #064e3b 0%, #022c22 100%); border: 1.5px solid #059669; border-radius: 16px; padding: 20px 24px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);">
                    <div>
                        <h2 style="font-size: 18px; font-weight: 800; color: #fff; display: flex; align-items: center; gap: 10px; margin: 0 0 4px 0;">
                            <i class="fas fa-radar"></i> DIGIBIZ — සජීවී පරිශීලක ක්‍රියාකාරකම් නිරීක්ෂණ කේන්ද්‍රය (Live Activity)
                        </h2>
                        <p style="font-size: 12.5px; color: #a7f3d0; margin: 0;">Real-time radar stream of tenant sessions, user interactions, and multi-tenant telemetry</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px; background:rgba(16,185,129,0.2); border:1.5px solid #10b981; color:#6ee7b7; padding:6px 14px; border-radius:30px; font-size:12px; font-weight:700;">
                        <span class="radar-pulse-dot"></span> LIVE TELEMETRY RADAR ACTIVE
                    </div>
                </div>

                <!-- Filter Chips & Search -->
                <div class="panel-card" style="padding:16px 20px; margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
                        <div style="display:flex; gap:8px; flex-wrap:wrap;">
                            <button class="filter-chip active" onclick="filterLiveActivity('all', this)"><i class="fas fa-list"></i> All Telemetry</button>
                            <button class="filter-chip" onclick="filterLiveActivity('active', this)"><i class="fas fa-circle-play"></i> Active Online Now</button>
                            <button class="filter-chip" onclick="filterLiveActivity('sales', this)"><i class="fas fa-cart-shopping"></i> Operations & Invoices</button>
                            <button class="filter-chip" onclick="filterLiveActivity('users', this)"><i class="fas fa-user-plus"></i> Staff & Presence</button>
                        </div>
                        <button class="btn-outline" onclick="loadLiveActivityFeed()">
                            <i class="fas fa-rotate"></i> Refresh Feed
                        </button>
                    </div>
                </div>

                <!-- Live Stream Feed Container -->
                <div id="liveActivityFeedContainer" style="display:flex; flex-direction:column; gap:12px;">
                    <div style="text-align:center; padding:40px; color:var(--text-muted);">
                        <i class="fas fa-spinner fa-spin" style="font-size:24px; color:var(--primary); margin-bottom:8px; display:block;"></i>
                        Connecting to real-time presence stream...
                    </div>
                </div>

            </div>

            <!-- TAB 4: User Routing Matrix -->
            <div id="tab-users" class="tab-content" style="display:none;">
                <div class="panel-card">
                    <div class="panel-header">
                        <div>
                            <h2 style="font-size: 17px; font-weight: 800;">User Routing Matrix (\`/system_users\`)</h2>
                            <p style="font-size: 12.5px; color: var(--text-muted);">Direct mappings from login email to isolated workspace paths</p>
                        </div>
                        <button class="btn-outline" onclick="loadUserMatrix()">
                            <i class="fas fa-rotate"></i> Refresh Matrix
                        </button>
                    </div>
                    <div style="overflow-x:auto;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>User Email</th>
                                    <th>Target Workspace</th>
                                    <th>Mapped Client ID</th>
                                    <th>Account Status</th>
                                    <th>Direct Action</th>
                                </tr>
                            </thead>
                            <tbody id="userMatrixTableBody">
                                <tr>
                                    <td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">Loading user routing directory...</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- TAB 5: System Monitor -->
            <div id="tab-system" class="tab-content" style="display:none;">
                <div class="panel-card">
                    <h2 style="font-size: 17px; font-weight: 800; margin-bottom: 6px;">Firebase Project & Architecture Health</h2>
                    <p style="font-size: 12.5px; color: var(--text-muted); margin-bottom: 24px;">Configured to scale seamlessly for 1,000+ isolated business tenants</p>

                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:18px;">
                        <div style="background:var(--surface-card); border:1px solid var(--border); border-radius:12px; padding:18px;">
                            <div style="font-size:12px; font-weight:700; color:var(--primary); margin-bottom:8px; text-transform:uppercase;">Connected Project</div>
                            <div style="font-size:18px; font-weight:800; color:#fff;">digibiz-system</div>
                            <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Multi-Tenant Zero-Leak Production Database</div>
                        </div>
                        <div style="background:var(--surface-card); border:1px solid var(--border); border-radius:12px; padding:18px;">
                            <div style="font-size:12px; font-weight:700; color:#10b981; margin-bottom:8px; text-transform:uppercase;">Cost-Saving Caching</div>
                            <div style="font-size:18px; font-weight:800; color:#fff;">IndexedDB Active</div>
                            <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">0-Read Local Persistence for all tenants</div>
                        </div>
                        <div style="background:var(--surface-card); border:1px solid var(--border); border-radius:12px; padding:18px;">
                            <div style="font-size:12px; font-weight:700; color:#60a5fa; margin-bottom:8px; text-transform:uppercase;">Hosting CDN Headers</div>
                            <div style="font-size:18px; font-weight:800; color:#fff;">1-Year Immutable</div>
                            <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">Static Bandwidth 99% optimized</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- ONBOARD / EDIT CLIENT MODAL -->
        <div id="clientModal" class="modal-overlay">
            <div class="modal-box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                    <h3 id="modalTitle" style="font-size:18px; font-weight:800; color:#fff;">Onboard New Business</h3>
                    <button onclick="closeClientModal()" style="background:none; border:none; color:var(--text-muted); font-size:18px; cursor:pointer;"><i class="fas fa-times"></i></button>
                </div>

                <form id="clientForm" onsubmit="saveClient(event)">
                    <div class="form-grid">
                        <div class="form-control">
                            <label>Business Name *</label>
                            <input type="text" id="mBusinessName" placeholder="e.g. Randipa Products" required oninput="autoGenerateSlug(this.value)" />
                        </div>
                        <div class="form-control">
                            <label>Client ID / Slug (Folder Name) *</label>
                            <input type="text" id="mClientId" placeholder="e.g. randipa" required />
                        </div>
                        <div class="form-control">
                            <label>Owner Name</label>
                            <input type="text" id="mOwnerName" placeholder="e.g. Bawantha Randipa" />
                        </div>
                        <div class="form-control">
                            <label>Owner / Primary Email *</label>
                            <input type="email" id="mOwnerEmail" placeholder="owner@gmail.com" required />
                        </div>
                        <div class="form-control">
                            <label>Contact Phone</label>
                            <input type="text" id="mPhone" placeholder="071 234 5678" />
                        </div>
                        <div class="form-control">
                            <label>Business Model / Type</label>
                            <select id="mBusinessType">
                                <option value="retail">🛒 Retail / Supermarket</option>
                                <option value="distributor">🚚 Distributor / Wholesaler</option>
                                <option value="credit_ledger">📒 Credit Ledger (Madawala)</option>
                                <option value="tire_centre">🛞 Tire House / Centre</option>
                                <option value="attendance_payroll">⏱️ Attendance & Payroll</option>
                                <option value="coconut">🥥 Coconut Products / Factory</option>
                                <option value="bakery">🥖 Bakery & Confectionery</option>
                                <option value="manufacturer">🏭 Manufacturer ERP</option>
                                <option value="pharmacy">💊 Pharmacy</option>
                            </select>
                        </div>
                        <div class="form-control">
                            <label>Subscription Package</label>
                            <select id="mPackage">
                                <option value="ENTERPRISE PRO">ENTERPRISE PRO</option>
                                <option value="BUSINESS STARTER">BUSINESS STARTER</option>
                                <option value="14-DAY TRIAL">14-DAY TRIAL</option>
                            </select>
                        </div>
                        <div class="form-control">
                            <label>Monthly Fee (Rs.)</label>
                            <input type="number" id="mMonthlyFee" value="1000" />
                        </div>
                        <div class="form-control">
                            <label>Expiry Date *</label>
                            <input type="date" id="mExpiryDate" required />
                        </div>
                        <div class="form-control">
                            <label>Account Status</label>
                            <select id="mStatus">
                                <option value="active">Active</option>
                                <option value="trial">Trial</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                        <div class="form-control">
                            <label>SMS Credits</label>
                            <input type="number" id="mSmsCredits" value="500" />
                        </div>
                        <div class="form-control full">
                            <label>Allowed Staff Emails (Comma separated)</label>
                            <input type="text" id="mAllowedEmails" placeholder="staff1@gmail.com, cashier@gmail.com" />
                        </div>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:12px; margin-top:24px;">
                        <button type="button" class="btn-outline" onclick="closeClientModal()">Cancel</button>
                        <button type="submit" class="btn-primary" id="modalSaveBtn">Save Business</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- ACTIVE ACCOUNTS MODAL OVERLAY -->
        <div id="activeAccountsModal" class="modal-overlay">
            <div class="modal-box" style="max-width:850px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <div>
                        <h3 id="activeModalTitle" style="font-size:18px; font-weight:800; color:#38bdf8;">👥 Active User Accounts List</h3>
                        <p id="activeModalSubtitle" style="font-size:12px; color:var(--text-muted); margin-top:2px;">Detailed client account profiles</p>
                    </div>
                    <button onclick="closeActiveUsersModal()" style="background:none; border:none; color:var(--text-muted); font-size:18px; cursor:pointer;"><i class="fas fa-times"></i></button>
                </div>

                <div style="margin-bottom:14px;">
                    <input type="text" id="activeModalSearchInput" class="search-input" style="width:100%;" placeholder="Filter by email, business name, or ID..." oninput="filterActiveModalTable()" />
                </div>

                <div style="overflow-x:auto; max-height:400px;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Business</th>
                                <th>Owner / Email</th>
                                <th>Package</th>
                                <th>Status</th>
                                <th>Direct Action</th>
                            </tr>
                        </thead>
                        <tbody id="activeModalTableBody">
                            <!-- Populated dynamically -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Toast Notification -->
        <div id="toast" class="toast">
            <i class="fas fa-check-circle" style="color:var(--success);"></i>
            <span id="toastMsg">Operation successful</span>
        </div>

    </div>
`;

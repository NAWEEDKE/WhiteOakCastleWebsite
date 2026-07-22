// Unified Database Helpers for Admin Portal
const sweepExpiredPaymentHolds = () => {
    const stored = localStorage.getItem('whiteoak_bookings');
    if (!stored) return;
    try {
        const bookings = JSON.parse(stored);
        const now = Date.now();
        let updated = false;
        bookings.forEach(b => {
            if (b.status === 'Awaiting Payment' && b.approvalTimestamp) {
                // 24 hours = 24 * 60 * 60 * 1000 = 86,400,000 milliseconds
                if (now - b.approvalTimestamp > 86400000) {
                    b.status = 'Expired';
                    updated = true;
                }
            }
        });
        if (updated) {
            localStorage.setItem('whiteoak_bookings', JSON.stringify(bookings));
        }
    } catch (e) {
        console.error("Failed to sweep expired bookings", e);
    }
};

const getBookings = () => {
    // Run sweeper first so returned state is always fresh
    sweepExpiredPaymentHolds();

    // Seed mock clients on first visit
    if (!localStorage.getItem('whiteoak_clients')) {
        const seedClients = [
            { name: "John Doe", email: "client@example.com", password: "password" },
            { name: "Anas Rahman", email: "anas@gmail.com", password: "password" },
            { name: "Fathima Najiya", email: "najiya.fathima@yahoo.com", password: "password" }
        ];
        localStorage.setItem('whiteoak_clients', JSON.stringify(seedClients));
    }

    const stored = localStorage.getItem('whiteoak_bookings');
    if (stored) return JSON.parse(stored);
    
    // Seed mock bookings on first visit (defaults)
    const todayStr = new Date().toISOString().split('T')[0];
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 5);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
    const seeds = [
        {
            id: "WOC-83921",
            name: "Anas Rahman",
            email: "anas@gmail.com",
            eventType: "Marriage",
            eventDate: tomorrowStr,
            eventTime: "11:00",
            guestCount: 1200,
            photoshootDate: tomorrowStr,
            photoshootSlots: ["10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM"],
            totalCost: 0,
            depositPaid: 1000,
            status: "Confirmed",
            submittedAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: "WOC-10294",
            name: "Fathima Najiya",
            email: "najiya.fathima@yahoo.com",
            eventType: "Nikah",
            eventDate: todayStr,
            eventTime: "15:00",
            guestCount: 450,
            photoshootDate: todayStr,
            photoshootSlots: ["03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM"],
            totalCost: 0,
            depositPaid: 500,
            status: "Pending Review",
            submittedAt: new Date(Date.now() - 43200000).toISOString()
        },
        {
            id: "WOC-39485",
            name: "Rahul Krishnan",
            email: "rahul.k@outlook.com",
            eventType: "Graduation",
            eventDate: nextWeekStr,
            eventTime: "09:30",
            guestCount: 600,
            photoshootDate: "",
            photoshootSlots: [],
            totalCost: 0,
            depositPaid: 300,
            status: "Pending Review",
            submittedAt: new Date().toISOString()
        }
    ];
    localStorage.setItem('whiteoak_bookings', JSON.stringify(seeds));
    return seeds;
};

const saveBookings = (bookings) => {
    localStorage.setItem('whiteoak_bookings', JSON.stringify(bookings));
};

// ==========================================
// ADMIN DASHBOARD & CALENDAR CONTROLLER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const adminLoginSection = document.getElementById('admin-login-section');
    const adminDashboardSection = document.getElementById('admin-dashboard-section');
    
    if (!adminLoginSection || !adminDashboardSection) return;
    
    const loginForm = document.getElementById('admin-login-form');
    const loginError = document.getElementById('login-error-msg');
    const logoutBtn = document.getElementById('admin-logout-btn');
    const rememberMeCheck = document.getElementById('admin-remember');
    
    // Check authentication state
    const checkAuth = () => {
        const sessionAuth = sessionStorage.getItem('woc_admin_logged') === 'true';
        const localAuth = localStorage.getItem('woc_admin_logged') === 'true';
        const navLogoutBtn = document.getElementById('admin-navbar-logout-btn');
        
        if (sessionAuth || localAuth) {
            adminLoginSection.style.display = 'none';
            adminDashboardSection.style.display = 'block';
            if (navLogoutBtn) navLogoutBtn.style.display = 'block';
            initDashboard();
        } else {
            adminLoginSection.style.display = 'flex';
            adminDashboardSection.style.display = 'none';
            if (navLogoutBtn) navLogoutBtn.style.display = 'none';
        }
    };
    
    // Login Submission Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('admin-username').value.trim();
        const password = document.getElementById('admin-password').value.trim();
        
        if (username === 'admin' && password === 'admin123') {
            loginError.style.display = 'none';
            sessionStorage.setItem('woc_admin_logged', 'true');
            if (rememberMeCheck.checked) {
                localStorage.setItem('woc_admin_logged', 'true');
            }
            checkAuth();
        } else {
            loginError.style.display = 'block';
        }
    });
    

    // Logout Handler
    const handleLogout = () => {
        if (autoRefreshInterval) {
            clearInterval(autoRefreshInterval);
            autoRefreshInterval = null;
        }
        sessionStorage.removeItem('woc_admin_logged');
        localStorage.removeItem('woc_admin_logged');
        window.location.reload();
    };

    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    const navLogoutBtn = document.getElementById('admin-navbar-logout-btn');
    if (navLogoutBtn) {
        navLogoutBtn.addEventListener('click', handleLogout);
    }
    
    // Dashboard Variables & Initialization
    let activeFilter = 'all';
    let calendarDate = new Date(); // Start with current month
    let selectedCalendarDayStr = '';
    let autoRefreshInterval = null;
    
    // Manual Slot Picker Variables
    const hours = [
        "08:00 AM - 09:00 AM",
        "09:00 AM - 10:00 AM",
        "10:00 AM - 11:00 AM",
        "11:00 AM - 12:00 PM",
        "12:00 PM - 01:00 PM",
        "01:00 PM - 02:00 PM",
        "02:00 PM - 03:00 PM",
        "03:00 PM - 04:00 PM",
        "04:00 PM - 05:00 PM",
        "05:00 PM - 06:00 PM",
        "06:00 PM - 07:00 PM",
        "07:00 PM - 08:00 PM"
    ];
    let manualSelectedSlots = new Set();
    let manualPickerDate = new Date();

    const renderManualDatePicker = () => {
        const daysGrid = document.getElementById('manual-datepicker-days-grid');
        const monthYearLabel = document.getElementById('manual-datepicker-month-year');
        if (!daysGrid || !monthYearLabel) return;
        daysGrid.innerHTML = '';

        const year = manualPickerDate.getFullYear();
        const month = manualPickerDate.getMonth();

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        monthYearLabel.innerText = `${monthNames[month]} ${year}`;

        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();

        // Empty cells for starting offset
        for (let i = 0; i < firstDayIndex; i++) {
            const empty = document.createElement('div');
            empty.className = 'datepicker-day disabled';
            daysGrid.appendChild(empty);
        }

        const todayObj = new Date();
        todayObj.setHours(0, 0, 0, 0);
        const bookings = getBookings();
        const manualDateInput = document.getElementById('manual-event-date');

        for (let day = 1; day <= totalDays; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'datepicker-day';
            dayCell.innerText = day;

            const cellDate = new Date(year, month, day);
            const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (cellDate < todayObj) {
                dayCell.classList.add('disabled');
            } else {
                if (manualDateInput && manualDateInput.value === cellDateStr) {
                    dayCell.classList.add('selected');
                }

                const tDateStr = todayObj.toISOString().split('T')[0];
                if (cellDateStr === tDateStr) {
                    dayCell.classList.add('today');
                }

                const dayBookings = bookings.filter(b => (b.eventDate === cellDateStr || b.photoshootDate === cellDateStr) && b.status !== "Rejected" && b.status !== "Expired");
                if (dayBookings.length > 0) {
                    const hasConfirmed = dayBookings.some(b => b.status === "Confirmed");
                    const hasTentative = dayBookings.some(b => b.status === "Pending Review" || b.status === "Awaiting Payment");
                    if (hasConfirmed) {
                        dayCell.classList.add('booked-day', 'confirmed');
                    } else if (hasTentative) {
                        dayCell.classList.add('booked-day', 'tentative');
                    }
                }

                dayCell.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (manualDateInput) {
                        manualDateInput.value = cellDateStr;
                    }
                    manualSelectedSlots.clear();
                    renderManualSlots();
                    renderManualDatePicker();
                });
            }
            daysGrid.appendChild(dayCell);
        }
    };

    const eventTypes = [
        { display: "Marriage Ceremony", value: "Marriage" },
        { display: "Engagement Party", value: "Engagement" },
        { display: "Nikah", value: "Nikah" },
        { display: "Corporate Event", value: "Corporate Event" },
        { display: "Photoshoot Session Only", value: "Photoshoot Only" },
        { display: "Other Celebration", value: "Other" }
    ];

    const renderManualEventTypePicker = () => {
        const typeOptionsList = document.getElementById('manual-typepicker-options-list');
        const eventTypeInput = document.getElementById('manual-event-type');
        const typeTriggerText = document.getElementById('manual-type-trigger-text');
        const typeDropdown = document.getElementById('manual-type-picker-dropdown');
        if (!typeOptionsList || !eventTypeInput) return;
        typeOptionsList.innerHTML = '';
        typeOptionsList.style.display = 'grid';
        typeOptionsList.style.gridTemplateColumns = 'repeat(2, 1fr)';
        typeOptionsList.style.gap = '8px';

        eventTypes.forEach(t => {
            const opt = document.createElement('div');
            opt.className = 'timepicker-option';
            opt.innerText = t.display;

            if (eventTypeInput.value === t.value) {
                opt.classList.add('selected');
            }

            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                eventTypeInput.value = t.value;
                if (typeTriggerText) typeTriggerText.innerText = t.display;
                if (typeDropdown) typeDropdown.style.display = 'none';
                renderManualEventTypePicker();
                renderManualSlots();
            });

            typeOptionsList.appendChild(opt);
        });
    };

    const rawTimes = [
        { display: "08:00 AM", value: "08:00" },
        { display: "09:00 AM", value: "09:00" },
        { display: "10:00 AM", value: "10:00" },
        { display: "11:00 AM", value: "11:00" },
        { display: "12:00 PM", value: "12:00" },
        { display: "01:00 PM", value: "13:00" },
        { display: "02:00 PM", value: "14:00" },
        { display: "03:00 PM", value: "15:00" },
        { display: "04:00 PM", value: "16:00" },
        { display: "05:00 PM", value: "17:00" },
        { display: "06:00 PM", value: "18:00" },
        { display: "07:00 PM", value: "19:00" }
    ];

    const renderManualTimePicker = () => {
        const timeOptionsList = document.getElementById('manual-timepicker-options-list');
        const eventTimeInput = document.getElementById('manual-event-time');
        const timeTriggerText = document.getElementById('manual-time-trigger-text');
        const timeDropdown = document.getElementById('manual-time-picker-dropdown');
        if (!timeOptionsList || !eventTimeInput) return;
        timeOptionsList.innerHTML = '';

        rawTimes.forEach(t => {
            const opt = document.createElement('div');
            opt.className = 'timepicker-option';
            opt.innerText = t.display;

            if (eventTimeInput.value === t.value) {
                opt.classList.add('selected');
            }

            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                eventTimeInput.value = t.value;
                if (timeTriggerText) timeTriggerText.innerText = t.display;
                if (timeDropdown) timeDropdown.style.display = 'none';
                renderManualTimePicker();
            });

            timeOptionsList.appendChild(opt);
        });
    };
    
    const renderManualSlots = () => {
        const manualSlotsGrid = document.getElementById('manual-slots-grid');
        if (!manualSlotsGrid) return;
        manualSlotsGrid.innerHTML = '';
        
        const eventDate = document.getElementById('manual-event-date').value;
        if (!eventDate) {
            manualSlotsGrid.innerHTML = '<div style="grid-column: span 12; text-align: center; color: var(--text-secondary); font-size: 0.85rem; font-style: italic; padding: 1rem 0;">Please select an event date first.</div>';
            return;
        }

        // Get already booked slots for this date
        const bookings = getBookings();
        const activeBookings = bookings.filter(b => b.eventDate === eventDate && b.status !== 'Rejected' && b.status !== 'Expired');
        let occupiedSlots = [];
        activeBookings.forEach(ab => {
            if (ab.photoshootSlots) {
                occupiedSlots = occupiedSlots.concat(ab.photoshootSlots);
            }
        });

        hours.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slot-btn';
            btn.innerText = slot.replace(':00', ''); // shorter display
            btn.style.width = '100%';
            btn.style.padding = '0.5rem';
            btn.style.borderRadius = '8px';
            btn.style.fontSize = '0.8rem';
            btn.style.border = '1px solid var(--glass-border)';
            btn.style.cursor = 'pointer';
            btn.style.transition = 'all 0.2s ease';
            
            if (occupiedSlots.includes(slot)) {
                btn.style.background = 'rgba(220, 53, 69, 0.1)';
                btn.style.color = '#dc3545';
                btn.style.borderColor = 'rgba(220, 53, 69, 0.2)';
                btn.disabled = true;
                btn.innerText += " (Booked)";
            } else {
                const updateBtnStyle = () => {
                    if (manualSelectedSlots.has(slot)) {
                        btn.style.background = 'var(--accent-olive)';
                        btn.style.color = 'white';
                        btn.style.borderColor = 'var(--accent-olive)';
                    } else {
                        btn.style.background = 'rgba(85, 107, 47, 0.05)';
                        btn.style.color = 'var(--text-primary)';
                        btn.style.borderColor = 'var(--glass-border)';
                    }
                };
                
                updateBtnStyle();
                btn.onclick = () => {
                    if (manualSelectedSlots.has(slot)) {
                        manualSelectedSlots.delete(slot);
                    } else {
                        manualSelectedSlots.add(slot);
                    }
                    updateBtnStyle();
                };
            }
            manualSlotsGrid.appendChild(btn);
        });
    };
    
    const getHolds = () => {
        const holds = localStorage.getItem('whiteoak_holds');
        return holds ? JSON.parse(holds) : [];
    };

    const saveHolds = (holds) => {
        localStorage.setItem('whiteoak_holds', JSON.stringify(holds));
    };

    const sweepExpiredHolds = () => {
        const holds = getHolds();
        const now = Date.now();
        const validHolds = holds.filter(h => (now - h.timestamp) < 600000);
        if (validHolds.length !== holds.length) {
            saveHolds(validHolds);
        }
    };

    const renderHoldsTable = () => {
        sweepExpiredHolds();
        const holds = getHolds();
        const tbody = document.getElementById('admin-holds-rows');
        if (!tbody) return;

        // Optimize: avoid rebuilding the entire table every 1 second
        const currentRowCount = tbody.querySelectorAll('tr').length;
        const hasEmptyMessage = tbody.innerHTML.includes('colspan');
        
        let needsRebuild = hasEmptyMessage || currentRowCount !== holds.length;
        
        if (!needsRebuild && holds.length > 0) {
            const rows = tbody.querySelectorAll('tr');
            holds.forEach((h, index) => {
                if (rows[index].cells[0] && rows[index].cells[0].innerText !== h.id) {
                    needsRebuild = true;
                }
            });
        }

        if (needsRebuild) {
            tbody.innerHTML = '';
            if (holds.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); font-style: italic;">No active temporary seat holds.</td></tr>`;
                return;
            }

            holds.forEach(h => {
                const tr = document.createElement('tr');
                const remainingMs = 600000 - (Date.now() - h.timestamp);
                const remainingMins = Math.max(0, Math.floor(remainingMs / 60000));
                const remainingSecs = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
                const timeRemainingText = remainingMs <= 0 ? "Expired" : `${remainingMins}:${String(remainingSecs).padStart(2, '0')}`;

                tr.innerHTML = `
                    <td style="font-weight: 600; font-family: monospace; color: #d35400;">${h.id}</td>
                    <td style="font-family: monospace; font-size: 0.85rem;">${h.sessionId}</td>
                    <td>${h.date}</td>
                    <td><span class="glass-badge" style="background: rgba(230, 126, 34, 0.1); color: #d35400; padding: 0.2rem 0.6rem; font-size: 0.8rem;">${h.slots.length} slot(s)</span><br><span style="font-size: 0.75rem; color: var(--text-secondary);">${h.slots.join(', ')}</span></td>
                    <td style="font-weight: bold; font-family: monospace; color: #e67e22;" id="hold-timer-${h.id}">${timeRemainingText}</td>
                    <td>
                        <button class="action-btn btn-reject" style="font-size: 0.75rem; padding: 0.3rem 0.6rem;" onclick="releaseHold('${h.id}')">Release</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        } else {
            // Soft update (only update text, no DOM reflows)
            holds.forEach(h => {
                const remainingMs = 600000 - (Date.now() - h.timestamp);
                const remainingMins = Math.max(0, Math.floor(remainingMs / 60000));
                const remainingSecs = Math.max(0, Math.floor((remainingMs % 60000) / 1000));
                const timeRemainingText = remainingMs <= 0 ? "Expired" : `${remainingMins}:${String(remainingSecs).padStart(2, '0')}`;
                
                const timerCell = document.getElementById(`hold-timer-${h.id}`);
                if (timerCell && timerCell.innerText !== timeRemainingText) {
                    timerCell.innerText = timeRemainingText;
                }
            });
        }
    };

    window.releaseHold = (holdId) => {
        let holds = getHolds();
        holds = holds.filter(h => h.id !== holdId);
        saveHolds(holds);
        renderHoldsTable();
        // Trigger a calendar re-render too since release of a hold might affect day availability visual state
        renderCalendar();
    };

    const setupSidebar = () => {
        const sidebarBtns = document.querySelectorAll('.sidebar-btn');
        const tabPanels = document.querySelectorAll('.admin-tab-panel');
        
        sidebarBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sidebarBtns.forEach(b => b.classList.remove('active'));
                tabPanels.forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                const target = btn.getAttribute('data-target');
                const panel = document.getElementById(target);
                if (panel) panel.classList.add('active');
            });
        });
    };

    const setupBackupRestore = () => {
        const exportBtn = document.getElementById('backup-export-btn');
        const importBtn = document.getElementById('backup-import-btn');
        const fileInput = document.getElementById('backup-file-input');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                const data = {
                    bookings: getBookings(),
                    holds: getHolds()
                };
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
                const dlAnchorElem = document.createElement('a');
                dlAnchorElem.setAttribute("href", dataStr);
                dlAnchorElem.setAttribute("download", `whiteoak_backup_${new Date().toISOString().split('T')[0]}.json`);
                dlAnchorElem.click();
            });
        }

        if (importBtn && fileInput) {
            importBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        const data = JSON.parse(event.target.result);
                        if (data.bookings) {
                            saveBookings(data.bookings);
                        }
                        if (data.holds) {
                            saveHolds(data.holds);
                        }
                        alert("Database restored successfully!");
                        window.location.reload();
                    } catch (err) {
                        console.error(err);
                        alert("Failed to restore database. Invalid JSON file.");
                    }
                };
                reader.readAsText(file);
            });
        }
    };

    const initDashboard = () => {
        renderStats();
        renderUpcomingEventsAlert();
        renderLedgerTable();
        renderHoldsTable();
        renderCalendar();
        setupDashboardListeners();
        renderManualSlots();
        renderManualDatePicker();
        renderManualTimePicker();
        renderManualEventTypePicker();
        setupSidebar();
        setupBackupRestore();
        
        // Auto-refresh holds table countdowns every second
        if (holdsTableInterval) clearInterval(holdsTableInterval);
        holdsTableInterval = setInterval(renderHoldsTable, 1000);

        // Auto-refresh dashboard data every 3 seconds for live sync
        if (autoRefreshInterval) clearInterval(autoRefreshInterval);
        autoRefreshInterval = setInterval(() => {
            renderStats();
            renderUpcomingEventsAlert();
            renderLedgerTable();
            renderCalendar();
        }, 3000);
    };
    
    // Calculate and render statistics (Event base pricing is mock-applied for Approved status)
    const getEventBasePrice = (type) => {
        switch (type) {
            case "Marriage": return 50000;
            case "Nikah": return 20000;
            case "Engagement": return 20000;
            case "Graduation": return 15000;
            case "Corporate Event": return 40000;
            default: return 15000;
        }
    };
    
    const renderStats = () => {
        const bookings = getBookings();
        
        const totalCount = bookings.length;
        const pendingCount = bookings.filter(b => b.status === 'Pending').length;
        const approvedCount = bookings.filter(b => b.status === 'Approved').length;
        
        // Revenue calculation: Sum of approved event base rates
        let totalRevenue = 0;
        bookings.forEach(b => {
            if (b.status === 'Approved') {
                totalRevenue += getEventBasePrice(b.eventType);
            }
        });
        
        document.getElementById('stat-total-bookings').innerText = totalCount;
        document.getElementById('stat-pending-bookings').innerText = pendingCount;
        document.getElementById('stat-approved-bookings').innerText = approvedCount;
        document.getElementById('stat-total-revenue').innerText = `Rs ${totalRevenue.toLocaleString('en-IN')}`;
    };

    const renderUpcomingEventsAlert = () => {
        const alertPanel = document.getElementById('upcoming-events-alert');
        const countSpan = document.getElementById('upcoming-events-count');
        const listDiv = document.getElementById('upcoming-events-list');
        if (!alertPanel || !listDiv) return;

        const bookings = getBookings();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tenDaysLater = new Date();
        tenDaysLater.setDate(today.getDate() + 10);
        tenDaysLater.setHours(23, 59, 59, 999);

        // Filter bookings in the next 10 days (exclude Rejected/Expired)
        const upcoming = bookings.filter(b => {
            if (b.status === 'Rejected' || b.status === 'Expired') return false;
            if (!b.eventDate) return false;
            const bDate = new Date(b.eventDate);
            return bDate >= today && bDate <= tenDaysLater;
        });

        // Sort ascending by eventDate
        upcoming.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

        if (upcoming.length === 0) {
            alertPanel.style.display = 'none';
            return;
        }

        alertPanel.style.display = 'block';
        if (countSpan) countSpan.innerText = `${upcoming.length} Event${upcoming.length > 1 ? 's' : ''}`;

        listDiv.innerHTML = '';
        upcoming.forEach(b => {
            const card = document.createElement('div');
            card.style.background = 'rgba(255, 255, 255, 0.45)';
            card.style.border = '1px solid var(--glass-border)';
            card.style.borderRadius = '12px';
            card.style.padding = '0.8rem 1rem';
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.gap = '0.3rem';

            // Calculate relative days
            const eventD = new Date(b.eventDate);
            eventD.setHours(0,0,0,0);
            const diffTime = eventD - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            let dayText = '';
            if (diffDays === 0) dayText = 'Today';
            else if (diffDays === 1) dayText = 'Tomorrow';
            else dayText = `in ${diffDays} days`;

            card.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-weight: 600; font-size: 0.9rem; color: var(--text-primary);">${b.name}</span>
                    <span style="font-size: 0.75rem; background: var(--accent-olive); color: white; padding: 0.1rem 0.4rem; border-radius: 4px;">${b.eventType}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); display: flex; justify-content: space-between;">
                    <span>Date: ${b.eventDate} (${b.eventTime})</span>
                    <span style="font-weight: bold; color: #a47b30;">${dayText}</span>
                </div>
            `;
            listDiv.appendChild(card);
        });
    };
    
    // Render bookings database in the ledger table
    const renderLedgerTable = () => {
        const bookings = getBookings();
        const tbody = document.getElementById('admin-bookings-rows');
        tbody.innerHTML = '';
        
        let filtered = bookings;
        if (activeFilter !== 'all') {
            filtered = bookings.filter(b => b.status === activeFilter);
        }
        
        // Search filter matching ID, name, email, phone, or eventType
        const searchInput = document.getElementById('ledger-search-input');
        if (searchInput && searchInput.value.trim() !== '') {
            const query = searchInput.value.toLowerCase().trim();
            filtered = filtered.filter(b => {
                const idMatch = b.id ? b.id.toLowerCase().includes(query) : false;
                const nameMatch = b.name ? b.name.toLowerCase().includes(query) : false;
                const emailMatch = b.email ? b.email.toLowerCase().includes(query) : false;
                const phoneMatch = b.phone ? b.phone.toLowerCase().includes(query) : false;
                const typeMatch = b.eventType ? b.eventType.toLowerCase().includes(query) : false;
                return idMatch || nameMatch || emailMatch || phoneMatch || typeMatch;
            });
        }
        
        // Sort descending by submission timestamp
        filtered.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
        
        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); font-style: italic;">No bookings found.</td></tr>`;
            return;
        }
        
        filtered.forEach((b, index) => {
            const tr = document.createElement('tr');
            tr.classList.add('stagger-row');
            tr.style.animationDelay = `${index * 30}ms`;
            
            const photoshootInfo = b.photoshootSlots.length > 0 
                ? `${b.photoshootDate}<br><span style="font-size: 0.8rem; color: var(--accent-olive);">${b.photoshootSlots.length} slot(s)</span>`
                : `<span style="color: var(--text-secondary); font-style: italic;">None</span>`;
            
            const depositText = b.depositPaid ? `Rs ${b.depositPaid.toLocaleString('en-IN')}` : 'Rs 0';
            
            let statusBadgeClass = 'badge-pending-review';
            if (b.status === 'Confirmed' || b.status === 'Approved') statusBadgeClass = 'badge-confirmed';
            if (b.status === 'Awaiting Payment') statusBadgeClass = 'badge-awaiting-payment';
            if (b.status === 'Expired') statusBadgeClass = 'badge-expired';
            if (b.status === 'Rejected') statusBadgeClass = 'badge-rejected';
            
            let actionButtonsHtml = '';
            if (b.status === 'Pending Review' || b.status === 'Pending') {
                actionButtonsHtml = `
                    <div class="action-btn-group">
                        <button class="action-btn btn-approve" onclick="updateBookingStatus('${b.id}', 'Awaiting Payment')">Approve (Invoice)</button>
                        <button class="action-btn btn-reject" onclick="updateBookingStatus('${b.id}', 'Rejected')">Reject</button>
                    </div>
                `;
            } else if (b.status === 'Awaiting Payment') {
                actionButtonsHtml = `
                    <div class="action-btn-group" style="display: flex; align-items: center;">
                        <button class="action-btn btn-approve" style="background: #27ae60; color: #ffffff; border: none;" onclick="updateBookingStatus('${b.id}', 'Confirmed')">Mark Paid</button>
                        <button class="action-btn btn-expire" style="background: transparent; color: #e67e22; border: 1px solid rgba(230, 126, 34, 0.4);" onclick="updateBookingStatus('${b.id}', 'Expired')">Expire</button>
                        <button class="action-btn btn-reject-link" style="background: none; border: none; color: #c0392b; text-decoration: underline; padding: 0.4rem 0.8rem; margin-left: 0.8rem;" onclick="updateBookingStatus('${b.id}', 'Rejected')">Reject</button>
                    </div>
                `;
            } else if (b.status === 'Confirmed' || b.status === 'Approved') {
                actionButtonsHtml = `
                    <div class="action-btn-group">
                        <button class="action-btn btn-reject" onclick="updateBookingStatus('${b.id}', 'Rejected')">Cancel Booking</button>
                    </div>
                `;
            } else {
                // Expired or Rejected
                actionButtonsHtml = `
                    <div class="action-btn-group">
                        <button class="action-btn" style="background: rgba(0,0,0,0.05); color: var(--text-primary); border: 1px solid var(--glass-border);" onclick="updateBookingStatus('${b.id}', 'Pending Review')">Reset</button>
                    </div>
                `;
            }
            
            let submittedAtText = 'N/A';
            if (b.submittedAt) {
                const subDate = new Date(b.submittedAt);
                submittedAtText = subDate.toLocaleString();
            }
            
            tr.innerHTML = `
                <td style="font-weight: 600; font-family: monospace;">${b.id}</td>
                <td><strong>${b.name}</strong><br><span style="font-size: 0.8rem; color: var(--text-secondary);">${b.email}</span>${b.phone ? `<br><span style="font-size: 0.8rem; color: var(--accent-olive);">${b.phone}</span>` : ''}</td>
                <td><span class="glass-badge" style="padding: 0.2rem 0.6rem; font-size: 0.8rem;">${b.eventType}</span></td>
                <td>${b.eventDate}<br>${b.eventTime}</td>
                <td>${photoshootInfo}</td>
                <td style="font-weight: 600; color: var(--accent-gold);">${depositText}</td>
                <td style="font-size: 0.85rem; color: var(--text-secondary);">${submittedAtText}</td>
                <td><span class="badge ${statusBadgeClass}">${b.status}</span></td>
                <td>${actionButtonsHtml}</td>
            `;
            
            tbody.appendChild(tr);
        });
    };
    
    window.updateBookingStatus = (id, newStatus) => {
        const bookings = getBookings();
        const bIdx = bookings.findIndex(b => b.id === id);
        if (bIdx > -1) {
            // Find row in table
            const rows = document.querySelectorAll('#admin-bookings-rows tr');
            let targetRow = null;
            rows.forEach(row => {
                if (row.cells[0] && row.cells[0].innerText === id) {
                    targetRow = row;
                }
            });

            const performUpdate = () => {
                bookings[bIdx].status = newStatus;
                if (newStatus === 'Awaiting Payment') {
                    bookings[bIdx].approvalTimestamp = Date.now();
                }
                saveBookings(bookings);
                
                renderStats();
                renderUpcomingEventsAlert();
                renderLedgerTable();
                renderCalendar();
                
                if (selectedCalendarDayStr) {
                    updateSidebarEvents(selectedCalendarDayStr);
                }
            };

            const willBeHidden = activeFilter !== 'all' && activeFilter !== newStatus;
            const isRejectionOrCancellation = newStatus === 'Rejected' || newStatus === 'Expired';
            
            if (targetRow && (willBeHidden || isRejectionOrCancellation)) {
                targetRow.classList.add('collapsing-row');
                setTimeout(() => {
                    performUpdate();
                }, 300);
            } else {
                performUpdate();
            }
        }
    };
    
    // Calendar Generator Logic
    const renderCalendar = () => {
        const container = document.getElementById('calendar-days-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        const year = calendarDate.getFullYear();
        const month = calendarDate.getMonth();
        
        // Set Header
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        document.getElementById('cal-month-year').innerText = `${monthNames[month]} ${year}`;
        
        // Days offsets
        const firstDayIndex = new Date(year, month, 1).getDay();
        const totalDays = new Date(year, month + 1, 0).getDate();
        
        // Empty cells for starting offset
        for (let i = 0; i < firstDayIndex; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'calendar-day empty-day';
            container.appendChild(emptyCell);
        }
        
        const bookings = getBookings();
        const holds = getHolds();
        const todayStr = new Date().toISOString().split('T')[0];
        const now = Date.now();
        
        // Render month days
        for (let day = 1; day <= totalDays; day++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-day';
            
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const cellDateStr = `${year}-${monthStr}-${dayStr}`;
            
            // Check bookings on date (excluding Rejected and Expired)
            const dayBookings = bookings.filter(b => (b.eventDate === cellDateStr || b.photoshootDate === cellDateStr) && b.status !== 'Rejected' && b.status !== 'Expired');
            
            // Check active temporary holds on date
            const dayHolds = holds.filter(h => h.date === cellDateStr && (now - h.timestamp < 600000) && h.slots && h.slots.length > 0);
            
            const hasApproved = dayBookings.some(b => b.status === 'Confirmed' || b.status === 'Approved');
            const hasPending = dayBookings.some(b => b.status === 'Pending' || b.status === 'Pending Review' || b.status === 'Awaiting Payment');
            const hasHolds = dayHolds.length > 0;
            
            if (hasApproved) {
                cell.classList.add('has-booking', 'approved-booking');
            }
            if (hasHolds) {
                cell.classList.add('has-booking', 'holding-date');
            }
            if (hasPending && !hasApproved && !hasHolds) {
                cell.classList.add('has-booking', 'pending-booking');
            }
            
            // Date number span
            const numSpan = document.createElement('span');
            numSpan.innerText = day;
            cell.appendChild(numSpan);
            
            // Status dots container
            if (hasApproved || hasHolds || hasPending) {
                const dotsContainer = document.createElement('div');
                dotsContainer.className = 'calendar-day-dots';
                
                if (hasApproved) {
                    const dot = document.createElement('span');
                    dot.className = 'calendar-dot dot-approved';
                    dot.title = 'Confirmed Event';
                    dotsContainer.appendChild(dot);
                }
                if (hasHolds) {
                    const dot = document.createElement('span');
                    dot.className = 'calendar-dot dot-hold';
                    dot.title = 'Active Hold';
                    dotsContainer.appendChild(dot);
                }
                if (hasPending && !hasApproved) {
                    const dot = document.createElement('span');
                    dot.className = 'calendar-dot dot-pending';
                    dot.title = 'Pending Review';
                    dotsContainer.appendChild(dot);
                }
                cell.appendChild(dotsContainer);
            }
            
            if (cellDateStr === todayStr) {
                cell.classList.add('today');
            }
            
            if (cellDateStr === selectedCalendarDayStr) {
                cell.classList.add('active-day');
            }
            
            cell.addEventListener('click', () => {
                document.querySelectorAll('.calendar-day').forEach(c => c.classList.remove('active-day'));
                cell.classList.add('active-day');
                selectedCalendarDayStr = cellDateStr;
                updateSidebarEvents(cellDateStr);
            });
            
            container.appendChild(cell);
        }
    };
    
    // Sidebar event detail list updates
    const updateSidebarEvents = (dateStr) => {
        const bookings = getBookings();
        const holds = getHolds();
        const heading = document.getElementById('sidebar-date-heading');
        const listContainer = document.getElementById('sidebar-events-list');
        if (!heading || !listContainer) return;
        
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateObj = new Date(dateStr);
        heading.innerText = dateObj.toLocaleDateString('en-IN', options);
        
        const dayBookings = bookings.filter(b => (b.eventDate === dateStr || b.photoshootDate === dateStr) && b.status !== 'Rejected' && b.status !== 'Expired');
        const dayHolds = holds.filter(h => h.date === dateStr && (Date.now() - h.timestamp < 600000) && h.slots && h.slots.length > 0);
        
        listContainer.innerHTML = '';
        
        if (dayBookings.length === 0 && dayHolds.length === 0) {
            listContainer.innerHTML = `<p style="color: var(--text-secondary); font-style: italic;">No events or holds for this date.</p>`;
            return;
        }
        
        // Render Active Seat Holds first
        dayHolds.forEach(h => {
            const item = document.createElement('div');
            item.className = 'sidebar-event-item';
            item.style.borderColor = '#d35400';
            item.style.background = 'rgba(230, 126, 34, 0.06)';
            
            const remainingMs = 600000 - (Date.now() - h.timestamp);
            const remainingMins = Math.max(0, Math.floor(remainingMs / 60000));
            const remainingSecs = Math.max(0, Math.floor((remainingMs % 60000) / 1000));

            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600; font-family: monospace; color: #d35400;">${h.id}</span>
                    <span class="badge" style="background: rgba(230, 126, 34, 0.15); color: #d35400; border: 1px solid rgba(230, 126, 34, 0.3); transform: scale(0.85);">ACTIVE HOLD</span>
                </div>
                <div style="line-height: 1.4; color: var(--text-primary);">
                    <strong>Session:</strong> ${h.sessionId}<br>
                    <strong>Slots (${h.slots.length}):</strong> ${h.slots.join(', ')}<br>
                    <strong>Hold Timer:</strong> <span style="font-weight: bold; color: #d35400;">${remainingMins}:${String(remainingSecs).padStart(2, '0')}</span>
                </div>
            `;
            listContainer.appendChild(item);
        });

        // Render Bookings
        dayBookings.forEach(b => {
            const item = document.createElement('div');
            item.className = 'sidebar-event-item';
            
            let statusBadge = 'badge-pending';
            if (b.status === 'Confirmed' || b.status === 'Approved') statusBadge = 'badge-approved';
            if (b.status === 'Awaiting Payment') statusBadge = 'badge-awaiting-payment';
            if (b.status === 'Rejected') statusBadge = 'badge-rejected';
            
            const isEvent = b.eventDate === dateStr;
            const detailsHtml = isEvent 
                ? `<strong>Type:</strong> ${b.eventType}<br><strong>Time:</strong> ${b.eventTime}<br><strong>Client:</strong> ${b.name}<br><strong>Guests:</strong> ${b.guestCount}`
                : `<strong>Type:</strong> Photoshoot Session<br><strong>Slots:</strong> ${b.photoshootSlots.length} hour(s)<br><strong>Client:</strong> ${b.name}`;
            
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                    <span style="font-weight: 600; font-family: monospace; color: var(--accent-olive);">${b.id}</span>
                    <span class="badge ${statusBadge}" style="transform: scale(0.85);">${b.status}</span>
                </div>
                <div style="line-height: 1.4; color: var(--text-primary);">${detailsHtml}</div>
            `;
            listContainer.appendChild(item);
        });
    };
    
    // Excel CSV Exporter (Excel native compatible with BOM header)
    const exportToCSV = () => {
        const bookings = getBookings();
        if (bookings.length === 0) {
            alert("No data available to export.");
            return;
        }
        
        let csvContent = "Booking ID,Client Name,Client Email,Event Type,Event Date,Event Time,Guest Count,Photoshoot Date,Photoshoot Slots Count,Photoshoot Slots list,Holding Deposit (Rs),Status,Submitted At\r\n";
        
        bookings.forEach(b => {
            const slotsEscaped = `"${b.photoshootSlots.join(', ')}"`;
            
            const row = [
                b.id,
                `"${b.name}"`,
                `"${b.email}"`,
                `"${b.eventType}"`,
                b.eventDate,
                b.eventTime,
                b.guestCount,
                b.photoshootDate || 'N/A',
                b.photoshootSlots.length,
                slotsEscaped,
                b.depositPaid || 0,
                b.status,
                b.submittedAt
            ].join(",");
            
            csvContent += row + "\r\n";
        });
        
        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `white_oak_castle_bookings_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const setupDashboardListeners = () => {
        document.getElementById('cal-prev-btn').onclick = () => {
            calendarDate.setMonth(calendarDate.getMonth() - 1);
            renderCalendar();
        };
        document.getElementById('cal-next-btn').onclick = () => {
            calendarDate.setMonth(calendarDate.getMonth() + 1);
            renderCalendar();
        };
        
        const filterBtns = document.querySelectorAll('.filters-row .filter-btn');
        filterBtns.forEach(btn => {
            btn.onclick = () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeFilter = btn.getAttribute('data-status-filter');
                renderLedgerTable();
            };
        });
        
        document.getElementById('export-excel-btn').onclick = exportToCSV;

        const ledgerSearchInput = document.getElementById('ledger-search-input');
        if (ledgerSearchInput) {
            ledgerSearchInput.addEventListener('input', () => {
                renderLedgerTable();
            });
        }

        const manualRefreshBtn = document.getElementById('manual-refresh-btn');
        if (manualRefreshBtn) {
            manualRefreshBtn.onclick = () => {
                const icon = manualRefreshBtn.querySelector('svg');
                if (icon) {
                    icon.style.transition = 'transform 0.5s ease';
                    icon.style.transform = `rotate(360deg)`;
                    setTimeout(() => { 
                        icon.style.transition = 'none'; 
                        icon.style.transform = 'rotate(0deg)'; 
                    }, 500);
                }
                renderStats();
                renderUpcomingEventsAlert();
                renderLedgerTable();
                renderCalendar();
            };
        }
        
        const resetBtn = document.getElementById('reset-db-btn');
        const resetModal = document.getElementById('reset-confirm-modal');
        const confirmInput = document.getElementById('reset-confirm-input');
        const cancelBtn = document.getElementById('reset-cancel-btn');
        const executeBtn = document.getElementById('reset-execute-btn');

        if (resetBtn && resetModal) {
            resetBtn.onclick = () => {
                resetModal.style.display = 'flex';
                confirmInput.value = '';
                executeBtn.disabled = true;
                confirmInput.focus();
            };
        }
        
        if (confirmInput && executeBtn) {
            confirmInput.oninput = () => {
                if (confirmInput.value === 'CONFIRM') {
                    executeBtn.disabled = false;
                } else {
                    executeBtn.disabled = true;
                }
            };
        }

        if (cancelBtn && resetModal) {
            cancelBtn.onclick = () => {
                resetModal.style.display = 'none';
            };
        }

        if (executeBtn) {
            executeBtn.onclick = () => {
                localStorage.removeItem('whiteoak_bookings');
                alert("Database reset successfully.");
                window.location.reload();
            };
        }

        const manualForm = document.getElementById('admin-manual-booking-form');
        const manualTypeInput = document.getElementById('manual-event-type');
        const submitBtn = document.getElementById('manual-booking-submit-btn');

        const prevMonthBtn = document.getElementById('manual-prev-month-btn');
        const nextMonthBtn = document.getElementById('manual-next-month-btn');
        if (prevMonthBtn) {
            prevMonthBtn.onclick = (e) => {
                e.stopPropagation();
                manualPickerDate.setMonth(manualPickerDate.getMonth() - 1);
                renderManualDatePicker();
            };
        }
        if (nextMonthBtn) {
            nextMonthBtn.onclick = (e) => {
                e.stopPropagation();
                manualPickerDate.setMonth(manualPickerDate.getMonth() + 1);
                renderManualDatePicker();
            };
        }

        const timeTrigger = document.getElementById('manual-time-picker-trigger');
        const timeDropdown = document.getElementById('manual-time-picker-dropdown');
        const typeTrigger = document.getElementById('manual-type-picker-trigger');
        const typeDropdown = document.getElementById('manual-type-picker-dropdown');

        if (timeTrigger && timeDropdown) {
            timeTrigger.onclick = (e) => {
                e.stopPropagation();
                if (typeDropdown) typeDropdown.style.display = 'none';
                timeDropdown.style.display = timeDropdown.style.display === 'none' ? 'block' : 'none';
                renderManualTimePicker();
            };
        }

        if (typeTrigger && typeDropdown) {
            typeTrigger.onclick = (e) => {
                e.stopPropagation();
                if (timeDropdown) timeDropdown.style.display = 'none';
                typeDropdown.style.display = typeDropdown.style.display === 'none' ? 'block' : 'none';
                renderManualEventTypePicker();
            };
        }

        document.addEventListener('click', () => {
            if (timeDropdown) timeDropdown.style.display = 'none';
            if (typeDropdown) typeDropdown.style.display = 'none';
        });

        if (manualForm) {
            manualForm.onsubmit = (e) => {
                e.preventDefault();
                const phoneInput = document.getElementById('manual-client-phone');
                const phoneErrorMsg = document.getElementById('manual-phone-error-msg');
                const phonePattern = /^\+91 \d{10}$/;
                
                if (phoneInput && !phonePattern.test(phoneInput.value)) {
                    if (phoneErrorMsg) phoneErrorMsg.style.display = 'block';
                    return;
                } else {
                    if (phoneErrorMsg) phoneErrorMsg.style.display = 'none';
                }

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = `<span class="btn-spinner"></span> <span>Scheduling...</span>`;
                }

                setTimeout(() => {
                    const name = document.getElementById('manual-client-name').value.trim();
                    const email = document.getElementById('manual-client-email').value.trim();
                    const phone = document.getElementById('manual-client-phone').value.trim();
                    const eventType = document.getElementById('manual-event-type').value;
                    const guestCount = parseInt(document.getElementById('manual-guest-count').value, 10);
                    const eventDate = document.getElementById('manual-event-date').value;
                    const eventTime = document.getElementById('manual-event-time').value;
                    
                    const photoshootSlots = Array.from(manualSelectedSlots);
                    
                    const bookings = getBookings();
                    
                    // Concurrency / Collision Check
                    const hasConfirmedEvent = bookings.some(b => b.eventDate === eventDate && b.status === 'Confirmed');
                    if (hasConfirmedEvent) {
                        alert("Double-Booking Conflict: There is already a CONFIRMED event on this date!");
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = `<span>Confirm Offline Booking</span>`;
                        }
                        return;
                    }
                    
                    let slotCollision = false;
                    if (photoshootSlots.length > 0) {
                        const activeBookings = bookings.filter(b => b.photoshootDate === eventDate && b.status !== 'Rejected' && b.status !== 'Expired');
                        let occupiedSlots = [];
                        activeBookings.forEach(ab => {
                            if (ab.photoshootSlots) {
                                occupiedSlots = occupiedSlots.concat(ab.photoshootSlots);
                            }
                        });
                        
                        photoshootSlots.forEach(slot => {
                            if (occupiedSlots.includes(slot)) {
                                slotCollision = true;
                            }
                        });
                    }
                    
                    if (slotCollision) {
                        alert("Double-Booking Conflict: One or more photoshoot slots are already booked on this date!");
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = `<span>Confirm Offline Booking</span>`;
                        }
                        return;
                    }
                    
                    const bookingId = "WOC-" + Math.floor(10000 + Math.random() * 90000);
                    const newBooking = {
                        id: bookingId,
                        name,
                        email,
                        phone,
                        eventType,
                        eventDate,
                        eventTime,
                        guestCount,
                        photoshootDate: eventDate,
                        photoshootSlots,
                        totalCost: 0,
                        depositPaid: 0, // offline bookings bypass online prepayment
                        status: 'Confirmed',
                        submittedAt: new Date().toISOString(),
                        offlineBooking: true
                    };
                    
                    bookings.push(newBooking);
                    saveBookings(bookings);
                    
                    alert(`Manual Offline Booking Confirmed!\nBooking ID: ${bookingId}`);
                    manualForm.reset();
                    
                    // Reset custom picker values
                    document.getElementById('manual-event-type').value = 'Marriage';
                    document.getElementById('manual-type-trigger-text').innerText = 'Marriage Ceremony';
                    renderManualEventTypePicker();
                    
                    document.getElementById('manual-event-time').value = '';
                    document.getElementById('manual-time-trigger-text').innerText = 'Select Time';
                    renderManualTimePicker();

                    manualSelectedSlots.clear();
                    renderManualSlots();
                    
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = `<span>Confirm Offline Booking</span>`;
                    }
                    
                    activeFilter = 'all';
                    const filterBtns = document.querySelectorAll('.filters-row .filter-btn');
                    filterBtns.forEach(b => {
                        if (b.getAttribute('data-status-filter') === 'all') {
                            b.classList.add('active');
                        } else {
                            b.classList.remove('active');
                        }
                    });
                    
                    renderStats();
                    renderUpcomingEventsAlert();
                    renderLedgerTable();
                    renderCalendar();

                    setTimeout(() => {
                        const rows = document.querySelectorAll('#admin-bookings-rows tr');
                        let newRow = null;
                        rows.forEach(row => {
                            if (row.cells[0] && row.cells[0].innerText === bookingId) {
                                newRow = row;
                            }
                        });
                        if (newRow) {
                            newRow.classList.add('pulse-new-row');
                        }
                    }, 50);
                }, 800);
            };
        }
    };
    
    checkAuth();

    // Cross-tab real-time sync for admin portal
    window.addEventListener('storage', (e) => {
        if (e.key === 'whiteoak_bookings' || e.key === 'whiteoak_holds') {
            renderStats();
            renderUpcomingEventsAlert();
            renderLedgerTable();
            renderHoldsTable();
            renderCalendar();
            renderManualSlots();
        }
    });
});

// High-Performance ClickSpark Canvas Effect
(function() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let sparks = [];

    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Spark {
        constructor(x, y, angle, color) {
            this.x = x;
            this.y = y;
            this.angle = angle;
            this.color = color || '#a47b30'; // Gold/Olive accents
            this.speed = Math.random() * 3 + 2;
            this.radius = Math.random() * 2 + 1.5;
            this.life = 1;
            this.decay = Math.random() * 0.03 + 0.02;
            this.length = Math.random() * 10 + 8;
        }

        update() {
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.life -= this.decay;
        }

        draw() {
            ctx.beginPath();
            const startX = this.x - Math.cos(this.angle) * this.length * this.life;
            const startY = this.y - Math.sin(this.angle) * this.length * this.life;
            ctx.moveTo(startX, startY);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.radius * this.life;
            ctx.lineCap = 'round';
            ctx.stroke();
        }
    }

    const colors = ['#556b2f', '#a47b30', '#ffffff', '#e6c875'];

    let isAnimating = false;
    const spawnSparks = (e) => {
        const count = 12;
        const x = e.clientX;
        const y = e.clientY;
        const baseColor = colors[Math.floor(Math.random() * colors.length)];
        for (let i = 0; i < count; i++) {
            const angle = (i * 2 * Math.PI / count) + (Math.random() * 0.4 - 0.2);
            sparks.push(new Spark(x, y, angle, baseColor));
        }
        if (!isAnimating) {
            isAnimating = true;
            animate();
        }
    };

    window.addEventListener('click', spawnSparks);

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sparks = sparks.filter(s => s.life > 0);
        sparks.forEach(s => {
            s.update();
            s.draw();
        });
        
        if (sparks.length > 0) {
            requestAnimationFrame(animate);
        } else {
            isAnimating = false;
        }
    };
})();

// Fade out page loader on load
window.addEventListener('load', () => {
    const loader = document.getElementById('pulse-loader-overlay');
    if (loader) {
        setTimeout(() => {
            loader.classList.remove('active');
        }, 300);
    }
});

// Real-time cross-tab storage sync for live user booking updates
window.addEventListener('storage', (e) => {
    if (e.key === 'whiteoak_bookings' || e.key === 'whiteoak_holds') {
        if (typeof renderStats === 'function') {
            renderStats();
            renderUpcomingEventsAlert();
            renderLedgerTable();
            renderHoldsTable();
            renderCalendar();
        }
    }
});

// ==========================================
// PREMIUM CUSTOM ALERT (TOAST) OVERRIDE
// ==========================================
window.alert = function(message) {
    let container = document.getElementById('woc-toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'woc-toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 100000;
            display: flex;
            flex-direction: column;
            gap: 12px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(85, 107, 47, 0.3);
        border-left: 6px solid var(--accent-olive, #556B2F);
        color: var(--text-primary, #2d3748);
        padding: 1.2rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.12);
        font-family: 'Inter', sans-serif;
        font-size: 0.95rem;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 12px;
        transform: translateX(120%);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        max-width: 380px;
        pointer-events: auto;
    `;

    toast.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-olive, #556B2F)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <span style="line-height: 1.4; flex-grow: 1;">${message}</span>
        <button style="background: none; border: none; cursor: pointer; color: #a0aec0; padding: 4px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: background 0.2s; margin-left: 8px;" onmouseover="this.style.background='rgba(0,0,0,0.05)'" onmouseout="this.style.background='none'" onclick="this.parentElement.style.opacity='0'; this.parentElement.style.transform='translateX(120%)'; setTimeout(() => this.parentElement.remove(), 400);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    `;

    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(0)';
            toast.style.opacity = '1';
        });
    });

    // Auto dismiss
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.transform = 'translateX(120%)';
            toast.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    toast.remove();
                }
            }, 400);
        }
    }, 5000);
};

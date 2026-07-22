// HTML Sanitizer Utility for XSS Prevention
const escapeHTML = (str) => {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// Navigation scroll effect
const navbar = document.querySelector('.glass-nav');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Intersection Observer for scroll reveal animations
const revealElements = document.querySelectorAll('.reveal');

const transitionOptions = {
    root: null,
    threshold: 0.15,
    rootMargin: "0px"
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) {
            return;
        }

        entry.target.classList.add('active');
        observer.unobserve(entry.target);
    });
}, transitionOptions);

revealElements.forEach(el => {
    observer.observe(el);
});

// ==========================================
// ANIMATED STATS COUNTER
// ==========================================
const animateCounter = (el, target, suffix = '', duration = 1800) => {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const isK = target >= 1000;
    const displayTarget = isK ? Math.round(target / 100) / 10 : target;

    const step = () => {
        current += increment;
        if (current >= target) {
            el.textContent = isK ? displayTarget + 'K' + suffix : target + suffix;
            return;
        }
        const display = isK ? (Math.round(current / 100) / 10).toFixed(1) : Math.floor(current);
        el.textContent = (isK ? display + 'K' : display) + suffix;
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
};

const statCapacity = document.getElementById('stat-capacity');
const statArea     = document.getElementById('stat-area');
const statParking  = document.getElementById('stat-parking');

if (statCapacity && statArea && statParking) {
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(statCapacity, 1500, '+');
                animateCounter(statArea, 50000, '');
                animateCounter(statParking, 300, '+');
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.4 });

    statsObserver.observe(statCapacity.closest('.intro-stats') || statCapacity);
}

// ==========================================
// GALLERY FILTER COUNT BADGES
// ==========================================
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryGrid = document.getElementById('gallery-grid');

if (filterBtns.length > 0 && galleryGrid) {
    // Count items per category
    const counts = { all: 0 };
    galleryGrid.querySelectorAll('.gallery-item').forEach(item => {
        const cat = item.dataset.category;
        counts.all++;
        counts[cat] = (counts[cat] || 0) + 1;
    });

    filterBtns.forEach(btn => {
        const filter = btn.dataset.filter;
        const count = counts[filter] || 0;
        const badge = document.createElement('span');
        badge.className = 'filter-count';
        badge.textContent = count;
        btn.appendChild(badge);
    });
}



// ==========================================
// CONTACT SPEED-DIAL FAB — TOUCH TOGGLE
// ==========================================
const contactFab = document.getElementById('contact-fab');
if (contactFab) {
    const fabMain = contactFab.querySelector('.fab-main');

    // Toggle open on tap (mobile) / keyboard Enter
    fabMain.addEventListener('click', (e) => {
        // On desktop, CSS :hover handles it. On touch devices, use JS toggle.
        if (window.matchMedia('(hover: none)').matches) {
            e.stopPropagation();
            contactFab.classList.toggle('open');
        }
    });

    // Keyboard accessibility
    fabMain.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            contactFab.classList.toggle('open');
        }
        if (e.key === 'Escape') {
            contactFab.classList.remove('open');
        }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!contactFab.contains(e.target)) {
            contactFab.classList.remove('open');
        }
    });

    // Close on Escape key globally
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            contactFab.classList.remove('open');
        }
    });
}


// ==========================================
// NEW INTERACTIVE & MULTIPAGE JS LOGIC
// ==========================================

// Active Navigation Page Highlighting
const currentPath = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
        link.classList.add('active-page');
    } else {
        link.classList.remove('active-page');
    }
});

// 3D Tilt Card Effect
document.querySelectorAll('.tilt-card').forEach(card => {
    let tiltRaf = null;
    card.addEventListener('mousemove', e => {
        if (tiltRaf) cancelAnimationFrame(tiltRaf);
        tiltRaf = requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            const rotateY = ((xPercent - 50) / 50) * 12;
            const rotateX = -((yPercent - 50) / 50) * 12;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            card.style.setProperty('--mouse-x', `${xPercent}%`);
            card.style.setProperty('--mouse-y', `${yPercent}%`);
        });
    });

    card.addEventListener('mouseleave', () => {
        if (tiltRaf) cancelAnimationFrame(tiltRaf);
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
});

// 3D Panoramic Tour Simulator
const panoramaContainer = document.querySelector('.panorama-container');
if (panoramaContainer) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let currentPanX = 0;
    let currentPanY = 0;
    let panX = 0;
    let panY = 0;
    let panRaf = null;

    const screen = panoramaContainer.querySelector('.panorama-screen');

    const dragStart = (e) => {
        isDragging = true;
        startX = (e.pageX || e.touches[0].pageX) - currentPanX;
        startY = (e.pageY || e.touches[0].pageY) - currentPanY;
        panoramaContainer.style.cursor = 'grabbing';
    };

    const dragMove = (e) => {
        if (!isDragging) return;

        const x = e.pageX || e.touches[0].pageX;
        const y = e.pageY || e.touches[0].pageY;

        panX = x - startX;
        panY = y - startY;

        const maxPanX = window.innerWidth * 0.4;
        const maxPanY = 30;

        if (panX > maxPanX) panX = maxPanX;
        if (panX < -maxPanX) panX = -maxPanX;
        if (panY > maxPanY) panY = maxPanY;
        if (panY < -maxPanY) panY = -maxPanY;

        if (panRaf) cancelAnimationFrame(panRaf);
        panRaf = requestAnimationFrame(() => {
            if (screen) {
                screen.style.setProperty('--pan-x', `${panX}px`);
                screen.style.setProperty('--pan-y', `${panY}px`);
            }
        });
    };

    const dragEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        currentPanX = panX;
        currentPanY = panY;
        panoramaContainer.style.cursor = 'grab';
    };

    panoramaContainer.addEventListener('mousedown', dragStart);
    window.addEventListener('mousemove', dragMove);
    window.addEventListener('mouseup', dragEnd);

    panoramaContainer.addEventListener('touchstart', dragStart, { passive: true });
    window.addEventListener('touchmove', dragMove, { passive: true });
    window.addEventListener('touchend', dragEnd);
}

// Panorama Tab Switcher
const panoramaImage = document.getElementById('panorama-image');
const tabButtons = document.querySelectorAll('.panorama-tab-btn');
if (tabButtons.length > 0 && panoramaImage) {
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const newSrc = btn.getAttribute('data-image');
            panoramaImage.src = newSrc;

            // Reset panning variables
            const screen = document.querySelector('.panorama-screen');
            if (screen) {
                screen.style.setProperty('--pan-x', '0px');
                screen.style.setProperty('--pan-y', '0px');
            }
        });
    });
}

// Lightbox Utility for Gallery
const lightbox = document.getElementById('lightbox');
const lightboxMediaContainer = document.getElementById('lightbox-media-container');
const lightboxClose = document.getElementById('lightbox-close');

if (lightbox) {
    // We bind event to the container to handle dynamically loaded or static grid items
    document.querySelector('main').addEventListener('click', (e) => {
        const mediaWrapper = e.target.closest('.gallery-media-wrapper');
        if (!mediaWrapper) return;

        const img = mediaWrapper.querySelector('img');
        const vid = mediaWrapper.querySelector('video');

        lightboxMediaContainer.innerHTML = '';

        if (vid) {
            const videoClone = document.createElement('video');
            videoClone.src = vid.src;
            videoClone.controls = true;
            videoClone.autoplay = true;
            videoClone.className = 'lightbox-media';
            lightboxMediaContainer.appendChild(videoClone);
        } else if (img) {
            const imgClone = document.createElement('img');
            imgClone.src = img.src;
            imgClone.className = 'lightbox-media';
            lightboxMediaContainer.appendChild(imgClone);
        }

        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    });

    const closeLBox = () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        lightboxMediaContainer.innerHTML = '';
    };

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLBox);
    }
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLBox();
        }
    });
}

// Unified Database Helpers
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

    // Seed mock bookings on first visit
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
            status: "Approved",
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

// Photoshoot Scheduler & Booking Form Logic
const slotsGrid = document.getElementById('slots-grid');
const selectedDateInput = document.getElementById('event-date');
const dateAlert = document.getElementById('date-availability-alert');
const eventTimeInput = document.getElementById('event-time');

if (slotsGrid && selectedDateInput) {
    let selectedSlots = new Set();

    // Session ID Helper (tab-isolated unique identifier)
    let sessionId = sessionStorage.getItem('woc_session_id');
    if (!sessionId) {
        sessionId = 'SESS-' + Math.floor(10000 + Math.random() * 90000);
        sessionStorage.setItem('woc_session_id', sessionId);
    }

    // Holds Database Helpers
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
        // Expiration limit: 10 minutes (600,000 milliseconds)
        const validHolds = holds.filter(h => (now - h.timestamp) < 600000);
        if (validHolds.length !== holds.length) {
            saveHolds(validHolds);
        }
    };

    // Periodically sweep expired holds in background
    setInterval(sweepExpiredHolds, 10000); // Check every 10 seconds for snappy UI response

    const updateMyHold = (date, slotsSet) => {
        sweepExpiredHolds();
        const holds = getHolds().filter(h => h.sessionId !== sessionId); // remove my previous holds

        if (slotsSet.size > 0 && date) {
            holds.push({
                id: 'HOLD-' + Math.floor(10000 + Math.random() * 90000),
                date: date,
                slots: Array.from(slotsSet),
                sessionId: sessionId,
                timestamp: Date.now()
            });
        }
        saveHolds(holds);
    };

    const getOtherReservations = (date) => {
        sweepExpiredHolds();
        const holds = getHolds();
        // filter holds for this date belonging to OTHER sessions
        const activeHolds = holds.filter(h => h.date === date && h.sessionId !== sessionId);
        let slots = [];
        activeHolds.forEach(h => {
            slots = slots.concat(h.slots);
        });
        return slots;
    };

    let countdownInterval = null;

    const startHoldTimer = (timestamp) => {
        const banner = document.getElementById('hold-timer-banner');
        const display = document.getElementById('hold-countdown');
        if (!banner || !display) return;

        if (countdownInterval) clearInterval(countdownInterval);

        banner.style.display = 'flex';

        const updateTimer = () => {
            const elapsed = Date.now() - timestamp;
            const remaining = 900000 - elapsed; // 10 minutes in ms

            if (remaining <= 0) {
                clearInterval(countdownInterval);
                banner.style.display = 'none';
                alert("Your 15-minute seat hold has expired. The slots have been released.");
                selectedSlots.clear();
                updateMyHold(selectedDateInput.value, selectedSlots);
                renderSlots(selectedDateInput.value);
                return;
            }

            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            display.innerText = `${mins}:${String(secs).padStart(2, '0')}`;
        };

        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    };

    const stopHoldTimer = () => {
        if (countdownInterval) clearInterval(countdownInterval);
        const banner = document.getElementById('hold-timer-banner');
        if (banner) banner.style.display = 'none';
    };

    // Check if there are bookings for a date
    const checkDayAvailability = (date) => {
        const bookings = getBookings();
        return bookings.filter(b => (b.eventDate === date || b.photoshootDate === date) && b.status !== "Rejected" && b.status !== "Expired");
    };

    // Retrieve photoshoot slots booked for a date (excluding Rejected/Expired bookings)
    const getMockBookings = (date) => {
        const bookings = getBookings();
        const activeBookings = bookings.filter(b => b.photoshootDate === date && b.status !== "Rejected" && b.status !== "Expired");
        let slots = [];
        activeBookings.forEach(b => {
            slots = slots.concat(b.photoshootSlots);
        });
        return slots;
    };

    const updateDateAlertAndSlots = () => {
        const date = selectedDateInput.value;
        if (!date) {
            if (dateAlert) dateAlert.style.display = 'none';
            slotsGrid.innerHTML = '<div style="color: var(--text-secondary); font-style: italic; grid-column: 1/-1; text-align: center; padding: 1rem;">Please select a date above first to view available slots.</div>';
            return;
        }

        const dayBookings = checkDayAvailability(date);
        if (dateAlert) {
            dateAlert.style.display = 'flex';
            const hasConfirmed = dayBookings.some(b => b.status === "Confirmed");
            const hasTentative = dayBookings.some(b => b.status === "Pending Review" || b.status === "Awaiting Payment");

            if (hasConfirmed) {
                dateAlert.className = 'date-availability-alert warning';
                dateAlert.style.borderColor = 'rgba(220, 53, 69, 0.4)';
                dateAlert.style.background = 'rgba(220, 53, 69, 0.05)';
                dateAlert.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-top; margin-right: 4px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></span> Sorry, this date has been fully booked & confirmed.';
            } else if (hasTentative) {
                dateAlert.className = 'date-availability-alert warning tentative-alert';
                dateAlert.style.borderColor = 'rgba(230, 126, 34, 0.4)';
                dateAlert.style.background = 'rgba(230, 126, 34, 0.05)';
                dateAlert.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-top; margin-right: 4px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></span> Note: This date is tentatively held / awaiting payment. You can still submit a request.';
            } else {
                dateAlert.className = 'date-availability-alert available';
                dateAlert.innerHTML = '<span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: text-top; margin-right: 4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></span> Excellent! This date is fully clear for bookings.';
            }
        }

        renderSlots(date);
    };

    let isDragging = false;
    let dragMode = null; // 'select' or 'deselect'

    const renderSlots = (date) => {
        const bookedSlots = getMockBookings(date);
        const reservedSlots = getOtherReservations(date);

        // Define standard operating hours (8:00 AM to 8:00 PM)
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

        slotsGrid.innerHTML = '';
        selectedSlots.clear();
        updatePricing();

        hours.forEach(slot => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'slot-btn';
            btn.innerText = slot.replace(':00', ''); // shorter display text
            btn.dataset.slot = slot;

            if (bookedSlots.includes(slot)) {
                btn.classList.add('booked');
                btn.disabled = true;
            } else if (reservedSlots.includes(slot)) {
                btn.classList.add('reserved');
                btn.disabled = true;
            } else {
                btn.classList.add('available');

                // Mousedown starts drag action
                btn.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isDragging = true;
                    if (selectedSlots.has(slot)) {
                        dragMode = 'deselect';
                        selectedSlots.delete(slot);
                        btn.classList.remove('selected');
                    } else {
                        dragMode = 'select';
                        selectedSlots.add(slot);
                        btn.classList.add('selected');
                    }
                    updatePricing();
                });

                // Mouseenter toggles while dragging
                btn.addEventListener('mouseenter', () => {
                    if (isDragging && dragMode) {
                        if (dragMode === 'select') {
                            selectedSlots.add(slot);
                            btn.classList.add('selected');
                        } else {
                            selectedSlots.delete(slot);
                            btn.classList.remove('selected');
                        }
                        updatePricing();
                    }
                });
            }
            slotsGrid.appendChild(btn);
        });
    };

    // Global mouseup to cancel dragging
    const stopDrag = () => {
        isDragging = false;
        dragMode = null;
    };
    window.removeEventListener('mouseup', stopDrag);
    window.addEventListener('mouseup', stopDrag);

    // Select/Clear All buttons
    const selectAllBtn = document.getElementById('select-all-slots-btn');
    const clearAllBtn = document.getElementById('clear-all-slots-btn');

    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', () => {
            const availableButtons = slotsGrid.querySelectorAll('.slot-btn.available');
            availableButtons.forEach(btn => {
                const slot = btn.dataset.slot;
                selectedSlots.add(slot);
                btn.classList.add('selected');
            });
            updatePricing();
        });
    }

    if (clearAllBtn) {
        clearAllBtn.addEventListener('click', () => {
            const selectedButtons = slotsGrid.querySelectorAll('.slot-btn.selected');
            selectedButtons.forEach(btn => {
                const slot = btn.dataset.slot;
                selectedSlots.delete(slot);
                btn.classList.remove('selected');
            });
            updatePricing();
        });
    }

    const getEventBasePrice = (type) => {
        switch (type) {
            case "Marriage": return 50000;
            case "Nikah": return 20000;
            case "Engagement": return 20000;
            case "Graduation": return 15000;
            case "Corporate Event": return 40000;
            case "Photoshoot Only": return 1500; // Hourly base rate
            default: return 15000;
        }
    };

    const updatePricing = () => {
        const selectedCount = selectedSlots.size;
        const selectedSlotsCountEl = document.getElementById('selected-slots-count');
        if (selectedSlotsCountEl) {
            selectedSlotsCountEl.innerText = selectedCount;
        }

        const summaryPanel = document.getElementById('price-summary-panel');
        const eventTypeInputEl = document.getElementById('event-type');
        const selectedType = eventTypeInputEl ? eventTypeInputEl.value : "";

        if (selectedCount > 0 || selectedType) {
            if (summaryPanel) {
                summaryPanel.style.display = 'flex';
            }
            
            // Calculate and display Estimated Base Cost
            let cost = 0;
            if (selectedType === "Photoshoot Only") {
                cost = 1500 * (selectedCount > 0 ? selectedCount : 1);
            } else if (selectedType) {
                cost = getEventBasePrice(selectedType);
            }
            
            const costEl = document.getElementById('estimated-base-cost');
            if (costEl) {
                costEl.innerText = `Rs ${cost.toLocaleString('en-IN')}`;
            }

            if (selectedCount > 0) {
                updateMyHold(selectedDateInput.value, selectedSlots);
                const myHold = getHolds().find(h => h.sessionId === sessionId);
                if (myHold) {
                    startHoldTimer(myHold.timestamp);
                }
            } else {
                updateMyHold(selectedDateInput.value, selectedSlots);
                stopHoldTimer();
            }
        } else {
            if (summaryPanel) {
                summaryPanel.style.display = 'none';
            }
            updateMyHold(selectedDateInput.value, selectedSlots);
            stopHoldTimer();
        }
    };

    // Poll to keep slots availability up-to-date with other tabs
    setInterval(() => {
        if (selectedDateInput && selectedDateInput.value) {
            const otherReservations = getOtherReservations(selectedDateInput.value);
            const bookedSlots = getMockBookings(selectedDateInput.value);

            let collision = false;
            selectedSlots.forEach(slot => {
                if (bookedSlots.includes(slot) || otherReservations.includes(slot)) {
                    selectedSlots.delete(slot);
                    collision = true;
                }
            });
            if (collision) {
                alert("One or more of your selected slots was reserved or booked by another client and has been removed from your selection.");
                updateMyHold(selectedDateInput.value, selectedSlots);
                updatePricing();
            }

            const buttons = slotsGrid.querySelectorAll('.slot-btn');
            buttons.forEach(btn => {
                const slot = btn.dataset.slot;
                if (bookedSlots.includes(slot)) {
                    btn.className = 'slot-btn booked';
                    btn.disabled = true;
                } else if (otherReservations.includes(slot)) {
                    btn.className = 'slot-btn reserved';
                    btn.disabled = true;
                } else {
                    btn.className = 'slot-btn available' + (selectedSlots.has(slot) ? ' selected' : '');
                    btn.disabled = false;
                }
            });
        }
    }, 5000);

    // Custom Date Picker Logic (Inline Calendar)
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const monthYearLabel = document.getElementById('datepicker-month-year');
    const daysGrid = document.getElementById('datepicker-days-grid');
    const dateTriggerText = document.getElementById('date-trigger-text');

    let currentPickerDate = new Date();

    const renderCustomDatePicker = () => {
        if (!daysGrid || !monthYearLabel) return;
        daysGrid.innerHTML = '';

        const year = currentPickerDate.getFullYear();
        const month = currentPickerDate.getMonth();

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

        for (let day = 1; day <= totalDays; day++) {
            const dayCell = document.createElement('div');
            dayCell.className = 'datepicker-day';
            dayCell.innerText = day;

            const cellDate = new Date(year, month, day);
            const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            if (cellDate < todayObj) {
                dayCell.classList.add('disabled');
            } else {
                if (selectedDateInput.value === cellDateStr) {
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
                    selectedDateInput.value = cellDateStr;
                    if (dateTriggerText) {
                        dateTriggerText.innerText = `${String(day).padStart(2, '0')}-${String(month + 1).padStart(2, '0')}-${year}`;
                    }

                    updateDateAlertAndSlots();
                    renderCustomDatePicker();
                });
            }
            daysGrid.appendChild(dayCell);
        }
    };

    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentPickerDate.setMonth(currentPickerDate.getMonth() - 1);
            renderCustomDatePicker();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentPickerDate.setMonth(currentPickerDate.getMonth() + 1);
            renderCustomDatePicker();
        });
    }

    // Custom Time Picker Logic
    const timeTrigger = document.getElementById('time-picker-trigger');
    const timeDropdown = document.getElementById('time-picker-dropdown');
    const timeOptionsList = document.getElementById('timepicker-options-list');
    const timeTriggerText = document.getElementById('time-trigger-text');

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
        { display: "07:00 PM", value: "19:00" },
        { display: "08:00 PM", value: "20:00" }
    ];

    const renderCustomTimePicker = () => {
        if (!timeOptionsList) return;
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
                timeTriggerText.innerText = t.display;
                timeDropdown.style.display = 'none';
                renderCustomTimePicker();
            });

            timeOptionsList.appendChild(opt);
        });
    };

    if (timeTrigger) {
        timeTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const eventTypeDropdown = document.getElementById('event-type-dropdown');
            if (eventTypeDropdown) eventTypeDropdown.style.display = 'none';
            timeDropdown.style.display = timeDropdown.style.display === 'none' ? 'block' : 'none';
            renderCustomTimePicker();
        });
    }

    // Custom Event Type Dropdown Logic
    const eventTypeTrigger = document.getElementById('event-type-trigger');
    const eventTypeDropdown = document.getElementById('event-type-dropdown');
    const eventTypeInput = document.getElementById('event-type');

    if (eventTypeTrigger && eventTypeDropdown && eventTypeInput) {
        eventTypeTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            if (timeDropdown) timeDropdown.style.display = 'none';
            eventTypeDropdown.style.display = eventTypeDropdown.style.display === 'none' ? 'block' : 'none';
        });

        const options = eventTypeDropdown.querySelectorAll('.custom-select-option');
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const value = opt.dataset.value;
                eventTypeInput.value = value;
                document.getElementById('event-type-trigger-text').innerText = opt.innerText;

                eventTypeInput.dispatchEvent(new Event('change'));

                options.forEach(o => o.classList.remove('selected'));
                opt.classList.add('selected');

                eventTypeDropdown.style.display = 'none';
            });
        });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
        if (eventTypeDropdown && eventTypeTrigger && !eventTypeTrigger.contains(e.target) && !eventTypeDropdown.contains(e.target)) {
            eventTypeDropdown.style.display = 'none';
        }
        if (timeDropdown && !timeTrigger.contains(e.target) && !timeDropdown.contains(e.target)) {
            timeDropdown.style.display = 'none';
        }
    });

    // Deposit Amount Map based on event type
    const getDepositAmount = (type) => {
        switch (type) {
            case "Marriage": return 1000;
            case "Engagement": return 500;
            case "Nikah": return 500;
            case "Graduation": return 300;
            case "Corporate Event": return 800;
            case "Photoshoot Only": return 50;
            default: return 200;
        }
    };

    // Event Type Dynamic Heading Renaming & Deposit Notice Updating
    const eventTypeSelect = document.getElementById('event-type');
    const photoshootSlotsHeading = document.getElementById('photoshoot-slots-heading');
    const summarySlotsHeading = document.getElementById('summary-slots-heading');
    const depositNoticeCard = document.getElementById('deposit-notice-card');
    const depositAmountSpan = document.getElementById('deposit-amount');
    const depositConfirmWrapper = document.getElementById('deposit-confirm-wrapper');
    const depositConfirmValSpan = document.getElementById('deposit-confirm-val');

    const updateHeadingAndDeposit = () => {
        if (!eventTypeSelect) return;
        const selectedValue = eventTypeSelect.value;
        const eventTypeName = selectedValue ? selectedValue : "Event";

        if (photoshootSlotsHeading) {
            photoshootSlotsHeading.innerText = `${eventTypeName} Slots`;
        }
        if (summarySlotsHeading) {
            summarySlotsHeading.innerText = `${eventTypeName} Summary`;
        }

        // Update Deposit Display
        if (selectedValue) {
            const deposit = getDepositAmount(selectedValue);
            if (depositNoticeCard && depositAmountSpan && depositConfirmWrapper && depositConfirmValSpan) {
                depositNoticeCard.style.display = 'block';
                depositAmountSpan.innerText = `Rs ${deposit.toLocaleString('en-IN')}`;
                depositConfirmWrapper.style.display = 'flex';
                depositConfirmValSpan.innerText = `Rs ${deposit.toLocaleString('en-IN')}`;
            }
        } else {
            if (depositNoticeCard) depositNoticeCard.style.display = 'none';
            if (depositConfirmWrapper) depositConfirmWrapper.style.display = 'none';
        }
    };

    if (eventTypeSelect) {
        eventTypeSelect.addEventListener('change', updateHeadingAndDeposit);
        eventTypeSelect.addEventListener('change', updatePricing);
        updateHeadingAndDeposit(); // Initial run
    }

    // Auto-populate name, email and phone if user is logged into Client Portal
    const clientNameInput = document.getElementById('client-name');
    const clientEmailInput = document.getElementById('client-email');
    const clientPhoneInput = document.getElementById('client-phone');
    if (clientNameInput && clientEmailInput && clientPhoneInput) {
        const loggedName = sessionStorage.getItem('woc_client_name');
        const loggedEmail = sessionStorage.getItem('woc_client_email');
        const loggedPhone = sessionStorage.getItem('woc_client_phone') || "";
        if (loggedName && loggedEmail) {
            clientNameInput.value = loggedName;
            clientNameInput.disabled = true;
            clientNameInput.style.background = 'rgba(85, 107, 47, 0.05)';
            clientEmailInput.value = loggedEmail;
            clientEmailInput.disabled = true;
            clientEmailInput.style.background = 'rgba(85, 107, 47, 0.05)';
            if (loggedPhone) {
                clientPhoneInput.value = loggedPhone;
                clientPhoneInput.disabled = true;
                clientPhoneInput.style.background = 'rgba(85, 107, 47, 0.05)';
            }
        }
    }

    updateDateAlertAndSlots(); // Initial render check

    // Booking Form Submit Handler
    const bookingForm = document.getElementById('event-booking-form');
    const successModal = document.getElementById('success-modal');
    const closeModalBtn = document.getElementById('close-success-modal');

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const requiredIds = ['client-name', 'client-email', 'client-phone', 'guest-count', 'event-type'];
            let missing = [];
            requiredIds.forEach(id => {
                const el = document.getElementById(id);
                if (!el || !el.value.trim()) missing.push(id.replace('client-', '').replace('-', ' '));
            });

            // Clean previous error
            let errDiv = document.getElementById('form-submit-error');
            if (errDiv) errDiv.remove();

            if (missing.length) {
                errDiv = document.createElement('div');
                errDiv.id = 'form-submit-error';
                errDiv.className = 'field-error';
                errDiv.innerText = `Please complete all required fields: ${missing.join(', ')}`;
                const bottomPanel = document.querySelector('.booking-bottom-panel');
                if (bottomPanel) {
                    bottomPanel.insertBefore(errDiv, bottomPanel.lastElementChild);
                } else {
                    bookingForm.appendChild(errDiv);
                }
                return;
            }

            if (!selectedDateInput.value) {
                alert("Please select a date of event.");
                return;
            }
            if (!eventTimeInput.value) {
                alert("Please select a start time.");
                return;
            }

            const phoneErrorMsg = document.getElementById('phone-error-msg');
            const phonePattern = /^\+91 \d{10}$/;
            if (clientPhoneInput && !phonePattern.test(clientPhoneInput.value)) {
                if (phoneErrorMsg) phoneErrorMsg.style.display = 'block';
                return;
            } else {
                if (phoneErrorMsg) phoneErrorMsg.style.display = 'none';
            }

            const bookingId = "WOC-" + Math.floor(10000 + Math.random() * 90000);
            const name = clientNameInput.value.trim();
            const email = clientEmailInput.value.trim();
            const phone = clientPhoneInput ? clientPhoneInput.value.trim() : "";
            const eventType = eventTypeSelect.value;
            const eventDate = selectedDateInput.value;
            const eventTime = eventTimeInput.value;
            const guestCount = parseInt(document.getElementById('guest-count').value, 10);

            const photoshootDate = eventDate;
            const photoshootSlots = Array.from(selectedSlots);
            const totalCost = 0; // Photoshoot slots are free
            const depositPaid = getDepositAmount(eventType);

            const newBooking = {
                id: bookingId,
                name,
                email,
                phone,
                eventType,
                eventDate,
                eventTime,
                guestCount,
                photoshootDate,
                photoshootSlots,
                totalCost,
                depositPaid,
                status: "Pending Review",
                submittedAt: new Date().toISOString()
            };

            if (sessionStorage.getItem('woc_client_name') && phone) {
                sessionStorage.setItem('woc_client_phone', phone);
            }

            sweepExpiredHolds();
            const finalBookedSlots = getMockBookings(eventDate);
            const finalReservedSlots = getOtherReservations(eventDate);

            let doubleBookingCollision = false;
            photoshootSlots.forEach(slot => {
                if (finalBookedSlots.includes(slot) || finalReservedSlots.includes(slot)) {
                    doubleBookingCollision = true;
                }
            });

            if (doubleBookingCollision) {
                alert("Transaction Failed (Double-Booking Collision): One or more of your selected slots have already been reserved or booked by another user. Your transaction has been rolled back.");

                selectedSlots.clear();
                updateMyHold(eventDate, selectedSlots);
                updatePricing();
                renderSlots(eventDate);
                renderCustomDatePicker();
                return;
            }

            selectedSlots.clear();
            updateMyHold(eventDate, selectedSlots);
            stopHoldTimer();

            const loaderOverlay = document.getElementById('pulse-loader-overlay');
            const loaderText = document.getElementById('pulse-loader-text');
            if (loaderText) {
                loaderText.innerText = "Synchronizing booking request...";
            }
            if (loaderOverlay) {
                loaderOverlay.classList.add('active');
            }

            setTimeout(() => {
                if (loaderOverlay) {
                    loaderOverlay.classList.remove('active');
                }

                const bookings = getBookings();
                bookings.push(newBooking);
                saveBookings(bookings);

                const sBookingId = document.getElementById('success-booking-id');
                const sDeposit = document.getElementById('success-deposit-amount');
                if (sBookingId) sBookingId.innerText = bookingId;
                if (sDeposit) sDeposit.innerText = `Rs ${depositPaid.toLocaleString('en-IN')}`;

                if (successModal) {
                    const slotsHtml = photoshootSlots.length > 0
                        ? `<strong>Selected Slots (${photoshootSlots.length}):</strong>
                           <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; max-height: 100px; overflow-y: auto; padding: 4px; background: rgba(85,107,47,0.05); border-radius: 8px;">
                               ${photoshootSlots.map(s => `<span class="glass-badge" style="font-size: 0.75rem; padding: 0.2rem 0.5rem; background: rgba(85,107,47,0.12); color: var(--accent-olive); border-radius: 6px;">${escapeHTML(s)}</span>`).join('')}
                           </div>`
                        : '<strong>Selected Slots:</strong> None';

                    const summaryHtml = `
                        <strong>Booking ID:</strong> ${escapeHTML(bookingId)}<br>
                        <strong>Event Type:</strong> ${escapeHTML(eventType)}<br>
                        <strong>Date & Time:</strong> ${escapeHTML(eventDate)} at ${escapeHTML(eventTime)}<br>
                        <strong>Contact Name:</strong> ${escapeHTML(name)}<br>
                        <strong>Phone Number:</strong> ${escapeHTML(phone)}<br>
                        <strong>Holding Deposit Paid:</strong> Rs ${depositPaid.toLocaleString('en-IN')}<br>
                        ${slotsHtml}
                    `;
                    const detailsEl = document.getElementById('booking-summary-details');
                    if (detailsEl) detailsEl.innerHTML = summaryHtml;
                    successModal.classList.add('active');
                }
            }, 2000);
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            successModal.classList.remove('active');

            // Re-enable temporarily to reset form, then restore locks if logged in
            if (clientNameInput.disabled) {
                clientNameInput.disabled = false;
                clientEmailInput.disabled = false;
                if (clientPhoneInput) clientPhoneInput.disabled = false;
                bookingForm.reset();
                const loggedName = sessionStorage.getItem('woc_client_name');
                const loggedEmail = sessionStorage.getItem('woc_client_email');
                const loggedPhone = sessionStorage.getItem('woc_client_phone') || "";
                if (loggedName && loggedEmail) {
                    clientNameInput.value = loggedName;
                    clientNameInput.disabled = true;
                    clientEmailInput.value = loggedEmail;
                    clientEmailInput.disabled = true;
                    if (clientPhoneInput && loggedPhone) {
                        clientPhoneInput.value = loggedPhone;
                        clientPhoneInput.disabled = true;
                    }
                }
            } else {
                bookingForm.reset();
            }

            if (dateTriggerText) dateTriggerText.innerText = "Select Date";
            if (timeTriggerText) timeTriggerText.innerText = "Select Time";

            const eventTypeTriggerText = document.getElementById('event-type-trigger-text');
            if (eventTypeTriggerText) eventTypeTriggerText.innerText = "Choose type of event";
            const eventTypeInput = document.getElementById('event-type');
            if (eventTypeInput) eventTypeInput.value = "";
            const eventTypeOptions = document.querySelectorAll('.custom-select-option');
            eventTypeOptions.forEach(o => o.classList.remove('selected'));

            selectedDateInput.value = "";
            eventTimeInput.value = "";
            updateDateAlertAndSlots();
            renderCustomDatePicker();
            updateHeadingAndDeposit();
        });
    }
}

// Gallery Category Filtering Logic
const filterButtons = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterButtons.length > 0 && galleryItems.length > 0) {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'flex';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Hover Video Preview Interaction
document.querySelectorAll('.gallery-media-wrapper video').forEach(video => {
    const item = video.closest('.gallery-item');
    if (item) {
        item.addEventListener('mouseenter', () => {
            video.play().catch(() => { });
        });
        item.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });
    }
});

// Global client authentication navigation update
document.addEventListener("DOMContentLoaded", () => {
    // Only apply if not on portal.html (which handles its own nav transition dynamically)
    if (window.location.pathname.indexOf("portal.html") === -1) {
        const portalNavLink = Array.from(document.querySelectorAll('.nav-link')).find(el => el.innerText.trim() === "Login Portal" || el.innerText.trim() === "Logout");
        if (portalNavLink) {
            const email = sessionStorage.getItem("woc_client_email");
            const name = sessionStorage.getItem("woc_client_name");
            if (email && name) {
                portalNavLink.innerText = "Logout";
                portalNavLink.href = "#";
                portalNavLink.classList.add("logout-btn-animate");
                portalNavLink.addEventListener("click", (e) => {
                    e.preventDefault();
                    sessionStorage.removeItem("woc_client_email");
                    sessionStorage.removeItem("woc_client_name");
                    window.location.href = "logout.html";
                });
            }
        }
    }
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

    let isAnimating = false;
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

// Fade out page loader on load or readyState complete
const hidePageLoader = () => {
    const loader = document.getElementById('pulse-loader-overlay');
    if (loader) {
        setTimeout(() => {
            loader.classList.remove('active');
        }, 150);
    }
};

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    hidePageLoader();
} else {
    document.addEventListener('DOMContentLoaded', hidePageLoader);
    window.addEventListener('load', hidePageLoader);
}

// ==========================================
// SECURE BOOKING AUTHENTICATION & VALIDATION
// ==========================================

const getClients = () => {
    if (!localStorage.getItem('whiteoak_clients')) {
        const seedClients = [
            { name: "John Doe", email: "john.doe@gmail.com", password: "password", phone: "+91 9876543210" },
            { name: "Anas Rahman", email: "anas@gmail.com", password: "password", phone: "+91 9123456780" },
            { name: "Fathima Najiya", email: "najiya.fathima@yahoo.com", password: "password", phone: "+91 9988776655" }
        ];
        localStorage.setItem('whiteoak_clients', JSON.stringify(seedClients));
    }
    const stored = localStorage.getItem('whiteoak_clients');
    return stored ? JSON.parse(stored) : [];
};

const autoFillBookingForm = (client) => {
    const nameEl = document.getElementById('client-name');
    const emailEl = document.getElementById('client-email');
    const phoneEl = document.getElementById('client-phone');
    if (nameEl) nameEl.value = client.name || '';
    if (emailEl) emailEl.value = client.email || '';
    if (phoneEl) phoneEl.value = client.phone || '';
};

window.showLoginModal = () => {
    const backdrop = document.getElementById('login-backdrop');
    const modal = document.getElementById('login-modal');
    if (backdrop && modal) {
        backdrop.style.display = 'block';
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }
};

window.hideLoginModal = () => {
    const backdrop = document.getElementById('login-backdrop');
    const modal = document.getElementById('login-modal');
    if (backdrop && modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            backdrop.style.display = 'none';
            modal.style.display = 'none';
        }, 400); // Wait for transition
    }
};

window.showTermsModal = () => {
    const backdrop = document.getElementById('terms-backdrop');
    const modal = document.getElementById('terms-modal');
    if (backdrop && modal) {
        backdrop.style.display = 'block';
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }
};

window.hideTermsModal = () => {
    const backdrop = document.getElementById('terms-backdrop');
    const modal = document.getElementById('terms-modal');
    if (backdrop && modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            backdrop.style.display = 'none';
            modal.style.display = 'none';
        }, 400);
    }
};

const initAuth = () => {
    const loggedEmail = sessionStorage.getItem('woc_client_email') || sessionStorage.getItem('woc_client_logged');
    const wrapper = document.getElementById('booking-form-wrapper');
    const msg = document.getElementById('login-required-msg');
    
    if (loggedEmail) {
        const client = getClients().find(c => c.email.toLowerCase() === loggedEmail.toLowerCase());
        if (client) {
            autoFillBookingForm(client);
            if (wrapper) wrapper.classList.remove('disabled');
            if (msg) msg.style.display = 'none';
            return;
        }
    }
    
    if (wrapper) wrapper.classList.add('disabled');
    if (msg) msg.style.display = 'flex';
    showLoginModal();
};

document.addEventListener('DOMContentLoaded', () => {
    // Booking Modal Tab Switching
    const tabLogin = document.getElementById('booking-tab-login');
    const tabRegister = document.getElementById('booking-tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabLogin && tabRegister && loginForm && registerForm) {
        tabLogin.addEventListener('click', () => {
            tabLogin.classList.add('active');
            tabLogin.style.borderBottomColor = 'var(--accent-olive)';
            tabLogin.style.color = 'var(--accent-olive)';
            tabRegister.classList.remove('active');
            tabRegister.style.borderBottomColor = 'transparent';
            tabRegister.style.color = 'var(--text-secondary)';
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
        });

        tabRegister.addEventListener('click', () => {
            tabRegister.classList.add('active');
            tabRegister.style.borderBottomColor = 'var(--accent-olive)';
            tabRegister.style.color = 'var(--accent-olive)';
            tabLogin.classList.remove('active');
            tabLogin.style.borderBottomColor = 'transparent';
            tabLogin.style.color = 'var(--text-secondary)';
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim().toLowerCase();
            const password = document.getElementById('login-password').value;
            const client = getClients().find(c => c.email.toLowerCase() === email && c.password === password);
            const errorMsg = document.getElementById('login-modal-error-msg');
            
            if (client) {
                if (errorMsg) errorMsg.style.display = 'none';
                sessionStorage.setItem('woc_client_email', client.email);
                sessionStorage.setItem('woc_client_name', client.name);
                hideLoginModal();
                autoFillBookingForm(client);
                document.getElementById('booking-form-wrapper').classList.remove('disabled');
                document.getElementById('login-required-msg').style.display = 'none';
            } else {
                if (errorMsg) {
                    errorMsg.style.display = 'block';
                } else {
                    alert('Invalid credentials. Please try again.');
                }
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value.trim();
            const phone = document.getElementById('register-phone').value.trim();
            const email = document.getElementById('register-email').value.trim().toLowerCase();
            const password = document.getElementById('register-password').value;
            
            const clients = getClients();
            const exists = clients.find(c => c.email.toLowerCase() === email);
            const errorMsg = document.getElementById('register-modal-error-msg');
            
            if (exists) {
                if (errorMsg) errorMsg.style.display = 'block';
            } else {
                if (errorMsg) errorMsg.style.display = 'none';
                const newClient = { name, phone, email, password };
                clients.push(newClient);
                localStorage.setItem('whiteoak_clients', JSON.stringify(clients));
                
                // Auto login
                sessionStorage.setItem('woc_client_email', email);
                sessionStorage.setItem('woc_client_name', name);
                
                hideLoginModal();
                autoFillBookingForm(newClient);
                document.getElementById('booking-form-wrapper').classList.remove('disabled');
                document.getElementById('login-required-msg').style.display = 'none';
            }
        });
    }

    const resetBtn = document.getElementById('reset-password-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            if (!email) {
                alert('Please enter your email address to receive a password reset link.');
            } else {
                alert(`Password reset link has been sent to ${email}`);
            }
        });
    }

    const googleBtn = document.getElementById('google-login-btn');
    if (googleBtn) {
        googleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Google authentication will be connected at a later stage.');
        });
    }

    const googleRegisterBtn = document.getElementById('google-register-btn');
    if (googleRegisterBtn) {
        googleRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Google authentication will be connected at a later stage.');
        });
    }

    const closeBtn = document.getElementById('close-login-modal-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            hideLoginModal();
        });
    }

    const formWrapper = document.getElementById('booking-form-wrapper');
    if (formWrapper) {
        formWrapper.addEventListener('click', (e) => {
            if (formWrapper.classList.contains('disabled')) {
                showLoginModal();
            }
        });
    }

    const msg = document.getElementById('login-required-msg');
    if (msg) {
        msg.addEventListener('click', () => {
            showLoginModal();
        });
    }
    
    // Check auth on page load (specifically for booking.html)
    if (window.location.pathname.includes('booking.html')) {
        initAuth();
    }
});

// Real-time cross-tab storage sync
window.addEventListener('storage', (e) => {
    if (e.key === 'whiteoak_bookings' || e.key === 'whiteoak_holds') {
        const selectedDateInput = document.getElementById('event-date');
        if (typeof updateDateAlertAndSlots === 'function' && selectedDateInput && selectedDateInput.value) {
            updateDateAlertAndSlots();
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


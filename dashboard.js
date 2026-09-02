/* ==========================================================================
   CUSTOMER DASHBOARD CONTROLLER JAVASCRIPT
   ========================================================================== */

// Initial Mock Databases in LocalStorage to maintain updates on reloads
const DEFAULT_VEHICLES = [
  { plate: "S-911-GT3", make: "Porsche", model: "911 GT3 RS", type: "Sports", color: "Chalk Grey", isDefault: true },
  { plate: "M-AMG-E63", make: "Mercedes", model: "AMG E63 S", type: "Sedan", color: "Obsidian Black", isDefault: false }
];

const DEFAULT_BOOKINGS = [
  { id: "OPK-79284", facility: "Airport Terminal 3 Plaza", slot: "A-203", vehicle: "Porsche 911 (S-911-GT3)", date: "2026-08-14", duration: "1 Day", amount: 28.00, status: "Active" },
  { id: "OPK-51093", facility: "Downtown Commercial Plaza", slot: "B-108", vehicle: "Mercedes AMG (M-AMG-E63)", date: "2026-08-16", duration: "4 Hours", amount: 18.00, status: "Upcoming" }
];

const DEFAULT_INVOICES = [
  { no: "INV-2026-804", date: "2026-08-14", desc: "Daily Parking Reservation (OPK-79284)", amount: 28.00, method: "Visa (•••• 4820)", status: "Paid" },
  { no: "INV-2026-791", date: "2026-08-12", desc: "Monthly Storage Vault Renewal (August)", amount: 450.00, method: "Visa (•••• 4820)", status: "Paid" },
  { no: "INV-2026-752", date: "2026-08-01", desc: "Downtown Commuter Slot (OPK-51093)", amount: 18.00, method: "Visa (•••• 4820)", status: "Paid" }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 1, title: "Booking Confirmed", text: "Your upcoming slot reservation at Downtown Plaza is locked in.", time: "2 hours ago", type: "unread", icon: "fa-circle-check" },
  { id: 2, title: "Daily Check Completed", text: "Porsche 911 climate metrics are within normal specifications.", time: "1 day ago", type: "read", icon: "fa-heart-pulse" },
  { id: 3, title: "Invoice Paid", text: "Payment of $450.00 for monthly storage was successfully processed.", time: "2 days ago", type: "read", icon: "fa-file-invoice-dollar" }
];

// Initialize localStorage wrapper
function getDb(key, defaultData) {
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify(defaultData));
  }
  return JSON.parse(localStorage.getItem(key));
}

function setDb(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Global dashboard state
let vehicles = getDb('op_vehicles', DEFAULT_VEHICLES);
let bookings = getDb('op_bookings', DEFAULT_BOOKINGS);
let invoices = getDb('op_invoices', DEFAULT_INVOICES);
let notifications = getDb('op_notifications', DEFAULT_NOTIFICATIONS);

document.addEventListener('DOMContentLoaded', () => {
  initDashboardTabs();
  initVehiclesPanel();
  initReservationsPanel();
  initPassesPanel();
  initStoragePanel();
  initBillingPanel();
  initNotificationsPanel();
  initSupportFAQ();
  initBookingWizard();
  
  // Load query params redirects
  handleQueryParams();
  
  // Render Overview dynamic content
  renderOverviewPanel();
  
  // Sidebar responsive mobile close on tab click
  const sidebarItems = document.querySelectorAll('.sidebar-item');
  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        document.getElementById('dashboard-sidebar').classList.remove('active');
      }
    });
  });

  // Sidebar toggle for mobile sizes
  const sidebarToggle = document.getElementById('sidebar-toggle-btn');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      document.getElementById('dashboard-sidebar').classList.add('active');
    });
  }
  document.addEventListener('click', (e) => {
    const sidebar = document.getElementById('dashboard-sidebar');
    if (sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== sidebarToggle) {
      sidebar.classList.remove('active');
    }
  });

  // Logout click redirect
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});

/**
 * Tab Switching Navigation Routing
 */
function initDashboardTabs() {
  const sidebarItems = document.querySelectorAll('.sidebar-menu .sidebar-item');
  const panels = document.querySelectorAll('.dashboard-panel');
  const titleText = document.getElementById('dashboard-title-text');
  
  function switchTab(tabId) {
    sidebarItems.forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
    
    panels.forEach(panel => {
      if (panel.id === `panel-${tabId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });
    
    // Update top header title text
    if (titleText) {
      titleText.textContent = tabId.charAt(0).toUpperCase() + tabId.slice(1).replace('-', ' ');
    }
  }

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Generic triggers (e.g. clicking user profile widgets switches tab)
  const quickAlertBtn = document.getElementById('quick-alert-btn');
  if (quickAlertBtn) {
    quickAlertBtn.addEventListener('click', () => switchTab('notifications'));
  }
  
  const userProfileWidget = document.getElementById('user-profile-widget');
  if (userProfileWidget) {
    userProfileWidget.addEventListener('click', () => switchTab('settings'));
  }
}

/**
 * Handle URL Parameter transitions on page load
 */
function handleQueryParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');
  if (tab) {
    // Switch to target tab
    const sidebarItem = document.querySelector(`.sidebar-item[data-tab="${tab}"]`);
    if (sidebarItem) sidebarItem.click();
    
    // Check if slot details are passed for Booking wizard
    const slot = urlParams.get('slot');
    if (tab === 'book' && slot) {
      // Preset Step 1 & 2 values for quick progression
      document.getElementById('wiz-date').value = "2026-08-15";
      document.getElementById('wiz-time').value = "10:00";
      // Auto move step to 3 to select slot A-102
      setTimeout(() => {
        const nextBtn = document.getElementById('wizard-next-btn');
        if (nextBtn) {
          nextBtn.click(); // go to Step 2
          nextBtn.click(); // go to Step 3 (render and auto highlight slot)
        }
      }, 300);
    }
  }
}

/**
 * Overview Panel Dynamic rendering
 */
function renderOverviewPanel() {
  const tbody = document.getElementById('overview-activity-tbody');
  if (!tbody) return;
  tbody.innerHTML = '';
  
  // Render latest 3 bookings/activities
  const displayItems = bookings.slice(0, 3);
  displayItems.forEach(item => {
    const tr = document.createElement('tr');
    
    let statusClass = 'badge-success';
    if (item.status === 'Upcoming') statusClass = 'badge-info';
    if (item.status === 'Cancelled') statusClass = 'badge-danger';
    
    tr.innerHTML = `
      <td><strong>${item.id}</strong></td>
      <td>${item.facility}</td>
      <td><span class="badge badge-accent">${item.slot}</span></td>
      <td>${item.date}</td>
      <td>$${parseFloat(item.amount).toFixed(2)}</td>
      <td><span class="badge ${statusClass}"><span class="badge-dot"></span> ${item.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
  
  // Update overview widgets dynamic text fields
  const activePass = bookings.find(b => b.status === 'Active');
  const activePassWidget = document.getElementById('widget-active-pass-id');
  if (activePassWidget) {
    activePassWidget.textContent = activePass ? activePass.slot : 'None';
  }
  
  // Sync unread notification count badge in header top bar
  const headerUnreadDot = document.querySelector('.notification-badge');
  if (headerUnreadDot) {
    const unreadCount = notifications.filter(n => n.type === 'unread').length;
    headerUnreadDot.style.display = unreadCount > 0 ? 'block' : 'none';
  }
}

/**
 * Vehicles Panel Logic (CRUD)
 */
function initVehiclesPanel() {
  const grid = document.getElementById('vehicles-container-grid');
  const addModal = document.getElementById('add-vehicle-modal');
  const addForm = document.getElementById('add-vehicle-form');
  const closeBtn = document.getElementById('modal-close-btn-x');
  
  function renderVehicles() {
    if (!grid) return;
    grid.innerHTML = '';
    
    vehicles.forEach((car, index) => {
      const card = document.createElement('div');
      card.className = 'glass-card vehicle-card';
      
      let badgeTypeClass = 'badge-accent';
      let icon = 'fa-car';
      if (car.type === 'Sports') icon = 'fa-gauge-high';
      if (car.type === 'EV') icon = 'fa-bolt';
      
      card.innerHTML = `
        <div class="vehicle-card-header">
          <div class="vehicle-icon-box"><i class="fas ${icon}"></i></div>
          <div>
            ${car.isDefault ? `<span class="badge badge-success">Default</span>` : `<button class="btn btn-secondary set-default-btn" style="padding:0.25rem 0.5rem; font-size:0.7rem;" data-index="${index}">Set Default</button>`}
          </div>
        </div>
        <div class="vehicle-plate">${car.plate}</div>
        <h4 style="font-size:1.1rem; margin-bottom:0.5rem;">${car.make} ${car.model}</h4>
        <ul class="vehicle-details-list">
          <li>Type: <span>${car.type}</span></li>
          <li>Color: <span>${car.color}</span></li>
        </ul>
        <button class="btn btn-secondary remove-vehicle-btn" style="width:100%; margin-top:1.5rem; padding:0.4rem 1rem; border-color:var(--color-danger); color:var(--color-danger);" data-index="${index}"><i class="fas fa-trash"></i> Remove Vehicle</button>
      `;
      
      grid.appendChild(card);
    });
    
    // Append the "Add Vehicle" dashed card trigger
    const addCard = document.createElement('div');
    addCard.className = 'glass-card add-vehicle-btn-card';
    addCard.innerHTML = `
      <i class="fas fa-circle-plus" style="font-size:2.5rem;"></i>
      <h4 style="font-weight:600;">Register Vehicle</h4>
    `;
    addCard.addEventListener('click', () => {
      addModal.classList.add('active');
    });
    grid.appendChild(addCard);
    
    // Bind click events for default and remove triggers
    document.querySelectorAll('.set-default-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'));
        vehicles.forEach((c, i) => c.isDefault = i === idx);
        setDb('op_vehicles', vehicles);
        renderVehicles();
        renderOverviewPanel();
      });
    });

    document.querySelectorAll('.remove-vehicle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'));
        if (confirm(`Remove vehicle ${vehicles[idx].plate} from your account registry?`)) {
          vehicles.splice(idx, 1);
          setDb('op_vehicles', vehicles);
          renderVehicles();
        }
      });
    });
  }

  renderVehicles();

  // Modal actions
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      addModal.classList.remove('active');
    });
  }

  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newCar = {
        plate: document.getElementById('veh-plate').value.toUpperCase(),
        make: document.getElementById('veh-make').value,
        model: document.getElementById('veh-model').value,
        type: document.getElementById('veh-type').value,
        color: document.getElementById('veh-color').value,
        isDefault: vehicles.length === 0
      };
      
      vehicles.push(newCar);
      setDb('op_vehicles', vehicles);
      addForm.reset();
      addModal.classList.remove('active');
      renderVehicles();
      
      // Update booking wizard options dropdowns if open
      initBookingWizardDropdowns();
    });
  }
}

/**
 * Populate Wizard vehicle dropdown inputs dynamically
 */
function initBookingWizardDropdowns() {
  const wizardVehicleSel = document.getElementById('wiz-vehicle');
  if (!wizardVehicleSel) return;
  wizardVehicleSel.innerHTML = '';
  
  vehicles.forEach(car => {
    const opt = document.createElement('option');
    opt.value = `${car.make} ${car.model} (${car.plate})`;
    opt.textContent = `${car.make} ${car.model} - [${car.plate}]`;
    if (car.isDefault) opt.selected = true;
    wizardVehicleSel.appendChild(opt);
  });
}

/**
 * Reservations Panel Operations (Modify/Cancel)
 */
function initReservationsPanel() {
  const tbody = document.getElementById('reservations-table-tbody');
  const viewAllBtn = document.getElementById('overview-view-all-bookings-btn');
  
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      const resTab = document.querySelector('.sidebar-item[data-tab="reservations"]');
      if (resTab) resTab.click();
    });
  }

  function renderReservations() {
    if (!tbody) return;
    tbody.innerHTML = '';
    
    bookings.forEach((booking, idx) => {
      const tr = document.createElement('tr');
      
      let statusClass = 'badge-success';
      if (booking.status === 'Upcoming') statusClass = 'badge-info';
      if (booking.status === 'Cancelled') statusClass = 'badge-danger';
      
      tr.innerHTML = `
        <td><strong>${booking.id}</strong></td>
        <td>${booking.facility}</td>
        <td><span class="badge badge-accent">${booking.slot}</span></td>
        <td>${booking.vehicle}</td>
        <td>${booking.date}</td>
        <td>${booking.duration}</td>
        <td>$${parseFloat(booking.amount).toFixed(2)}</td>
        <td><span class="badge ${statusClass}"><span class="badge-dot"></span> ${booking.status}</span></td>
        <td>
          <div class="flex" style="gap:0.5rem;">
            ${booking.status !== 'Cancelled' ? `
              <button class="table-action-btn view-pass-btn" data-id="${booking.id}"><i class="fas fa-qrcode"></i> Pass</button>
              <button class="table-action-btn modify-res-btn" data-index="${idx}"><i class="fas fa-pen"></i> Adjust</button>
              <button class="table-action-btn cancel-res-btn" style="color:var(--color-danger); border-color:var(--color-danger);" data-index="${idx}"><i class="fas fa-ban"></i> Cancel</button>
            ` : `<span style="color:var(--text-muted); font-size:0.8rem; font-style:italic;">No Actions Available</span>`}
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Event triggers
    document.querySelectorAll('.view-pass-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const passesTab = document.querySelector('.sidebar-item[data-tab="passes"]');
        if (passesTab) passesTab.click();
      });
    });

    document.querySelectorAll('.modify-res-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const newDate = prompt("Enter new reservation date (YYYY-MM-DD):", bookings[idx].date);
        if (newDate) {
          bookings[idx].date = newDate;
          setDb('op_bookings', bookings);
          renderReservations();
          renderOverviewPanel();
          initPassesPanel();
        }
      });
    });

    document.querySelectorAll('.cancel-res-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        if (confirm(`Are you sure you want to cancel booking ${bookings[idx].id}?`)) {
          bookings[idx].status = 'Cancelled';
          setDb('op_bookings', bookings);
          renderReservations();
          renderOverviewPanel();
          initPassesPanel();
        }
      });
    });
  }

  renderReservations();
  
  const resMakeBookingBtn = document.getElementById('res-make-booking-btn');
  if (resMakeBookingBtn) {
    resMakeBookingBtn.addEventListener('click', () => {
      const bookTab = document.querySelector('.sidebar-item[data-tab="book"]');
      if (bookTab) bookTab.click();
    });
  }
}

/**
 * QR Passes Panel Loader
 */
function initPassesPanel() {
  const passesGrid = document.getElementById('passes-container-grid');
  const overviewGoBtn = document.getElementById('overview-go-passes-btn');
  
  if (overviewGoBtn) {
    overviewGoBtn.addEventListener('click', () => {
      const passesTab = document.querySelector('.sidebar-item[data-tab="passes"]');
      if (passesTab) passesTab.click();
    });
  }

  function renderPasses() {
    if (!passesGrid) return;
    passesGrid.innerHTML = '';
    
    const activeBookings = bookings.filter(b => b.status !== 'Cancelled');
    
    if (activeBookings.length === 0) {
      passesGrid.innerHTML = `<div style="grid-column: span 3; text-align:center; padding:3rem; color:var(--text-secondary);">No active entry passes generated. Reserve parking slots to create QR passes.</div>`;
      return;
    }
    
    activeBookings.forEach((pass, index) => {
      const card = document.createElement('div');
      card.className = 'glass-card entry-pass-card';
      
      let passStatusClass = 'badge-success';
      if (pass.status === 'Upcoming') passStatusClass = 'badge-info';
      
      card.innerHTML = `
        <div class="flex justify-between align-center" style="margin-bottom:1.5rem;">
          <h4 style="font-size:1.1rem; font-weight:600;"><i class="fas fa-qrcode text-accent"></i> Entry Pass</h4>
          <span class="badge ${passStatusClass}"><span class="badge-dot"></span> ${pass.status}</span>
        </div>
        
        <div class="pass-qr-mockup">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PARKSHIELD-${pass.id}-${pass.slot}" alt="QR Entry code">
        </div>
        
        <h5 style="font-family:monospace; font-size:1.15rem; margin-bottom:1.5rem;">${pass.id}</h5>
        
        <div class="pass-field-grid grid">
          <div class="pass-field">
            <h5>Facility</h5>
            <p style="font-size:0.85rem;">${pass.facility.replace('Terminal 3', 'T3')}</p>
          </div>
          <div class="pass-field">
            <h5>Assigned Slot</h5>
            <p>${pass.slot}</p>
          </div>
          <div class="pass-field">
            <h5>Vehicle</h5>
            <p style="font-size:0.85rem;">${pass.vehicle}</p>
          </div>
          <div class="pass-field">
            <h5>Duration</h5>
            <p>${pass.duration}</p>
          </div>
        </div>
        
        <div class="flex" style="gap:0.75rem;">
          <button class="btn btn-primary extend-pass-btn" style="flex:1; padding:0.6rem; font-size:0.85rem;" data-index="${index}">Extend Stay</button>
          <a href="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=PARKSHIELD-${pass.id}" target="_blank" download class="btn btn-secondary" style="flex:1; padding:0.6rem; font-size:0.85rem;"><i class="fas fa-download"></i> Save Pass</a>
        </div>
      `;
      passesGrid.appendChild(card);
    });

    // Handle extend stay pricing trigger
    document.querySelectorAll('.extend-pass-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const hours = prompt("How many hours would you like to extend your reservation pass?", "2");
        if (hours) {
          const cost = parseInt(hours) * 4.50;
          if (confirm(`Extend stay by ${hours} hours? Your card ending in 4820 will be billed $${cost.toFixed(2)}.`)) {
            // Update databases
            alert("Reservation pass updated and extended successfully!");
            
            // Add invoice transaction
            const now = new Date();
            const dateStr = now.toISOString().slice(0,10);
            const newInv = {
              no: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
              date: dateStr,
              desc: `Extension Billing (${hours} hours - ${activeBookings[idx].id})`,
              amount: cost,
              method: "Visa (•••• 4820)",
              status: "Paid"
            };
            invoices.unshift(newInv);
            setDb('op_invoices', invoices);
            
            // Update active reservation pass text duration display
            activeBookings[idx].duration = activeBookings[idx].duration + ` (+${hours}h)`;
            activeBookings[idx].amount += cost;
            setDb('op_bookings', bookings);
            
            initPassesPanel();
            initBillingPanel();
            renderOverviewPanel();
          }
        }
      });
    });
  }

  renderPasses();
}

/**
 * Storage Vault Summary Panel
 */
function initStoragePanel() {
  const storageGrid = document.getElementById('storage-container-grid');
  
  function renderStorage() {
    if (!storageGrid) return;
    storageGrid.innerHTML = '';
    
    // Simulated active storage slots
    const storageItem = {
      vault: "Vault Room 02, Bay 14",
      vehicle: "Porsche 911 GT3 RS (S-911-GT3)",
      type: "Premium Storage Vault Vaults",
      start: "2026-08-12",
      end: "2026-11-12",
      cost: 450.00,
      renewStatus: "Auto-Renew active",
      battery: "13.4V (Healthy)",
      humidity: "48.2% RH"
    };

    const card = document.createElement('div');
    card.className = 'glass-card';
    card.style.padding = '2rem';
    card.style.gridColumn = 'span 3';
    card.style.maxWidth = '750px';
    card.style.margin = '0 auto';
    
    card.innerHTML = `
      <div class="flex justify-between align-center" style="margin-bottom:1.5rem;">
        <h3 style="font-size:1.3rem;"><i class="fas fa-vault text-accent"></i> Climate Vault Storage Registry</h3>
        <span class="badge badge-accent"><span class="badge-dot"></span> Active Intake</span>
      </div>

      <div class="grid" style="grid-template-columns:1fr 1fr; gap:2rem; margin-bottom:2rem;">
        <div>
          <h4 style="font-size:1rem; margin-bottom:0.75rem; color:var(--text-secondary);">Storage Allocation Parameters</h4>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.9rem; color:var(--text-secondary);">
            <li>Intake Location: <strong class="text-primary">${storageItem.vault}</strong></li>
            <li>Vehicle Reg: <strong class="text-primary">${storageItem.vehicle}</strong></li>
            <li>Vault Category: <strong class="text-primary">${storageItem.type}</strong></li>
            <li>Intake Date: <strong class="text-primary">${storageItem.start}</strong></li>
            <li>Release Date: <strong class="text-primary">${storageItem.end}</strong></li>
          </ul>
        </div>
        
        <div>
          <h4 style="font-size:1rem; margin-bottom:0.75rem; color:var(--text-secondary);">Live Diagnostics Telemetry</h4>
          <ul style="list-style:none; display:flex; flex-direction:column; gap:0.5rem; font-size:0.9rem; color:var(--text-secondary);">
            <li>Battery Voltage: <strong style="color:var(--color-success);"><i class="fas fa-battery-three-quarters"></i> ${storageItem.battery}</strong></li>
            <li>Environmental Humidity: <strong class="text-primary">${storageItem.humidity}</strong></li>
            <li>Automatic Billing: <strong class="text-primary">$${storageItem.cost.toFixed(2)} / month</strong></li>
            <li>Billing renewal: <strong style="color:var(--color-success);">${storageItem.renewStatus}</strong></li>
          </ul>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap:1rem; width:100%;">
        <button class="btn btn-primary" id="extend-storage-btn" style="width:100%;">Extend Storage Plan</button>
        <button class="btn btn-secondary" id="checkout-storage-btn" style="width:100%; border-color:var(--color-amber); color:var(--color-amber);">Request Vehicle Checkout</button>
      </div>
    `;

    storageGrid.appendChild(card);
    
    // Bind buttons actions
    const extendBtn = document.getElementById('extend-storage-btn');
    if (extendBtn) {
      extendBtn.addEventListener('click', () => {
        alert("Storage plan extended by 1 month successfully. Next billing transaction auto-renew set for Nov 12.");
      });
    }

    const checkoutBtn = document.getElementById('checkout-storage-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (confirm("Confirm vehicle checkout release request? detailing crew will prep your vehicle within 12 hours.")) {
          alert("Checkout ticket opened successfully. You will receive an SMS pass notification when vehicle aligns at intake doors.");
        }
      });
    }
  }

  renderStorage();
}

/**
 * Billing & payments Invoices List
 */
function initBillingPanel() {
  const tbody = document.getElementById('invoices-table-tbody');
  
  function renderInvoices() {
    if (!tbody) return;
    tbody.innerHTML = '';
    
    invoices.forEach(inv => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${inv.no}</strong></td>
        <td>${inv.date}</td>
        <td>${inv.desc}</td>
        <td>$${parseFloat(inv.amount).toFixed(2)}</td>
        <td>${inv.method}</td>
        <td><span class="badge badge-success"><span class="badge-dot"></span> ${inv.status}</span></td>
        <td>
          <button class="table-action-btn" onclick="alert('Downloading receipt document format (PDF)...')"><i class="fas fa-file-pdf"></i> Receipt</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderInvoices();
  
  // Render spending charts (native bars)
  const chartBox = document.getElementById('billing-spending-chart');
  if (chartBox) {
    chartBox.innerHTML = '';
    const monthsData = [
      { m: "May", v: 120 },
      { m: "Jun", v: 180 },
      { m: "Jul", v: 240 },
      { m: "Aug", v: 384.50 }
    ];
    
    const maxVal = Math.max(...monthsData.map(d => d.v));
    
    monthsData.forEach(d => {
      const percent = (d.v / maxVal) * 80; // keep max bar height within 80% wrapper boundaries
      
      const barWrapper = document.createElement('div');
      barWrapper.className = 'chart-bar-wrapper';
      
      barWrapper.innerHTML = `
        <div class="chart-bar" style="height:${percent}%;">
          <div class="chart-bar-value">$${parseFloat(d.v).toFixed(0)}</div>
        </div>
        <span class="chart-bar-label">${d.m}</span>
      `;
      
      chartBox.appendChild(barWrapper);
    });
  }
}

/**
 * System Alerts notifications panel
 */
function initNotificationsPanel() {
  const container = document.getElementById('notifications-container-list');
  const clearBtn = document.getElementById('alert-clear-all-btn');
  
  function renderNotifications() {
    if (!container) return;
    container.innerHTML = '';
    
    if (notifications.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:var(--text-secondary); padding:2rem;">No system notifications logged.</p>`;
      return;
    }
    
    notifications.forEach(item => {
      const block = document.createElement('div');
      let itemTypeClass = 'notification-item';
      if (item.type === 'unread') itemTypeClass += ' alert-unread';
      
      block.className = itemTypeClass;
      block.innerHTML = `
        <div class="notification-icon-wrapper">
          <i class="fas ${item.icon} text-accent"></i>
        </div>
        <div class="notification-text">
          <h4>${item.title}</h4>
          <p>${item.text}</p>
          <span>${item.time}</span>
        </div>
      `;
      container.appendChild(block);
    });
  }

  renderNotifications();
  
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      notifications.forEach(n => n.type = 'read');
      setDb('op_notifications', notifications);
      renderNotifications();
      renderOverviewPanel();
    });
  }
}

/**
 * FAQ accordions support list interaction
 */
function initSupportFAQ() {
  const listItems = document.querySelectorAll('#support-faq-accordion > div');
  listItems.forEach(item => {
    item.addEventListener('click', () => {
      const p = item.querySelector('p');
      const icon = item.querySelector('i');
      if (p) {
        const isHidden = p.style.display === 'none' || !p.style.display;
        p.style.display = isHidden ? 'block' : 'none';
        icon.className = isHidden ? 'fas fa-chevron-up' : 'fas fa-chevron-down';
      }
    });
  });
  
  const ticketForm = document.getElementById('support-ticket-form');
  if (ticketForm) {
    ticketForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert("Support Ticket created successfully! Technical agents will reply in 15 minutes.");
      ticketForm.reset();
    });
  }
}

/**
 * Multi-Step Booking Wizard Logic
 */
let wizardStep = 1;
const wizardState = {
  facility: 'airport-t3',
  date: '2026-08-15',
  time: '10:00',
  duration: '1 Day',
  durationHours: 24,
  vehicle: '',
  slot: '',
  price: 28.00
};

// Mock slot layouts configurations
const WIZ_FACILITY_SLOTS = {
  'airport-t3': [
    { id: "A-201", type: "available", price: 28.00, sur: 0 },
    { id: "A-202", type: "occupied", price: 28.00, sur: 0 },
    { id: "A-203", type: "available", price: 34.00, sur: 6 }, // EV charger
    { id: "A-204", type: "occupied", price: 28.00, sur: 0 },
    { id: "A-205", type: "premium", price: 38.00, sur: 10 }, // VIP spot
    { id: "A-206", type: "available", price: 28.00, sur: 0 },
    { id: "A-207", type: "occupied", price: 28.00, sur: 0 },
    { id: "A-208", type: "available", price: 34.00, sur: 6 }  // EV charger
  ],
  'downtown-plaza': [
    { id: "B-101", type: "occupied", price: 18.00, sur: 0 },
    { id: "B-102", type: "available", price: 18.00, sur: 0 },
    { id: "B-103", type: "available", price: 18.00, sur: 0 },
    { id: "B-104", type: "occupied", price: 22.00, sur: 4 }, // EV Row
    { id: "B-105", type: "occupied", price: 25.00, sur: 7 }, // Premium Row
    { id: "B-106", type: "available", price: 18.00, sur: 0 },
    { id: "B-107", type: "available", price: 18.00, sur: 0 },
    { id: "B-108", type: "available", price: 18.00, sur: 0 }
  ]
};

function initBookingWizard() {
  const prevBtn = document.getElementById('wizard-prev-btn');
  const nextBtn = document.getElementById('wizard-next-btn');
  
  if (!nextBtn || !prevBtn) return;
  
  // Set default initial dropdown vehicles registry option list
  initBookingWizardDropdowns();

  // Facility choice triggers
  const facilityCards = document.querySelectorAll('.facility-select-card');
  facilityCards.forEach(card => {
    card.addEventListener('click', () => {
      facilityCards.forEach(c => {
        c.classList.remove('active');
        c.style.borderColor = 'var(--border-color)';
      });
      card.classList.add('active');
      card.style.borderColor = 'var(--color-accent)';
      wizardState.facility = card.getAttribute('data-facility');
    });
  });

  // Wizard navigation controller clicks
  nextBtn.addEventListener('click', () => {
    if (wizardStep === 1) {
      // Proceed to Step 2
      wizardStep = 2;
      showWizardPanel(wizardStep);
    } else if (wizardStep === 2) {
      // Save Step 2 values
      wizardState.date = document.getElementById('wiz-date').value;
      wizardState.time = document.getElementById('wiz-time').value;
      
      const durationSelect = document.getElementById('wiz-duration');
      wizardState.duration = durationSelect.options[durationSelect.selectedIndex].text.split(' (')[0];
      wizardState.durationHours = parseInt(durationSelect.value);
      
      wizardState.vehicle = document.getElementById('wiz-vehicle').value || 'Default Registered Vehicle';
      
      // Render interactive parking grid floor based on facility
      renderWizardSlotsMap();
      
      wizardStep = 3;
      showWizardPanel(wizardStep);
    } else if (wizardStep === 3) {
      // Require slot choice selection before proceeding
      if (!wizardState.slot) {
        alert("Please select an available parking slot from the floor map grid.");
        return;
      }
      
      // Proceed to Step 4 confirm layout summary
      populateWizardConfirmSummary();
      
      wizardStep = 4;
      showWizardPanel(wizardStep);
      nextBtn.innerHTML = '<i class="fas fa-check-circle"></i> Complete Booking';
    } else if (wizardStep === 4) {
      // Completed, push reservation database
      completeWizardBooking();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (wizardStep > 1) {
      wizardStep--;
      showWizardPanel(wizardStep);
      nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
    }
  });
}

function showWizardPanel(step) {
  const panels = document.querySelectorAll('.wizard-panel');
  const nodes = document.querySelectorAll('.wizard-step-node');
  const prevBtn = document.getElementById('wizard-prev-btn');
  
  panels.forEach((p, idx) => {
    p.classList.toggle('active', (idx + 1) === step);
  });
  
  nodes.forEach((node, idx) => {
    node.classList.toggle('active', (idx + 1) === step);
    node.classList.toggle('completed', (idx + 1) < step);
  });
  
  // Previous button visibility rules
  if (step === 1) {
    prevBtn.style.opacity = '0';
    prevBtn.style.pointerEvents = 'none';
  } else {
    prevBtn.style.opacity = '1';
    prevBtn.style.pointerEvents = 'auto';
  }
}

/**
 * Render visual slots map in Step 3
 */
function renderWizardSlotsMap() {
  const container = document.getElementById('wizard-slots-grid');
  if (!container) return;
  container.innerHTML = '';
  
  const slotsList = WIZ_FACILITY_SLOTS[wizardState.facility];
  slotsList.forEach(slot => {
    const slotCard = document.createElement('div');
    slotCard.className = `parking-slot-card ${slot.type}`;
    slotCard.setAttribute('data-wiz-slot-id', slot.id);
    
    let iconClass = 'fa-car';
    let label = 'Standard';
    if (slot.id.includes('203') || slot.id.includes('208') || slot.id.includes('104')) {
      slotCard.className = 'parking-slot-card ev';
      iconClass = 'fa-bolt';
      label = 'EV';
    } else if (slot.id.includes('205') || slot.id.includes('105')) {
      slotCard.className = 'parking-slot-card premium';
      iconClass = 'fa-crown';
      label = 'Premium';
    }
    
    slotCard.innerHTML = `
      <span class="slot-name">${slot.id}</span>
      <i class="fas ${iconClass} slot-status-icon"></i>
      <span class="slot-badge-type" style="background:rgba(255,255,255,0.06); font-size:0.55rem; padding:0.1rem 0.25rem; border-radius:3px;">${label}</span>
    `;
    
    if (slot.type !== 'occupied') {
      slotCard.addEventListener('click', () => {
        document.querySelectorAll('#wizard-slots-grid .parking-slot-card').forEach(card => card.classList.remove('selected'));
        slotCard.classList.add('selected');
        
        wizardState.slot = slot.id;
        
        // Calculate price based on duration hours & slot base/surcharge rates
        let baseRate = wizardState.facility === 'airport-t3' ? 28.00 : 18.00;
        if (wizardState.durationHours < 24) {
          baseRate = wizardState.durationHours * (wizardState.facility === 'airport-t3' ? 4.50 : 3.00);
        } else {
          baseRate = (wizardState.durationHours / 24) * (wizardState.facility === 'airport-t3' ? 28.00 : 18.00);
        }
        wizardState.price = baseRate + slot.sur;
      });
    }
    
    container.appendChild(slotCard);
  });
  
  // Clear selected slot state
  wizardState.slot = '';
}

function populateWizardConfirmSummary() {
  const facName = wizardState.facility === 'airport-t3' ? 'Airport Terminal 3 Plaza' : 'Downtown Commercial Plaza';
  document.getElementById('conf-facility').textContent = facName;
  document.getElementById('conf-date').textContent = wizardState.date;
  document.getElementById('conf-time').textContent = wizardState.time;
  document.getElementById('conf-duration').textContent = wizardState.duration;
  document.getElementById('conf-vehicle').textContent = wizardState.vehicle;
  document.getElementById('conf-slot').textContent = wizardState.slot;
  document.getElementById('conf-cost').textContent = `$${parseFloat(wizardState.price).toFixed(2)}`;
}

function completeWizardBooking() {
  const facName = wizardState.facility === 'airport-t3' ? 'Airport Terminal 3 Plaza' : 'Downtown Commercial Plaza';
  
  const newBooking = {
    id: `OPK-${Math.floor(10000 + Math.random() * 90000)}`,
    facility: facName,
    slot: wizardState.slot,
    vehicle: wizardState.vehicle,
    date: wizardState.date,
    duration: wizardState.duration,
    amount: wizardState.price,
    status: "Upcoming"
  };
  
  // Add to Bookings database
  bookings.unshift(newBooking);
  setDb('op_bookings', bookings);
  
  // Add to Invoices database
  const newInv = {
    no: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
    date: new Date().toISOString().slice(0, 10),
    desc: `Prepaid Parking Reservation (${newBooking.id})`,
    amount: wizardState.price,
    method: "Visa (•••• 4820)",
    status: "Paid"
  };
  invoices.unshift(newInv);
  setDb('op_invoices', invoices);
  
  // Add Alert notification
  const alertItem = {
    id: Date.now(),
    title: "Booking Confirmed",
    text: `Your reservation pass ${newBooking.id} for slot ${newBooking.slot} is ready.`,
    time: "Just now",
    type: "unread",
    icon: "fa-circle-check"
  };
  notifications.unshift(alertItem);
  setDb('op_notifications', notifications);
  
  // Reset wizard state
  wizardStep = 1;
  showWizardPanel(1);
  document.getElementById('wizard-next-btn').innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
  
  // Refresh panels outputs
  renderOverviewPanel();
  initReservationsPanel();
  initPassesPanel();
  initBillingPanel();
  initNotificationsPanel();
  
  alert(`Booking successfully confirmed! Your Entry Pass ID is ${newBooking.id}.`);
  
  // Jump to Reservations Tab view
  const resTab = document.querySelector('.sidebar-item[data-tab="reservations"]');
  if (resTab) resTab.click();
}

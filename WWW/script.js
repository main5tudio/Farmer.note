// --- DATA MANAGEMENT WITH LOCALSTORAGE ---
const defaultData = {
    todos: [
        { id: 1, task: "Check irrigation pump", done: false }
    ],
    stocks: [
        { id: 1, name: "Urea Fertilizer", category: "Material", count: 2, unit: "Sacks", minWarning: 5, valuePerUnit: 150000 },
        { id: 2, name: "Pesticide A", category: "Chemical", count: 10, unit: "Liters", minWarning: 3, valuePerUnit: 75000 }
    ],
    plants: [
        {
            id: 1, name: "Sweet Corn", areaSize: "2 Hectares", plantCount: "10,000", targetYield: "4 Tons", 
            harvestCountdown: 45, currentPhase: 3, predictedCost: 2500000,
            phases: [
                { name: "Soil Ready", daysLeft: 0 },
                { name: "Seeding", daysLeft: 0 },
                { name: "Growth", daysLeft: 15 },
                { name: "Stable/Maintain", daysLeft: 30 }
            ]
        }
    ]
};

let appData = {};
let currentActiveTab = 'home';

function initData() {
    const savedData = localStorage.getItem('farmerAppData');
    if (savedData) {
        appData = JSON.parse(savedData);
    } else {
        appData = JSON.parse(JSON.stringify(defaultData));
        saveData();
    }
}

function saveData() {
    localStorage.setItem('farmerAppData', JSON.stringify(appData));
}

function clearData() {
    if(confirm("Are you sure you want to delete all saved data?")) {
        localStorage.removeItem('farmerAppData');
        initData();
        alert("Data reset to defaults!");
    }
}

// --- APP NAVIGATION ---
function enterApp() {
    document.getElementById('signup-screen').classList.remove('active');
    document.getElementById('dashboard-screen').classList.add('active');
    
    const today = new Date();
    document.getElementById('current-date').innerHTML = `${today.getDate()}-${today.getMonth()+1}-${today.getFullYear()}<br>(sync phone)`;
    
    navTab('home', document.querySelector('.tab-item.active'));
}

function navTab(tabName, element) {
    currentActiveTab = tabName;
    
    // Dynamic Header Logic: Hide top blue bar on Finance tab
    const globalHeader = document.getElementById('global-header');
    if(tabName === 'finance') {
        globalHeader.style.display = 'none';
    } else {
        globalHeader.style.display = 'flex';
    }

    if(element) {
        document.querySelectorAll('.tab-item').forEach(el => el.classList.remove('active'));
        element.classList.add('active');
    }
    renderContent();
}

// --- RENDER LOGIC ---
function renderContent() {
    const container = document.getElementById('main-content');
    let html = '';

    if (currentActiveTab === 'home') {
        const lowStocks = appData.stocks.filter(s => s.count <= s.minWarning);
        let stockHtml = '';
        lowStocks.forEach(s => {
            stockHtml += `<div class="stock-alert"><span>⚠️ ${s.name} <span class="tag">${s.category}</span></span> <span>${s.count} ${s.unit} left!</span></div>`;
        });

        let todoHtml = '';
        appData.todos.forEach((todo, index) => {
            todoHtml += `
                <div class="todo-item">
                    <input type="checkbox" class="todo-checkbox" ${todo.done ? 'checked' : ''} onchange="toggleTodo(${index})">
                    <span style="text-decoration: ${todo.done ? 'line-through' : 'none'}; color: ${todo.done ? '#888' : '#333'}">${todo.task}</span>
                    <button onclick="deleteTodo(${index})" style="margin-left:auto; background:none; border:none; color:var(--alert-red); font-weight:bold; padding:5px;">X</button>
                </div>`;
        });

        html = `
            <div class="section-title">Stock Update (Low Warnings)</div>
            <div class="card" style="border-left: 4px solid var(--alert-red);">
                ${stockHtml || '<div style="color: green;">All stocks are healthy!</div>'}
            </div>

            <div class="section-title">To-Do List</div>
            <div class="card">
                ${todoHtml || '<div style="color: #888; text-align:center;">No tasks yet!</div>'}
            </div>
            <button class="fab" onclick="addTodo()">+</button>
        `;

    } else if (currentActiveTab === 'field') {
        let fieldHtml = '';
        appData.plants.forEach(plant => {
            fieldHtml += `
                <div class="card">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h3 style="margin:0; color:var(--primary-purple);">${plant.name}</h3>
                        <span style="font-weight:bold; color:var(--alert-red);">⏳ ${plant.harvestCountdown} days to harvest</span>
                    </div>
                    <p style="font-size:0.85rem; color:#555; margin-top:5px;">
                        Area: <b>${plant.areaSize}</b> | Count: <b>${plant.plantCount}</b> | Target: <b>${plant.targetYield}</b><br>
                        Predicted Material Cost: <b>Rp ${plant.predictedCost.toLocaleString()}</b>
                    </p>
                    
                    <div class="phase-grid">
                        <div class="phase-box ${plant.currentPhase >= 1 ? 'active' : ''}">1. Soil Ready<br><small>${plant.phases[0].daysLeft} days</small></div>
                        <div class="phase-box ${plant.currentPhase >= 2 ? 'active' : ''}">2. Seeding<br><small>${plant.phases[1].daysLeft} days</small></div>
                        <div class="phase-box ${plant.currentPhase >= 3 ? 'active' : ''}">3. Growth<br><small>${plant.phases[2].daysLeft} days</small></div>
                        <div class="phase-box ${plant.currentPhase >= 4 ? 'active' : ''}">4. Maintain<br><small>${plant.phases[3].daysLeft} days</small></div>
                    </div>
                </div>
            `;
        });
        html = `<div class="section-title">Active Plantations</div>${fieldHtml}`;

    } else if (currentActiveTab === 'stock') {
        let stockListHtml = '';
        let totalValue = 0;
        
        appData.stocks.forEach((s, index) => {
            let itemValue = s.count * s.valuePerUnit;
            totalValue += itemValue;
            stockListHtml += `
                <div class="card" style="display:flex; justify-content:space-between; padding: 10px 15px; align-items:center;">
                    <div>
                        <div style="font-weight:bold;">${s.name} <span class="tag">${s.category}</span></div>
                        <div style="font-size:0.8rem; color:#666;">Rp ${s.valuePerUnit.toLocaleString()} / ${s.unit}</div>
                    </div>
                    <div style="text-align:right; display:flex; align-items:center; gap: 15px;">
                        <div>
                            <div style="font-size:1.2rem; font-weight:bold; color:var(--primary-purple);">${s.count}</div>
                            <div style="font-size:0.7rem; color:#888;">= Rp ${itemValue.toLocaleString()}</div>
                        </div>
                        <div style="display:flex; flex-direction:column; gap:5px;">
                            <button onclick="updateStock(${index}, 1)" style="background:#eee; border:none; border-radius:5px; padding:5px 10px;">+</button>
                            <button onclick="updateStock(${index}, -1)" style="background:#eee; border:none; border-radius:5px; padding:5px 10px;">-</button>
                        </div>
                    </div>
                </div>
            `;
        });

        html = `
            <div class="section-title">Material & Inventory</div>
            <div class="card" style="background:var(--primary-purple); color:white; text-align:center;">
                <div style="font-size:0.8rem;">Total Asset Value</div>
                <div style="font-size:1.5rem; font-weight:bold;">Rp ${totalValue.toLocaleString()}</div>
            </div>
            ${stockListHtml}
        `;

    } else if (currentActiveTab === 'finance') {
        html = `
            <div class="finance-header">
                <div class="fh-left">
                    <h2 style="margin:0; font-size: 1.6rem; color:#555;">haji. jono farm</h2>
                    <small style="color: #27ae60; font-weight: bold; cursor: pointer;">karang ploso | malang, east java</small>
                </div>
                <div class="fh-right">
                    <b style="color: #e67e22;">sabtu</b> <b>rainy 24°</b><br>28 maret 2026
                    <div class="weather-grid">
                        <div class="weather-day">🌧️<br>minggu</div>
                        <div class="weather-day">☁️<br>senin</div>
                        <div class="weather-day">🌦️<br>selasa</div>
                    </div>
                </div>
            </div>

            <div style="font-size: 0.85rem; font-weight: bold; margin-bottom: 5px;">nilai aset</div>
            
            <div class="finance-summary">
                <div class="fs-col">
                    <div class="fs-row"><span class="fs-label">asset</span> <span class="fs-val">50 juta</span></div>
                    <div class="fs-row"><span class="fs-label-small">unit</span> <span class="fs-val-small">33 item</span></div>
                </div>
                <div class="fs-col">
                    <div class="fs-row"><span class="fs-label">spent</span> <span class="fs-val">20 juta</span></div>
                    <div class="fs-row"><span class="fs-label-small">on going</span> <span class="fs-val-small" style="color:#c0392b;">10 juta</span></div>
                </div>
                <div class="fs-col">
                    <div class="fs-row"><span class="fs-label" style="color:#2980b9;">karyawan</span> <span class="fs-val">3 orang</span></div>
                    <div class="fs-row"><span class="fs-label-small" style="color:#c0392b;">estimasi</span> <span class="fs-val-small" style="color:#c0392b;">6 juta / bln</span></div>
                </div>
            </div>

            <div style="font-size: 0.85rem; margin-bottom: 10px;">pembelian terakhir</div>
            
            <div class="purchase-item">
                <div style="flex: 1.5;">
                    <b>bibit tomat</b> <br><small style="color:#e67e22;">|bibit|</small>
                </div>
                <div style="flex: 2; font-size: 0.75rem;">
                    1 kg <span style="margin-left: 10px;">15000 / kg</span><br>
                    <span style="color:#c0392b;">koperasi tani maju</span>
                </div>
                <div style="flex: 1; text-align: right; font-weight: bold; font-size: 1rem;">15.000</div>
            </div>
            
            <div class="purchase-item">
                <div style="flex: 1.5;">
                    <b>pupuk urea c</b> <br><small style="color:#e67e22;">|pupuk|</small>
                </div>
                <div style="flex: 2; font-size: 0.75rem;">
                    2 sack <span style="margin-left: 10px;">50.000 / sack</span><br>
                    <span style="color:#c0392b;">komunitas desa</span>
                </div>
                <div style="flex: 1; text-align: right; font-weight: bold; font-size: 1rem;">100.000</div>
            </div>
            
            <hr style="border: 0; border-bottom: 1px solid #333; margin: 20px 0;">

            <div id="contacts-segment" style="margin-top: 30px; margin-bottom: 150px;">
                <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 10px;">The Contacts Profile</div>
                <div class="card">
                    <b>Koperasi Tani Maju</b> - 08123456789 <a href="https://wa.me/628123456789" class="wa-bubble">WA</a><br>
                    <small style="color: #666; display: block; margin-top: 5px;">Note: Supplier bibit area Malang utara. Harga bisa nego jika ambil >10kg.</small>
                </div>
            </div>

            <div class="side-nav-container">
                <div class="side-btn field" onclick="alert('Scroll to field')">🌱</div>
                <div class="side-btn ranch" onclick="alert('Scroll to ranch')">🐄</div>
                <div class="side-btn contact" onclick="document.getElementById('contacts-segment').scrollIntoView({behavior: 'smooth'});">📞</div>
            </div>

            <div class="fab-container">
                <div class="fab-menu" id="fabMenu">
                    <button class="fab-menu-item" onclick="openSheet('addItemSheet')">Add Item</button>
                    <button class="fab-menu-item" onclick="openSheet('addContactSheet')">Add Contact</button>
                </div>
                <button class="fab" style="position:static;" onclick="toggleFabMenu()">+</button>
            </div>

            <div class="sheet-overlay" id="sheetOverlay" onclick="closeSheets()"></div>
            
            <div class="bottom-sheet" id="addItemSheet">
                <button class="close-sheet" onclick="closeSheets()">X</button>
                <h3 style="margin-top: 0; color: #333;">Add New Item</h3>
                <div class="input-group">
                    <label>Item Name</label>
                    <input type="text" placeholder="e.g. Bibit Tomat">
                </div>
                <div class="input-group">
                    <label>Category</label>
                    <select><option>Bibit (Seeds)</option><option>Pupuk (Fertilizer)</option><option>Alat (Tools)</option></select>
                </div>
                <div style="display:flex; gap:10px;">
                    <div class="input-group" style="flex:1;">
                        <label>Qty / Amount</label>
                        <input type="number" placeholder="1">
                    </div>
                    <div class="input-group" style="flex:1;">
                        <label>Price per unit (Rp)</label>
                        <input type="number" placeholder="15000">
                    </div>
                </div>
                <button class="btn-submit" onclick="alert('Item data ready to be saved to logic!'); closeSheets();">Save Purchase</button>
            </div>

            <div class="bottom-sheet" id="addContactSheet">
                <button class="close-sheet" onclick="closeSheets()">X</button>
                <h3 style="margin-top: 0; color: #333;">Add New Contact</h3>
                <div class="input-group">
                    <label>Contact Name</label>
                    <input type="text" placeholder="e.g. Koperasi Tani Maju">
                </div>
                <div class="input-group">
                    <label>WhatsApp Number</label>
                    <input type="tel" placeholder="0812...">
                </div>
                <div class="input-group">
                    <label>Special Notes</label>
                    <input type="text" placeholder="Supplier bibit area utara...">
                </div>
                <button class="btn-submit" onclick="alert('Contact data ready to be saved!'); closeSheets();">Save Contact</button>
            </div>
        `;
    } else {
        html = `<div style="text-align:center; margin-top:50px; color:#aaa;">${currentActiveTab.toUpperCase()} module coming soon.</div>`;
    }

    container.innerHTML = html;
}

// --- ACTIONS ---
function addTodo() {
    const newTask = prompt("Enter new To-Do item:");
    if(newTask && newTask.trim() !== "") {
        appData.todos.push({ id: Date.now(), task: newTask, done: false });
        saveData();
        renderContent(); 
    }
}

function toggleTodo(index) {
    appData.todos[index].done = !appData.todos[index].done;
    saveData();
    renderContent();
}

function deleteTodo(index) {
    if(confirm("Delete this task?")) {
        appData.todos.splice(index, 1);
        saveData();
        renderContent();
    }
}

function updateStock(index, change) {
    appData.stocks[index].count += change;
    if(appData.stocks[index].count < 0) appData.stocks[index].count = 0;
    saveData();
    renderContent();
}

// --- MODAL & POPUP LOGIC ---
function toggleFabMenu() {
    const menu = document.getElementById('fabMenu');
    menu.classList.toggle('active');
}

function openSheet(sheetId) {
    document.getElementById('fabMenu').classList.remove('active');
    document.getElementById('sheetOverlay').classList.add('open');
    document.getElementById(sheetId).classList.add('open');
}

function closeSheets() {
    document.getElementById('sheetOverlay').classList.remove('open');
    document.querySelectorAll('.bottom-sheet').forEach(sheet => sheet.classList.remove('open'));
    document.getElementById('fabMenu').classList.remove('active');
}

// Initialize the app data on load
initData();

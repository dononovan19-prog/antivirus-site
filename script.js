// Multi-function antivirus dashboard with login system
document.addEventListener('DOMContentLoaded', () => {
    // Core elements
    const loginBtn = document.getElementById('loginBtn');
    const dashboardBtn = document.querySelector('.dashboard-btn');
    const dashboardOverlay = document.getElementById('dashboardOverlay');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const paymentModal = document.getElementById('paymentModal');
    
    // Scanner
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const scanResults = document.getElementById('scanResults');
    const loading = document.getElementById('loading');
    const scanResult = document.getElementById('scanResult');
    const subscribeBtns = document.querySelectorAll('.subscribe-btn');
    
    // Dashboard checkboxes & buttons
    const quickScanCB = document.getElementById('quickScan');
    const deepScanCB = document.getElementById('deepScan');
    const webScanCB = document.getElementById('webScan');
    const runCustomScan = document.getElementById('runCustomScan');
    const toggleProtection = document.getElementById('toggleProtection');
    const realtimeStatus = document.getElementById('realtimeStatus');
    const firewallStatus = document.getElementById('firewallStatus');
    const historyList = document.getElementById('historyList');
    
    // State
    let user = JSON.parse(localStorage.getItem('antivirusUser')) || null;
    let scanHistory = JSON.parse(localStorage.getItem('scanHistory')) || [];
    
    initApp();
    
    function initApp() {
        if (user) showLoggedInState();
        updateHistory();
        setupEventListeners();
        setupDragDrop();
    }
    
    function showLoggedInState() {
        dashboardBtn.style.display = 'inline-block';
        loginBtn.style.display = 'none';
        dashboardBtn.textContent = `Bonjour, ${user.email.split('@')[0]}`;
    }
    
    function setupEventListeners() {
        // Login/Register
        loginBtn.onclick = () => loginModal.style.display = 'block';
        document.getElementById('closeLogin').onclick = () => loginModal.style.display = 'none';
        document.getElementById('closeRegister').onclick = () => registerModal.style.display = 'none';
        
        document.getElementById('showRegister').onclick = (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
        };
        
        document.getElementById('showLogin').onclick = (e) => {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
        };
        
        // Forms
        document.getElementById('loginForm').onsubmit = handleLogin;
        document.getElementById('registerForm').onsubmit = handleRegister;
        logoutBtn.onclick = handleLogout;
        
        // Dashboard
        dashboardBtn.onclick = () => dashboardOverlay.style.display = 'flex';
        document.body.onclick = (e) => {
            if (e.target === dashboardOverlay) dashboardOverlay.style.display = 'none';
        };
        
        // Subscribe requires login
        subscribeBtns.forEach(btn => btn.onclick = handleSubscribe);
        
        // Dashboard functions
        runCustomScan.onclick = handleCustomScan;
        toggleProtection.onclick = toggleAllProtection;
    }
    
    function handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const pass = document.getElementById('loginPassword').value;
        
        if (email && pass) {
            user = { email, plan: localStorage.getItem('userPlan') || 'Basic', expiry: '15 déc. 2024' };
            localStorage.setItem('antivirusUser', JSON.stringify(user));
            loginModal.style.display = 'none';
            showLoggedInState();
            addToHistory('Connexion réussie', '✓', ['auth']);
        }
    }
    
    function handleRegister(e) {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const pass = document.getElementById('regPassword').value;
        
        if (email && pass.length > 5) {
            user = { email, plan: 'Basic', expiry: '15 déc. 2024' };
            localStorage.setItem('antivirusUser', JSON.stringify(user));
            registerModal.style.display = 'none';
            showLoggedInState();
            alert('✅ Compte créé!');
            addToHistory('Nouveau compte', '✓', ['register']);
        }
    }
    
    function handleLogout() {
        user = null;
        localStorage.removeItem('antivirusUser');
        dashboardOverlay.style.display = 'none';
        showLoggedInState();
        loginBtn.textContent = 'Connexion';
        addToHistory('Déconnexion', '✓', ['logout']);
    }
    
    function handleSubscribe() {
        if (!user) {
            alert('Connectez-vous pour souscrire!');
            loginModal.style.display = 'block';
            return;
        }
        // Original payment logic
        const plan = this.dataset.plan;
        document.getElementById('modalTitle').textContent = plan.toUpperCase();
        document.getElementById('modalPrice').textContent = {
            basic: '12€ / 3 mois',
            pro: '30€ / 15 mois',
            premium: '80€ / an'
        }[plan];
        paymentModal.style.display = 'block';
    }
    
    function handleCustomScan() {
        const options = [];
        if (quickScanCB.checked) options.push('rapide');
        if (deepScanCB.checked) options.push('approfondi');
        if (webScanCB.checked) options.push('web');
        
        addToHistory('Scan personnalisé', 'Terminé', options);
        alert(`Scan lancé avec: ${options.join(', ') || 'options par défaut'}`);
    }
    
    function toggleAllProtection() {
        const wasActive = realtimeStatus.classList.contains('on');
        realtimeStatus.classList.toggle('on', !wasActive);
        realtimeStatus.classList.toggle('off', wasActive);
        realtimeStatus.textContent = wasActive ? 'ACTIF' : 'INACTIF';
        
        firewallStatus.classList.toggle('on', !wasActive);
        firewallStatus.classList.toggle('off', wasActive);
        firewallStatus.textContent = wasActive ? 'ACTIF' : 'INACTIF';
        
        toggleProtection.textContent = wasActive ? 'Activer tout' : 'Désactiver tout';
        addToHistory('Protection globale', wasActive ? 'Désactivée' : 'Activée', ['protection']);
    }
    
    function addToHistory(name, status, options) {
        scanHistory.unshift({
            id: Date.now(),
            name,
            status,
            date: new Date().toLocaleString('fr-FR'),
            options: options || []
        });
        if (scanHistory.length > 10) scanHistory.pop();
        localStorage.setItem('scanHistory', JSON.stringify(scanHistory));
        updateHistory();
    }
    
    function updateHistory() {
        historyList.innerHTML = scanHistory.map(scan => `
            <div class="history-item">
                <strong>${scan.name}</strong> - ${scan.status}
                <br><small>${scan.date}</small>
                ${scan.options.length ? `<br><small>Options: ${scan.options.join(', ')}</small>` : ''}
            </div>
        `).join('');
    }
    
    function setupDragDrop() {
        uploadArea.ondragover = e => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        };
        
        uploadArea.ondragleave = () => uploadArea.classList.remove('dragover');
        
        uploadArea.ondrop = e => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            handleFileDrop(e.dataTransfer.files);
        };
        
        fileInput.onchange = e => handleFileDrop(e.target.files);
    }
    
    function handleFileDrop(files) {
        if (files.length === 0) return;
        const file = files[0].name;
        uploadArea.style.display = 'none';
        scanResults.style.display = 'block';
        loading.style.display = 'block';
        
        setTimeout(() => {
            loading.style.display = 'none';
            const isClean = Math.random() > 0.3;
            scanResult.className = `result ${isClean ? 'clean' : 'threat'}`;
            scanResult.querySelector('h3').textContent = isClean ? 'Fichier propre!' : 'Menace détectée!';
            scanResult.querySelector('p').textContent = isClean ? 'Aucune menace' : 'Protection Premium recommandée';
            scanResult.style.display = 'block';
            
            addToHistory(file, isClean ? 'Propre' : 'Infecté', ['upload']);
        }, 2000 + Math.random() * 2000);
    }
    
    // Close modals
    window.onclick = e => {
        if (e.target.classList.contains('modal')) e.target.style.display = 'none';
        if (e.target === paymentModal) paymentModal.style.display = 'none';
    };
    
    document.getElementById('payButton').onclick = () => {
        user.plan = document.getElementById('modalTitle').textContent.toLowerCase();
        localStorage.setItem('antivirusUser', JSON.stringify(user));
        alert('✅ Abonnement Premium activé!');
        paymentModal.style.display = 'none';
    };
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.onclick = e => {
            e.preventDefault();
            document.querySelector(a.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
        };
    });
});

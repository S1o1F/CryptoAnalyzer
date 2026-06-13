
let cryptoData = null;
let watchlist = [];
let isLoggedIn = false;
let currentLanguage = 'en';

const translations = {
    en: {
        loginTitle: 'Log in to<br>CryptoAnalyzer',
        loginSubtitle: 'Access your market insights',
        email: 'Email',
        emailPlaceholder: 'john.doe@example.com',
        password: 'Password',
        passwordPlaceholder: '••••••••',
        loginBtn: 'Login',
        forgotPassword: 'Forgot Password?',
        noAccount: "Don't have an account?",
        signUp: 'Sign up',
        
        navDashboard: 'Dashboard',
        navCryptoDetail: 'Crypto Detail',
        navPortfolio: 'Favorites',
        navPredict: 'Prediction',
        navHistory: 'History',
        navSettings: 'Settings',
        
        predictTitle: 'Price Prediction',
        predictDesc: 'Predict the next day\'s price based on the last 7 days of data',
        selectCryptoPredict: 'Select Cryptocurrency',
        chooseCryptoLabel: 'Choose a cryptocurrency:',
        predictBtn: 'Predict Price',
        predictionResult: 'Prediction Result',
        currentPrice: 'Current Price',
        predictedPrice: 'Predicted Price (Tomorrow)',
        expectedChange: 'Expected Change',
        confidence: 'Confidence Level',
        last7DaysPrediction: 'Last 7 Days + Prediction',
        disclaimer: ' Disclaimer: This prediction is based on simple linear regression and is for educational purposes only. Do not use for actual trading decisions.',
        
        totalMarketCap: 'Total Market Cap',
        totalVolume: '24h Total Volume',
        btcDominance: 'Bitcoin Dominance',
        topCryptos: 'Top Cryptocurrencies',
        symbol: 'Symbol',
        name: 'Name',
        lastPrice: 'Last Price',
        change24h: '24h Change',
        volume24h: '24h Volume',
        trend: 'Trend',
        actions: 'Actions',
        viewDetails: 'View Details',
        marketCapTrend: 'Market Cap Trend',
        volumeTrend: '24h Volume Trend',
        refreshData: 'Refresh Data',
        searchPlaceholder: 'Search cryptocurrencies...',
        
        // Crypto Detail
        high24h: '24h High',
        low24h: '24h Low',
        avgVolatility: 'Avg. Daily Volatility',
        priceVolume: 'Price & Volume (24h)',
        priceHistory: 'Price History',
        date: 'Date',
        open: 'Open',
        high: 'High',
        low: 'Low',
        close: 'Close',
        volume: 'Volume',
        
        myPortfolio: 'My Favorites',
        addCrypto: '+ Add Cryptocurrency',
        coin: 'Coin',
        price: 'Price',
        trend24h: 'Trend (24h)',
        emptyPortfolio: 'Your favorites list is empty. Click "Add Cryptocurrency" to start tracking your favorite coins!',
        
        profile: 'Profile',
        notifications: 'Notifications',
        integrations: 'Integrations',
        appearance: 'Appearance',
        personalInfo: 'Personal Information',
        personalInfoDesc: 'Manage your name, email, and profile picture.',
        nameLabel: 'Name',
        emailLabel: 'Email',
        profilePicture: 'Profile Picture',
        edit: 'Edit',
        passwordMgmt: 'Password Management',
        passwordMgmtDesc: 'Change your password securely.',
        changePassword: 'Change Password',
        session: 'Session',
        sessionDesc: 'Log out from your account.',
        logOut: '🚪 Log Out',
        saveChanges: 'Save Changes',
        cancel: 'Cancel',
        priceAlerts: 'Price Alerts',
        portfolioUpdates: 'Portfolio Updates',
        marketNews: 'Market News',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        
        addToWatchlist: 'Add Cryptocurrency to Watchlist',
        selectCrypto: 'Select Cryptocurrency',
        chooseCrypto: '-- Choose a cryptocurrency --',
        addToWatchlistBtn: 'Add to Watchlist',
        
        historyTitle: 'Historical Data',
        selectCryptoHistory: 'Select Cryptocurrency',
        records: 'Records',
        avgPrice: 'Avg Price',
        
        footerText: '© 2025 CryptoAnalyzer. All rights reserved.'
    },
    mk: {
        loginTitle: 'Најави се во<br>CryptoAnalyzer',
        loginSubtitle: 'Пристапи до пазарните информации',
        email: 'Е-пошта',
        emailPlaceholder: 'john.doe@example.com',
        password: 'Лозинка',
        passwordPlaceholder: '••••••••',
        loginBtn: 'Најава',
        forgotPassword: 'Заборавена лозинка?',
        noAccount: 'Немаш профил?',
        signUp: 'Регистрирај се',
        
        navDashboard: 'Контролна табла',
        navCryptoDetail: 'Детали за крипто',
        navPortfolio: 'Омилени',
        navPredict: 'Предвидување',
        navHistory: 'Историја',
        navSettings: 'Подесувања',
        
        predictTitle: 'Предвидување на цена',
        predictDesc: 'Предвиди ја цената за утре базирано на последните 7 дена',
        selectCryptoPredict: 'Избери криптовалута',
        chooseCryptoLabel: 'Избери криптовалута:',
        predictBtn: 'Предвиди цена',
        predictionResult: 'Резултат од предвидување',
        currentPrice: 'Моментална цена',
        predictedPrice: 'Предвидена цена (Утре)',
        expectedChange: 'Очекувана промена',
        confidence: 'Ниво на доверба',
        last7DaysPrediction: 'Последни 7 дена + Предвидување',
        disclaimer: ' Напомена: Ова предвидување е базирано на едноставна линеарна регресија и е само за едукативни цели. Не користете за вистински тргувања.',
        
        totalMarketCap: 'Вкупна пазарна капитализација',
        totalVolume: 'Вкупен волумен (24ч)',
        btcDominance: 'Доминација на Bitcoin',
        topCryptos: 'Топ криптовалути',
        symbol: 'Симбол',
        name: 'Име',
        lastPrice: 'Последна цена',
        change24h: 'Промена 24ч',
        volume24h: 'Волумен 24ч',
        trend: 'Тренд',
        actions: 'Акции',
        viewDetails: 'Детали',
        marketCapTrend: 'Тренд на пазарна капитализација',
        volumeTrend: 'Тренд на волумен (24ч)',
        refreshData: 'Освежи податоци',
        searchPlaceholder: 'Пребарај криптовалути...',
        
        high24h: 'Највисока 24ч',
        low24h: 'Најниска 24ч',
        avgVolatility: 'Просечна волатилност',
        priceVolume: 'Цена и волумен (24ч)',
        priceHistory: 'Историја на цени',
        date: 'Датум',
        open: 'Отворање',
        high: 'Највисока',
        low: 'Најниска',
        close: 'Затворање',
        volume: 'Волумен',
        
        myPortfolio: 'Мои омилени',
        addCrypto: '+ Додај криптовалута',
        coin: 'Монета',
        price: 'Цена',
        trend24h: 'Тренд (24ч)',
        emptyPortfolio: 'Листата со омилени е празна. Кликни "Додај криптовалута" за да започнеш да следиш!',
        
        profile: 'Профил',
        notifications: 'Известувања',
        integrations: 'Интеграции',
        appearance: 'Изглед',
        personalInfo: 'Лични информации',
        personalInfoDesc: 'Уреди го твоето име, е-пошта и профилна слика.',
        nameLabel: 'Име',
        emailLabel: 'Е-пошта',
        profilePicture: 'Профилна слика',
        edit: 'Уреди',
        passwordMgmt: 'Управување со лозинка',
        passwordMgmtDesc: 'Промени ја лозинката безбедно.',
        changePassword: 'Промени лозинка',
        session: 'Сесија',
        sessionDesc: 'Одјави се од профилот.',
        logOut: '🚪 Одјава',
        saveChanges: 'Зачувај промени',
        cancel: 'Откажи',
        priceAlerts: 'Известувања за цени',
        portfolioUpdates: 'Ажурирања на портфолио',
        marketNews: 'Пазарни вести',
        theme: 'Тема',
        light: 'Светла',
        dark: 'Темна',
        
        addToWatchlist: 'Додај криптовалута во омилени',
        selectCrypto: 'Избери криптовалута',
        chooseCrypto: '-- Избери криптовалута --',
        addToWatchlistBtn: 'Додај во омилени',
        
        historyTitle: 'Историски податоци',
        selectCryptoHistory: 'Избери криптовалута',
        records: 'Записи',
        avgPrice: 'Просечна цена',
        
        footerText: '© 2025 CryptoAnalyzer. Сите права задржани.'
    }
};

function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem('language', lang);

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-lang') === lang) {
            btn.classList.add('active');
        }
    });
    

    translatePage();
}

function translatePage() {
    const t = translations[currentLanguage];

    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.getAttribute('data-translate');
        if (t[key]) {
            el.innerHTML = t[key];
        }
    });

    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (t[key]) {
            el.placeholder = t[key];
        }
    });

    const searchInput = document.getElementById('globalSearch');
    if (searchInput) {
        searchInput.placeholder = t.searchPlaceholder;
    }
}

function loadSavedLanguage() {
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
}

window.setLanguage = setLanguage;

document.addEventListener('DOMContentLoaded', function() {
    console.log('[APP] Initializing CryptoAnalyzer...');

    loadSavedLanguage();
    checkLoginStatus();
    loadData();
    setupNavigation();
    setupSettingsTabs();
    loadWatchlistFromStorage();
    
    console.log('[APP] Initialization complete!');
});

function checkLoginStatus() {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
        showApp();
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (email && password.length >= 1) {
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('userEmail', email);

        const btn = document.querySelector('.btn-login');
        btn.textContent = 'Logging in...';
        btn.disabled = true;

        setTimeout(() => {
            showApp();
            updateUserInfo(email);
        }, 800);
    } else {
        alert('Please enter valid credentials');
    }
}

function showApp() {
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    
    loginScreen.classList.add('hidden');
    appContainer.style.display = 'flex';
    appContainer.classList.add('visible');
    
    document.title = 'CryptoAnalyzer - Dashboard';
    isLoggedIn = true;
}

function showSignupMessage() {
    alert('Sign up functionality coming soon!\n\nFor the prototype, use any email and password to login.');
}

function updateUserInfo(email) {
    const name = email.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = name.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');

    const nameInput = document.querySelector('.settings-content input[type="text"]');
    const emailInput = document.querySelector('.settings-content input[type="email"]');
    
    if (nameInput) nameInput.value = formattedName;
    if (emailInput) emailInput.value = email;
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    
    const loginScreen = document.getElementById('loginScreen');
    const appContainer = document.getElementById('appContainer');
    
    appContainer.classList.remove('visible');
    appContainer.style.display = 'none';
    loginScreen.classList.remove('hidden');
    
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.querySelector('.btn-login').textContent = 'Login';
    document.querySelector('.btn-login').disabled = false;
    
    document.title = 'CryptoAnalyzer - Login';
    isLoggedIn = false;
}

window.handleLogin = handleLogin;
window.showSignupMessage = showSignupMessage;
window.logout = logout;

async function loadData() {
    try {
        const response = await fetch('data/crypto_data.json');
        if (!response.ok) throw new Error('Failed to load data');
        
        cryptoData = await response.json();
        console.log('[DATA] Loaded:', cryptoData);
        
        updateDashboard();
        updateCryptoSelector();
        updatePortfolioTable();
        
    } catch (error) {
        console.error('[ERROR]', error);
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            navigateTo(page);
        });
    });
}

function navigateTo(pageName) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-page') === pageName) {
            item.classList.add('active');
        }
    });

    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById('page-' + pageName);
    if (targetPage) {
        targetPage.classList.add('active');
    }

    const titles = {
        'dashboard': 'Dashboard',
        'crypto-detail': 'Crypto Detail',
        'crypto-info': currentLanguage === 'mk' ? 'Информации' : 'Info',
        'portfolio': 'Portfolio',
        'predict': 'Prediction',
        'history': 'History',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';

    if (pageName === 'crypto-detail') {
        loadDefaultCryptoDetail();
    }
    if (pageName === 'predict') {
        initPredictionPage();
    }
    if (pageName === 'history') {
        initHistoryPage();
    }
    if (pageName === 'crypto-info' && currentInfoSymbol) {
        loadCryptoInfoPage(currentInfoSymbol);
    }
}

function updateDashboard() {
    if (!cryptoData) return;

    const stats = cryptoData.market_stats;
    document.getElementById('totalMarketCap').textContent = '$' + formatLargeNumber(stats.total_market_cap);
    document.getElementById('totalVolume').textContent = '$' + formatLargeNumber(stats.total_volume_24h);
    document.getElementById('btcDominance').textContent = stats.btc_dominance + '%';

    const tableBody = document.getElementById('cryptoTableBody');
    tableBody.innerHTML = '';
    
    const seenBases = new Set();
    const uniqueCryptos = cryptoData.symbols.filter(crypto => {
        if (seenBases.has(crypto.base)) {
            return false;
        }
        seenBases.add(crypto.base);
        return true;
    });
    
    uniqueCryptos.forEach(crypto => {
        const historyRaw = cryptoData.price_history[crypto.symbol];
        const history = getHistoryAsArray(historyRaw);
        const lastPrice = history.length > 0 ? history[history.length - 1] : null;

        const change = (Math.random() * 10 - 3).toFixed(2);
        const isPositive = parseFloat(change) >= 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="symbol-bold">${crypto.base}</span></td>
            <td>${crypto.name}</td>
            <td>${lastPrice ? formatPrice(lastPrice.last_price) : '-'}</td>
            <td>
                <span class="${isPositive ? 'change-positive' : 'change-negative'}">
                    ${isPositive ? '↗' : '↘'} ${Math.abs(change)}%
                </span>
            </td>
            <td>${formatLargeNumber(crypto.quote_volume)}</td>
            <td>
                <svg class="trend-line ${isPositive ? 'positive' : 'negative'}" viewBox="0 0 60 24">
                    <polyline points="${generateTrendLine(isPositive)}" fill="none" stroke-width="2"/>
                </svg>
            </td>
            <td>
                <button class="btn-info" onclick="showCryptoInfo('${crypto.symbol}')">
                    Info
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function generateTrendLine(isPositive) {
    let points = [];
    let y = isPositive ? 20 : 4;
    for (let x = 0; x <= 60; x += 10) {
        y += isPositive ? (Math.random() * -4) : (Math.random() * 4);
        y = Math.max(2, Math.min(22, y));
        points.push(`${x},${y}`);
    }
    return points.join(' ');
}

function viewCryptoDetail(symbol) {
    navigateTo('crypto-detail');
    loadCryptoDetail(symbol);
}

function loadDefaultCryptoDetail() {
    if (cryptoData && cryptoData.symbols.length > 0) {
        const firstWithHistory = cryptoData.symbols.find(s => cryptoData.price_history[s.symbol]);
        if (firstWithHistory) {
            loadCryptoDetail(firstWithHistory.symbol);
        }
    }
}

function loadCryptoDetail(symbol) {
    const crypto = cryptoData.symbols.find(c => c.symbol === symbol);
    const historyRaw = cryptoData.price_history[symbol];
    const history = getHistoryAsArray(historyRaw);
    
    if (!crypto || !history || history.length === 0) return;
    
    const latest = history[history.length - 1];

    document.getElementById('detailName').textContent = crypto.name;
    document.getElementById('detailSymbol').textContent = crypto.base;
    document.getElementById('detailPrice').textContent = formatPrice(latest.last_price);

    const prevClose = history.length > 1 ? history[history.length - 2].close : latest.open;
    const change = latest.close - prevClose;
    const changePercent = ((change / prevClose) * 100).toFixed(2);
    const isPositive = change >= 0;
    
    document.getElementById('detailChange').textContent = 
        `${isPositive ? '+' : ''}${formatPrice(change)} (${changePercent}%)`;
    document.getElementById('detailChange').className = 
        `price-change ${isPositive ? 'positive' : 'negative'}`;

    document.getElementById('detail24hHigh').textContent = formatPrice(latest.high_24h);
    document.getElementById('detail24hLow').textContent = formatPrice(latest.low_24h);
    document.getElementById('detail24hVolume').textContent = '$' + formatLargeNumber(latest.volume_24h);
    document.getElementById('detailVolatility').textContent = 
        (((latest.high - latest.low) / latest.close) * 100).toFixed(1) + '%';

    updateBarChart(history);

    const historyBody = document.getElementById('priceHistoryBody');
    historyBody.innerHTML = '';
    
    [...history].reverse().forEach(day => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${day.date}</td>
            <td>${formatPrice(day.open)}</td>
            <td style="color: var(--success)">${formatPrice(day.high)}</td>
            <td style="color: var(--danger)">${formatPrice(day.low)}</td>
            <td>${formatPrice(day.close)}</td>
            <td>${formatNumber(day.volume)}</td>
        `;
        historyBody.appendChild(row);
    });
}

function updateBarChart(history) {
    const container = document.getElementById('priceVolumeChart');
    container.innerHTML = '';
    
    const maxVolume = Math.max(...history.map(h => h.volume));
    
    history.forEach(day => {
        const height = (day.volume / maxVolume) * 150;
        const barItem = document.createElement('div');
        barItem.className = 'bar-item';
        barItem.innerHTML = `
            <div class="bar" style="height: ${height}px"></div>
            <span class="bar-label">${day.date.slice(5)}</span>
        `;
        container.appendChild(barItem);
    });
}

function loadWatchlistFromStorage() {
    const saved = localStorage.getItem('cryptoWatchlist');
    if (saved) {
        watchlist = JSON.parse(saved);
    }
}

function saveWatchlistToStorage() {
    localStorage.setItem('cryptoWatchlist', JSON.stringify(watchlist));
}

function updatePortfolioTable() {
    const tableBody = document.getElementById('portfolioTableBody');
    const emptyMsg = document.getElementById('emptyPortfolio');
    
    if (!cryptoData) return;
    
    if (watchlist.length === 0) {
        tableBody.innerHTML = '';
        emptyMsg.style.display = 'block';
        return;
    }
    
    emptyMsg.style.display = 'none';
    tableBody.innerHTML = '';
    
    watchlist.forEach((symbol, index) => {
        const crypto = cryptoData.symbols.find(c => c.symbol === symbol);
        if (!crypto) return;
        
        const historyRaw = cryptoData.price_history[symbol];
        const history = getHistoryAsArray(historyRaw);
        const lastPrice = history.length > 0 ? history[history.length - 1] : null;
        const change = (Math.random() * 8 - 2).toFixed(2);
        const isPositive = parseFloat(change) >= 0;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <div class="coin-info">
                    <div class="coin-icon">${crypto.base.charAt(0)}</div>
                    <div>
                        <div class="coin-name">${crypto.base}</div>
                        <div class="coin-symbol">${crypto.name}</div>
                    </div>
                </div>
            </td>
            <td>${lastPrice ? formatPrice(lastPrice.last_price) : '-'}</td>
            <td style="color: ${isPositive ? 'var(--success)' : 'var(--danger)'}">
                ${isPositive ? '+' : ''}${change}%
            </td>
            <td>${formatLargeNumber(crypto.quote_volume)}</td>
            <td>
                <svg class="mini-trend" viewBox="0 0 50 20">
                    <polyline points="${generateMiniTrend()}" fill="none" stroke="#3b82f6" stroke-width="1.5"/>
                </svg>
            </td>
            <td>
                <div class="action-icons">
                    <span class="action-icon" onclick="viewCryptoDetail('${symbol}')" title="View Details">↗</span>
                    <span class="action-icon favorite active" onclick="removeFromWatchlist('${symbol}')" title="Remove from Watchlist">★</span>
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function generateMiniTrend() {
    let points = [];
    let y = 10;
    for (let x = 0; x <= 50; x += 8) {
        y += Math.random() * 6 - 3;
        y = Math.max(2, Math.min(18, y));
        points.push(`${x},${y}`);
    }
    return points.join(' ');
}

function showAddCryptoModal() {
    updateCryptoSelector();
    document.getElementById('addCryptoModal').classList.add('active');
}

function closeAddCryptoModal() {
    document.getElementById('addCryptoModal').classList.remove('active');
}

function updateCryptoSelector() {
    if (!cryptoData) return;
    
    const select = document.getElementById('cryptoSelect');
    select.innerHTML = '<option value="">-- Choose a cryptocurrency --</option>';
    
    cryptoData.symbols.forEach(crypto => {
        if (!watchlist.includes(crypto.symbol)) {
            const option = document.createElement('option');
            option.value = crypto.symbol;
            option.textContent = `${crypto.base} - ${crypto.name}`;
            select.appendChild(option);
        }
    });
}

function addToWatchlist() {
    const select = document.getElementById('cryptoSelect');
    const symbol = select.value;
    
    if (!symbol) {
        alert('Please select a cryptocurrency');
        return;
    }
    
    if (!watchlist.includes(symbol)) {
        watchlist.push(symbol);
        saveWatchlistToStorage();
        updatePortfolioTable();
        updateCryptoSelector();
    }
    
    closeAddCryptoModal();
}

function removeFromWatchlist(symbol) {
    watchlist = watchlist.filter(s => s !== symbol);
    saveWatchlistToStorage();
    updatePortfolioTable();
    updateCryptoSelector();
}

function setupSettingsTabs() {
    const tabs = document.querySelectorAll('.settings-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-settings-tab');

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            document.querySelectorAll('.settings-content').forEach(content => {
                content.classList.remove('active');
            });
            
            const targetContent = document.getElementById('settings-' + tabName);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function refreshData() {
    console.log('[REFRESH] Refreshing data...');
    loadData();
    alert('Data refreshed!');
}

function formatNumber(num) {
    if (!num) return '-';
    return new Intl.NumberFormat('en-US').format(num);
}

function formatPrice(price) {
    if (!price) return '-';
    if (price < 1) return '$' + price.toFixed(4);
    if (price < 100) return '$' + price.toFixed(2);
    return '$' + formatNumber(price.toFixed(2));
}

function formatLargeNumber(num) {
    if (!num) return '-';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toString();
}

function getHistoryAsArray(history) {
    if (!history) return [];
    
    if (Array.isArray(history)) {
        return history;
    }
    
    const flatArray = [];
    const months = Object.keys(history).sort();
    months.forEach(month => {
        if (Array.isArray(history[month])) {
            flatArray.push(...history[month]);
        }
    });
    
    flatArray.sort((a, b) => a.date.localeCompare(b.date));
    return flatArray;
}

function getLastNRecords(history, n) {
    const arr = getHistoryAsArray(history);
    return arr.slice(-n);
}

function handleSearch(event) {
    const query = event.target.value.trim().toUpperCase();
    const resultsContainer = document.getElementById('searchResults');
    
    if (!query || query.length < 1) {
        resultsContainer.classList.remove('active');
        resultsContainer.innerHTML = '';
        return;
    }
    
    if (!cryptoData || !cryptoData.symbols) {
        return;
    }
    
    const results = cryptoData.symbols.filter(crypto =>
        crypto.base.toUpperCase().includes(query) || 
        crypto.name.toUpperCase().includes(query) ||
        crypto.symbol.toUpperCase().includes(query)
    ).slice(0, 5);
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `<div class="search-no-results">${currentLanguage === 'mk' ? 'Нема резултати' : 'No results found'}</div>`;
        resultsContainer.classList.add('active');
        return;
    }
    
    let html = '';
    results.forEach(crypto => {
        const historyRaw = cryptoData.price_history[crypto.symbol];
        const history = getHistoryAsArray(historyRaw);
        const lastPrice = history.length > 0 ? history[history.length - 1].close : null;
        
        html += `
            <div class="search-result-item" onclick="selectSearchResult('${crypto.symbol}')">
                <div class="search-result-icon">${crypto.base.charAt(0)}</div>
                <div class="search-result-info">
                    <div class="search-result-symbol">${crypto.base}</div>
                    <div class="search-result-name">${crypto.name}</div>
                </div>
                <div class="search-result-price">${lastPrice ? formatPrice(lastPrice) : '-'}</div>
            </div>
        `;
    });
    
    resultsContainer.innerHTML = html;
    resultsContainer.classList.add('active');
    
    if (event.key === 'Enter' && results.length > 0) {
        selectSearchResult(results[0].symbol);
    }
}

function selectSearchResult(symbol) {
    document.getElementById('globalSearch').value = '';
    document.getElementById('searchResults').classList.remove('active');
    document.getElementById('searchResults').innerHTML = '';
    
    navigateTo('history');
    
    setTimeout(() => {
        const historySelect = document.getElementById('historyCryptoSelect');
        if (historySelect) {
            historySelect.value = symbol;
            loadHistoryData();
        }
    }, 100);
}

document.addEventListener('click', function(e) {
    const searchBox = document.querySelector('.search-box');
    const resultsContainer = document.getElementById('searchResults');
    
    if (searchBox && resultsContainer && !searchBox.contains(e.target)) {
        resultsContainer.classList.remove('active');
    }
});

function initPredictionPage() {
    if (!cryptoData) return;
    
    const select = document.getElementById('predictCryptoSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select --</option>';
    
    cryptoData.symbols.forEach(crypto => {
        if (cryptoData.price_history[crypto.symbol]) {
            const option = document.createElement('option');
            option.value = crypto.symbol;
            option.textContent = `${crypto.base} - ${crypto.name}`;
            select.appendChild(option);
        }
    });
}

function calculatePrediction() {
    const select = document.getElementById('predictCryptoSelect');
    const symbol = select.value;
    
    if (!symbol) {
        alert(currentLanguage === 'mk' ? 'Ве молам изберете криптовалута' : 'Please select a cryptocurrency');
        return;
    }
    
    const crypto = cryptoData.symbols.find(c => c.symbol === symbol);
    const historyRaw = cryptoData.price_history[symbol];
    const history = getHistoryAsArray(historyRaw);
    
    if (!crypto || !history || history.length < 2) {
        alert(currentLanguage === 'mk' ? 'Нема доволно податоци' : 'Not enough data');
        return;
    }
    
    const last7Days = history.slice(-7);
    const prices = last7Days.map(d => d.close);
    
    const prediction = linearRegression(prices);
    const currentPrice = prices[prices.length - 1];
    const predictedPrice = prediction.nextValue;
    const change = ((predictedPrice - currentPrice) / currentPrice) * 100;
    
    document.getElementById('predictSymbol').textContent = crypto.base;
    document.getElementById('predictName').textContent = crypto.name;
    document.getElementById('currentPriceValue').textContent = formatPrice(currentPrice);
    document.getElementById('predictedPriceValue').textContent = formatPrice(predictedPrice);
    
    const changeEl = document.getElementById('expectedChangeValue');
    changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
    changeEl.className = 'prediction-value ' + (change >= 0 ? 'positive' : 'negative');
    
    drawPredictionChart(last7Days, predictedPrice);
    
    document.getElementById('predictionResult').style.display = 'block';
}

function linearRegression(values) {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    
    for (let i = 0; i < n; i++) {
        sumX += i;
        sumY += values[i];
        sumXY += i * values[i];
        sumX2 += i * i;
        sumY2 += values[i] * values[i];
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const nextValue = slope * n + intercept;
    
    const yMean = sumY / n;
    let ssTot = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
        const predicted = slope * i + intercept;
        ssTot += Math.pow(values[i] - yMean, 2);
        ssRes += Math.pow(values[i] - predicted, 2);
    }
    const rSquared = ssTot === 0 ? 0 : 1 - (ssRes / ssTot);
    
    return { slope, intercept, nextValue, rSquared };
}

function drawPredictionChart(history, predictedPrice) {
    const container = document.getElementById('predictionBars');
    container.innerHTML = '';
    
    const prices = history.map(d => d.close);
    prices.push(predictedPrice);
    
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    const range = maxPrice - minPrice || 1;
    
    history.forEach((day, i) => {
        const height = ((day.close - minPrice) / range) * 150 + 20;
        const barItem = document.createElement('div');
        barItem.className = 'pred-bar-item';
        barItem.innerHTML = `
            <div class="pred-bar" style="height: ${height}px"></div>
            <span class="pred-bar-label">${day.date.slice(5)}</span>
        `;
        container.appendChild(barItem);
    });

    const predHeight = ((predictedPrice - minPrice) / range) * 150 + 20;
    const predBar = document.createElement('div');
    predBar.className = 'pred-bar-item';
    predBar.innerHTML = `
        <div class="pred-bar predicted-bar" style="height: ${predHeight}px"></div>
        <span class="pred-bar-label predicted-label">${currentLanguage === 'mk' ? 'Утре' : 'Tomorrow'}</span>
    `;
    container.appendChild(predBar);
}

function initHistoryPage() {
    if (!cryptoData) return;
    
    const select = document.getElementById('historyCryptoSelect');
    if (!select) return;
    
    select.innerHTML = '<option value="">-- Select --</option>';
    
    cryptoData.symbols.forEach(crypto => {
        if (cryptoData.price_history[crypto.symbol]) {
            const option = document.createElement('option');
            option.value = crypto.symbol;
            option.textContent = `${crypto.base} - ${crypto.name}`;
            select.appendChild(option);
        }
    });
}

function loadHistoryData() {
    const select = document.getElementById('historyCryptoSelect');
    const symbol = select.value;
    const container = document.getElementById('historyContent');
    
    if (!symbol) {
        container.style.display = 'none';
        return;
    }
    
    const historyRaw = cryptoData.price_history[symbol];
    if (!historyRaw) {
        container.innerHTML = `<div class="section-card"><p style="text-align:center;color:var(--text-secondary);padding:2rem;">${currentLanguage === 'mk' ? 'Нема историски податоци' : 'No historical data available'}</p></div>`;
        container.style.display = 'block';
        return;
    }
    
    const history = getHistoryAsArray(historyRaw);
    
    if (history.length === 0) {
        container.innerHTML = `<div class="section-card"><p style="text-align:center;color:var(--text-secondary);padding:2rem;">${currentLanguage === 'mk' ? 'Нема историски податоци' : 'No historical data available'}</p></div>`;
        container.style.display = 'block';
        return;
    }
    
    let html = `
        <div class="section-card">
            <h3 class="section-title">${currentLanguage === 'mk' ? 'Сите записи' : 'All Records'} (${history.length})</h3>
            <table class="price-history-table">
                <thead>
                    <tr>
                        <th>${currentLanguage === 'mk' ? 'Датум' : 'Date'}</th>
                        <th>${currentLanguage === 'mk' ? 'Отворање' : 'Open'}</th>
                        <th>${currentLanguage === 'mk' ? 'Највисока' : 'High'}</th>
                        <th>${currentLanguage === 'mk' ? 'Најниска' : 'Low'}</th>
                        <th>${currentLanguage === 'mk' ? 'Затворање' : 'Close'}</th>
                        <th>${currentLanguage === 'mk' ? 'Волумен' : 'Volume'}</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    [...history].reverse().forEach(day => {
        html += `
            <tr>
                <td>${day.date}</td>
                <td>${formatPrice(day.open)}</td>
                <td style="color: var(--success)">${formatPrice(day.high)}</td>
                <td style="color: var(--danger)">${formatPrice(day.low)}</td>
                <td>${formatPrice(day.close)}</td>
                <td>${formatLargeNumber(day.volume)}</td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
    container.style.display = 'block';
}

function groupByMonth(history) {
    const grouped = {};
    
    history.forEach(record => {
        const date = record.date;
        // YYYY-MM-DD -> YYYY-MM
        const monthKey = date.substring(0, 7);
        
        if (!grouped[monthKey]) {
            grouped[monthKey] = [];
        }
        grouped[monthKey].push(record);
    });
    
    Object.keys(grouped).forEach(key => {
        grouped[key].sort((a, b) => b.date.localeCompare(a.date));
    });
    
    return grouped;
}

function formatMonthName(monthKey) {
    const [year, month] = monthKey.split('-');
    const monthNames = currentLanguage === 'mk' 
        ? ['Јануари', 'Февруари', 'Март', 'Април', 'Мај', 'Јуни', 'Јули', 'Август', 'Септември', 'Октомври', 'Ноември', 'Декември']
        : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return `${monthNames[parseInt(month) - 1]} ${year}`;
}
let currentInfoSymbol = null;


function showCryptoInfo(symbol) {
    currentInfoSymbol = symbol;
    navigateTo('crypto-info');
    loadCryptoInfoPage(symbol);
}

function loadCryptoInfoPage(symbol) {
    const crypto = cryptoData.symbols.find(c => c.symbol === symbol);
    const historyRaw = cryptoData.price_history[symbol];
    const history = getHistoryAsArray(historyRaw);
    
    const container = document.getElementById('cryptoInfoContent');
    
    if (!crypto || !history || history.length === 0) {
        container.innerHTML = `<div class="section-card"><p style="text-align:center;padding:3rem;color:var(--text-secondary)">${currentLanguage === 'mk' ? 'Нема податоци' : 'No data available'}</p></div>`;
        return;
    }
    
    const last30Days = history.slice(-30);
    
    const avgPrice = last30Days.reduce((sum, d) => sum + d.close, 0) / last30Days.length;
    const maxPrice = Math.max(...last30Days.map(d => d.high));
    const minPrice = Math.min(...last30Days.map(d => d.low));
    const totalVolume = last30Days.reduce((sum, d) => sum + d.volume, 0);
    
    const firstDay = last30Days[0];
    const lastDay = last30Days[last30Days.length - 1];
    const priceChange = ((lastDay.close - firstDay.close) / firstDay.close) * 100;
    
    document.getElementById('infoSymbol').textContent = crypto.name;
    document.getElementById('infoCurrentPrice').textContent = formatPrice(lastDay.close);
    
    const changeEl = document.getElementById('infoChange');
    changeEl.textContent = `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}% (30d)`;
    changeEl.className = `info-price-change ${priceChange >= 0 ? 'positive' : 'negative'}`;
    
    const chartSvg = generatePriceChart(last30Days, priceChange >= 0);
    
    let html = `
        <div class="info-stats-grid">
            <div class="info-stat">
                <span class="info-stat-label">${currentLanguage === 'mk' ? 'Просечна цена' : 'Avg Price'}</span>
                <span class="info-stat-value">${formatPrice(avgPrice)}</span>
            </div>
            <div class="info-stat">
                <span class="info-stat-label">${currentLanguage === 'mk' ? 'Највисока' : 'Highest'}</span>
                <span class="info-stat-value positive">${formatPrice(maxPrice)}</span>
            </div>
            <div class="info-stat">
                <span class="info-stat-label">${currentLanguage === 'mk' ? 'Најниска' : 'Lowest'}</span>
                <span class="info-stat-value negative">${formatPrice(minPrice)}</span>
            </div>
            <div class="info-stat">
                <span class="info-stat-label">${currentLanguage === 'mk' ? 'Вкупен волумен' : 'Total Volume'}</span>
                <span class="info-stat-value">${formatLargeNumber(totalVolume)}</span>
            </div>
        </div>

        <div class="section-card price-chart-card">
            <h3 class="section-title">${currentLanguage === 'mk' ? 'График на цени (30 дена)' : 'Price Chart (30 Days)'}</h3>
            <div class="price-chart-container">
                ${chartSvg}
            </div>
            <div class="chart-legend">
                <div class="legend-item">
                    <span class="legend-dot close"></span>
                    <span>${currentLanguage === 'mk' ? 'Затворање' : 'Close'}</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot high"></span>
                    <span>${currentLanguage === 'mk' ? 'Највисока' : 'High'}</span>
                </div>
                <div class="legend-item">
                    <span class="legend-dot low"></span>
                    <span>${currentLanguage === 'mk' ? 'Најниска' : 'Low'}</span>
                </div>
            </div>
        </div>

        <div class="section-card">
            <h3 class="section-title">${currentLanguage === 'mk' ? 'Детали по ден' : 'Daily Details'}</h3>
            <div class="info-table-wrapper">
                <table class="info-table">
                    <thead>
                        <tr>
                            <th>${currentLanguage === 'mk' ? 'Датум' : 'Date'}</th>
                            <th>${currentLanguage === 'mk' ? 'Отворање' : 'Open'}</th>
                            <th>${currentLanguage === 'mk' ? 'Највисока' : 'High'}</th>
                            <th>${currentLanguage === 'mk' ? 'Најниска' : 'Low'}</th>
                            <th>${currentLanguage === 'mk' ? 'Затворање' : 'Close'}</th>
                            <th>${currentLanguage === 'mk' ? 'Волумен' : 'Volume'}</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    [...last30Days].reverse().forEach(day => {
        html += `
            <tr>
                <td>${day.date}</td>
                <td>${formatPrice(day.open)}</td>
                <td style="color: var(--success)">${formatPrice(day.high)}</td>
                <td style="color: var(--danger)">${formatPrice(day.low)}</td>
                <td>${formatPrice(day.close)}</td>
                <td>${formatLargeNumber(day.volume)}</td>
            </tr>
        `;
    });
    
    html += `
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
    
    setTimeout(() => initChartInteractivity(), 100);
}

function generatePriceChart(data, isPositive) {
    const width = 800;
    const height = 300;
    const padding = { top: 30, right: 60, bottom: 50, left: 80 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    const allPrices = data.flatMap(d => [d.high, d.low, d.close]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;
    const pricePadding = priceRange * 0.1;
    
    const scaleX = (i) => padding.left + (i / (data.length - 1)) * chartWidth;
    const scaleY = (price) => padding.top + chartHeight - ((price - minPrice + pricePadding) / (priceRange + 2 * pricePadding)) * chartHeight;
    
    const closePoints = data.map((d, i) => `${scaleX(i)},${scaleY(d.close)}`).join(' ');
    const highPoints = data.map((d, i) => `${scaleX(i)},${scaleY(d.high)}`).join(' ');
    const lowPoints = data.map((d, i) => `${scaleX(i)},${scaleY(d.low)}`).join(' ');
    
    const areaPath = `M ${scaleX(0)},${scaleY(data[0].close)} ` +
        data.map((d, i) => `L ${scaleX(i)},${scaleY(d.close)}`).join(' ') +
        ` L ${scaleX(data.length - 1)},${padding.top + chartHeight} L ${scaleX(0)},${padding.top + chartHeight} Z`;
    
    const yLabels = [];
    for (let i = 0; i <= 4; i++) {
        const price = minPrice - pricePadding + (priceRange + 2 * pricePadding) * (1 - i / 4);
        const y = padding.top + (chartHeight * i / 4);
        yLabels.push(`
            <text x="${padding.left - 10}" y="${y + 4}" class="chart-label y-label">${formatPrice(price)}</text>
            <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" class="grid-line"/>
        `);
    }
    
    const xLabels = [];
    const step = Math.max(1, Math.floor(data.length / 6));
    for (let i = 0; i < data.length; i += step) {
        const x = scaleX(i);
        xLabels.push(`
            <text x="${x}" y="${height - padding.bottom + 20}" class="chart-label x-label">${data[i].date.slice(5)}</text>
            <line x1="${x}" y1="${padding.top}" x2="${x}" y2="${padding.top + chartHeight}" class="grid-line vertical"/>
        `);
    }
    xLabels.push(`
        <text x="${scaleX(data.length - 1)}" y="${height - padding.bottom + 20}" class="chart-label x-label">${data[data.length - 1].date.slice(5)}</text>
    `);
    
    const interactivePoints = data.map((d, i) => `
        <circle cx="${scaleX(i)}" cy="${scaleY(d.close)}" r="4" class="chart-point close-point" 
            data-date="${d.date}" data-price="${formatPrice(d.close)}" data-high="${formatPrice(d.high)}" data-low="${formatPrice(d.low)}"/>
    `).join('');
    
    const gradientId = isPositive ? 'positiveGradient' : 'negativeGradient';
    const lineColor = isPositive ? '#10b981' : '#ef4444';
    const gradientColor = isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
    
    return `
        <svg viewBox="0 0 ${width} ${height}" class="price-chart-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
                <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style="stop-color:${lineColor};stop-opacity:0.3"/>
                    <stop offset="100%" style="stop-color:${lineColor};stop-opacity:0"/>
                </linearGradient>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            
            ${yLabels.join('')}
            ${xLabels.join('')}
            
            <path d="${areaPath}" fill="url(#${gradientId})" class="chart-area"/>
            
            <polyline points="${highPoints}" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,4" class="chart-line high-line" opacity="0.6"/>
            
            <polyline points="${lowPoints}" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,4" class="chart-line low-line" opacity="0.6"/>
            
            <polyline points="${closePoints}" fill="none" stroke="${lineColor}" stroke-width="3" class="chart-line close-line" filter="url(#glow)"/>
            
            ${interactivePoints}
            
            <g id="chartTooltip" class="chart-tooltip" style="display:none;">
                <rect x="0" y="0" width="140" height="70" rx="8" fill="rgba(30,41,59,0.95)"/>
                <text x="10" y="20" class="tooltip-date" fill="white" font-size="11">Date</text>
                <text x="10" y="38" class="tooltip-price" fill="${lineColor}" font-size="13" font-weight="600">$0.00</text>
                <text x="10" y="55" class="tooltip-range" fill="#94a3b8" font-size="10">H: $0 / L: $0</text>
            </g>
        </svg>
    `;
}

function initChartInteractivity() {
    const svg = document.querySelector('.price-chart-svg');
    if (!svg) return;
    
    const tooltip = svg.querySelector('#chartTooltip');
    const points = svg.querySelectorAll('.chart-point');
    
    points.forEach(point => {
        point.addEventListener('mouseenter', (e) => {
            const date = point.getAttribute('data-date');
            const price = point.getAttribute('data-price');
            const high = point.getAttribute('data-high');
            const low = point.getAttribute('data-low');
            
            tooltip.querySelector('.tooltip-date').textContent = date;
            tooltip.querySelector('.tooltip-price').textContent = price;
            tooltip.querySelector('.tooltip-range').textContent = `H: ${high} / L: ${low}`;
            
            const x = parseFloat(point.getAttribute('cx'));
            const y = parseFloat(point.getAttribute('cy'));
            tooltip.setAttribute('transform', `translate(${x - 70}, ${y - 80})`);
            tooltip.style.display = 'block';
            
            point.setAttribute('r', '7');
        });
        
        point.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
            point.setAttribute('r', '4');
        });
    });
}

function backToDashboard() {
    navigateTo('dashboard');
}

window.navigateTo = navigateTo;
window.viewCryptoDetail = viewCryptoDetail;
window.showAddCryptoModal = showAddCryptoModal;
window.closeAddCryptoModal = closeAddCryptoModal;
window.addToWatchlist = addToWatchlist;
window.removeFromWatchlist = removeFromWatchlist;
window.refreshData = refreshData;
window.calculatePrediction = calculatePrediction;
window.initPredictionPage = initPredictionPage;
window.handleSearch = handleSearch;
window.selectSearchResult = selectSearchResult;
window.initHistoryPage = initHistoryPage;
window.loadHistoryData = loadHistoryData;
window.showCryptoInfo = showCryptoInfo;
window.backToDashboard = backToDashboard;

console.log('[APP] Script loaded!');

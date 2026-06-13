const API_BASE_URL = 'http://localhost:8000';

let cryptoData = null;
let watchlist = [];
let isLoggedIn = false;
let currentLanguage = 'en';
let currentInfoSymbol = null;

//za login
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
        navPortfolio: 'Favorites',
        navPredict: 'Prediction',
        navHistory: 'History',
        navTechnical: 'Technical Analysis',
        navOnChain: 'On-Chain Metrics',
        navSettings: 'Settings',
        onchainTitle: 'On-Chain Metrics',
        onchainDesc: 'Analyze blockchain network activity indicators including active addresses and transaction volume',
        selectCryptoOnChain: 'Select Cryptocurrency',
        loadMetricsBtn: 'Load Metrics',
        totalMarketCap: 'Total Market Cap',
        totalVolume: '24h Total Volume',
        btcDominance: 'Bitcoin Dominance',
        topCryptos: 'Top Cryptocurrencies',
        refreshData: 'Refresh Data',
        searchPlaceholder: 'Search cryptocurrencies...',
        myPortfolio: 'My Favorites',
        addCrypto: '+ Add Cryptocurrency',
        historyTitle: 'Historical Data',
        predictTitle: 'Price Prediction',
        technicalTitle: 'Technical Analysis',
        footerText: '© 2025 CryptoAnalyzer. All rights reserved.'
    },
    mk: {
        loginTitle: 'Најави се во<br>CryptoAnalyzer',
        loginSubtitle: 'Пристапи до пазарните информации',
        email: 'Е-пошта',
        password: 'Лозинка',
        loginBtn: 'Најава',
        navDashboard: 'Контролна табла',
        navPortfolio: 'Омилени',
        navPredict: 'Предвидување',
        navHistory: 'Историја',
        navTechnical: 'Техничка Анализа',
        navOnChain: 'On-Chain Метрики',
        navSentiment: 'Анализа на Сентимент',
        navSettings: 'Подесувања',
        sentimentTitle: 'Анализа на Сентимент',
        sentimentDesc: 'Анализирај пазарен сентимент од социјални мрежи, вести и најави користејќи NLP техники',
        selectCryptoSentiment: 'Избери Криптовалута',
        analyzeSentimentBtn: 'Анализирај Сентимент',
        onchainTitle: 'On-Chain Метрики',
        onchainDesc: 'Анализирај индикатори за активност на блокчејн мрежата вклучувајќи активни адреси и обем на трансакции',
        selectCryptoOnChain: 'Избери Криптовалута',
        loadMetricsBtn: 'Вчитај Метрики',
        footerText: '© 2025 CryptoAnalyzer. Сите права задржани.'
    }
};

document.addEventListener('DOMContentLoaded', function() {
    loadSavedLanguage();
    loadSavedTheme();
    checkLoginStatus();
    loadData();
    setupNavigation();
    setupSettingsTabs();
    setupThemeSwitcher();
    loadWatchlistFromStorage();
});

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
        if (t[key]) el.innerHTML = t[key];
    });
    document.querySelectorAll('[data-translate-placeholder]').forEach(el => {
        const key = el.getAttribute('data-translate-placeholder');
        if (t[key]) el.placeholder = t[key];
    });
}

function loadSavedLanguage() {
    const savedLang = localStorage.getItem('language') || 'en';
    setLanguage(savedLang);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.checked = radio.value === theme;
    });
}

function setupThemeSwitcher() {
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) setTheme(this.value);
        });
    });
}

function checkLoginStatus() {
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') showApp();
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
        }, 500);
    } else {
        alert('Please enter valid credentials');
    }
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appContainer').style.display = 'flex';
    document.getElementById('appContainer').classList.add('visible');
    isLoggedIn = true;
    if (!cryptoData) {
        loadData();
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userEmail');
    document.getElementById('appContainer').classList.remove('visible');
    document.getElementById('appContainer').style.display = 'none';
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.querySelector('.btn-login').textContent = 'Login';
    document.querySelector('.btn-login').disabled = false;
    isLoggedIn = false;
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


async function loadData() {
    try {
        console.log('Fetching symbols from API:', `${API_BASE_URL}/symbols`);
        const startTime = Date.now();

        let symbolsResponse;
        try {
            symbolsResponse = await fetch(`${API_BASE_URL}/symbols`);
            const elapsed = Date.now() - startTime;
            console.log(`API response received in ${elapsed}ms, status:`, symbolsResponse.status);
        } catch (fetchError) {
            console.error('Fetch error:', fetchError);
            console.error('Error details:', fetchError.message, fetchError.name);
            console.log('Network error - API might not be running. Using fallback...');
            loadDataFromFallback();
            return;
        }

        if (!symbolsResponse.ok) {
            const errorText = await symbolsResponse.text();
            console.error(`API returned error ${symbolsResponse.status}:`, errorText);
            console.log('Using fallback: Loading data from local JSON file...');
            loadDataFromFallback();
            return;
        }

        const symbols = await symbolsResponse.json();
        console.log('✅ Successfully loaded', symbols.length, 'symbols from API');

        if (!symbols || symbols.length === 0) {
            console.warn('API returned empty array, using fallback...');
            loadDataFromFallback();
            return;
        }
        const processedSymbols = symbols.map(s => ({
            symbol: s.symbol,
            base: s.base,
            quote: s.quote,
            name: s.name || s.base,
            quote_volume: s.quote_volume || (Math.random() * 500000000 + 100000000)
        }));

        const totalVolume = processedSymbols.reduce((sum, s) => sum + s.quote_volume, 0);

        cryptoData = {
            symbols: processedSymbols,
            price_history: {},
            market_stats: {
                total_market_cap: 2.34,
                total_volume_24h: totalVolume,
                btc_dominance: 52.1
            }
        };

        console.log('Loading price history for top symbols...');
        const topSymbols = symbols.slice(0, 50);
        const historyPromises = topSymbols.map(async (sym) => {
            try {
                const historyResponse = await fetch(`${API_BASE_URL}/crypto/${sym.symbol}/history`);
                if (historyResponse.ok) {
                    const history = await historyResponse.json();
                    return { symbol: sym.symbol, history };
                }
            } catch (e) {
                console.warn(`Could not load history for ${sym.symbol}`);
            }
            return null;
        });

        const historyResults = await Promise.all(historyPromises);
        historyResults.forEach(result => {
            if (result && result.history) {
                cryptoData.price_history[result.symbol] = result.history;
            }
        });

        console.log('Updating dashboard...');
        updateDashboard();
        updateCryptoSelector();
        initPredictionPage();
        initHistoryPage();
        initTechnicalPage();
        initOnChainPage();
        initSentimentPage();
        updatePortfolioTable();
        console.log('Data loading complete!');

    } catch (error) {
        console.error('Failed to load from API:', error);
        console.error('Error details:', error.message, error.stack);
        console.log('Using fallback: Loading data from local JSON file...');
        loadDataFromFallback();
    }
}

function loadDataFromFallback() {
    console.log('Loading fallback data from local JSON...');
    fetch('data/crypto_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Fallback JSON file not found');
            }
            return response.json();
        })
        .then(data => {
            console.log('Loaded fallback data:', data);
            if (data.symbols && data.symbols.length > 0) {
                cryptoData = {
                    symbols: data.symbols,
                    price_history: data.price_history || {},
                    market_stats: data.market_stats || {
                        total_market_cap: 2.34,
                        total_volume_24h: 98700000000,
                        btc_dominance: 52.1
                    }
                };
                updateDashboard();
                updateCryptoSelector();
                initPredictionPage();
                initHistoryPage();
                initTechnicalPage();
                initOnChainPage();
                initSentimentPage();
                updatePortfolioTable();
                console.log('Fallback data loaded successfully!');
            } else {
                console.error('Fallback data is empty or invalid');
                alert('Unable to load data. Please check if the server is running and try refreshing the page.');
            }
        })
        .catch(error => {
            console.error('Failed to load fallback data:', error);
            alert('Unable to load data. Please check if the server is running on localhost:8000');
        });
}

function refreshData() {
    loadData();
}
function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
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
    if (targetPage) targetPage.classList.add('active');

    const titles = {
        'dashboard': 'Dashboard',
        'crypto-info': 'Crypto Info',
        'portfolio': 'Portfolio',
        'predict': 'Prediction',
        'history': 'History',
        'technical': 'Technical Analysis',
        'onchain': 'On-Chain Metrics',
        'sentiment': 'Sentiment Analysis',
        'settings': 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[pageName] || 'Dashboard';
}

function backToDashboard() {
    navigateTo('dashboard');
}

function updateDashboard() {
    console.log('updateDashboard called, cryptoData:', cryptoData);
    if (!cryptoData) {
        console.log('No cryptoData available');
        return;
    }

    const stats = cryptoData.market_stats;
    console.log('Market stats:', stats);
    const marketCapEl = document.getElementById('totalMarketCap');
    const volumeEl = document.getElementById('totalVolume');
    const btcDomEl = document.getElementById('btcDominance');

    if (marketCapEl) marketCapEl.textContent = '$' + stats.total_market_cap.toFixed(2) + 'T';
    if (volumeEl) volumeEl.textContent = formatLargeNumber(stats.total_volume_24h);
    if (btcDomEl) btcDomEl.textContent = stats.btc_dominance + '%';

    const tableBody = document.getElementById('cryptoTableBody');
    if (!tableBody) {
        console.error('Table body element not found!');
        return;
    }
    tableBody.innerHTML = '';
    console.log('Displaying', cryptoData.symbols.length, 'cryptocurrencies');

    const seenBases = new Set();
    const uniqueCryptos = cryptoData.symbols.filter(crypto => {
        if (seenBases.has(crypto.base)) return false;
        seenBases.add(crypto.base);
        return true;
    }).slice(0, 100);
    uniqueCryptos.forEach(crypto => {
        const history = cryptoData.price_history[crypto.symbol] || [];
        const lastRecord = history.length > 0 ? history[history.length - 1] : null;
        const lastPrice = lastRecord ? lastRecord.close : null;
        const change = (Math.random() * 10 - 3).toFixed(2);
        const isPositive = parseFloat(change) >= 0;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="symbol-bold">${crypto.base}</span></td>
            <td>${crypto.name}</td>
            <td>${lastPrice ? formatPrice(lastPrice) : '-'}</td>
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
                <button class="btn-info" onclick="showCryptoInfo('${crypto.symbol}')">Info</button>
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

async function showCryptoInfo(symbol) {
    currentInfoSymbol = symbol;
    navigateTo('crypto-info');

    const crypto = cryptoData.symbols.find(c => c.symbol === symbol);
    document.getElementById('infoSymbol').textContent = crypto ? crypto.name : symbol;
    document.getElementById('infoCurrentPrice').textContent = 'Loading...';
    document.getElementById('infoChange').textContent = '';
    document.getElementById('technicalAnalysisCard').style.display = 'none';
    document.getElementById('cryptoInfoContent').innerHTML = '<p style="text-align:center;padding:2rem;">Loading data...</p>';

    try {
        const analysisResponse = await fetch(`${API_BASE_URL}/analysis/${symbol}`);
        if (analysisResponse.ok) {
            const analysis = await analysisResponse.json();
            console.log('[ANALYSIS]', analysis);

            document.getElementById('technicalAnalysisCard').style.display = 'block';

            const signalEl = document.getElementById('taSignal');
            signalEl.textContent = analysis.signals.final;
            signalEl.style.color = analysis.signals.final === 'BUY' ? '#10b981' :
                                   analysis.signals.final === 'SELL' ? '#ef4444' : '#f59e0b';

            document.getElementById('taRSI').textContent = analysis.indicators.RSI.toFixed(2);
            document.getElementById('taADX').textContent = analysis.indicators.ADX.toFixed(2);
            document.getElementById('taMACD').textContent = analysis.indicators.MACD.toFixed(4);

            const taTable = document.getElementById('taIndicatorsTable');
            if (taTable) {
                taTable.innerHTML = Object.entries(analysis.indicators)
                    .map(([name, value]) => `
                        <tr>
                            <td>${name}</td>
                            <td>${typeof value === 'number' ? value.toFixed(4) : value}</td>
                        </tr>
                    `).join('');
            }
        }

        const historyResponse = await fetch(`${API_BASE_URL}/crypto/${symbol}/history`);
        if (historyResponse.ok) {
            const history = await historyResponse.json();
            if (history.length > 0) {
                const latest = history[history.length - 1];
                document.getElementById('infoCurrentPrice').textContent = formatPrice(latest.close);

                if (history.length > 1) {
                    const prev = history[history.length - 2];
                    const change = ((latest.close - prev.close) / prev.close * 100).toFixed(2);
                    const changeEl = document.getElementById('infoChange');
                    changeEl.textContent = `${change >= 0 ? '+' : ''}${change}% (24h)`;
                    changeEl.className = `info-price-change ${change >= 0 ? 'positive' : 'negative'}`;
                }

                let html = `
                    <div class="section-card">
                        <h3 class="section-title">Price History (Last 30 Days)</h3>
                        <table class="price-history-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Open</th>
                                    <th>High</th>
                                    <th>Low</th>
                                    <th>Close</th>
                                    <th>Volume</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                [...history].reverse().slice(0, 30).forEach(day => {
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

                html += '</tbody></table></div>';
                document.getElementById('cryptoInfoContent').innerHTML = html;

                drawPriceChart(history.slice(-30));
            }
        }

        await loadOnChainMetrics(symbol);
    } catch (error) {
        console.error('[ERROR]', error);
        document.getElementById('infoCurrentPrice').textContent = 'Error loading data';
    }
}

function drawPriceChart(history) {
    const chartCard = document.getElementById('priceChartCard');
    const canvas = document.getElementById('priceChart');

    if (!chartCard || !canvas || !history || history.length === 0) return;

    chartCard.style.display = 'block';

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 20, right: 60, bottom: 30, left: 20 };

    const prices = history.map(d => d.close);
    const dates = history.map(d => d.date);

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const priceRange = maxPrice - minPrice || 1;

    document.getElementById('chartHigh').textContent = formatPrice(maxPrice);
    document.getElementById('chartLow').textContent = formatPrice(minPrice);
    document.getElementById('chartAvg').textContent = formatPrice(avgPrice);

    ctx.clearRect(0, 0, width, height);

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();

        const price = maxPrice - (priceRange / 4) * i;
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(formatPrice(price), width - padding.right + 5, y + 4);
    }

    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.02)');

    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);

    prices.forEach((price, i) => {
        const x = padding.left + (chartWidth / (prices.length - 1)) * i;
        const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
        ctx.lineTo(x, y);
    });

    ctx.lineTo(padding.left + chartWidth, height - padding.bottom);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    prices.forEach((price, i) => {
        const x = padding.left + (chartWidth / (prices.length - 1)) * i;
        const y = padding.top + chartHeight - ((price - minPrice) / priceRange) * chartHeight;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    const maxIndex = prices.indexOf(maxPrice);
    const minIndex = prices.indexOf(minPrice);

    const maxX = padding.left + (chartWidth / (prices.length - 1)) * maxIndex;
    const maxY = padding.top + chartHeight - ((maxPrice - minPrice) / priceRange) * chartHeight;
    ctx.beginPath();
    ctx.arc(maxX, maxY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    const minX = padding.left + (chartWidth / (prices.length - 1)) * minIndex;
    const minY = padding.top + chartHeight - ((minPrice - minPrice) / priceRange) * chartHeight;
    ctx.beginPath();
    ctx.arc(minX, minY, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#ef4444';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    const labelCount = Math.min(5, dates.length);
    for (let i = 0; i < labelCount; i++) {
        const idx = Math.floor(i * (dates.length - 1) / (labelCount - 1));
        const x = padding.left + (chartWidth / (prices.length - 1)) * idx;
        const date = new Date(dates[idx]);
        const label = `${date.getDate()}/${date.getMonth() + 1}`;
        ctx.fillText(label, x, height - 8);
    }
}

async function loadOnChainMetrics(symbol) {
    try {
        const response = await fetch(`${API_BASE_URL}/onchain/${symbol}/metrics`);
        if (!response.ok) {
            console.warn(`[ONCHAIN] Could not load metrics for ${symbol}`);
            document.getElementById('onchainMetricsCard').style.display = 'none';
            return;
        }

        const data = await response.json();
        console.log('[ONCHAIN]', data);

        document.getElementById('onchainMetricsCard').style.display = 'block';

        const activeAddresses = data.metrics.active_addresses;
        document.getElementById('onchainActiveAddresses').textContent = formatNumberLarge(activeAddresses.value);
        const activeAddressesChangeEl = document.getElementById('onchainActiveAddressesChange');
        activeAddressesChangeEl.textContent = `${activeAddresses.change_24h >= 0 ? '+' : ''}${activeAddresses.change_24h.toFixed(2)}%`;
        activeAddressesChangeEl.className = `onchain-change ${activeAddresses.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainActiveAddressesDesc').textContent = activeAddresses.description;

        const transactions = data.metrics.transactions;
        document.getElementById('onchainTransactions').textContent = formatNumberLarge(transactions.value);
        const transactionsChangeEl = document.getElementById('onchainTransactionsChange');
        transactionsChangeEl.textContent = `${transactions.change_24h >= 0 ? '+' : ''}${transactions.change_24h.toFixed(2)}%`;
        transactionsChangeEl.className = `onchain-change ${transactions.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainTransactionsDesc').textContent = transactions.description;

        if (data.historical && data.historical.length > 0) {
            drawOnChainChart(data.historical);
        }
    } catch (error) {
        console.error('[ONCHAIN ERROR]', error);
        document.getElementById('onchainMetricsCard').style.display = 'none';
    }
}

function drawOnChainChart(historicalData) {
    const canvas = document.getElementById('onchainChart');
    if (!canvas || !historicalData || historicalData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 20, right: 80, bottom: 40, left: 60 };

    const activeAddresses = historicalData.map(d => d.active_addresses);
    const transactions = historicalData.map(d => d.transactions);
    const dates = historicalData.map(d => {
        const date = new Date(d.date * 1000);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const minAddresses = Math.min(...activeAddresses);
    const maxAddresses = Math.max(...activeAddresses);
    const minTransactions = Math.min(...transactions);
    const maxTransactions = Math.max(...transactions);

    // Add padding to ranges to prevent flat lines when values are similar
    const addressesRange = maxAddresses - minAddresses || (maxAddresses * 0.1) || 1;
    const transactionsRange = maxTransactions - minTransactions || (maxTransactions * 0.1) || 1;

    // Adjust min values to add padding at bottom (10% of range)
    const adjustedMinAddresses = minAddresses - (addressesRange * 0.1);
    const adjustedMinTransactions = minTransactions - (transactionsRange * 0.1);
    const adjustedAddressesRange = addressesRange * 1.2; // Add 20% padding total
    const adjustedTransactionsRange = transactionsRange * 1.2;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    activeAddresses.forEach((value, i) => {
        const x = padding.left + (chartWidth / Math.max(activeAddresses.length - 1, 1)) * i;
        const y = padding.top + chartHeight - ((value - adjustedMinAddresses) / adjustedAddressesRange) * chartHeight;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    transactions.forEach((value, i) => {
        const x = padding.left + (chartWidth / Math.max(transactions.length - 1, 1)) * i;
        const y = padding.top + chartHeight - ((value - adjustedMinTransactions) / adjustedTransactionsRange) * chartHeight;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';

    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Active Addresses', width - padding.right + 5, padding.top + 15);

    ctx.fillStyle = '#10b981';
    ctx.fillText('Transactions', width - padding.right + 5, padding.top + 30);

    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'center';
    dates.forEach((date, i) => {
        const x = padding.left + (chartWidth / (dates.length - 1)) * i;
        ctx.fillText(date, x, height - 10);
    });
}

function initPredictionPage() {
    if (!cryptoData) return;
    const select = document.getElementById('predictCryptoSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- Select --</option>';
    cryptoData.symbols.forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto.symbol;
        option.textContent = `${crypto.base} - ${crypto.name}`;
        select.appendChild(option);
    });
}

async function getLSTMPrediction() {
    const select = document.getElementById('predictCryptoSelect');
    const symbol = select.value;

    if (!symbol) {
        alert('Please select a cryptocurrency');
        return;
    }

    const crypto = cryptoData.symbols.find(c => c.symbol === symbol);
    document.getElementById('predictSymbol').textContent = crypto ? crypto.base : symbol;
    document.getElementById('predictName').textContent = crypto ? crypto.name : '';

    try {
        const response = await fetch(`${API_BASE_URL}/lstm/predict/${symbol}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Prediction failed');
        }

        const prediction = await response.json();
        console.log('[PREDICTION]', prediction);

        const currentPrice = prediction.current_price;
        const predictedPrice = prediction.predicted_price;
        const change = prediction.price_change_pct || ((predictedPrice - currentPrice) / currentPrice) * 100;

        document.getElementById('currentPriceValue').textContent = formatPrice(currentPrice);
        document.getElementById('predictedPriceValue').textContent = formatPrice(predictedPrice);

        const changeEl = document.getElementById('expectedChangeValue');
        changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        changeEl.className = 'prediction-value ' + (change >= 0 ? 'positive' : 'negative');

        const signalEl = document.getElementById('predictionSignal');
        if (signalEl && prediction.signal) {
            signalEl.textContent = prediction.signal;
            signalEl.className = 'prediction-signal ' + prediction.signal.toLowerCase().replace(' ', '-');
        }

        const metricsEl = document.getElementById('modelMetrics');
        if (metricsEl && prediction.model_metrics) {
            const metrics = prediction.model_metrics;
            metricsEl.innerHTML = `
                <div class="metrics-grid">
                    <div class="metric-item">
                        <span class="metric-label">RMSE</span>
                        <span class="metric-value">${metrics.rmse ? metrics.rmse.toFixed(4) : '-'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">MAPE</span>
                        <span class="metric-value">${metrics.mape ? metrics.mape.toFixed(2) + '%' : '-'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">R²</span>
                        <span class="metric-value">${metrics.r2 ? metrics.r2.toFixed(4) : '-'}</span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Lookback</span>
                        <span class="metric-value">${prediction.lookback_days || 30} days</span>
                    </div>
                </div>
            `;
            metricsEl.style.display = 'block';
        }

        document.getElementById('predictionResult').style.display = 'block';

    } catch (error) {
        console.error('[ERROR]', error);
        alert('Prediction failed: ' + error.message + '\n\nMake sure there is a trained model for this symbol.');
    }
}

function initHistoryPage() {
    if (!cryptoData) return;
    const select = document.getElementById('historyCryptoSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- Select --</option>';
    cryptoData.symbols.forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto.symbol;
        option.textContent = `${crypto.base} - ${crypto.name}`;
        select.appendChild(option);
    });
}

async function loadHistoryData() {
    const select = document.getElementById('historyCryptoSelect');
    const symbol = select.value;
    const container = document.getElementById('historyContent');
    const tbody = document.getElementById('priceHistoryBody');

    if (!symbol) {
        container.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/crypto/${symbol}/history`);
        if (!response.ok) throw new Error('Failed to load history');

        const history = await response.json();
        tbody.innerHTML = '';

        [...history].reverse().forEach(day => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${day.date}</td>
                <td>${formatPrice(day.open)}</td>
                <td style="color: var(--success)">${formatPrice(day.high)}</td>
                <td style="color: var(--danger)">${formatPrice(day.low)}</td>
                <td>${formatPrice(day.close)}</td>
                <td>${formatLargeNumber(day.volume)}</td>
            `;
            tbody.appendChild(row);
        });

        container.style.display = 'block';
    } catch (error) {
        console.error('[ERROR]', error);
        container.style.display = 'none';
    }
}

function initTechnicalPage() {
    if (!cryptoData) return;
    const select = document.getElementById('technicalCryptoSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- Select --</option>';
    cryptoData.symbols.forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto.symbol;
        option.textContent = `${crypto.base} - ${crypto.name}`;
        select.appendChild(option);
    });
}

async function loadTechnicalAnalysis() {
    const select = document.getElementById('technicalCryptoSelect');
    const symbol = select.value;
    const timeframeSelect = document.getElementById('technicalTimeframe');
    const timeframe = timeframeSelect ? timeframeSelect.value : '1d';

    if (!symbol) {
        alert('Please select a cryptocurrency');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/analysis/${symbol}?timeframe=${timeframe}`);
        if (!response.ok) {
            let errorMessage = 'Failed to load technical analysis';
            try {
                const errorData = await response.json();
                if (errorData.detail) {
                    errorMessage = errorData.detail;
                }
            } catch (e) {
                errorMessage = `Failed to load analysis (HTTP ${response.status})`;
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('[TECHNICAL]', data);

        const symbolEl = document.getElementById('technicalSymbol');
        const priceEl = document.getElementById('technicalPrice');
        const timeframeLabelEl = document.getElementById('technicalTimeframeLabel');

        if (symbolEl) symbolEl.textContent = symbol;
        if (priceEl) priceEl.textContent = formatPrice(data.current_price);
        if (timeframeLabelEl) {
            const tfLabels = { '1d': '1 Day', '1w': '1 Week', '1m': '1 Month' };
            timeframeLabelEl.textContent = `Timeframe: ${tfLabels[timeframe] || timeframe}`;
        }

        const overallBadge = document.getElementById('overallSignalBadge');
        const overallSignal = data.summary ? data.summary.overall_signal : data.signals.final;
        overallBadge.textContent = overallSignal;
        overallBadge.className = 'overall-signal-badge ' + overallSignal.toLowerCase();

        if (data.summary) {
            document.getElementById('buyCount').textContent = data.summary.buy_count;
            document.getElementById('sellCount').textContent = data.summary.sell_count;
            document.getElementById('holdCount').textContent = data.summary.hold_count;
        } else {
            const signals = data.signals.individual;
            document.getElementById('buyCount').textContent = signals.filter(s => s === 'BUY').length;
            document.getElementById('sellCount').textContent = signals.filter(s => s === 'SELL').length;
            document.getElementById('holdCount').textContent = signals.filter(s => s === 'HOLD').length;
        }

        const oscillatorsBody = document.getElementById('oscillatorsTableBody');
        if (oscillatorsBody && data.oscillators) {
            oscillatorsBody.innerHTML = '';
            Object.entries(data.oscillators).forEach(([name, indicator]) => {
                const row = document.createElement('tr');
                const value = indicator.value !== null ? indicator.value.toFixed(2) : '-';
                const signal = indicator.signal || 'HOLD';
                const description = indicator.description || '';

                row.innerHTML = `
                    <td><strong>${formatIndicatorName(name)}</strong></td>
                    <td>${value}</td>
                    <td><span class="signal-badge ${signal.toLowerCase()}">${signal}</span></td>
                    <td style="color: var(--text-secondary); font-size: 0.85rem;">${description}</td>
                `;
                oscillatorsBody.appendChild(row);
            });
        }

        const maBody = document.getElementById('movingAveragesTableBody');
        if (maBody && data.moving_averages) {
            maBody.innerHTML = '';
            Object.entries(data.moving_averages).forEach(([name, indicator]) => {
                const row = document.createElement('tr');
                let value = '-';

                if (name === 'Bollinger_Bands') {
                    value = indicator.middle !== null ? formatPrice(indicator.middle) : '-';
                } else if (name === 'Volume_MA') {
                    value = indicator.value !== null ? formatLargeNumber(indicator.value) : '-';
                } else {
                    value = indicator.value !== null ? formatPrice(indicator.value) : '-';
                }

                const signal = indicator.signal || 'HOLD';
                const description = indicator.description || '';

                row.innerHTML = `
                    <td><strong>${formatIndicatorName(name)}</strong></td>
                    <td>${value}</td>
                    <td><span class="signal-badge ${signal.toLowerCase()}">${signal}</span></td>
                    <td style="color: var(--text-secondary); font-size: 0.85rem;">${description}</td>
                `;
                maBody.appendChild(row);
            });
        }

        document.getElementById('technicalResult').style.display = 'block';
    } catch (error) {
        console.error('[ERROR]', error);
        alert('Failed to load technical analysis: ' + error.message);
    }
}

function formatIndicatorName(name) {
    const names = {
        'RSI': 'RSI',
        'MACD': 'MACD',
        'Stochastic': 'Stochastic',
        'ADX': 'ADX',
        'CCI': 'CCI',
        'SMA': 'SMA',
        'EMA': 'EMA',
        'WMA': 'WMA',
        'Bollinger_Bands': 'Bollinger Bands',
        'Volume_MA': 'Volume MA'
    };
    return names[name] || name;
}

function initOnChainPage() {
    if (!cryptoData) return;
    const select = document.getElementById('onchainCryptoSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- Select --</option>';
    cryptoData.symbols.forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto.symbol;
        option.textContent = `${crypto.base} - ${crypto.name}`;
        select.appendChild(option);
    });
}

async function loadOnChainMetricsPage() {
    const select = document.getElementById('onchainCryptoSelect');
    const symbol = select.value;

    if (!symbol) {
        alert('Please select a cryptocurrency');
        return;
    }

    const crypto = cryptoData.symbols.find(c => c.symbol === symbol);
    const resultDiv = document.getElementById('onchainResult');

    if (!resultDiv) return;

    resultDiv.style.display = 'block';
    document.getElementById('onchainSymbol').textContent = crypto ? `${crypto.base} (${crypto.name})` : symbol;
    document.getElementById('onchainLastUpdated').textContent = 'Loading...';
    document.getElementById('onchainPageActiveAddresses').textContent = '-';
    document.getElementById('onchainPageTransactions').textContent = '-';

    try {
        const response = await fetch(`${API_BASE_URL}/onchain/${symbol}/metrics`);
        if (!response.ok) {
            throw new Error('Failed to load on-chain metrics');
        }

        const data = await response.json();
        console.log('[ONCHAIN PAGE]', data);

        document.getElementById('onchainSymbol').textContent = crypto ? `${crypto.base} (${crypto.name})` : symbol;

        const lastUpdated = new Date(data.last_updated * 1000);
        document.getElementById('onchainLastUpdated').textContent = lastUpdated.toLocaleString();

        const activeAddresses = data.metrics.active_addresses;
        document.getElementById('onchainPageActiveAddresses').textContent = formatNumberLarge(activeAddresses.value);
        const activeAddressesChangeEl = document.getElementById('onchainPageActiveAddressesChange');
        activeAddressesChangeEl.textContent = `${activeAddresses.change_24h >= 0 ? '+' : ''}${activeAddresses.change_24h.toFixed(2)}%`;
        activeAddressesChangeEl.className = `onchain-change ${activeAddresses.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainPageActiveAddressesDesc').textContent = activeAddresses.description;

        const transactions = data.metrics.transactions;
        document.getElementById('onchainPageTransactions').textContent = formatNumberLarge(transactions.value);
        const transactionsChangeEl = document.getElementById('onchainPageTransactionsChange');
        transactionsChangeEl.textContent = `${transactions.change_24h >= 0 ? '+' : ''}${transactions.change_24h.toFixed(2)}%`;
        transactionsChangeEl.className = `onchain-change ${transactions.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainPageTransactionsDesc').textContent = transactions.description;

        const exchangeFlows = data.metrics.exchange_flows;
        document.getElementById('onchainPageExchangeInflow').textContent = formatNumberLarge(exchangeFlows.inflow);
        document.getElementById('onchainPageExchangeOutflow').textContent = formatNumberLarge(exchangeFlows.outflow);
        const netFlow = exchangeFlows.net_flow;
        const netFlowEl = document.getElementById('onchainPageExchangeNetFlow');
        netFlowEl.textContent = `${netFlow >= 0 ? '+' : ''}${formatNumberLarge(Math.abs(netFlow))}`;
        netFlowEl.style.color = netFlow >= 0 ? 'var(--danger)' : 'var(--success)';
        const exchangeFlowChangeEl = document.getElementById('onchainPageExchangeFlowChange');
        exchangeFlowChangeEl.textContent = `${exchangeFlows.change_24h >= 0 ? '+' : ''}${exchangeFlows.change_24h.toFixed(2)}%`;
        exchangeFlowChangeEl.className = `onchain-change ${exchangeFlows.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainPageExchangeFlowDesc').textContent = exchangeFlows.description;

        const whaleMovements = data.metrics.whale_movements;
        document.getElementById('onchainPageWhaleTransactions').textContent = formatNumberLarge(whaleMovements.transactions);
        document.getElementById('onchainPageWhaleVolume').textContent = formatNumberLarge(whaleMovements.volume);
        const whaleChangeEl = document.getElementById('onchainPageWhaleChange');
        whaleChangeEl.textContent = `${whaleMovements.change_24h >= 0 ? '+' : ''}${whaleMovements.change_24h.toFixed(2)}%`;
        whaleChangeEl.className = `onchain-change ${whaleMovements.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainPageWhaleDesc').textContent = whaleMovements.description;

        const hashRate = data.metrics.hash_rate;
        document.getElementById('onchainPageHashRate').textContent = hashRate.value.toFixed(2);
        document.getElementById('onchainPageHashRateUnit').textContent = hashRate.unit;
        const hashRateChangeEl = document.getElementById('onchainPageHashRateChange');
        hashRateChangeEl.textContent = `${hashRate.change_24h >= 0 ? '+' : ''}${hashRate.change_24h.toFixed(2)}%`;
        hashRateChangeEl.className = `onchain-change ${hashRate.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainPageHashRateDesc').textContent = hashRate.description;

        const tvl = data.metrics.tvl;
        document.getElementById('onchainPageTVL').textContent = tvl.value.toFixed(2);
        const tvlChangeEl = document.getElementById('onchainPageTVLChange');
        tvlChangeEl.textContent = `${tvl.change_24h >= 0 ? '+' : ''}${tvl.change_24h.toFixed(2)}%`;
        tvlChangeEl.className = `onchain-change ${tvl.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainPageTVLDesc').textContent = tvl.description;

        const nvtRatio = data.metrics.nvt_ratio;
        document.getElementById('onchainPageNVTRatio').textContent = nvtRatio.value.toFixed(2);
        const nvtRatioChangeEl = document.getElementById('onchainPageNVTRatioChange');
        nvtRatioChangeEl.textContent = `${nvtRatio.change_24h >= 0 ? '+' : ''}${nvtRatio.change_24h.toFixed(2)}%`;
        nvtRatioChangeEl.className = `onchain-change ${nvtRatio.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainPageNVTRatioDesc').textContent = nvtRatio.description;

        const mvrv = data.metrics.mvrv;
        document.getElementById('onchainPageMVRV').textContent = mvrv.value.toFixed(2);
        const mvrvChangeEl = document.getElementById('onchainPageMVRVChange');
        mvrvChangeEl.textContent = `${mvrv.change_24h >= 0 ? '+' : ''}${mvrv.change_24h.toFixed(2)}%`;
        mvrvChangeEl.className = `onchain-change ${mvrv.change_24h >= 0 ? 'positive' : 'negative'}`;
        document.getElementById('onchainPageMVRVDesc').textContent = mvrv.description;

        if (data.historical && data.historical.length > 0) {
            drawOnChainPageChart(data.historical);
        }

        resultDiv.style.display = 'block';
    } catch (error) {
        console.error('[ONCHAIN PAGE ERROR]', error);
        alert('Failed to load on-chain metrics: ' + error.message);
        resultDiv.style.display = 'none';
    }
}

function drawOnChainPageChart(historicalData) {
    const canvas = document.getElementById('onchainPageChart');
    if (!canvas || !historicalData || historicalData.length === 0) return;

    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 30, right: 100, bottom: 50, left: 70 };

    const activeAddresses = historicalData.map(d => d.active_addresses);
    const transactions = historicalData.map(d => d.transactions);
    const dates = historicalData.map(d => {
        const date = new Date(d.date * 1000);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    });

    const minAddresses = Math.min(...activeAddresses);
    const maxAddresses = Math.max(...activeAddresses);
    const minTransactions = Math.min(...transactions);
    const maxTransactions = Math.max(...transactions);

    const addressesRange = maxAddresses - minAddresses || (maxAddresses * 0.1) || 1;
    const transactionsRange = maxTransactions - minTransactions || (maxTransactions * 0.1) || 1;

    const adjustedMinAddresses = minAddresses - (addressesRange * 0.1);
    const adjustedMinTransactions = minTransactions - (transactionsRange * 0.1);
    const adjustedAddressesRange = addressesRange * 1.2; // Add 20% padding total
    const adjustedTransactionsRange = transactionsRange * 1.2;

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;

    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    activeAddresses.forEach((value, i) => {
        const x = padding.left + (chartWidth / Math.max(activeAddresses.length - 1, 1)) * i;
        const y = padding.top + chartHeight - ((value - adjustedMinAddresses) / adjustedAddressesRange) * chartHeight;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    transactions.forEach((value, i) => {
        const x = padding.left + (chartWidth / Math.max(transactions.length - 1, 1)) * i;
        const y = padding.top + chartHeight - ((value - adjustedMinTransactions) / adjustedTransactionsRange) * chartHeight;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';

    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px Inter, sans-serif';
    ctx.fillText('Active Addresses', width - padding.right + 5, padding.top + 20);

    ctx.fillStyle = '#10b981';
    ctx.fillText('Transactions', width - padding.right + 5, padding.top + 40);

    ctx.fillStyle = '#64748b';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    dates.forEach((date, i) => {
        const x = padding.left + (chartWidth / (dates.length - 1)) * i;
        ctx.fillText(date, x, height - 15);
    });

    ctx.fillStyle = '#3b82f6';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (chartHeight / 4) * i;
        const value = maxAddresses - (addressesRange / 4) * i;
        ctx.fillText(formatNumberLarge(value), padding.left - 10, y + 4);
    }
}

function initSentimentPage() {
    if (!cryptoData) return;
    const select = document.getElementById('sentimentCryptoSelect');
    if (!select) return;

    select.innerHTML = '<option value="">-- Select --</option>';
    cryptoData.symbols.forEach(crypto => {
        const option = document.createElement('option');
        option.value = crypto.symbol;
        option.textContent = `${crypto.base} - ${crypto.name}`;
        select.appendChild(option);
    });
}

async function loadSentimentAnalysis() {
    const select = document.getElementById('sentimentCryptoSelect');
    const symbol = select.value;

    if (!symbol) {
        alert('Please select a cryptocurrency');
        return;
    }

    const crypto = cryptoData.symbols.find(c => c.symbol === symbol);
    const resultDiv = document.getElementById('sentimentResult');

    if (!resultDiv) return;

    resultDiv.style.display = 'block';
    document.getElementById('sentimentSymbol').textContent = crypto ? `${crypto.base} (${crypto.name})` : symbol;
    document.getElementById('sentimentOverallBadge').textContent = 'Loading...';
    document.getElementById('sentimentOverallScore').textContent = '';

    try {
        const response = await fetch(`${API_BASE_URL}/sentiment/${symbol}`);
        if (!response.ok) {
            throw new Error('Failed to load sentiment analysis');
        }

        const data = await response.json();
        console.log('[SENTIMENT]', data);

        document.getElementById('sentimentSymbol').textContent = crypto ? `${crypto.base} (${crypto.name})` : symbol;

        const overallBadge = document.getElementById('sentimentOverallBadge');
        overallBadge.textContent = data.overall_sentiment.toUpperCase();
        overallBadge.style.color = data.overall_sentiment === 'positive' ? '#10b981' :
                                   data.overall_sentiment === 'negative' ? '#ef4444' : '#94a3b8';
        overallBadge.style.background = data.overall_sentiment === 'positive' ? 'rgba(16, 185, 129, 0.1)' :
                                       data.overall_sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)';
        overallBadge.style.padding = '0.5rem 1rem';
        overallBadge.style.borderRadius = '8px';
        overallBadge.style.display = 'inline-block';

        document.getElementById('sentimentOverallScore').textContent = `Score: ${data.overall_score >= 0 ? '+' : ''}${data.overall_score.toFixed(3)}`;

        const dist = data.sentiment_distribution;
        document.getElementById('sentimentPositiveCount').textContent = dist.positive.count;
        document.getElementById('sentimentPositivePct').textContent = `${dist.positive.percentage}%`;
        document.getElementById('sentimentNegativeCount').textContent = dist.negative.count;
        document.getElementById('sentimentNegativePct').textContent = `${dist.negative.percentage}%`;
        document.getElementById('sentimentNeutralCount').textContent = dist.neutral.count;
        document.getElementById('sentimentNeutralPct').textContent = `${dist.neutral.percentage}%`;

        const recommendation = document.getElementById('sentimentRecommendation');
        recommendation.textContent = data.recommendation;
        recommendation.style.background = data.recommendation === 'BUY' ? 'rgba(16, 185, 129, 0.1)' :
                                         data.recommendation === 'SELL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)';
        recommendation.style.color = data.recommendation === 'BUY' ? '#10b981' :
                                     data.recommendation === 'SELL' ? '#ef4444' : '#94a3b8';
        recommendation.style.border = `1px solid ${data.recommendation === 'BUY' ? 'rgba(16, 185, 129, 0.3)' : 
                                                      data.recommendation === 'SELL' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(148, 163, 184, 0.3)'}`;

        document.getElementById('sentimentNLPMethod').textContent = data.nlp_method;

        const twitter = data.sources.twitter;
        const twitterBadge = document.getElementById('twitterSentimentBadge');
        twitterBadge.textContent = twitter.sentiment.toUpperCase();
        twitterBadge.style.background = twitter.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.1)' :
                                        twitter.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)';
        twitterBadge.style.color = twitter.sentiment === 'positive' ? '#10b981' :
                                   twitter.sentiment === 'negative' ? '#ef4444' : '#94a3b8';
        document.getElementById('twitterAverageScore').textContent = `Avg: ${twitter.average_score >= 0 ? '+' : ''}${twitter.average_score.toFixed(3)}`;

        const twitterPostsDiv = document.getElementById('twitterPosts');
        twitterPostsDiv.innerHTML = twitter.posts.map(post => {
            const sentimentColor = post.sentiment === 'positive' ? '#10b981' :
                                  post.sentiment === 'negative' ? '#ef4444' : '#94a3b8';
            const timeAgo = formatTimeAgo(post.timestamp);
            return `
                <div style="padding: 1rem; background: var(--bg-body); border-radius: 8px; border-left: 3px solid ${sentimentColor};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <span style="padding: 0.25rem 0.75rem; background: rgba(${post.sentiment === 'positive' ? '16, 185, 129' : post.sentiment === 'negative' ? '239, 68, 68' : '148, 163, 184'}, 0.1); border-radius: 4px; font-size: 0.8rem; font-weight: 600; color: ${sentimentColor};">
                            ${post.sentiment.toUpperCase()}
                        </span>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">${timeAgo}</span>
                    </div>
                    <p style="margin: 0; color: var(--text-primary); line-height: 1.5;">${post.text}</p>
                    <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                        Score: ${post.score >= 0 ? '+' : ''}${post.score.toFixed(3)}
                    </div>
                </div>
            `;
        }).join('');

        const reddit = data.sources.reddit;
        const redditBadge = document.getElementById('redditSentimentBadge');
        redditBadge.textContent = reddit.sentiment.toUpperCase();
        redditBadge.style.background = reddit.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.1)' :
                                       reddit.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)';
        redditBadge.style.color = reddit.sentiment === 'positive' ? '#10b981' :
                                  reddit.sentiment === 'negative' ? '#ef4444' : '#94a3b8';
        document.getElementById('redditAverageScore').textContent = `Avg: ${reddit.average_score >= 0 ? '+' : ''}${reddit.average_score.toFixed(3)}`;

        const redditPostsDiv = document.getElementById('redditPosts');
        redditPostsDiv.innerHTML = reddit.posts.map(post => {
            const sentimentColor = post.sentiment === 'positive' ? '#10b981' :
                                  post.sentiment === 'negative' ? '#ef4444' : '#94a3b8';
            const timeAgo = formatTimeAgo(post.timestamp);
            return `
                <div style="padding: 1rem; background: var(--bg-body); border-radius: 8px; border-left: 3px solid ${sentimentColor};">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem;">
                        <span style="padding: 0.25rem 0.75rem; background: rgba(${post.sentiment === 'positive' ? '16, 185, 129' : post.sentiment === 'negative' ? '239, 68, 68' : '148, 163, 184'}, 0.1); border-radius: 4px; font-size: 0.8rem; font-weight: 600; color: ${sentimentColor};">
                            ${post.sentiment.toUpperCase()}
                        </span>
                        <span style="font-size: 0.8rem; color: var(--text-secondary);">${timeAgo}</span>
                    </div>
                    <p style="margin: 0; color: var(--text-primary); line-height: 1.5;">${post.text}</p>
                    <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                        Score: ${post.score >= 0 ? '+' : ''}${post.score.toFixed(3)}
                    </div>
                </div>
            `;
        }).join('');

        const news = data.sources.news;
        const newsBadge = document.getElementById('newsSentimentBadge');
        newsBadge.textContent = news.sentiment.toUpperCase();
        newsBadge.style.background = news.sentiment === 'positive' ? 'rgba(16, 185, 129, 0.1)' :
                                     news.sentiment === 'negative' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(148, 163, 184, 0.1)';
        newsBadge.style.color = news.sentiment === 'positive' ? '#10b981' :
                                news.sentiment === 'negative' ? '#ef4444' : '#94a3b8';
        document.getElementById('newsAverageScore').textContent = `Avg: ${news.average_score >= 0 ? '+' : ''}${news.average_score.toFixed(3)}`;

        const newsArticlesDiv = document.getElementById('newsArticles');
        if (news.articles && news.articles.length > 0) {
            newsArticlesDiv.innerHTML = news.articles.map(article => {
                const sentimentColor = article.sentiment === 'positive' ? '#10b981' :
                                      article.sentiment === 'negative' ? '#ef4444' : '#94a3b8';
                const timeAgo = formatTimeAgo(article.timestamp);
                const hasUrl = article.url && article.url.length > 0;
                return `
                    <div style="padding: 1rem; background: var(--bg-body); border-radius: 8px; border-left: 3px solid ${sentimentColor};">
                        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">
                            <span style="padding: 0.25rem 0.75rem; background: rgba(${article.sentiment === 'positive' ? '16, 185, 129' : article.sentiment === 'negative' ? '239, 68, 68' : '148, 163, 184'}, 0.1); border-radius: 4px; font-size: 0.8rem; font-weight: 600; color: ${sentimentColor};">
                                ${article.sentiment.toUpperCase()}
                            </span>
                            <div style="display: flex; gap: 0.5rem; align-items: center;">
                                <span style="font-size: 0.8rem; color: var(--text-secondary); font-weight: 500;">${article.source || 'Unknown'}</span>
                                <span style="font-size: 0.8rem; color: var(--text-secondary);">${timeAgo}</span>
                            </div>
                        </div>
                        <h5 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-weight: 600; font-size: 1rem;">
                            ${hasUrl ? `<a href="${article.url}" target="_blank" style="color: inherit; text-decoration: none;">${article.title}</a>` : article.title}
                        </h5>
                        ${article.description ? `<p style="margin: 0.5rem 0 0 0; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">${article.description}</p>` : ''}
                        <div style="margin-top: 0.5rem; font-size: 0.85rem; color: var(--text-secondary);">
                            Score: ${article.score >= 0 ? '+' : ''}${article.score.toFixed(3)}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            newsArticlesDiv.innerHTML = `
                <div style="padding: 2rem; text-align: center; background: var(--bg-body); border-radius: 8px; border: 1px dashed var(--border-color);">
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                        No news articles available. 
                        ${data.data_sources && data.data_sources.news && data.data_sources.news.includes('Not configured') 
                            ? '<br>To see real news, configure NewsAPI key in .env file.<br><a href="https://newsapi.org/register" target="_blank" style="color: var(--info);">Get free API key</a>' 
                            : 'News sources may be temporarily unavailable.'}
                    </p>
                </div>
            `;
        }

        resultDiv.style.display = 'block';
    } catch (error) {
        console.error('[SENTIMENT ERROR]', error);
        alert('Failed to load sentiment analysis: ' + error.message);
        resultDiv.style.display = 'none';
    }
}

function formatTimeAgo(timestamp) {
    const now = Date.now() / 1000;
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);

    if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
}

function loadWatchlistFromStorage() {
    const saved = localStorage.getItem('cryptoWatchlist');
    if (saved) watchlist = JSON.parse(saved);
}

function saveWatchlistToStorage() {
    localStorage.setItem('cryptoWatchlist', JSON.stringify(watchlist));
}

function updatePortfolioTable() {
    const tableBody = document.getElementById('portfolioTableBody');
    const emptyMsg = document.getElementById('emptyPortfolio');
    if (!tableBody || !cryptoData) return;

    if (watchlist.length === 0) {
        tableBody.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    tableBody.innerHTML = '';

    watchlist.forEach((symbol, index) => {
        const crypto = cryptoData.symbols.find(c => c.symbol === symbol);
        if (!crypto) return;

        const history = cryptoData.price_history[symbol] || [];
        const lastRecord = history.length > 0 ? history[history.length - 1] : null;
        const lastPrice = lastRecord ? lastRecord.close : null;
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
            <td>${lastPrice ? formatPrice(lastPrice) : '-'}</td>
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
                    <span class="action-icon" onclick="showCryptoInfo('${symbol}')" title="View Details">↗</span>
                    <span class="action-icon favorite active" onclick="removeFromWatchlist('${symbol}')" title="Remove">★</span>
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
    if (!select) return;

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
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-settings-tab');
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.settings-content').forEach(c => c.classList.remove('active'));
            const target = document.getElementById('settings-' + tabName);
            if (target) target.classList.add('active');
        });
    });
}

function handleSearch(event) {
    const query = event.target.value.trim().toUpperCase();
    const resultsContainer = document.getElementById('searchResults');

    if (!query || !cryptoData) {
        resultsContainer.classList.remove('active');
        return;
    }

    const results = cryptoData.symbols.filter(crypto =>
        crypto.base.toUpperCase().includes(query) ||
        crypto.symbol.toUpperCase().includes(query)
    ).slice(0, 5);

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">No results</div>';
        resultsContainer.classList.add('active');
        return;
    }

    resultsContainer.innerHTML = results.map(crypto => {
        const history = cryptoData.price_history[crypto.symbol] || [];
        const lastPrice = history.length > 0 ? history[history.length - 1].close : null;
        return `
            <div class="search-result-item" onclick="showCryptoInfo('${crypto.symbol}')">
                <div class="search-result-icon">${crypto.base.charAt(0)}</div>
                <div class="search-result-info">
                    <div class="search-result-symbol">${crypto.base}</div>
                    <div class="search-result-name">${crypto.name}</div>
                </div>
                <div class="search-result-price">${lastPrice ? formatPrice(lastPrice) : '-'}</div>
            </div>
        `;
    }).join('');
    resultsContainer.classList.add('active');

    if (event.key === 'Enter' && results.length > 0) {
        showCryptoInfo(results[0].symbol);
        resultsContainer.classList.remove('active');
    }
}

document.addEventListener('click', function(e) {
    const searchBox = document.querySelector('.search-box');
    const results = document.getElementById('searchResults');
    if (searchBox && results && !searchBox.contains(e.target)) {
        results.classList.remove('active');
    }
});

function formatNumber(num) {
    if (!num) return '-';
    return new Intl.NumberFormat('en-US').format(num);
}

function formatPrice(price) {
    if (!price && price !== 0) return '-';
    if (price < 0.01) return '$' + price.toFixed(6);
    if (price < 1) return '$' + price.toFixed(4);
    if (price < 100) return '$' + price.toFixed(2);
    return '$' + formatNumber(price.toFixed(2));
}

function formatLargeNumber(num) {
    if (!num) return '-';
    if (num >= 1e12) return '$' + (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return '$' + (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return '$' + (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return '$' + (num / 1e3).toFixed(1) + 'K';
    return '$' + num.toFixed(2);
}

function formatNumberLarge(num) {
    if (!num) return '-';
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return formatNumber(num);
}

window.setLanguage = setLanguage;
window.setTheme = setTheme;
window.handleLogin = handleLogin;
window.logout = logout;
window.showSignupMessage = showSignupMessage;
window.navigateTo = navigateTo;
window.backToDashboard = backToDashboard;
window.showCryptoInfo = showCryptoInfo;
window.getLSTMPrediction = getLSTMPrediction;
window.loadHistoryData = loadHistoryData;
window.loadTechnicalAnalysis = loadTechnicalAnalysis;
window.loadOnChainMetricsPage = loadOnChainMetricsPage;
window.loadSentimentAnalysis = loadSentimentAnalysis;
window.refreshData = refreshData;
window.handleSearch = handleSearch;
window.showAddCryptoModal = showAddCryptoModal;
window.closeAddCryptoModal = closeAddCryptoModal;
window.addToWatchlist = addToWatchlist;
window.removeFromWatchlist = removeFromWatchlist;

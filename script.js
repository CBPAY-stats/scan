// XDB Chain Wallet Explorer JavaScript

class XDBWalletExplorer {
    constructor() {
        this.apiBase = 'https://horizon.livenet.xdbchain.com';
        this.currentWallet = null;
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentTab = 'transactions';
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupTabs();
    }

    bindEvents() {
        const searchBtn = document.getElementById('searchBtn');
        const walletInput = document.getElementById('walletAddress');
        
        searchBtn.addEventListener('click', () => this.searchWallet());
        walletInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWallet();
            }
        });

        // Sample wallet button for testing
        this.addSampleWalletButton();
    }

    addSampleWalletButton() {
        const searchContainer = document.querySelector('.search-container');
        const sampleBtn = document.createElement('button');
        sampleBtn.textContent = 'Try Sample Wallet';
        sampleBtn.className = 'search-btn';
        sampleBtn.style.marginTop = '10px';
        sampleBtn.style.background = 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)';
        
        sampleBtn.addEventListener('click', () => {
            document.getElementById('walletAddress').value = 'GAIH3ULLFQ4DGSECF2AR555KZ4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR';
            this.searchWallet();
        });
        
        searchContainer.appendChild(sampleBtn);
    }

    setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update active tab pane
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        this.currentTab = tabName;
        this.currentPage = 1;

        if (this.currentWallet) {
            this.loadTabData(tabName);
        }
    }

    async searchWallet() {
        const walletAddress = document.getElementById('walletAddress').value.trim();
        
        if (!walletAddress) {
            this.showError('Please enter a wallet address');
            return;
        }

        if (!this.isValidStellarAddress(walletAddress)) {
            this.showError('Invalid wallet address format');
            return;
        }

        this.currentWallet = walletAddress;
        this.showLoading();
        this.hideError();
        this.hideResults();

        try {
            // Get account information
            const accountInfo = await this.fetchAccountInfo(walletAddress);
            
            if (!accountInfo) {
                this.showError('Wallet not found or not activated');
                return;
            }

            this.displayWalletInfo(accountInfo);
            this.showResults();
            
            // Load initial tab data
            await this.loadTabData(this.currentTab);
            
        } catch (error) {
            console.error('Error searching wallet:', error);
            this.showError('Error fetching wallet data. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    async fetchAccountInfo(address) {
        try {
            console.log(`Fetching account info for: ${address}`);
            const response = await fetch(`${this.apiBase}/accounts/${address}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`Response status: ${response.status}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Account not found');
                    return null;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('Account data received:', data);
            return data;
        } catch (error) {
            console.error('Error fetching account info:', error);
            throw error;
        }
    }

    async loadTabData(tabName) {
        if (!this.currentWallet) return;

        this.showTabLoading(tabName);

        try {
            let data;
            switch (tabName) {
                case 'transactions':
                    data = await this.fetchTransactions();
                    this.displayTransactions(data);
                    break;
                case 'payments':
                    data = await this.fetchPayments();
                    this.displayPayments(data);
                    break;
                case 'offers':
                    data = await this.fetchOffers();
                    this.displayOffers(data);
                    break;
                case 'effects':
                    data = await this.fetchEffects();
                    this.displayEffects(data);
                    break;
            }
        } catch (error) {
            console.error(`Error loading ${tabName}:`, error);
            this.showTabError(tabName, `Error loading ${tabName}`);
        }
    }

    async fetchTransactions() {
        const response = await fetch(`${this.apiBase}/accounts/${this.currentWallet}/transactions?limit=${this.itemsPerPage}&order=desc`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async fetchPayments() {
        const response = await fetch(`${this.apiBase}/accounts/${this.currentWallet}/payments?limit=${this.itemsPerPage}&order=desc`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async fetchOffers() {
        const response = await fetch(`${this.apiBase}/accounts/${this.currentWallet}/offers?limit=${this.itemsPerPage}&order=desc`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    async fetchEffects() {
        const response = await fetch(`${this.apiBase}/accounts/${this.currentWallet}/effects?limit=${this.itemsPerPage}&order=desc`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }

    displayWalletInfo(accountInfo) {
        const walletInfoDiv = document.getElementById('walletInfo');
        
        const balances = accountInfo.balances || [];
        const nativeBalance = balances.find(b => b.asset_type === 'native');
        
        walletInfoDiv.innerHTML = `
            <div class="wallet-card">
                <div class="wallet-stat">
                    <div class="wallet-stat-label">Account ID</div>
                    <div class="wallet-stat-value hash">${accountInfo.account_id}</div>
                </div>
                <div class="wallet-stat">
                    <div class="wallet-stat-label">XLM Balance</div>
                    <div class="wallet-stat-value amount">${nativeBalance ? parseFloat(nativeBalance.balance).toFixed(7) : '0.0000000'} XDB</div>
                </div>
                <div class="wallet-stat">
                    <div class="wallet-stat-label">Sequence</div>
                    <div class="wallet-stat-value">${accountInfo.sequence}</div>
                </div>
                <div class="wallet-stat">
                    <div class="wallet-stat-label">Subentry Count</div>
                    <div class="wallet-stat-value">${accountInfo.subentry_count}</div>
                </div>
                <div class="wallet-stat">
                    <div class="wallet-stat-label">Signers</div>
                    <div class="wallet-stat-value">${accountInfo.signers ? accountInfo.signers.length : 0}</div>
                </div>
                <div class="wallet-stat">
                    <div class="wallet-stat-label">Flags</div>
                    <div class="wallet-stat-value">${accountInfo.flags ? Object.keys(accountInfo.flags).filter(k => accountInfo.flags[k]).join(', ') || 'None' : 'None'}</div>
                </div>
            </div>
        `;
    }

    displayTransactions(data) {
        const container = document.getElementById('transactionsList');
        
        if (!data._embedded || !data._embedded.records || data._embedded.records.length === 0) {
            container.innerHTML = '<div class="text-center p-20">No transactions found</div>';
            return;
        }

        const transactions = data._embedded.records;
        container.innerHTML = transactions.map(tx => `
            <div class="transaction-item">
                <div class="item-header">
                    <span class="item-type">${tx.type_i || 'Unknown'}</span>
                    <span class="item-date">${new Date(tx.created_at).toLocaleString()}</span>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <div class="detail-label">Hash</div>
                        <div class="detail-value hash">${tx.hash}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Ledger</div>
                        <div class="detail-value">${tx.ledger}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Source Account</div>
                        <div class="detail-value hash">${tx.source_account}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Fee</div>
                        <div class="detail-value">${(parseInt(tx.fee_charged || tx.max_fee || 0) / 10000000).toFixed(7)} XDB</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Operation Count</div>
                        <div class="detail-value">${tx.operation_count}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Successful</div>
                        <div class="detail-value ${tx.successful ? 'text-success' : 'text-error'}">${tx.successful ? 'Yes' : 'No'}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayPayments(data) {
        const container = document.getElementById('paymentsList');
        
        if (!data._embedded || !data._embedded.records || data._embedded.records.length === 0) {
            container.innerHTML = '<div class="text-center p-20">No payments found</div>';
            return;
        }

        const payments = data._embedded.records;
        container.innerHTML = payments.map(payment => `
            <div class="payment-item">
                <div class="item-header">
                    <span class="item-type">${payment.type}</span>
                    <span class="item-date">${new Date(payment.created_at).toLocaleString()}</span>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <div class="detail-label">From</div>
                        <div class="detail-value hash">${payment.from || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">To</div>
                        <div class="detail-value hash">${payment.to || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Amount</div>
                        <div class="detail-value amount">${payment.amount || '0'} ${payment.asset_code || 'XLM'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Transaction Hash</div>
                        <div class="detail-value hash">${payment.transaction_hash}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayOffers(data) {
        const container = document.getElementById('offersList');
        
        if (!data._embedded || !data._embedded.records || data._embedded.records.length === 0) {
            container.innerHTML = '<div class="text-center p-20">No offers found</div>';
            return;
        }

        const offers = data._embedded.records;
        container.innerHTML = offers.map(offer => `
            <div class="offer-item">
                <div class="item-header">
                    <span class="item-type">Offer #${offer.id}</span>
                    <span class="item-date">${new Date(offer.last_modified_time).toLocaleString()}</span>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <div class="detail-label">Seller</div>
                        <div class="detail-value hash">${offer.seller}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Selling</div>
                        <div class="detail-value">${offer.amount} ${offer.selling.asset_code || 'XLM'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Buying</div>
                        <div class="detail-value">${offer.buying.asset_code || 'XLM'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Price</div>
                        <div class="detail-value">${offer.price}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayEffects(data) {
        const container = document.getElementById('effectsList');
        
        if (!data._embedded || !data._embedded.records || data._embedded.records.length === 0) {
            container.innerHTML = '<div class="text-center p-20">No effects found</div>';
            return;
        }

        const effects = data._embedded.records;
        container.innerHTML = effects.map(effect => `
            <div class="effect-item">
                <div class="item-header">
                    <span class="item-type">${effect.type}</span>
                    <span class="item-date">${new Date(effect.created_at).toLocaleString()}</span>
                </div>
                <div class="item-details">
                    <div class="detail-item">
                        <div class="detail-label">Account</div>
                        <div class="detail-value hash">${effect.account || 'N/A'}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Type ID</div>
                        <div class="detail-value">${effect.type_i}</div>
                    </div>
                    ${effect.amount ? `
                    <div class="detail-item">
                        <div class="detail-label">Amount</div>
                        <div class="detail-value amount">${effect.amount} ${effect.asset_code || 'XLM'}</div>
                    </div>
                    ` : ''}
                    <div class="detail-item">
                        <div class="detail-label">Transaction Hash</div>
                        <div class="detail-value hash">${effect.transaction_hash}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showTabLoading(tabName) {
        const container = document.getElementById(`${tabName}List`);
        container.innerHTML = `
            <div class="text-center p-20">
                <div class="spinner" style="margin: 0 auto 15px;"></div>
                <p>Loading ${tabName}...</p>
            </div>
        `;
    }

    showTabError(tabName, message) {
        const container = document.getElementById(`${tabName}List`);
        container.innerHTML = `
            <div class="text-center p-20 text-error">
                <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 15px;"></i>
                <p>${message}</p>
            </div>
        `;
    }

    isValidStellarAddress(address) {
        // Basic validation for Stellar address format (56 characters total, starting with G)
        return /^G[A-Z2-7]{55}$/.test(address) && address.length === 56;
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showResults() {
        document.getElementById('resultsSection').style.display = 'block';
    }

    hideResults() {
        document.getElementById('resultsSection').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorDiv.style.display = 'block';
    }

    hideError() {
        document.getElementById('error').style.display = 'none';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new XDBWalletExplorer();
});


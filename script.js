// XDB Chain Wallet Explorer JavaScript
class XDBWalletExplorer {
    constructor() {
        this.apiBase = 'https://horizon.livenet.xdbchain.com';
        this.currentWallet = null;
        this.currentPage = 1;
        this.itemsPerPage = 200; // Aumentar o limite para buscar mais itens por página
        this.currentTab = 'payments';

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
            document.getElementById('walletAddress').value = 'GAIH3ULLFQ4DGSECFI2AR555ZK4KNDGEKN4AFI4SU2M7B43MGK3QJZNSR';
            this.searchWallet();
        });

        searchContainer.append(sampleBtn);
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.currentTab = e.target.dataset.tab;
                this.updateActiveTab();
                this.searchWallet(); // Re-fetch data for the new tab
            });
        });
        this.updateActiveTab();
    }

    updateActiveTab() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            if (tab.dataset.tab === this.currentTab) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }

    async searchWallet() {
        const walletAddress = document.getElementById('walletAddress').value.trim();
        if (!walletAddress) {
            this.displayMessage('Please enter a wallet address.', 'error');
            return;
        }

        this.displayMessage('Searching...', 'info');
        this.clearResults();

        try {
            this.currentWallet = walletAddress;
            await this.fetchAccountDetails(walletAddress);
            await this.fetchAllTransactions(walletAddress); // Chamar a nova função para todas as transações
            await this.fetchAllPayments(walletAddress);     // Chamar a nova função para todos os pagamentos
            await this.fetchAssets();

            this.displayMessage('Search complete!', 'success');
        } catch (error) {
            console.error('Error searching wallet:', error);
            this.displayMessage(`Error: ${error.message}`, 'error');
        }
    }

    async fetchAccountDetails(accountId) {
        try {
            const response = await fetch(`${this.apiBase}/accounts/${accountId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.displayAccountDetails(data);
        } catch (error) {
            console.error('Error fetching account details:', error);
            this.displayMessage(`Could not fetch account details: ${error.message}`, 'error');
        }
    }

    async fetchAllTransactions(accountId) {
        let allTransactions = [];
        let url = `${this.apiBase}/accounts/${accountId}/transactions?order=desc&limit=${this.itemsPerPage}`;

        try {
            while (url) {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                allTransactions = allTransactions.concat(data._embedded.records);
                url = data._links.next ? data._links.next.href : null;
            }
            this.displayTransactions(allTransactions);
        } catch (error) {
            console.error('Error fetching all transactions:', error);
            this.displayMessage(`Could not fetch all transactions: ${error.message}`, 'error');
        }
    }

    async fetchAllPayments(accountId) {
        let allPayments = [];
        let url = `${this.apiBase}/accounts/${accountId}/payments?order=desc&limit=${this.itemsPerPage}`;

        try {
            while (url) {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                allPayments = allPayments.concat(data._embedded.records);
                url = data._links.next ? data._links.next.href : null;
            }
            this.displayPayments(allPayments);
        } catch (error) {
            console.error('Error fetching all payments:', error);
            this.displayMessage(`Could not fetch all payments: ${error.message}`, 'error');
        }
    }

    async fetchAssets() {
        try {
            const response = await fetch(`${this.apiBase}/assets`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.displayAssets(data._embedded.records);
        } catch (error) {
            console.error('Error fetching assets:', error);
            this.displayMessage(`Could not fetch assets: ${error.message}`, 'error');
        }
    }

    displayAccountDetails(account) {
        const detailsDiv = document.getElementById('accountDetails');
        detailsDiv.innerHTML = `
            <h3>Account Details</h3>
            <p><strong>ID:</strong> ${account.id}</p>
            <p><strong>Sequence:</strong> ${account.sequence}</p>
            <h4>Balances:</h4>
            <ul>
                ${account.balances.map(balance => `
                    <li>${balance.balance} ${balance.asset_code || balance.asset_type}</li>
                `).join('')}
            </ul>
        `;
    }

    displayTransactions(transactions) {
        const transactionsDiv = document.getElementById('transactions');
        transactionsDiv.innerHTML = '<h3>Transactions</h3>';
        if (transactions.length === 0) {
            transactionsDiv.innerHTML += '<p>No transactions found.</p>';
            return;
        }
        const ul = document.createElement('ul');
        transactions.forEach(tx => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>Hash:</strong> ${tx.hash}<br>
                <strong>Type:</strong> ${tx.operation_count} operations<br>
                <strong>Date:</strong> ${new Date(tx.created_at).toLocaleString()}
            `;
            ul.appendChild(li);
        });
        transactionsDiv.appendChild(ul);
    }

    displayPayments(payments) {
        const paymentsDiv = document.getElementById('payments');
        paymentsDiv.innerHTML = '<h3>Payments</h3>';
        if (payments.length === 0) {
            paymentsDiv.innerHTML += '<p>No payments found.</p>';
            return;
        }
        const ul = document.createElement('ul');
        payments.forEach(payment => {
            const li = document.createElement('li');
            let details = `<strong>Type:</strong> ${payment.type}<br>`;
            if (payment.asset_type === 'native') {
                details += `<strong>Amount:</strong> ${payment.amount} XLM<br>`;
            } else {
                details += `<strong>Amount:</strong> ${payment.amount} ${payment.asset_code}<br>`;
            }
            details += `<strong>From:</strong> ${payment.from}<br>`;
            details += `<strong>To:</strong> ${payment.to}<br>`;
            details += `<strong>Date:</strong> ${new Date(payment.created_at).toLocaleString()}`;
            li.innerHTML = details;
            ul.appendChild(li);
        });
        paymentsDiv.appendChild(ul);
    }

    displayAssets(assets) {
        const assetsDiv = document.getElementById('assets');
        assetsDiv.innerHTML = '<h3>Assets</h3>';
        if (assets.length === 0) {
            assetsDiv.innerHTML += '<p>No assets found.</p>';
            return;
        }
        const ul = document.createElement('ul');
        assets.forEach(asset => {
            const li = document.createElement('li');
            li.innerHTML = `
                <strong>Code:</strong> ${asset.asset_code}<br>
                <strong>Issuer:</strong> ${asset.asset_issuer}<br>
                <strong>Type:</strong> ${asset.asset_type}
            `;
            ul.appendChild(li);
        });
        assetsDiv.appendChild(ul);
    }

    clearResults() {
        document.getElementById('accountDetails').innerHTML = '';
        document.getElementById('transactions').innerHTML = '';
        document.getElementById('payments').innerHTML = '';
        document.getElementById('assets').innerHTML = '';
    }

    displayMessage(message, type) {
        const messageDiv = document.getElementById('message');
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
    }
}

new XDBWalletExplorer();



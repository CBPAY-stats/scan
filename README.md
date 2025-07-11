# Stellar Wallet Explorer

A modern, responsive web application for exploring Stellar Network wallet transactions and information.

## Features

- **Wallet Search**: Search for any Stellar wallet address
- **Transaction History**: View detailed transaction history
- **Payment Tracking**: Monitor payments sent and received
- **Offers Management**: View active and historical offers
- **Effects Analysis**: Analyze account effects and changes
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Data**: Connects directly to Stellar Horizon API

## Live Demo

Visit the live application: [Stellar Wallet Explorer](https://your-username.github.io/stellar-wallet-explorer)

## Getting Started

### Prerequisites

- A modern web browser
- Internet connection (for API calls)

### Local Development

1. Clone this repository:
```bash
git clone https://github.com/your-username/stellar-wallet-explorer.git
cd stellar-wallet-explorer
```

2. Start a local web server:
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8000
```

3. Open your browser and navigate to `http://localhost:8000`

### GitHub Pages Deployment

1. Fork this repository
2. Go to your repository settings
3. Navigate to "Pages" section
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"

Your site will be available at `https://your-username.github.io/stellar-wallet-explorer`

## Usage

1. **Enter Wallet Address**: Input a valid Stellar wallet address (56 characters starting with 'G')
2. **Search Options**: Choose what data to include (payments, offers, effects)
3. **View Results**: Browse through different tabs to see various types of data
4. **Sample Wallet**: Use the "Try Sample Wallet" button to test with a demo address

## API Information

This application uses the Stellar Horizon API:
- **Base URL**: `https://horizon.stellar.org`
- **Documentation**: [Stellar Developer Docs](https://developers.stellar.org)

## File Structure

```
stellar-wallet-explorer/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with gradients and animations
- **JavaScript (ES6+)**: API integration and DOM manipulation
- **Font Awesome**: Icons
- **Stellar Horizon API**: Blockchain data

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Stellar Development Foundation for providing the Horizon API
- Font Awesome for the icons

## Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/your-username/stellar-wallet-explorer/issues) page
2. Create a new issue if your problem isn't already reported
3. Provide detailed information about the problem

## Roadmap

- [ ] Add transaction filtering by date range
- [ ] Implement pagination for large result sets
- [ ] Add export functionality (CSV, JSON)
- [ ] Include price information and charts
- [ ] Add wallet balance history
- [ ] Implement dark/light theme toggle

## Note

This application was originally designed for XDB Chain but has been adapted to use the Stellar Network API due to accessibility issues with the XDB Chain Horizon API. The functionality remains the same, providing comprehensive wallet exploration capabilities.


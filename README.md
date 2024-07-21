# Ultimate Digits TELEGRAM MINI App UI

This project is the front-end code for the TELEGRAM MINI app, built with React and integrated with Telegram Mini App injection. The app facilitates the creation of new users, sending of cryptocurrency, and integrates Coinbase Embedded Wallets along with WalletConnect.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)

## Introduction

The Ultimate Digits TELEGRAM MINI app UI is designed to provide a seamless experience for users interacting with cryptocurrencies directly within Telegram. The app leverages React for the front-end development, with integrations for Coinbase Embedded Wallets and WalletConnect to manage user wallets and cryptocurrency transactions.

## Features

- **User Creation**: Register new users directly within the Telegram Mini app.
- **Send Crypto**: Easily send cryptocurrency to other users.
- **Coinbase Embedded Wallets**: Integrate with Coinbase to create and manage wallets.
- **WalletConnect**: Connect with other cryptocurrency wallets using WalletConnect.

## Prerequisites

Before you begin, ensure you have the following:

- Node.js (v14 or higher)
- npm (v6 or higher)
- A Telegram account
- Coinbase account (for testing embedded wallets)

## Installation

To install and run this project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ultimate-digits-telegram-mini-app-ui.git
   cd ultimate-digits-telegram-mini-app-ui
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory.
   - Add the following environment variables to the `.env` file:
     ```env
     REACT_APP_PUBLIC_PROJECT_ID=""
     REACT_APP_ENCRYPTION_KEY=""
     ```

## Usage

To start the development server, run:

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser. The app will reload if you make edits. You will also see any lint errors in the console.

## Configuration

### Telegram Mini App Injection

The app is injected into the Telegram environment using the Mini App SDK. Ensure you have the Telegram bot set up with the appropriate permissions.

### Coinbase Embedded Wallets

The app uses Coinbase Embedded Wallets to create and manage user wallets. Ensure you have the necessary API keys and permissions configured in the `.env` file.

### WalletConnect Integration

WalletConnect allows users to connect with other wallets. Ensure you have the WalletConnect project ID set up in the `.env` file.

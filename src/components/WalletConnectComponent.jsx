import React, { useState } from 'react';
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { Buffer } from 'buffer';
const ethers = require("ethers");

// Polyfill Buffer globally
window.Buffer = Buffer;

const WalletConnectComponent = () => {
  const [provider, setProvider] = useState(null);
  const [address, setAddress] = useState("");

  const connectWallet = async () => {
    // Create a WalletConnect instance
    const walletConnector = new WalletConnect({
      bridge: "https://bridge.walletconnect.org" // Required
    });

    // Check if connection is already established
    if (!walletConnector.connected) {
      // Create a new session
      walletConnector.createSession().then(() => {
        // Display QR Code modal
        QRCodeModal.open(walletConnector.uri);
      });
    }

    // Subscribe to connection events
    walletConnector.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Close QR Code Modal
      QRCodeModal.close();

      // Get provided accounts and chainId
      const { accounts, chainId } = payload.params[0];
      const walletProvider = new ethers.providers.Web3Provider(walletConnector);
      setProvider(walletProvider);
      setAddress(accounts[0]);
    });

    walletConnector.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts and chainId
      const { accounts, chainId } = payload.params[0];
      setAddress(accounts[0]);
    });

    walletConnector.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Reset state
      setProvider(null);
      setAddress("");
    });
  };

  const sendTransaction = async () => {
    if (!provider) return;

    const signer = provider.getSigner();
    const tx = await signer.sendTransaction({
      to: "0xAddress", // replace with the recipient address
      value: ethers.utils.parseEther("0.01")
    });

    console.log("Transaction Hash:", tx.hash);
  };

  return (
    <div>
      <h1>WalletConnect with React</h1>
      {!provider ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected Address: {address}</p>
          <button onClick={sendTransaction}>Send Transaction</button>
        </div>
      )}
    </div>
  );
};

export default WalletConnectComponent;

import React from "react";
import { ClientContextProvider } from "../contexts/ClientContext";
import WalletConnect from "../components/WalletConnect";
import { JsonRpcContextProvider } from "../contexts/JsonRpcContext";
import { Toaster } from "react-hot-toast";

const WalletConnectContainer = ({ decryptedData }) => {
  return (
    <ClientContextProvider>
      <JsonRpcContextProvider>
        <Toaster />
        <WalletConnect decryptedData={decryptedData} />
      </JsonRpcContextProvider>
    </ClientContextProvider>
  );
};

export default WalletConnectContainer;

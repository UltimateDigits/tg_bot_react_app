import { Suspense, useEffect, useState } from "react";
import "./App.css";
import { Fernet } from "fernet-ts";
import SendCrypto from "./components/SendCrypto";
import WalletConnect from "./container/WalletConnect";
import ConnectWalletCoinbase from "./components/ConnectWalletCoinbase";
import { WalletProvider } from "@coinbase/waas-sdk-web-react";

function App() {
  const [decryptedData, setDecryptedData] = useState("");
  const [isWebAppConnected, setWebAppConnected] = useState(false);
  const PROJECT_ID = process.env.REACT_APP_PUBLIC_PROJECT_ID;
  if (window?.Telegram?.WebApp) {
    window.Telegram.WebApp.setBackgroundColor("#ffffff");
    window.Telegram.WebApp.expand();
  }
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get("data");
    const decryptData = async () => {
      if (encodedData) {
        try {
          const decodedData = atob(encodedData);
          const secretKey = process.env.REACT_APP_ENCRYPTION_KEY;
          const f = await Fernet.getInstance(secretKey);
          const originalText = await f.decrypt(decodedData);
          const parsedJson = JSON.parse(originalText);
          setDecryptedData(parsedJson);
        } catch (err) {
          console.log(err);
        }
      }
    };
    decryptData();
    if (window?.Telegram?.WebApp) {
      setWebAppConnected(true);
    }
  }, []);
  // Make sure the UI is connected to Telegram
  // if (!isWebAppConnected) {
  //   return (
  //     <>
  //       <h1 style={{ display: "flex", justifyContent: "center" }}>
  //         Please Visit Ultimate Bot Website for more Details
  //       </h1>
  //     </>
  //   );
  // }
  return (
    <Suspense fallback={"Ultimate Bot"}>
      {["CREATE_MOBILE", "CREATE_TELEGRAM", "EXISTING_UD_USER"].includes(
        decryptedData?.action
      ) ? (
        <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
          <div className="App">
            <h1>Ultimate Bot</h1>
            <WalletProvider
              projectId={PROJECT_ID}
              verbose
              collectAndReportMetrics
              enableHostedBackups
              autoCreateWallet
            >
              <ConnectWalletCoinbase decryptedData={decryptedData} />
            </WalletProvider>
          </div>
        </div>
      ) : decryptedData?.action === "SEND_CRYPTO" ? (
        <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
          <div className="App">
            <h1>Ultimate Bot</h1>
            <WalletProvider
              projectId={PROJECT_ID}
              verbose
              collectAndReportMetrics
              enableHostedBackups
              autoCreateWallet
            >
              <SendCrypto decryptedData={decryptedData} />
            </WalletProvider>
          </div>
        </div>
      ) : decryptedData?.action === "WALLET_CONNECT" ||
        decryptedData?.action === "WALLET_CONNECT_SEND_CRYPTO" ? (
        <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
          <div className="App">
            <h1> WALLET CONNECT with Ultimate Bot</h1>
            <WalletConnect decryptedData={decryptedData} />
          </div>
        </div>
      ) : (
        <>
          <h1>Ultimate Bot</h1>
        </>
      )}
    </Suspense>
  );
}

export default App;

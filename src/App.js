import { Suspense, useEffect, useState } from "react";
import "./App.css";
import ConnectWalletV2 from "./components/ConnectWalletV2";
import { Fernet } from "fernet-ts";
import SendCrypto from "./components/SendCrypto";

function App() {
  const [decryptedData, setDecryptedData] = useState("");
  const [isWebAppConnected, setWebAppConnected] = useState(false);

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
          console.log(parsedJson)
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
  console.log(isWebAppConnected)
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
      {decryptedData?.action === "CREATE_MOBILE" ||
      decryptedData?.action === "CREATE_TELEGRAM" ? (
        <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
          <div className="App">
            <h1>Ultimate Bot</h1>
            <ConnectWalletV2 decryptedData={decryptedData} />
          </div>
        </div>
      ) : decryptedData?.action === "SEND_CRYPTO" ? (
        <div style={{ backgroundColor: "white", minHeight: "100vh" }}>
          <div className="App">
            <h1>Ultimate Bot</h1>
            <SendCrypto decryptedData={decryptedData} />
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

import "./App.css";
import ConnectWallet from "./components/ConnectWallet";
import { WalletProvider } from "@coinbase/waas-sdk-web-react";
import ConnectWalletV2 from "./components/ConnectWalletV2";

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const value = queryParams.get("action");
  const uuid = queryParams.get("uuid");

  return (
    <>
      {value === "CREATE" ? (
        <div>
          <WalletProvider
            enableHostedBackups
            collectAndReportMetrics
            projectId="1994648a1fa8a282f1c3ca917a0379f1f79fbb06"
          >
            <div className="App">
              <h1>Creating Wallet</h1>
              <ConnectWalletV2 action={value} uuid={uuid} />
            </div>
          </WalletProvider>
        </div>
      ) : (
        "Ultimate Bot"
      )}
    </>
  );
}

export default App;

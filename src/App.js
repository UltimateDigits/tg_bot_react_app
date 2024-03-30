import "./App.css";
import ConnectWallet from "./components/ConnectWallet";
import { WalletProvider } from "@coinbase/waas-sdk-web-react";

const fetchExampleAuthServerToken = async (uuid) => {
  const resp = await fetch(
    "https://ud-backend-six.vercel.app/coinbase/coinbaseAuth",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uuid: uuid }),
    }
  ).then((r) => r.json());
  console.log(resp);
  return resp.token;
};

function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const value = queryParams.get("action");
  const uuid = queryParams.get("uuid");

  return (
    <>
      {value === "CREATE" ? (
        <div>
          <h1>IN HERE</h1>
          <WalletProvider
            provideAuthToken={() => fetchExampleAuthServerToken(uuid)}
            autoCreateWallet
          >
            <div className="App">
              <ConnectWallet />
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


import './App.css';
import ConnectWallet from './components/ConnectWallet'
import { WalletProvider } from "@coinbase/waas-sdk-web-react"

const fetchExampleAuthServerToken = async () => {
  // Fetch user-scoped auth token from the example auth server. In a real scenario,
  // you would authenticate the user yourself and issue a user-scoped token.
  const resp = await fetch("https://localhost:8082/auth", {
    method: 'post',
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: "1d7d5555-cff7-409b-88cc-cd6e19c0c091" })
  }).then(r => r.json());
  return resp.token;
};
function App() {
  return (
    <WalletProvider provideAuthToken={fetchExampleAuthServerToken} autoCreateWallet>
      <div className="App">
        <ConnectWallet />
      </div>
    </WalletProvider>
  );
}

export default App;

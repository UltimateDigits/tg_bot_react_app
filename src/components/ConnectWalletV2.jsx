import { useWalletContext } from "@coinbase/waas-sdk-web-react";
import React, { useEffect, useState } from "react";

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
  return resp.token;
};

const ConnectWalletV2 = ({ action, uuid }) => {
  const [walletAddress, setWalletAddress] = useState();
  const { waas, user, isCreatingWallet, wallet } = useWalletContext();
  const handleLogin = async () => {
    await waas.login({
      provideAuthToken: () => fetchExampleAuthServerToken(uuid),
    });
  };
  const handleLogout = async () => {
    await waas.logout();
  };
  useEffect(() => {
    if (!user || wallet || isCreatingWallet) return;

    if (user.hasWallet) {
      user.restoreFromHostedBackup();
    } else {
      user.create();
    }
  }, [user, wallet, isCreatingWallet]);
  const getWallet = async () => {
    let walletAddresses = await wallet.addresses.all();

    setWalletAddress(walletAddresses[0]);
  };
  if (wallet && !walletAddress) getWallet();
  if (!waas) return <div>WaaS Not Initialized</div>;

  return (
    <div>
      {!user && <button onClick={handleLogin}>Login</button>}
      {user && <p>User is logged in! {walletAddress?.address} </p>}
      {user && <button onClick={handleLogout}>Logout</button>}
    </div>
  );
};

export default ConnectWalletV2;

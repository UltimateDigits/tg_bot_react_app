import { useEVMAddress, useWalletContext } from "@coinbase/waas-sdk-web-react";
import React, { useEffect, useState } from "react";
import { ProtocolFamily } from "@coinbase/waas-sdk-web";
import { toViem } from "@coinbase/waas-sdk-viem";
import { createWalletClient, http, parseEther } from "viem";
import { sepolia } from "viem/chains";

const ConnectWallet = (props) => {
  const { wallet, waas, error, isCreatingWallet } = useWalletContext();
  const address = useEVMAddress(wallet);
  const [signature, setSignature] = useState();
  const [walletClient, setWalletClient] = useState();
  const [tx, setTx] = useState();
  useEffect(() => {
    async function getWalletDetails() {
      const address = await wallet.addresses.for(ProtocolFamily.EVM);
      const newAddress = await wallet.createAddress(ProtocolFamily.EVM);
      console.log(`created new address: ${newAddress.address}`);
      const walletClientObj = createWalletClient({
        account: toViem(address),
        chain: sepolia,
        transport: http(
          "https://eth-sepolia.g.alchemy.com/v2/ASzBjexHwXNSubHLqCI-J1BQIHoULFIK"
        ),
      });
      setWalletClient(walletClientObj);
    }
    if (!waas) {
      // waas is still loading.
      console.log("Waas is loading.");
    } else if (isCreatingWallet) {
      // your wallet is being setup
      console.log("Creating a wallet...");
    }
    if (wallet) {
      // you have a wallet!
      console.log("Got a wallet!");
      console.log(wallet);
    }
    if (address) {
      // you have an address!
      console.log(`Onchain address: ${address.address}`);
      getWalletDetails();
    }
  }, [waas, isCreatingWallet, wallet, address]);
  // here goes step 4 & 5...

  const signTransaction = async () => {
    if (walletClient) {
      console.log("signing a message with address " + address.address + "...");
      const signature = await walletClient.signMessage({
        message: "hello from waas!",
      });
      console.log(`Got signature: ${signature}`);
      setSignature(setSignature);
    }
  };
  const sendTransaction = async () => {
    console.log(
      "signing a transaction with address " + address.address + "..."
    );
    const res = await walletClient.sendTransaction({
      account: toViem(address),
      to: "0xe4AFa839DB65B0539C7D0A2265a4D1220FFc4401", // recipient address
      value: parseEther("0.01"), // transaction amount
    });
    console.log(res);
    setTx(res);
  };
  return (
    <div>
      {wallet && <p>Your have a wallet: {JSON.stringify(wallet)}</p>}
      {address && (
        <>
          <a
            href={`https://sepolia.etherscan.io/address/${address.address}`}
            target="_blank"
          >
            {address.address}
          </a>
        </>
      )}
      {walletClient && (
        <div style={{ marginTop: "20px" }}>
          Transfer 0.01ETH To <i>0xe4AFa839DB65B0539C7D0A2265a4D1220FFc4401</i>
          <div style={{ marginTop: "10px" }}>
            <button onClick={() => signTransaction()}>
              Sign Transaction (sample code)
            </button>
          </div>
          <div style={{ marginTop: "10px" }}>
            <button onClick={() => sendTransaction()}>
              Send Transaction (sample code)
            </button>
          </div>
        </div>
      )}

      {tx && (
        <div style={{ marginTop: "10px" }}>
          <a href={`https://sepolia.etherscan.io/tx/${tx}`} target="_blank">
            Transaction : {tx}
          </a>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;

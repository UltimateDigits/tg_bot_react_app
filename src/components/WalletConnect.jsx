import React, { useEffect, useState } from "react";
import { useWalletConnectClient } from "../contexts/ClientContext";
import { useJsonRpc } from "../contexts/JsonRpcContext";
import { ThreeDots } from "react-loader-spinner";

const WalletConnect = ({ decryptedData }) => {
  const [walletAddress, setWalletAddress] = useState([]);
  const {
    client,
    pairings,
    session,
    connect,
    disconnect,
    chains,
    relayerRegion,
    accounts,
    balances,
    isFetchingBalances,
    isInitializing,
    setChains,
    setRelayerRegion,
    origin,
  } = useWalletConnectClient();

  const { ping, ethereumRpc, isRpcRequestPending, rpcResult } = useJsonRpc();

  useEffect(() => {
    setChains(["eip155:8453"]);
  }, [setChains]);

  const onConnect = () => {
    if (typeof client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    connect();
  };

  const onEthSend = async () => {
    const baseChainID = "8453";
    const selectedAccount = accounts.find((account) =>
      account.includes(`eip155:${baseChainID}`)
    );
    const [namespace, reference, address] = selectedAccount.split(":");
    const chainId = `${namespace}:${reference}`;
    console.log(chainId);
    await ethereumRpc.sendTransaction(chainId, address);
  };

  useEffect(() => {
    setWalletAddress(accounts[0]?.split(":")[2]);
  }, [accounts]);

  return (
    <div>
      {accounts.length > 0 ? (
        <div>
          <div>Account Connected Successfully</div>
          {rpcResult?.result && rpcResult?.result}
          {isRpcRequestPending ? (
            <>
              Sending Crypto
              <ThreeDots
                visible={true}
                height={80}
                width={80}
                color="#4fa94d"
                radius={9}
              />
            </>
          ) : (
            <>
              <h4>{walletAddress}</h4>
              <button onClick={onEthSend}>Send ETH</button>
            </>
          )}
          <br/>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={onConnect}>Connect</button>
      )}
    </div>
  );
};
export default WalletConnect;

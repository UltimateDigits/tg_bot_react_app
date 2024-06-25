import React, { useEffect, useState } from "react";
import { useWalletConnectClient } from "../contexts/ClientContext";
import { useJsonRpc } from "../contexts/JsonRpcContext";
import { ThreeDots } from "react-loader-spinner";

const WalletConnect = ({ decryptedData }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const { client, session, connect, accounts, isRpcRequestPending, setChains } =
    useWalletConnectClient();
  const { ethereumRpc, rpcResult } = useJsonRpc();

  const isSendCryptoFlow =
    decryptedData?.action === "WALLET_CONNECT_SEND_CRYPTO";

  useEffect(() => {
    setChains(["eip155:8453"]);
  }, [setChains]);

  const onConnect = () => {
    if (!client) {
      throw new Error("WalletConnect is not initialized");
    }
    connect();
  };

  useEffect(() => {
    if (session) {
      const payload =
        isSendCryptoFlow && rpcResult
          ? { walletConnect: rpcResult, ...decryptedData }
          : { walletConnect: session, ...decryptedData };
      setTimeout(() => {
        window?.Telegram?.WebApp?.sendData(JSON.stringify(payload));
      }, 3000);
    }
  }, [rpcResult, isSendCryptoFlow, session, decryptedData]);

  useEffect(() => {
    if (accounts.length > 0) {
      setWalletAddress(accounts[0]?.split(":")[2]);
    }
  }, [accounts]);

  useEffect(() => {
    const onEthSend = async () => {
      const baseChainID = "8453";
      const selectedAccount = accounts.find((account) =>
        account.includes(`eip155:${baseChainID}`)
      );
      if (selectedAccount) {
        const [namespace, reference, address] = selectedAccount.split(":");
        const chainId = `${namespace}:${reference}`;
        await ethereumRpc.sendTransaction(chainId, address);
      }
    };

    if (session && isSendCryptoFlow) {
      onEthSend();
    }
  }, [session, isSendCryptoFlow, accounts, ethereumRpc]);

  return (
    <div>
      {accounts.length > 0 ? (
        <div>
          <div>Account Connected Successfully</div>
          {rpcResult?.result}
          {isRpcRequestPending ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              Sending Crypto
              <ThreeDots
                visible={true}
                height={80}
                width={80}
                color="#4fa94d"
                radius={9}
              />
              <h3>
                Please check your wallet connect app and approve the transaction
              </h3>
            </div>
          ) : (
            <>
              <h4>{walletAddress}</h4>
              {/* <button onClick={onEthSend}>Send ETH</button> */}
            </>
          )}
          <br />
          {/* <button onClick={disconnect}>Disconnect</button> */}
        </div>
      ) : (
        client && <button onClick={onConnect}>Connect</button>
      )}
    </div>
  );
};

export default WalletConnect;

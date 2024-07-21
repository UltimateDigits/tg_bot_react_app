import React, { useEffect, useState } from "react";
import { toViem } from "@coinbase/waas-sdk-viem";
import { createWalletClient, http, getContract, parseUnits } from "viem";
import * as chains from "viem/chains";
import { ThreeDots } from "react-loader-spinner";
import { fetchAuthServerUserToken } from "../helpers/utils";
import { useEVMAddress, useWalletContext } from "@coinbase/waas-sdk-web-react";
import ERC20_ABI from "../abi/UltABI.json";

const SendCrypto = ({ decryptedData }) => {
  const { action, receiver_wallet, uuid, amount, url, chain, tokenAddress } =
    decryptedData;
  const [error, setError] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const { waas, user, wallet, isLoggingIn } = useWalletContext();
  const evmAddress = useEVMAddress(wallet);

  useEffect(() => {
    if (!user && !isLoggingIn) {
      waas?.login({
        provideAuthToken: async () => fetchAuthServerUserToken(uuid),
      });
    }
  }, [waas, uuid, isLoggingIn, user]);

  useEffect(() => {
    const getUserWalletDetails = async () => {
      if (wallet) {
        return await wallet?.addresses.all();
      }
      if (user.hasWallet && !wallet) {
        await user.restoreFromHostedBackup();
      } else {
        await user.create();
      }
      return await wallet?.addresses.all();
    };

    const fetchUserWalletDetails = async () => {
      if (user) {
        await getUserWalletDetails();
      }
    };
    fetchUserWalletDetails();
  }, [user, wallet]);

  useEffect(() => {
    const sendCrypto = async () => {
      try {
        if (!evmAddress) return;

        const walletClient = createWalletClient({
          chain: chains[chain],
          transport: http(url),
        });

        // Create an instance of the token contract
        const tokenContract = new getContract({
          address: tokenAddress,
          abi: ERC20_ABI,
          client: walletClient,
        });

        // Convert amount to token's smallest unit (usually 18 decimals for ERC-20)
        const amountInWei = parseUnits(amount, 18);
        // To send ETH, Use the following format
        // const res = await walletClient.sendTransaction({
        //   account: toViem(evmAddress),
        //   to: receiver_wallet,
        //   value: parseEther(amount),
        // });

        const result = await tokenContract.read.totalSupply();
        console.log("Total Supply:", result);

        const res = await walletClient.writeContract({
          account: toViem(evmAddress),
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: "transfer",
          args: [receiver_wallet, amountInWei.toString()],
        });

        setTransaction(res);
        const transactionDetails = {
          from_wallet: evmAddress?.address,
          to_wallet: receiver_wallet,
          transaction_id: res,
          action: action,
        };

        setTimeout(() => {
          window?.Telegram?.WebApp?.sendData(
            JSON.stringify(transactionDetails)
          );
        }, 3000);
      } catch (error) {
        console.error("Error sending crypto:", error);
        setError("Error: Failed to send crypto.");
        const transactionDetails = {
          action: "ERROR_SEND_CRYPTO",
        };
        setTimeout(() => {
          window?.Telegram?.WebApp?.sendData(
            JSON.stringify(transactionDetails)
          );
        }, 3000);
      }
    };

    sendCrypto();
  }, [receiver_wallet, url, amount, action, evmAddress, chain, tokenAddress]);

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!evmAddress) {
    return (
      <>
        <h2>Loading Wallet...</h2>
        <div
          style={{
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <ThreeDots
            visible={true}
            height={80}
            width={80}
            color="#4fa94d"
            radius={9}
          />
        </div>
      </>
    );
  }

  return (
    <div
      style={{ textAlign: "center", display: "flex", justifyContent: "center" }}
    >
      {transaction && <h2>Crypto Sent Successfully</h2>}
      {!transaction && (
        <ThreeDots
          visible={true}
          height={80}
          width={80}
          color="#4fa94d"
          radius={9}
        />
      )}
    </div>
  );
};

export default SendCrypto;

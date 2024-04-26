import React, { useEffect, useState } from "react";
import { InitializeWaas } from "@coinbase/waas-sdk-web";
import { toViem } from "@coinbase/waas-sdk-viem";
import { createWalletClient, http, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { ThreeDots } from "react-loader-spinner";

const fetchExampleAuthServerToken = async (uuid) => {
  try {
    const resp = await fetch(
      "https://ud-backend-six.vercel.app/coinbase/coinbaseAuth",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uuid }),
      }
    );
    const data = await resp.json();
    return data.token;
  } catch (error) {
    console.error("Error fetching auth server token:", error);
    throw new Error("Failed to fetch auth server token");
  }
};

const SendCrypto = ({ decryptedData }) => {
  const { action, receiver_wallet, uuid, amount, url } = decryptedData;
  console.log("Receiver wallet - " + receiver_wallet);
  const [walletAddress, setWalletAddress] = useState(null);
  const [error, setError] = useState(null);
  const [transaction, setTransaction] = useState(null);
  useEffect(() => {
    const initializeWaas = async () => {
      try {
        const waas = await InitializeWaas({
          collectAndReportMetrics: true,
          enableHostedBackups: true,
          prod: false,
          projectId: "1994648a1fa8a282f1c3ca917a0379f1f79fbb06",
        });

        const user = await waas.auth.login({
          provideAuthToken: () => fetchExampleAuthServerToken(uuid),
        });

        let walletExist =
          waas.wallets.wallet ||
          (user.hasWallet && (await waas.wallets.restoreFromHostedBackup()));

        if (walletExist) {
          const addresses = await walletExist.addresses.all();
          setWalletAddress(addresses[0]);
        } else {
          setError("Error: No wallet found.");
        }
      } catch (error) {
        console.error("Error initializing Waas:", error);
        setError("Error: Failed to initialize Waas.");
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

    initializeWaas();
  }, [uuid]);

  useEffect(() => {
    const sendCrypto = async () => {
      try {
        if (!walletAddress) return;

        const walletClient = createWalletClient({
          account: toViem(walletAddress),
          chain: sepolia,
          transport: http(url),
        });

        const res = await walletClient.sendTransaction({
          account: toViem(walletAddress),
          to: receiver_wallet,
          value: parseEther(amount),
        });

        console.log("Transaction successful:", res);
        setTransaction(res);
        const transactionDetails = {
          from_wallet: walletAddress,
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
  }, [walletAddress, receiver_wallet]);

  if (error) {
    return <h2>{error}</h2>;
  }

  if (!walletAddress) {
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

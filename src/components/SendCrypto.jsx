import { InitializeWaas } from "@coinbase/waas-sdk-web";
import React, { useEffect, useMemo, useState } from "react";
import { toViem } from "@coinbase/waas-sdk-viem";
import { createWalletClient, http, parseEther } from "viem";
import { sepolia } from "viem/chains";
import { Address } from "@coinbase/waas-sdk-web";


const fetchExampleAuthServerToken = async (uuid) => {
  console.log("uuid -> " + uuid);
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

const SendCrypto = ({ decryptedData }) => {
  const { action, firstName, phone_number, uuid, userid, username } =
    decryptedData;

  const [wallet, setWallet] = useState();
  const [walletAddress, setWalletAddress] = useState();

  useEffect(() => {
    const intilazeWaas = async () => {
      const waas = await InitializeWaas({
        collectAndReportMetrics: true,
        enableHostedBackups: true,
        prod: false,
        projectId: "1994648a1fa8a282f1c3ca917a0379f1f79fbb06",
      });
      const user = await waas.auth.login({
        provideAuthToken: () => fetchExampleAuthServerToken(uuid),
      });
      let walletExist;

      if (waas.wallets.wallet) {
        walletExist = waas.wallets.wallet;
      } else if (user.hasWallet) {
        walletExist = await waas.wallets.restoreFromHostedBackup();
      } else {
        walletExist = await waas.wallets.create();
      }
      const addresses = await walletExist.addresses.all();
      setWalletAddress(addresses[0]);
      setWallet(walletExist);
    
      console.log(walletExist);
      
      if (addresses && addresses[0]) {
        // console.log(walletAddress);
        // const walletClient = createWalletClient({
        //     account: toViem(walletAddress),
        //     chain: baseSepolia,
        //     transport: "https://eth-sepolia.g.alchemy.com/v2/N_qpOg81hFyUvaTRSeJP4H93zWiB2sLY",
        // });
        
        // console.log("signing a transaction with address " + walletAddress + "...");

        // const res = await walletClient.sendTransaction({
        //     account: toViem(walletAddress),
        //     to: "0x4256c6125b7e7FaC1a69B855a4Aa4BA05276D6cc", // recipient address
        //     value: parseEther("0.01"), // transaction amount
        // });
      }
    };
    intilazeWaas();
  }, []);

  useMemo(() => {
    const sendCrypto = async () => {
        if(walletAddress?.address) {
            console.log("Wallet address - " + walletAddress?.address);

            const walletClient = createWalletClient({
                account: toViem(walletAddress),
                chain: sepolia,
                transport: http("https://eth-sepolia.g.alchemy.com/v2/N_qpOg81hFyUvaTRSeJP4H93zWiB2sLY"),
            });

            console.log("signing a transaction with address " + walletAddress + "...");

            const res = await walletClient.sendTransaction({
                account: toViem(walletAddress),
                to: "0x4256c6125b7e7FaC1a69B855a4Aa4BA05276D6cc", // recipient address
                value: parseEther("0.001"), // transaction amount
            });

            console.log("Res --> " + res);
        }
    }
    sendCrypto();
  }, [walletAddress]);

  if (!wallet || wallet?.wallets) {
    return (
      <>
        <h2>Wallet not present</h2>
      </>
    );
  }

  
  return (
    <div>
      {walletAddress && (
        <>
          <h2>Wallet Created </h2>
          <h3>Your Wallet is created {walletAddress?.address} </h3>
          <p>Browser will close in 3 seconds</p>
        </>
      )}
    </div>
  );
};

export default SendCrypto;

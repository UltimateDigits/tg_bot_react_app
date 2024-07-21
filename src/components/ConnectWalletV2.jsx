import { InitializeWaas } from "@coinbase/waas-sdk-web";
import React, { useEffect, useState } from "react";
import { Triangle } from "react-loader-spinner";
import { fetchAuthServerUserToken } from "../helpers/utils";


const ConnectWalletV2 = ({ decryptedData }) => {
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
        provideAuthToken: () => fetchAuthServerUserToken(uuid),
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

      if (addresses && addresses[0]) {
        const userDetails = {
          walletAddress: addresses[0]?.address,
          firstName: firstName,
          phone_number: phone_number,
          user_id: userid,
          uuid: uuid,
          action: action,
          username: username,
        };
        window.Telegram.WebApp.CloudStorage.setItem(
          "userDetails",
          JSON.stringify(userDetails)
        );
        setTimeout(() => {
          window?.Telegram?.WebApp?.sendData(JSON.stringify(userDetails));
        }, 3000);
      }
    };
    intilazeWaas();
  }, []);

  if (!wallet || wallet?.wallets) {
    return (
      <>
        <h2>Creating Wallet</h2>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Triangle
            visible={true}
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="triangle-loading"
            wrapperStyle={{}}
            wrapperClass=""
          />
        </div>
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

export default ConnectWalletV2;

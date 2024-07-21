import React, { useEffect, useState } from "react";
import { useWalletContext } from "@coinbase/waas-sdk-web-react";
import { Triangle } from "react-loader-spinner";
import { fetchAuthServerUserToken, parsePhoneDetails } from "../helpers/utils";

/**
 * This component is responsible for connecting a user's Coinbase wallet and retrieving their wallet address.
 * It also sends user details to the Telegram Web App for further processing.
 *
 * @param {Object} props - The component's props.
 * @param {Object} props.decryptedData - An object containing user details.
 * @param {string} props.decryptedData.action - The action to be performed.
 * @param {string} props.decryptedData.firstName - The user's first name.
 * @param {string} props.decryptedData.phone_number - The user's phone number.
 * @param {string} props.decryptedData.uuid - The user's unique identifier.
 * @param {string} props.decryptedData.userid - The user's ID.
 * @param {string} props.decryptedData.username - The user's username.
 *
 * @returns {JSX.Element} - The component's JSX.
 */
const ConnectWalletCoinbase = ({ decryptedData }) => {
  const [walletAddress, setWalletAddress] = useState();
  const { action, firstName, phone_number, uuid, userid, username } =
    decryptedData;
  const { waas, user, wallet, isLoggingIn } = useWalletContext();

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
        const addresses = await getUserWalletDetails();
        if (addresses?.length > 0) {
          setWalletAddress(addresses[0]?.address);
        }
      }
    };
    fetchUserWalletDetails();
  }, [user, wallet]);

  useEffect(() => {
    if (walletAddress) {
      const userDetails = {
        rootId: wallet?.rootContainerID,
        endUserId: wallet?.endUserID,
        address: walletAddress,
        source: "TELEGRAM",
        user_id: userid,
        userDetailsTG: {
          firstName: firstName,
          user_id: userid,
          uuid: uuid,
          action: action,
          username: username,
        },
      };
      if (phone_number) {
        const phoneDetails = parsePhoneDetails(phone_number);
        if (phoneDetails) {
          const { countryCode, mobileNumber } = phoneDetails;
          userDetails.phone = mobileNumber;
          userDetails.countryCode = countryCode;
          userDetails.type = "real";
        }
      }
      setTimeout(() => {
        window?.Telegram?.WebApp?.sendData(JSON.stringify(userDetails));
      }, 3000);
    }
  }, [
    action,
    firstName,
    phone_number,
    userid,
    username,
    uuid,
    wallet,
    walletAddress,
  ]);

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
    <>
      {action === "EXISTING_UD_USER" && (
        <button
          disabled={!waas || !!user}
          onClick={() => {
            waas?.login();
          }}
        >
          Login
        </button>
      )}
      <div>
        {walletAddress && (
          <>
            <h2>Your Wallet is created {walletAddress} </h2>
            <p>Browser will close in 3 seconds</p>
          </>
        )}
      </div>
    </>
  );
};

export default ConnectWalletCoinbase;

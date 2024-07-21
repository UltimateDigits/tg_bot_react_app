import { getAppMetadata } from "@walletconnect/utils";

if (!process.env.REACT_APP_PUBLIC_PROJECT_ID)
  throw new Error("`REACT_APP_PUBLIC_PROJECT_ID` env variable is missing.");

export const DEFAULT_MAIN_CHAINS = [
  "eip155:1",
  "eip155:10",
  "eip155:100",
  "eip155:137",
  "eip155:324",
  "eip155:42161",
  "eip155:42220",
];

export const DEFAULT_PROJECT_ID = process.env.REACT_APP_PUBLIC_PROJECT_ID;
export const DEFAULT_RELAY_URL = process.env.REACT_APP_PUBLIC_RELAY_URL;

export const DEFAULT_LOGGER = "info";

export const DEFAULT_APP_METADATA = {
  name: "Ultimate Bot",
  description: "Ultimate Bot",
  url: "https://www.ultimatedigits.com/",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
  verifyUrl: "https://verify.walletconnect.com",
};

/**
 * EIP5792
 */
export const DEFAULT_EIP5792_METHODS = {
  WALLET_GET_CAPABILITIES: "wallet_getCapabilities",
  WALLET_SEND_CALLS: "wallet_sendCalls",
  WALLET_GET_CALLS_STATUS: "wallet_getCallsStatus",
};

export const DEFAULT_EIP155_METHODS = {
  ETH_SEND_TRANSACTION: "eth_sendTransaction",
  PERSONAL_SIGN: "personal_sign",
};

export const DEFAULT_EIP155_OPTIONAL_METHODS = {
  ETH_SIGN_TRANSACTION: "eth_signTransaction",
  ETH_SIGN: "eth_sign",
  ETH_SIGN_TYPED_DATA: "eth_signTypedData",
  ETH_SIGN_TYPED_DATA_V4: "eth_signTypedData_v4",
};

export const DEFAULT_OPTIONAL_METHODS = {
  ...DEFAULT_EIP155_OPTIONAL_METHODS,
  ...DEFAULT_EIP5792_METHODS,
};

export const DEFAULT_EIP_155_EVENTS = {
  ETH_CHAIN_CHANGED: "chainChanged",
  ETH_ACCOUNTS_CHANGED: "accountsChanged",
};

export const DEFAULT_GITHUB_REPO_URL =
  "https://github.com/WalletConnect/web-examples/tree/main/dapps/react-dapp-v2";

export const REGIONALIZED_RELAYER_ENDPOINTS = [
  {
    value: DEFAULT_RELAY_URL,
    label: "Default",
  },
  {
    value: "wss://us-east-1.relay.walletconnect.com",
    label: "US",
  },
  {
    value: "wss://eu-central-1.relay.walletconnect.com",
    label: "EU",
  },
  {
    value: "wss://ap-southeast-1.relay.walletconnect.com",
    label: "Asia Pacific",
  },
];

export const ORIGIN_OPTIONS = [
  {
    value: getAppMetadata().url,
    label: "VALID",
  },
  {
    value: "https://invalid.origin",
    label: "INVALID",
  },
  {
    value: "unknown",
    label: "UNKNOWN",
  },
];

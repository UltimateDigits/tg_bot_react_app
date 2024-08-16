import * as encoding from "@walletconnect/encoding";
import axios from "axios";
import { Contract, providers, utils } from "ethers";
import { hexToBuffer, bufferToHex } from "@walletconnect/encoding";
import { keccak256 } from "ethers/lib/utils";
import { ecrecover, fromRpcSig, publicToAddress } from "@ethereumjs/util";
import { parsePhoneNumber } from "awesome-phonenumber";

export function convertHexToNumber(hex) {
  try {
    return encoding.hexToNumber(hex);
  } catch (e) {
    return hex;
  }
}

export function convertHexToUtf8(hex) {
  try {
    return encoding.hexToUtf8(hex);
  } catch (e) {
    return hex;
  }
}

export async function formatTransaction(account, amount) {
  const [namespace, reference, address] = account.split(":");
  const chainId = `${namespace}:${reference}`;
  const rpc = rpcProvidersByChainId[Number(reference)];
  if (!rpc) {
    throw new Error(`Missing rpcProvider definition for chainId: ${chainId}`);
  }
  let _nonce;
  try {
    _nonce = await apiGetAccountNonce(address, chainId);
  } catch (error) {
    throw new Error(
      `Failed to fetch nonce for address ${address} on chain ${chainId}`
    );
  }

  const nonce = encoding.sanitizeHex(encoding.numberToHex(_nonce));

  // gasPrice
  const _gasPrice = await apiGetGasPrice(chainId);
  const gasPrice = encoding.sanitizeHex(_gasPrice);

  // gasLimit
  const _gasLimit = 21000;
  const gasLimit = encoding.sanitizeHex(encoding.numberToHex(_gasLimit));
  console.log(gasLimit);
  // value
  const _value = amount;
  const value = encoding.sanitizeHex(encoding.numberToHex(_value));
  console.log(value);
  // const { maxFeePerGas, maxPriorityFeePerGas } = await estimateGas(rpc.baseURL);

  const tx = {
    from: address,
    to: address,
    data: "0x",
    nonce,
    gasPrice,
    gasLimit,
    value,
  };

  return tx;
}

export const apiGetAccountNonce = async (address, chainId) => {
  const ethChainId = chainId.split(":")[1];
  const { baseURL } = rpcProvidersByChainId[Number(ethChainId)];
  const response = await api.post(baseURL, {
    jsonrpc: "2.0",
    method: "eth_getTransactionCount",
    params: [address, "latest"],
    id: 1,
  });
  const { result } = response.data;
  const nonce = parseInt(result, 16);
  return nonce;
};

const api = axios.create({
  baseURL: "https://rpc.walletconnect.com/v1",
  timeout: 10000, // 10 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const WALLETCONNECT_RPC_BASE_URL = `https://rpc.walletconnect.com/v1?projectId=${process.env.REACT_APP_PUBLIC_PROJECT_ID}`;
export const rpcProvidersByChainId = {
  1: {
    name: "Ethereum Mainnet",
    baseURL: WALLETCONNECT_RPC_BASE_URL + "&chainId=eip155:1",
    token: {
      name: "Ether",
      symbol: "ETH",
    },
  },
  5: {
    name: "Ethereum Goerli",
    baseURL: WALLETCONNECT_RPC_BASE_URL + "&chainId=eip155:5",
    token: {
      name: "Ether",
      symbol: "ETH",
    },
  },
  11155111: {
    name: "Ethereum Sepolia",
    baseURL: WALLETCONNECT_RPC_BASE_URL + "&chainId=eip155:11155111",
    token: {
      name: "Ether",
      symbol: "ETH",
    },
  },
  10: {
    name: "Optimism",
    baseURL: WALLETCONNECT_RPC_BASE_URL + "&chainId=eip155:10",
    token: {
      name: "Ether",
      symbol: "ETH",
    },
  },
  8453: {
    name: "Base",
    baseURL: WALLETCONNECT_RPC_BASE_URL + "&chainId=eip155:8453",
    token: {
      name: "Ether",
      symbol: "ETH",
    },
  },
};

export function hashPersonalMessage(msg) {
  const data = encodePersonalMessage(msg);
  const buf = hexToBuffer(data);
  const hash = keccak256(buf);
  return bufferToHex(hash);
}

export function encodePersonalMessage(msg) {
  const data = encoding.utf8ToBuffer(msg);
  const buf = Buffer.concat([
    Buffer.from(
      "\u0019Ethereum Signed Message:\n" + data.length.toString(),
      "utf8"
    ),
    data,
  ]);
  return bufferToHex(buf);
}

export async function estimateGas(rpcUrl) {
  const provider = new providers.JsonRpcProvider(rpcUrl);
  const gasPrice = await provider.getFeeData();
  console.log(`Estimated gas price`, gasPrice);
  return {
    maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas._hex,
    maxFeePerGas: gasPrice.maxFeePerGas._hex,
  };
}

export async function verifySignature(address, sig, hash, rpcUrl) {
  const provider = new providers.JsonRpcProvider(rpcUrl);
  const bytecode = await provider.getCode(address);
  if (
    !bytecode ||
    bytecode === "0x" ||
    bytecode === "0x0" ||
    bytecode === "0x00"
  ) {
    const signer = recoverAddress(sig, hash);
    return signer.toLowerCase() === address.toLowerCase();
  } else {
    return isValidSignature(address, sig, hash, provider);
  }
}

export function recoverAddress(sig, hash) {
  const params = fromRpcSig(sig);
  const result = ecrecover(hexToBuffer(hash), params.v, params.r, params.s);
  const signer = bufferToHex(publicToAddress(result));
  return signer;
}

export const apiGetGasPrice = async (chainId) => {
  const ethChainId = chainId.split(":")[1];
  const { baseURL } = rpcProvidersByChainId[Number(ethChainId)];
  const response = await api.post(baseURL, {
    jsonrpc: "2.0",
    method: "eth_gasPrice",
    params: [],
    id: 1,
  });
  const { result } = response.data;
  return result;
};

async function isValidSignature(
  address,
  sig,
  data,
  provider,
  abi = spec.abi,
  magicValue = spec.magicValue
) {
  let returnValue;
  try {
    returnValue = await new Contract(address, abi, provider).isValidSignature(
      utils.arrayify(data),
      sig
    );
  } catch (e) {
    return false;
  }
  return returnValue.toLowerCase() === magicValue.toLowerCase();
}

const spec = {
  magicValue: "0x1626ba7e",
  abi: [
    {
      constant: true,
      inputs: [
        {
          name: "_hash",
          type: "bytes32",
        },
        {
          name: "_sig",
          type: "bytes",
        },
      ],
      name: "isValidSignature",
      outputs: [
        {
          name: "magicValue",
          type: "bytes4",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
  ],
};

export async function apiGetAccountBalance(address, chainId) {
  const [namespace] = chainId.split(":");

  if (namespace !== "eip155") {
    return { balance: "", symbol: "", name: "" };
  }

  const ethChainId = chainId.split(":")[1];
  const rpc = rpcProvidersByChainId[Number(ethChainId)];
  if (!rpc) {
    return { balance: "", symbol: "", name: "" };
  }
  const { baseURL, token } = rpc;
  const response = await api.post(baseURL, {
    jsonrpc: "2.0",
    method: "eth_getBalance",
    params: [address, "latest"],
    id: 1,
  });
  const { result } = response.data;
  const balance = parseInt(result, 16).toString();
  return { balance, ...token };
}

export const fetchAuthServerUserToken = async (uuid) => {
  const cbAuthURL = process.env.REACT_APP_COINBASE_AUTH_SERVER;
  const resp = await fetch(cbAuthURL, {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uuid: uuid }),
  }).then((r) => r.json());
  return resp.token;
};

export const parsePhoneDetails = (phoneNumber) => {
  let phoneDetails;
  if (phoneNumber.includes("+")) {
    phoneDetails = parsePhoneNumber(phoneNumber);
  } else {
    phoneDetails = parsePhoneNumber(`+${phoneNumber}`);
  }
  if (phoneDetails && phoneDetails?.valid) {
    return {
      countryCode: phoneDetails.countryCode,
      mobileNumber: phoneDetails?.number?.significant,
    };
  }

  return {
    countryCode: 0,
    mobileNumber: 0,
  };
};

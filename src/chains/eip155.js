/* eslint-disable no-useless-concat */
import { convertHexToNumber, convertHexToUtf8 } from "../helpers/utils";

export const EIP155ChainData = {
  1: {
    name: "Ethereum Mainnet",
    id: "eip155:1",
    rpc: ["https://api.mycryptoapi.com/eth"],
    slip44: 60,
    testnet: false,
  },
  5: {
    name: "Ethereum Goerli",
    id: "eip155:5",
    rpc: ["https://rpc.goerli.mudit.blog"],
    slip44: 60,
    testnet: true,
  },
  11155111: {
    name: "Ethereum Sepolia",
    id: "eip155:11155111",
    rpc: ["https://gateway.tenderly.co/public/sepolia"],
    slip44: 60,
    testnet: true,
  },
  10: {
    name: "Optimism Mainnet",
    id: "eip155:10",
    rpc: ["https://mainnet.optimism.io"],
    slip44: 60,
    testnet: false,
  },
  8453: {
    name: "Base",
    id: "eip155:8453",
    rpc: ["https://base.llamarpc.com","https://base.meowrpc.com"],
    slip44: 60,
    testnet: false,
  },
};

export function getChainRequestRender(request) {
  let params = [{ label: "Method", value: request.method }];

  switch (request.method) {
    case "eth_sendTransaction":
    case "eth_signTransaction":
      params = [
        ...params,
        { label: "From", value: request.params[0].from },
        { label: "To", value: request.params[0].to },
        {
          label: "Gas Limit",
          value: request.params[0].gas
            ? convertHexToNumber(request.params[0].gas)
            : request.params[0].gasLimit
            ? convertHexToNumber(request.params[0].gasLimit)
            : "",
        },
        {
          label: "Gas Price",
          value: convertHexToNumber(request.params[0].gasPrice),
        },
        {
          label: "Nonce",
          value: convertHexToNumber(request.params[0].nonce),
        },
        {
          label: "Value",
          value: request.params[0].value
            ? convertHexToNumber(request.params[0].value)
            : "",
        },
        { label: "Data", value: request.params[0].data },
      ];
      break;

    case "eth_sign":
      params = [
        ...params,
        { label: "Address", value: request.params[0] },
        { label: "Message", value: request.params[1] },
      ];
      break;
    case "personal_sign":
      params = [
        ...params,
        { label: "Address", value: request.params[1] },
        {
          label: "Message",
          value: convertHexToUtf8(request.params[0]),
        },
      ];
      break;
    default:
      params = [
        ...params,
        {
          label: "params",
          value: JSON.stringify(request.params, null, "\t"),
        },
      ];
      break;
  }
  return params;
}

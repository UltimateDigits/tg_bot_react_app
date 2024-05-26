import { BigNumber, utils } from "ethers";
import { createContext, useContext, useState } from "react";
import * as encoding from "@walletconnect/encoding";

import { useWalletConnectClient } from "./ClientContext";
import {
  DEFAULT_EIP155_METHODS,
  DEFAULT_EIP155_OPTIONAL_METHODS,
} from "../constants";

import {
  formatTransaction,
  hashPersonalMessage,
  verifySignature,
  rpcProvidersByChainId,
} from "../helpers/utils";

/**
 * Context
 */
const JsonRpcContext = createContext();

/**
 * Provider
 */
export function JsonRpcContextProvider({ children }) {
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState(null);

  const { client, session, accounts, balances } = useWalletConnectClient();

  const _createJsonRpcRequestHandler =
    (rpcRequest) => async (chainId, address) => {
      if (!client) {
        throw new Error("WalletConnect is not initialized");
      }
      if (!session) {
        throw new Error("Session is not connected");
      }

      try {
        setPending(true);
        const result = await rpcRequest(chainId, address);
        setResult(result);
      } catch (err) {
        console.error("RPC request failed: ", err);
        setResult({
          address,
          valid: false,
          result: err?.message ?? err,
        });
      } finally {
        setPending(false);
      }
    };

  const ping = async () => {
    if (!client) {
      throw new Error("WalletConnect is not initialized");
    }
    if (!session) {
      throw new Error("Session is not connected");
    }

    try {
      setPending(true);
      let valid = false;
      try {
        await client.ping({ topic: session.topic });
        valid = true;
      } catch (e) {
        valid = false;
      }

      setResult({
        method: "ping",
        valid,
        result: valid ? "Ping succeeded" : "Ping failed",
      });
    } catch (e) {
      console.error(e);
      setResult(null);
    } finally {
      setPending(false);
    }
  };

  const ethereumRpc = {
    sendTransaction: _createJsonRpcRequestHandler(
      async (chainId, address) => {
        console.log("chainId ", chainId)
        const caipAccountAddress = `${chainId}:${address}`;
        const account = accounts.find(
          (account) => account === caipAccountAddress
        );
        if (!account)
          throw new Error(`Account for ${caipAccountAddress} not found`);

        const tx = await formatTransaction(account);
        const balance = BigNumber.from(balances[account][0].balance || "0");

        if (balance.lt(BigNumber.from(tx.gasPrice).mul(tx.gasLimit))) {
          return {
            method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
            address,
            valid: false,
            result: "Insufficient funds for intrinsic transaction cost",
          };
        }

        const result = await client.request({
          topic: session.topic,
          chainId,
          request: {
            method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
            params: [tx],
          },
        });

        return {
          method: DEFAULT_EIP155_METHODS.ETH_SEND_TRANSACTION,
          address,
          valid: true,
          result,
        };
      }
    ),
    // testSignTransaction: _createJsonRpcRequestHandler(
    //   async (chainId, address) => {
    //     const caipAccountAddress = `${chainId}:${address}`;
    //     const account = accounts.find(
    //       (account) => account === caipAccountAddress
    //     );
    //     if (!account)
    //       throw new Error(`Account for ${caipAccountAddress} not found`);

    //     const tx = await formatTestTransaction(account);
    //     const signedTx = await client.request({
    //       topic: session.topic,
    //       chainId,
    //       request: {
    //         method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN_TRANSACTION,
    //         params: [tx],
    //       },
    //     });

    //     const CELO_ALFAJORES_CHAIN_ID = 44787;
    //     const CELO_MAINNET_CHAIN_ID = 42220;

    //     let valid = false;
    //     const [, reference] = chainId.split(":");
    //     if (
    //       reference === CELO_ALFAJORES_CHAIN_ID.toString() ||
    //       reference === CELO_MAINNET_CHAIN_ID.toString()
    //     ) {
    //       const [, signer] = recoverTransaction(signedTx);
    //       valid = signer.toLowerCase() === address.toLowerCase();
    //     } else {
    //       valid = EthTransaction.fromSerializedTx(signedTx).verifySignature();
    //     }

    //     return {
    //       method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN_TRANSACTION,
    //       address,
    //       valid,
    //       result: signedTx,
    //     };
    //   }
    // ),
    testSignPersonalMessage: _createJsonRpcRequestHandler(
      async (chainId, address) => {
        const message = `My email is john@doe.com - ${Date.now()}`;
        const hexMsg = encoding.utf8ToHex(message, true);
        const params = [hexMsg, address];

        const signature = await client.request({
          topic: session.topic,
          chainId,
          request: {
            method: DEFAULT_EIP155_METHODS.PERSONAL_SIGN,
            params,
          },
        });

        const [reference] = chainId.split(":");
        const rpc = rpcProvidersByChainId[Number(reference)];
        if (!rpc) {
          throw new Error(
            `Missing rpcProvider definition for chainId: ${chainId}`
          );
        }

        const hashMsg = hashPersonalMessage(message);
        const valid = await verifySignature(
          address,
          signature,
          hashMsg,
          rpc.baseURL
        );

        return {
          method: DEFAULT_EIP155_METHODS.PERSONAL_SIGN,
          address,
          valid,
          result: signature,
        };
      }
    ),
    testEthSign: _createJsonRpcRequestHandler(async (chainId, address) => {
      const message = `My email is john@doe.com - ${Date.now()}`;
      const hexMsg = encoding.utf8ToHex(message, true);
      const params = [address, hexMsg];
      
      const signature = await client.request({
        topic: session.topic,
        chainId,
        request: {
          method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN,
          params,
        },
      });

      const [reference] = chainId.split(":");
      const rpc = rpcProvidersByChainId[Number(reference)];
      if (!rpc) {
        throw new Error(
          `Missing rpcProvider definition for chainId: ${chainId}`
        );
      }

      const hashMsg = hashPersonalMessage(message);
      const valid = await verifySignature(
        address,
        signature,
        hashMsg,
        rpc.baseURL
      );

      return {
        method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN + " (standard)",
        address,
        valid,
        result: signature,
      };
    }),
    testSignTypedData: _createJsonRpcRequestHandler(
      async (chainId, address) => {
        const message = JSON.stringify({
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
              { name: "verifyingContract", type: "address" },
            ],
            Person: [
              { name: "name", type: "string" },
              { name: "wallet", type: "address" },
            ],
          },
          primaryType: "Person",
          domain: {
            name: "Ether Mail",
            version: "1",
            chainId: 1,
            verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
          },
          message: {
            name: "Bob",
            wallet: "0xB0B0b0B0b0B0B0b0b0B0b0b0b0B0B0b0B0B0b0b0",
          },
        });

        const params = [address, message];

        const signature = await client.request({
          topic: session.topic,
          chainId,
          request: {
            method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN_TYPED_DATA,
            params,
          },
        });

        const [reference] = chainId.split(":");
        const rpc = rpcProvidersByChainId[Number(reference)];
        if (!rpc) {
          throw new Error(
            `Missing rpcProvider definition for chainId: ${chainId}`
          );
        }

        const hashedTypedData = utils._TypedDataEncoder.hash(
          JSON.parse(message).domain,
          JSON.parse(message).types,
          JSON.parse(message).message
        );

        const valid = await verifySignature(
          address,
          signature,
          hashedTypedData,
          rpc.baseURL
        );

        return {
          method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN_TYPED_DATA,
          address,
          valid,
          result: signature,
        };
      }
    ),
    testSignTypedDatav4: _createJsonRpcRequestHandler(
      async (chainId, address) => {
        const message = JSON.stringify({
          types: {
            EIP712Domain: [
              { name: "name", type: "string" },
              { name: "version", type: "string" },
              { name: "chainId", type: "uint256" },
              { name: "verifyingContract", type: "address" },
            ],
            Person: [
              { name: "name", type: "string" },
              { name: "wallet", type: "address" },
            ],
          },
          primaryType: "Person",
          domain: {
            name: "Ether Mail",
            version: "1",
            chainId: 1,
            verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
          },
          message: {
            name: "Bob",
            wallet: "0xB0B0b0B0b0B0B0b0b0B0b0b0b0B0B0b0B0B0b0b0",
          },
        });

        const params = [address, message];

        const signature = await client.request({
          topic: session.topic,
          chainId,
          request: {
            method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN_TYPED_DATA_V4,
            params,
          },
        });

        const [reference] = chainId.split(":");
        const rpc = rpcProvidersByChainId[Number(reference)];
        if (!rpc) {
          throw new Error(
            `Missing rpcProvider definition for chainId: ${chainId}`
          );
        }

        const hashedTypedData = utils._TypedDataEncoder.hash(
          JSON.parse(message).domain,
          JSON.parse(message).types,
          JSON.parse(message).message
        );

        const valid = await verifySignature(
          address,
          signature,
          hashedTypedData,
          rpc.baseURL
        );

        return {
          method: DEFAULT_EIP155_OPTIONAL_METHODS.ETH_SIGN_TYPED_DATA,
          address,
          valid,
          result: signature,
        };
      }
    ),
  };

  return (
    <JsonRpcContext.Provider
      value={{
        ping,
        ethereumRpc,
        rpcResult: result,
        isRpcRequestPending: pending,
      }}
    >
      {children}
    </JsonRpcContext.Provider>
  );
}

export function useJsonRpc() {
  const context = useContext(JsonRpcContext);
  if (context === undefined) {
    throw new Error("useJsonRpc must be used within a JsonRpcContextProvider");
  }
  return context;
}

import Client from "@walletconnect/sign-client";
import { Web3Modal } from "@web3modal/standalone";
import { RELAYER_EVENTS } from "@walletconnect/core";
import toast from "react-hot-toast";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { getAppMetadata, getSdkError } from "@walletconnect/utils";
import {
  DEFAULT_APP_METADATA,
  DEFAULT_LOGGER,
  DEFAULT_PROJECT_ID,
  DEFAULT_RELAY_URL,
} from "../constants";
import {
  getOptionalNamespaces,
  getRequiredNamespaces,
} from "../helpers/namespaces";
import { apiGetAccountBalance } from "../helpers/utils";

/**
 * Context
 */
export const ClientContext = createContext();

/**
 * Web3Modal Config
 */
const web3Modal = new Web3Modal({
  projectId: DEFAULT_PROJECT_ID,
  themeMode: "light",
  walletConnectVersion: 2,
});

/**
 * Provider
 */
export function ClientContextProvider({ children }) {

  const [client, setClient] = useState();
  const [pairings, setPairings] = useState([]);
  const [session, setSession] = useState();

  const [isInitializing, setIsInitializing] = useState(false);
  const prevRelayerValue = useRef("");

  const [balances, setBalances] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [chains, setChains] = useState([]);
  const [relayerRegion, setRelayerRegion] = useState(DEFAULT_RELAY_URL);
  const [origin, setOrigin] = useState(getAppMetadata().url);
  const [isFetchingBalances, setIsFetchingBalances] = useState(false);
  const reset = () => {
    setSession(undefined);
    setBalances({});
    setAccounts([]);
    setChains([]);
    setRelayerRegion(DEFAULT_RELAY_URL);
  };

  const getAccountBalances = async (_accounts) => {
    setIsFetchingBalances(true);
    try {
      const arr = await Promise.allSettled(
        _accounts.map(async (account) => {
          const [namespace, reference, address] = account.split(":");
          const chainId = `${namespace}:${reference}`;
          const assets = await apiGetAccountBalance(address, chainId);
          return { account, assets: [assets] };
        })
      );
      const balances = {};
      arr.forEach(({ status, value }) => {
        if (status === "fulfilled") {
          const { account, assets } = value;
          balances[account] = assets;
        }
      });
      setBalances(balances);
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingBalances(false);
    }
  };
  const onSessionConnected = useCallback(async (_session) => {
    const allNamespaceAccounts = Object.values(_session.namespaces)
      .map((namespace) => namespace.accounts)
      .flat();
    const allNamespaceChains = Object.keys(_session.namespaces);

    setSession(_session);
    setChains(allNamespaceChains);
    setAccounts(allNamespaceAccounts);
    await getAccountBalances(allNamespaceAccounts);
  }, []);

  const connect = useCallback(
    async (pairing) => {
      if (typeof client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }
      try {
        const requiredNamespaces = getRequiredNamespaces(chains);
        const optionalNamespaces = getOptionalNamespaces(chains);
        const { uri, approval } = await client.connect({
          pairingTopic: pairing?.topic,
          requiredNamespaces,
          optionalNamespaces,
        });
        if (uri) {
          // Create a flat array of all requested chains across namespaces.
          const standaloneChains = Object.values(requiredNamespaces)
            .map((namespace) => namespace.chains)
            .flat();

          web3Modal.openModal({ uri, standaloneChains });
        }
        const session = await approval();
        await onSessionConnected(session);
        setPairings(client.pairing.getAll({ active: true }));
      } catch (e) {
        console.error(e);
        toast.error(e.message, {
          position: "bottom-left",
        });
      } finally {
        // close modal in case it was open
        web3Modal.closeModal();
      }
    },
    [chains, client, onSessionConnected]
  );

  const disconnect = useCallback(async () => {
    if (typeof client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    if (typeof session === "undefined") {
      throw new Error("Session is not connected");
    }

    await client.disconnect({
      topic: session.topic,
      reason: getSdkError("USER_DISCONNECTED"),
    });

    // Reset app state after disconnect.
    reset();
  }, [client, session]);

  const _subscribeToEvents = useCallback(
    async (_client) => {
      if (typeof _client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }

      _client.on("session_ping", (args) => {
        //console.log("EVENT", "session_ping", args);
      });

      _client.on("session_event", (args) => {
       // console.log("EVENT", "session_event", args);
      });

      _client.on("session_update", ({ topic, params }) => {
       // console.log("EVENT", "session_update", { topic, params });
        const { namespaces } = params;
        const _session = _client.session.get(topic);
        const updatedSession = { ..._session, namespaces };
        onSessionConnected(updatedSession);
      });

      _client.on("session_delete", () => {
        //console.log("EVENT", "session_delete");
        reset();
      });
    },
    [onSessionConnected]
  );

  const _checkPersistedState = useCallback(
    async (_client) => {
      if (typeof _client === "undefined") {
        throw new Error("WalletConnect is not initialized");
      }
      // populates existing pairings to state
      setPairings(_client.pairing.getAll({ active: true }));
      // console.log(
      //   "RESTORED PAIRINGS: ",
      //   _client.pairing.getAll({ active: true })
      // );

      if (typeof session !== "undefined") return;
      // populates (the last) existing session to state
      if (_client.session.length) {
        const lastKeyIndex = _client.session.keys.length - 1;
        const _session = _client.session.get(
          _client.session.keys[lastKeyIndex]
        );
        // console.log("RESTORED SESSION:", _session);
        await onSessionConnected(_session);
        return _session;
      }
    },
    [session, onSessionConnected]
  );

  const _logClientId = useCallback(async (_client) => {
    if (typeof _client === "undefined") {
      throw new Error("WalletConnect is not initialized");
    }
    try {
      const clientId = await _client.core.crypto.getClientId();
      // console.log("WalletConnect ClientID: ", clientId);
      localStorage.setItem("WALLETCONNECT_CLIENT_ID", clientId);
    } catch (error) {
      console.error(
        "Failed to set WalletConnect clientId in localStorage: ",
        error
      );
    }
  }, []);

  const createClient = useCallback(async () => {
    try {
      setIsInitializing(true);
      const claimedOrigin =
        localStorage.getItem("wallet_connect_dapp_origin") || origin;
      const _client = await Client.init({
        logger: DEFAULT_LOGGER,
        relayUrl: relayerRegion,
        projectId: DEFAULT_PROJECT_ID,
        metadata: {
          ...(getAppMetadata() || DEFAULT_APP_METADATA),
          url: claimedOrigin,
          verifyUrl: DEFAULT_APP_METADATA.verifyUrl,
        },
      });

      setClient(_client);
      setOrigin(_client.metadata.url);
      prevRelayerValue.current = relayerRegion;
      await _subscribeToEvents(_client);
      await _checkPersistedState(_client);
      await _logClientId(_client);
    } catch (err) {
      throw err;
    } finally {
      setIsInitializing(false);
    }
  }, [
    _checkPersistedState,
    _subscribeToEvents,
    _logClientId,
    relayerRegion,
    origin,
  ]);

  useEffect(() => {
    const claimedOrigin =
      localStorage.getItem("wallet_connect_dapp_origin") || origin;
    let interval;
    // simulates `UNKNOWN` validation by removing the verify iframe thus preventing POST message
    if (claimedOrigin === "unknown") {
      //The interval is needed as Verify tries to init new iframe(with different urls) multiple times
      interval = setInterval(
        () => document.getElementById("verify-api")?.remove(),
        500
      );
    }
    return () => {
      clearInterval(interval);
    };
  }, [origin]);

  useEffect(() => {
    if (!client) {
      createClient();
    } else if (
      prevRelayerValue.current &&
      prevRelayerValue.current !== relayerRegion
    ) {
      client.core.relayer.restartTransport(relayerRegion);
      prevRelayerValue.current = relayerRegion;
    }
  }, [createClient, relayerRegion, client]);

  useEffect(() => {
    if (!client) return;
    client.core.relayer.on(RELAYER_EVENTS.connect, () => {
      toast.success("Network connection is restored!", {
        position: "bottom-left",
      });
    });

    client.core.relayer.on(RELAYER_EVENTS.disconnect, () => {
      toast.error("Network connection lost.", {
        position: "bottom-left",
      });
    });
  }, [client]);

  const value = useMemo(
    () => ({
      pairings,
      isInitializing,
      balances,
      accounts,
      chains,
      relayerRegion,
      client,
      session,
      connect,
      disconnect,
      setChains,
      setRelayerRegion,
      origin,
    }),
    [
      pairings,
      isInitializing,
      balances,
      accounts,
      chains,
      relayerRegion,
      client,
      session,
      connect,
      disconnect,
      setChains,
      setRelayerRegion,
      origin,
    ]
  );

  return (
    <ClientContext.Provider
      value={{
        ...value,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useWalletConnectClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error(
      "useWalletConnectClient must be used within a ClientContextProvider"
    );
  }
  return context;
}

import {
  DEFAULT_EIP155_METHODS,
  DEFAULT_EIP_155_EVENTS,
  DEFAULT_OPTIONAL_METHODS,
} from "../constants";

export const getNamespacesFromChains = (chains) => {
  const supportedNamespaces = [];
  chains.forEach((chainId) => {
    const [namespace] = chainId.split(":");
    if (!supportedNamespaces.includes(namespace)) {
      supportedNamespaces.push(namespace);
    }
  });

  return supportedNamespaces;
};

export const getSupportedRequiredMethodsByNamespace = (namespace) => {
  switch (namespace) {
    case "eip155":
      return Object.values(DEFAULT_EIP155_METHODS);
    default:
      throw new Error(
        `No default required methods for namespace: ${namespace}`
      );
  }
};

export const getSupportedOptionalMethodsByNamespace = (namespace) => {
  switch (namespace) {
    case "eip155":
      return Object.values(DEFAULT_OPTIONAL_METHODS);
    default:
      throw new Error(
        `No default optional methods for namespace: ${namespace}`
      );
  }
};

export const getSupportedEventsByNamespace = (namespace) => {
  switch (namespace) {
    case "eip155":
      return Object.values(DEFAULT_EIP_155_EVENTS);
    default:
      throw new Error(`No default events for namespace: ${namespace}`);
  }
};

export const getRequiredNamespaces = (chains) => {
  const selectedNamespaces = getNamespacesFromChains(chains);

  return Object.fromEntries(
    selectedNamespaces.map((namespace) => [
      namespace,
      {
        methods: getSupportedRequiredMethodsByNamespace(namespace),
        chains: chains.filter((chain) => chain.startsWith(namespace)),
        events: getSupportedEventsByNamespace(namespace),
      },
    ])
  );
};

export const getOptionalNamespaces = (chains) => {
  const selectedNamespaces = getNamespacesFromChains(chains);

  return Object.fromEntries(
    selectedNamespaces.map((namespace) => [
      namespace,
      {
        methods: getSupportedOptionalMethodsByNamespace(namespace),
        chains: chains.filter((chain) => chain.startsWith(namespace)),
        events: [],
      },
    ])
  );
};

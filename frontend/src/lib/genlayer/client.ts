import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";

type ClientConfig = NonNullable<Parameters<typeof createClient>[0]>;

export type BrowserWalletProvider = NonNullable<ClientConfig["provider"]>;

export const readClient = createClient({
  chain: testnetBradbury,
});

export type GenLayerTransactionHash =
  Parameters<typeof readClient.getTransaction>[0]["hash"];

export function createReadClient() {
  return createClient({
    chain: testnetBradbury,
  });
}

export function createWriteClient(
  address: `0x${string}`,
  provider: BrowserWalletProvider,
) {
  return createClient({
    chain: testnetBradbury,
    account: address,
    provider,
  });
}

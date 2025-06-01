import React, { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import {
  SolflareWalletAdapter,
  GlowWalletAdapter,
  BackpackWalletAdapter
} from "@solana/wallet-adapter-wallets";

import { clusterApiUrl } from "@solana/web3.js";
require("@solana/wallet-adapter-react-ui/styles.css");

export default function WalletConnectionProvider({ children }) {
  const network  = "devnet";
  const endpoint = clusterApiUrl(network);

  /* Phantom is already included via the Standard Wallet spec,
     so we leave it OUT to avoid the duplicate-registration warning */
  const wallets = useMemo(
    () => [
      new SolflareWalletAdapter(),
      new GlowWalletAdapter(),
      new BackpackWalletAdapter()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

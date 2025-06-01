// src/App.js
import React, { useState } from "react";
import RunnerGame from "./RunnerGame";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";

export default function App() {
  /* ---------- game state ---------- */
  const [gameOver, setGameOver]   = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  /* ---------- wallet ---------- */
  const { connected, publicKey } = useWallet();

  /* ---------- game-over handler ---------- */
  const handleGameOver = (score) => {
    setFinalScore(score);
    setGameOver(true);

    // TODO: reward $RCVRY tokens here using publicKey & score
    // (let me know when you'd like this implemented)
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gray-900 text-white">
      {/* —— Phantom connect button —— */}
      <WalletMultiButton className="!bg-teal-600 hover:!bg-teal-700" />

      {/* —— Wallet status —— */}
      {connected && (
        <p className="text-sm opacity-80 -mt-2">
          Connected: {publicKey.toBase58().slice(0, 4)}…{publicKey.toBase58().slice(-4)}
        </p>
      )}

      {/* —— Game area —— */}
      {!gameOver ? (
        <RunnerGame onGameOver={handleGameOver} />
      ) : (
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Game Over</h1>
          <p>You scored <strong>{finalScore}</strong>!</p>

          {/* restart button */}
          <button
            onClick={() => { setGameOver(false); setFinalScore(0); }}
            className="bg-teal-600 hover:bg-teal-700 px-4 py-2 rounded"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
}

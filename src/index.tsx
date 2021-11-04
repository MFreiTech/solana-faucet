import React, { useMemo, useEffect, useState, useCallback } from "react";

import { useConnection, useWallet } from "@solana/wallet-adapter-react";

// import { WalletNotConnectedError } from "@solana/wallet-adapter-base";

import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

import {
  WalletModalProvider,
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";

import { Background, Button } from "./components";

import { StyleSheet, View } from "react-native";

const BUTTON_TEXT = "Request Airdrop";
const BUTTON_TEXT_LOADING = "Requesting Airdrop...";

const App = () => {
  const [balance, setBalance] = useState(0);

  const [requestAirdropButton, setRequestAirdropButton] = useState({
    text: BUTTON_TEXT,
    loading: false,
  });

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const getBalance = async (publicKey) => {
    const _publicKey = new PublicKey(publicKey);

    const lamports = await connection.getBalance(_publicKey).catch((err) => {
      console.error(`Error: ${err}`);
    });

    const sol = lamports / LAMPORTS_PER_SOL;
    return sol;
  };

  const requestAirDrop = async (publicKey) => {
    setRequestAirdropButton({ text: BUTTON_TEXT_LOADING, loading: true });

    const airdropSignature = await connection.requestAirdrop(
      publicKey,
      LAMPORTS_PER_SOL
    );

    await connection.confirmTransaction(airdropSignature);

    const balance = await getBalance(publicKey.toString());
    setBalance(balance);
    setRequestAirdropButton({ text: BUTTON_TEXT, loading: false });
  };

  useEffect(() => {
    async function checkBalance() {
      const _balance = await getBalance(publicKey);
      setBalance(_balance);
    }

    if (publicKey) {
      checkBalance();
    }
  }, [publicKey]);

  const BalanceComponent = () => {
    return (
      <Button mode="outlined" style={styles.balance}>{`${balance} SOL`}</Button>
    );
  };

  const AskForAirdropComponent = () => {
    return (
      <View>
        <Button
          mode="contained"
          onPress={() => requestAirDrop(publicKey)}
          loading={requestAirdropButton.loading}
        >
          {requestAirdropButton.text}
        </Button>
      </View>
    );
  };

  return (
    <WalletModalProvider>
      <Background>
        <View style={styles.container}>
          {publicKey === null ? (
            <View style={styles.contemt}>
              <WalletMultiButton />
            </View>
          ) : (
            <View style={styles.row}>
              <View style={styles.requestAirdropButton}>
                <AskForAirdropComponent />
              </View>
              <View>
                <BalanceComponent />
              </View>
              <View>
                <WalletDisconnectButton />
              </View>
            </View>
          )}
        </View>
      </Background>
    </WalletModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignSelf: "center",
  },
  row: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  requestAirdropButton: {
    width: 300,
  },
  balance: {
    width: 200,
  },
});

export default App;

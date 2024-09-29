import { BrowserProvider } from "ethers";
import React, { useRef } from "react";
import "./App.css";
import WalletApp from "./Wallet";
import { AppContext } from "./context/AppContext";

const App = () => {
  const providerRef = useRef<BrowserProvider | null>(null);
  return (
    <React.Fragment>
      <AppContext.Provider value={{ providerRef }}>
        <WalletApp />
      </AppContext.Provider>
    </React.Fragment>
  );
};

export default App;

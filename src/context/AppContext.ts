import { BrowserProvider } from "ethers";
import { createContext, MutableRefObject, useContext } from "react";

interface AppContextInterface {
  providerRef: MutableRefObject<BrowserProvider | null> | null;
}

const defaultContext = {
  providerRef: null,
};

const AppContext = createContext<AppContextInterface>(defaultContext);

// Hook to use the context
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
};

export { AppContext, useAppContext };

import { useAppContext } from "@/context/AppContext";
import { BrowserProvider, Eip1193Provider, ethers } from "ethers";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: Eip1193Provider & BrowserProvider;
  }
}

interface WalletState {
  address: string | null;
  balance: string | null;
  error: string | null;
  chainId: string | null;
  chainName: string | null;
}

export const useWallet = () => {
  const { providerRef } = useAppContext();

  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: null,
    error: null,
    chainId: null,
    chainName: null,
  });

  useEffect(() => {
    let componentIsMounted = true;
    if (window.ethereum && providerRef) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      providerRef.current = provider;

      //Set provider chain name
      provider
        .getNetwork()
        .then((network) => {
          if (componentIsMounted) {
            setWallet((prev) => ({
              ...prev,
              chainId: network.chainId.toString(),
              chainName: network.name,
            }));
          }
        })
        .catch(handleError);

      window.ethereum.on("disconnect", (code, reason) => {
        console.log(
          `Ethereum Provider connection closed: ${reason}. Code: ${code}`
        );
      });

      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length) {
          handleAccountChanged(accounts[0]);
        }
      });

      // Handle chain changes and reconnect
      window.ethereum.on("chainChanged", (chainId: string) => {
        handleChainChanged(chainId);
      });
    }
    return () => {
      componentIsMounted = false;
      window.ethereum?.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectWallet = async () => {
    try {
      // if (wallet.provider) {
      if (providerRef?.current) {
        const accounts: string[] = await providerRef.current.send(
          "eth_requestAccounts",
          []
        );
        if (accounts.length) handleAccountChanged(accounts[0]);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (
          error.message.includes(
            "Request of type 'wallet_requestPermissions' already pending"
          )
        ) {
          alert("Please approve pending connection requests");
        }
      } else {
        console.error(error);
      }
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setWallet((prev) => ({
        ...prev,
        error: error.message || "Something went wrong. Please try again.",
      }));
    }
  };

  const handleAccountChanged = async (account: string) => {
    if (providerRef?.current) {
      try {
        const balance = await providerRef.current.getBalance(account);
        setWallet((prev) => ({
          ...prev,
          address: account,
          balance: ethers.formatEther(balance),
        }));
      } catch (error) {
        handleError(error);
      }
    }
  };

  const handleChainChanged = async (chainId: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum!);
    providerRef!.current = provider;

    const chainName = (await provider.getNetwork()).name;

    try {
      const accounts: string[] = await providerRef!.current.send(
        "eth_requestAccounts",
        []
      );
      if (accounts.length) {
        const balance = await providerRef!.current.getBalance(accounts[0]);
        setWallet({
          address: accounts[0],
          balance: ethers.formatEther(balance),
          error: null,
          chainId: chainId.toString(),
          chainName,
        });
      }
    } catch (error) {
      handleError(error);
    }
  };

  return { wallet, connectWallet };
};

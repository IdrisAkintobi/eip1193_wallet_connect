import { formatEther } from "ethers";
import { Send } from "lucide-react";
import { useState } from "react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "./components/ui/index.ts";
import { useAppContext } from "./context/AppContext.ts";
import { useWallet } from "./hooks/useWallet.ts";

const WalletApp = () => {
  const { wallet, connectWallet } = useWallet();
  const [addressInput, setAddressInput] = useState("");
  const { providerRef } = useAppContext();

  const handleAddressInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddressInput(event.target.value);
  };

  const getAccountBalance = async () => {
    try {
      if (providerRef?.current) {
        const balance = await providerRef.current.getBalance(addressInput);
        // We are assuming the chain our dapp support uses 18 decimal unit (ETH)
        alert(`Your balance is: ${formatEther(balance).substring(0, 6)} ETH`);
      }
    } catch (error) {
      console.log("Error getting address balance", error);
      alert("Something went wrong, please try again");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Wallet Connection</CardTitle>
            <CardDescription className="float-right font-bold text-lg">
              #{" "}
              {wallet.chainName === "unknown"
                ? wallet.chainId
                : wallet.chainName}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Button onClick={connectWallet} disabled={wallet.address !== null}>
            {wallet.address ? "Wallet Connected" : "Connect Wallet"}
          </Button>

          {wallet.error && <p className="text-red-500">{wallet.error}</p>}

          {wallet.address && (
            <>
              <div className="mt-5">
                <p>
                  <strong>Address:</strong> {wallet.address}
                </p>
                <p>
                  <strong>Balance:</strong> {wallet.balance?.substring(0, 6)}{" "}
                  ETH
                </p>
              </div>

              <p className="font-bold mt-6">Check address balance</p>
              <div className="flex items-center space-x-2 mt-2">
                <Input
                  type="text"
                  value={addressInput}
                  onChange={handleAddressInput}
                  onKeyDown={(e) => e.key === "Enter" && getAccountBalance()}
                  placeholder="Enter an address to check balance"
                />
                <button
                  onClick={getAccountBalance}
                  className="flex items-center justify-center p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletApp;

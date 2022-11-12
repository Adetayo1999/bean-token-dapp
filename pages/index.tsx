import { useRef, useEffect, useState, useCallback } from "react";
import Web3Modal from "web3modal";
import { providers, utils } from "ethers";
import { toast } from "react-toastify";
import { BuyBeanCoin } from "../components/buy-bean-coin";
import { Header } from "../components/header";

const ACCEPTED_CHAIN_IDS = [80001, 31337, 5];

export default function Home() {
  const [userAddress, setUserAddress] = useState("");
  const [userBalance, setUserBalance] = useState("");
  const [chainId, setChainId] = useState<null | number>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  let web3ModalRef = useRef<Web3Modal | null>(null);

  const getWalletProvider = async () => await web3ModalRef?.current?.connect();

  const getEthersWrappedProvider = async () => {
    try {
      const provider = await getWalletProvider();
      const Web3Provider = new providers.Web3Provider(provider);

      const { chainId } = await Web3Provider.getNetwork();

      if (!ACCEPTED_CHAIN_IDS.includes(chainId)) {
        throw new Error("Supported Networks Are Goerli And Polygon Mumbai");
      }
      return Web3Provider;
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message);
      }
      console.log(error);
    }
  };

  const connectWallet = useCallback(async () => {
    try {
      const provider = await getEthersWrappedProvider();
      const signer = provider!.getSigner();
      const address = await signer.getAddress();
      const balance = await signer.getBalance();
      const chainId = await signer.getChainId();
      setUserAddress(address);
      setUserBalance(Number(utils.formatEther(balance)).toString());
      setChainId(chainId);
      setIsWalletConnected(true);
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    web3ModalRef.current = new Web3Modal({
      providerOptions: {},
      disableInjectedProvider: false,
    });
  }, []);

  useEffect(() => {
    const web3ConnectCachedProvider =
      localStorage?.getItem("WEB3_CONNECT_CACHED_PROVIDER") || "";

    if (web3ConnectCachedProvider === "injected" && !isWalletConnected) {
      connectWallet();
    }
  }, [isWalletConnected, connectWallet]);

  useEffect(() => {
    const updateAccountInformation = (accounts: string[]) => {
      if (!(accounts.length === 0)) {
        connectWallet();
      } else {
        setIsWalletConnected(false);
      }
    };

    window.ethereum.on("accountsChanged", updateAccountInformation);
    window.ethereum.on("chainChanged", updateAccountInformation);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        updateAccountInformation
      );
      window.ethereum.removeListener("chainChanged", updateAccountInformation);
    };
  }, []);

  return (
    <div className="h-screen bg-slate-200 flex justify-center items-center">
      <Header
        connectWallet={connectWallet}
        userAddress={userAddress}
        userBalance={userBalance}
        isWalletConnected={isWalletConnected}
      />
      <BuyBeanCoin
        getWalletProvider={getEthersWrappedProvider}
        isWalletConnected={isWalletConnected}
        userBalance={userBalance}
        chainId={chainId}
        userAddress={userAddress}
      />
    </div>
  );
}

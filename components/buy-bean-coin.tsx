import { useState, useEffect, useCallback } from "react";
import { providers, Contract, utils, BigNumber } from "ethers";
import { toast } from "react-toastify";
import data from "../consts/data.json";

type BuyBeanCoinProps = {
  isWalletConnected: boolean;
  getWalletProvider: () => Promise<providers.Web3Provider | undefined>;
  userBalance: string;
  chainId: number | null;
  userAddress: string;
};

export const BuyBeanCoin = ({
  getWalletProvider,
  isWalletConnected,
  userBalance,
  userAddress,
  chainId,
}: BuyBeanCoinProps) => {
  const [loading, setLoading] = useState(false);
  const [userBNTBalance, setUserBNTBalance] = useState("");
  const [tokenValue, setTokenValue] = useState("");
  const [opTokenValue, setOpTokenValue] = useState(tokenValue);
  const [ethToPay, setEthToPay] = useState("");
  const contractDetails: {
    [key: string]: {
      address: string;
      abi: any[];
    };
  } = data;

  const handleBuyBeanCoin = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const signer = (await getWalletProvider())?.getSigner();
      const { abi, address } = contractDetails[chainId!.toString()];
      const beanContract = new Contract(address, abi, signer);
      const txResponse = await beanContract.buyBeanToken(opTokenValue, {
        value: utils.parseEther(ethToPay),
      });
      await txResponse.wait(1);
      toast(`${opTokenValue}BNT Bought Successfully 🚀 `);
      setTokenValue("");
      setLoading(false);
      getUserBalance();
    } catch (error) {
      setLoading(false);

      if (error instanceof Error) {
        if (error.message.includes("user rejected transaction"))
          toast("Transaction Cancelled");
        else toast(error.message);
      } else toast(`Something went wrong: ${error}`);
    }
  };

  const getUserBalance = useCallback(async () => {
    try {
      setLoading(true);
      const provider = await getWalletProvider();
      const { abi, address } = contractDetails[chainId!.toString()];
      const beanContract = new Contract(address, abi, provider);
      const balance: BigNumber = await beanContract.balanceOf(userAddress);
      setUserBNTBalance(utils.formatEther(balance));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [chainId]);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setOpTokenValue(tokenValue);
    }, 1000);

    return () => {
      clearTimeout(timeOut);
    };
  }, [tokenValue]);

  useEffect(() => {
    if (tokenValue && chainId && isWalletConnected) {
      (async () => {
        try {
          setLoading(true);
          const provider = await getWalletProvider();
          const { abi, address } = contractDetails[chainId.toString()];
          const beanContract = new Contract(address, abi, provider);
          const beanTokenEquivalentToEth: number =
            Number((await beanContract.getBeanTokenPriceInEth()).toString()) /
            1e18;
          const ethToPay = Number(opTokenValue) * beanTokenEquivalentToEth;
          setEthToPay(ethToPay.toString());
          setLoading(false);
        } catch (error) {
          console.error(error);
          setLoading(true);
        }
      })();
    }
  }, [opTokenValue, chainId, isWalletConnected, tokenValue]);

  useEffect(() => {
    if (isWalletConnected) {
      getUserBalance();
    }
  }, [isWalletConnected, getUserBalance]);

  return (
    <div className=" w-[70%] md:w-[40%] h-[50%] bg-white rounded-lg shadow-md p-6 flex flex-col justify-center items-center">
      <div className="text-center mb-5">
        <h2 className="text-gray-800 text-lg font-semibold">
          Bean Token Minting 🚀
        </h2>
      </div>

      <form className="w-[80%] mx-auto flex flex-col gap-y-5">
        <div className="">
          <input
            type="text"
            name="bean-coin"
            className="h-10 border border-gray-300 border-opacity-50  outline-none text-sm rounded w-full px-3 py-1 transition duration-200 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-30"
            placeholder="Enter Amount To Buy"
            value={tokenValue}
            onChange={(e) => setTokenValue(e.target.value)}
          />
          {isWalletConnected && (
            <div className="text-xs text-gray-800 mt-1 flex gap-x-5">
              <span>ETH: {userBalance}ETH</span>
              {userBNTBalance && <span>BNT: {userBNTBalance}BNT</span>}
            </div>
          )}
        </div>

        <div
          className={`h-10 cursor-not-allowed px-3 py-1 text-sm bg-slate-100 border rounded border-gray-500 border-opacity-10 flex justify-center items-center text-gray-800 ${
            loading && "animate-pulse"
          } `}
        >
          {!opTokenValue || !ethToPay ? (
            <span>Enter An Amount To See ETH Equivalent</span>
          ) : (
            <span>
              You Pay <b>{ethToPay}ETH</b>
            </span>
          )}
        </div>

        <button
          className="w-full h-10 py-1 px-3 bg-blue-600 rounded text-gray-50 text-sm font-semibold hover:bg-blue-500 transition"
          onClick={handleBuyBeanCoin}
          disabled={
            !isWalletConnected ||
            loading ||
            !tokenValue ||
            Number(ethToPay) > Number(userBalance)
          }
        >
          BUY NOW 😊
        </button>
      </form>
    </div>
  );
};

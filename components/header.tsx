type HeaderProps = {
  connectWallet: () => void;
  userAddress: string;
  userBalance: string;
  isWalletConnected: boolean;
};

export const Header = ({
  connectWallet,
  userAddress,
  userBalance,
  isWalletConnected,
}: HeaderProps) => {
  return (
    <div className="h-20 bg-white shadow-md fixed w-full top-0 ">
      <div className="w-[70%] flex justify-between items-center h-full mx-auto">
        <h3 className="text-xl font-bold">Bean Token</h3>
        <div className="">
          {!isWalletConnected ? (
            <button
              className="px-6 py-3 font-semibold hover:bg-blue-500 transition duration-150 text-gray-100 bg-blue-600 rounded-full text-sm"
              onClick={connectWallet}
            >
              Connect Wallet 📢
            </button>
          ) : (
            <div className="bg-gray-100 px-8 py-3 rounded-full  font-medium text-sm text-gray-700 border-2 border-blue-500 cursor-pointer">
              {userAddress.slice(0, 6) +
                "..." +
                userAddress.slice(userAddress.length - 6)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

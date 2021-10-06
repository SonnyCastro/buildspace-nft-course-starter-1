import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import opensea from "./assets/open-sea.svg";

import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
// import myEpicNft from "./utils/MyEpicNFT.json";
import ArbiMonkes from "./utils/ArbiMonkes.json";
import gif from "../src/assets/arbimonkes.gif";
// Constants
const TWITTER_HANDLE = "sonny_castroo";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const TOTAL_MINT_COUNT = 1000;
const OPENSEA_LINK =
  "https://testnets.opensea.io/collection/squarenft-5qpeodbeai";
// const CONTRACT_ADDRESS = "0xE0448878de2F33108B6A6eC2e7838CF90200e1E4";
const CONTRACT_ADDRESS = "0x7CE6e07107E5B972a2CcaC6598FF8b06044Ec6A3";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [minted, setMinted] = useState(0);
  const [supply, setSupply] = useState(0);
  const [minting, setMinting] = useState(false);
  const [mintingComplete, setMintingComplete] = useState(false);
  const [link, setLink] = useState("");

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          // myEpicNft.abi,
          ArbiMonkes,
          signer
        );

        const totalSupply = await connectedContract.totalSupply();
        setSupply(totalSupply.toNumber());
        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        // connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
        //   console.log(from, tokenId.toNumber());
        //   alert(
        //     `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
        //   );
        //   setLink(
        //     `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
        //   );
        // });

        // console.log("Setup event listener!");
        // const mintedSoFar = await connectedContract.mintedSoFar();
        // setMinted(mintedSoFar.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          // myEpicNft.abi,
          ArbiMonkes,
          signer
        );

        // let nftTxn = await connectedContract.makeAnEpicNFT();
        let wei = ethers.utils.parseEther(".05");
        let nftTxn = await connectedContract.mint({
          from: currentAccount,
          value: wei,
        });
        // if you want to add price to nft
        console.log("Going to pop wallet now to pay gas...");

        console.log("Mining...please wait.");
        setMinting(true);
        await nftTxn.wait();
        console.log(nftTxn);
        setMintingComplete(true);
        console.log(
          `Mined, see transaction: https://arbiscan.io/tx/${nftTxn.hash}`
        );
        setLink(`https://arbiscan.io/tx/${nftTxn.hash}`);
        setMinting(false);
        // const mintedSoFar = await connectedContract.mintedSoFar();
        // setMinted(mintedSoFar.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [supply]);

  /*
   * We added a simple onClick event here.
   */
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  /*
   * We want the "Connect to Wallet" button to dissapear if they've already connected their wallet!
   */
  const renderMintUI = () => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <button
        onClick={askContractToMintNft}
        className="cta-button connect-wallet-button"
      >
        {minting ? "Minting please wait..." : "Mint NFT"}
      </button>
      <a
        rel="noreferrer"
        target="_blank"
        className={mintingComplete ? "show" : "hide"}
        href={link}
      >
        {mintingComplete ? "Minting Complete View TX" : ""}
      </a>
    </div>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Arbi Monkes</p>
          <img
            src={gif}
            alt="gif"
            style={{
              width: "300px",
              height: "300px",
              margin: "2rem 0",
              borderRadius: "15%",
            }}
          />
          <p className="sub-text">
            <a
              rel="noreferrer"
              target="_blank"
              href="https://twitter.com/defgmi"
            >
              Arbi Monkes
            </a>{" "}
            are a generative art project available for minting on Arbitrum
            They're inspired by Etherean culture, Arbys, BAPE, and DBZ.
          </p>
          <span className="sub-text">Total Supply: 1000</span>
          <span className="sub-text">Price: .05 ETH</span>
          <span className="sub-text">Royalty: None</span>
          <span className="sub-text">
            {currentAccount == ""
              ? ``
              : `${supply - 1} / ${TOTAL_MINT_COUNT} minted`}
          </span>
          {currentAccount === ""
            ? renderNotConnectedContainer()
            : renderMintUI()}
          {/* <p>
            {minted} / {TOTAL_MINT_COUNT} Amount minted
          </p> */}
          {/* <a
            target="_blank"
            className="visit-nft-btn"
            rel="noreferrer"
            href={link}
          >
            Visit NFT
          </a> */}
        </div>
        <div className="footer-container">
          {/* <a
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
            className="footer-btn"
          >
            <img alt="Opensea" className="opensea-logo" src={opensea} />
          </a> */}
          <p>
            built by{" "}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://twitter.com/defgmi"
            >
              @defgmi
            </a>
            <a
              className="view-collection-btn"
              target="_blank"
              rel="noreferrer"
              href="https://twitter.com/corleone_gmi"
            >
              @corleone_gmi
            </a>
          </p>
          <p>
            <a target="_blank" rel="noreferrer" href="https://t.me/arbiemonkes">
              Join Monkeverse
            </a>
          </p>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://smolpuddle.io/#/0x7ce6e07107e5b972a2ccac6598ff8b06044ec6a3"
          >
            View on smolpuddle
          </a>
        </div>
      </div>
    </div>
  );
};

export default App;

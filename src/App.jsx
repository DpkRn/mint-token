// src/App.jsx
import { useEffect, useState } from "react";
import "./App.css";
import MatrixBackground from "./MatrixBackground";
import Header from "./components/Header";
import FeatureGrid from "./components/FeatureGrid";
import Navbar from "./components/Navbar";

function App() {
  const [network, setNetwork] = useState("devnet");
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });

  // Token form state
  const [tokenData, setTokenData] = useState({
    name: "",
    symbol: "",
    decimals: 9,
    initialSupply: "",
    description: "",
    image: "",
    freezeAuthority: true,
    mintAuthority: true,
  });

  // Initialize Solana connection
  useEffect(() => {
    const endpoint =
      network === "devnet"
        ? "https://api.devnet.solana.com"
        : "https://api.mainnet-beta.solana.com";

    console.log(`Initialized Solana connection to ${endpoint}`);
  }, [network]);

  // Auto-update balance every 30 sec
  useEffect(() => {
    const interval = setInterval(() => {
      if (wallet) updateWalletBalance();
    }, 30000);
    return () => clearInterval(interval);
  }, [wallet]);

  // Phantom disconnect listener
  useEffect(() => {
    if (window.solana) {
      window.solana.on("disconnect", () => {
        setWallet(null);
        setBalance(null);
        setTokens([]);
        setStatus({ type: "error", message: "Wallet disconnected" });
      });
    }
  }, []);

  async function connectWallet() {
    if (!window.solana || !window.solana.isPhantom) {
      setStatus({
        type: "error",
        message: "Phantom wallet not found! Please install Phantom wallet.",
      });
      return;
    }

    try {
      setStatus({
        type: "loading",
        message: "Connecting to Phantom wallet...",
      });
      const response = await window.solana.connect();
      setWallet(response.publicKey.toString());
      setStatus({ type: "success", message: "Wallet connected successfully!" });
      await updateWalletBalance();
      await loadUserTokens();
    } catch (error) {
      setStatus({
        type: "error",
        message: `Connection failed: ${error.message}`,
      });
    }
  }

  async function updateWalletBalance() {
    if (!wallet) return;
    try {
      const mockBalance = (Math.random() * 10).toFixed(4);
      setBalance(mockBalance);
    } catch {
      setBalance("Error");
    }
  }

  async function loadUserTokens() {
    if (!wallet) return;
    setStatus({ type: "loading", message: "Loading tokens..." });

    try {
      await delay(1000);
      const allTokens = JSON.parse(localStorage.getItem("userTokens") || "[]");
      const userTokens = allTokens.filter((t) => t.owner === wallet);
      setTokens(userTokens);
      setStatus({ type: "success", message: "Tokens loaded!" });
    } catch (error) {
      setStatus({ type: "error", message: "Error loading tokens" });
    }
  }

  async function createToken(e) {
    e.preventDefault();
    if (!wallet) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      setStatus({ type: "loading", message: "Creating your SPL token..." });
      await simulateTokenCreation(tokenData);

      setStatus({
        type: "success",
        message: `Token "${tokenData.name}" created successfully!`,
      });

      setTokenData({
        name: "",
        symbol: "",
        decimals: 9,
        initialSupply: "",
        description: "",
        image: "",
        freezeAuthority: true,
        mintAuthority: true,
      });

      await loadUserTokens();
    } catch (error) {
      setStatus({
        type: "error",
        message: `Token creation failed: ${error.message}`,
      });
    }
  }

  async function simulateTokenCreation(data) {
    await delay(1500);

    if (!data.name || !data.symbol) {
      throw new Error("Name and symbol are required");
    }
    if (data.symbol.length > 10) {
      throw new Error("Symbol must be 10 characters or less");
    }

    const tokens = JSON.parse(localStorage.getItem("userTokens") || "[]");
    tokens.push({
      ...data,
      mintAddress: generateMockAddress(),
      createdAt: new Date().toISOString(),
      owner: wallet,
      network,
    });
    localStorage.setItem("userTokens", JSON.stringify(tokens));
  }

  function generateMockAddress() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
    return Array.from(
      { length: 44 },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }

  function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
  }

  return (
    <div className="App">
      <MatrixBackground />
        <Navbar/>
        <div className="container">
        <Header/>
         <FeatureGrid/>
          <div className="main-content">
            <div className="card">
              <h2>🔗 Wallet Connection</h2>

              <div className="network-selector">
                <button
                  className={`network-btn ${
                    network === "devnet" ? "active" : ""
                  }`}
                  onClick={() => setNetwork("devnet")}
                >
                  Devnet
                </button>
                <button
                  className={`network-btn ${
                    network === "mainnet-beta" ? "active" : ""
                  }`}
                  onClick={() => setNetwork("mainnet-beta")}
                >
                  Mainnet
                </button>
              </div>

              <button className="btn" onClick={connectWallet}>
                {wallet ? "✓ Wallet Connected" : "Connect Phantom Wallet"}
              </button>

              {wallet && (
                <div className="wallet-info">
                  <p>
                    <strong>Connected:</strong> {wallet.slice(0, 4)}...
                    {wallet.slice(-4)}
                  </p>
                  <p>
                    <strong>Network:</strong> {network}
                  </p>
                  <p>
                    <strong>Balance:</strong> {balance ?? "Loading..."} SOL
                  </p>
                </div>
              )}

              {status.message && (
                <div className={`status ${status.type}`}>{status.message}</div>
              )}
            </div>
            <div className="card">
              <h2>🪙 Create SPL Token</h2>
              <form onSubmit={createToken} id="tokenForm">
                <div className="form-group">
                  <label htmlFor="tokenName">Token Name *</label>
                  <input
                    type="text"
                    id="tokenName"
                    placeholder="e.g., My Awesome Token"
                    value={tokenData.name}
                    onChange={(e) =>
                      setTokenData({ ...tokenData, name: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tokenSymbol">Symbol *</label>
                  <input
                    type="text"
                    id="tokenSymbol"
                    placeholder="e.g., MAT"
                    maxLength="10"
                    value={tokenData.symbol}
                    onChange={(e) =>
                      setTokenData({ ...tokenData, symbol: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tokenDecimals">Decimals</label>
                  <input
                    type="number"
                    id="tokenDecimals"
                    min="0"
                    max="9"
                    value={tokenData.decimals}
                    onChange={(e) =>
                      setTokenData({
                        ...tokenData,
                        decimals: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="initialSupply">Initial Supply</label>
                  <input
                    type="number"
                    id="initialSupply"
                    placeholder="1000000"
                    min="0"
                    value={tokenData.initialSupply}
                    onChange={(e) =>
                      setTokenData({
                        ...tokenData,
                        initialSupply: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tokenDescription">Description</label>
                  <textarea
                    id="tokenDescription"
                    placeholder="Describe your token..."
                    value={tokenData.description}
                    onChange={(e) =>
                      setTokenData({
                        ...tokenData,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="tokenImage">Image URL</label>
                  <input
                    type="url"
                    id="tokenImage"
                    placeholder="https://example.com/image.png"
                    value={tokenData.image}
                    onChange={(e) =>
                      setTokenData({ ...tokenData, image: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="twitter-url">Twitter URL</label>
                  <input
                    type="url"
                    id="tokenImage"
                    placeholder="https://example.com/image.png"
                    value={tokenData.image}
                    onChange={(e) =>
                      setTokenData({ ...tokenData, image: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="website-url">Website URL</label>
                  <input
                    type="url"
                    id="tokenImage"
                    placeholder="https://example.com/image.png"
                    value={tokenData.image}
                    onChange={(e) =>
                      setTokenData({ ...tokenData, image: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      id="freezeAuthority"
                      checked={tokenData.freezeAuthority}
                      onChange={(e) =>
                        setTokenData({
                          ...tokenData,
                          freezeAuthority: e.target.checked,
                        })
                      }
                    />
                    Enable Freeze Authority
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      id="mintAuthority"
                      checked={tokenData.mintAuthority}
                      onChange={(e) =>
                        setTokenData({
                          ...tokenData,
                          mintAuthority: e.target.checked,
                        })
                      }
                    />
                    Retain Mint Authority
                  </label>
                </div>

                <button type="submit" className="btn" id="createTokenBtn">
                  Create Token
                </button>
              </form>

              {status.type && (
                <div className={`status ${status.type}`} id="tokenStatus">
                  {status.message}
                </div>
              )}
            </div>
          </div>
        </div>

    </div>
  );
}

export default App;

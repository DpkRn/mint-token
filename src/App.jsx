import { useState } from "react";
import "./App.css";

function App() {

  const [network,setNetwork]=useState('devnet')
  let wallet = null;
  let connection = null;
 

  const initializeSolana=()=> {
    const endpoint =
      network === "devnet"
        ? "https://api.devnet.solana.com"
        : "https://api.mainnet-beta.solana.com";

    
    console.log(`Initialized Solana connection to ${endpoint}`);
  }



  async function checkWalletConnection() {
    if (window.solana && window.solana.isPhantom) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        wallet = response.publicKey.toString();
        updateWalletUI();
      } catch (error) {
        console.log("Wallet not auto-connected");
      }
    }
  }

  async function connectWallet() {
    const connectBtn = document.getElementById("connectBtn");
    const statusDiv = document.getElementById("connectionStatus");

    if (!window.solana || !window.solana.isPhantom) {
      showStatus(
        statusDiv,
        "error",
        "Phantom wallet not found! Please install Phantom wallet extension."
      );
      return;
    }

    try {
      connectBtn.disabled = true;
      connectBtn.innerHTML =
        '<span class="loading-spinner"></span> Connecting...';
      showStatus(statusDiv, "loading", "Connecting to Phantom wallet...");

      const response = await window.solana.connect();
      keypair=response.keypair
      // console.log(keypair)
      wallet = response.publicKey.toString();

      updateWalletUI();
      showStatus(statusDiv, "success", "Wallet connected successfully!");

      // Load user's existing tokens
      await loadUserTokens();
    } catch (error) {
      showStatus(statusDiv, "error", `Connection failed: ${error.message}`);
    } finally {
      connectBtn.disabled = false;
      connectBtn.innerHTML = wallet
        ? "Wallet Connected"
        : "Connect Phantom Wallet";
    }
  }

  function updateWalletUI() {
    if (wallet) {
      document.getElementById("walletAddress").textContent =
        wallet.slice(0, 4) + "..." + wallet.slice(-4);
      document.getElementById("walletInfo").style.display = "block";
      document.getElementById("connectBtn").innerHTML = "✓ Wallet Connected";
      document.getElementById("refreshTokensBtn").disabled = false;

      updateWalletBalance();
    }
  }

  async function updateWalletBalance() {
    if (!wallet) return;

    try {
      // Simulate balance fetching
      const balance = (Math.random() * 10).toFixed(4);
      document.getElementById("walletBalance").textContent = balance;
    } catch (error) {
      document.getElementById("walletBalance").textContent = "Error loading";
    }
  }

  async function createToken(event) {
    event.preventDefault();

    if (!wallet) {
      alert("Please connect your wallet first");
      return;
    }

    const form = document.getElementById("tokenForm");
    const statusDiv = document.getElementById("tokenStatus");
    const submitBtn = document.getElementById("createTokenBtn");

    // Get form data
    const tokenData = {
      name: document.getElementById("tokenName").value,
      symbol: document.getElementById("tokenSymbol").value,
      decimals: parseInt(document.getElementById("tokenDecimals").value),
      initialSupply:
        parseFloat(document.getElementById("initialSupply").value) || 0,
      description: document.getElementById("tokenDescription").value,
      image: document.getElementById("tokenImage").value,
      freezeAuthority: document.getElementById("freezeAuthority").checked,
      mintAuthority: document.getElementById("mintAuthority").checked,
      network: currentNetwork,
    };

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<span class="loading-spinner"></span> Creating Token...';
      showStatus(statusDiv, "loading", "Creating your SPL token on Solana...");

      // Simulate token creation process
      await simulateTokenCreation(tokenData);

      showStatus(
        statusDiv,
        "success",
        `Token "${tokenData.name}" created successfully! ` +
          `Mint Address: ${generateMockAddress()}`
      );

      // Reset form
      form.reset();
      document.getElementById("tokenDecimals").value = "9";
      document.getElementById("freezeAuthority").checked = true;
      document.getElementById("mintAuthority").checked = true;

      // Refresh token list
      await loadUserTokens();
    } catch (error) {
      showStatus(statusDiv, "error", `Token creation failed: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = "Create Token";
    }
  }

  async function simulateTokenCreation(tokenData) {
    // Simulate the token creation process
    await delay(2000);

    // Validate required fields
    if (!tokenData.name || !tokenData.symbol) {
      throw new Error("Name and symbol are required");
    }

    if (tokenData.symbol.length > 10) {
      throw new Error("Symbol must be 10 characters or less");
    }

    // Simulate network costs
    if (currentNetwork === "mainnet-beta" && Math.random() > 0.9) {
      throw new Error("Insufficient SOL for transaction fees");
    }

    // Store token data locally for demo
    const tokens = JSON.parse(localStorage.getItem("userTokens") || "[]");
    tokens.push({
      ...tokenData,
      mintAddress: generateMockAddress(),
      createdAt: new Date().toISOString(),
      owner: wallet,
    });
    localStorage.setItem("userTokens", JSON.stringify(tokens));

    return true;
  }

  async function loadUserTokens() {
    if (!wallet) return;

    const tokenList = document.getElementById("tokenList");
    tokenList.innerHTML = "<p>Loading tokens...</p>";

    try {
      // Simulate loading delay
      await delay(1000);

      // Get tokens from localStorage (simulated)
      const tokens = JSON.parse(localStorage.getItem("userTokens") || "[]");
      const userTokens = tokens.filter((token) => token.owner === wallet);

      if (userTokens.length === 0) {
        tokenList.innerHTML =
          "<p>No tokens found. Create your first token!</p>";
        return;
      }

      tokenList.innerHTML = userTokens
        .map(
          (token) => `
                    <div class="token-item">
                        <h3>${token.name} (${token.symbol})</h3>
                        <p><strong>Mint Address:</strong> ${
                          token.mintAddress
                        }</p>
                        <p><strong>Decimals:</strong> ${token.decimals}</p>
                        <p><strong>Initial Supply:</strong> ${token.initialSupply.toLocaleString()}</p>
                        <p><strong>Network:</strong> ${token.network}</p>
                        <p><strong>Created:</strong> ${new Date(
                          token.createdAt
                        ).toLocaleDateString()}</p>
                        ${
                          token.description
                            ? `<p><strong>Description:</strong> ${token.description}</p>`
                            : ""
                        }
                    </div>
                `
        )
        .join("");
    } catch (error) {
      tokenList.innerHTML = "<p>Error loading tokens</p>";
      console.error("Error loading tokens:", error);
    }
  }

  function showStatus(element, type, message) {
    element.className = `status ${type}`;
    element.textContent = message;
    element.style.display = "block";

    if (type === "success") {
      setTimeout(() => {
        element.style.display = "none";
      }, 5000);
    }
  }

  function generateMockAddress() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789";
    let result = "";
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // document.getElementById("tokenForm").addEventListener("submit", createToken);

  if (window.solana) {
    window.solana.on("disconnect", () => {
      wallet = null;
      document.getElementById("walletInfo").style.display = "none";
      document.getElementById("connectBtn").innerHTML =
        "Connect Phantom Wallet";
      document.getElementById("refreshTokensBtn").disabled = true;
      document.getElementById("tokenList").innerHTML =
        "<p>Connect your wallet to view your tokens</p>";
    });
  }

  // Auto-update balance every 30 seconds
  setInterval(() => {
    if (wallet) {
      updateWalletBalance();
    }
  }, 30000);

  return (
    <>
      <div className="container">
        <div className="header">
          <h1>🚀 Solana SPL Token Creator</h1>
          <p>Create and manage your SPL tokens on Solana blockchain</p>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🔐</div>
            <h3>Phantom Integration</h3>
            <p>Seamless wallet connection</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast Creation</h3>
            <p>Deploy tokens in seconds</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Full Control</h3>
            <p>Manage mint authority</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Mainnet Ready</h3>
            <p>Production-grade deployment</p>
          </div>
        </div>

        <div className="main-content">
          <div className="card">
            <h2>🔗 Wallet Connection</h2>

            <div className="network-selector">
              <button
                className="network-btn"
                id="devnetBtn"
                onClick={()=>setNetwork('https://api.devnet.solana.com')}
              >
                Devnet
              </button>
              <button
                className="network-btn active"
                id="mainnetBtn"
                onClick={()=>setNetwork('https://api.mainnet-beta.solana.com')}
              >
                Mainnet
              </button>
            </div>

            <button
              className="btn"
              id="connectBtn"
              onClick={()=>connectWallet()}
            >
              Connect Phantom Wallet
            </button>

            <div
              className="wallet-info"
              id="walletInfo"
              style={{ display: "none" }}
            >
              <p>
                <strong>Connected:</strong> <span id="walletAddress"></span>
              </p>
              <p>
                <strong>Network:</strong>{" "}
                <span id="currentNetwork">mainnet-beta</span>
              </p>
              <p>
                <strong>Balance:</strong>{" "}
                <span id="walletBalance">Loading...</span> SOL
              </p>
            </div>

            <div
              className="status"
              id="connectionStatus"
              style={{ display: "none" }}
            ></div>
          </div>

          <div className="card">
            <h2>🪙 Create SPL Token</h2>

            <form id="tokenForm">
              <div className="form-group">
                <label for="tokenName">Token Name *</label>
                <input
                  type="text"
                  id="tokenName"
                  placeholder="e.g., My Awesome Token"
                  required
                />
              </div>

              <div className="form-group">
                <label for="tokenSymbol">Symbol *</label>
                <input
                  type="text"
                  id="tokenSymbol"
                  placeholder="e.g., MAT"
                  maxlength="10"
                  required
                />
              </div>

              <div className="form-group">
                <label for="tokenDecimals">Decimals</label>
                <input
                  type="number"
                  id="tokenDecimals"
                  value="9"
                  min="0"
                  max="9"
                />
              </div>

              <div className="form-group">
                <label for="initialSupply">Initial Supply</label>
                <input
                  type="number"
                  id="initialSupply"
                  placeholder="1000000"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label for="tokenDescription">Description</label>
                <textarea
                  id="tokenDescription"
                  placeholder="Describe your token..."
                ></textarea>
              </div>

              <div className="form-group">
                <label for="tokenImage">Image URL</label>
                <input
                  type="url"
                  id="tokenImage"
                  placeholder="https://example.com/image.png"
                />
              </div>

              <div className="form-group">
                <label>
                  <input type="checkbox" id="freezeAuthority" checked />
                  Enable Freeze Authority
                </label>
              </div>

              <div className="form-group">
                <label>
                  <input type="checkbox" id="mintAuthority" checked />
                  Retain Mint Authority
                </label>
              </div>

              <button type="submit" className="btn" id="createTokenBtn">
                Create Token
              </button>
            </form>

            <div
              className="status"
              id="tokenStatus"
              style={{ display: "none" }}
            ></div>
          </div>
        </div>

        <div className="card">
          <h2>📋 Your Tokens</h2>
          <div className="token-list" id="tokenList">
            <p>Connect your wallet to view your tokens</p>
          </div>
          <button
            className="btn btn-secondary"
            id="refreshTokensBtn"
            onClick={()=>loadUserTokens()}
            disabled
          >
            Refresh Tokens
          </button>
        </div>
      </div>
    </>
  );
}

export default App;

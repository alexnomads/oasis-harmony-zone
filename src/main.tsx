import React from 'react';
import ReactDOM from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { ethers } from 'ethers';

// Initialize Supabase client with your credentials
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [userStatus, setUserStatus] = React.useState('Not signed in');

  // Check user on mount
  React.useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserStatus(`Signed in as: ${user.email}`);
      // Store user in backend
      await fetch("http://localhost:3000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
    } else if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        setUserStatus(`Connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        // Store wallet in backend
        await fetch("http://localhost:3000/api/connect-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: accounts[0] })
        });
      }
    }
  }

  async function signInWithGmail() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) console.error("Error signing in:", error);
  }

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const walletAddress = await signer.getAddress();
        setUserStatus(`Connected: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);

        // Send to backend
        const response = await fetch("http://localhost:3000/api/connect-wallet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ wallet: walletAddress })
        });
        const data = await response.json();
        console.log("Points:", data.points);
      } catch (error) {
        console.error("Connection error:", error);
        alert("Failed to connect. Check MetaMask!");
      }
    } else {
      alert("Please install MetaMask!");
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error);
    setUserStatus("Not signed in");
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []); // Disconnect
    }
  }

  return (
    <div>
      <h1>Rose of Jericho</h1>
      <p>{userStatus}</p>
      <button onClick={signInWithGmail}>Sign in with Gmail</button>
      <button onClick={connectWallet}>Connect Wallet</button>
      <button onClick={signOut} style={{ display: userStatus.includes("Signed in") || userStatus.includes("Connected") ? "block" : "none" }}>Sign out</button>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
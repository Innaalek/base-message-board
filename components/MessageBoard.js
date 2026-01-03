import { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = "0x2E1476Ba7D284e931389710904569FFdd1eC10F1";
const abi = [
  "function postMessage(string _text) external",
  "function getMessagesCount() view returns (uint256)",
  "function getLatestMessage() view returns (tuple(address user, string text, uint256 timestamp))"
];

export default function MessageBoardApp() {
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);
  const [latest, setLatest] = useState(null);

  const fetchData = async () => {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const c = await contract.getMessagesCount();
    setCount(Number(c));
    try {
      const l = await contract.getLatestMessage();
      setLatest(l);
    } catch {}
  };

  const sendMessage = async () => {
    if (!window.ethereum || !message.trim()) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.postMessage(message);
    await tx.wait();
    setMessage("");
    fetchData();
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div style={{background:"#0a0a0f",minHeight:"100vh",color:"white",padding:"20px",fontFamily:"Arial"}}>
      <h2>Base Message Board</h2>
      <textarea
        style={{width:"100%",padding:"10px",background:"#1a1a25",border:"1px solid #333",borderRadius:"8px",color:"white"}}
        rows={3}
        placeholder="Напиши сообщение..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <button
        onClick={sendMessage}
        style={{width:"100%",marginTop:"10px",padding:"12px",background:"#2563eb",border:"none",borderRadius:"8px",color:"white",fontSize:"18px",cursor:"pointer"}}
      >
        Опубликовать
      </button>
      <p>Всего сообщений (on-chain): {count}</p>
      {latest && (
        <div style={{marginTop:"20px",padding:"10px",background:"#1a1a25",borderRadius:"8px"}}>
          <p>"{latest.text}"</p>
          <small>от {latest.user.slice(0,6)}... | {new Date(Number(latest.timestamp)*1000).toLocaleString()}</small>
        </div>
      )}
    </div>
  );
}

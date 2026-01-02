import { useState, useEffect } from "react";
import { ethers } from "ethers";

const contractAddress = "0x2E1476Ba7D284e931389710904569FFdd1eC10F1";
const abi = [
  "function postMessage(string _text) external",
  "function getMessagesCount() external view returns (uint256)",
  "function getLatestMessage() external view returns (tuple(address user, string text, uint256 timestamp))"
];

export default function MessageBoardApp() {
  const [message, setMessage] = useState("");
  const [count, setCount] = useState(0);
  const [latest, setLatest] = useState<any>(null);

  async function fetchData() {
    if (!window.ethereum) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(contractAddress, abi, provider);
    const c = await contract.getMessagesCount();
    setCount(Number(c));
    try {
      const l = await contract.getLatestMessage();
      setLatest(l);
    } catch {}
  }

  async function sendMessage() {
    if (!window.ethereum || !message.trim()) return;
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const tx = await contract.postMessage(message);
    await tx.wait();
    setMessage("");
    fetchData();
  }

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white p-6">
      <h1 className="text-4xl font-bold mb-6">Base Message Board</h1>

      <div className="bg-gray-900 p-6 rounded-2xl shadow-lg w-full max-w-lg">
        <textarea
          className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-lg outline-none"
          rows={3}
          placeholder="Оставь сообщение в блокчейне Base..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button
          onClick={sendMessage}
          className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-xl font-semibold py-3 rounded-xl transition"
        >
          Опубликовать 🚀
        </button>

        <p className="text-center mt-4 text-gray-400">Всего сообщений: {count}</p>

        {latest && (
          <div className="mt-6 bg-gray-800 p-4 rounded-xl">
            <p className="text-gray-300">Последнее сообщение:</p>
            <p className="text-2xl font-medium mt-2">"{latest.text}"</p>
            <p className="text-sm text-gray-500 mt-2">
              от {latest.user.slice(0,6)}... • {new Date(Number(latest.timestamp) * 1000).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { sendMessage } from "../services/api";

function ChatBox() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = { sender: "user", text: message };
    setChat([...chat, userMessage]);
    setMessage("");
    setLoading(true);

    try {
      const res = await sendMessage({ message });
      const botReply = {
        sender: "ai",
        text: res.data.reply
      };
      setChat(prev => [...prev, botReply]);
    } catch (error) {
      const errorMessage = {
        sender: "ai",
        text: "Sorry, I couldn't process your request. Please try again."
      };
      setChat(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Chat Header */}
      <div className="bg-white border-b px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-800">Chat with InboxAI</h2>
        <p className="text-sm text-gray-500">Ask anything about your emails and documents</p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {chat.length === 0 ? (
          <div className="text-center text-gray-400 mt-20">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg">Start a conversation with InboxAI</p>
            <p className="text-sm mt-2">Ask questions about your emails, documents, or data</p>
          </div>
        ) : (
          chat.map((c, i) => (
            <div
              key={i}
              className={`flex ${c.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xl px-4 py-3 rounded-lg ${
                  c.sender === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <div className="flex items-start space-x-2">
                  <span className="text-lg">
                    {c.sender === "user" ? "👤" : "🤖"}
                  </span>
                  <div>
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {c.sender === "user" ? "You" : "InboxAI"}
                    </p>
                    <p className="whitespace-pre-wrap">{c.text}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🤖</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t px-6 py-4">
        <div className="flex space-x-2">
          <input
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !message.trim()}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              loading || !message.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            }`}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatBox;
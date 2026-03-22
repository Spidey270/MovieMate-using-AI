import { useState, useEffect, useRef } from 'react';
import { useAuth, api } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Send } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function GlobalChat() {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/chat/global');
                setMessages(res.data);
            } catch (error) {
                console.error("Failed to fetch global chat history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    useEffect(() => {
        if (!user) return;

        // Connect to WebSocket
        const socket = new WebSocket(`ws://localhost:8000/chat/ws/${user.id}`);
        ws.current = socket;

        socket.onopen = () => setIsConnected(true);
        socket.onclose = () => setIsConnected(false);

        socket.onmessage = (event) => {
            const newMsg = JSON.parse(event.data);
            // Only add global messages
            if (newMsg.receiver_id === 'global') {
                setMessages((prev) => [...prev, newMsg]);
            }
        };

        return () => {
            socket.close();
        };
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && ws.current && isConnected) {
            const messagePayload = {
                to: 'global',
                content: input
            };
            ws.current.send(JSON.stringify(messagePayload));
            setInput('');
        }
    };

    if (loading) return <LoadingSpinner />;

    if (!user) {
        return (
            <div className="min-h-screen bg-secondary text-white pb-20">
                <Navbar />
                <div className="pt-32 text-center text-gray-400">
                    Please login to join the Global Chat.
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-secondary pb-20 flex flex-col">
            <Navbar />

            <div className="pt-24 flex-grow flex flex-col max-w-4xl mx-auto w-full px-4 h-[calc(100vh-20px)]">
                <div className="mb-6 border-b border-gray-800 pb-4">
                    <h1 className="text-3xl font-bold text-white">Global Chat</h1>
                    <p className="text-sm text-gray-400">Chat with everyone on MovieMate in real-time.</p>
                </div>

                {/* Chat Container */}
                <div className="flex-grow bg-zinc-900 rounded-xl overflow-hidden flex flex-col shadow-2xl border border-gray-800">
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender_id === user.id;
                            return (
                                <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">
                                        {!isMe && <span className="font-bold text-gray-300">{msg.sender_username || "Unknown"}</span>}
                                        <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-zinc-800 text-gray-200 rounded-bl-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-10 text-sm">
                                Be the first one to send a message in the Global Chat!
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="p-4 bg-zinc-950 border-t border-gray-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-grow bg-zinc-800 border border-gray-700 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary"
                            placeholder="Type a message..."
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || !isConnected}
                            className="bg-primary text-white p-3 rounded-full hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

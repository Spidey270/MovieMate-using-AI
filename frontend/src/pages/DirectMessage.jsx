import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Send, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';

export default function DirectMessage() {
    const { friendId } = useParams();
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [friend, setFriend] = useState(null);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const ws = useRef(null);
    const messagesEndRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                // Fetch friend info
                const friendRes = await api.get(`/users/${friendId}`);
                setFriend(friendRes.data);

                // Fetch chat history
                const chatRes = await api.get(`/chat/${friendId}`);
                setMessages(chatRes.data);
            } catch (error) {
                console.error("Failed to fetch chat metadata", error);
            } finally {
                setLoading(false);
            }
        };
        if (user && friendId) {
            fetchMetadata();
        }
    }, [friendId, user]);

    useEffect(() => {
        if (!user) return;

        const socket = new WebSocket(`ws://localhost:8000/chat/ws/${user.id}`);
        ws.current = socket;

        socket.onopen = () => setIsConnected(true);
        socket.onclose = () => setIsConnected(false);

        socket.onmessage = (event) => {
            const newMsg = JSON.parse(event.data);
            // Accept if message is from this friend
            if (newMsg.sender_id === friendId || newMsg.receiver_id === friendId) {
                setMessages((prev) => [...prev, newMsg]);
            }
        };

        return () => {
            socket.close();
        };
    }, [user, friendId]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (input.trim() && ws.current && isConnected) {
            const messagePayload = {
                to: friendId,
                content: input
            };
            ws.current.send(JSON.stringify(messagePayload));

            // Add optimistic update since backend only sends to receiver
            setMessages((prev) => [...prev, {
                id: Date.now().toString(),
                sender_id: user.id,
                receiver_id: friendId,
                content: input,
                timestamp: new Date().toISOString()
            }]);

            setInput('');
        }
    };

    if (loading) return <LoadingSpinner />;
    if (!user) return <div className="text-white text-center pt-24"><Navbar />Please login.</div>;

    return (
        <div className="min-h-screen bg-secondary pb-20 flex flex-col">
            <Navbar />

            <div className="pt-24 flex-grow flex flex-col max-w-4xl mx-auto w-full px-4 h-[calc(100vh-20px)]">
                <div className="mb-6 flex items-center justify-between border-b border-gray-800 pb-4">
                    <div className="flex items-center gap-4">
                        <Link to="/friends" className="text-gray-400 hover:text-white transition">
                            <ArrowLeft className="h-6 w-6" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm">
                                    {friend?.username?.[0]?.toUpperCase()}
                                </div>
                                Chat with {friend?.username}
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="flex-grow bg-zinc-900 rounded-xl overflow-hidden flex flex-col shadow-2xl border border-gray-800">
                    <div className="flex-grow overflow-y-auto p-6 space-y-4">
                        {messages.map((msg, idx) => {
                            const isMe = msg.sender_id === user.id;
                            return (
                                <div key={msg.id || idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <div className="text-[10px] text-gray-500 mb-1">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className={`px-4 py-2 rounded-2xl max-w-[80%] text-sm ${isMe ? 'bg-primary text-white rounded-br-none' : 'bg-zinc-800 text-gray-200 rounded-bl-none'}`}>
                                        {msg.content}
                                    </div>
                                </div>
                            );
                        })}
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-10 text-sm">
                                Start your conversation with {friend?.username}!
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={sendMessage} className="p-4 bg-zinc-950 border-t border-gray-800 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-grow bg-zinc-800 border border-gray-700 rounded-full px-4 py-3 text-white text-sm focus:outline-none focus:border-primary"
                            placeholder="Message..."
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

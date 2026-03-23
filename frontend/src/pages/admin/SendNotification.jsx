import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import { ArrowLeft, BellRing, Send } from 'lucide-react';

export default function SendNotification() {
    const [users, setUsers] = useState([]);
    const [targetId, setTargetId] = useState("all");
    const [message, setMessage] = useState("");
    const [link, setLink] = useState("");
    const [sending, setSending] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/admin/users');
                setUsers(res.data);
            } catch (err) {
                console.error("Failed to fetch users", err);
            }
        };
        fetchUsers();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSending(true);
        try {
            await api.post('/admin/notifications', {
                message: message.trim(),
                target_user_id: targetId,
                link: link.trim() || null
            });
            alert("Notification sent successfully!");
            navigate('/admin/dashboard');
        } catch (err) {
            console.error("Failed to send notification", err);
            alert("Error sending notification.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary pb-20">
            <Navbar />
            <div className="pt-24 mx-auto max-w-3xl px-4">
                <div className="mb-8 flex items-center gap-4 border-b border-gray-800 pb-4">
                    <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition">
                        <ArrowLeft className="h-6 w-6" />
                    </Link>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <BellRing className="h-8 w-8 text-primary" />
                        System Broadcasts
                    </h1>
                </div>

                <div className="bg-zinc-900 rounded-xl p-8 shadow-2xl border border-gray-800">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
                            <select 
                                value={targetId}
                                onChange={(e) => setTargetId(e.target.value)}
                                className="w-full bg-zinc-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                            >
                                <option value="all">🌐 Broadcast to All Users</option>
                                <optgroup label="Specific Users">
                                    {users.filter(u => !u.is_admin).map(u => (
                                        <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                                    ))}
                                </optgroup>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">Select who will receive this alert in their unread bell dropdown.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Notification Message</label>
                            <textarea 
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full bg-zinc-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition min-h-[120px]"
                                placeholder="e.g. Scheduled maintenance in 30 minutes! Please save your work."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Attached Link (Optional)</label>
                            <input 
                                type="text"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="w-full bg-zinc-950 border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition"
                                placeholder="e.g. /movies or /recommendations"
                            />
                            <p className="text-xs text-gray-500 mt-2">If provided, users who click the notification will be seamlessly redirected here.</p>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <button
                                type="submit"
                                disabled={sending || !message.trim()}
                                className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                            >
                                {sending ? 'Transmitting...' : 'Launch Broadcast'}
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

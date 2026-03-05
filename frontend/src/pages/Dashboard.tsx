import { useState, useRef, useEffect, useCallback } from 'react';
import { useWebSocket, ChatMessage } from '../hooks/useWebSocket';
import { useNavigate } from 'react-router-dom';

interface User {
    id: number;
    email: string;
    is_active: boolean;
}

export default function Dashboard() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [activeUser, setActiveUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');

    const navigate = useNavigate();
    const bottomRef = useRef<HTMLDivElement>(null);

    // 1. WebSocket Hook to receive incoming payloads
    const handleNewMessage = useCallback((msg: ChatMessage) => {
        setMessages(prev => {
            // Only append to UI if this message belongs to the currently active conversation
            if (activeUser && (
                (msg.sender_id === activeUser.id && msg.receiver_id === currentUser?.id) ||
                (msg.sender_id === currentUser?.id && msg.receiver_id === activeUser.id)
            )) {
                return [...prev, msg];
            }
            return prev;
        });
    }, [activeUser, currentUser]);

    // Initialize the WebSocket connection with the Backend
    const { isConnected, sendMessage } = useWebSocket('ws://localhost:8000/ws/chat', handleNewMessage);

    // 2. Initial Data Loading (Me & Other Users)
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchInitialData = async () => {
            try {
                // Fetch Current User
                const meRes = await fetch('http://localhost:8000/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!meRes.ok) throw new Error("Not authorized");
                const meData = await meRes.json();
                setCurrentUser(meData);

                // Fetch All Other Users
                const usersRes = await fetch('http://localhost:8000/users', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (usersRes.ok) {
                    const usersData = await usersRes.json();
                    setUsers(usersData);
                }
            } catch (error) {
                console.error("Authentication error during dashboard load", error);
                navigate('/login');
            }
        };

        fetchInitialData();
    }, [navigate]);

    // 3. Load Chat History when selecting a new active user
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!activeUser || !token) return;

        const fetchMessages = async () => {
            try {
                const res = await fetch(`http://localhost:8000/messages/${activeUser.id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMessages(data);
                }
            } catch (err) {
                console.error("Failed to fetch message history", err);
            }
        };

        fetchMessages();
    }, [activeUser]);

    // 4. Auto-Scroll to Bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim() && activeUser) {
            sendMessage(activeUser.id, inputMessage);
            setInputMessage('');
        }
    };

    const formatTime = (isoString?: string) => {
        if (!isoString) return 'Just now';
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Helper to get initials from email
    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-hidden w-full">
            {/* Sidebar Navigation (Compact) */}
            <aside className="w-20 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-8 bg-white dark:bg-background-dark/50">
                <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <span className="material-symbols-outlined text-3xl">bubble_chart</span>
                </div>
                <nav className="flex flex-col gap-6 flex-1">
                    <button className="text-primary bg-primary/10 p-3 rounded-xl">
                        <span className="material-symbols-outlined">chat_bubble</span>
                    </button>
                    <button className="text-slate-400 dark:text-slate-500 hover:text-primary transition-colors p-3">
                        <span className="material-symbols-outlined">group</span>
                    </button>
                    <button className="text-slate-400 dark:text-slate-500 hover:text-primary transition-colors p-3">
                        <span className="material-symbols-outlined">call</span>
                    </button>
                    <button className="text-slate-400 dark:text-slate-500 hover:text-primary transition-colors p-3">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                </nav>
                <div className="flex flex-col gap-6">
                    <button className="text-slate-400 dark:text-slate-500 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 ring-2 ring-primary/20">
                            {currentUser ? getInitials(currentUser.email) : 'U'}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'} border-2 border-white dark:border-background-dark rounded-full`} title={isConnected ? "WebSocket Connected" : "WebSocket Disconnected"}></div>
                    </div>
                </div>
            </aside>

            {/* Conversation List */}
            <section className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-background-dark">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold font-display">Messages</h1>
                        <button className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                        <input className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm transition-all" placeholder="Search chats..." type="text" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-3 space-y-1">
                    {/* Map through retrieved users to build directory */}
                    {users.map(user => (
                        <div
                            key={user.id}
                            onClick={() => setActiveUser(user)}
                            className={`flex items-center gap-4 p-3 rounded-xl shadow-sm border cursor-pointer transition-colors ${activeUser?.id === user.id ? 'bg-white dark:bg-slate-900 border-primary/30 dark:border-primary/30 ring-1 ring-primary/10' : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-800'}`}
                        >
                            <div className="relative shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {getInitials(user.email)}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-0.5">
                                    <span className="font-semibold text-sm truncate dark:text-slate-200">{user.email}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">Click to chat</p>
                            </div>
                        </div>
                    ))}
                    {users.length === 0 && (
                        <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                            No other users found. Sign up on another account to chat!
                        </div>
                    )}
                </div>
            </section>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-white dark:bg-slate-900">
                {activeUser ? (
                    <>
                        {/* Chat Header */}
                        <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {getInitials(activeUser.email)}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                                </div>
                                <div>
                                    <h2 className="font-bold text-base">{activeUser.email}</h2>
                                    <p className="text-xs text-green-500 font-medium">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                    <span className="material-symbols-outlined">videocam</span>
                                </button>
                                <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                    <span className="material-symbols-outlined">call</span>
                                </button>
                                <div className="w-px h-6 bg-slate-200 dark:border-slate-800 mx-2"></div>
                                <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                                    <span className="material-symbols-outlined">info</span>
                                </button>
                            </div>
                        </header>

                        {/* Messages Stream */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="flex justify-center">
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start of Conversation</span>
                            </div>

                            {messages.map((msg, index) => {
                                const isMine = msg.sender_id === currentUser?.id;

                                return (
                                    <div key={msg.id || index} className={`flex gap-4 max-w-2xl ${isMine ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                                        <div className={`flex flex-col gap-1.5 ${isMine ? 'items-end' : 'items-start'}`}>
                                            <div className={`p-4 rounded-2xl text-sm shadow-md leading-relaxed ${isMine ? 'bg-primary text-white rounded-tr-none shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'}`}>
                                                {msg.content}
                                            </div>
                                            <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMine ? 'flex-row-reverse' : ''}`}>
                                                <span>{formatTime(msg.timestamp)}</span>
                                                {isMine && <span className="material-symbols-outlined text-primary text-[14px]">done_all</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        {/* Message Input */}
                        <footer className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
                            <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-primary transition-all">
                                    <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors">
                                        <span className="material-symbols-outlined">add_circle</span>
                                    </button>
                                    <input
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-slate-100 outline-none"
                                        placeholder={`Message ${activeUser.email}...`}
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                    />
                                    <div className="flex items-center gap-1">
                                        <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">mood</span>
                                        </button>
                                        <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">mic</span>
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={!isConnected || !inputMessage.trim()}
                                            className="bg-primary text-white p-2.5 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md shadow-primary/20 flex items-center justify-center cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">send</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </footer>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-5xl">forum</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Your Messages</h2>
                        <p className="text-sm">Select a user from the sidebar to start a private chat.</p>
                    </div>
                )}
            </main>

            {/* Contextual Sidebar (Right) - Hiding if no active user */}
            {activeUser && (
                <aside className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 hidden xl:flex flex-col">
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex flex-col items-center justify-center text-primary font-bold mb-4 ring-4 ring-primary/5">
                            <span className="text-3xl">{getInitials(activeUser.email)}</span>
                        </div>
                        <h3 className="font-bold text-lg truncate w-full px-4">{activeUser.email}</h3>
                        <p className="text-xs text-slate-500 mb-6 italic">Private Conversation</p>

                        {/* Profile action buttons */}
                        <div className="flex gap-4 mb-6">
                            <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-[20px]">person</span>
                            </button>
                            <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-[20px]">notifications</span>
                            </button>
                            <button className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-all">
                                <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full">
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Messages</p>
                                <p className="text-sm font-semibold">{messages.length}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
                                <div className="flex items-center justify-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                    <span className="text-sm font-semibold">Online</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
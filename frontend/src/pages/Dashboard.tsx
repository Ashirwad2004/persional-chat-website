import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Dashboard() {
    const [inputMessage, setInputMessage] = useState('');
    // Assuming the FastAPI backend is running locally on port 8000
    const { messages, isConnected, sendMessage } = useWebSocket('ws://localhost:8000/ws/chat');

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim()) {
            sendMessage(inputMessage);
            setInputMessage('');
        }
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
                        <img alt="User" className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary/20" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkXKdRWmW9VaC4H26W7YwU6d5uv5VxpA18iG4X4nhMR4fNb4zJsYU11puUTuMZlAwmbfuXOSuRGn4F7opF2E1Zmjqn4cv1C07tf3SH4bFtR-PcZCcxHQFvq-v9ARTgsd-mmzmrnPt23ltTgePXXHVly8-MD9PUDIDlTpGZb9I26j5YstX6bQr2lHkv1yRu7D43MEcxPS6HEoL_dsRQtr4OwfaZHv5pmrAmaSWg_ptcTgm5-RK3JfR1PEdbEfp77DHvwZhN3ERBzmqb" />
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'} border-2 border-white dark:border-background-dark rounded-full`} title={isConnected ? "Connected" : "Disconnected"}></div>
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
                    {/* Active Conversation Item Placeholder */}
                    <div className="flex items-center gap-4 p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 cursor-pointer">
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                GC
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <span className="font-semibold text-sm truncate">Global Chat Room</span>
                                <span className="text-[10px] text-primary font-medium">Active</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">Join the discussion!</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-white dark:bg-slate-900">
                {/* Chat Header */}
                <header className="h-20 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold">
                                GC
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                        </div>
                        <div>
                            <h2 className="font-bold text-base">Global Chat Room</h2>
                            <p className="text-xs text-green-500 font-medium">Public Channel</p>
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

                    {messages.map((msg, index) => (
                        <div key={index} className="flex gap-4 max-w-2xl ml-auto flex-row-reverse">
                            <div className="flex flex-col gap-1.5 items-end">
                                <div className="bg-primary p-4 rounded-2xl rounded-tr-none text-sm text-white shadow-lg shadow-primary/20 leading-relaxed">
                                    {msg}
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-slate-400">Just now</span>
                                    <span className="material-symbols-outlined text-primary text-[14px]">done_all</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Message Input */}
                <footer className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-primary transition-all">
                            <button type="button" className="p-2 text-slate-400 hover:text-primary transition-colors">
                                <span className="material-symbols-outlined">add_circle</span>
                            </button>
                            <input
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-slate-100 outline-none"
                                placeholder="Type a message..."
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
                                    className="bg-primary text-white p-2.5 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md shadow-primary/20 flex items-center justify-center"
                                >
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </button>
                            </div>
                        </div>
                    </form>
                </footer>
            </main>

            {/* Contextual Sidebar (Right) */}
            <aside className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 hidden xl:flex flex-col">
                <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-3xl bg-primary/20 flex flex-col items-center justify-center text-primary font-bold mb-4 ring-4 ring-primary/10">
                        <span className="material-symbols-outlined text-4xl">public</span>
                    </div>
                    <h3 className="font-bold text-lg">Global Chat Room</h3>
                    <p className="text-xs text-slate-500 mb-6 italic">"The main lobby for NexusChat users"</p>
                    <div className="grid grid-cols-2 gap-3 w-full">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Members</p>
                            <p className="text-sm font-semibold">1,024</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
                            <div className="flex items-center justify-center gap-1.5">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                <span className="text-sm font-semibold">Live</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-8">
                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Media Shared</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined">image</span>
                            </div>
                            <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                                <span className="material-symbols-outlined">image</span>
                            </div>
                            <div className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                +0
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}
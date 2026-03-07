import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useUsers } from '../hooks/useUsers';
import { useMessages } from '../hooks/useMessages';

import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';

export default function Dashboard() {
    const { currentUser, activeUser, onlineUsers, messages } = useChatStore();
    const { fetchInitialUsers, uploadAvatar } = useUsers();
    const { fetchSummaries, fetchChatHistory } = useMessages();

    // Initialize WebSocket connection
    const { isConnected } = useWebSocket('ws://localhost:8000/ws/chat');
    const wasConnectedRef = useRef(isConnected);

    // 1. Initial Data Loading (Me, Users, Summaries)
    useEffect(() => {
        fetchInitialUsers();
        fetchSummaries();
    }, [fetchInitialUsers, fetchSummaries]);

    // 2. Load Chat History when selecting a new active user
    useEffect(() => {
        if (activeUser) {
            fetchChatHistory(activeUser.id);
        }
    }, [activeUser, fetchChatHistory]);

    // 3. Sync missed data when WebSocket connection is restored
    useEffect(() => {
        if (isConnected && !wasConnectedRef.current && currentUser) {
            fetchSummaries();
            if (activeUser) {
                fetchChatHistory(activeUser.id);
            }
        }
        wasConnectedRef.current = isConnected;
    }, [isConnected, currentUser, activeUser, fetchSummaries, fetchChatHistory]);

    // Helper to get initials from email
    const getInitials = (email: string) => {
        return email.substring(0, 2).toUpperCase();
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadAvatar(file);
        }
    };

    return (
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased overflow-hidden w-full">
            {/* Sidebar Navigation (Compact) */}
            <aside className="hidden md:flex w-20 border-r border-slate-200 dark:border-slate-800 flex-col items-center py-6 gap-8 bg-white dark:bg-background-dark/50 shrink-0">
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
                    <div className="relative group cursor-pointer" title="Click to upload profile picture">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleAvatarUpload}
                        />
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 ring-2 ring-primary/20 overflow-hidden group-hover:ring-primary/50 transition-all">
                            {currentUser?.profile_picture_url ? (
                                <img src={`http://localhost:8000${currentUser.profile_picture_url}`} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                currentUser ? getInitials(currentUser.email) : 'U'
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none flex">
                            <span className="material-symbols-outlined text-white text-[16px]">upload</span>
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'} border-2 border-white dark:border-background-dark rounded-full z-20`} title={isConnected ? "WebSocket Connected" : "WebSocket Disconnected"}></div>
                    </div>
                </div>
            </aside>

            {/* Conversation List Component */}
            <ChatList />

            {/* Main Chat Area Component */}
            <main className={`flex-1 flex-col relative bg-white dark:bg-slate-900 h-full ${activeUser ? 'flex' : 'hidden md:flex'}`}>
                <ChatWindow />
                <MessageInput />
            </main>

            {/* Contextual Sidebar (Right) - Hiding if no active user */}
            {activeUser && (
                <aside className="w-72 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark/50 hidden xl:flex flex-col">
                    <div className="p-8 flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-3xl bg-primary/10 flex flex-col items-center justify-center text-primary font-bold mb-4 ring-4 ring-primary/5 overflow-hidden">
                            {activeUser.profile_picture_url ? (
                                <img src={`http://localhost:8000${activeUser.profile_picture_url}`} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl">{getInitials(activeUser.email)}</span>
                            )}
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
                                    <div className={`w-1.5 h-1.5 ${onlineUsers.has(activeUser.id) ? 'bg-green-500' : 'bg-slate-400'} rounded-full`}></div>
                                    <span className="text-sm font-semibold">{onlineUsers.has(activeUser.id) ? 'Online' : 'Offline'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
        </div>
    );
}
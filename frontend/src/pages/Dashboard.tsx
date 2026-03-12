import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useUsers } from '../hooks/useUsers';
import { useMessages } from '../hooks/useMessages';
import { useCalls } from '../hooks/useCalls';
import { WS_BASE_URL } from '../config';

import ChatList from '../components/ChatList';
import CallHistoryList from '../components/CallHistoryList';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';
import CallOverlay from '../components/CallOverlay';

export default function Dashboard() {
    const { currentUser, activeUser, summaries } = useChatStore();
    const { fetchInitialUsers } = useUsers();
    const { fetchSummaries, fetchChatHistory } = useMessages();
    const { fetchCallHistory } = useCalls();

    const [activeTab, setActiveTab] = useState<'chats' | 'calls'>('chats');

    // Initialize WebSocket connection
    const { isConnected } = useWebSocket(`${WS_BASE_URL}/ws/chat`);
    const wasConnectedRef = useRef(isConnected);

    // 1. Initial Data Loading (Me, Users, Summaries, Calls)
    useEffect(() => {
        fetchInitialUsers();
        fetchSummaries();
        fetchCallHistory();
    }, [fetchInitialUsers, fetchSummaries, fetchCallHistory]);

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

    // 4. Update Document Title with Unread Count
    useEffect(() => {
        const totalUnread = Object.values(summaries).reduce((acc, curr) => acc + (curr.unread_count || 0), 0);
        if (totalUnread > 0) {
            document.title = `(${totalUnread}) WhatsApp Clone`;
        } else {
            document.title = 'WhatsApp Clone';
        }
    }, [summaries]);

    return (
        <div className="flex h-[100dvh] bg-white dark:bg-wa-panel-dark text-slate-900 dark:text-slate-100 antialiased overflow-hidden w-full relative">
            <CallOverlay />

            {/* Sidebar Desktop Toggle (Optional, can be added later if needed) */}
            
            {/* Conditional List Render */}
            {activeTab === 'chats' ? <ChatList /> : <CallHistoryList />}

            {/* Main Chat Area Component */}
            <main className={`flex-1 flex-col relative bg-wa-chat-light dark:bg-wa-chat-dark h-full ${activeUser ? 'flex' : 'hidden md:flex'}`}>
                <ChatWindow />
                <MessageInput />
            </main>



            {/* Mobile Bottom Navigation Bar (Visible only on ChatList view) */}
            {!activeUser && (
                <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-wa-header-light/95 dark:bg-wa-header-dark/95 backdrop-blur border-t border-slate-200 dark:border-wa-panel-dark z-50 flex justify-around items-center h-16 px-2 safe-area-pb">
                    <button 
                        onClick={() => setActiveTab('chats')}
                        className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'chats' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'chats' ? "'FILL' 1" : "'FILL' 0" }}>chat_bubble</span>
                        <span className="text-[10px] font-semibold">Chats</span>
                    </button>
                    <button className="flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors gap-1">
                        <span className="material-symbols-outlined">group</span>
                        <span className="text-[10px] font-medium">Contacts</span>
                    </button>
                    <button 
                         onClick={() => setActiveTab('calls')}
                         className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${activeTab === 'calls' ? 'text-primary' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: activeTab === 'calls' ? "'FILL' 1" : "'FILL' 0" }}>call</span>
                        <span className="text-[10px] font-medium">Calls</span>
                    </button>
                    <button className="flex flex-col items-center justify-center w-full h-full text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors gap-1">
                        <div className="relative">
                            <span className="material-symbols-outlined">settings</span>
                        </div>
                        <span className="text-[10px] font-medium">Settings</span>
                    </button>
                </nav>
            )}
        </div>
    );
}
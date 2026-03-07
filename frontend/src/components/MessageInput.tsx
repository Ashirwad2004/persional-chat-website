import { useState, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChatStore } from '../store/chatStore';

export default function MessageInput() {
    const [inputMessage, setInputMessage] = useState('');
    const { activeUser, setSummaries } = useChatStore();
    const { isConnected, sendChatMessage, sendTyping } = useWebSocket('ws://localhost:8000/ws/chat');
    const lastTypingTimeRef = useRef<number>(0);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim() && activeUser) {
            sendChatMessage(activeUser.id, inputMessage);

            // Optimistically update summary
            setSummaries(prev => ({
                ...prev,
                [activeUser.id]: {
                    last_message: inputMessage,
                    unread_count: prev[activeUser.id]?.unread_count || 0
                }
            }));

            setInputMessage('');
        }
    };

    const handleMessageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputMessage(e.target.value);
        if (activeUser) {
            const now = Date.now();
            if (now - lastTypingTimeRef.current > 2000) {
                sendTyping(activeUser.id);
                lastTypingTimeRef.current = now;
            }
        }
    };

    if (!activeUser) return null;

    return (
        <footer className="p-3 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group">
                <div className="flex items-center gap-2 md:gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-primary transition-all shadow-sm">
                    <button type="button" className="hidden sm:flex p-2 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">add_circle</span>
                    </button>
                    <input
                        className="flex-1 bg-transparent border-none focus:ring-0 text-[16px] md:text-sm text-slate-900 dark:text-slate-100 outline-none w-full px-2"
                        placeholder={`Message ${activeUser.email}...`}
                        type="text"
                        value={inputMessage}
                        onChange={handleMessageInput}
                        autoComplete="off"
                    />
                    <div className="flex items-center gap-0 md:gap-1 shrink-0">
                        <button type="button" className="hidden sm:flex p-2 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">mood</span>
                        </button>
                        <button type="button" className="hidden sm:flex p-2 text-slate-400 hover:text-primary transition-colors">
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
    );
}

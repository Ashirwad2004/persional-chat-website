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
        <div className="flex h-screen bg-background-light dark:bg-background-dark text-slate-800 dark:text-slate-200">
            {/* Sidebar */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15152a] flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg text-primary">
                        <span className="material-symbols-outlined">forum</span>
                    </div>
                    <h1 className="text-xl font-bold">NexusChat</h1>
                </div>
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                    {/* Mock conversations */}
                    <div className="p-3 bg-primary/10 rounded-xl cursor-pointer flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            GC
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-slate-900 dark:text-white">Global Chat</p>
                            <p className="text-xs text-slate-500">Welcome to NexusChat!</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                        <div className="text-sm">
                            <p className="font-semibold">Current User</p>
                            <p className="text-xs text-green-500">
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-50 dark:bg-background-dark">
                {/* Chat Header */}
                <div className="h-20 px-8 border-b border-slate-200 dark:border-slate-800 flex items-center bg-white dark:bg-[#15152a]">
                    <h2 className="text-lg font-bold">Global Chat</h2>
                </div>

                {/* Message View Area */}
                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-4">
                    <div className="text-center text-sm text-slate-400 my-4">
                        This is the start of the conversation
                    </div>

                    {messages.map((msg, index) => (
                        <div key={index} className="flex flex-col gap-1 items-start">
                            {/* Currently just basic layout - production would differentiate users */}
                            <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl rounded-tl-sm shadow-sm max-w-md">
                                <p className="text-sm">{msg}</p>
                            </div>
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-white dark:bg-[#15152a] border-t border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full bg-slate-100 dark:bg-slate-900/50 border-none rounded-xl h-14 pl-6 pr-16 focus:ring-2 focus:ring-primary shadow-inner"
                        />
                        <button
                            type="submit"
                            disabled={!isConnected || !inputMessage.trim()}
                            className="absolute right-2 bg-primary text-white p-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-xl">send</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

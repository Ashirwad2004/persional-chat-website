import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessages } from '../hooks/useMessages';

export default function ChatWindow() {
    const { currentUser, activeUser, setActiveUser, onlineUsers, typingUsers, messages, hasMoreMessages, setReplyingTo } = useChatStore();
    const { sendReadReceipt } = useWebSocket('ws://localhost:8000/ws/chat');
    const { markAsRead, deleteChatHistory, loadMoreMessages } = useMessages();
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);
    const isFetchingRef = useRef(false);
    const prevScrollHeightRef = useRef<number>(0);
    const lastMessageIdRef = useRef<number | null>(null);

    const getInitials = (email: string) => email.substring(0, 2).toUpperCase();
    const formatTime = (isoString?: string) => {
        if (!isoString) return 'Just now';
        let safeString = isoString.replace(' ', 'T');
        if (!safeString.endsWith('Z') && !safeString.includes('+')) {
            safeString += 'Z';
        }
        return new Date(safeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Infinite Scroll IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMoreMessages && !isFetchingRef.current && activeUser && messages.length > 0) {
                    isFetchingRef.current = true;

                    const container = scrollContainerRef.current;
                    prevScrollHeightRef.current = container?.scrollHeight || 0;

                    loadMoreMessages(activeUser.id, messages[0].id).then(() => {
                        setTimeout(() => {
                            if (container) {
                                container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
                            }
                            isFetchingRef.current = false;
                        }, 50);
                    });
                }
            },
            { root: null, threshold: 0.1 }
        );

        const target = observerTarget.current;
        if (target) observer.observe(target);

        return () => {
            if (target) observer.unobserve(target);
        };
    }, [hasMoreMessages, activeUser, messages, loadMoreMessages]);

    // Auto-scroll and read receipts
    useEffect(() => {
        if (!messages.length) return;

        const lastMsg = messages[messages.length - 1];

        // Only scroll to bottom if the newest message at the bottom changed (e.g., initial load or incoming new message)
        if (lastMessageIdRef.current !== lastMsg.id) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            lastMessageIdRef.current = lastMsg.id;
        }

        if (activeUser && lastMsg.sender_id === activeUser.id && !lastMsg.is_read) {
            sendReadReceipt(activeUser.id, [lastMsg.id]);
            markAsRead(activeUser.id);
        }
    }, [messages, activeUser, sendReadReceipt, markAsRead]);

    // Reset scroll memory and fetching ref when changing users
    useEffect(() => {
        if (activeUser) {
            lastMessageIdRef.current = null;
            isFetchingRef.current = false;
        }
    }, [activeUser]);

    const handleDeleteChat = async () => {
        if (!activeUser) return;
        const confirmDelete = window.confirm(`Are you sure you want to delete the entire chat history with ${activeUser.email}?`);
        if (!confirmDelete) return;
        await deleteChatHistory(activeUser.id);
    };

    if (!activeUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 h-full hidden md:flex">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-5xl">forum</span>
                </div>
                <h2 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">Your Messages</h2>
                <p className="text-sm">Select a user from the sidebar to start a private chat.</p>
            </div>
        );
    }

    return (
        <div className={`flex-1 flex-col relative bg-white dark:bg-slate-900 h-full ${activeUser ? 'flex' : 'hidden md:flex'}`}>
            {/* Chat Header */}
            <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-2 md:gap-4">
                    <button
                        onClick={() => setActiveUser(null)}
                        className="md:hidden p-2 -ml-2 mr-1 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back_ios_new</span>
                    </button>
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                            {activeUser.profile_picture_url ? (
                                <img src={`http://localhost:8000${activeUser.profile_picture_url}`} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                getInitials(activeUser.email)
                            )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                    </div>
                    <div>
                        <h2 className="font-bold text-base">{activeUser.email}</h2>
                        <p className={`text-xs font-medium ${onlineUsers.has(activeUser.id) ? 'text-green-500' : 'text-slate-400'}`}>
                            {onlineUsers.has(activeUser.id) ? 'Online' : 'Offline'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 md:gap-2">
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-[20px] md:text-2xl">videocam</span>
                    </button>
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-[20px] md:text-2xl">call</span>
                    </button>
                    <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-800 mx-2"></div>
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                        <span className="material-symbols-outlined text-[20px] md:text-2xl">info</span>
                    </button>
                    <button
                        onClick={handleDeleteChat}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete Chat History"
                    >
                        <span className="material-symbols-outlined text-[20px] md:text-2xl">delete</span>
                    </button>
                </div>
            </header>

            {/* Messages Stream */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pb-20 md:pb-8">
                {hasMoreMessages ? (
                    <div ref={observerTarget} className="flex justify-center h-8 items-center">
                        {isFetchingRef.current && (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                                <span className="text-xs text-slate-400 font-medium">Loading history...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start of Conversation</span>
                    </div>
                )}

                {messages.map((msg, index) => {
                    const isMine = msg.sender_id === currentUser?.id;

                    let displayContent = msg.content;
                    let replyContext: { id: string, sender: string, snippet: string } | null = null;

                    if (msg.content.startsWith('REPLY::')) {
                        const parts = msg.content.split('::');
                        if (parts.length >= 5) {
                            replyContext = { id: parts[1], sender: parts[2], snippet: parts[3] };
                            displayContent = parts.slice(4).join('::');
                        }
                    }

                    const isAudio = displayContent.startsWith('AUDIO:');
                    const audioUrl = isAudio ? displayContent.substring(6) : null;

                    return (
                        <div key={msg.id || index} className={`flex gap-4 max-w-2xl group ${isMine ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                            {/* Reply Action Button */}
                            <div className={`hidden group-hover:flex items-center justify-center self-center px-2 `}>
                                <button
                                    onClick={() => setReplyingTo(msg)}
                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all"
                                    title="Reply to message"
                                >
                                    <span className="material-symbols-outlined text-[18px]">reply</span>
                                </button>
                            </div>

                            <div className={`flex flex-col gap-1.5 ${isMine ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 rounded-2xl text-sm shadow-md leading-relaxed ${isMine ? 'bg-primary text-white rounded-tr-none shadow-primary/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'}`}>
                                    {replyContext && (
                                        <div className={`mb-2 p-2 rounded-r-lg rounded-l-[4px] border-l-[4px] opacity-90 max-w-sm ${isMine ? 'bg-black/10 border-white/40' : 'bg-black/5 dark:bg-white/5 border-primary/40'}`}>
                                            <div className="font-bold text-[11px] mb-0.5 opacity-80 truncate">{replyContext.sender}</div>
                                            <div className="text-xs line-clamp-2 truncate max-w-full text-ellipsis overflow-hidden">{replyContext.snippet}</div>
                                        </div>
                                    )}
                                    {isAudio ? (
                                        <audio controls src={`http://localhost:8000${audioUrl}`} className="h-10 w-64 max-w-full rounded-lg" />
                                    ) : (
                                        displayContent
                                    )}
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] text-slate-400 ${isMine ? 'flex-row-reverse' : ''}`}>
                                    <span>{formatTime(msg.timestamp)}</span>
                                    {isMine && (
                                        <span className={`material-symbols-outlined text-[14px] ${msg.status === 'pending' ? 'text-slate-300 dark:text-slate-500 animate-pulse' : msg.is_read ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400'}`}>
                                            {msg.status === 'pending' ? 'schedule' : msg.is_read ? 'done_all' : 'done'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {typingUsers.has(activeUser.id) && (
                    <div className="flex gap-4 max-w-2xl mr-auto">
                        <div className="flex flex-col gap-1.5 items-start">
                            <div className="p-4 rounded-2xl text-sm shadow-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none flex items-center gap-1">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>
        </div>
    );
}

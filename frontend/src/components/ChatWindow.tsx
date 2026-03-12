import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { useMessages } from '../hooks/useMessages';
import { useWebRTC } from '../hooks/useWebRTC';
import { API_BASE_URL, WS_BASE_URL } from '../config';

export default function ChatWindow() {
    const { currentUser, activeUser, setActiveUser, onlineUsers, typingUsers, messages, hasMoreMessages, setReplyingTo } = useChatStore();
    const { sendReadReceipt } = useWebSocket(`${WS_BASE_URL}/ws/chat`);
    const { markAsRead, deleteChatHistory, loadMoreMessages } = useMessages();
    const { startCall } = useWebRTC();
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
            <div className="flex-1 flex flex-col items-center justify-center text-[#54656f] dark:text-[#8696a0] bg-wa-chat-light dark:bg-wa-chat-dark h-full hidden md:flex border-b-[6px] border-b-primary shadow-inner">
                <div className="w-80 h-80 rounded-full flex items-center justify-center mb-8 opacity-50 dark:opacity-20 pointer-events-none">
                    <span className="material-symbols-outlined text-[120px] font-thin">devices</span>
                </div>
                <h2 className="text-3xl font-light text-[#41525d] dark:text-[#e9edef] mb-4 font-display">Nexus Chat</h2>
                <p className="text-[14px] leading-relaxed max-w-md text-center">Seamlessly send and receive messages without keeping your phone online.</p>
            </div>
        );
    }

    return (
        <div className={`flex-1 flex-col relative bg-wa-chat-light dark:bg-wa-chat-dark h-full ${activeUser ? 'flex' : 'hidden md:flex'}`}>
            {/* Chat Header */}
            <header className="h-[60px] flex items-center justify-between px-4 border-l border-transparent bg-wa-header-light dark:bg-wa-header-dark z-10 shrink-0">
                <div className="flex items-center gap-2 md:gap-3 cursor-pointer">
                    <button
                        onClick={() => setActiveUser(null)}
                        className="md:hidden p-1 -ml-2 text-slate-500 hover:text-slate-600 transition-all flex items-center justify-center"
                    >
                        <span className="material-symbols-outlined text-xl">arrow_back</span>
                    </button>
                    <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold overflow-hidden">
                            {activeUser.profile_picture_url ? (
                                <img src={`${API_BASE_URL}${activeUser.profile_picture_url}`} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                getInitials(activeUser.email)
                            )}
                        </div>
                    </div>
                    <div className="ml-1">
                        <h2 className="font-normal text-[16px] text-[#111b21] dark:text-[#e9edef]">{activeUser.email}</h2>
                        <p className={`text-[13px] ${onlineUsers.has(activeUser.id) ? 'text-[#54656f] dark:text-[#aebac1]' : 'text-[#54656f] dark:text-[#aebac1]'}`}>
                            {onlineUsers.has(activeUser.id) ? 'online' : 'click for contact info'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 text-[#54656f] dark:text-[#aebac1]">
                    <button 
                        onClick={() => activeUser && startCall(activeUser, true)}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all flex items-center justify-center"
                        title="Video Call"
                    >
                        <span className="material-symbols-outlined text-[24px]">videocam</span>
                    </button>
                    <button 
                        onClick={() => activeUser && startCall(activeUser, false)}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all flex items-center justify-center"
                        title="Voice Call"
                    >
                        <span className="material-symbols-outlined text-[24px]">call</span>
                    </button>
                    <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all flex items-center justify-center">
                        <span className="material-symbols-outlined text-[24px]">search</span>
                    </button>
                    <button
                        onClick={handleDeleteChat}
                        className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-all flex items-center justify-center"
                        title="Delete Chat History"
                    >
                        <span className="material-symbols-outlined text-[24px]">delete</span>
                    </button>
                </div>
            </header>

            {/* Messages Stream */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-[5%] md:px-[9%] py-4 space-y-2 pb-20 md:pb-8 relative">
                {hasMoreMessages ? (
                    <div ref={observerTarget} className="flex justify-center h-8 items-center mb-4">
                        {isFetchingRef.current && (
                            <div className="flex items-center gap-2 bg-white/50 dark:bg-wa-panel-dark/50 px-3 py-1.5 rounded-full shadow-sm">
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#54656f] border-t-transparent animate-spin"></div>
                                <span className="text-[12px] text-[#54656f] dark:text-[#8696a0]">Loading history...</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex justify-center mb-6 mt-2">
                        <span className="px-3 py-1 bg-[#ffeecd] dark:bg-[#182229] shadow-sm rounded-lg text-[12.5px] text-[#54656f] dark:text-[#aebac1]">🔒 Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.</span>
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
                        <div key={msg.id || index} className={`flex max-w-[85%] md:max-w-[75%] group relative ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                            {/* Reply Action Button */}
                            <div className={`flex items-center justify-center absolute top-1/2 -translate-y-1/2 ${isMine ? '-left-10' : '-right-10'} opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all duration-200 lg:opacity-0 lg:group-hover:opacity-100 opacity-40 md:opacity-0 pointer-events-auto`}>
                                <button
                                    onClick={() => setReplyingTo(msg)}
                                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white/70 hover:bg-white dark:bg-wa-panel-dark/70 dark:hover:bg-wa-panel-dark backdrop-blur-sm rounded-full shadow-sm transition-all"
                                    title="Reply"
                                >
                                    <span className="material-symbols-outlined text-[18px]">reply</span>
                                </button>
                            </div>

                            <div className={`flex flex-col relative px-2.5 py-1.5 rounded-xl shadow-sm text-[14.2px] leading-relaxed
                                ${isMine
                                    ? 'bg-wa-bubble-out-light dark:bg-wa-bubble-out-dark text-[#111b21] dark:text-[#e9edef] rounded-tr-none'
                                    : 'bg-white dark:bg-wa-bubble-in-dark text-[#111b21] dark:text-[#e9edef] rounded-tl-none'}
                            `}>
                                {replyContext && (
                                    <div className={`mb-1 p-2 rounded-[8px] border-l-[3px] shadow-sm flex flex-col gap-0.5 text-[13px] transition-colors ${isMine ? 'bg-[#dcf8c6]/50 dark:bg-[#025144]/30 border-[#02a698] dark:border-[#21c062]' : 'bg-[#f0f2f5]/80 dark:bg-[#202c33]/80 border-[#00a884] dark:border-[#00a884]'}`}>
                                        <div className={`font-semibold text-[12.5px] truncate px-1 ${isMine ? 'text-[#02a698] dark:text-[#21c062]' : 'text-[#00a884] dark:text-[#00a884]'}`}>{replyContext.sender}</div>
                                        <div className="line-clamp-3 text-[#54656f] dark:text-[#aebac1] min-h-[1.2em] px-1 opacity-90">{replyContext.snippet}</div>
                                    </div>
                                )}

                                <div className="flex flex-wrap items-end justify-between min-w-[70px]">
                                    <div className="break-words pr-2 pb-1.5 pt-0.5 max-w-full">
                                        {isAudio ? (
                                            <audio controls src={`${API_BASE_URL}${audioUrl}`} className="h-9 w-52" />
                                        ) : (
                                            displayContent
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0 ml-auto -mb-1 mt-1 text-[11px] text-[#667781] dark:text-[#8696a0]">
                                        <span>{formatTime(msg.timestamp)}</span>
                                        {isMine && (() => {
                                            const status = (msg as any).status || (msg.is_read ? 'read' : 'sent');
                                            return (
                                                <span className={`material-symbols-outlined text-[15px] font-bold ${status === 'read' ? 'text-[#53bdeb]' : ''}`}>
                                                    {status === 'pending' ? 'schedule' : status === 'read' ? 'done_all' : 'done'}
                                                </span>
                                            );
                                        })()}
                                    </div>
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

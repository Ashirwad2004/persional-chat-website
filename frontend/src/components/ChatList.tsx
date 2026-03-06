import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';

export default function ChatList() {
    const { currentUser, users, activeUser, setActiveUser, onlineUsers, typingUsers, summaries } = useChatStore();
    const { isConnected } = useWebSocket('ws://localhost:8000/ws/chat');

    const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

    return (
        <section className={`border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-background-dark shrink-0 h-full ${activeUser ? 'hidden md:flex w-80' : 'w-full md:w-80'}`}>
            <div className="p-4 md:p-6">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-3">
                        <div className="md:hidden relative cursor-pointer" title="Your Profile">
                            <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 ring-2 ring-primary/20">
                                {currentUser ? getInitials(currentUser.email) : 'U'}
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'} border-2 border-slate-50 dark:border-background-dark rounded-full`}></div>
                        </div>
                        <h1 className="text-2xl font-bold font-display">Messages</h1>
                    </div>
                    <button className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                        <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                </div>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                    <input className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-[16px] md:text-sm transition-all" placeholder="Search chats..." type="text" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto px-3 space-y-1">
                {users.map(user => (
                    <div
                        key={user.id}
                        onClick={() => setActiveUser(user)}
                        className={`flex items-center gap-4 p-3 rounded-xl shadow-sm border cursor-pointer transition-colors ${activeUser?.id === user.id ? 'bg-white dark:bg-slate-900 border-primary/30 dark:border-primary/30 ring-1 ring-primary/10' : 'bg-transparent border-transparent hover:bg-white/50 dark:hover:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-800'}`}
                    >
                        <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                                {user.profile_picture_url ? (
                                    <img src={`http://localhost:8000${user.profile_picture_url}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(user.email)
                                )}
                            </div>
                            {onlineUsers.has(user.id) && (
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-0.5">
                                <span className="font-semibold text-sm truncate dark:text-slate-200">{user.email}</span>
                                {summaries[user.id]?.unread_count > 0 && (
                                    <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                        {summaries[user.id].unread_count}
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs truncate font-medium ${summaries[user.id]?.unread_count > 0 ? 'text-primary dark:text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                                {typingUsers.has(user.id) ? (
                                    <span className="text-primary italic animate-pulse">typing...</span>
                                ) : (
                                    summaries[user.id]?.last_message || 'Click to chat'
                                )}
                            </p>
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
    );
}

import { useChatStore } from '../store/chatStore';
import { useMessages } from '../hooks/useMessages';
import { useUsers } from '../hooks/useUsers';
import { API_BASE_URL } from '../config';

export default function ChatList() {
    const { currentUser, users, activeUser, setActiveUser, onlineUsers, typingUsers, summaries } = useChatStore();
    const { deleteChatHistory } = useMessages();
    const { uploadAvatar } = useUsers();

    const getInitials = (email: string) => email.substring(0, 2).toUpperCase();

    const handleDeleteClick = async (e: React.MouseEvent, userId: number, email: string) => {
        e.stopPropagation(); // Prevent the main row from firing an setActiveUser
        const confirmClear = window.confirm(`Are you sure you want to delete all messages with ${email}?`);
        if (confirmClear) {
            await deleteChatHistory(userId);
            if (activeUser?.id === userId) {
                setActiveUser(null);
            }
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadAvatar(file);
        }
    };

    return (
        <section className={`border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-wa-panel-dark shrink-0 h-full ${activeUser ? 'hidden md:flex w-[400px]' : 'w-full md:w-[400px]'}`}>
            {/* Header */}
            <div className="bg-wa-header-light dark:bg-wa-header-dark h-16 flex items-center justify-between px-4 shrink-0 border-b border-transparent dark:border-slate-800/50">
                <div className="relative group cursor-pointer" title="Upload profile picture">
                    <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={handleAvatarUpload} />
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300 overflow-hidden">
                        {currentUser?.profile_picture_url ? (
                            <img src={`${API_BASE_URL}${currentUser.profile_picture_url}`} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            currentUser ? getInitials(currentUser.email) : 'U'
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                    <button className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><span className="material-symbols-outlined text-xl">data_usage</span></button>
                    <button className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><span className="material-symbols-outlined text-xl">chat</span></button>
                    <button className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors"><span className="material-symbols-outlined text-xl">more_vert</span></button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="relative bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg flex items-center px-3 py-1.5 overflow-hidden">
                    <span className="material-symbols-outlined text-slate-500 text-sm mr-4">search</span>
                    <input className="w-full bg-transparent outline-none text-[15px] placeholder-slate-500 text-slate-800 dark:text-slate-200 min-h-[26px]" placeholder="Search or start new chat" type="text" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-white dark:bg-wa-panel-dark pb-20 md:pb-0">
                {[...users].sort((a, b) => {
                    const timeA = summaries[a.id]?.timestamp ? new Date(summaries[a.id].timestamp!).getTime() : 0;
                    const timeB = summaries[b.id]?.timestamp ? new Date(summaries[b.id].timestamp!).getTime() : 0;
                    return timeB - timeA;
                }).map(user => (
                    <div
                        key={user.id}
                        onClick={() => setActiveUser(user)}
                        className={`group relative flex items-center gap-3 pl-3 cursor-pointer transition-colors ${activeUser?.id === user.id ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : 'hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]'}`}
                    >
                        <div className="relative shrink-0 py-3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold overflow-hidden">
                                {user.profile_picture_url ? (
                                    <img src={`${API_BASE_URL}${user.profile_picture_url}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    getInitials(user.email)
                                )}
                            </div>
                            {onlineUsers.has(user.id) && (
                                <div className="absolute bottom-3 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-wa-panel-dark rounded-full"></div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 py-3 pr-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="font-normal text-[17px] truncate dark:text-slate-200">{user.email}</span>
                                {summaries[user.id]?.unread_count > 0 && (
                                    <span className="bg-primary text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                                        {summaries[user.id].unread_count}
                                    </span>
                                )}
                            </div>
                            <p className={`text-[14px] leading-5 truncate ${summaries[user.id]?.unread_count > 0 ? 'text-slate-800 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                {typingUsers.has(user.id) ? (
                                    <span className="text-primary italic">typing...</span>
                                ) : (
                                    summaries[user.id]?.last_message || '...'
                                )}
                            </p>
                        </div>
                        <button
                            onClick={(e) => handleDeleteClick(e, user.id, user.email)}
                            className="hidden group-hover:flex absolute right-4 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 bg-white/80 dark:bg-[#202c33]/80 backdrop-blur rounded-full transition-all"
                            title="Delete Chat"
                        >
                            <span className="material-symbols-outlined text-xl">keyboard_arrow_down</span>
                        </button>
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

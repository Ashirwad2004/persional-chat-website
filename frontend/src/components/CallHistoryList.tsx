import { useEffect } from 'react';
import { useCalls } from '../hooks/useCalls';
import { useChatStore } from '../store/chatStore';
import { useWebRTC } from '../hooks/useWebRTC';
import { API_BASE_URL } from '../config';

export default function CallHistoryList() {
    const { fetchCallHistory } = useCalls();
    const { callHistory, currentUser, users } = useChatStore();
    const { startCall } = useWebRTC();

    useEffect(() => {
        if (currentUser) {
            fetchCallHistory();
        }
    }, [currentUser, fetchCallHistory]);

    return (
        <aside className="w-full md:w-80 lg:w-[400px] flex-shrink-0 flex flex-col bg-white dark:bg-wa-panel-dark border-r border-slate-200 dark:border-wa-panel-dark relative z-10 h-full">
            {/* Header */}
            <div className="h-16 flex items-center px-4 bg-wa-header-light dark:bg-wa-header-dark flex-shrink-0 safe-area-pt">
                <h1 className="text-xl font-semibold text-[#111b21] dark:text-[#e9edef] mr-auto pl-2">Calls</h1>
                <button className="w-10 h-10 rounded-full flex items-center justify-center text-[#54656f] dark:text-[#aebac1] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined">add_call</span>
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto w-full custom-scrollbar bg-white dark:bg-[#111b21]">
                {callHistory.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-[#54656f] dark:text-[#8696a0] px-8 text-center gap-4">
                        <span className="material-symbols-outlined text-6xl">call</span>
                        <p>No recent calls</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-white/5">
                        {callHistory.map(call => {
                            const isIncoming = call.receiver_id === currentUser?.id;
                            const remoteUserAvatar = call.other_user.profile_picture_url ? `${API_BASE_URL}${call.other_user.profile_picture_url}` : null;
                            const initials = call.other_user.email.substring(0, 2).toUpperCase();
                            
                            // Find the full remote User object to initiate a new call
                            const fullRemoteUser = users.find(u => u.id === call.other_user.id);
                            
                            // Determine status icon color and type
                            let statusIcon = "call_made";
                            let iconColor = "text-[#00a884]";
                            
                            if (call.status === 'missed') {
                                iconColor = "text-[#ea0038]";
                                statusIcon = isIncoming ? "call_missed" : "call_missed_outgoing";
                            } else if (call.status === 'rejected') {
                                iconColor = "text-[#ea0038]";
                                statusIcon = isIncoming ? "call_received" : "call_made";
                            } else if (isIncoming) {
                                statusIcon = "call_received";
                            }

                            const formattedDate = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(call.start_time));

                            return (
                                <li key={call.id} className="group hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] cursor-pointer transition-colors px-3">
                                    <div className="flex items-center gap-3 w-full py-3 h-[72px]">
                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-semibold relative select-none">
                                            {remoteUserAvatar ? (
                                                <img src={remoteUserAvatar} alt="Avatar" className="w-full h-full object-cover" loading="lazy" />
                                            ) : (
                                                <span className="text-sm">{initials}</span>
                                            )}
                                        </div>

                                        {/* Data */}
                                        <div className="flex-1 min-w-0 pr-2 pb-[2px] self-stretch flex flex-col justify-center border-b border-transparent">
                                            <div className="flex justify-between items-end mb-1">
                                                <h3 className="text-[17px] text-[#111b21] dark:text-[#e9edef] truncate font-normal leading-5">{call.other_user.email}</h3>
                                            </div>
                                            <div className="flex items-center mt-[2px]">
                                                <span className={`material-symbols-outlined text-[16px] mr-1 ${iconColor}`}>{statusIcon}</span>
                                                <p className="text-[#54656f] text-sm dark:text-[#8696a0] truncate leading-5 font-medium flex-1">
                                                    {formattedDate}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Call Action */}
                                        <div className="flex-shrink-0 pl-1">
                                             <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (fullRemoteUser) startCall(fullRemoteUser, call.is_video);
                                                }}
                                                className="w-10 h-10 rounded-full flex items-center justify-center text-[#00a884] opacity-80 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                                             >
                                                <span className="material-symbols-outlined text-[24px] font-light">
                                                    {call.is_video ? 'videocam' : 'call'}
                                                </span>
                                             </button>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </aside>
    );
}

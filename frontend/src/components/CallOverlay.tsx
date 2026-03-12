import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { useWebRTC } from '../hooks/useWebRTC';
import { API_BASE_URL } from '../config';

export default function CallOverlay() {
    const { activeCall } = useChatStore();
    const { acceptCall, rejectCall, endCall, toggleAudio, toggleVideo } = useWebRTC();
    
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);

    useEffect(() => {
        const handleLocalStream = (e: Event) => {
            const stream = (e as CustomEvent<MediaStream | null>).detail;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
        };

        const handleRemoteStream = (e: Event) => {
            const stream = (e as CustomEvent<MediaStream | null>).detail;
            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = stream;
            }
        };

        window.addEventListener('webrtc_local_stream', handleLocalStream);
        window.addEventListener('webrtc_remote_stream', handleRemoteStream);

        return () => {
            window.removeEventListener('webrtc_local_stream', handleLocalStream);
            window.removeEventListener('webrtc_remote_stream', handleRemoteStream);
        };
    }, []);

    const handleToggleAudio = () => {
        const isEnabled = toggleAudio();
        setIsAudioMuted(!isEnabled);
    };

    const handleToggleVideo = () => {
        const isEnabled = toggleVideo();
        setIsVideoMuted(!isEnabled);
    };

    if (!activeCall) return null;

    const { remoteUser, status, isAudioOnly } = activeCall;
    const remoteUserAvatar = remoteUser.profile_picture_url ? `${API_BASE_URL}${remoteUser.profile_picture_url}` : null;
    const initials = remoteUser.email.substring(0, 2).toUpperCase();

    // INCOMING CALL SCREEN
    if (status === 'incoming') {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-wa-panel-dark rounded-2xl shadow-2xl p-8 max-w-sm w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
                    <div className="relative mb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold overflow-hidden border-4 border-white dark:border-wa-panel-dark shadow-lg z-10 relative">
                            {remoteUserAvatar ? (
                                <img src={remoteUserAvatar} alt="Caller Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl">{initials}</span>
                            )}
                        </div>
                        {/* Ripple effect rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-[#00a884] animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
                        <div className="absolute inset-[-10px] rounded-full border-2 border-[#00a884] animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50 animation-delay-300"></div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-[#111b21] dark:text-[#e9edef] mb-1">{remoteUser.email}</h2>
                    <p className="text-[#54656f] dark:text-[#8696a0] mb-8 font-medium">Incoming {isAudioOnly ? 'Audio' : 'Video'} Call...</p>
                    
                    <div className="flex gap-8 w-full justify-center">
                        <button 
                            onClick={() => rejectCall()}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-[#ea0038] hover:bg-[#c90030] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
                                <span className="material-symbols-outlined text-3xl">call_end</span>
                            </div>
                            <span className="text-[13px] font-medium text-[#54656f] dark:text-[#8696a0]">Decline</span>
                        </button>

                        <button 
                            onClick={() => acceptCall(false)}
                            className="flex flex-col items-center gap-2 group"
                        >
                            <div className="w-14 h-14 rounded-full bg-[#00a884] hover:bg-[#008f6f] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 animate-bounce">
                                <span className="material-symbols-outlined text-3xl">call</span>
                            </div>
                            <span className="text-[13px] font-medium text-[#54656f] dark:text-[#8696a0]">Accept</span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ACTIVE / OUTGOING CALL SCREEN
    return (
        <div className="fixed inset-0 z-50 bg-[#0b141a] flex flex-col justify-between overflow-hidden">
            
            {/* Header / Info */}
            <div className="absolute top-0 left-0 right-0 p-6 flex flex-col items-center justify-start z-20 bg-gradient-to-b from-black/80 to-transparent pt-12">
               <h2 className="text-white text-2xl font-semibold mb-1 shadow-black drop-shadow-md">{remoteUser.email}</h2>
               <p className="text-white/80 text-sm font-medium">
                   {status === 'outgoing' ? 'Calling...' : 
                    status === 'connected' ? '00:00' : status}
               </p>
            </div>

            {/* Video Streams Canvas */}
            <div className="relative flex-1 w-full h-full flex items-center justify-center">
                
                {/* Remote Video (Full Screen) or Avatar Fallback */}
                {(!isAudioOnly && status === 'connected') ? (
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full">
                         <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold overflow-hidden shadow-2xl">
                            {remoteUserAvatar ? (
                                <img src={remoteUserAvatar} alt="Caller Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">{initials}</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Local Video (Picture-in-Picture) */}
                {(!isAudioOnly || !isVideoMuted) && (
                     <div className="absolute bottom-32 right-6 w-28 h-40 md:w-40 md:h-56 bg-slate-800 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-20 transition-all hover:scale-105">
                     <video 
                         ref={localVideoRef} 
                         autoPlay 
                         playsInline 
                         muted 
                         className="w-full h-full object-cover mirror-mode"
                         style={{ transform: 'scaleX(-1)' }} // Mirror local video
                     />
                 </div>
                )}
            </div>

            {/* Controls Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center gap-6 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
                
                <button 
                    onClick={handleToggleAudio}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isAudioMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isAudioMuted ? 'mic_off' : 'mic'}
                    </span>
                </button>

                <button 
                    onClick={() => endCall(true)}
                    className="w-16 h-16 rounded-full bg-[#ea0038] hover:bg-[#c90030] text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                >
                    <span className="material-symbols-outlined text-3xl">call_end</span>
                </button>

                <button 
                    onClick={handleToggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${isVideoMuted ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-md'}`}
                >
                    <span className="material-symbols-outlined text-2xl">
                        {isVideoMuted ? 'videocam_off' : 'videocam'}
                    </span>
                </button>

            </div>
        </div>
    );
}

import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChatStore } from '../store/chatStore';
import { messagesApi } from '../api/messages';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { WS_BASE_URL } from '../config';

export default function MessageInput() {
    const [inputMessage, setInputMessage] = useState('');
    const { activeUser, setSummaries, replyingTo, setReplyingTo, users, currentUser } = useChatStore();
    const { isConnected, sendChatMessage, sendTyping } = useWebSocket(`${WS_BASE_URL}/ws/chat`);

    // Typing states
    const lastTypingTimeRef = useRef<number>(0);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Audio Timer formatting
    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Close Emoji Picker on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onEmojiClick = (emojiData: EmojiClickData) => {
        setInputMessage((prev) => prev + emojiData.emoji);
    };

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputMessage.trim() && activeUser) {
            let finalMessage = inputMessage;

            if (replyingTo) {
                const senderEmail = users.find(u => u.id === replyingTo.sender_id)?.email || currentUser?.email || 'User';

                let snippet = replyingTo.content;
                if (snippet.startsWith('AUDIO:')) {
                    snippet = '🎵 Voice Message';
                } else if (snippet.startsWith('REPLY::')) {
                    const parts = snippet.split('::');
                    snippet = parts.slice(4).join('::');
                }

                snippet = snippet.substring(0, 50).replace(/::/g, ' - ') + (snippet.length > 50 ? '...' : '');

                finalMessage = `REPLY::${replyingTo.id}::${senderEmail}::${snippet}::${inputMessage}`;
            }

            sendChatMessage(activeUser.id, finalMessage);

            setSummaries(prev => ({
                ...prev,
                [activeUser.id]: {
                    last_message: inputMessage,
                    unread_count: prev[activeUser.id]?.unread_count || 0,
                    timestamp: new Date().toISOString()
                }
            }));

            setInputMessage('');
            setReplyingTo(null);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            timerIntervalRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access your microphone. Please check your browser permissions.');
        }
    };

    const stopRecordingAndSend = () => {
        if (mediaRecorderRef.current && isRecording && activeUser) {
            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                try {
                    const response = await messagesApi.uploadAudio(audioBlob);
                    const audioUrl = response.url;
                    const semanticMessage = `AUDIO:${audioUrl}`;

                    sendChatMessage(activeUser.id, semanticMessage);

                    setSummaries(prev => ({
                        ...prev,
                        [activeUser.id]: {
                            last_message: "🎵 Voice Message",
                            unread_count: prev[activeUser.id]?.unread_count || 0,
                            timestamp: new Date().toISOString()
                        }
                    }));
                } catch (error) {
                    console.error("Failed to upload audio:", error);
                }
            };

            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            finishRecordingState();
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.onstop = null; // Prevent sending
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            finishRecordingState();
        }
    };

    const finishRecordingState = () => {
        setIsRecording(false);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setRecordingTime(0);
        audioChunksRef.current = [];
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
        <footer className="px-4 py-[10px] bg-wa-header-light dark:bg-wa-header-dark border-t border-transparent shrink-0">
            <form onSubmit={handleSend} className="relative group flex flex-col gap-2">
                {replyingTo && (
                    <div className="bg-wa-panel-dark p-2 md:p-3 rounded-xl border-l-4 border-primary flex items-start justify-between shadow-sm animate-fade-in relative mx-12">
                        <div className="flex flex-col overflow-hidden w-full bg-[#202c33] px-3 py-1.5 rounded-r-lg">
                            <span className="text-[13px] font-bold text-primary mb-0.5">
                                {users.find(u => u.id === replyingTo.sender_id)?.email || currentUser?.email || 'User'}
                            </span>
                            <span className="text-[13px] text-slate-400 truncate pr-6 block max-w-full">
                                {replyingTo.content.startsWith('AUDIO:') ? '🎵 Voice Message' : (replyingTo.content.startsWith('REPLY::') ? replyingTo.content.split('::').slice(4).join('::') : replyingTo.content)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="text-slate-400 hover:text-slate-200 transition-colors p-1 flex items-center justify-center absolute right-3 top-3"
                        >
                            <span className="material-symbols-outlined text-[18px]">close</span>
                        </button>
                    </div>
                )}

                <div className="flex items-end gap-2 px-2">
                    {/* Left Icons */}
                    <div className="flex items-center gap-1 pb-1">
                        <div className="relative" ref={emojiPickerRef}>
                            <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2.5 text-slate-500 hover:text-slate-400 transition-colors flex items-center">
                                <span className="material-symbols-outlined text-[26px]">mood</span>
                            </button>
                            {showEmojiPicker && (
                                <div className="absolute bottom-[calc(100%+12px)] left-0 mb-2 z-50 shadow-xl">
                                    <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.DARK} />
                                </div>
                            )}
                        </div>
                        <button type="button" className="p-2.5 text-slate-500 hover:text-slate-400 transition-colors flex items-center">
                            <span className="material-symbols-outlined text-[26px]">add</span>
                        </button>
                    </div>

                    {/* Input Field or Recording State */}
                    {isRecording ? (
                        <div className="flex-1 bg-white dark:bg-wa-panel-dark rounded-xl px-4 py-2.5 flex items-center justify-between mb-1 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <span className="text-red-500 font-medium tracking-wide font-display">
                                    {formatRecordingTime(recordingTime)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={cancelRecording} className="p-1 text-slate-400 hover:text-red-500 transition-all flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                                <button type="button" onClick={stopRecordingAndSend} className="p-1 text-primary hover:text-primary/80 transition-all flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[24px]">send</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white dark:bg-wa-panel-dark rounded-xl px-4 py-0 min-h-[42px] max-h-[120px] mb-1 flex items-center shadow-sm">
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 text-[15px] text-slate-900 dark:text-slate-100 placeholder-slate-500 outline-none py-2.5"
                                placeholder="Type a message"
                                type="text"
                                value={inputMessage}
                                onChange={handleMessageInput}
                                autoComplete="off"
                            />
                        </div>
                    )}

                    {/* Right Icon (Voice or Send) */}
                    <div className="flex items-center justify-center pb-1 pl-1 pr-1">
                        {inputMessage.trim() ? (
                            <button
                                type="submit"
                                disabled={!isConnected}
                                className="p-2.5 text-slate-500 hover:text-slate-400 transition-colors flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-[26px]">send</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={startRecording}
                                className="p-2.5 text-slate-500 hover:text-slate-400 transition-colors flex items-center justify-center"
                            >
                                <span className="material-symbols-outlined text-[26px]">mic</span>
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </footer>
    );
}

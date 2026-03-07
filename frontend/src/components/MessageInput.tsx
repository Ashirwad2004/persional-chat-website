import { useState, useRef, useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useChatStore } from '../store/chatStore';
import { messagesApi } from '../api/messages';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

export default function MessageInput() {
    const [inputMessage, setInputMessage] = useState('');
    const { activeUser, setSummaries, replyingTo, setReplyingTo, users, currentUser } = useChatStore();
    const { isConnected, sendChatMessage, sendTyping } = useWebSocket('ws://localhost:8000/ws/chat');

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
                    unread_count: prev[activeUser.id]?.unread_count || 0
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
                            unread_count: prev[activeUser.id]?.unread_count || 0
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
        <footer className="p-3 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
            <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group flex flex-col gap-2">
                {replyingTo && (
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 md:p-3 rounded-r-xl rounded-l-sm border-l-4 border-primary flex items-start justify-between shadow-sm animate-fade-in relative ml-2 md:ml-0">
                        <div className="flex flex-col overflow-hidden w-full">
                            <span className="text-[11px] font-bold text-primary mb-0.5">
                                Replying to {users.find(u => u.id === replyingTo.sender_id)?.email || currentUser?.email || 'User'}
                            </span>
                            <span className="text-xs text-slate-600 dark:text-slate-300 truncate pr-6 block max-w-full">
                                {replyingTo.content.startsWith('AUDIO:') ? '🎵 Voice Message' : (replyingTo.content.startsWith('REPLY::') ? replyingTo.content.split('::').slice(4).join('::') : replyingTo.content)}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setReplyingTo(null)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 absolute right-2 top-2"
                        >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-2 md:gap-3 bg-slate-50 dark:bg-slate-800/50 p-2 md:p-3 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:border-primary transition-all shadow-sm">
                    {isRecording ? (
                        <div className="flex-1 flex items-center justify-between px-2 w-full animate-fade-in">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                                <span className="text-red-500 font-medium tracking-wide">
                                    {formatRecordingTime(recordingTime)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={cancelRecording} className="p-2.5 text-slate-400 hover:text-red-500 bg-slate-200 dark:bg-slate-700 rounded-full transition-all flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                </button>
                                <button type="button" onClick={stopRecordingAndSend} className="p-2.5 bg-green-500 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-md shadow-green-500/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[20px]">send</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
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
                                <div className="relative" ref={emojiPickerRef}>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="hidden sm:flex p-2 text-slate-400 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined">mood</span>
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute bottom-[calc(100%+12px)] right-0 mb-2 z-50">
                                            <EmojiPicker onEmojiClick={onEmojiClick} />
                                        </div>
                                    )}
                                </div>
                                {inputMessage.trim() ? (
                                    <button
                                        type="submit"
                                        disabled={!isConnected}
                                        className="bg-primary text-white p-2.5 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md shadow-primary/20 flex items-center justify-center cursor-pointer ml-1"
                                    >
                                        <span className="material-symbols-outlined text-[20px]">send</span>
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={startRecording}
                                        className="p-2 text-slate-400 hover:text-primary transition-colors flex items-center justify-center"
                                    >
                                        <span className="material-symbols-outlined">mic</span>
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </form>
        </footer>
    );
}

import { create } from 'zustand';

export interface User {
    id: number;
    email: string;
    is_active: boolean;
    profile_picture_url?: string;
}

export interface ChatMessage {
    id: number;
    content: string;
    sender_id: number;
    receiver_id: number;
    timestamp: string;
    is_read: boolean;
    client_id?: string;
    status?: 'pending' | 'sent' | 'error';
}

export type CallStatus = 'incoming' | 'outgoing' | 'connected' | 'ended' | 'rejected' | 'missed';

export interface CallState {
    id: string; // unique call id
    remoteUser: User;
    status: CallStatus;
    isAudioOnly: boolean;
}

export interface CallHistoryRecord {
    id: number;
    caller_id: number;
    receiver_id: number;
    start_time: string;
    end_time: string | null;
    status: 'missed' | 'in_progress' | 'completed' | 'rejected';
    is_video: boolean;
    other_user: {
        id: number;
        email: string;
        profile_picture_url: string | null;
    }
}

interface ChatState {
    currentUser: User | null;
    users: User[];
    activeUser: User | null;
    messages: ChatMessage[];
    onlineUsers: Set<number>;
    typingUsers: Set<number>;
    summaries: Record<number, { last_message: string; unread_count: number; timestamp?: string }>;
    hasMoreMessages: boolean;
    replyingTo: ChatMessage | null;
    activeCall: CallState | null;
    callHistory: CallHistoryRecord[];

    setCurrentUser: (user: User | null) => void;
    setUsers: (users: User[]) => void;
    setActiveUser: (user: User | null) => void;
    setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
    addMessage: (message: ChatMessage) => void;
    updateMessageStatus: (clientId: string, updatedMsg: Partial<ChatMessage>) => void;
    setOnlineUsers: (updater: (prev: Set<number>) => Set<number>) => void;
    setTypingUsers: (updater: (prev: Set<number>) => Set<number>) => void;
    setSummaries: (updater: (prev: Record<number, { last_message: string; unread_count: number; timestamp?: string }>) => Record<number, { last_message: string; unread_count: number; timestamp?: string }>) => void;
    setHasMoreMessages: (hasMore: boolean) => void;
    setReplyingTo: (msg: ChatMessage | null) => void;
    setActiveCall: (call: CallState | null) => void;
    setCallHistory: (calls: CallHistoryRecord[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
    currentUser: null,
    users: [],
    activeUser: null,
    messages: [],
    onlineUsers: new Set(),
    typingUsers: new Set(),
    summaries: {},
    hasMoreMessages: true,
    replyingTo: null,
    activeCall: null,
    callHistory: [],

    setCurrentUser: (user) => set({ currentUser: user }),
    setUsers: (users) => set({ users }),
    setActiveUser: (user) => set({ activeUser: user }),
    setMessages: (messages) => set((state) => ({
        messages: typeof messages === 'function' ? messages(state.messages) : messages
    })),
    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
    })),
    updateMessageStatus: (clientId, updatedMsg) => set((state) => ({
        messages: state.messages.map(msg =>
            msg.client_id === clientId ? { ...msg, ...updatedMsg } : msg
        )
    })),
    setOnlineUsers: (updater) => set((state) => ({
        onlineUsers: updater(state.onlineUsers)
    })),
    setTypingUsers: (updater) => set((state) => ({
        typingUsers: updater(state.typingUsers)
    })),
    setSummaries: (updater) => set((state) => ({
        summaries: updater(state.summaries)
    })),
    setHasMoreMessages: (hasMore) => set({ hasMoreMessages: hasMore }),
    setReplyingTo: (msg) => set({ replyingTo: msg }),
    setActiveCall: (call) => set({ activeCall: call }),
    setCallHistory: (calls) => set({ callHistory: calls }),
}));

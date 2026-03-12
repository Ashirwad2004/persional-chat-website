import apiClient from './client';

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

export const callsApi = {
    getCallHistory: async (): Promise<CallHistoryRecord[]> => {
        const response = await apiClient.get('/calls/');
        return response.data;
    }
};

import { useCallback } from 'react';
import { callsApi } from '../api/calls';
import { useChatStore } from '../store/chatStore';

export function useCalls() {
    const { setCallHistory } = useChatStore();

    const fetchCallHistory = useCallback(async () => {
        try {
            const data = await callsApi.getCallHistory();
            setCallHistory(data);
        } catch (error) {
            console.error("Failed to fetch call history", error);
        }
    }, [setCallHistory]);

    return { fetchCallHistory };
}

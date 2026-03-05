import { useState, useEffect, useRef, useCallback } from 'react';

export interface ChatMessage {
    id?: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    timestamp?: string;
}

export function useWebSocket(url: string, onMessageReceived?: (msg: ChatMessage) => void) {
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.error("No access token found for WebSocket connection.");
            return;
        }

        // Connect with the JWT token in the query params to authenticate the socket
        const wsUrl = `${url}?token=${token}`;
        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            setIsConnected(true);
            console.log('Connected to authenticated chat server');
        };

        ws.current.onmessage = (event) => {
            try {
                const msg: ChatMessage = JSON.parse(event.data);
                if (onMessageReceived) {
                    onMessageReceived(msg);
                }
            } catch (error) {
                console.error('Failed to parse incoming WebSocket message', event.data);
            }
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            console.log('Disconnected from chat server');
        };

        return () => {
            ws.current?.close();
        };
    }, [url, onMessageReceived]);

    const sendMessage = useCallback((receiverId: number, content: string) => {
        if (ws.current && isConnected) {
            const payload = JSON.stringify({
                receiver_id: receiverId,
                content: content
            });
            ws.current.send(payload);
        }
    }, [isConnected]);

    return { isConnected, sendMessage };
}

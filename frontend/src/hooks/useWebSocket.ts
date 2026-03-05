import { useState, useEffect, useRef } from 'react';

export function useWebSocket(url: string) {
    const [messages, setMessages] = useState<string[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        ws.current = new WebSocket(url);

        ws.current.onopen = () => {
            setIsConnected(true);
            console.log('Connected to chat server');
        };

        ws.current.onmessage = (event) => {
            setMessages((prev) => [...prev, event.data]);
        };

        ws.current.onclose = () => {
            setIsConnected(false);
            console.log('Disconnected from chat server');
        };

        return () => {
            ws.current?.close();
        };
    }, [url]);

    const sendMessage = (message: string) => {
        if (ws.current && isConnected) {
            ws.current.send(message);
        }
    };

    return { messages, isConnected, sendMessage };
}

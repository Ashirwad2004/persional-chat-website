import { useEffect, useRef, useCallback } from 'react';
import { useChatStore, User } from '../store/chatStore';
import { useWebSocket, SignalingEvent } from './useWebSocket';
import { WS_BASE_URL } from '../config';

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
    ]
};

export function useWebRTC() {
    const { currentUser, setActiveCall } = useChatStore();
    const { sendSignalingMessage } = useWebSocket(`${WS_BASE_URL}/ws/chat`);
    
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const localStream = useRef<MediaStream | null>(null);
    const remoteStream = useRef<MediaStream | null>(null);
    const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
    
    // Setup RTCPeerConnection
    const setupPeerConnection = useCallback((remoteUserId: number) => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }

        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnection.current = pc;

        // Add local tracks to PC
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => {
                if (localStream.current) {
                    pc.addTrack(track, localStream.current);
                }
            });
        }

        // Handle incoming ICE candidates
        pc.onicecandidate = (event) => {
            if (event.candidate && currentUser) {
                const callId = useChatStore.getState().activeCall?.id;
                sendSignalingMessage({
                    type: 'ice_candidate',
                    sender_id: currentUser.id,
                    receiver_id: remoteUserId,
                    candidate: event.candidate.toJSON(),
                    call_id: callId
                });
            }
        };

        // Handle incoming media streams
        pc.ontrack = (event) => {
            remoteStream.current = event.streams[0];
            // Dispatch custom event to notify UI components
            window.dispatchEvent(new CustomEvent('webrtc_remote_stream', { detail: event.streams[0] }));
        };

        pc.oniceconnectionstatechange = () => {
             if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
                 endCall(false);
             }
        };

        return pc;
    }, [currentUser, sendSignalingMessage]);

    // End an active call - defined early so it can be used in setupPeerConnection and handleSignal
    const endCall = useCallback((emitEndSignal: boolean = true) => {
        const currentActiveCall = useChatStore.getState().activeCall;
        const currentUser = useChatStore.getState().currentUser;
        
        if (currentUser && currentActiveCall && currentActiveCall.status !== 'ended' && emitEndSignal) {
             sendSignalingMessage({
                type: 'call_end',
                sender_id: currentUser.id,
                receiver_id: currentActiveCall.remoteUser.id,
                call_id: currentActiveCall.id // Send back the DB call_id
            });
        }

        // Clear candidates queue
        pendingCandidates.current = [];

        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }
        
        if (remoteStream.current) {
             remoteStream.current.getTracks().forEach(track => track.stop());
             remoteStream.current = null;
        }

        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        // Notify UI to clear video streams
        window.dispatchEvent(new CustomEvent('webrtc_remote_stream', { detail: null }));
        window.dispatchEvent(new CustomEvent('webrtc_local_stream', { detail: null }));

        if (currentActiveCall) {
            setActiveCall(null);
        }
    }, [sendSignalingMessage, setActiveCall]);


    // Start a call
    const startCall = useCallback(async (remoteUser: User, isVideo: boolean = true) => {
        if (!currentUser) return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
            localStream.current = stream;
            window.dispatchEvent(new CustomEvent('webrtc_local_stream', { detail: stream }));

            setActiveCall({
                id: Date.now().toString(),
                remoteUser,
                status: 'outgoing',
                isAudioOnly: !isVideo
            });

            const pc = setupPeerConnection(remoteUser.id);
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            sendSignalingMessage({
                type: 'call_offer',
                sender_id: currentUser.id,
                receiver_id: remoteUser.id,
                sdp: offer
            });
        } catch (error) {
            console.error('Error starting call:', error);
            alert('Could not access camera/microphone. Please check permissions.');
            setActiveCall(null);
        }
    }, [currentUser, setupPeerConnection, sendSignalingMessage, setActiveCall]);

    // Accept an incoming call
    const acceptCall = useCallback(async (isVideo: boolean = true) => {
        const currentActiveCall = useChatStore.getState().activeCall;
        if (!currentUser || !currentActiveCall || currentActiveCall.status !== 'incoming') return;
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: isVideo });
            localStream.current = stream;
            window.dispatchEvent(new CustomEvent('webrtc_local_stream', { detail: stream }));

            let pc = peerConnection.current;
            if (!pc) {
                pc = setupPeerConnection(currentActiveCall.remoteUser.id);
            } else {
                 localStream.current.getTracks().forEach(track => {
                    if (localStream.current && pc) {
                        pc.addTrack(track, localStream.current);
                    }
                });
            }

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            sendSignalingMessage({
                type: 'call_answer',
                sender_id: currentUser.id,
                receiver_id: currentActiveCall.remoteUser.id,
                sdp: answer,
                call_id: currentActiveCall.id
            });

            setActiveCall({ ...currentActiveCall, status: 'connected' });
        } catch (error) {
            console.error('Error accepting call:', error);
            rejectCall();
        }
    }, [currentUser, setupPeerConnection, sendSignalingMessage, setActiveCall]);

    // Reject an incoming call
    const rejectCall = useCallback(() => {
        const currentActiveCall = useChatStore.getState().activeCall;
        if (!currentUser || !currentActiveCall) return;

        sendSignalingMessage({
            type: 'call_reject',
            sender_id: currentUser.id,
            receiver_id: currentActiveCall.remoteUser.id,
            call_id: currentActiveCall.id
        });

        endCall(false);
    }, [currentUser, sendSignalingMessage, endCall]);

    // Listen to custom WebRTC signals from useWebSocket
    useEffect(() => {
        const handleSignal = async (e: Event) => {
            const data = (e as CustomEvent<SignalingEvent>).detail;
            
            // Re-fetch current state to avoid stale closures in event listener
            const store = useChatStore.getState();
            const cu = store.currentUser;
            const ca = store.activeCall;
            const uList = store.users;

            if (!cu) return;

            if (data.type === 'call_offer') {
                const caller = uList.find(u => u.id === data.sender_id);
                if (!caller || ca) {
                    if (caller) {
                        sendSignalingMessage({ type: 'call_reject', sender_id: cu.id, receiver_id: caller.id });
                    }
                    return;
                }

                // The backend sends `call_id` back in the signaling payload
                store.setActiveCall({
                    id: data.call_id?.toString() || Date.now().toString(),
                    remoteUser: caller,
                    status: 'incoming',
                    isAudioOnly: false // Will update based on answer
                });

                const pc = setupPeerConnection(caller.id);
                if (data.sdp) {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    
                    // Process any candidates that arrived early
                    while (pendingCandidates.current.length > 0) {
                        const candidate = pendingCandidates.current.shift();
                        if (candidate) {
                            try {
                                await pc.addIceCandidate(new RTCIceCandidate(candidate));
                            } catch (e) {
                                console.error("Error adding queued candidate", e);
                            }
                        }
                    }
                }
            }
            
            else if (data.type === 'call_answer' && peerConnection.current) {
                if (data.sdp) {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    if (ca) {
                        // Inherit the database call_id from the backend response if present
                        const dbCallId = data.call_id?.toString() || ca.id;
                        store.setActiveCall({ ...ca, id: dbCallId, status: 'connected' });
                    }

                    // Process early candidates
                    while (pendingCandidates.current.length > 0) {
                        const candidate = pendingCandidates.current.shift();
                        if (candidate) {
                            try {
                                await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                            } catch (e) {
                                console.error("Error adding queued candidate", e);
                            }
                        }
                    }
                }
            }
            
            else if (data.type === 'ice_candidate') {
                if (data.candidate) {
                     if (peerConnection.current && peerConnection.current.remoteDescription) {
                         try {
                             await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                         } catch (err) {
                             console.error('Error adding received ice candidate', err);
                         }
                     } else {
                         // Queue candidate until remote description is set
                         console.warn("Queuing ICE candidate because remote description is not set yet");
                         pendingCandidates.current.push(data.candidate as RTCIceCandidateInit);
                     }
                }
            }

            else if (data.type === 'call_reject' || data.type === 'call_end') {
                endCall(false);
            }
        };

        window.addEventListener('webrtc_signal', handleSignal);
        return () => window.removeEventListener('webrtc_signal', handleSignal);
    }, [setupPeerConnection, sendSignalingMessage, endCall]);

    const toggleAudio = useCallback(() => {
         if (localStream.current) {
             const audioTrack = localStream.current.getAudioTracks()[0];
             if (audioTrack) {
                 audioTrack.enabled = !audioTrack.enabled;
                 return audioTrack.enabled;
             }
         }
         return false;
    }, []);

    const toggleVideo = useCallback(() => {
         if (localStream.current) {
             const videoTrack = localStream.current.getVideoTracks()[0];
             if (videoTrack) {
                 videoTrack.enabled = !videoTrack.enabled;
                 return videoTrack.enabled;
             }
         }
         return false;
    }, []);

    return {
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleAudio,
        toggleVideo
    };
}

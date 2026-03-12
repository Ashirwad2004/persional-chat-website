import { useState, useCallback } from 'react';
import { usersApi } from '../api/users';
import { useChatStore } from '../store/chatStore';
import { useNavigate } from 'react-router-dom';

export function useUsers() {
    const [isLoading, setIsLoading] = useState(false);
    const { setCurrentUser, setUsers } = useChatStore();
    const navigate = useNavigate();

    const fetchInitialUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const [me, allUsers] = await Promise.all([
                usersApi.getCurrentUser(),
                usersApi.getAllUsers()
            ]);
            
            setCurrentUser(me);
            setUsers(allUsers);
        } catch (error) {
            console.error("Failed to fetch users", error);
            navigate('/login');
        } finally {
            setIsLoading(false);
        }
    }, [setCurrentUser, setUsers, navigate]);

    const uploadAvatar = async (file: File) => {
        try {
            const updatedUser = await usersApi.uploadAvatar(file);
            setCurrentUser(updatedUser);
        } catch (error) {
            console.error("Failed to upload avatar", error);
        }
    };

    return { fetchInitialUsers, uploadAvatar, isLoading };
}

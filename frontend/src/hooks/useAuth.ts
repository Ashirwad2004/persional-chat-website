import { useState } from 'react';
import { authApi } from '../api/auth';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await authApi.login(email, password);
            localStorage.setItem('access_token', data.access_token);
            navigate('/chat');
            return true;
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Login failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await authApi.signup(email, password);
            navigate('/login', { state: { message: 'Account created successfully! Please log in.' } });
            return true;
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Signup failed');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        navigate('/login');
    };

    return { login, signup, logout, isLoading, error };
}

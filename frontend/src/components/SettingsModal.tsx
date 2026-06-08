import { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { useUsers } from '../hooks/useUsers';
import { useAuth } from '../hooks/useAuth';
import { API_BASE_URL } from '../config';

export default function SettingsModal() {
    const { currentUser, wallpaper, setWallpaper, isSettingsOpen, setSettingsOpen } = useChatStore();
    const { uploadAvatar, isLoading: isAvatarLoading } = useUsers();
    const { logout } = useAuth();
    
    const [darkMode, setDarkMode] = useState(() => {
        return document.documentElement.classList.contains('dark') || 
               localStorage.getItem('theme') === 'dark';
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await uploadAvatar(file);
        }
    };

    if (!isSettingsOpen) return null;

    const initials = currentUser?.email?.substring(0, 2).toUpperCase() || 'U';

    const wallpaperOptions = [
        { id: 'default', name: 'Standard Theme', colorClass: 'bg-wa-chat-light dark:bg-wa-chat-dark border-slate-300 dark:border-slate-800' },
        { id: 'lavender', name: 'Soft Lavender', colorClass: 'bg-[#efe6f7] dark:bg-[#211b27] border-purple-200 dark:border-purple-900/60' },
        { id: 'sage', name: 'Calming Sage', colorClass: 'bg-[#e3eae4] dark:bg-[#1a231d] border-emerald-100 dark:border-emerald-950/60' },
        { id: 'teal', name: 'Deep Teal', colorClass: 'bg-[#e0f2f1] dark:bg-[#072421] border-teal-200 dark:border-teal-900/60' },
        { id: 'slate', name: 'Slate Steel', colorClass: 'bg-[#e2e8f0] dark:bg-[#1e293b] border-slate-300 dark:border-slate-800' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-wa-panel-dark border border-slate-200 dark:border-slate-800/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[80vh] transition-all">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-wa-header-light dark:bg-wa-header-dark">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[24px]">settings</span>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Settings</h2>
                    </div>
                    <button 
                        onClick={() => setSettingsOpen(false)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Profile Section */}
                    <div className="flex flex-col items-center text-center gap-4 bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-100 dark:border-slate-800/40">
                        <div className="relative group cursor-pointer w-24 h-24">
                            <input 
                                type="file" 
                                accept="image/*" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                onChange={handleAvatarChange} 
                                disabled={isAvatarLoading}
                            />
                            <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-3xl text-slate-500 dark:text-slate-400 overflow-hidden shadow-inner border border-slate-300 dark:border-slate-800">
                                {currentUser?.profile_picture_url ? (
                                    <img src={`${API_BASE_URL}${currentUser.profile_picture_url}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    initials
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <span className="material-symbols-outlined text-white text-[24px]">photo_camera</span>
                            </div>
                            {isAvatarLoading && (
                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-[280px]">
                                {currentUser?.email}
                            </h3>
                            <p className="text-xs text-slate-400">Click avatar to update profile photo</p>
                        </div>
                    </div>

                    {/* Dark Mode Option */}
                    <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60 pb-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-500">dark_mode</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Dark Mode</span>
                                <span className="text-xs text-slate-400">Switch application dark mode</span>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Wallpaper Option */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-500">palette</span>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Chat Wallpaper</span>
                                <span className="text-xs text-slate-400">Choose background aesthetic wallpaper</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-5 gap-2 pt-1">
                            {wallpaperOptions.map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => setWallpaper(option.id)}
                                    className={`aspect-square rounded-xl border-2 flex items-center justify-center relative overflow-hidden transition-all hover:scale-105 ${option.colorClass} ${wallpaper === option.id ? 'border-primary ring-2 ring-primary/20 scale-105' : 'hover:border-slate-400'}`}
                                    title={option.name}
                                >
                                    {wallpaper === option.id && (
                                        <span className="material-symbols-outlined text-primary font-bold text-[18px]">check_circle</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between gap-4">
                    <button
                        onClick={logout}
                        className="flex items-center gap-2 text-red-500 hover:text-red-600 dark:hover:text-red-400 text-sm font-semibold transition-colors px-3 py-2 rounded-xl hover:bg-red-500/10"
                    >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        <span>Sign Out</span>
                    </button>
                    <button
                        onClick={() => setSettingsOpen(false)}
                        className="bg-primary hover:bg-primary/90 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md transition-colors"
                    >
                        Save & Close
                    </button>
                </div>
            </div>
        </div>
    );
}

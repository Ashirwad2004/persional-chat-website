import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState('');

    const { signup, isLoading, error: authError } = useAuth();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (password !== confirmPassword) {
            setLocalError("Passwords do not match");
            return;
        }

        await signup(email, password);
    };

    const displayError = localError || authError;

    return (
        <div className="relative flex min-h-screen w-full flex-col @container overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            <div className="flex min-h-screen w-full flex-row">
                {/* Left Side: Aesthetic Visual */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/10">
                    <div className="absolute inset-0 bg-cover bg-center bg-login-image"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/60 to-transparent"></div>

                    <div className="relative z-10 flex flex-col justify-between p-16 w-full h-full text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-lg">
                                <span className="material-symbols-outlined text-3xl">forum</span>
                            </div>
                            <span className="text-2xl font-bold tracking-tight">NexusChat</span>
                        </div>

                        <div className="max-w-md">
                            <h2 className="text-4xl font-extrabold leading-tight mb-4">Join the conversation today.</h2>
                            <p className="text-lg text-white/80">Experience the next generation of personal messaging. Clean, secure, and built for your community.</p>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex -space-x-3">
                                <img className="h-10 w-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcdQ5n6Tdq2GjdDMU0enkHTHdCvqm0_evFen1JsPNgEdz5IMuKC7kpq325qyRL8KJgsWJowLPnLURmd6YboOvHycjDdI8WTmMryV4S0z1AoLxpPVNkiPZEVgMNTpVUc_02OocaYM4z_-JFG3onyqlLvRN3_olAFNEsURin9yYSJdbsYe6Rc78ya0MFX093IpEfltu3V8l9HCdwMLEv81kj0oZZ4V4If2df_XkOwX-6HEl21jSZe97jEWlZsEfzvCKOaKOESfgysXb9" alt="User 1" />
                                <img className="h-10 w-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaz_X-zq70qCYvbhqbf3McWeeVnwO1ZyKPkk9zLx_MR9n9HeifAigmb3WV5IKgtUcrcurG8Ys52P2wiIdQd9fY8KW0DArqIwFARvIHFAnGut7gT31dVoiaotP_nz9mIu3DYuSqn-NHXkpRDLfIjQvpKOrmEKye4_XHCnlp9AbyVU-dbQSIFW1dCrkAz-PWWve_oghtQwRIqCuWE845UfGgPppRhOabsWcOvHV43dfhLzDK-rL-nSiwOBQYDjlAXKsRSJRLpyrT5fVF" alt="User 2" />
                                <img className="h-10 w-10 rounded-full border-2 border-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-ArZd6byCqCtvvcGZeNyvxlE8ar3H3xVPx8IJCmbFJ-dq3fkmnrOo3LfKMLL943fx8s3dpCv6xw3mysGiB0K_KM9GC4uOfotCuQt2v1P2kJZIAIfCHdj-hxQl8ojYCnPtV5YdL-N1FINFOJPs76DBhmW6LK7ivZbhjlE3g4JWEeMQOI0E24zts5b_t_Hy3_tX4yx0pIsAM27c1cgIy0DjzupP_dF8imQVoAihi72bMHrrymhwMc590sQiR4H0-c2zu7YsVuFx2F4A" alt="User 3" />
                            </div>
                            <div className="text-sm font-medium flex items-center">
                                Joined by 10k+ people this week
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Signup Area */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white dark:bg-background-dark">
                    <div className="w-full max-w-[440px] flex flex-col gap-8">
                        {/* Welcome Header */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">
                                Create an Account
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                                Sign up to get started with NexusChat.
                            </p>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSignup} className="flex flex-col gap-5">
                            {/* Social Login */}
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <button type="button" className="flex items-center justify-center gap-2 h-12 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow">
                                    <img className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGHCFMbYrNqOgUst9yF5yNFM-qafn5bwop2f43KTsyR4OvURZAyoAFKmm-3LEX7glxycXSCjExBgttRTj9S_uR-Zp_5tRGL61XL5MYf8fJJlWP2jGcHyNBvtFcim13ZTnGQHRaZafE_K5IPKH4nyVqUQ79z10k_CbbfKr9lzBo8tXDRU9QLEz3Kr271ECnAGz7xK-Gu6cOh4nLj2C6bRMxHM-cfTlr3prJPvkqlRsqqR8ExP8XDth94ewG1UdSajQbZqu45gqTjetX" alt="Google" />
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
                                </button>
                                <button type="button" className="flex items-center justify-center gap-2 h-12 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all hover:-translate-y-0.5 shadow-sm hover:shadow">
                                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">ios</span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Apple</span>
                                </button>
                            </div>

                            <div className="relative flex items-center justify-center">
                                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                                <span className="absolute bg-white dark:bg-background-dark px-4 text-xs font-medium text-slate-400 uppercase tracking-widest">or sign up with email</span>
                            </div>

                            {displayError && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-medium border border-red-200 dark:border-red-500/20">
                                    {displayError}
                                </div>
                            )}

                            {/* Input: Email */}
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex w-full rounded-xl border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 h-14 pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900/60"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Input: Password */}
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">lock_open</span>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex w-full rounded-xl border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 h-14 pl-12 pr-12 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900/60"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Input: Confirm Password */}
                            <div className="flex flex-col gap-2 relative">
                                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold ml-1">Confirm Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">lock_open</span>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="flex w-full rounded-xl border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/40 h-14 pl-12 pr-12 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base shadow-sm hover:bg-slate-50 dark:hover:bg-slate-900/60"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <button type="submit" disabled={isLoading} className="mt-2 flex w-full cursor-pointer items-center justify-center rounded-xl h-14 bg-gradient-to-r from-primary to-primary/90 text-white text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none">
                                {isLoading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </form>

                        {/* Footer Sign Up */}
                        <div className="text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Already have an account?
                                <Link to="/login" className="text-primary font-bold hover:underline ml-1">Sign in</Link>
                            </p>
                        </div>

                        {/* Bottom Policy */}
                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-center gap-x-6 gap-y-2">
                            <a href="#" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Privacy Policy</a>
                            <a href="#" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Terms of Service</a>
                            <a href="#" className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">Help Center</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

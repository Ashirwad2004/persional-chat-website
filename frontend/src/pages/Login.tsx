import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login attempt', { email, password });
        // TODO: implement actual auth
    };

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
                            <h2 className="text-4xl font-extrabold leading-tight mb-4">Connecting people in a simpler way.</h2>
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

                {/* Right Side: Login Area */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white dark:bg-background-dark">
                    <div className="w-full max-w-[440px] flex flex-col gap-8">
                        {/* Welcome Header */}
                        <div className="flex flex-col gap-2">
                            <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-tight">
                                Welcome Back!
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 text-base font-normal">
                                Please enter your details to stay connected with your community.
                            </p>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleLogin} className="flex flex-col gap-5">
                            {/* Social Login */}
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                <button type="button" className="flex items-center justify-center gap-2 h-12 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <img className="w-5 h-5" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGHCFMbYrNqOgUst9yF5yNFM-qafn5bwop2f43KTsyR4OvURZAyoAFKmm-3LEX7glxycXSCjExBgttRTj9S_uR-Zp_5tRGL61XL5MYf8fJJlWP2jGcHyNBvtFcim13ZTnGQHRaZafE_K5IPKH4nyVqUQ79z10k_CbbfKr9lzBo8tXDRU9QLEz3Kr271ECnAGz7xK-Gu6cOh4nLj2C6bRMxHM-cfTlr3prJPvkqlRsqqR8ExP8XDth94ewG1UdSajQbZqu45gqTjetX" alt="Google" />
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Google</span>
                                </button>
                                <button type="button" className="flex items-center justify-center gap-2 h-12 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <span className="material-symbols-outlined text-slate-700 dark:text-slate-300">ios</span>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Apple</span>
                                </button>
                            </div>

                            <div className="relative flex items-center justify-center">
                                <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                                <span className="absolute bg-white dark:bg-background-dark px-4 text-xs font-medium text-slate-400 uppercase tracking-widest">or continue with email</span>
                            </div>

                            {/* Input: Email */}
                            <div className="flex flex-col gap-2">
                                <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-14 pl-12 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            {/* Input: Password */}
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-slate-700 dark:text-slate-300 text-sm font-semibold">Password</label>
                                    <a href="#" className="text-primary text-xs font-bold hover:underline">Forgot password?</a>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                        <span className="material-symbols-outlined text-[20px]">lock_open</span>
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="flex w-full rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 h-14 pl-12 pr-12 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all text-base"
                                        placeholder="••••••••"
                                    />
                                    <button type="button" className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors">
                                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                                    </button>
                                </div>
                            </div>

                            {/* Checkbox */}
                            <div className="flex items-center justify-between py-1">
                                <label className="flex items-center gap-3 cursor-pointer group">
                                    <input type="checkbox" className="h-5 w-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary/20 bg-transparent" />
                                    <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Keep me logged in</span>
                                </label>
                            </div>

                            {/* Action Button */}
                            <button type="submit" className="flex w-full cursor-pointer items-center justify-center rounded-xl h-14 bg-primary text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.01] active:scale-[0.98]">
                                Sign In
                            </button>
                        </form>

                        {/* Footer Sign Up */}
                        <div className="text-center">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Don't have an account?
                                <Link to="/signup" className="text-primary font-bold hover:underline ml-1">Create an account</Link>
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

import { Link } from 'react-router-dom';

const Landing = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased h-[100vh]">
            <div className="relative flex min-h-screen flex-col overflow-x-hidden gradient-bg">
                <div className="flex h-full grow flex-col">
                    <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200/50 dark:border-slate-800/50 px-6 py-4 lg:px-40 backdrop-blur-md sticky top-0 z-50">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-white">
                                <span className="material-symbols-outlined text-2xl">auto_awesome</span>
                            </div>
                            <h2 className="text-slate-900 dark:text-white text-xl font-extrabold tracking-tight">NexusChat</h2>
                        </div>
                        <div className="flex flex-1 justify-end gap-8 items-center">
                            <nav className="hidden md:flex items-center gap-9">
                                <a className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors" href="#">Features</a>
                                <a className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors" href="#">Security</a>
                                <a className="text-slate-600 dark:text-slate-400 text-sm font-semibold hover:text-primary transition-colors" href="#">Pricing</a>
                            </nav>
                            <div className="flex items-center gap-4">
                                <Link to="/login" className="flex min-w-[84px] cursor-pointer items-center justify-center rounded-xl h-10 px-5 bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                                    <span>Login</span>
                                </Link>
                                <div className="hidden sm:block size-10 rounded-full border-2 border-slate-100 dark:border-slate-800 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCkXKdRWmW9VaC4H26W7YwU6d5uv5VxpA18iG4X4nhMR4fNb4zJsYU11puUTuMZlAwmbfuXOSuRGn4F7opF2E1Zmjqn4cv1C07tf3SH4bFtR-PcZCcxHQFvq-v9ARTgsd-mmzmrnPt23ltTgePXXHVly8-MD9PUDIDlTpGZb9I26j5YstX6bQr2lHkv1yRu7D43MEcxPS6HEoL_dsRQtr4OwfaZHv5pmrAmaSWg_ptcTgm5-RK3JfR1PEdbEfp77DHvwZhN3ERBzmqb')" }}></div>
                            </div>
                        </div>
                    </header>
                    <main className="flex-1">
                        <section className="px-6 lg:px-40 py-12 lg:py-24">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div className="flex flex-col gap-8">
                                    <div className="flex flex-col gap-4">
                                        <span className="text-primary font-bold tracking-widest text-xs uppercase bg-primary/10 w-fit px-3 py-1 rounded-full">New: Version 2.0 is here</span>
                                        <h1 className="text-slate-900 dark:text-white text-5xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight">
                                            Connect with your world, <span className="text-primary">beautifully.</span>
                                        </h1>
                                        <p className="text-slate-600 dark:text-slate-400 text-lg lg:text-xl font-medium leading-relaxed max-w-lg">
                                            Experience a personal chat platform designed with aesthetics, privacy, and seamless connection at its core.
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        <Link to="/signup" className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-primary text-white text-base font-bold shadow-xl shadow-primary/30 hover:scale-[1.02] transition-transform">
                                            Get Started
                                        </Link>
                                        <button className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                            Learn More
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-500 text-sm">
                                        <div className="flex -space-x-2">
                                            <div className="size-8 rounded-full border-2 border-white dark:border-slate-900 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnqQRqIBn79ST0FMUpr5SsiGto31794zL5WNoGdYhAlu18z-Ht9xxi1CKv_dSE1e5EozitF719sAoDP6pHZzf5HkECMNLlC6Hafls_iMPUIcxMVajvjOLW8z35YnidEjnr2c2yBKZNVLousnN1b-dqbPQpTIrDPOaNsdM92IwbJMKMvJM3XZkfLw-30AZMQ7jhNgBdjSNRB0Jb0qh3aVW6Iv6ZpEfSWAox2xYdd4TMtD0hZZVdbhQd9EGXaB6z678TtFsc1vIYJyQn')" }}></div>
                                            <div className="size-8 rounded-full border-2 border-white dark:border-slate-900 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6x8dE7eFH8mwvORwhdiSbK911iR_QoaelTC8B48RTDTv167TDRCvOA2B31538deX-n4tRT0Tm51k-IDsBZZRw7vb3dcts_OcHwUj9m6W6fmevoX8gsUiBpGGBNe6KhhBXj-P8UnMOAJTDCDy0SHDUuewK_GGnIl9YNu_1L9gb3pKb-u7NFXh86QJYbi6PUeV6kQ0qiAlGXiGYiZpe0zHmnzENkAuOCFoogQUYEnFDk6Qd9FGc-aRTC9dXo1JOvo-XMIG1EK8Se8p9')" }}></div>
                                            <div className="size-8 rounded-full border-2 border-white dark:border-slate-900 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD626Nulx7Ayzqd23djocXiwCKuusHiKP23zMwHXfdHZMAPHsfijjwT0VtaaOAmy8mCBKH4EPHnZDpgk-NFNOJQ15VruIlBOV2TjRiU9rlYZOBRPtD6WWalb8Sb6UBhOLUREj121QhFQkDDmGm7sr21KhjmN9yYugJFcG9xKbq7ohFZnTBqK6BhU19W8pAy09DvE0DI0yrmKbBA3LVZI3KN3LFJTgzUDZQ9ZORqNIyxZIq6CQh9GqAkzT7vxsJ52o95mjZITC8NsFTN')" }}></div>
                                        </div>
                                        <span>Joined by 50,000+ users worldwide</span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -inset-10 bg-primary/20 blur-[100px] rounded-full opacity-50"></div>
                                    <div className="relative bg-slate-900 rounded-2xl p-2 shadow-2xl border border-slate-700/50 aspect-video w-full overflow-hidden">
                                        <div className="w-full h-full bg-[#fdfbfb] dark:bg-slate-900 rounded-lg overflow-hidden flex">
                                            <div className="w-20 lg:w-48 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-100 dark:border-slate-800 flex flex-col p-4 gap-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center"><span className="material-symbols-outlined text-sm">auto_awesome</span></div>
                                                    <div className="hidden lg:block h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                </div>
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnqQRqIBn79ST0FMUpr5SsiGto31794zL5WNoGdYhAlu18z-Ht9xxi1CKv_dSE1e5EozitF719sAoDP6pHZzf5HkECMNLlC6Hafls_iMPUIcxMVajvjOLW8z35YnidEjnr2c2yBKZNVLousnN1b-dqbPQpTIrDPOaNsdM92IwbJMKMvJM3XZkfLw-30AZMQ7jhNgBdjSNRB0Jb0qh3aVW6Iv6ZpEfSWAox2xYdd4TMtD0hZZVdbhQd9EGXaB6z678TtFsc1vIYJyQn')" }}></div>
                                                        <div className="hidden lg:block h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                    </div>
                                                    <div className="flex items-center gap-3 opacity-60">
                                                        <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuA6x8dE7eFH8mwvORwhdiSbK911iR_QoaelTC8B48RTDTv167TDRCvOA2B31538deX-n4tRT0Tm51k-IDsBZZRw7vb3dcts_OcHwUj9m6W6fmevoX8gsUiBpGGBNe6KhhBXj-P8UnMOAJTDCDy0SHDUuewK_GGnIl9YNu_1L9gb3pKb-u7NFXh86QJYbi6PUeV6kQ0qiAlGXiGYiZpe0zHmnzENkAuOCFoogQUYEnFDk6Qd9FGc-aRTC9dXo1JOvo-XMIG1EK8Se8p9')" }}></div>
                                                        <div className="hidden lg:block h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                    </div>
                                                    <div className="flex items-center gap-3 opacity-60">
                                                        <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD626Nulx7Ayzqd23djocXiwCKuusHiKP23zMwHXfdHZMAPHsfijjwT0VtaaOAmy8mCBKH4EPHnZDpgk-NFNOJQ15VruIlBOV2TjRiU9rlYZOBRPtD6WWalb8Sb6UBhOLUREj121QhFQkDDmGm7sr21KhjmN9yYugJFcG9xKbq7ohFZnTBqK6BhU19W8pAy09DvE0DI0yrmKbBA3LVZI3KN3LFJTgzUDZQ9ZORqNIyxZIq6CQh9GqAkzT7vxsJ52o95mjZITC8NsFTN')" }}></div>
                                                        <div className="hidden lg:block h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex-1 flex flex-col">
                                                <header className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center px-6 justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className="size-8 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnqQRqIBn79ST0FMUpr5SsiGto31794zL5WNoGdYhAlu18z-Ht9xxi1CKv_dSE1e5EozitF719sAoDP6pHZzf5HkECMNLlC6Hafls_iMPUIcxMVajvjOLW8z35YnidEjnr2c2yBKZNVLousnN1b-dqbPQpTIrDPOaNsdM92IwbJMKMvJM3XZkfLw-30AZMQ7jhNgBdjSNRB0Jb0qh3aVW6Iv6ZpEfSWAox2xYdd4TMtD0hZZVdbhQd9EGXaB6z678TtFsc1vIYJyQn')" }}></div>
                                                        <span className="text-sm font-bold">Aria Thompson</span>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <span className="material-symbols-outlined text-slate-400 text-lg">search</span>
                                                        <span className="material-symbols-outlined text-slate-400 text-lg">more_horiz</span>
                                                    </div>
                                                </header>
                                                <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto">
                                                    <div className="max-w-[70%] bg-[#e2e8f0]/30 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                                                        Hey! Have you seen the new aesthetic updates? 🌿
                                                    </div>
                                                    <div className="max-w-[70%] bg-primary text-white p-3 rounded-2xl rounded-tr-none text-sm self-end shadow-md">
                                                        Yes! The sage and lavender themes look amazing. ✨
                                                    </div>
                                                    <div className="max-w-[70%] bg-[#e2e8f0]/30 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-sm leading-relaxed">
                                                        I'm using the soft sage one right now, it's so calming.
                                                    </div>
                                                </div>
                                                <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                                                    <div className="bg-slate-100 dark:bg-slate-800 h-10 rounded-xl flex items-center px-4 gap-3">
                                                        <span className="material-symbols-outlined text-slate-400 text-xl">sentiment_satisfied</span>
                                                        <div className="h-2 w-24 bg-slate-300 dark:bg-slate-600 rounded"></div>
                                                        <span className="material-symbols-outlined text-primary text-xl ml-auto">send</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-10 -right-6 lg:-right-12 w-[160px] lg:w-[220px] aspect-[9/19] bg-slate-950 rounded-[2.5rem] border-[6px] border-slate-900 shadow-2xl overflow-hidden hidden sm:block">
                                        <div className="w-full h-full bg-[#fdfbfb] dark:bg-slate-900 relative flex flex-col">
                                            <div className="h-16 flex items-end justify-center pb-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-100 dark:border-slate-800">
                                                <div className="flex flex-col items-center">
                                                    <div className="size-6 rounded-full bg-cover bg-center mb-1" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnqQRqIBn79ST0FMUpr5SsiGto31794zL5WNoGdYhAlu18z-Ht9xxi1CKv_dSE1e5EozitF719sAoDP6pHZzf5HkECMNLlC6Hafls_iMPUIcxMVajvjOLW8z35YnidEjnr2c2yBKZNVLousnN1b-dqbPQpTIrDPOaNsdM92IwbJMKMvJM3XZkfLw-30AZMQ7jhNgBdjSNRB0Jb0qh3aVW6Iv6ZpEfSWAox2xYdd4TMtD0hZZVdbhQd9EGXaB6z678TtFsc1vIYJyQn')" }}></div>
                                                    <span className="text-[10px] font-bold">Aria Thompson</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 p-3 flex flex-col gap-3">
                                                <div className="max-w-[85%] bg-[#f1f5f9] dark:bg-slate-800 p-2 rounded-xl rounded-tl-none text-[10px]">
                                                    Wait till you see the customization panel! 🎨
                                                </div>
                                                <div className="max-w-[85%] bg-primary text-white p-2 rounded-xl rounded-tr-none text-[10px] self-end">
                                                    Can't wait!
                                                </div>
                                                <div className="mt-auto bg-slate-100 dark:bg-slate-800 h-8 rounded-full flex items-center px-3 gap-2">
                                                    <div className="h-1 w-12 bg-slate-300 dark:bg-slate-600 rounded"></div>
                                                    <span className="material-symbols-outlined text-primary text-sm ml-auto">send</span>
                                                </div>
                                            </div>
                                            <div className="h-5 flex items-center justify-center">
                                                <div className="w-16 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="px-6 lg:px-40 py-20 bg-white/40 dark:bg-slate-900/40">
                            <div className="flex flex-col gap-12">
                                <div className="flex flex-col gap-4 text-center items-center">
                                    <h2 className="text-slate-900 dark:text-white text-3xl lg:text-4xl font-bold tracking-tight">Experience the Nexus Difference</h2>
                                    <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                                        Designed for modern communication with a focus on beauty, security, and effortless user experience.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 p-8 hover:shadow-xl transition-shadow group">
                                        <div className="size-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-3xl">verified_user</span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-slate-900 dark:text-white text-xl font-bold">End-to-End Encryption</h3>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                                Your conversations are yours alone, protected by industry-leading security protocols that keep your data private.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 p-8 hover:shadow-xl transition-shadow group">
                                        <div className="size-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-3xl">palette</span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-slate-900 dark:text-white text-xl font-bold">Theme Customization</h3>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                                Express yourself with a wide range of beautiful themes, custom gradients, and personalized chat aesthetics.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-6 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 p-8 hover:shadow-xl transition-shadow group">
                                        <div className="size-14 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined text-3xl">videocam</span>
                                        </div>
                                        <div className="flex flex-col gap-3">
                                            <h3 className="text-slate-900 dark:text-white text-xl font-bold">High-Quality Video</h3>
                                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                                Crystal clear 4K video and spatial audio quality for your most important moments with friends and family.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                        <section className="px-6 lg:px-40 py-24">
                            <div className="relative bg-primary rounded-[2.5rem] p-12 lg:p-20 overflow-hidden">
                                <div className="absolute top-0 right-0 w-1/3 h-full bg-white/10 skew-x-[-20deg] translate-x-1/2"></div>
                                <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
                                    <h2 className="text-white text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                                        Ready to start chatting?
                                    </h2>
                                    <p className="text-white/80 text-lg lg:text-xl font-medium">
                                        Join thousands of users who have already switched to a more beautiful way of connecting. Your first chat is just seconds away.
                                    </p>
                                    <div className="flex justify-center w-full">
                                        <Link to="/signup" className="flex min-w-[200px] cursor-pointer items-center justify-center rounded-xl h-14 px-10 bg-white text-primary text-lg font-bold hover:scale-[1.05] transition-transform shadow-2xl">
                                            Create Free Account
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                    <footer className="px-6 lg:px-40 py-16 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-12">
                            <div className="flex flex-col gap-4 max-w-xs">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-lg bg-primary text-white flex items-center justify-center">
                                        <span className="material-symbols-outlined text-xl">auto_awesome</span>
                                    </div>
                                    <h2 className="text-slate-900 dark:text-white text-lg font-bold">NexusChat</h2>
                                </div>
                                <p className="text-slate-500 text-sm">Designing the future of communication, one message at a time. Aesthetic, private, and secure.</p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
                                <div className="flex flex-col gap-4">
                                    <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">Product</h4>
                                    <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">Overview</a>
                                    <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">Features</a>
                                    <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">Security</a>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">Company</h4>
                                    <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">About</a>
                                    <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">Careers</a>
                                    <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">Blog</a>
                                </div>
                                <div className="flex flex-col gap-4">
                                    <h4 className="text-slate-900 dark:text-white font-bold text-sm uppercase tracking-wider">Support</h4>
                                    <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">Help Center</a>
                                    <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">Privacy</a>
                                    <a className="text-slate-500 hover:text-primary transition-colors text-sm" href="#">Terms</a>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800 gap-4">
                            <p className="text-slate-500 text-sm">© 2023 NexusChat Inc. All rights reserved.</p>
                            <div className="flex items-center gap-6">
                                <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">public</span></a>
                                <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
                                <a className="text-slate-400 hover:text-primary transition-colors" href="#"><span className="material-symbols-outlined">share</span></a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default Landing;

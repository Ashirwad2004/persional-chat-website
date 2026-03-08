module.exports = {
    darkMode: "class",
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#00a884",         // WhatsApp Teal
                "wa-header-light": "#f0f2f5", // Light Header
                "wa-header-dark": "#202c33",  // Dark Header
                "wa-panel-dark": "#111b21",   // Dark Pane Background
                "wa-chat-dark": "#0b141a",    // Dark Chat Background
                "wa-chat-light": "#efeae2",   // Light Chat Background
                "wa-bubble-out-light": "#d9fdd3",
                "wa-bubble-out-dark": "#005c4b",
                "wa-bubble-in-dark": "#202c33",
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.5rem",
                "lg": "1rem",
                "xl": "1.5rem",
                "full": "9999px"
            },
            container: {
                center: true,
                padding: '2rem',
            },
        },
    },
    plugins: [
        require('@tailwindcss/container-queries'),
        require('@tailwindcss/forms'),
    ],
}
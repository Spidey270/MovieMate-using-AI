/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#E50914", // Netflix Red-ish
                secondary: "#141414", // Dark background
                accent: "#46d369", // Success green
            }
        },
    },
    plugins: [],
}

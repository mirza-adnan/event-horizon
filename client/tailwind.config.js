/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent: "#B4DB6D",
        "text-strong": "#F3F4F2",
        "text-weak": "#DADCD6",
        "gray-light": "#A7AAA1",
        "gray-dark": "#41433D",
        fill: "#272824",
        bgr: "#141414",
        danger: {
          DEFAULT: "rgb(255, 156, 156)",
          80: "rgba(255, 156, 156, 0.8)",
          5: "rgba(255, 156, 156, 0.05)",
        },
        info: {
          DEFAULT: "rgb(224, 191, 112)",
          80: "rgba(224, 191, 112, 0.8)",
          5: "rgba(224, 191, 112, 0.05)",
        },
        success: {
          DEFAULT: "rgb(119, 119, 175)",
          80: "rgba(119, 119, 175, 0.8)",
          5: "rgba(119, 119, 175, 0.05)",
        },
      },
    },
  },
  plugins: [],
};

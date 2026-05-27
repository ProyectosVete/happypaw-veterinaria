/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          beige: '#F5F5DC',
          brown: '#AA7229',
          green: '#A3D459',
          darkbrown: '#8B4513',
        }
      }
    },
  },
  plugins: [],
}

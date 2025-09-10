/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff2f0',
          100: '#ffe5e0',
          200: '#ffc2b3',
          300: '#ff9980',
          400: '#f86f4d',
          500: '#f05023',
          600: '#d8431c',
          700: '#b83719',
          800: '#942c14',
          900: '#7a2511',
          950: '#4a150a',
        },
        accent: {
          50: '#f2f2f2',
          100: '#e6e6e6',
          200: '#cccccc',
          300: '#b3b3b3',
          400: '#666666',
          500: '#000000',
          600: '#000000',
          700: '#000000',
          800: '#000000',
          900: '#000000',
          950: '#000000',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // cursor: {
      //   custom: 'url(./src/assets/cursor.png), auto',
      // },
    },
  },
  plugins: [],
};

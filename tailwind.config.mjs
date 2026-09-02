/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#F7F6F3',
        text: '#171717',
        muted: '#737373',
        hairline: '#E6E4DE',
        accent: '#0E7C66',
      },
      maxWidth: {
        'reading': '68ch',
      },
    },
  },
  plugins: [],
}

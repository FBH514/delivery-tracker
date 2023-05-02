/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './src/**/*.html',
        './src/**/*.js',
        './src/**/*.jsx',
        './src/**/*.ts',
        './src/**/*.tsx',
    ],
    theme: {
        screens: {
            'sm': { 'max': '767px'},
            'md': { 'max': '1023px'},
            'lg': { 'max': '1279px'},
            'xl': { 'max': '1535px'}
        },
        extend: {
            fontfamily: {
                sans: ['Oxygen', 'sans-serif'],
                mono: ['Oxygen Mono', 'monospace']
            },
            spacing: {
                '50': '50px'
            }
        },
    },
    plugins: [],
}


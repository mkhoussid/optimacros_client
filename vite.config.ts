import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

export default defineConfig({
	resolve: {
		extensions: ['.ts', '.tsx', '.json'],
		alias: {
			src: '/src',
		},
	},
	envPrefix: 'VITE',
	server: {
		port: 3030,
		open: true,
	},
	plugins: [
		react({
			babel: {
				presets: [],
				babelrc: true,
				configFile: false,
			},
		}),
	],
	build: {
		sourcemap: false,
		emptyOutDir: true,
		outDir: 'dist',
	},
});

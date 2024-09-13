module.exports = {
	apps: [
		{
			name: `temp`,
			script: 'serve dist',
			env: {
				PM2_SERVE_PATH: './dist',
				PM2_SERVE_PORT: 3030,
				PM2_SERVE_SPA: 'true',
				NODE_ENV: 'production',
				VITE_BE_URL: 'http://194.87.111.17:8700',
			},
		},
	],
};

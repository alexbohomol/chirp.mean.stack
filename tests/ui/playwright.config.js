import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    timeout: 30_000,
    retries: 0,
    use: {
        // baseURL: process.env.BASE_URL || 'http://localhost:3000',
        headless: true,
        // viewport: { width: 1280, height: 800 },
        // screenshot: 'only-on-failure',
        // trace: 'on-first-retry',
    },
});

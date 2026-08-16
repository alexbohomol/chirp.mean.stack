import { describe, afterAll, beforeAll, test, expect } from '@playwright/test';
import { DockerComposeUp } from './modules/environment.js';

describe('Landing Page', () => {

    const MONGO_PORT = 57002;
    const APP_PORT = 3002;

    let environment;

    beforeAll(async () => {
        environment = await DockerComposeUp({ MONGO_PORT, APP_PORT });
    });

    afterAll(async () => {
        if (environment) {
            await environment.down();
        }
    }, 30000);

    describe('for anonymouse user', () => {

        test('should redirect to SPA root', async ({ page }) => {

            await page.goto(`http://localhost:${APP_PORT}`);
            await expect(page).toHaveURL(`http://localhost:${APP_PORT}/#/`);
        });

        test('should render chirps', async ({ page }) => {

            await page.goto(`http://localhost:${APP_PORT}`);
            const chirps = page.locator('text=Chirp Feed');
            await expect(chirps).toBeVisible();
        });

        test('should render Login link', async ({ page }) => {

            await page.goto(`http://localhost:${APP_PORT}`);
            const link = page.locator('text=Login');
            await expect(link).toBeVisible();
        });

        test('should render Register link', async ({ page }) => {

            await page.goto(`http://localhost:${APP_PORT}`);
            const link = page.locator('text=Register');
            await expect(link).toBeVisible();
        });
    });
});

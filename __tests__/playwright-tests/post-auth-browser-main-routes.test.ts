import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import globalSetup from '../playwright-tests/__init__';

dotenv.config();

const baseURL = process.env.PLAYWRIGHT_HOST;
const username = process.env.PLAYWRIGHT_USERNAME;
const password = process.env.PLAYWRIGHT_PASSWORD;

if (!username || !password) {
  throw new Error('PLAYWRIGHT_USERNAME or PLAYWRIGHT_PASSWORD environment variable is not set');
}

test.describe('Post-Auth Routes', () => {
  test.beforeEach(async ({ page }) => {
    // sign to auth
    await globalSetup();

    // welcome
    await page.goto(`${baseURL}/welcome`);
    await expect(page.getByRole('link', { name: 'RECALL' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chat', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Files' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Study something else' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Go to chats' })).toBeVisible();
    await expect(page.locator('#root')).toContainText('What would you like to study today?');
    // chat
    await page.goto(`${baseURL}/chat`);
    await expect(page.getByRole('button', { name: 'Folders' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Toggle Personalities' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Quiz Me Test your knowledge' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Brain Dump Explore and expand' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'RECALL' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chat', exact: true })).toBeVisible();
    // files
    await page.goto(`${baseURL}/files`);
    await expect(page.getByLabel('breadcrumb')).toBeVisible();
    await expect(page.getByRole('link', { name: 'RECALL' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Chat', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Files' })).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Chat$/ })).toBeVisible();
    await expect(page.getByRole('button').first()).toBeVisible();
    await expect(page.getByLabel('Create collection')).toBeVisible();
    await expect(page.getByLabel('Delete Files')).toBeVisible();
    await expect(page.locator('#root')).toContainText('Name');
    await expect(page.locator('#root')).toContainText('Date added');
  });
});
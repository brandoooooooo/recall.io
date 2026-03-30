import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.PLAYWRIGHT_HOST;

test.describe('Main Routes', () => {
  // landing
  test('Landing Page has correct title and content', async ({ page }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.getByRole('link', { name: 'RECALL' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'recall.io' })).toBeVisible();
    await expect(page.getByText('Your AI study guide')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Help' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText('recall.io');
    await expect(page.getByRole('paragraph')).toContainText('Your AI study guide');
    await expect(page.locator('#root')).toContainText('Get started');
    await expect(page.getByRole('navigation')).toContainText('RECALL');
    await expect(page.getByRole('navigation')).toContainText('Help');
    await expect(page.getByRole('navigation')).toContainText('About');
  });
  // sign in
  test('Sign In Page has correct content', async ({ page }) => {
    await page.goto(`${baseURL}/signin`);
    await expect(page.getByRole('link', { name: 'RECALL' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Help' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
    await expect(page.getByRole('heading')).toContainText('Welcome back');
    await expect(page.locator('#root')).toContainText('Let\'s continue your learning journey.');
    await expect(page.locator('#root')).toContainText('Sign in with Google');
    await expect(page.getByRole('navigation')).toContainText('RECALL');
    await expect(page.getByRole('navigation')).toContainText('Help');
    await expect(page.getByRole('navigation')).toContainText('About');
  });
  // about
  test('About Page has correct content', async ({ page }) => {
    await page.goto(`${baseURL}/about`);
    await expect(page.getByRole('link', { name: 'RECALL' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Help' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Study Smarter with Recall' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Interactive Study Sessions' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Upload Your Study Material' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Instant, AI-Powered Answers' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Transparent Sources' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Meet the Team' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Carter Costic' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Kevin Le' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Brandon Lee' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'Austin Li' })).toBeVisible();
    await expect(page.getByRole('img', { name: 'William Zhang' })).toBeVisible();
  });
  // help
  test('Help Page has correct content', async ({ page }) => {
    await page.goto(`${baseURL}/help`);
    await expect(page.getByRole('link', { name: 'RECALL', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Help' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About', exact: true })).toBeVisible();
    await expect(page.getByRole('navigation')).toContainText('RECALL');
    await expect(page.getByRole('navigation')).toContainText('Help');
    await expect(page.getByRole('navigation')).toContainText('About');
    await expect(page.getByRole('heading', { name: 'Tutorial' })).toBeVisible();
    await expect(page.locator('iframe[title="YouTube video player"]').contentFrame().locator('.ytp-cued-thumbnail-overlay-image')).toBeVisible();
  });
});
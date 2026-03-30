# Recall.io

📄✨📘 Recall.io is an advanced document processing platform designed to revolutionize how information is retrieved and explained. Using state-of-the-art semantic chunking and explainable retrieval techniques, Recall.io ensures users get the most relevant, transparent, and coherent information from their documents. 📖🔍💡

Key Features

Semantic Chunking: Intelligent text segmentation for improved data coherence.

Explainable Retrieval: Combines vector-based similarity with natural language explanations for transparency.

Q&A, Quiz Me, Brain Dump: Various personalities for different learning styles.

🌟📚🤖 Discover a smarter way to understand your documents with Recall.io. ✨📈🧠

## Developer Toolchain

### Frontend

We use `yarn` as our package manager engine. We use `eslint` for linting and `prettier` for formatting, so make sure the extensions are installed in VSCode (or equivalent).

### Backend

We use `poetry` to manage our backend (python) virtual environment and dependencies, so install that first.

Check their installation documentation [here](https://python-poetry.org/docs/#installation)

To install via `pipx`, do

```python
brew install pipx
pipx ensurepath
pipx install poetry
```

For Mac, if you have trouble accessing `poetry` on your path, add `export PATH="$HOME/.local/bin:$PATH"` to your `.zshrc` or equivalent.
For Windows, add `%APPDATA%\Python\Scripts` to your environment variables in the PATH.

To provision your poetry virtual environment, run `poetry install`,

To run the backend server, enter the poetry virtual environment with `poetry shell` and then run commands as normal.
Alternatively, you can run `poetry run python run.py`.

If using vscode, install the `ruff` formatter. You can trigger a manual check with `poetry run ruff check .`

### Database

Use a local version of a Postgres database for development. For Mac, `postgres.app` is good for running the server and some GUI to interact with it is helpful, like DataGrip.

Note that we use the extension `pgvector`, so install that and enable it with the command `CREATE EXTENSION vector;`

### AWS

Bucket Name: recallnotes

Access Key:

Secret Access Key:

### Users

recall - includes the recallputpolicy

recallusers - includes FullAmazonS3Access

## Policies

recallputpolicy (will rename to STS)
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": "sts:AssumeRole",
            "Resource": "arn:aws:iam::474668419736:role/RecallS3"
        }
    ]
}
```

### Roles

RecallS3 - contains full AmazonS3FullAccess

#### CORS Configuration

To enable multipart uploads from your frontend, you need to configure CORS for your S3 bucket:

1. **Go to the AWS Management Console** and open the Amazon S3 console.
2. **Select your bucket** (`recallnotes`).
3. **Go to the Permissions tab**.
4. **Scroll down to the Cross-origin resource sharing (CORS) section**.
5. **Edit the CORS configuration** and add the following JSON configuration:

   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
       "AllowedOrigins": ["*"],
       "ExposeHeaders": ["ETag"],
       "MaxAgeSeconds": 3000
     }
   ]
   ```

   This configuration allows all origins (`AllowedOrigins: ["*"]`) to make requests to your S3 bucket. You can restrict it to specific origins by replacing `*` with your domain (e.g., `http://localhost:5173`).



# Playwright Testing

This project uses Playwright for end-to-end testing. Playwright is a Node.js library to automate Chromium, Firefox, and WebKit with a single API.

---

## Setup

### Install Dependencies
First, ensure you have Node.js installed. Then, install the necessary dependencies:

```bash
yarn install
```

### Environment Variables
In your `.env` file in the root directory of your project and add the following environment variables (username and password are for google authentication):

```bash
PLAYWRIGHT_HOST=http://localhost:3000
PLAYWRIGHT_USERNAME=your-username
PLAYWRIGHT_PASSWORD=your-password
```

Replace `your-username` and `your-password` with your test credentials.

## Configuration

The Playwright configuration is defined in `playwright.config.ts`. This file sets up the test directory, parallel execution, retries, and browser configurations.

### Example Configuration
Refer to `playwright.config.ts` for the setup details.

## Writing Tests

### Pre-Auth Tests
Pre-auth tests are located in `pre-auth-browser-main-routes.test.ts`. These tests check the content and routes available before authentication.

### Post-Auth Tests
Post-auth tests are located in `post-auth-browser-main-routes.test.ts`. These tests perform authentication and then check the content and routes available after logging in.

### Example Test
Here is an example of a pre-auth test:

```typescript
test('Landing Page has correct title and content', async ({ page }) => {
    await page.goto(`${baseURL}/`);
    await expect(page.getByRole('link', { name: 'RECALL' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'recall.io' })).toBeVisible();
}
```

---

## Running Tests

### Run All Tests
To run all tests, use the following command:

```bash
yarn vite
yarn playwright test
```

This will execute all tests in the `__tests__` directory.

### Run Specific Tests
To run a specific test file, use:

```bash
yarn playwright test path/to/test-file.test.ts
```

---

## Viewing Test Reports
After running the tests, you can view the HTML report by using:

```bash
yarn playwright show-report
```

## Conclusion

This setup allows you to perform comprehensive end-to-end testing of your application using Playwright. Ensure your environment variables are correctly set up and your tests are organized in the `__tests__` directory.

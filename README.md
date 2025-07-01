# MagniLearn Artillery Testing

This project contains automated tests for the MagniLearn platform using Playwright and Artillery.

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd magniArtillery
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Set up environment variables**
   ```bash
   # Copy the example configuration
   cp config.example .env
   
   # Edit .env with your credentials
   # BASE_URL=https://ie-learning.magnilearn.com
   # MAGNILEARN_USERNAME=your_username_here
   # MAGNILEARN_PASSWORD=your_password_here
   ```

## Configuration

The tests are now parametrized to use environment variables for credentials and base URL. This makes it easy to run tests against different environments without modifying the code.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
BASE_URL=https://ie-learning.magnilearn.com
MAGNILEARN_USERNAME=your_username_here
MAGNILEARN_PASSWORD=your_password_here
```

### Default Values

If environment variables are not set, the tests will use these default values to login with this test user:
- `BASE_URL`: `https://ie-learning.magnilearn.com`
- `MAGNILEARN_USERNAME`: `MM_c4437318-9019-4d89-8899-182b8110b731`
- `MAGNILEARN_PASSWORD`: `************`

## Running Tests

By default, any test will run over 3 browser engines: Chromium, Firefox and Webkit.
If you want to target a specific browser engine alone run with the engine, like this:
```bash
npm run test:chrome
```

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with environment variables from .env file
npm run test:with-env

# Run guided learning tests specifically
npm run test:guided-learning

# Run tests against perf environment
# https://perf.magnilearn.com
npm run test:perf

# Run tests against production environment
# https://ie-learning.magnilearn.com
npm run test:dev
```

### With Custom Credentials

You can override credentials for a single run:

```bash
# Run with custom username and password or base url
$env:BASE_URL='https://perf.magnilearn.com'
$env:MAGNILEARN_USERNAME='MM_c4437318-9019-4d89-8899-182b8110b731'
$env:MAGNILEARN_PASSWORD='@C3T1nt3Gr4t10nPa$$w0rD'
npm test
# Run against different environment
BASE_URL=https://staging.magnilearn.com npm test
```

### Browser-Specific Commands

```bash
# Run tests in Chrome
npm run test:chrome

# Run tests in Firefox
npm run test:firefox

# Run tests in Webkit
npm run test:webkit

# Run tests in headed mode (visible browser)
npm run test:headed

# Run tests with debug mode
npm run test:debug

# Run tests with UI mode
npm run test:ui
```

## Project Structure

```
tests/
├── config/
│   └── test-config.ts          # Configuration file
├── utils/
│   └── test-utils.ts           # Shared utility functions
├── guidedLearning/
│   ├── flows.js                # JavaScript test file
│   └── run-flow.spec.ts        # Flow runner
└── ...
```

## Configuration Files

- `tests/config/test-config.ts`: Centralized configuration with environment variable support
- `playwright.config.ts`: Playwright configuration with base URL support
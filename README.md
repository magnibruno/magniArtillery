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

## Load Testing with Artillery and Fargate

### Running Load Tests on AWS Fargate

You can run load tests using Artillery on AWS Fargate for distributed load testing across multiple containers. This approach allows you to simulate high concurrent user loads without being limited by local machine resources.

#### Prerequisites

- AWS CLI configured with appropriate permissions
- Artillery installed globally: `npm install -g artillery`
- AWS Fargate cluster and task definition set up

#### Basic Fargate Command

```bash
artillery run-fargate --region eu-west-1 --count 7 --memory 16 ./tests/loadtest/test.yml
```

#### Command Parameters

- `--region eu-west-1`: Specifies the AWS region where Fargate tasks will be launched
- `--count 7`: Launches 7 Fargate tasks (containers) to distribute the load
- `--memory 16`: Allocates 16GB of memory to each Fargate task
- `./tests/loadtest/test.yml`: Path to the Artillery test configuration file

#### Ramp-up Configuration

The load test ramp-up is controlled by the `phases` configuration in `tests/loadTest/test.yml`:

```yaml
config:
  target: "https://ie-learning.magnilearn.com"
  phases:
    - arrivalRate: 1
      duration: 50
      name: 'start up'
```

**Ramp-up Behavior:**
- **Arrival Rate**: 1 user per second starts the test
- **Duration**: 50 seconds for the ramp-up phase
- **Total Users**: With 7 Fargate tasks, you'll have 7 concurrent users during the ramp-up phase
- **Distribution**: Each Fargate task runs independently, simulating real user behavior

#### Test Flow

The load test executes the following user journey (defined in `tests/loadTest/flows.js`):

1. **Login**: Each virtual user logs in with credentials from the `/api/LoadTest/getUser` endpoint
2. **Session Management**: Handles existing sessions and terminates if necessary
3. **Lesson Interaction**: Clicks "Start lesson" and waits for completion
4. **Dashboard Return**: Returns to dashboard after lesson completion
5. **Logout**: Properly logs out to clean up the session

#### Fargate Configuration

The Fargate settings are defined in `tests/loadTest/fargate.config.yml`:

```yaml
fargate:
  cluster: your-cluster-name
  taskDefinition: artillery-task-name
  region: us-east-1
  launchType: FARGATE
  assignPublicIp: true
  count: 10
```

#### Scaling Considerations

- **Memory Allocation**: 16GB per task provides sufficient resources for Playwright browser instances
- **Task Count**: 7 tasks provide good distribution while managing costs
- **Region Selection**: Choose a region close to your target application for lower latency
- **Network Performance**: Each task runs independently, simulating real user distribution

#### Monitoring and Results

- Artillery automatically collects metrics from all Fargate tasks
- Results are aggregated across all running containers
- Monitor AWS CloudWatch for Fargate task performance
- Check Artillery reports for detailed load test metrics

## Configuration Files

- `tests/config/test-config.ts`: Centralized configuration with environment variable support
- `playwright.config.ts`: Playwright configuration with base URL support
- `tests/loadTest/test.yml`: Artillery load test configuration
- `tests/loadTest/fargate.config.yml`: AWS Fargate deployment configuration
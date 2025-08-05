const fs = require('fs');
const path = require('path');

class AuthMonitor {
  constructor() {
    this.authStats = {
      timestamp: new Date().toISOString(),
      testRun: process.env.TEST_RUN_ID || Date.now(),
      totalAttempts: 0,
      loginFailures: 0,
      unauthorizedRequests: 0,
      forbiddenRequests: 0,
      sessionTimeouts: 0,
      errors: []
    };
  }

  // Track login attempt
  trackLoginAttempt(success, error = null) {
    this.authStats.totalAttempts++;
    
    if (!success) {
      this.authStats.loginFailures++;
      if (error) {
        this.authStats.errors.push({
          type: 'login_failure',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  // Track HTTP auth errors
  trackHttpError(status, url) {
    if (status === 401) {
      this.authStats.unauthorizedRequests++;
      this.authStats.errors.push({
        type: 'unauthorized',
        status: 401,
        url: url,
        timestamp: new Date().toISOString()
      });
    } else if (status === 403) {
      this.authStats.forbiddenRequests++;
      this.authStats.errors.push({
        type: 'forbidden',
        status: 403,
        url: url,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Track session timeout
  trackSessionTimeout() {
    this.authStats.sessionTimeouts++;
    this.authStats.errors.push({
      type: 'session_timeout',
      timestamp: new Date().toISOString()
    });
  }

  // Generate auth report
  generateReport() {
    const successRate = ((this.authStats.totalAttempts - this.authStats.loginFailures) / this.authStats.totalAttempts * 100).toFixed(2);
    
    const report = {
      summary: {
        totalAttempts: this.authStats.totalAttempts,
        loginFailures: this.authStats.loginFailures,
        successRate: `${successRate}%`,
        unauthorizedRequests: this.authStats.unauthorizedRequests,
        forbiddenRequests: this.authStats.forbiddenRequests,
        sessionTimeouts: this.authStats.sessionTimeouts
      },
      details: this.authStats.errors,
      timestamp: this.authStats.timestamp,
      testRun: this.authStats.testRun
    };

    return report;
  }

  // Save report to file
  saveReport(filename = null) {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultFilename = `auth-report-${timestamp}.json`;
    const filepath = filename || path.join(__dirname, defaultFilename);
    
    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`[AUTH MONITOR] Report saved to: ${filepath}`);
    
    return filepath;
  }

  // Print summary to console
  printSummary() {
    const report = this.generateReport();
    console.log('\n=== AUTHENTICATION MONITORING SUMMARY ===');
    console.log(`Test Run: ${report.testRun}`);
    console.log(`Timestamp: ${report.timestamp}`);
    console.log(`Total Login Attempts: ${report.summary.totalAttempts}`);
    console.log(`Login Failures: ${report.summary.loginFailures}`);
    console.log(`Success Rate: ${report.summary.successRate}`);
    console.log(`401 Unauthorized: ${report.summary.unauthorizedRequests}`);
    console.log(`403 Forbidden: ${report.summary.forbiddenRequests}`);
    console.log(`Session Timeouts: ${report.summary.sessionTimeouts}`);
    console.log('==========================================\n');
  }
}

module.exports = AuthMonitor; 
import axios from 'axios';
import { apiUrl } from '@/services/api';

interface TestResult {
  endpoint: string;
  method: string;
  status: 'PASS' | 'FAIL';
  statusCode?: number;
  responseTime: number;
  error?: string;
  response?: any;
}

interface TestReport {
  totalTests: number;
  passed: number;
  failed: number;
  results: TestResult[];
  summary: {
    authentication: { passed: number; total: number };
    users: { passed: number; total: number };
    organizations: { passed: number; total: number };
    buildings: { passed: number; total: number };
    spaces: { passed: number; total: number };
    categories: { passed: number; total: number };
    tasks: { passed: number; total: number };
    assets: { passed: number; total: number };
    issues: { passed: number; total: number };
    notifications: { passed: number; total: number };
  };
}

class APITester {
  private baseURL: string;
  private authToken: string | null;
  private userId: string | null;
  private organizationId: string | null;
  private results: TestResult[] = [];

  constructor() {
    this.baseURL = apiUrl || 'http://localhost:3000/api';
    
    // Get auth info from localStorage
    const userInfo = JSON.parse(localStorage.getItem("userInfo") || '{}');
    this.authToken = userInfo?.accessToken || null;
    this.userId = userInfo?.id || null;
    this.organizationId = userInfo?.Organization_id?._id || userInfo?.company || null;
  }

  private async makeRequest(
    endpoint: string, 
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET', 
    data?: any,
    requiresAuth: boolean = true
  ): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      const config: any = {
        method,
        url: `${this.baseURL}${endpoint}`,
        timeout: 10000,
      };

      if (requiresAuth && this.authToken) {
        config.headers = {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/json',
        };
      }

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        config.data = data;
      }

      const response = await axios(config);
      const responseTime = Date.now() - startTime;

      return {
        endpoint,
        method,
        status: 'PASS',
        statusCode: response.status,
        responseTime,
        response: response.data,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      return {
        endpoint,
        method,
        status: 'FAIL',
        statusCode: error.response?.status,
        responseTime,
        error: error.response?.data?.message || error.message,
      };
    }
  }

  async runAllTests(): Promise<TestReport> {
    console.log('🚀 Starting API Testing...');
    this.results = [];

    // Authentication Tests
    await this.testAuthentication();
    
    // User Tests  
    await this.testUsers();
    
    // Organization Tests
    await this.testOrganizations();
    
    // Building Tests
    await this.testBuildings();
    
    // Space Tests
    await this.testSpaces();
    
    // Category Tests
    await this.testCategories();
    
    // Task Tests
    await this.testTasks();
    
    // Asset Tests
    await this.testAssets();
    
    // Issue Tests
    await this.testIssues();
    
    // Notification Tests
    await this.testNotifications();

    return this.generateReport();
  }

  private async testAuthentication() {
    console.log('Testing Authentication endpoints...');
    
    // Test current user
    if (this.userId) {
      const result = await this.makeRequest(`/user/${this.userId}`);
      this.results.push(result);
    }
   
  }

  private async testUsers() {
    console.log('Testing User endpoints...');
    
    // Get all users
    const usersResult = await this.makeRequest('/user');
    this.results.push(usersResult);
    
    // Get specific user
    if (this.userId) {
      const userResult = await this.makeRequest(`/user/${this.userId}`);
      this.results.push(userResult);
    }
    
    // Get affected buildings for user
    if (this.userId) {
      const affectedResult = await this.makeRequest(`/user/affected-to/${this.userId}`);
      this.results.push(affectedResult);
    }
  }

  private async testOrganizations() {
    console.log('Testing Organization endpoints...');
    
    // Get organization
    if (this.organizationId) {
      const orgResult = await this.makeRequest(`/organization/${this.organizationId}`);
      this.results.push(orgResult);
      
      // Get organization users/invites
      const inviteResult = await this.makeRequest(`/invite?organizationId=${this.organizationId}`);
      this.results.push(inviteResult);
    }
  }

  private async testBuildings() {
    console.log('Testing Building endpoints...');
    
    // Get all buildings
    const buildingsResult = await this.makeRequest('/building');
    this.results.push(buildingsResult);
    
    // Get buildings by organization
    if (this.organizationId) {
      const orgBuildingsResult = await this.makeRequest(`/building/by-organization/${this.organizationId}`);
      this.results.push(orgBuildingsResult);
      
      // Get buildings by organization and user
      if (this.userId) {
        const userBuildingsResult = await this.makeRequest(`/building/by-organization/${this.organizationId}/user/${this.userId}`);
        this.results.push(userBuildingsResult);
      }
    }
  }

  private async testSpaces() {
    console.log('Testing Space endpoints...');
    
    const spacesResult = await this.makeRequest('/space');
    this.results.push(spacesResult);
  }

  private async testCategories() {
    console.log('Testing Category endpoints...');
    
    const categoriesResult = await this.makeRequest('/category');
    this.results.push(categoriesResult);
  }

  private async testTasks() {
    console.log('Testing Task endpoints...');
    
    // Get all tasks
    const tasksResult = await this.makeRequest('/task');
    this.results.push(tasksResult);
    
    // Get accepted tasks
    const acceptedTasksResult = await this.makeRequest('/accepted-issue');
    this.results.push(acceptedTasksResult);
  }

  private async testAssets() {
    console.log('Testing Asset endpoints...');
    
    const assetsResult = await this.makeRequest('/asset');
    this.results.push(assetsResult);
  }

  private async testIssues() {
    console.log('Testing Issue endpoints...');
    
    const issuesResult = await this.makeRequest('/issue');
    this.results.push(issuesResult);
  }

  private async testNotifications() {
    console.log('Testing Notification endpoints...');
    
    if (this.userId) {
      const notificationsResult = await this.makeRequest(`/notifications/${this.userId}`);
      this.results.push(notificationsResult);
    }
  }

  private generateReport(): TestReport {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    const categorizeResults = (category: string) => {
      const categoryResults = this.results.filter(r => 
        r.endpoint.toLowerCase().includes(category.toLowerCase()) ||
        (category === 'authentication' && (r.endpoint.includes('/auth') || r.endpoint.includes('/user/')))
      );
      return {
        passed: categoryResults.filter(r => r.status === 'PASS').length,
        total: categoryResults.length,
      };
    };

    return {
      totalTests: this.results.length,
      passed,
      failed,
      results: this.results,
      summary: {
        authentication: categorizeResults('auth'),
        users: categorizeResults('user'),
        organizations: categorizeResults('organization'),
        buildings: categorizeResults('building'),
        spaces: categorizeResults('space'),
        categories: categorizeResults('category'),
        tasks: categorizeResults('task'),
        assets: categorizeResults('asset'),
        issues: categorizeResults('issue'),  
        notifications: categorizeResults('notification'),
      },
    };
  }

  printReport(report: TestReport) {
    console.clear();
    console.log('🔍 API Testing Report');
    console.log('====================');
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.passed}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log(`Success Rate: ${((report.passed / report.totalTests) * 100).toFixed(1)}%`);
    console.log('');

    // Summary by category
    console.log('📊 Summary by Category:');
    Object.entries(report.summary).forEach(([category, stats]) => {
      const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : '0';
      console.log(`  ${category.charAt(0).toUpperCase() + category.slice(1)}: ${stats.passed}/${stats.total} (${successRate}%)`);
    });
    console.log('');

    // Detailed results
    console.log('📋 Detailed Results:');
    console.log('==================');
    
    report.results.forEach((result, index) => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.method} ${result.endpoint}`);
      console.log(`   Status Code: ${result.statusCode || 'N/A'}`);
      console.log(`   Response Time: ${result.responseTime}ms`);
      
      if (result.status === 'FAIL' && result.error) {
        console.log(`   Error: ${result.error}`);
      }
      
      if (result.status === 'PASS' && result.response) {
        const responsePreview = typeof result.response === 'object' 
          ? `${Array.isArray(result.response) ? result.response.length + ' items' : 'Object'}`
          : result.response;
        console.log(`   Response: ${responsePreview}`);
      }
      console.log('');
    });

    // Failed tests summary
    const failedTests = report.results.filter(r => r.status === 'FAIL');
    if (failedTests.length > 0) {
      console.log('🚨 Failed Tests Summary:');
      console.log('=======================');
      failedTests.forEach((test, index) => {
        console.log(`${index + 1}. ${test.method} ${test.endpoint}`);
        console.log(`   Error: ${test.error}`);
        console.log(`   Status Code: ${test.statusCode || 'N/A'}`);
        console.log('');
      });
    }
  }
}

// Export for use in components or run directly
export const runAPITests = async (): Promise<TestReport> => {
  const tester = new APITester();
  const report = await tester.runAllTests();
  tester.printReport(report);
  return report;
};

// Auto-run if called directly (for browser console)
if (typeof window !== 'undefined') {
  (window as any).runAPITests = runAPITests;
}
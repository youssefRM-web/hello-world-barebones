import { runAPITests } from "./apiTester";

// Console helper function for quick API testing
export const quickAPITest = async (category?: string) => {
  const report = await runAPITests();

  if (category) {
    // Filter results by category
    const categoryResults = report.results.filter((result) => {
      const endpoint = result.endpoint.toLowerCase();
      if (category === "auth") {
        return endpoint.includes("/auth") || endpoint.includes("/user/");
      }
      return endpoint.includes(category.toLowerCase());
    });

    console.log(`\n📋 ${category.toUpperCase()} Results:`);
    console.log("=".repeat(50));

    categoryResults.forEach((result, index) => {
      const status = result.status === "PASS" ? "✅" : "❌";
      console.log(
        `${index + 1}. ${status} ${result.method} ${result.endpoint}`
      );
      console.log(
        `   Status: ${result.statusCode || "N/A"} | Time: ${
          result.responseTime
        }ms`
      );

      if (result.status === "FAIL" && result.error) {
        console.log(`   ❌ Error: ${result.error}`);
      }
      console.log("");
    });

    const passed = categoryResults.filter((r) => r.status === "PASS").length;
    const failed = categoryResults.filter((r) => r.status === "FAIL").length;

    console.log(`\n📊 ${category.toUpperCase()} Summary:`);
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(
      `   📈 Success Rate: ${((passed / categoryResults.length) * 100).toFixed(
        1
      )}%`
    );
  } else {
    // Show full report
    console.log("\n📊 Full Test Report Summary:");
    console.log("=".repeat(50));
    console.log(`Total Tests: ${report.totalTests}`);
    console.log(`✅ Passed: ${report.passed}`);
    console.log(`❌ Failed: ${report.failed}`);
    console.log(
      `📈 Success Rate: ${((report.passed / report.totalTests) * 100).toFixed(
        1
      )}%`
    );

    console.log("\n🔍 Category Breakdown:");
    Object.entries(report.summary).forEach(([category, stats]) => {
      const successRate =
        stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : "0";
      console.log(
        `   ${category}: ${stats.passed}/${stats.total} (${successRate}%)`
      );
    });
  }

  return report;
};

// Export specific test functions for console use
export const testAuth = () => quickAPITest("auth");
export const testUsers = () => quickAPITest("user");
export const testBuildings = () => quickAPITest("building");
export const testTasks = () => quickAPITest("task");
export const testAssets = () => quickAPITest("asset");
export const testIssues = () => quickAPITest("issue");

// Add to window for console access
if (typeof window !== "undefined") {
  (window as any).apiTest = {
    runAll: quickAPITest,
    auth: testAuth,
    users: testUsers,
    buildings: testBuildings,
    tasks: testTasks,
    assets: testAssets,
    issues: testIssues,
  };
}

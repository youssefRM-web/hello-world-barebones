import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react';
import { runAPITests } from '@/utils/apiTester';

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
    [key: string]: { passed: number; total: number };
  };
}

export const APITestRunner: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [report, setReport] = useState<TestReport | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const testReport = await runAPITests();
      setReport(testReport);
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getStatusIcon = (status: 'PASS' | 'FAIL') => {
    return status === 'PASS' ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusColor = (status: 'PASS' | 'FAIL') => {
    return status === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getCategoryResults = (category: string) => {
    if (!report) return [];
    
    return report.results.filter(result => {
      const endpoint = result.endpoint.toLowerCase();
      if (category === 'authentication') {
        return endpoint.includes('/auth') || endpoint.includes('/user/');
      }
      return endpoint.includes(category.toLowerCase());
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            API Test Runner
          </CardTitle>
          <CardDescription>
            Test all API endpoints and get a comprehensive report of their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleRunTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Running Tests...' : 'Run API Tests'}
          </Button>
        </CardContent>
      </Card>

      {report && (
        <>
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">{report.totalTests}</div>
                  <div className="text-sm text-muted-foreground">Total Tests</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{report.passed}</div>
                  <div className="text-sm text-muted-foreground">Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">{report.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Success Rate</span>
                  <span>{((report.passed / report.totalTests) * 100)?.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={(report.passed / report.totalTests) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Category Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Categories Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(report.summary).map(([category, stats]) => {
                  const successRate = stats.total > 0 ? ((stats.passed / stats.total) * 100)?.toFixed(1) : '0';
                  return (
                    <div key={category} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold first-letter:uppercase">{category}</h3>
                        <Badge variant={stats.passed === stats.total ? "default" : "destructive"}>
                          {stats.passed}/{stats.total}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Success Rate: {successRate}%
                      </div>
                      <Progress value={parseInt(successRate)} className="h-1" />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Results</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.keys(report.summary).map(category => {
                const categoryResults = getCategoryResults(category);
                if (categoryResults.length === 0) return null;

                return (
                  <Collapsible 
                    key={category}
                    open={openCategories[category]}
                    onOpenChange={() => toggleCategory(category)}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2">
                        {openCategories[category] ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="font-semibold first-letter:uppercase">{category}</span>
                        <Badge variant="outline">
                          {categoryResults.length} tests
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-green-100 text-green-800">
                          {categoryResults.filter(r => r.status === 'PASS').length} passed
                        </Badge>
                        <Badge className="bg-red-100 text-red-800">
                          {categoryResults.filter(r => r.status === 'FAIL').length} failed
                        </Badge>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-2 space-y-2">
                      {categoryResults.map((result, index) => (
                        <div key={index} className="ml-6 p-3 border rounded bg-card">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(result.status)}
                              <span className="font-mono text-sm">
                                {result.method} {result.endpoint}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {result.statusCode || 'N/A'}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {result.responseTime}ms
                              </Badge>
                            </div>
                          </div>
                          
                          {result.status === 'FAIL' && result.error && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded mt-2">
                              <strong>Error:</strong> {result.error}
                            </div>
                          )}
                          
                          {result.status === 'PASS' && result.response && (
                            <div className="text-sm text-green-600 bg-green-50 p-2 rounded mt-2">
                              <strong>Response:</strong> {
                                typeof result.response === 'object' 
                                  ? `${Array.isArray(result.response) ? result.response.length + ' items' : 'Object'}`
                                  : result.response
                              }
                            </div>
                          )}
                        </div>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
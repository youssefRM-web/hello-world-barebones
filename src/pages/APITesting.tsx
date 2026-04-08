import React from "react";
import { APITestRunner } from "@/components/Testing/APITestRunner";

const APITesting: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">
            API Testing Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive API endpoint testing and monitoring tool
          </p>
        </div>

        <APITestRunner />
      </div>
    </div>
  );
};

export default APITesting;

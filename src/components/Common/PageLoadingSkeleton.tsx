import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface PageLoadingSkeletonProps {
  variant?: "table" | "grid" | "board" | "profile" | "modal" | "tree" | "layout" | "default";
}

// Table skeleton for pages like Spaces, Assets, Documents
const TableSkeleton = () => (
  <div className="space-y-4">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    
    {/* Tabs skeleton */}
    <div className="flex gap-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-10 w-24" />
    </div>
    
    {/* Filters skeleton */}
    <div className="flex gap-4 my-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-10 w-36" />
      <Skeleton className="h-10 w-36" />
    </div>
    
    {/* Table skeleton */}
    <div className="bg-background rounded-lg border">
      {/* Table header */}
      <div className="flex gap-4 p-4 border-b">
        <Skeleton className="h-4 w-8" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-28" />
      </div>
      {/* Table rows */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border-b last:border-b-0">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
      ))}
    </div>
  </div>
);

// Grid skeleton for Buildings page
const GridSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-6" />
        <Skeleton className="h-8 w-32" />
      </div>
      <Skeleton className="h-10 w-36" />
    </div>
    
    {/* Tabs skeleton */}
    <div className="flex gap-4 mb-6">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-28" />
    </div>
    
    {/* Grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="bg-background border rounded-lg p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-5" />
            <div className="space-y-1">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Board skeleton for Board page
const BoardSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between p-4 lg:p-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-10 w-28" />
    </div>
    
    {/* Tabs and search skeleton */}
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-4 lg:px-6">
      <div className="flex gap-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 rounded-lg" />
        ))}
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-28" />
      </div>
    </div>
    
    {/* Board columns skeleton */}
    <div className="px-4 lg:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, colIndex) => (
          <div key={colIndex} className="bg-accent/50 rounded-lg p-4 space-y-4">
            {/* Column header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-5 w-6 rounded-full" />
              </div>
            </div>
            
            {/* Task cards */}
            {[...Array(3)].map((_, taskIndex) => (
              <div key={taskIndex} className="bg-background rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-5 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
            
            {/* Create button */}
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Profile skeleton for Profile page
const ProfileSkeleton = () => (
  <div className="space-y-6 p-4 lg:p-6">
    {/* Header skeleton */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-32" />
    </div>
    
    {/* Tabs skeleton */}
    <div className="flex gap-2 max-w-[700px]">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 flex-1" />
    </div>
    
    {/* Profile content skeleton */}
    <div className="space-y-6 max-w-[700px] mt-6">
      {/* Photo section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-48" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Form fields skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-10 w-full" />
      </div>
      
      {/* Buttons skeleton */}
      <div className="flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  </div>
);

// Default skeleton
const DefaultSkeleton = () => (
  <div className="space-y-6 p-4 lg:p-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-32" />
    </div>
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Modal skeleton for detail modals
const ModalSkeleton = () => (
  <div className="space-y-4 p-6">
    {/* Header */}
    <div className="flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-md" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    
    {/* Info section */}
    <div className="flex items-center gap-3 p-3 border rounded-md">
      <Skeleton className="h-10 w-10 rounded-md" />
      <Skeleton className="h-4 w-48" />
    </div>
    
    {/* Form fields */}
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-md">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
    
    {/* Text area */}
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-24 w-full rounded-md" />
    </div>
    
    {/* Action buttons */}
    <div className="space-y-2 pt-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  </div>
);

// Tree list skeleton for link modals
const TreeSkeleton = () => (
  <div className="space-y-4 p-4">
    {/* Search */}
    <Skeleton className="h-10 w-full rounded-md" />
    
    {/* Tabs */}
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
    
    {/* Tree items */}
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 py-2 px-3" style={{ marginLeft: `${(i % 3) * 24}px` }}>
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
    
    {/* Footer buttons */}
    <div className="flex gap-3 pt-4 border-t">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 flex-1" />
    </div>
  </div>
);

// Sidebar skeleton
const SidebarSkeleton = () => (
  <div className="hidden lg:flex flex-col w-64 bg-background border-r h-screen p-4 space-y-6">
    {/* Logo area */}
    <div className="flex items-center gap-3 px-2">
      <Skeleton className="h-8 w-8 rounded-md" />
      <Skeleton className="h-5 w-24" />
    </div>
    
    {/* Building selector */}
    <div className="space-y-2">
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
    
    {/* Navigation items */}
    <div className="space-y-1">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
    
    {/* Bottom section */}
    <div className="mt-auto space-y-1">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
    
    {/* User area */}
    <div className="flex items-center gap-3 px-2 pt-4 border-t">
      <Skeleton className="h-9 w-9 rounded-full" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  </div>
);

// Full layout skeleton with sidebar and content
const FullLayoutSkeleton = () => (
  <div className="flex h-screen overflow-hidden bg-background">
    <SidebarSkeleton />
    <div className="flex-1 flex flex-col min-w-0">
      {/* TopBar skeleton */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 lg:hidden" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
      {/* Content skeleton */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <DefaultSkeleton />
      </main>
    </div>
  </div>
);

const PageLoadingSkeleton: React.FC<PageLoadingSkeletonProps> = ({ 
  variant = "default" 
}) => {
  switch (variant) {
    case "table":
      return <TableSkeleton />;
    case "grid":
      return <GridSkeleton />;
    case "board":
      return <BoardSkeleton />;
    case "profile":
      return <ProfileSkeleton />;
    case "modal":
      return <ModalSkeleton />;
    case "tree":
      return <TreeSkeleton />;
    case "layout":
      return <FullLayoutSkeleton />;
    default:
      return <DefaultSkeleton />;
  }
};

export default PageLoadingSkeleton;
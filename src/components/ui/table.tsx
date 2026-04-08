import * as React from "react";
import { cn } from "@/lib/utils";

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="w-full overflow-x-auto border border-border/50 rounded-xl shadow-sm bg-card">
    <table
      ref={ref}
      className={cn(
        "w-full text-sm",
        "md:[&_th]:whitespace-nowrap", // Prevent header wrap on desktop
        className
      )}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-gradient-to-r from-muted/50 to-muted/20",
      "[&_tr]:border-b [&_tr]:border-border/50",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr]:border-b [&_tr]:border-border/30 [&_tr:last-child]:border-0",
      "[&_tr]:hover:bg-accent/20 [&_tr]:hover:shadow-sm [&_tr]:transition-all [&_tr]:duration-200",
      "[&_tr]:focus-within:bg-accent/30",
      className
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t border-border/50 bg-gradient-to-r from-muted/80 to-muted/60",
      "font-semibold text-xs uppercase tracking-wider text-muted-foreground/90",
      "[&>tr]:last:border-b-0",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "group/row transition-all duration-200 hover:shadow-md",
      "data-[state=selected]:bg-accent data-[state=selected]:shadow-md",
      // Mobile: full-width touch target
      "md:hover:bg-accent/10 md:hover:backdrop-blur-sm",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      // Responsive padding
      "px-3 py-3.5 sm:px-4 md:px-6",
      // Mobile: smaller text, center align
      "text-xs font-semibold capitalise tracking-wider text-[#565E6CFF]",
      "sm:text-sm",
      // Sticky header on scroll (optional)
      "sticky top-0 z-10 backdrop-blur-sm",
      // Alignment
      "text-left [&:first-child]:rounded-l-md [&:last-child]:rounded-r-md",
      "[&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:pl-3 sm:[&:has([role=checkbox])]:pl-4",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      // Responsive padding
      "px-3 py-3 sm:px-4 md:px-6",
      // Mobile optimizations
      "text-xs sm:text-sm",
      // Truncate long text on mobile
      "truncate",
      // Better vertical alignment
      "align-middle",
      // Checkbox spacing
      "[&:has([role=checkbox])]:pr-0 [&:has([role=checkbox])]:pl-3 sm:[&:has([role=checkbox])]:pl-4",
      // Status pill support
      "[data-status]:inline-flex [data-status]:px-2.5 [data-status]:py-1 [data-status]:rounded-full [data-status]:text-xs [data-status]:font-medium",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn(
      "mt-4 px-4 pb-2 text-xs text-muted-foreground/70",
      "sm:text-sm border-t border-border/30 pt-4",
      className
    )}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

// Bonus: Mobile-optimized Table Toolbar
const TableToolbar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:pt-0 border-b border-border/50 bg-muted/20",
      "rounded-t-xl",
      className
    )}
    {...props}
  />
));
TableToolbar.displayName = "TableToolbar";

// Bonus: Responsive Data Empty State
const TableEmpty = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { colSpan?: number }
>(({ className, colSpan = 1, children, ...props }, ref) => (
  <tr ref={ref} {...props}>
    <td
      colSpan={colSpan}
      className={cn(
        "h-32 text-center py-12",
        "text-muted-foreground/60",
        className
      )}
    >
      <div className="flex flex-col items-center gap-2 px-4">
        {children || (
          <>
            <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-sm font-medium">No results found</p>
            <p className="text-xs">Try adjusting your search or filters</p>
          </>
        )}
      </div>
    </td>
  </tr>
));
TableEmpty.displayName = "TableEmpty";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  TableToolbar,
  TableEmpty,
};
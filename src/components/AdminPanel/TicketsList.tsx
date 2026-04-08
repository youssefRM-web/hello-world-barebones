import { useState } from "react";
import {
  Search,
  Filter,
  Circle,
  Bot,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

import type { AdminTicket } from "@/pages/AdminTickets";

interface TicketsListProps {
  tickets: AdminTicket[];
  selectedTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
}

export function TicketsList({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: TicketsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Dec " + date.getDate();
    return "Dec " + date.getDate();
  };

  return (
    <TooltipProvider>
      <div
        className={cn(
          "border-r border-border flex flex-col bg-background transition-all duration-300",
          isCollapsed ? "w-[60px]" : "w-[380px]",
        )}
      >
        {/* Header with toggle */}
        <div className="p-2 border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex gap-2 flex-1 mr-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-muted/50"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Tickets List */}
        <div className="flex-1 overflow-auto">
          {filteredTickets.map((ticket) => (
            <Tooltip key={ticket.id}>
              <TooltipTrigger asChild>
                <div
                  onClick={() => onSelectTicket(ticket.id)}
                  className={cn(
                    "border-b border-border cursor-pointer transition-colors hover:bg-muted/50",
                    selectedTicketId === ticket.id && "bg-muted",
                    isCollapsed
                      ? "p-2 flex items-center justify-center"
                      : "p-4",
                  )}
                >
                  {isCollapsed ? (
                    // Collapsed view - only show ticket ID
                    <div className="flex flex-col items-center gap-1">
                      <Circle
                        className={cn(
                          "h-2.5 w-2.5 fill-current",
                          ticket.status === "open"
                            ? "text-green-500"
                            : "text-blue-500",
                        )}
                      />
                      <span className="text-xs text-muted-foreground font-medium">
                        #{ticket.ticketNumber}
                      </span>
                    </div>
                  ) : (
                    // Expanded view - full ticket info
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Circle
                            className={cn(
                              "h-2.5 w-2.5 fill-current",
                              ticket.status === "open"
                                ? "text-green-500"
                                : "text-blue-500",
                            )}
                          />
                          <span className="text-sm text-muted-foreground">
                            #{ticket.ticketNumber}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(ticket.createdAt)}
                        </span>
                      </div>

                      <h3 className="font-medium text-sm mb-1 text-foreground first-letter:uppercase">
                        {ticket.subject}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3 first-letter:uppercase">
                        {ticket.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {ticket?.customer?.avatar ? (
                              <AvatarImage src={ticket.customer.avatar} />
                            ) : (
                              <AvatarFallback className="bg-[#0F4C7BFF] text-white rounded-md text-sm font-medium">
                                {ticket.customer.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          {/* <span className="text-xs text-muted-foreground first-letter:uppercase">{ticket.customer.name}</span> */}
                        </div>
                        <div className="flex items-center gap-1">
                          {ticket.assignee && (
                            <Avatar className="h-9 w-9 border-2 border-background">
                              {ticket?.customer?.avatar ? (
                                <AvatarImage src={ticket.assignee.avatar} />
                              ) : (
                                <AvatarFallback className="bg-[#0F4C7BFF] text-white rounded-md text-sm font-medium">
                                  {ticket.assignee.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              )}
                            </Avatar>
                          )}
                          <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                            <Bot className="h-3 w-3 text-green-600" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">
                  <p className="font-medium">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {ticket.customer.name}
                  </p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

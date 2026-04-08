import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MessageCircle, Ticket } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatDateTime } from "@/utils/dateUtils";
import { getTicketStatusConfig } from "./ticketUtils";

interface Ticket {
  _id: string;
  id: string;
  subject: string;
  lastUpdate: string;
  status: "closed" | "awaiting" | "open" | "pending" | "in_progress" | "resolved";
  hasUnread?: boolean;
}

interface SupportTicketListProps {
  tickets: Ticket[];
  onTicketClick: (ticket: Ticket) => void;
}

const SupportTicketList = ({
  tickets,
  onTicketClick,
}: SupportTicketListProps) => {
  const { t } = useLanguage();

  return (
    <Card className="border-none p-0">
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                {/* <TableHead className="w-10"></TableHead> */}
                <TableHead className="w-10"></TableHead>
                <TableHead className="w-24">{t("common.id")}</TableHead>
                <TableHead>{t("support.subject")}</TableHead>
                <TableHead className="min-w-[140px]">
                  {t("support.lastUpdate")}
                </TableHead>
                <TableHead className="min-w-[120px]">
                  {t("common.status")}
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {
                tickets?.length > 0 ? (

                  tickets.map((ticket) => (
                    <TableRow
                      key={ticket.id}
                      className="cursor-pointer hover:bg-accent/50"
                      onClick={() => onTicketClick(ticket)}
                    >
                      {/* <TableCell>
                        {" "}
                        {ticket.hasUnread && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </TableCell> */}
                      <TableCell>
                        <MessageCircle className="w-4 h-4 text-gray-400" />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">{ticket.id}</div>
                      </TableCell>
                      <TableCell className="first-letter:uppercase">{ticket.subject}</TableCell>

                      <TableCell className="text-foreground">
                        {formatDateTime(ticket.lastUpdate)}
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const config = getTicketStatusConfig(ticket.status);
                          return (
                            <span className={`px-2 py-1 rounded text-sm font-medium flex items-center gap-2 w-fit first-letter:uppercase ${config.classes}`}>
                              {config.icon}
                              {config.translationKey ? t(config.translationKey) : config.label}
                            </span>
                          );
                        })()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (

                  <TableRow>
                    <TableCell
                      colSpan={14}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>{t("support.notFound")}</p>
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportTicketList;
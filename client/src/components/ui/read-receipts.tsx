import { MessageRead } from "@shared/schema";
import { Check, CheckCheck } from "lucide-react";

interface ReadReceiptsProps {
  readBy: MessageRead[];
  currentUserId: string;
  isCurrentUserMessage: boolean;
}

export function ReadReceipts({ readBy, currentUserId, isCurrentUserMessage }: ReadReceiptsProps) {
  // Only show read receipts for messages sent by current user
  if (!isCurrentUserMessage) return null;

  const otherReads = readBy.filter(read => read.userId !== currentUserId);
  
  return (
    <div className="flex items-center justify-end gap-1 mt-1">
      {otherReads.length > 0 ? (
        <div className="flex items-center gap-1">
          <CheckCheck className="h-4 w-4 text-emerald-500" />
          <span className="text-xs text-slate-600 dark:text-slate-400">
            Read by {otherReads.length} {otherReads.length === 1 ? "person" : "people"}
          </span>
        </div>
      ) : (
        <Check className="h-4 w-4 text-slate-400" />
      )}
    </div>
  );
}
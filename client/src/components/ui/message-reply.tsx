import { Message, WebSocketMessage } from "@shared/schema";
import { X } from "lucide-react";
import { Button } from "./button";

interface MessageReplyProps {
  replyingTo: Message | WebSocketMessage | null;
  onCancel: () => void;
}

export function MessageReply({ replyingTo, onCancel }: MessageReplyProps) {
  if (!replyingTo) return null;

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 border-l-4 border-emerald-500 mb-2 rounded-r-lg">
      <div className="flex-1">
        <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
          Replying to {replyingTo.sender}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-md">
          {replyingTo.content}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCancel}
        className="h-8 w-8 p-0 hover:bg-slate-200 dark:hover:bg-slate-700"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
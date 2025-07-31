import { memo, useCallback, useMemo } from "react";
import { FixedSizeList as List } from "react-window";
import { MessageBubble } from "./message-bubble";
import type { Message, WebSocketMessage } from "@shared/schema";

interface VirtualizedMessageListProps {
  messages: (Message | WebSocketMessage)[];
  currentUser: { username: string } | null;
  height: number;
}

const MessageRow = memo(({ index, style, data }: any) => {
  const { messages, currentUser } = data;
  const message = messages[index];
  const isCurrentUser = currentUser?.username === message.sender;

  return (
    <div style={style}>
      <MessageBubble message={message} isCurrentUser={isCurrentUser} />
    </div>
  );
});

export const VirtualizedMessageList = memo(function VirtualizedMessageList({
  messages,
  currentUser,
  height,
}: VirtualizedMessageListProps) {
  const itemData = useMemo(() => ({
    messages,
    currentUser,
  }), [messages, currentUser]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <List
      height={height}
      itemCount={messages.length}
      itemSize={80}
      itemData={itemData}
      overscanCount={5}
      className="scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800"
    >
      {MessageRow}
    </List>
  );
});
"use client";

import { Message } from "@/types";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-purple-600 text-white rounded-br-md"
            : "bg-gray-800 text-gray-100 rounded-bl-md"
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-400">
            <span>🤖</span>
            <span>Life-Sync Assistant</span>
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {formatMessage(message.content)}
        </div>
        <div
          className={`text-xs mt-2 ${
            isUser ? "text-purple-200" : "text-gray-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}

function formatMessage(content: string) {
  // Simple markdown-like formatting
  return content.split("\n").map((line, i) => {
    // Bold text
    const boldFormatted = line.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-semibold">$1</strong>'
    );

    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: boldFormatted }} />
        {i < content.split("\n").length - 1 && <br />}
      </span>
    );
  });
}

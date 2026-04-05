"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { REQUEST } from "@/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Types

type MessageRole = "user" | "assistant";

type ChatMessage = {
  role: MessageRole;
  content: string;
  created_at?: string;
};

type SendMessageResponse = {
  answer: string;
  notebook_id: string;
};

// Helpers

async function fetchConversationHistory(folderId: string): Promise<ChatMessage[]> {
  // Pass folder_id as a query param in the URL — GET requests have no body
  const history = await REQUEST("GET", `chat/message/?folder_id=${folderId}`);
  return Array.isArray(history) ? history : [];
}

async function sendChatMessage(
  folderId: string,
  query: string
): Promise<SendMessageResponse> {
  // folder_id and query go in the JSON body — matches what your view expects
  return REQUEST("POST", "chat/message/", { folder_id: folderId, query });
}
// Sub-components

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`
          max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
          ${isUser
            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
            : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100"
          }
        `}
      >
        {message.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl px-4 py-3 flex gap-1 items-center">
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500 animate-bounce"
            style={{ animationDelay: `${dot * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// Page

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const folderId = params.id;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await fetchConversationHistory(folderId);
        setMessages(history);
      } catch {
        // Non-critical — just start with an empty state
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadHistory();
  }, [folderId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSendMessage() {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || isLoading) return;

    setErrorMessage(null);

    const userMessage: ChatMessage = { role: "user", content: trimmedInput };
    setMessages((previous) => [...previous, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await sendChatMessage(folderId, trimmedInput);
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.answer,
      };
      setMessages((previous) => [...previous, assistantMessage]);
    } catch (error) {
      setErrorMessage("Something went wrong. Please try again.");
      // Remove the optimistically-added user message on failure
      setMessages((previous) => previous.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-neutral-950">

      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
        <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          Notebook Chat
        </p>
        <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
          Ask questions about your documents
        </p>
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {isLoadingHistory ? (
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-600">
            Loading conversation…
          </p>
        ) : messages.length === 0 ? (
          <p className="text-center text-xs text-neutral-400 dark:text-neutral-600">
            No messages yet. Ask something to get started.
          </p>
        ) : (
          messages.map((message, index) => (
            <MessageBubble key={index} message={message} />
          ))
        )}

        {isLoading && <TypingIndicator />}

        {errorMessage && (
          <p className="text-center text-xs text-red-500">{errorMessage}</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 px-6 py-4">
        <div className="flex gap-3 items-center">
          <Input
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question…"
            disabled={isLoading}
            className="flex-1 text-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 rounded-xl"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || inputText.trim() === ""}
            className="rounded-xl px-5 text-sm font-medium"
          >
            Send
          </Button>
        </div>
      </div>

    </div>
  );
}
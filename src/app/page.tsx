"use client";

import { useState, useRef, useEffect } from "react";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import Sidebar from "@/components/Sidebar";
import { Message, Conversation } from "@/types";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "New Conversation",
      messages: [],
      createdAt: new Date().toISOString(),
    },
  ]);
  const [activeConversationId, setActiveConversationId] = useState("1");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date().toISOString(),
    };

    // Add user message
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === activeConversationId
          ? {
              ...conv,
              messages: [...conv.messages, userMessage],
              title:
                conv.messages.length === 0
                  ? content.slice(0, 30) + "..."
                  : conv.title,
            }
          : conv
      )
    );

    setIsLoading(true);

    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getSimulatedResponse(content),
        timestamp: new Date().toISOString(),
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === activeConversationId
            ? { ...conv, messages: [...conv.messages, assistantMessage] }
            : conv
        )
      );
      setIsLoading(false);
    }, 1000);
  };

  const handleNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(conversations[0]?.id || "");
    }
  };

  return (
    <div className='flex h-screen'>
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {/* Header */}
        <header className='bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3'>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className='p-2 hover:bg-gray-800 rounded-lg lg:hidden'>
            <svg
              className='w-5 h-5'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>
          <div className='flex items-center gap-2'>
            <span className='text-2xl'>🤖</span>
            <h1 className='text-lg font-semibold'>Life-Sync Assistant</h1>
          </div>
          <span className='text-xs bg-purple-600 px-2 py-1 rounded-full ml-2'>
            Beta
          </span>
        </header>

        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4'>
          {activeConversation?.messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSendMessage} />
          ) : (
            <>
              {activeConversation?.messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className='flex items-center gap-2 text-gray-400'>
                  <div className='flex gap-1'>
                    <span className='w-2 h-2 bg-purple-500 rounded-full animate-bounce' />
                    <span
                      className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className='text-sm'>Thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}

function WelcomeScreen({
  onSuggestionClick,
}: {
  onSuggestionClick: (text: string) => void;
}) {
  const suggestions = [
    { icon: "💰", text: "How much did I spend this week?" },
    { icon: "📝", text: "Show my pending tasks" },
    { icon: "🎯", text: "What are my active goals?" },
    { icon: "🛒", text: "What's on my shopping list?" },
  ];

  return (
    <div className='flex flex-col items-center justify-center h-full text-center px-4'>
      <div className='text-6xl mb-4'>🤖</div>
      <h2 className='text-2xl font-bold mb-2'>
        Welcome to Life-Sync Assistant
      </h2>
      <p className='text-gray-400 mb-8 max-w-md'>
        I can help you manage your finances, notes, todos, and more. Ask me
        anything!
      </p>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg'>
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSuggestionClick(suggestion.text)}
            className='flex items-center gap-3 p-4 bg-gray-900 hover:bg-gray-800 rounded-xl border border-gray-800 transition-colors text-left'>
            <span className='text-2xl'>{suggestion.icon}</span>
            <span className='text-sm text-gray-300'>{suggestion.text}</span>
          </button>
        ))}
      </div>

      <div className='mt-8 flex gap-4 text-sm text-gray-500'>
        <a
          href='/life-sync/wealth'
          className='hover:text-purple-400 transition-colors'>
          💰 Wealth Pulse
        </a>
        <span>•</span>
        <a
          href='/life-sync/notes'
          className='hover:text-purple-400 transition-colors'>
          📝 Life Notes
        </a>
        <span>•</span>
        <a
          href='/life-sync'
          className='hover:text-purple-400 transition-colors'>
          🏠 Gateway
        </a>
      </div>
    </div>
  );
}

// Simulated responses (will be replaced with actual AI)
function getSimulatedResponse(input: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes("spend") || lowerInput.includes("expense")) {
    return "Based on your data from Wealth Pulse, you spent **₹12,500** this week. Your top categories were:\n\n- 🍔 Food: ₹4,200\n- 🚗 Transport: ₹3,100\n- 🛒 Shopping: ₹2,800\n- 🎬 Entertainment: ₹2,400\n\nWould you like me to show more details or compare with last week?";
  }

  if (
    lowerInput.includes("task") ||
    lowerInput.includes("todo") ||
    lowerInput.includes("pending")
  ) {
    return "Here are your pending tasks from Life Notes:\n\n1. ✅ **Review PR** (High priority, due today)\n2. ✅ **Call dentist** (Medium priority)\n3. ✅ **Buy groceries** (Shopping list)\n4. ✅ **Complete DevOps module** (Goal)\n\nWould you like me to mark any as complete?";
  }

  if (lowerInput.includes("goal")) {
    return "Your active goals from Life Notes:\n\n🎯 **Learn Kubernetes** - 40% complete\n🎯 **Save ₹50,000** - 65% complete\n🎯 **Read 12 books this year** - 8/12 done\n\nKeep going! You're making great progress! 💪";
  }

  if (lowerInput.includes("shopping") || lowerInput.includes("list")) {
    return "Your shopping list:\n\n🛒 Milk (2)\n🛒 Bread\n🛒 Eggs (12)\n🛒 Vegetables\n🛒 Coffee beans\n\nWant me to add anything else?";
  }

  if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
    return "Hello! 👋 I'm your Life-Sync Assistant. I can help you with:\n\n- 💰 **Expenses & Finances** from Wealth Pulse\n- 📝 **Notes & Todos** from Life Notes\n- 🎯 **Goals & Habits** tracking\n- 🛒 **Shopping lists**\n\nWhat would you like to know?";
  }

  return (
    "I understand you're asking about: \"" +
    input +
    "\"\n\nI'm currently in beta mode with simulated responses. Soon I'll be connected to your actual data from Wealth Pulse and Life Notes!\n\nTry asking about:\n- Your spending this week\n- Pending tasks\n- Active goals\n- Shopping list"
  );
}

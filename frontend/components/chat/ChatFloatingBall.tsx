/**
 * ChatFloatingBall Component - Professional floating AI assistant button
 *
 * Modern, animated floating orb that toggles chat interface open/closed.
 * Positioned in bottom-right corner (desktop) or bottom-center (mobile).
 */

"use client";

import React from "react";

interface ChatFloatingBallProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function ChatFloatingBall({ isOpen, onClick }: ChatFloatingBallProps) {
  const buttonClass = isOpen
    ? "fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 rounded-full text-white shadow-2xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 active:scale-95 z-50"
    : "fixed bottom-6 right-6 md:bottom-8 md:right-8 w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600 text-white shadow-2xl flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:shadow-purple-300/50 active:scale-95 z-50 animate-bounce-slow";

  return (
    <button
      onClick={onClick}
      className={buttonClass}
      aria-label={isOpen ? "Close chat" : "Open AI chat assistant"}
    >
      {isOpen ? (
        /* Close icon */
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ) : (
        <div className="relative">
          {/* AI sparkle icon */}
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>

          {/* Pulse ring animation */}
          <span className="absolute inset-0 rounded-full bg-purple-500 opacity-75 animate-ping"></span>
        </div>
      )}

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </button>
  );
}

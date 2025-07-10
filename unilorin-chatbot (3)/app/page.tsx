"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { SendHorizonalIcon,SendHorizonalIcon,Send, Sparkles, BookIcon,BookIcon,GraduationCap, User, Clock, ThumbsUp, ThumbsDown, AlertCircle, RefreshCw } from "lucide-react"

const SUGGESTIONS = [
  "How do I register for courses this semester?",
  "What are the important academic calendar dates?",
  "How can I check my current GPA and results?",
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function UnilorinChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [feedback, setFeedback] = useState<{ [key: string]: "positive" | "negative" | null }>({})
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (messages.length > 0) {
      setShowChat(true)
    }
  }, [messages])

  useEffect(() => {
    if (input && errorMessage) {
      setErrorMessage(null)
    }
  }, [input, errorMessage])

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return

    setIsLoading(true)
    setErrorMessage(null)

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageContent,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    try {
      // Send to our API route which calls the custom UNILORIN API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [userMessage],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const responseText = await response.text()

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Error sending message:", error)
      setErrorMessage("I'm having trouble connecting right now. Please try again.")

      // Add fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm here to help with your UNILORIN academic questions! Please try asking again, or contact the appropriate department for official matters.",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleFeedback = (messageId: string, type: "positive" | "negative") => {
    setFeedback((prev) => ({ ...prev, [messageId]: type }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleRetry = () => {
    setErrorMessage(null)
    if (messages.length > 0) {
      const lastUserMessage = messages.filter((m) => m.role === "user").pop()
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!showChat ? (
          // Initial Welcome Screen
          <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="relative">
                <Sparkles className="w-12 h-12 text-emerald-600 mx-auto animate-pulse" />
                
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight">
                Ask our{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AI</span>{" "}
                anything
              </h1>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                Get instant help with your UNILORIN academic journey
              </p>
            </div>

            {/* Error Message on Welcome Screen */}
            {errorMessage && (
              <div className="w-full max-w-2xl">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <p className="text-emerald-800 text-sm">{errorMessage}</p>
                  </div>
                  <Button
                    onClick={handleRetry}
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div className="w-full max-w-2xl space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Suggestions on what to ask Our AI</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {SUGGESTIONS.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="p-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 border-transparent hover:border-emerald-200 bg-white/70 backdrop-blur-sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{suggestion}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="w-full max-w-2xl">
              <form onSubmit={handleFormSubmit} className="relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your academics at UNILORIN..."
                  className="w-full h-14 pl-6 pr-14 text-lg rounded-2xl border-2 border-emerald-200 focus:border-emerald-400 bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <SendHorizonalIcon className="w-4 h-4" />}
                </Button>
              </form>
              <p className="text-sm text-gray-500 mt-4 text-center">
                This AI assistant provides general guidance. For official matters, contact the appropriate department.
              </p>
            </div>
          </div>
        ) : (
          // Chat Interface
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center py-6">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <BookIcon className="w-8 h-8 text-emerald-600" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  UNILORIN Academic Assistant
                </h1>
              </div>
              <p className="text-gray-600">Your AI-powered academic guidance companion</p>
            </div>

            {/* Error Message in Chat */}
            {errorMessage && (
              <div className="max-w-2xl mx-auto mb-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-emerald-800 font-medium">Working on it!</p>
                      <p className="text-emerald-600 text-sm">{errorMessage}</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleRetry}
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="space-y-6 mb-8">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                    <div className="flex items-start space-x-3">
                      {message.role === "assistant" && (
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <BookIcon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl px-6 py-4 shadow-lg backdrop-blur-sm ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white ml-auto"
                            : "bg-white/80 text-gray-800 border border-emerald-100"
                        }`}
                      >
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                      </div>
                      {message.role === "user" && (
                        <div className="w-10 h-10 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>

                    {message.role === "assistant" && (
                      <div className="flex items-center space-x-3 mt-3 ml-13">
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(message.id, "positive")}
                            className={`h-8 px-3 rounded-lg transition-all duration-200 ${
                              feedback[message.id] === "positive"
                                ? "bg-green-100 text-green-600 shadow-sm"
                                : "text-gray-400 hover:text-green-600 hover:bg-green-50"
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(message.id, "negative")}
                            className={`h-8 px-3 rounded-lg transition-all duration-200 ${
                              feedback[message.id] === "negative"
                                ? "bg-red-100 text-red-600 shadow-sm"
                                : "text-gray-400 hover:text-red-600 hover:bg-red-50"
                            }`}
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-emerald-100">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="sticky bottom-0 bg-gradient-to-t from-emerald-50 to-transparent pt-6 pb-4">
              <form onSubmit={handleFormSubmit} className="relative max-w-2xl mx-auto">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Continue the conversation..."
                  className="w-full h-14 pl-6 pr-14 text-lg rounded-2xl border-2 border-emerald-200 focus:border-emerald-400 bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl transition-all duration-200"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50"
                >
                  {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <SendHorizonalIcon className="w-4 h-4" />}
                </Button>
              </form>
              <p className="text-xs text-gray-500 mt-3 text-center max-w-2xl mx-auto">
                This AI assistant provides general guidance. For official matters, contact the appropriate department.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

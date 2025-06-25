import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  typing?: boolean;
}

interface ChatBotProps {
  webhookUrl?: string; // URL webhook n8n
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  botName?: string;
  welcomeMessage?: string;
}

const ChatBot: React.FC<ChatBotProps> = ({
  webhookUrl = 'https://vertically-possible-amoeba.ngrok-free.app/webhook-test/0f8b8e46-3150-4d54-9ed4-5bf0d7952d17',
  position = 'bottom-right',
  primaryColor = '#ef4444',
  botName = 'DarahConnect Assistant',
  welcomeMessage = 'Halo! Saya assistant DarahConnect. Ada yang bisa saya bantu hari ini?'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: '1',
        text: welcomeMessage,
        sender: 'bot',
        timestamp: new Date()
      }]);
    }
  }, [isOpen, welcomeMessage]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Send to n8n webhook
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
        body: JSON.stringify({
          message: inputText,
          timestamp: new Date().toISOString(),
          sessionId: `session_${Date.now()}`, // Simple session ID
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        console.error('HTTP Error:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check if response has content
      const responseText = await response.text();
      if (!responseText || responseText.trim() === '') {
        throw new Error('Empty response from webhook');
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
        console.log('Response from n8n:', data); // Debug log
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.log('Raw response:', responseText);
        throw new Error('Invalid JSON response from webhook');
      }
      
      // Simulate typing delay
      setTimeout(() => {
        setIsTyping(false);
        
        // Try different possible response formats from n8n
        let responseText = '';
        
        // Handle array response (n8n AI Agent format)
        if (Array.isArray(data) && data.length > 0) {
          if (data[0].output) {
            responseText = data[0].output;
          } else if (data[0].response) {
            responseText = data[0].response;
          } else if (data[0].message) {
            responseText = data[0].message;
          }
        }
        // Handle object response
        else if (data.response) {
          responseText = data.response;
        } else if (data.message) {
          responseText = data.message;
        } else if (data.output) {
          responseText = data.output;
        } else if (typeof data === 'string') {
          responseText = data;
        } else if (data.body && data.body.response) {
          responseText = data.body.response;
        } else if (data.body && data.body.message) {
          responseText = data.body.message;
        }
        
        // If still no response found, fallback
        if (!responseText) {
          console.log('Full response data:', JSON.stringify(data, null, 2));
          responseText = 'Maaf, saya tidak bisa memahami pertanyaan Anda. Bisakah Anda mencoba lagi?';
        }
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 1000 + Math.random() * 1000); // 1-2 seconds typing simulation

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Maaf, terjadi kesalahan: ${error instanceof Error ? error.message : 'Unknown error'}. Silakan coba lagi atau hubungi tim support kami di support@darahconnect.com`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Function to convert URLs in text to clickable links
  const renderTextWithLinks = (text: string) => {
    // Regex untuk mendeteksi URL
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // Split text berdasarkan URL
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      // Jika part adalah URL, buat sebagai link
      if (urlRegex.test(part)) {
        // Cek jika URL adalah WhatsApp link
        const isWhatsAppLink = part.includes('wa.me');
        
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={`${
              isWhatsAppLink 
                ? 'inline-flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-md hover:bg-green-600 text-xs font-medium no-underline' 
                : 'text-blue-600 hover:text-blue-800 underline break-all'
            }`}
          >
            {isWhatsAppLink && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.382"/>
              </svg>
            )}
            {isWhatsAppLink ? 'Chat WhatsApp' : part}
          </a>
        );
      }
      // Jika bukan URL, return sebagai text biasa dengan line breaks
      return part.split('\n').map((line, lineIndex, lines) => (
        <span key={`${index}-${lineIndex}`}>
          {line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      ));
    });
  };

  const positionClasses = position === 'bottom-right' 
    ? 'bottom-6 right-6' 
    : 'bottom-6 left-6';

  return (
    <div className={`fixed ${positionClasses} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4 w-80 sm:w-96 h-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div 
              className="p-4 text-white rounded-t-2xl flex items-center justify-between"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{botName}</h3>
                  <p className="text-xs opacity-90">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs ${
                      message.sender === 'user' 
                        ? 'bg-blue-500' 
                        : 'bg-gray-600'
                    }`}>
                      {message.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                    </div>
                    <div className={`p-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md border'
                    }`}>
                      <div className="text-sm">
                        {renderTextWithLinks(message.text)}
                      </div>
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-end space-x-2">
                    <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
                      <Bot size={12} />
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-bl-md border">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan Anda..."
                  className="flex-1 p-2 border border-gray-300 rounded-full px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputText.trim() || isLoading}
                  className="p-2 rounded-full text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Button - hanya tampil ketika chat tertutup */}
      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative"
          style={{ backgroundColor: primaryColor }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.2 }}
        >
          <MessageCircle size={20} />
          
          {/* Notification dot */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </motion.button>
      )}
    </div>
  );
};

export default ChatBot; 
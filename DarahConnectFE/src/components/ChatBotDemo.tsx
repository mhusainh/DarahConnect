import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatBotDemoProps {
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  botName?: string;
  welcomeMessage?: string;
}

const ChatBotDemo: React.FC<ChatBotDemoProps> = ({
  position = 'bottom-right',
  primaryColor = '#ef4444',
  botName = 'DarahConnect Assistant Demo',
  welcomeMessage = 'Halo! Saya assistant DarahConnect (Demo Mode). Ada yang bisa saya bantu hari ini? 🩸'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Demo responses untuk testing
  const getDemoResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('donor') || lowerMessage.includes('donasi')) {
      return 'Terima kasih atas minat Anda untuk menjadi donor darah! 🩸\n\nUntuk mendaftar sebagai donor, Anda bisa:\n1. Klik menu "Donor" di website\n2. Isi formulir pendaftaran\n3. Pilih lokasi dan jadwal yang tersedia\n\nApakah ada hal lain yang ingin Anda tanyakan?';
    } else if (lowerMessage.includes('syarat') || lowerMessage.includes('persyaratan')) {
      return 'Syarat menjadi donor darah:\n\n✅ Usia 17-65 tahun\n✅ Berat badan minimal 45kg\n✅ Kondisi sehat\n✅ Tidak sedang hamil/menyusui\n✅ Tidak mengonsumsi obat tertentu\n✅ Tidak memiliki riwayat penyakit tertentu\n\nIngin tahu lebih detail? Silakan hubungi tim medis kami!';
    } else if (lowerMessage.includes('jadwal') || lowerMessage.includes('waktu')) {
      return 'Jadwal donor darah tersedia:\n\n🕐 Senin-Jumat: 08:00-16:00\n🕐 Sabtu: 08:00-14:00\n🕐 Minggu: Libur\n\nUntuk melihat jadwal campaign terdekat, silakan kunjungi halaman "Campaign" di website kami.';
    } else if (lowerMessage.includes('lokasi') || lowerMessage.includes('tempat')) {
      return 'Kami memiliki lokasi donor darah di seluruh Indonesia! 📍\n\nUntuk melihat lokasi terdekat dari Anda, silakan gunakan fitur "Location Picker" di halaman donor atau campaign.\n\nApakah Anda ingin saya bantu mencari lokasi di kota tertentu?';
    } else if (lowerMessage.includes('bantuan') || lowerMessage.includes('help')) {
      return 'Saya di sini untuk membantu Anda! 😊\n\nBeberapa hal yang bisa saya bantu:\n• Informasi tentang donor darah\n• Syarat dan persyaratan donor\n• Jadwal dan lokasi donor\n• Cara mendaftar sebagai donor\n• Informasi campaign yang sedang berjalan\n\nSilakan tanyakan apa yang ingin Anda ketahui!';
    } else if (lowerMessage.includes('terima kasih') || lowerMessage.includes('thanks')) {
      return 'Sama-sama! 😊 Terima kasih sudah peduli dengan kegiatan donor darah. Jika ada pertanyaan lain, jangan ragu untuk bertanya ya!';
    } else if (lowerMessage.includes('halo') || lowerMessage.includes('hai') || lowerMessage.includes('hello')) {
      return 'Halo! Selamat datang di DarahConnect! 👋\n\nSaya siap membantu Anda dengan informasi seputar donor darah. Apa yang ingin Anda ketahui hari ini?';
    } else if (lowerMessage.includes('covid') || lowerMessage.includes('vaksin')) {
      return 'Terkait COVID-19 dan vaksinasi:\n\n💉 Donor yang sudah divaksin COVID-19 boleh mendonor\n⏰ Tunggu minimal 7 hari setelah vaksinasi\n🤒 Jika ada gejala, tunggu hingga sembuh total\n📋 Bawa kartu vaksin saat donor\n\nUntuk info terkini, silakan hubungi PMI terdekat!';
    } else if (lowerMessage.includes('demo') || lowerMessage.includes('test')) {
      return 'Ini adalah mode demo chatbot DarahConnect! 🤖\n\nFitur yang tersedia:\n• Response otomatis untuk pertanyaan umum\n• Simulasi typing indicator\n• Interface yang responsif\n• Integrasi mudah dengan n8n webhook\n\nUntuk production, ganti dengan URL webhook n8n Anda.';
    } else {
      const responses = [
        'Terima kasih atas pertanyaan Anda! 😊\n\nUntuk informasi lebih detail, Anda bisa:\n• Menghubungi tim support di support@darahconnect.com\n• Telepon hotline: 021-1234-5678\n• Atau kunjungi halaman FAQ di website kami',
        'Maaf, saya belum memahami pertanyaan Anda. Bisakah Anda menjelaskan lebih spesifik?\n\nAtau Anda bisa mencoba bertanya tentang:\n• Syarat donor darah\n• Jadwal dan lokasi\n• Cara mendaftar donor',
        'Untuk pertanyaan yang lebih kompleks, saya sarankan menghubungi tim customer service kami yang berpengalaman.\n\n📞 Hotline: 021-1234-5678\n📧 Email: support@darahconnect.com\n🕐 Jam operasional: 08:00-17:00 WIB'
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

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
    const currentMessage = inputText;
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate processing delay
    const delay = 800 + Math.random() * 1200; // 0.8-2 seconds
    
    setTimeout(() => {
      setIsTyping(false);
      const response = getDemoResponse(currentMessage);
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, delay);
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
                  <p className="text-xs opacity-90">Demo Mode</p>
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
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
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

      {/* Chat Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative"
        style={{ backgroundColor: primaryColor }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircle size={20} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Demo badge */}
        <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-1 py-0.5 rounded-md font-medium">
          DEMO
        </div>
        
        {/* Notification dot */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-pulse"></div>
        )}
      </motion.button>
    </div>
  );
};

export default ChatBotDemo; 
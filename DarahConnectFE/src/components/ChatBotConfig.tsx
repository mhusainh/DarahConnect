import React, { useState } from 'react';
import { Settings, Save, TestTube, CheckCircle, XCircle } from 'lucide-react';

interface ChatBotConfigProps {
  onSave?: (config: ChatBotSettings) => void;
}

interface ChatBotSettings {
  webhookUrl: string;
  botName: string;
  welcomeMessage: string;
  primaryColor: string;
  position: 'bottom-right' | 'bottom-left';
  enabled: boolean;
  responseTimeout: number;
  fallbackMessage: string;
}

const ChatBotConfig: React.FC<ChatBotConfigProps> = ({ onSave }) => {
  const [config, setConfig] = useState<ChatBotSettings>({
    webhookUrl: 'https://vertically-possible-amoeba.ngrok-free.app/webhook-test/0f8b8e46-3150-4d54-9ed4-5bf0d7952d17',
    botName: 'DarahConnect Assistant',
    welcomeMessage: 'Halo! Saya assistant DarahConnect. Ada yang bisa saya bantu hari ini? 🩸',
    primaryColor: '#ef4444',
    position: 'bottom-right',
    enabled: true,
    responseTimeout: 30000,
    fallbackMessage: 'Maaf, saya sedang mengalami gangguan. Silakan hubungi tim support kami di support@darahconnect.com'
  });

  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleInputChange = (field: keyof ChatBotSettings, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testWebhook = async () => {
    setTestStatus('testing');
    setTestMessage('');

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Test connection from DarahConnect admin panel',
          timestamp: new Date().toISOString(),
          sessionId: 'test_session',
          test: true
        }),
      });

      if (response.ok) {
        setTestStatus('success');
        setTestMessage('Webhook berhasil terhubung!');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      setTestStatus('error');
      setTestMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    setTimeout(() => {
      setTestStatus('idle');
      setTestMessage('');
    }, 3000);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
    
    // Save to localStorage for demo purposes
    localStorage.setItem('chatbotConfig', JSON.stringify(config));
    
    alert('Konfigurasi chatbot berhasil disimpan!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Settings className="mr-3 text-red-500" size={24} />
        <h2 className="text-xl font-semibold text-gray-900">Konfigurasi ChatBot</h2>
      </div>

      <div className="space-y-6">
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-3">Status ChatBot</span>
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => handleInputChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
          </label>
        </div>

        {/* Webhook URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Webhook n8n
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              value={config.webhookUrl}
              onChange={(e) => handleInputChange('webhookUrl', e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="https://your-n8n-instance.com/webhook/chat"
            />
            <button
              onClick={testWebhook}
              disabled={testStatus === 'testing' || !config.webhookUrl}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <TestTube size={16} />
              <span>{testStatus === 'testing' ? 'Testing...' : 'Test'}</span>
            </button>
          </div>
          
          {/* Test Status */}
          {testMessage && (
            <div className={`mt-2 p-2 rounded-md flex items-center space-x-2 ${
              testStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {testStatus === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span className="text-sm">{testMessage}</span>
            </div>
          )}
        </div>

        {/* Bot Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nama Bot
          </label>
          <input
            type="text"
            value={config.botName}
            onChange={(e) => handleInputChange('botName', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="DarahConnect Assistant"
          />
        </div>

        {/* Welcome Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pesan Selamat Datang
          </label>
          <textarea
            value={config.welcomeMessage}
            onChange={(e) => handleInputChange('welcomeMessage', e.target.value)}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Halo! Ada yang bisa saya bantu?"
          />
        </div>

        {/* Fallback Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pesan Error/Fallback
          </label>
          <textarea
            value={config.fallbackMessage}
            onChange={(e) => handleInputChange('fallbackMessage', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Maaf, terjadi kesalahan..."
          />
        </div>

        {/* Primary Color */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Warna Utama
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => handleInputChange('primaryColor', e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded-md"
            />
            <input
              type="text"
              value={config.primaryColor}
              onChange={(e) => handleInputChange('primaryColor', e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="#ef4444"
            />
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Posisi ChatBot
          </label>
          <select
            value={config.position}
            onChange={(e) => handleInputChange('position', e.target.value as 'bottom-right' | 'bottom-left')}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="bottom-right">Kanan Bawah</option>
            <option value="bottom-left">Kiri Bawah</option>
          </select>
        </div>

        {/* Response Timeout */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout Response (detik)
          </label>
          <input
            type="number"
            value={config.responseTimeout / 1000}
            onChange={(e) => handleInputChange('responseTimeout', parseInt(e.target.value) * 1000)}
            min="5"
            max="60"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center space-x-2"
          >
            <Save size={16} />
            <span>Simpan Konfigurasi</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotConfig; 
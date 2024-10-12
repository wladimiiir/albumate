import React, { useState, useEffect } from 'react';
import { HiSave } from 'react-icons/hi';
import { Settings } from '../types/electron';

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    openAIBaseURL: '',
    apiKey: '',
    model: 'gpt-3.5-turbo',
  });

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      const savedSettings = await window.api.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (): Promise<void> => {
    await window.api.saveSettings(settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="openAIBaseURL" className="block text-sm font-medium text-gray-700">OpenAI Base URL</label>
            <input
              type="text"
              id="openAIBaseURL"
              name="openAIBaseURL"
              value={settings.openAIBaseURL}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">API Key</label>
            <input
              type="password"
              id="apiKey"
              name="apiKey"
              value={settings.apiKey}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
            <select
              id="model"
              name="model"
              value={settings.model}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <HiSave className="mr-2 h-5 w-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;

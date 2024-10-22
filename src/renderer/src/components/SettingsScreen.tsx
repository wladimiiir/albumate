import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { HiSave } from 'react-icons/hi';
import { Settings, ModelProviderName, OpenAIProviderConfig, OllamaProviderConfig } from '@shared/types';

const DEFAULT_MODEL_PROVIDER_CONFIGS = {
  [ModelProviderName.OpenAI]: {
    name: ModelProviderName.OpenAI,
    openAIBaseURL: 'https://api.openai.com/v1',
    openAIApiKey: '',
    model: 'gpt-4o',
  } as OpenAIProviderConfig,
  [ModelProviderName.Ollama]: {
    name: ModelProviderName.Ollama,
    ollamaBaseURL: 'http://localhost:11434',
    model: '',
  } as OllamaProviderConfig,
};

const SettingsScreen: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [settings, setSettings] = useState<Settings>({
    modelProviderConfig: DEFAULT_MODEL_PROVIDER_CONFIGS[ModelProviderName.OpenAI],
  });
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  const loadModels = async (): Promise<void> => {
    try {
      const models = await window.api.getModels(settings);
      setAvailableModels(models);
      console.log(settings.modelProviderConfig);
      if (models.length > 0 && !settings.modelProviderConfig.model) {
        setSettings((prev) => ({ ...prev, modelProviderConfig: { ...prev.modelProviderConfig, model: models[0] } }));
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      enqueueSnackbar('Failed to load models', { variant: 'error' });
    }
  };

  useEffect(() => {
    const loadSettings = async (): Promise<void> => {
      const savedSettings = await window.api.getSettings();
      if (savedSettings) {
        setSettings(savedSettings);
      }
    };
    void loadSettings();
  }, []);

  useEffect(() => {
    void loadModels();
  }, [settings.modelProviderConfig.name]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      modelProviderConfig: {
        ...prev.modelProviderConfig,
        [name]: value,
      },
    }));

    if (name === 'name') {
      const providerName = value as ModelProviderName;
      setSettings(() => ({
        modelProviderConfig: DEFAULT_MODEL_PROVIDER_CONFIGS[providerName],
      }));
    }
  };

  const handleSave = async (): Promise<void> => {
    await window.api.saveSettings(settings);
    enqueueSnackbar('Settings saved successfully!', { variant: 'success' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Model Provider
            </label>
            <select
              id="name"
              name="name"
              value={settings.modelProviderConfig.name}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value={ModelProviderName.OpenAI}>OpenAI</option>
              <option value={ModelProviderName.Ollama}>Ollama</option>
            </select>
          </div>

          {settings.modelProviderConfig.name === ModelProviderName.OpenAI && (
            <>
              <div>
                <label htmlFor="openAIBaseURL" className="block text-sm font-medium text-gray-700">
                  OpenAI Base URL
                </label>
                <input
                  type="text"
                  id="openAIBaseURL"
                  name="openAIBaseURL"
                  value={(settings.modelProviderConfig as OpenAIProviderConfig).openAIBaseURL}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="openAIApiKey" className="block text-sm font-medium text-gray-700">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  id="openAIApiKey"
                  name="openAIApiKey"
                  value={(settings.modelProviderConfig as OpenAIProviderConfig).openAIApiKey}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </>
          )}

          {settings.modelProviderConfig.name === ModelProviderName.Ollama && (
            <div>
              <label htmlFor="ollamaBaseURL" className="block text-sm font-medium text-gray-700">
                Ollama Base URL
              </label>
              <input
                type="text"
                id="ollamaBaseURL"
                name="ollamaBaseURL"
                value={(settings.modelProviderConfig as OllamaProviderConfig).ollamaBaseURL}
                onChange={handleChange}
                onBlur={() => void loadModels()}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700">
              Model
            </label>
            <select
              id="model"
              name="model"
              value={settings.modelProviderConfig.model}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              {availableModels.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <HiSave className="mr-2 h-5 w-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;

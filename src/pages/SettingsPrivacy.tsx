import React from 'react';
import Settings from './Settings';

interface SettingsPrivacyProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SettingsPrivacy: React.FC<SettingsPrivacyProps> = ({ theme, toggleTheme }) => {
  // TODO: map to Settings activeTab="privacy"
  return <Settings theme={theme} toggleTheme={toggleTheme} />;
};

export default SettingsPrivacy;

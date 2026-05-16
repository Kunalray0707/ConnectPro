import React from 'react';
import Settings from './Settings';

interface SettingsSecurityProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SettingsSecurity: React.FC<SettingsSecurityProps> = ({ theme, toggleTheme }) => {
  // TODO: map to Settings activeTab="payment"/"verification"/etc as needed
  return <Settings theme={theme} toggleTheme={toggleTheme} />;
};

export default SettingsSecurity;

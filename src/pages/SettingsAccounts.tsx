import React from 'react';
import Settings from './Settings';

interface SettingsAccountsProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SettingsAccounts: React.FC<SettingsAccountsProps> = ({ theme, toggleTheme }) => {
  // Map to Settings activeTab="connected" (Connected Accounts)
  return <Settings theme={theme} toggleTheme={toggleTheme} />;
};

export default SettingsAccounts;


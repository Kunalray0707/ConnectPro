import React from 'react';
import Settings from './Settings';

interface SettingsNotificationsProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SettingsNotifications: React.FC<SettingsNotificationsProps> = ({ theme, toggleTheme }) => {
  // TODO: map to Settings activeTab="notifications"
  return <Settings theme={theme} toggleTheme={toggleTheme} />;
};

export default SettingsNotifications;

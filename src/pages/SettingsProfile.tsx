import React from 'react';
import Settings from './Settings';

interface SettingsProfileProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SettingsProfile: React.FC<SettingsProfileProps> = ({ theme, toggleTheme }) => {
  // TODO: when we add tab-routing support, map this to Settings activeTab="profile"
  return <Settings theme={theme} toggleTheme={toggleTheme} />;
};

export default SettingsProfile;

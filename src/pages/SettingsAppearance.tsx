import React from 'react';
import Settings from './Settings';

interface SettingsAppearanceProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SettingsAppearance: React.FC<SettingsAppearanceProps> = ({ theme, toggleTheme }) => {
  // TODO: map to Settings appearance preferences (may require new tab)
  return <Settings theme={theme} toggleTheme={toggleTheme} />;
};

export default SettingsAppearance;

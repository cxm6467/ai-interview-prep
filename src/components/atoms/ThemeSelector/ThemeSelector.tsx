import React, { useState } from 'react';
import type { Theme, ThemeType } from '@/types';
import { FiSettings, FiChevronDown } from 'react-icons/fi';
import styles from './ThemeSelector.module.css';

interface ThemeSelectorProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

/**
 * Available themes with categorization and accessibility information
 */
const availableThemes: Theme[] = [
  // Standard themes
  {
    id: 'light',
    name: 'Light',
    description: 'Clean white background with dark text',
    category: 'standard',
    className: 'theme-light',
    accessible: true
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Dark background with light text',
    category: 'standard',
    className: 'theme-dark',
    accessible: true
  },
  
  // Popular themes
  {
    id: 'blue',
    name: 'Ocean Blue',
    description: 'Professional blue tones',
    category: 'popular',
    className: 'theme-blue',
    accessible: true
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Modern purple gradients',
    category: 'popular',
    className: 'theme-purple',
    accessible: true
  },
  {
    id: 'green',
    name: 'Forest Green',
    description: 'Natural green tones',
    category: 'popular',
    className: 'theme-green',
    accessible: true
  },
  {
    id: 'warm',
    name: 'Warm Sunset',
    description: 'Warm orange and yellow tones',
    category: 'popular',
    className: 'theme-warm',
    accessible: true
  },
  {
    id: 'cool',
    name: 'Cool Mint',
    description: 'Cool blue and cyan tones',
    category: 'popular',
    className: 'theme-cool',
    accessible: true
  },
  
  // Accessible themes
  {
    id: 'high-contrast',
    name: 'High Contrast',
    description: 'Maximum contrast for better visibility',
    category: 'accessible',
    className: 'theme-high-contrast',
    accessible: true
  },
  {
    id: 'low-contrast',
    name: 'Low Contrast',
    description: 'Reduced contrast for light sensitivity',
    category: 'accessible',
    className: 'theme-low-contrast',
    accessible: true
  }
];

/**
 * Modern theme selector component with dropdown interface
 * Provides easy access to multiple themes including accessible options
 */
export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentThemeInfo = availableThemes.find(t => t.id === currentTheme);

  const handleThemeSelect = (themeId: ThemeType) => {
    onThemeChange(themeId);
    setIsOpen(false);
  };

  const groupedThemes = {
    standard: availableThemes.filter(t => t.category === 'standard'),
    popular: availableThemes.filter(t => t.category === 'popular'),
    accessible: availableThemes.filter(t => t.category === 'accessible')
  };

  return (
    <div className={styles['theme-selector']}>
      <button
        className={styles['theme-selector__trigger']}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select theme"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <FiSettings className={styles['theme-selector__icon']} />
        <span className={styles['theme-selector__current']}>
          {currentThemeInfo?.name || 'Theme'}
        </span>
        <FiChevronDown 
          className={`${styles['theme-selector__chevron']} ${isOpen ? styles['theme-selector__chevron--open'] : ''}`} 
        />
      </button>

      {isOpen && (
        <div className={styles['theme-selector__dropdown']} role="listbox">
          <div className={styles['theme-selector__group']}>
            <div className={styles['theme-selector__group-title']}>Standard</div>
            {groupedThemes.standard.map((theme) => (
              <button
                key={theme.id}
                className={`${styles['theme-selector__option']} ${currentTheme === theme.id ? styles['theme-selector__option--active'] : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
                role="option"
                aria-selected={currentTheme === theme.id}
              >
                <div className={`${styles['theme-selector__preview']} ${styles[`theme-selector__preview--${theme.id}`]}`} />
                <div className={styles['theme-selector__info']}>
                  <div className={styles['theme-selector__name']}>{theme.name}</div>
                  <div className={styles['theme-selector__description']}>{theme.description}</div>
                </div>
                {theme.accessible && (
                  <div className={styles['theme-selector__accessible-badge']} title="Accessible">A11y</div>
                )}
              </button>
            ))}
          </div>

          <div className={styles['theme-selector__group']}>
            <div className={styles['theme-selector__group-title']}>Popular</div>
            {groupedThemes.popular.map((theme) => (
              <button
                key={theme.id}
                className={`${styles['theme-selector__option']} ${currentTheme === theme.id ? styles['theme-selector__option--active'] : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
                role="option"
                aria-selected={currentTheme === theme.id}
              >
                <div className={`${styles['theme-selector__preview']} ${styles[`theme-selector__preview--${theme.id}`]}`} />
                <div className={styles['theme-selector__info']}>
                  <div className={styles['theme-selector__name']}>{theme.name}</div>
                  <div className={styles['theme-selector__description']}>{theme.description}</div>
                </div>
                {theme.accessible && (
                  <div className={styles['theme-selector__accessible-badge']} title="Accessible">A11y</div>
                )}
              </button>
            ))}
          </div>

          <div className={styles['theme-selector__group']}>
            <div className={styles['theme-selector__group-title']}>Accessible</div>
            {groupedThemes.accessible.map((theme) => (
              <button
                key={theme.id}
                className={`${styles['theme-selector__option']} ${currentTheme === theme.id ? styles['theme-selector__option--active'] : ''}`}
                onClick={() => handleThemeSelect(theme.id)}
                role="option"
                aria-selected={currentTheme === theme.id}
              >
                <div className={`${styles['theme-selector__preview']} ${styles[`theme-selector__preview--${theme.id}`]}`} />
                <div className={styles['theme-selector__info']}>
                  <div className={styles['theme-selector__name']}>{theme.name}</div>
                  <div className={styles['theme-selector__description']}>{theme.description}</div>
                </div>
                <div className={`${styles['theme-selector__accessible-badge']} ${styles['theme-selector__accessible-badge--primary']}`} title="Accessible">A11y</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className={styles['theme-selector__backdrop']} 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default ThemeSelector;
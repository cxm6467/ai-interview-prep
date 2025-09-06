import React from 'react';
import { FiBold, FiItalic, FiCode, FiList, FiLink2 } from 'react-icons/fi';
import styles from './MarkdownToolbar.module.css';

interface MarkdownToolbarProps {
  onInsert: (text: string, selectionStart?: number, selectionEnd?: number) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  className?: string;
}

export const MarkdownToolbar: React.FC<MarkdownToolbarProps> = ({
  onInsert,
  textareaRef,
  className
}) => {
  
  const insertMarkdown = (prefix: string, suffix = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let insertText = '';
    let cursorOffset = 0;

    if (selectedText) {
      // Wrap selected text
      insertText = `${prefix}${selectedText}${suffix}`;
      cursorOffset = insertText.length;
    } else {
      // Insert with placeholder
      insertText = `${prefix}${placeholder}${suffix}`;
      cursorOffset = prefix.length;
    }

    onInsert(insertText, start, start + cursorOffset);
  };

  const toolbarItems = [
    {
      icon: FiBold,
      label: 'Bold',
      shortcut: 'Ctrl+B',
      action: () => insertMarkdown('**', '**', 'bold text')
    },
    {
      icon: FiItalic,
      label: 'Italic',
      shortcut: 'Ctrl+I',
      action: () => insertMarkdown('*', '*', 'italic text')
    },
    {
      icon: FiCode,
      label: 'Code',
      shortcut: 'Ctrl+`',
      action: () => insertMarkdown('`', '`', 'code')
    },
    {
      icon: FiList,
      label: 'List',
      shortcut: 'Ctrl+L',
      action: () => insertMarkdown('- ', '', 'list item')
    },
    {
      icon: FiLink2,
      label: 'Link',
      shortcut: 'Ctrl+K',
      action: () => insertMarkdown('[', '](url)', 'link text')
    }
  ];

  return (
    <div className={`${styles.toolbar} ${className || ''}`}>
      <div className={styles.toolbarItems}>
        {toolbarItems.map((item) => (
          <button
            key={item.label}
            type="button"
            className={styles.toolbarButton}
            onClick={item.action}
            title={`${item.label} (${item.shortcut})`}
          >
            <item.icon size={14} />
          </button>
        ))}
      </div>
      <div className={styles.helpText}>
        <span className={styles.helpTip}>
          💡 Use markdown: **bold**, *italic*, `code`, - list
        </span>
      </div>
    </div>
  );
};
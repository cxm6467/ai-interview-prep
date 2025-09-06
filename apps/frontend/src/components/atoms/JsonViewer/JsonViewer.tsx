import React, { useMemo } from 'react';

// Function to escape HTML special characters to prevent XSS
const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Function to apply syntax highlighting to JSON string
const highlightJson = (json: string): string => {
  // First escape HTML to prevent XSS
  let result = escapeHtml(json);
  
  // Highlight object keys
  result = result.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"\s*:/g, 
    '<span class="text-pink-400">"$1"</span>:');
  
  // Highlight string values (not keys)
  result = result.replace(/:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g, 
    ': <span class="text-teal-400">"$1"</span>');
  
  // Highlight numbers (both integers and decimals)
  result = result.replace(/\b(-?\d+(\.\d+)?([eE][+-]?\d+)?)\b/g, 
    '<span class="text-orange-400">$1</span>');
  
  // Highlight booleans and null
  result = result.replace(/\b(true|false|null)\b/g, 
    '<span class="text-indigo-400">$1</span>');
  
  return result;
};

interface JsonViewerProps {
  data: unknown;
  className?: string;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data, className = '' }) => {

  // Format the data with proper indentation and apply syntax highlighting
  const formattedJson = useMemo(() => {
    try {
      if (!data) {return 'No data to display';}
      
      // Convert data to formatted JSON string with 2-space indentation
      const jsonString = JSON.stringify(data, null, 2);
      
      // Apply syntax highlighting
      return highlightJson(jsonString);
    } catch {
      return 'Error: Invalid JSON data';
    }
  }, [data]);

  return (
    <div className={`rounded-md border border-gray-700 bg-gray-800/50 overflow-hidden ${className}`}>
      <pre className="m-0 p-0 overflow-x-auto">
        <code 
          className="block font-mono text-sm p-4 text-gray-200"
          style={{ tabSize: 2 }}
          dangerouslySetInnerHTML={{ __html: formattedJson }}
        />
      </pre>
    </div>
  );
};

export default JsonViewer;

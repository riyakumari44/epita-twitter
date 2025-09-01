import React from 'react';

// Text formatting utilities for hashtags, mentions, and links
export const formatTweetText = (text) => {
  if (!text) return '';
  
  // Replace hashtags with styled spans
  const hashtagRegex = /#(\w+)/g;
  let formattedText = text.replace(hashtagRegex, '<span class="hashtag">#$1</span>');
  
  // Replace mentions with styled spans
  const mentionRegex = /@(\w+)/g;
  formattedText = formattedText.replace(mentionRegex, '<span class="mention">@$1</span>');
  
  // Replace URLs with links
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  formattedText = formattedText.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer" class="tweet-link">$1</a>');
  
  return formattedText;
};

// Extract hashtags from text
export const extractHashtags = (text) => {
  if (!text) return [];
  const hashtagRegex = /#(\w+)/g;
  const hashtags = [];
  let match;
  
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1]);
  }
  
  return hashtags;
};

// Extract mentions from text
export const extractMentions = (text) => {
  if (!text) return [];
  const mentionRegex = /@(\w+)/g;
  const mentions = [];
  let match;
  
  while ((match = mentionRegex.exec(text)) !== null) {
    mentions.push(match[1]);
  }
  
  return mentions;
};

// Component to render formatted tweet text
export const FormattedTweetText = ({ text, className = '' }) => {
  const formattedText = formatTweetText(text);
  
  return (
    <div 
      className={`formatted-tweet-text ${className}`}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
};

// Hook to format tweet content in real-time as user types
export const useTextFormatter = (initialText = '') => {
  const [text, setText] = React.useState(initialText);
  const [formattedText, setFormattedText] = React.useState('');
  const [hashtags, setHashtags] = React.useState([]);
  const [mentions, setMentions] = React.useState([]);
  
  React.useEffect(() => {
    setFormattedText(formatTweetText(text));
    setHashtags(extractHashtags(text));
    setMentions(extractMentions(text));
  }, [text]);
  
  return {
    text,
    setText,
    formattedText,
    hashtags,
    mentions
  };
};

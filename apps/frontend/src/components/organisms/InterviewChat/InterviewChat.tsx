import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, Button, Text, SpeechButton, ScrollToBottomIndicator } from '@atoms';
import { MarkdownToolbar } from '@molecules';
import { useAppStore } from '@store/appStore';
import { AIAnalysisService } from '@services';
import { getUserErrorMessage, isRetryableError } from '../../../services/errors';
import { useAutoScrollToBottom } from '@hooks';
import { FiCopy, FiRefreshCw } from 'react-icons/fi';
import type { InterviewQuestion } from '@cxm6467/ai-interview-prep-types';
import styles from './InterviewChat.module.css';

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const InterviewChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { 
    interviewQuestions, 
    resumeData, 
    interviewerRole, 
    jobDescription,
    atsScore,
    presentationTopics,
    candidateQuestions 
  } = useAppStore();
  
  // Use the enhanced auto-scroll hook with unseen message tracking
  // Only count AI messages as "unseen" (not user's own messages)
  const { containerRef: messagesContainerRef, unseenCount, isNearBottom, scrollToBottom } = 
    useAutoScrollToBottom<HTMLDivElement, ChatMessage>(
      messages, 
      true, 
      100, 
      (message) => message.type === 'ai'
    );
  
  useEffect(() => {
    // Initialize with welcome message and first question
    if (interviewQuestions.length > 0 && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: '1',
        type: 'ai',
        content: `Hi! I'm your AI interview coach. I'll help you practice for your interview by asking personalized questions based on your resume and the job you're applying for. Let's start with our first question:

${interviewQuestions[0].question}

Take your time to think about your answer, and I'll provide feedback to help you improve!`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [interviewQuestions, messages.length]);

  // Removed scroll-to-top effect - now using useAutoScrollToBottom hook

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) {return;}

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Get AI response using real or mock AI service
      const currentQuestion = interviewQuestions[currentQuestionIndex];
      const conversationHistory = messages.map(m => `${m.type}: ${m.content}`);
      
      let aiResponse: string;
      
      // Use Netlify functions for AI responses
      if (resumeData) {
        aiResponse = await AIAnalysisService.generateInterviewResponse(
          input.trim(),
          currentQuestion.question, // Pass the question text instead of the object
          resumeData,
          conversationHistory,
          interviewerRole,
          {
            jobDescription,
            atsScore,
            allQuestions: interviewQuestions,
            presentationTopics,
            candidateQuestions
          }
        );
      } else {
        // Fallback to contextual mock responses
        aiResponse = generateMockResponse(input.trim(), currentQuestion, currentQuestionIndex);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Move to next question after a few exchanges
      if (messages.length > 4 && currentQuestionIndex < interviewQuestions.length - 1) {
        setTimeout(() => {
          const nextIndex = currentQuestionIndex + 1;
          setCurrentQuestionIndex(nextIndex);
          
          const nextQuestionMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            type: 'ai',
            content: `Great discussion! Let's move on to our next question:

${interviewQuestions[nextIndex].question}`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, nextQuestionMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error('Interview chat error:', error);
      
      let content: string;
      const isRetryable = error instanceof Error && isRetryableError(error);
      
      if (isRetryable) {
        content = `I'm experiencing a temporary connection issue. Please try your response again in a moment.`;
      } else {
        const userFriendlyMessage = error instanceof Error ? getUserErrorMessage(error) : 'Unknown error occurred';
        content = `I apologize, but I encountered an issue: ${userFriendlyMessage}. Could you please try rephrasing your response?`;
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (userInput: string, _question: InterviewQuestion, questionIndex: number): string => {
    const responses = [
      `That's a solid approach! I particularly like how you mentioned ${userInput.split(' ').slice(-3).join(' ')}. To make your answer even stronger, consider adding specific metrics or outcomes from your experience.`,
      
      `Good answer! You're demonstrating relevant experience. For follow-up interviews, you might want to elaborate on the technical challenges you faced and how you overcame them.`,
      
      `I can see you understand the core concepts. To really stand out, try using the STAR method (Situation, Task, Action, Result) to structure your response with concrete examples.`,
      
      `That shows good problem-solving thinking! Interviewers love to hear about specific tools and methodologies you've used. Can you think of a particular project where you applied these skills?`,
      
      `Excellent! You're covering the key points well. Remember to connect your experience back to the specific requirements mentioned in the job description.`
    ];
    
    return responses[questionIndex % responses.length];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleMarkdownInsert = (text: string, selectionStart?: number, selectionEnd?: number) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    // Insert the text at the current cursor position
    const newValue = value.substring(0, start) + text + value.substring(end);
    setInput(newValue);

    // Set focus and cursor position
    setTimeout(() => {
      textarea.focus();
      if (selectionStart !== undefined && selectionEnd !== undefined) {
        textarea.setSelectionRange(selectionStart, selectionEnd);
      } else {
        textarea.setSelectionRange(start + text.length, start + text.length);
      }
    }, 0);
  };

  const resetChat = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setInput('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const regenerateResponse = async (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    // Find the user message that prompted this AI response
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.type !== 'user') return;

    // Remove the AI message we're regenerating
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setIsLoading(true);

    try {
      const currentQuestion = interviewQuestions[currentQuestionIndex];
      const conversationHistory = messages
        .slice(0, messageIndex - 1)
        .map(m => `${m.type}: ${m.content}`);
      
      let aiResponse: string;
      
      if (resumeData) {
        aiResponse = await AIAnalysisService.generateInterviewResponse(
          userMessage.content,
          currentQuestion.question,
          resumeData,
          conversationHistory,
          interviewerRole,
          {
            jobDescription,
            atsScore,
            allQuestions: interviewQuestions,
            presentationTopics,
            candidateQuestions
          }
        );
      } else {
        aiResponse = generateMockResponse(userMessage.content, currentQuestion, currentQuestionIndex);
      }

      const newAiMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, newAiMessage]);
    } catch (error) {
      console.error('Regenerate response error:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble generating a response. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={styles.chatContainer}>
      <div className={styles.header}>
        <div className={styles.headerMain}>
          <Text variant="h2">
            🤖 AI Interview Coach{interviewerRole ? ` - ${interviewerRole.charAt(0).toUpperCase() + interviewerRole.slice(1).replace(/-/g, ' ')}` : ''}
          </Text>
        </div>
        <Button variant="ghost" size="small" onClick={resetChat} icon="🔄">
          Reset Chat
        </Button>
      </div>
      
      <div className={styles.messagesContainer} ref={messagesContainerRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${styles.message} ${styles[message.type]}`}
          >
            <div className={styles.messageContent}>
              <div className={styles.markdownContent}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className={styles.markdownP}>{children}</p>,
                    ul: ({ children }) => <ul className={styles.markdownUl}>{children}</ul>,
                    ol: ({ children }) => <ol className={styles.markdownOl}>{children}</ol>,
                    li: ({ children }) => <li className={styles.markdownLi}>{children}</li>,
                    strong: ({ children }) => <strong className={styles.markdownStrong}>{children}</strong>,
                    em: ({ children }) => <em className={styles.markdownEm}>{children}</em>,
                    code: ({ children, ...props }) => {
                      const isInline = !props.className || !props.className.includes('language-');
                      return isInline ? 
                        <code className={styles.markdownInlineCode}>{children}</code> :
                        <code className={styles.markdownCode}>{children}</code>;
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
              
              <div className={styles.messageFooter}>
                <Text variant="caption" color="tertiary" className={styles.timestamp}>
                  {message.timestamp.toLocaleTimeString()}
                </Text>
                
                <div className={styles.messageActions}>
                  <button 
                    className={styles.actionButton}
                    onClick={() => copyToClipboard(message.content)}
                    title="Copy message"
                  >
                    <FiCopy size={14} />
                  </button>
                  
                  {message.type === 'ai' && (
                    <>
                      <button 
                        className={styles.actionButton}
                        onClick={() => regenerateResponse(message.id)}
                        title="Regenerate response"
                        disabled={isLoading}
                      >
                        <FiRefreshCw size={14} />
                      </button>
                      
                      <SpeechButton 
                        text={message.content} 
                        size="small"
                        variant="ghost"
                        showLabel={false}
                        className={styles.speechButton}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className={`${styles.message} ${styles.ai}`}>
            <div className={styles.messageContent}>
              <div className={styles.typing}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
        
        {/* Scroll to bottom indicator for unseen messages */}
        <ScrollToBottomIndicator
          unseenCount={unseenCount}
          isVisible={!isNearBottom && unseenCount > 0}
          onScrollToBottom={scrollToBottom}
        />
      </div>
      
      <div className={styles.inputContainer}>
        <div className={styles.inputSection}>
          <MarkdownToolbar 
            onInsert={handleMarkdownInsert}
            textareaRef={textareaRef}
          />
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your answer here... (Press Enter to send)"
            className={styles.input}
            rows={3}
            disabled={isLoading}
          />
        </div>
        <Button
          variant="primary"
          onClick={handleSendMessage}
          disabled={!input.trim() || isLoading}
          icon="📤"
        >
          Send
        </Button>
      </div>
      
    </Card>
  );
};

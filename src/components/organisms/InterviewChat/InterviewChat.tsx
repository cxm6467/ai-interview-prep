import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { ScrollToBottomIndicator } from '@atoms/ScrollToBottomIndicator';
import { useAppStore } from '@store/appStore';
import { AIAnalysisService } from '@services/aiAnalysis';
import { useAutoScrollToBottom } from '../../../hooks/useScrollFix';
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
  
  const { interviewQuestions, resumeData, interviewerRole } = useAppStore();
  
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
          interviewerRole
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
    } catch (_) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I apologize, but I\'m having trouble processing your response right now. Could you please try again?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockResponse = (userInput: string, _question: any, questionIndex: number): string => {
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

  const resetChat = () => {
    setMessages([]);
    setCurrentQuestionIndex(0);
    setInput('');
  };

  return (
    <Card className={styles.chatContainer}>
      <div className={styles.header}>
        <Text variant="h2">
          🤖 AI Interview Coach{interviewerRole ? ` - ${interviewerRole.charAt(0).toUpperCase() + interviewerRole.slice(1).replace(/-/g, ' ')}` : ''}
        </Text>
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
              <Text variant="body">{message.content}</Text>
              <Text variant="caption" color="tertiary" className={styles.timestamp}>
                {message.timestamp.toLocaleTimeString()}
              </Text>
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
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your answer here... (Press Enter to send)"
          className={styles.input}
          rows={3}
          disabled={isLoading}
        />
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

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { useAppStore } from '@store/appStore';
import { AIAnalysisService } from '@services/aiAnalysis';
import styles from './InterviewChat.module.css';
export const InterviewChat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const messagesEndRef = useRef(null);
    const { interviewQuestions, resumeData } = useAppStore();
    useEffect(() => {
        // Initialize with welcome message and first question
        if (interviewQuestions.length > 0 && messages.length === 0) {
            const welcomeMessage = {
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
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    const handleSendMessage = async () => {
        if (!input.trim() || isLoading)
            return;
        const userMessage = {
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
            let aiResponse;
            // Check if we have OpenAI API key for real AI responses
            const hasOpenAI = import.meta.env.VITE_OPENAI_API_KEY;
            if (hasOpenAI && resumeData) {
                aiResponse = await AIAnalysisService.generateInterviewResponse(input.trim(), currentQuestion, resumeData, conversationHistory);
            }
            else {
                // Fallback to contextual mock responses
                aiResponse = generateMockResponse(input.trim(), currentQuestion, currentQuestionIndex);
            }
            const aiMessage = {
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
                    const nextQuestionMessage = {
                        id: (Date.now() + 2).toString(),
                        type: 'ai',
                        content: `Great discussion! Let's move on to our next question:

${interviewQuestions[nextIndex].question}`,
                        timestamp: new Date()
                    };
                    setMessages(prev => [...prev, nextQuestionMessage]);
                }, 1000);
            }
        }
        catch (_) {
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                content: 'I apologize, but I\'m having trouble processing your response right now. Could you please try again?',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
        finally {
            setIsLoading(false);
        }
    };
    const generateMockResponse = (userInput, _question, questionIndex) => {
        const responses = [
            `That's a solid approach! I particularly like how you mentioned ${userInput.split(' ').slice(-3).join(' ')}. To make your answer even stronger, consider adding specific metrics or outcomes from your experience.`,
            `Good answer! You're demonstrating relevant experience. For follow-up interviews, you might want to elaborate on the technical challenges you faced and how you overcame them.`,
            `I can see you understand the core concepts. To really stand out, try using the STAR method (Situation, Task, Action, Result) to structure your response with concrete examples.`,
            `That shows good problem-solving thinking! Interviewers love to hear about specific tools and methodologies you've used. Can you think of a particular project where you applied these skills?`,
            `Excellent! You're covering the key points well. Remember to connect your experience back to the specific requirements mentioned in the job description.`
        ];
        return responses[questionIndex % responses.length];
    };
    const handleKeyPress = (e) => {
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
    return (_jsxs(Card, { className: styles.chatContainer, children: [_jsxs("div", { className: styles.header, children: [_jsx(Text, { variant: "h2", children: "\uD83E\uDD16 AI Interview Coach" }), _jsx(Button, { variant: "ghost", size: "small", onClick: resetChat, icon: "\uD83D\uDD04", children: "Reset Chat" })] }), _jsxs("div", { className: styles.messagesContainer, children: [messages.map((message) => (_jsx("div", { className: `${styles.message} ${styles[message.type]}`, children: _jsxs("div", { className: styles.messageContent, children: [_jsx(Text, { variant: "body", children: message.content }), _jsx(Text, { variant: "caption", color: "tertiary", className: styles.timestamp, children: message.timestamp.toLocaleTimeString() })] }) }, message.id))), isLoading && (_jsx("div", { className: `${styles.message} ${styles.ai}`, children: _jsx("div", { className: styles.messageContent, children: _jsxs("div", { className: styles.typing, children: [_jsx("span", {}), _jsx("span", {}), _jsx("span", {})] }) }) })), _jsx("div", { ref: messagesEndRef })] }), _jsxs("div", { className: styles.inputContainer, children: [_jsx("textarea", { value: input, onChange: (e) => setInput(e.target.value), onKeyPress: handleKeyPress, placeholder: "Type your answer here... (Press Enter to send)", className: styles.input, rows: 3, disabled: isLoading }), _jsx(Button, { variant: "primary", onClick: handleSendMessage, disabled: !input.trim() || isLoading, icon: "\uD83D\uDCE4", children: "Send" })] }), _jsxs("div", { className: styles.progress, children: [_jsxs(Text, { variant: "caption", color: "secondary", children: ["Question ", currentQuestionIndex + 1, " of ", interviewQuestions.length] }), _jsx("div", { className: styles.progressBar, children: _jsx("div", { className: styles.progressFill, style: { width: `${((currentQuestionIndex + 1) / interviewQuestions.length) * 100}%` } }) })] })] }));
};

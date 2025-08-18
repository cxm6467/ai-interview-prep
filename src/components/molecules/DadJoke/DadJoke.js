import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { DadJokeService } from '@services/dadJokeService';
import styles from './DadJoke.module.css';
export const DadJoke = () => {
    const [joke, setJoke] = useState('Click the button to get a dad joke! 😄');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const fetchJoke = async () => {
        setIsLoading(true);
        setMessage('');
        try {
            const result = await DadJokeService.getRandomJoke();
            setJoke(result.joke);
            if (result.message) {
                setMessage(result.message);
            }
        }
        catch (_) {
            setJoke('Why don\'t scientists trust atoms? Because they make up everything! 🔬 (Offline mode)');
            setMessage('Unable to fetch new jokes - using cached content');
        }
        finally {
            setIsLoading(false);
        }
    };
    const resetCache = () => {
        DadJokeService.resetJokeCache();
        setMessage('Joke cache reset! You\'ll see fresh jokes now.');
        setJoke('Cache cleared! Click "Get Another Joke" for fresh content.');
    };
    return (_jsxs(Card, { variant: "elevated", className: styles.container, children: [_jsxs("div", { className: styles.jokeDisplay, children: [_jsx("span", { className: styles.jokeIcon, children: "\uD83D\uDE04" }), _jsx(Text, { variant: "body", align: "center", className: styles.jokeText, children: joke })] }), message && (_jsx(Card, { variant: "outlined", className: styles.messageCard, children: _jsxs(Text, { variant: "caption", color: "secondary", align: "center", children: ["\uD83D\uDCA1 ", message] }) })), _jsxs("div", { className: styles.buttons, children: [_jsx(Button, { variant: "primary", onClick: fetchJoke, disabled: isLoading, icon: isLoading ? '⏳' : '🎭', fullWidth: true, children: isLoading ? 'Getting Joke...' : 'Get Another Joke' }), _jsx(Button, { variant: "ghost", size: "small", onClick: resetCache, icon: "\uD83D\uDD04", children: "Reset Cache" })] }), _jsx("div", { className: styles.stats, children: _jsx(Text, { variant: "caption", color: "tertiary", align: "center", children: "Dad jokes help reduce interview stress! Studies show laughter improves confidence and memory recall." }) })] }));
};

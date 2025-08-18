import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card } from '@atoms/Card';
import { Button } from '@atoms/Button';
import { Text } from '@atoms/Text';
import { DadJokeService } from '@services/dadJokeService';
import styles from './SessionInspector.module.css';
export const SessionInspector = () => {
    const [stats, setStats] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [storageData, setStorageData] = useState({});
    const refreshData = () => {
        const jokeStats = DadJokeService.getJokeStats();
        setStats(jokeStats);
        // Get all session storage data related to jokes
        const usedIds = sessionStorage.getItem('dadJoke_usedIds');
        const cache = sessionStorage.getItem('dadJoke_cache');
        const expiry = sessionStorage.getItem('dadJoke_cacheExpiry');
        setStorageData({
            usedIds: usedIds ? JSON.parse(usedIds) : [],
            cache: cache ? JSON.parse(cache) : [],
            expiry: expiry ? new Date(parseInt(expiry)).toLocaleString() : null,
            totalStorage: JSON.stringify({
                usedIds: usedIds ? JSON.parse(usedIds) : [],
                cache: cache ? JSON.parse(cache) : []
            }, null, 2)
        });
    };
    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 1000);
        return () => clearInterval(interval);
    }, []);
    const clearAllData = () => {
        DadJokeService.resetJokeCache();
        refreshData();
    };
    return (_jsxs(Card, { variant: "outlined", className: styles.inspector, children: [_jsxs("div", { className: styles.header, children: [_jsx(Text, { variant: "h3", color: "accent", children: "\uD83D\uDD0D Session Inspector" }), _jsxs("div", { className: styles.controls, children: [_jsx(Button, { variant: "ghost", size: "small", onClick: () => setIsExpanded(!isExpanded), icon: isExpanded ? '🔼' : '🔽', children: isExpanded ? 'Collapse' : 'Expand' }), _jsx(Button, { variant: "ghost", size: "small", onClick: refreshData, icon: "\uD83D\uDD04", children: "Refresh" })] })] }), _jsxs("div", { className: styles.stats, children: [_jsxs("div", { className: styles.statItem, children: [_jsx(Text, { variant: "small", color: "secondary", children: "Used Jokes:" }), _jsx(Text, { variant: "body", weight: "bold", children: stats?.used || 0 })] }), _jsxs("div", { className: styles.statItem, children: [_jsx(Text, { variant: "small", color: "secondary", children: "Cached Jokes:" }), _jsx(Text, { variant: "body", weight: "bold", children: stats?.cached || 0 })] }), _jsxs("div", { className: styles.statItem, children: [_jsx(Text, { variant: "small", color: "secondary", children: "Cache Expires:" }), _jsx(Text, { variant: "small", children: stats?.cacheExpiry || 'Not set' })] })] }), isExpanded && (_jsxs("div", { className: styles.expandedContent, children: [_jsxs("div", { className: styles.section, children: [_jsx(Text, { variant: "h3", color: "accent", children: "Used Joke IDs" }), _jsx("div", { className: styles.dataContainer, children: _jsx(Text, { variant: "small", color: "secondary", children: storageData.usedIds.length > 0
                                        ? storageData.usedIds.join(', ')
                                        : 'No jokes used yet' }) })] }), _jsxs("div", { className: styles.section, children: [_jsx(Text, { variant: "h3", color: "accent", children: "Cached Jokes" }), _jsx("div", { className: styles.dataContainer, children: storageData.cache.length > 0 ? (storageData.cache.map((joke, index) => (_jsxs("div", { className: styles.jokeItem, children: [_jsxs(Text, { variant: "small", weight: "bold", children: ["#", index + 1, " (ID: ", joke.id, ")"] }), _jsx(Text, { variant: "small", color: "secondary", children: joke.joke })] }, joke.id)))) : (_jsx(Text, { variant: "small", color: "secondary", children: "No jokes cached" })) })] }), _jsxs("div", { className: styles.section, children: [_jsx(Text, { variant: "h3", color: "accent", children: "Raw Session Storage" }), _jsx("pre", { className: styles.rawData, children: _jsx(Text, { variant: "small", children: storageData.totalStorage }) })] }), _jsx("div", { className: styles.actions, children: _jsx(Button, { variant: "secondary", onClick: clearAllData, icon: "\uD83D\uDDD1\uFE0F", children: "Clear All Data" }) })] }))] }));
};

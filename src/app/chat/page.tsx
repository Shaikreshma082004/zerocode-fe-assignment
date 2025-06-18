'use client';
declare global {
    interface Window {
        SpeechRecognition?: any;
        webkitSpeechRecognition?: any;
    }
}

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { FiSend, FiMoon, FiSun, FiMic, FiMicOff, FiDownload } from 'react-icons/fi';
import { IoIosArrowUp, IoIosArrowDown } from 'react-icons/io';
import ThemeToggle from '@/components/ThemeToggle';

interface Message {
    sender: 'user' | 'bot';
    text: string;
    id: string;
}

export default function ChatPage() {
    const router = useRouter();
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number>(-1);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState(false);
    const [finalTranscript, setFinalTranscript] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const email = user.email;
        if (!localStorage.getItem('token')) {
            router.push('/login');
            return;
        }

        const savedMessages = localStorage.getItem(`messages_${email}`);
        if (savedMessages) {
            setMessages(JSON.parse(savedMessages));
        }
        const savedHistory = localStorage.getItem(`history_${email}`);
        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            setHistory(parsedHistory);
            setHistoryIndex(parsedHistory.length);
        }

        // Check for SpeechRecognition support
        const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSpeechSupported(true);

            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let newFinalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        newFinalTranscript += transcript;
                    } else {
                        interimTranscript += transcript;
                    }
                }

                setFinalTranscript(prev => newFinalTranscript || prev);
                setInput(newFinalTranscript + interimTranscript);
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                setIsRecording(false);
                if (event.error === 'no-speech' || event.error === 'audio-capture') {
                    alert('No speech detected or microphone issue. Please try again.');
                }
            };

            recognition.onend = () => {
                if (isRecording) {
                    recognition.start();
                }
            };

            recognitionRef.current = recognition;
        }
    }, [router]);

    useEffect(() => {
        // Auto-send when recording stops and we have final transcript
        if (!isRecording && finalTranscript.trim()) {
            handleSend();
            setFinalTranscript('');
        }
    }, [isRecording, finalTranscript]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const email = user.email;
        if (email) {
            localStorage.setItem(`messages_${email}`, JSON.stringify(messages));
            localStorage.setItem(`history_${email}`, JSON.stringify(history));
        }
    }, [messages, history]);

    useEffect(() => {
        const handleScroll = () => {
            const chatContainer = chatContainerRef.current;
            if (chatContainer) {
                const isAtBottom =
                    chatContainer.scrollHeight - chatContainer.scrollTop <=
                    chatContainer.clientHeight + 50;
                setShowScrollButton(!isAtBottom);
            }
        };

        const chatContainer = chatContainerRef.current;
        chatContainer?.addEventListener('scroll', handleScroll);
        return () => chatContainer?.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const id = Math.random().toString(36).substring(2, 9);
        const userMsg: Message = { sender: 'user', text: input, id };
        setMessages((prev) => [...prev, userMsg]);
        setLoading(true);
        setHistory((prev) => [...prev, input]);
        setHistoryIndex(history.length + 1);
        setInput('');

        const words = [
            "Analyzing your request...",
            "Accessing neural networks...",
            "Formulating response..."
        ];

        let typingMsg: Message = {
            sender: 'bot',
            text: words[0],
            id: 'typing-' + id
        };
        setMessages((prev) => [...prev, typingMsg]);

        for (let i = 1; i < words.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 800));
            setMessages(prev => [
                ...prev.slice(0, -1),
                { ...typingMsg, text: words[i] }
            ]);
        }

        await new Promise(resolve => setTimeout(resolve, 1200));

        const botMsg: Message = {
            sender: 'bot',
            text: generateResponse(input),
            id: 'response-' + id
        };

        setMessages(prev => [
            ...prev.slice(0, -1),
            botMsg
        ]);
        setLoading(false);
    };

    const generateResponse = (input: string): string => {
        const responses = [
            `I've processed your request about "${input}". Here's what I found...`,
            `Fascinating question about "${input}"! Let me share some insights.`,
            `Based on my analysis of "${input}", I recommend considering...`,
            `"${input}" is an interesting topic. Here's what you should know...`
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        } else if (e.key === 'ArrowUp' && historyIndex > 0) {
            e.preventDefault();
            setHistoryIndex((prev) => prev - 1);
            setInput(history[historyIndex - 1] || '');
        } else if (e.key === 'ArrowDown' && historyIndex < history.length - 1) {
            e.preventDefault();
            setHistoryIndex((prev) => prev + 1);
            setInput(history[historyIndex + 1] || '');
        }
    };

    const scrollToBottom = () => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const toggleRecording = () => {
        if (!isSpeechSupported) {
            alert('Speech recognition is not supported in your browser.');
            return;
        }

        if (isRecording) {
            recognitionRef.current?.stop();
            setIsRecording(false);
        } else {
            setInput('');
            setFinalTranscript('');
            recognitionRef.current?.start();
            setIsRecording(true);
        }
    };

    const exportChat = () => {
        const chatText = messages.map(msg => {
            return `${msg.sender === 'user' ? 'You' : 'Chatbot'}: ${msg.text}`;
        }).join('\n\n');

        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `chatbot-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-900 dark:to-gray-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto mt-8 relative"
            >
                <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute rounded-full bg-cyan-400/20 dark:bg-cyan-500/20"
                            initial={{
                                x: Math.random() * 100 + '%',
                                y: Math.random() * 100 + '%',
                                width: Math.random() * 10 + 5 + 'px',
                                height: Math.random() * 10 + 5 + 'px',
                            }}
                            animate={{
                                y: [0, Math.random() * 100 - 50],
                                x: [0, Math.random() * 100 - 50],
                                opacity: [0.2, 0.8, 0.2],
                            }}
                            transition={{
                                duration: Math.random() * 10 + 10,
                                repeat: Infinity,
                                repeatType: 'reverse',
                                ease: 'easeInOut',
                            }}
                        />
                    ))}
                </div>

                <div className="relative backdrop-blur-lg bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/50 rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-6 pb-4 flex justify-between items-center border-b border-white/20 dark:border-gray-700/50">
                        <motion.h1
                            className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            Chatbot
                        </motion.h1>
                        <div className="flex items-center space-x-4">
                            <motion.button
                                onClick={exportChat}
                                disabled={messages.length === 0}
                                className="p-2 rounded-full bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Export chat"
                            >
                                <FiDownload />
                            </motion.button>
                            <ThemeToggle />
                        </div>
                    </div>

                    <div
                        ref={chatContainerRef}
                        className="h-[60vh] overflow-y-auto p-6 space-y-4 relative"
                    >
                        <AnimatePresence>
                            {messages.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.6 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400"
                                >
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                            opacity: [0.6, 1, 0.6]
                                        }}
                                        transition={{
                                            duration: 3,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="mb-4 text-5xl"
                                    >
                                        ✨
                                    </motion.div>
                                    <p className="text-xl">Start a conversation with Chatbot</p>
                                    <p className="mt-2">Your messages will appear here</p>
                                </motion.div>
                            )}

                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 500,
                                        damping: 30,
                                        duration: 0.3
                                    }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`relative max-w-[85%] p-4 rounded-2xl ${msg.sender === 'user'
                                            ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                                            : 'bg-gray-200/90 dark:bg-gray-700/90 text-gray-800 dark:text-gray-200'
                                            } shadow-md`}
                                    >
                                        {msg.text}
                                        <div
                                            className={`absolute top-4 w-3 h-3 transform rotate-45 ${msg.sender === 'user'
                                                ? 'bg-cyan-500 -right-1'
                                                : 'bg-gray-200/90 dark:bg-gray-700/90 -left-1'
                                                }`}
                                        />
                                    </div>
                                </motion.div>
                            ))}

                            {loading && messages.some(m => m.sender === 'user' && !messages.some(b => b.id.includes(m.id))) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="flex justify-start"
                                >
                                    <div className="relative max-w-[85%] p-4 rounded-2xl bg-gray-200/90 dark:bg-gray-700/90 text-gray-800 dark:text-gray-200 shadow-md">
                                        <div className="flex space-x-2 items-center">
                                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '300ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" style={{ animationDelay: '600ms' }} />
                                        </div>
                                        <div className="absolute top-4 w-3 h-3 transform rotate-45 bg-gray-200/90 dark:bg-gray-700/90 -left-1" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={bottomRef} />
                    </div>

                    <AnimatePresence>
                        {showScrollButton && (
                            <motion.button
                                onClick={scrollToBottom}
                                className="absolute bottom-27 right-9 p-3 rounded-full bg-cyan-500 text-white shadow-lg"
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0 }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title="Scroll to bottom"
                            >
                                <IoIosArrowDown size={24} />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <div className="p-6 pt-4 border-t border-white/20 dark:border-gray-700/50">
                        <motion.div
                            className="relative"
                            whileHover={{ scale: 1.01 }}
                            whileFocusWithin={{ scale: 1.02 }}
                        >
                            <motion.input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onKeyDown={handleKeyDown}
                                onChange={(e) => setInput(e.target.value)}
                                className="w-full p-4 pr-20 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400/50 text-gray-800 dark:text-gray-200 shadow-sm"
                                placeholder="Send a message..."
                                whileFocus={{
                                    boxShadow: '0 0 0 2px rgba(34, 211, 238, 0.5)'
                                }}
                            />
                            <motion.button
                                onClick={toggleRecording}
                                disabled={!isSpeechSupported || loading}
                                className={`absolute right-12 top-1/2 transform -translate-y-1/2 p-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'} text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                title={isRecording ? 'Stop recording (will auto-send)' : 'Start voice input'}
                            >
                                {isRecording ? <FiMicOff /> : <FiMic />}
                            </motion.button>
                            <motion.button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                animate={{
                                    rotate: loading ? 360 : 0,
                                    transition: loading ? { repeat: Infinity, duration: 1, ease: "linear" } : {}
                                }}
                            >
                                <FiSend />
                            </motion.button>
                        </motion.div>
                        {isRecording && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 text-sm text-cyan-600 dark:text-cyan-400 flex items-center"
                            >
                                <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                                Listening... Speak now
                            </motion.div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

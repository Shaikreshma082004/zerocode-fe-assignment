// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiLogIn, FiLogOut, FiUserPlus, FiMessageSquare } from 'react-icons/fi';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const router = useRouter();

    useEffect(() => {
        // Check authentication status
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setIsLoggedIn(!!token);
        setUserEmail(user.email || '');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
        router.push('/login');
    };

    return (
        <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/chat" className="flex items-center">
                            <FiMessageSquare className="h-6 w-6 text-cyan-500 mr-2" />
                            <span className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">
                                Chatbot
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <ThemeToggle />

                        {isLoggedIn ? (
                            <>
                                {userEmail && (
                                    <span className="hidden md:inline text-sm text-gray-600 dark:text-gray-300">
                                        {userEmail}
                                    </span>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <FiLogOut className="mr-1" />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <FiLogIn className="mr-1" />
                                    Login
                                </Link>
                                <Link
                                    href="/register"
                                    className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <FiUserPlus className="mr-1" />
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleLogin = () => {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.email === email && user.password === password) {
            localStorage.setItem('token', 'fake-jwt-token');
            router.push('/chat');
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Login</h2>
            <input
                type="email"
                placeholder="Email"
                className="w-full p-2 mb-2 border rounded"
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="w-full p-2 mb-4 border rounded"
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                onClick={handleLogin}
                className="w-full bg-green-600 text-white py-2 rounded"
            >
                Login
            </button>
        </div>
    );
}

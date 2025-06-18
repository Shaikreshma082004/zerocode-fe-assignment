'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    const handleRegister = () => {
        localStorage.setItem('user', JSON.stringify({ email, password }));
        alert('Registered successfully!');
        router.push('/login');
    };

    return (
        <div className="max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Register</h2>
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
                onClick={handleRegister}
                className="w-full bg-blue-600 text-white py-2 rounded"
            >
                Register
            </button>
        </div>
    );
}

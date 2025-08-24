'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CallbackPageContent() {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token');

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            router.push('/dashboard');
        }
    }, [token]);

    return <p>Logging you in...</p>;
}

export default function Page() {
    return (
        <Suspense fallback={<div>Logging you in...</div>}>
            <CallbackPageContent />
        </Suspense>
    );
}

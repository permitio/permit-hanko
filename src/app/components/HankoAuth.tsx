"use client";

import { useEffect, useState } from 'react';
import { register } from '@teamhanko/hanko-elements';
import { Hanko } from '@teamhanko/hanko-frontend-sdk';
import { Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

const hankoApi = process.env.NEXT_PUBLIC_HANKO_API_URL || '';

export default function HankoAuth() {
    const router = useRouter();
    const [hanko, setHanko] = useState<Hanko>();

    useEffect(() => {
        register(hankoApi).catch((error) => { });
        setHanko(new Hanko(hankoApi))
    }, []);

    useEffect(() => (hanko?.onAuthFlowCompleted(async () => {
        const user = await hanko.user.getCurrent();
        await fetch("/api/permit", { method: "POST", body: JSON.stringify({ ...user }) });
        router.replace("/notes");
    })), [hanko, router]);

    useEffect(() => {
        register(hankoApi).catch((error) => { });
    }, []);

    return (
        hankoApi ? <hanko-auth /> : (
            <Alert severity="error">
                This application require `NEXT_PUBLIC_HANKO_API_URL` to be set.
            </Alert>
        )
    );
}

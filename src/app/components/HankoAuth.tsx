"use client";

import { useCallback, useEffect, useState } from 'react';
import { register, Hanko } from '@teamhanko/hanko-elements';
import { Alert } from '@mui/material';
import { useRouter } from 'next/navigation';

const hankoApi = process.env.NEXT_PUBLIC_HANKO_API_URL || '';

export default function HankoAuth() {
    const router = useRouter();
    const [hanko, setHanko] = useState<Hanko>();

    useEffect(() => {
        import("@teamhanko/hanko-elements").then(({ Hanko }) =>
            setHanko(new Hanko(hankoApi))
        );
    }, []);

    useEffect(() => {
        register(hankoApi).catch((error) => {
        });
    }, []);

    const redirectAfterLogin = useCallback(() => {
        router.replace("/notes");
        window.location.reload();
    }, [router]);

    useEffect(
        () =>
            hanko?.onAuthFlowCompleted(() => {
                console.log("Auth flow completed");
                redirectAfterLogin();
            }),
        [hanko, redirectAfterLogin]
    );

    useEffect(() => {
        register(hankoApi).catch((error) => {
            // handle error
        });
    }, []);

    return (
        hankoApi ? <hanko-auth /> : (
            <Alert severity="error">
                This application require `NEXT_PUBLIC_HANKO_API_URL` to be set.
            </Alert>
        )
    );
}

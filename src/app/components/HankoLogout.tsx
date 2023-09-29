"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Hanko } from "@teamhanko/hanko-elements";
import { Button } from "@mui/material";

const hankoApi = process.env.NEXT_PUBLIC_HANKO_API_URL;

export function HankoLogout() {
    const router = useRouter();
    const [hanko, setHanko] = useState<Hanko>();
    const [user, setUser] = useState<any>();

    useEffect(() => {
        setHanko(new Hanko(hankoApi));
        (async () => {
            const u = await hanko?.user.getCurrent();
            setUser(u);
        })()
    }, []);

    const logout = async () => {
        try {
            await hanko?.user.logout();
            router.push("/login");
            router.refresh();
            return;
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    console.log("user", user);

    return (user && <Button onClick={logout} color="inherit">Logout</Button> || '');
}

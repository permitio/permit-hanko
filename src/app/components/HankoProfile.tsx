"use client"

import { useCallback, useEffect, useState } from "react";
import { Box, Button, IconButton, Popover } from "@mui/material";
import AccountCircle from '@mui/icons-material/AccountCircle';
import { register } from "@teamhanko/hanko-elements";
import { Hanko } from "@teamhanko/hanko-frontend-sdk";
import { useRouter } from "next/navigation";


const hankoApi = process.env.NEXT_PUBLIC_HANKO_API_URL || '';

export default function HankoProfile() {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const [hanko, setHanko] = useState<Hanko>();
    const [user, setUser] = useState<any>();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserChange = useCallback(async () => {
        if (!hanko) return;
        hanko.onAuthFlowCompleted(handleUserChange);
        try {
            const u = await hanko?.user.getCurrent();
            setUser(u);
        } catch (error) {
            console.error("Error during getCurrent:", error);
        }
    }, [hanko]);


    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
        register(hankoApi).catch((error) => (console.error("Error during registration:", error)));
        const h = new Hanko(hankoApi);
        setHanko(h);
    }, []);

    useEffect(() => {
        handleUserChange();
    }, [hanko]);

    const logout = async () => {
        try {
            await hanko?.user.logout();
            router.push("/auth/login");
            router.refresh();
            setUser(undefined);
            return;
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (user && <>
        <IconButton
            size="large"
            aria-label="account of current user"
            aria-controls="menu-appbar"
            aria-haspopup="true"
            onClick={handleClick}
            color="inherit"
        >
            <AccountCircle />
        </IconButton>
        {anchorEl &&
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
            >
                <Box sx={{ p: 2, width: 360 }} display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
                    <hanko-profile />
                    <Button onClick={logout} variant="contained" sx={{ flex: 1 }}>Logout</Button>
                </Box>
            </Popover>
        }
    </> || ''
    );
}

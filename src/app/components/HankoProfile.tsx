"use client"

import { useEffect, useState } from "react";
import { Box, Button, IconButton, Popover } from "@mui/material";
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Hanko, register } from "@teamhanko/hanko-elements";
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

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    useEffect(() => {
        (async () => {
            const { Hanko } = await import("@teamhanko/hanko-elements");
            setHanko(new Hanko(hankoApi));
        })()
    }, []);

    useEffect(() => {
        register(hankoApi).catch((error) => (console.error("Error during registration:", error)));
        (async () => {
            if (!hanko) return;
            try {
                const u = await hanko?.user.getCurrent();
                setUser(u);
            } catch (error) {
                console.error("Error during getCurrent:", error);
            }
        })()
    }, [hanko]);

    const logout = async () => {
        try {
            await hanko?.user.logout();
            router.push("/login");
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
            <Box sx={{ p: 2, width: 360 }}>
                <hanko-profile />
                <Button onClick={logout} variant="contained">Logout</Button>
            </Box>
        </Popover>
    </> || ''
    );
}

"use client";

import { Masonry } from "@mui/lab";
import { Container, Paper, Typography } from "@mui/material";
import { useEffect, useState } from "react";

const Notes = () => {
    const [notes, setNotes] = useState([]);

    const fetchNotes = async () => {
        const res = await fetch("/api/notes");
        const notes = await res.json();
        setNotes(notes);
    }

    useEffect(() => {
        fetchNotes();
    }, []);

    return (
        <Container maxWidth="xl" sx={{ p: 2 }}>
            <Typography variant="h4">Notes</Typography>
            {notes.length &&
                <Masonry columns={4} spacing={2} sx={{ py: 2 }}>
                    {notes.map((note, idx) => (<Paper key={idx} sx={{ p: 2 }}>
                        <Typography variant="h6">{note?.title}</Typography>
                        <Typography variant="body2">{note?.content}</Typography>
                    </Paper>))}
                </Masonry>
            }
        </Container>
    );
};

export default Notes;
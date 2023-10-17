"use client";

import { Note } from "@/models/Note";
import { Add } from "@mui/icons-material";
import { Masonry } from "@mui/lab";
import { Alert, Box, Button, Container, Icon, IconButton, Paper, Snackbar, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import NoteForm from "./NoteForm";
import NoteBody from "./NoteBody";
import { Hanko, User } from "@teamhanko/hanko-frontend-sdk";

const hankoApi = process.env.NEXT_PUBLIC_HANKO_API_URL || '';

const Notes = () => {
    const [user, setUser] = useState<User>();
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState<Note | null>(null);
    const [editNote, setEditNote] = useState<Note | null>(null);
    const [error, setError] = useState<string>("");

    const fetchNotes = async () => {
        const res = await fetch("/api/notes");
        const notes = await res.json();
        setNotes(notes);
    }

    const addNote = useCallback(async () => {
        if (!user) return;
        setEditNote(null);
        setNewNote({
            owner: user?.id,
        } as Note);
    }, [user]);

    const updateNote = useCallback(async (note: Note) => {
        setNewNote(null);
        setEditNote(note);
    }, []);

    const cancelEdit = useCallback(async () => {
        setNewNote(null);
        setEditNote(null);
    }, []);

    const saveNote = useCallback(async (note: Note) => {
        const method = note.id ? "PUT" : "POST";
        const res = await fetch("/api/notes", {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(note)
        });
        if (!res.ok) {
            const err = await res.json();
            return err.message;
        }
        const savedNote = await res.json();
        setNewNote(null);
        setEditNote(null);
        fetchNotes();
        return savedNote.id;
    }, []);

    const deleteNote = useCallback(async (note: Note) => {
        const res = await fetch("/api/notes", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(note)
        });
        if (!res.ok) {
            const err = await res.json();
            setError(err.message);
            return;
        }
        fetchNotes();
    }, []);

    useEffect(() => {
        fetchNotes();
        (async () => {
            const hanko = new Hanko(hankoApi);
            const u = await hanko.user.getCurrent();
            setUser(u);
        })();
    }, []);

    return (
        <Container maxWidth="xl" sx={{ p: 2 }}>
            <Box display={{ xs: "block", md: "flex" }} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography variant="h4">Notes</Typography>
                <IconButton onClick={addNote}>
                    <Icon component={Add} />
                </IconButton>
            </Box>
            {(!!notes.length || newNote) &&
                <Masonry columns={4} spacing={2} sx={{ py: 2 }}>
                    {newNote && <NoteForm note={newNote} onCancel={cancelEdit} onSave={saveNote} />}
                    {notes?.map((note, idx) => (
                        editNote?.id === note.id ?
                            <NoteForm key={idx} note={editNote} onCancel={cancelEdit} onSave={saveNote} /> :
                            <NoteBody key={idx} note={note} onEdit={() => (updateNote({ ...note }))} onDelete={() => (deleteNote({ ...note }))} />
                    ))}
                </Masonry>
            }
            {!notes.length && !newNote && <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                <Typography variant="h6" sx={{ mb: 2 }}>No notes found</Typography>
                <Button variant="outlined" onClick={addNote}>Add note</Button>
            </Box>}
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => (setError(""))}
                message={error}
            >
                <Alert onClose={() => (setError(""))} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Notes;
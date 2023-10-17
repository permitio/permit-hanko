import { Note } from "@/models/Note";
import { Alert, Box, Button, Paper, TextField } from "@mui/material"
import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";

type NoteFormProps = {
    note?: Note,
    onSave?: (note: Note) => Promise<string>,
    onCancel?: () => void,
}

const NoteForm: FunctionComponent<NoteFormProps> = ({
    note,
    onSave,
    onCancel
}) => {
    const [title, setTitle] = useState<string>(note?.title || "");
    const [text, setText] = useState<string>(note?.content || "");
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string>("");

    const save = async () => {
        if (!title || !text) {
            setError("Title and text are required");
            return;
        }
        setSaving(true);
        if (onSave) {
            const error = await onSave({ ...note, title, content: text } as Note);
            if (error) {
                setError(error);
            }
            setSaving(false);
        }
    }

    useEffect(() => {
        if (title && text && error == "Title and text are required") {
            setError("");
        }
    }, [title, text, error]);

    return (
        <Paper sx={{ p: 2 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField
                fullWidth
                onChange={(e: ChangeEvent<HTMLInputElement>) => (setTitle(e.currentTarget.value))}
                label="Title"
                value={title}
                id="title"
                sx={{ mb: 2 }}
                required
                error={!!error && !title}
            />
            <TextField
                fullWidth
                label="Text"
                id="text"
                value={text}
                onChange={(e: ChangeEvent<HTMLInputElement>) => (setText(e.currentTarget.value))}
                sx={{ mb: 2 }}
                rows={3}
                multiline
                required
                error={!!error && !text}
            />
            <Box display="flex" justifyContent="space-between" alignItems="stretch" gap={2} width="100%">
                <Button variant="outlined" sx={{ flex: 1 }} onClick={() => (onCancel && onCancel())} disabled={saving}>Cancel</Button>
                <Button variant="contained" sx={{ flex: 1 }} onClick={save} disabled={saving}>Save</Button>
            </Box>
        </Paper>
    )
}

export default NoteForm;
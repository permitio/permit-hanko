import { Note } from "@/models/Note";
import { Delete, Edit } from "@mui/icons-material";
import { Box, Icon, IconButton, Paper, Typography } from "@mui/material";
import { FunctionComponent } from "react";

type NoteBodyProps = {
    note: Note,
    onEdit?: (note: Note) => void,
    onCancel?: () => void,
    onDelete?: (note: Note) => void,
}

const NoteBody: FunctionComponent<NoteBodyProps> = ({
    note,
    onEdit,
    onDelete
}) => {
    return (
        <Paper sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">{note?.title}</Typography>
                <Box display="flex" alignItems="center">
                    <IconButton onClick={() => (onEdit && onEdit(note))}>
                        <Icon component={Edit} />
                    </IconButton>
                    <IconButton onClick={() => (onDelete && onDelete(note))}>
                        <Icon component={Delete} />
                    </IconButton>
                </Box>
            </Box>
            <Typography variant="caption" sx={{ mr: 2 }} color="GrayText">{new Date(note?.createdAt).toLocaleString()}</Typography>
            <Typography variant="body1">{note?.content}</Typography>
        </Paper>
    )
}

export default NoteBody;
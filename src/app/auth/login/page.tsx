import { Grid, Paper } from '@mui/material';
import HankoAuth from '../../components/HankoAuth';

export default function LoginPage() {
    return (
        <Grid
            container
            spacing={0}
            direction="column"
            alignItems="center"
            justifyContent="center"
            sx={{ minHeight: '100vh' }}
        >
            <Grid item xs={3}>
                <Paper sx={{ p: 2 }}>
                    <HankoAuth />
                </Paper>
            </Grid>
        </Grid>
    );
}

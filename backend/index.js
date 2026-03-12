import express from 'express';
import cors from 'cors';
import taskRoutes from './src/routes/route.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', taskRoutes);

app.listen(PORT, () => {
    console.log(`Task Manager API corriendo en http://localhost:${PORT}`);
    console.log(`Endpoint tasks: http://localhost:${PORT}/api/tasks`);
    console.log(`Endpoint users: http://localhost:${PORT}/api/users`);
});
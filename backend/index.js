const express = require('express');
const cors = require('cors');
const taskRoutes = require('./src/routes/route');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/tasks', taskRoutes);

app.listen(PORT, () => {
    console.log(`✅ Task Manager API corriendo en http://localhost:${PORT}`);
    console.log(`🚀 Endpoint base: http://localhost:${PORT}/tasks`);
});
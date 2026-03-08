const db = require('../config/firebase.js');
const tasksCollection = db.collection('tasks');

// GET /tasks
exports.getAll = async (req, res) => {
    try {
        const snapshot = await tasksCollection.get();
        const tasks = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                title: doc.data().title,
                completed: doc.data().completed
            };
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).send("Error al obtener tareas");
    }
};

// POST /tasks
exports.create = async (req, res) => {
    try {
        const { title, completed } = req.body;
        if (!title) {
            return res.status(400).json({ error: "El título es obligatorio" });
        }

        const snapshot = await tasksCollection.get();
        let nextId = 1;

        if (!snapshot.empty) {
            const ids = snapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                nextId = Math.max(...ids) + 1;
            }
        }

        const newTask = { title, completed: completed || false };
        
        await tasksCollection.doc(nextId.toString()).set(newTask);

        res.status(201).json({ id: nextId, ...newTask });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /tasks/:id
exports.remove = async (req, res) => {
    try {
        const id = req.params.id;
        await tasksCollection.doc(id).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error al eliminar");
    }
};

// PUT /tasks/:id
exports.update = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, completed } = req.body; 

        const datosActualizados = {
            title: title,
            completed: completed
        };

        await tasksCollection.doc(id).update(datosActualizados);

        res.json({ id, ...datosActualizados });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al actualizar la tarea");
    }
};
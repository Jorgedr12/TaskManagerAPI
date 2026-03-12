import db from '../config/firebase.js';
import bcrypt from 'bcrypt';

const tasksCollection = db.collection('tasks');
const usersCollection = db.collection('users');

const SALT_ROUNDS = 12;

// GET /tasks
export const getTasks = async (req, res) => {
    const userId = req.userId;
    try {
        const snapshot = await tasksCollection.where('userId', '==', userId).get();
        const tasks = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                title: doc.data().title,
                completed: doc.data().completed,
                userId: doc.data().userId
            };
        });
        res.json(tasks);
    } catch (error) {
        res.status(500).send("Error al obtener tareas");
    }
};

// GET /users
export const getUsers = async (req, res) => {
    try {
        const snapshot = await usersCollection.get();
        const users = snapshot.docs.map(doc => {
            return {
                id: doc.id,
                name: doc.data().name,
                email: doc.data().email,
                password: doc.data().password
            };
        });
        res.json(users);
    } catch (error) {
        res.status(500).send("Error al obtener usuarios");
    }
};

// POST /tasks
export const createTask = async (req, res) => {
    const userId = req.userId;
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

        const newTask = { title, completed: completed || false, userId };

        await tasksCollection.doc(nextId.toString()).set(newTask);

        res.status(201).json({ id: nextId, ...newTask });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// POST /users
export const createUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        } else if (!email) {
            return res.status(400).json({ error: "El email es obligatorio" });
        } else if (!password) {
            return res.status(400).json({ error: "La contraseña es obligatoria" });
        }

        const existingUserSnapshot = await usersCollection.where('email', '==', email).get();
        if (!existingUserSnapshot.empty) {
            return res.status(400).json({ error: "El email ya está registrado" });
        }

        const hashedPassword = await hashedPasswordSafely(password);

        const snapshot = await usersCollection.get();
        let nextId = 1;

        if (!snapshot.empty) {
            const ids = snapshot.docs.map(doc => parseInt(doc.id)).filter(id => !isNaN(id));
            if (ids.length > 0) {
                nextId = Math.max(...ids) + 1;
            }
        }

        const newUser = { name, email, password: hashedPassword };

        await usersCollection.doc(nextId.toString()).set(newUser);

        res.status(201).json({ id: nextId, ...newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE /tasks/:id
export const removeTask = async (req, res) => {
    try {
        const userId = req.userId;
        const id = req.params.id;
        const docRef = tasksCollection.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        if (doc.data().userId !== userId) {
            return res.status(403).json({ error: "No tienes permiso para eliminar esta tarea" });
        }

        await docRef.delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error al eliminar");
    }
};

// DELETE /users/:id
export const removeUser = async (req, res) => {
    try {
        const id = req.params.id;
        await usersCollection.doc(id).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).send("Error al eliminar usuario");
    }
};

// PUT /tasks/:id
export const updateTask = async (req, res) => {
    try {
        const id = req.params.id.toString();
        const userId = req.userId;
        const { title, completed } = req.body;

        const docRef = tasksCollection.doc(id);
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).json({ error: "Tarea no encontrada" });
        }

        if (doc.data().userId !== userId) {
            return res.status(403).json({ error: "No tienes permiso para actualizar esta tarea" });
        }

        const datosActualizados = {
            title: title !== undefined ? title : doc.data().title,
            completed: completed !== undefined ? completed : doc.data().completed
        };

        await docRef.update(datosActualizados);

        res.json({ id, ...datosActualizados });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).send("Error al actualizar la tarea");
    }
};

// Login
export const login = async (req, res) => {
    require('dotenv').config();

    const { email, password } = req.body;
    try {
        const userSnapshot = await usersCollection.where('email', '==', email).get();
        if (userSnapshot.empty) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        const isMatch = await bcrypt.compare(password, userData.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { userId: userDoc.id, email: userData.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '2h' }
        );

        res.json({
            message: "¡Inicio de sesión exitoso!",
            token: token,
            userId: userDoc.id
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en el login' });
    }
};


const hashedPasswordSafely = async (password) => {
    if (!password || typeof password !== 'string') {
        throw new Error('Contraseña inválida');
    }

    if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    try {
        return await bcrypt.hash(password, SALT_ROUNDS);
    } catch (error) {
        console.error('Error en bcrypt.hash:', error);
        throw new Error('Error al procesar la contraseña');
    }
};
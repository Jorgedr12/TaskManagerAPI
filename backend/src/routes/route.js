import express from 'express';
import * as tasksController from '../controllers/controllers.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// GET /tasks
router.get('/tasks', verifyToken, tasksController.getTasks);

// GET /users
router.get('/users', verifyToken, tasksController.getUsers);

// POST /tasks
router.post('/tasks', verifyToken, tasksController.createTask);

// POST /users
router.post('/users', verifyToken, tasksController.createUser);

// DELETE /users/:id
router.delete('/users/:id', verifyToken, tasksController.removeUser);

// DELETE /tasks/:id
router.delete('/tasks/:id', verifyToken, tasksController.removeTask);

// Update /tasks/:id
router.put('/tasks/:id', verifyToken, tasksController.updateTask);

export default router;
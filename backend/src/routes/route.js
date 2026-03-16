import express from 'express';
import * as tasksController from '../controllers/controllers.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/users', tasksController.createUser);
router.post('/login', tasksController.login);

router.get('/tasks', verifyToken, tasksController.getTasks);
router.post('/tasks', verifyToken, tasksController.createTask);
router.put('/tasks/:id', verifyToken, tasksController.updateTask);
router.delete('/tasks/:id', verifyToken, tasksController.removeTask);

router.get('/users', verifyToken, tasksController.getUsers);
router.delete('/users/:id', verifyToken, tasksController.removeUser);

export default router;
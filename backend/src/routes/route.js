const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/controllers');

// GET /tasks
router.get('/', tasksController.getAll);

// POST /tasks
router.post('/', tasksController.create);

// DELETE /tasks/:id
router.delete('/:id', tasksController.remove);

// Update /tasks/:id
router.put('/:id', tasksController.update);

module.exports = router;
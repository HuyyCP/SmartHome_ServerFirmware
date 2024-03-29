const express = require('express');
const router = express.Router();

const courseController = require('../app/controllers/CourseController');

// courseController
router.get('/create', courseController.create);
router.post('/store', courseController.store);

module.exports = router;
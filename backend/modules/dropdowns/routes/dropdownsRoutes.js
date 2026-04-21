import express from 'express';
import { getDropdownSchools, getDropdownDepartments, getDropdownLevels } from '../controller/dropdownsController.js';

const router = express.Router();

router.get('/schools', getDropdownSchools);
router.get('/departments', getDropdownDepartments);
router.get('/levels', getDropdownLevels);

export default router;
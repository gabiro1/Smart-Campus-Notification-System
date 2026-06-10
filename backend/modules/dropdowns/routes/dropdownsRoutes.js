import express from 'express';
import { getDropdownColleges, getDropdownSchools, getDropdownDepartments, getDropdownLevels, getDropdownClubs } from '../controller/dropdownsController.js';

const router = express.Router();

router.get('/colleges', getDropdownColleges);
router.get('/schools', getDropdownSchools);
router.get('/departments', getDropdownDepartments);
router.get('/levels', getDropdownLevels);
router.get('/clubs', getDropdownClubs);

export default router;
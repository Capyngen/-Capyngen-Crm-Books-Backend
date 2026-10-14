"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const Project_1 = require("../models/Project");
const getProjects = async (req, res) => {
    try {
        const projects = await Project_1.BooksProject.find().sort({ createdAt: -1 });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res) => {
    try {
        const project = await Project_1.BooksProject.findById(req.params.id);
        if (!project)
            return res.status(404).json({ message: 'Project not found' });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res) => {
    try {
        const project = new Project_1.BooksProject(req.body);
        const savedProject = await project.save();
        res.status(201).json(savedProject);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.createProject = createProject;
const updateProject = async (req, res) => {
    try {
        const updatedProject = await Project_1.BooksProject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedProject)
            return res.status(404).json({ message: 'Project not found' });
        res.json(updatedProject);
    }
    catch (error) {
        res.status(400).json({ message: error.message || 'Bad Request' });
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res) => {
    try {
        const deletedProject = await Project_1.BooksProject.findByIdAndDelete(req.params.id);
        if (!deletedProject)
            return res.status(404).json({ message: 'Project not found' });
        res.json({ message: 'Project deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteProject = deleteProject;

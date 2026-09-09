import { Request, Response } from 'express';
import { BooksProject } from '../models/Project';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const projects = await BooksProject.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const project = await BooksProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const project = new BooksProject(req.body);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const updatedProject = await BooksProject.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    res.json(updatedProject);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Bad Request' });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const deletedProject = await BooksProject.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

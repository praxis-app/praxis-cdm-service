import express from 'express';
import { getOllamaTest } from './ollama.controller';

export const ollamaRouter = express.Router();

ollamaRouter.get('/test', getOllamaTest);

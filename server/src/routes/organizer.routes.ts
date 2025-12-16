import { Router } from 'express';
import {
  organizerSignup,
  organizerLogin,
} from '../controllers/organizer.auth.controller';

const organizerRouter = Router();

organizerRouter.post('/signup', organizerSignup);
organizerRouter.post('/login', organizerLogin);

export default organizerRouter;

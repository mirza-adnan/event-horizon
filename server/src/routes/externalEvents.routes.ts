import { Router } from 'express';
import { getExternalEvents, triggerScraper } from '../controllers/externalEventController';

const router = Router();

router.get('/', getExternalEvents);
router.post('/scrape', triggerScraper);

export default router;

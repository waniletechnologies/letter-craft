import { Router } from 'express';
import clientController from '../controllers/clientController.js';
import { 
  validate, 
  validateQuery, 
  createClientSchema, 
  updateClientSchema, 
  clientQuerySchema 
} from '../middlewares/validationMiddleware.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Client routes
router.route('/')
.get(
  validateQuery(clientQuerySchema),
  clientController.getAllClients
)
.post(
    requireAuth,
    validate(createClientSchema),
    clientController.createClient
  );

// Client statistics
router.get('/statistics', clientController.getClientStatistics);

// Client search
router.get('/search', clientController.searchClients);


// Individual client routes
router.route('/:id')
  .get(clientController.getClientById)
  .put(
    requireAuth,
    validate(updateClientSchema),
    clientController.updateClient
  )
  .delete(requireAuth, clientController.deleteClient);

// Client status update
router.patch('/:id/status', requireAuth, clientController.updateClientStatus);

export default router;
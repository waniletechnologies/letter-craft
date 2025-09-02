import { Router } from 'express';
import clientController from '../controllers/clientController.js';
import { 
  validate, 
  validateQuery, 
  createClientSchema, 
  updateClientSchema, 
  clientQuerySchema 
} from '../middlewares/validationMiddleware.js';
// Auth temporarily disabled for simple testing

const router = Router();

// Client routes
router.route('/')
  .get(
    validateQuery(clientQuerySchema),
    clientController.getAllClients
  )
  .post(
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
    validate(updateClientSchema),
    clientController.updateClient
  )
  .delete(clientController.deleteClient);

// Client status update
router.patch('/:id/status', clientController.updateClientStatus);

// Note: Document upload functionality removed for now
// Will be implemented later when needed

export default router;
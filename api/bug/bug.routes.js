import express from 'express'
import { getBugs, getBugById, addBug, updateBug, removeBug } from './bug.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'

export const bugRoutes = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

bugRoutes.get('/', getBugs)
bugRoutes.get('/:id', getBugById)
bugRoutes.post('/', requireAuth, addBug)
bugRoutes.put('/:id', updateBug)
bugRoutes.delete('/:id', removeBug)

//* With Auth
// bugRoutes.get('/', log, getBugs)
// bugRoutes.get('/:id', getBugById)
// bugRoutes.post('/', requireAuth, requireAdmin, addBug)
// bugRoutes.put('/:id', requireAuth, requireAdmin, updateBug)
// bugRoutes.delete('/:id', requireAuth, requireAdmin, removeBug)

// router.delete('/:id', requireAuth, requireAdmin, removeToy)

// toyRoutes.post('/:id/msg', requireAuth, addToyMsg)
// toyRoutes.delete('/:id/msg/:msgId', requireAuth, removeToyMsg)
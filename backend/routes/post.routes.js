import express from 'express'
import { allPost, commentPost, createPost, deletePost, likeUnlikePost } from '../controllers/post.controller.js';
import { protectRoute } from '../middleware/protectRoute.js';
const router = express.Router()

router.get('/all', protectRoute, allPost)
router.post('/create', protectRoute, createPost)
router.delete('/:id', protectRoute, deletePost)
router.post('/like/:id', protectRoute, likeUnlikePost)
router.post('/comment/:id', protectRoute, commentPost)

export default router;
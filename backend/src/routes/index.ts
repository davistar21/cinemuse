import { Router } from "express";
import authRoutes from "./auth.routes.js";
import mediaRoutes from "./media.routes.js";
import searchRoutes from "./search.routes.js";
import listRoutes, { userListsRouter } from "./list.routes.js";

const router = Router();

// Mount routes
router.use("/auth", authRoutes);
router.use("/media", mediaRoutes);
router.use("/search", searchRoutes);
router.use("/lists", listRoutes);
router.use("/users/:userId/lists", userListsRouter);

export default router;

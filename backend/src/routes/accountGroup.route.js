// routes/accountGroup.routes.js
import express from "express";
import {
  createAccountGroups,
  getAccountGroups,
  updateAccountGroups,
  moveAccount,
  createGroup,
  renameGroup,
  deleteGroup,
  createCustomGroup,
} from "../controllers/accountGroup.controller.js";

const router = express.Router();

router.post("/account-groups", createAccountGroups);
router.post("/account-groups/custom", createCustomGroup);
router.get("/account-groups/:email", getAccountGroups);
router.put("/account-groups", updateAccountGroups);
router.patch("/account-groups/move-account", moveAccount);
router.post("/account-groups/create-group", createGroup);
router.patch("/account-groups/rename-group", renameGroup);
router.delete("/account-groups/delete-group", deleteGroup);

export default router;

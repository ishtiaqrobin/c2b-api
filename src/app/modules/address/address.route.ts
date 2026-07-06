import { Router } from "express";
import { AddressController } from "./address.controller";
import { checkAuth } from "../../middleware/checkAuth";
import {
  validateQuery,
  validateRequest,
} from "../../middleware/validateRequest";
import {
  createAddressZodSchema,
  updateAddressZodSchema,
  listPrefectureQueryZodSchema,
} from "./address.validation";

const router = Router();

// Prefecture listing (public — no auth required)
router.get(
  "/prefectures",
  validateQuery(listPrefectureQueryZodSchema),
  AddressController.listPrefectures,
);

// Customer: address CRUD
router.get("/my", checkAuth, AddressController.getMyAddresses);
router.get("/my/:id", checkAuth, AddressController.getAddressById);
router.post(
  "/my",
  checkAuth,
  validateRequest(createAddressZodSchema),
  AddressController.createAddress,
);
router.patch(
  "/my/:id",
  checkAuth,
  validateRequest(updateAddressZodSchema),
  AddressController.updateAddress,
);
router.delete("/my/:id", checkAuth, AddressController.deleteAddress);
router.patch("/my/:id/default", checkAuth, AddressController.setDefaultAddress);

export const AddressRoutes = router;

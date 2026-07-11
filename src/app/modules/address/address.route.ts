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
  listDistrictQueryZodSchema,
} from "./address.validation";

const router = Router();

// Division & District listing (public — no auth required)
router.get("/divisions", AddressController.listDivisions);
router.get(
  "/divisions/:divisionId/districts",
  AddressController.getDistrictsByDivision,
);
router.get(
  "/districts",
  validateQuery(listDistrictQueryZodSchema),
  AddressController.listDistricts,
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

import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";
import { AdminRoutes } from "../modules/admin/admin.route";
import { CategoryRoutes } from "../modules/category/category.route";
import { StoreRoutes } from "../modules/store/store.route";
import { ProductRoutes } from "../modules/product/product.route";
import { OrderRoutes } from "../modules/order/order.route";
import { PaymentRoutes } from "../modules/payment/payment.route";
import { CartRoutes } from "../modules/cart/cart.route";
import { EkycRoutes } from "../modules/ekyc/ekyc.route";
import { NotificationRoutes } from "../modules/notification/notification.route";
import { AddressRoutes } from "../modules/address/address.route";
import { NewsRoutes } from "../modules/news/news.route";
import { BannerRoutes } from "../modules/banner/banner.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/users", UserRoutes);
router.use("/admins", AdminRoutes);
router.use("/categories", CategoryRoutes);
router.use("/stores", StoreRoutes);
router.use("/products", ProductRoutes);
router.use("/orders", OrderRoutes);
router.use("/payments", PaymentRoutes);
router.use("/cart", CartRoutes);
router.use("/ekyc", EkycRoutes);
router.use("/notifications", NotificationRoutes);
router.use("/addresses", AddressRoutes);
router.use("/news", NewsRoutes);
router.use("/banners", BannerRoutes);

export const IndexRoutes = router;

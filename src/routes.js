import { Router } from "express";
import multer from "multer";
import UserController from "./app/controller/UserController";
import SessionController from "./app/controller/SessionController";
import authMiddleware from "./app/middlewares/auth";
import multerConfig from "./config/multer";
import FileController from "./app/controller/FileController";
import ProviderController from "./app/controller/ProviderController";
import AppointmentController from "./app/controller/AppointmentController";
import ScheduleController from "./app/controller/ScheduleController";
import NotificationController from "./app/controller/NotificationController";
import AvailableController from "./app/controller/AvailableController";

const routes = new Router();
const upload = multer(multerConfig);

routes.post("/users", UserController.store);
routes.post("/sessions", SessionController.store);

routes.use(authMiddleware);
routes.put("/users", UserController.update);
routes.get("/providers", ProviderController.index);
routes.get("/providers/:providerId/available", AvailableController.index);

routes.post("/appointments", AppointmentController.store);
routes.get("/appointments", AppointmentController.index);
routes.delete("/appointments/:id", AppointmentController.delete);

routes.get("/schedule", ScheduleController.index);

routes.get("/notifications", NotificationController.index);
routes.put("/notifications/:id", NotificationController.update);

routes.post("/files", upload.single("file"), FileController.store);
export default routes;

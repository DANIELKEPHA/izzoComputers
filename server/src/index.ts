import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/authMiddleware";
import usersRoutes from "./routes/usersRoutes";
import adminRoutes from "./routes/adminRoutes";
import productRoutes from "./routes/productRoutes";
import advertRoutes from "./routes/advertRoutes";
import newsletterRouter from "./routes/newsletterRouter";
import cartRouter from "./routes/cartRouter";
import orderRouter from "./routes/orderRouter";
import deliveryLocationRoutes from "./routes/deliveryLocationRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import reviewRoutes from "./routes/reviewRoutes";

/* CONFIGURATIONS */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("This is home route");
});

app.use("/products", productRoutes);
app.use("/admins", authMiddleware(["admin"]), adminRoutes);
app.use("/users", authMiddleware(["user"]), usersRoutes);
app.use("/adverts", advertRoutes);
app.use("/newsletter", newsletterRouter);
app.use("/carts", cartRouter);
app.use("/orders", orderRouter);
app.use("/delivery-location", deliveryLocationRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/reviews", reviewRoutes);
/* SERVER */
const port = Number(process.env.PORT) || 3002;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});

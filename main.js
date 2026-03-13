require("dotenv").config();
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const express = require("express");
const connectDB = require("./DB/connectedDB");
const { authLimiter, apiLimiter } = require("./middlewares/ratelimiter");
const errorHandler = require("./middlewares/error");

const app = express();
connectDB();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static(path.join(__dirname, "./web")));

app.use("/api/auth", authLimiter, require("./routes/auth.route"));
app.use("/api/user", apiLimiter, require("./routes/users.route"));
app.use("/api/menu", apiLimiter, require("./routes/menu.route"));
app.use("/api/order", apiLimiter, require("./routes/order.route"));

// Not Found Then Error
app.use((req, res, next) => {
  return res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});
app.use(errorHandler);

const Port = process.env.PORT || 8000;
app.listen(Port, () => {
  console.log("server is listen on port:", Port);
});

app.disable("x-powered-by");

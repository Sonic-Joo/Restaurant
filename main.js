require("dotenv").config();
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const express = require("express");
const connectDB = require("./DB/connectedDB");
const { authLimiter, apiLimiter } = require("./middlewares/ratelimiter");
const morganLogger = require("./middlewares/morganLogger");
const logger = require("./utils/logger");
const { errorHandler, notFound } = require("./middlewares/error");
const passport = require("passport");
const session = require("express-session");
require("./utils/passport");

const app = express();
connectDB();

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(morganLogger);
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "./web")));

app.use("/api/auth", authLimiter, require("./routes/auth.route"));
app.use("/api/user", apiLimiter, require("./routes/users.route"));
app.use("/api/menu", apiLimiter, require("./routes/menu.route"));
app.use("/api/order", apiLimiter, require("./routes/order.route"));

// Not Found Then Error
app.use(notFound);
app.use(errorHandler);

const Port = process.env.PORT || 8000;
app.disable("x-powered-by");
app.listen(Port, () => {
  logger.info("server is listen on port:", Port);
});

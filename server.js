const express = require("express");
//bodyParser nous aide a traité les REQUETES
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
const cors = require("cors");

const app = express();
const xss = require("xss-clean");
app.use(cors());
app.use(xss());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//jwt
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id);
});

//route
app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);

//setting du PORT avec variable d'environnement .env
app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}`);
});

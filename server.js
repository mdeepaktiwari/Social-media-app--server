// require can be changes to import using esm
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { readdirSync } from "fs";
const morgan = require("morgan");

// To make our app use the environment variables we need to configure it
require("dotenv").config();
const router = require("./routes/auth");
const port = 8000;
const app = express();

mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((e) => {
    console.log("Error in connected to DB", e);
  });
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

//cross- origin - This allow the request to be from any host
// We used it to allow our local host to send request to the same local server
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

// autoload routes- here fs is checking in routes directory and get files and then using map we
// ask our app to use it
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));
// app.use(morgan());

app.listen(port, () => console.log("Server is running on port", port));

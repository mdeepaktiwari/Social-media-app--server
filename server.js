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
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  path: "/socket.io",
  cors: {
    origin: "http://localhost:3000",
    method: ["GET", "POST"],
    allowedHeaders: ["Content-type"],
  },
});

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
    origin: [process.env.CLIENT_URL],
  })
);

// autoload routes- here fs is checking in routes directory and get files and then using map we
// ask our app to use it
readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));
// app.use(morgan());

// socket io
io.on("connect", (socket) => {
  console.log("Socket io ", socket.id);
  socket.on("new-post", (data) => {
    socket.broadcast.emit("new-post", data);
  });
});

http.listen(port, () => console.log("Server is running on port", port));

// deployment
// merncamp.com
// merncamp.com/api
// merncamp.com/socket.io
// as we are using socket.io we need to add different path for socket

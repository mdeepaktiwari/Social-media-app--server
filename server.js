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

// ssh root@IP
// adduser fsadmin
// usermod -aG sudo fsadmin
// sudo su fsadmin
// sudo vim /etc/ssh/sshd_config
// escape and :wq
// sudo service ssh restart
// push the local repository to gitHub
// curl -sL https://deb.nodesource.com/setup_16.x -o nodesource_setup.sh
// nano nodesource_setup.sh
// sudo bash nodesource_setup.sh
// sudo apt-get install nodejs
// clone the git
// cd project
// sudo apt-get install nginex
// cd /etc/nginx/sites-available
// sudo vim default
// location/api{

// }
// location/{

// }

// sudo nginx -t
// sudo systenctl restart nginx
// sudo touch .env
// sudo vim .env
// add environment variable

// echo "deb http://repo.mongodb.org/apt/debian bullseye/mongodb-org/6.0 main" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
// sudo apt update
// sudo apt install -y mongodb
// sudo systemctl status mongodb
// show dbs
// user nodeapi
// sudo npm i -g pm2
// cd server
// sudo npm install
// pm2 start -r esm server.js

// cd client
// sudo touch .env.local
// sudo vim .env.local
// add env variable
// sudo npm run built
// pm1 start npm --start

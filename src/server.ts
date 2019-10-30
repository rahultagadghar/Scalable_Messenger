import { channel } from "./interface";
import { Socket, Server } from "socket.io";
import { NextFunction, Response, Request } from "express";
import redisAdapter from "socket.io-redis";
import { connect } from "mongoose";
import express from "express";
import {
    setUserName,
    getAndSendMessage,
    getOldMessages,
    setOnlineStatus,
    onDisconnect
} from "./socket/identity";

const {
    MONGO_DB = `mongodb://localhost/chat`,
    PORT = 3000,
    REDIS_DB = `localhost`
} = process.env;

const mongoDbConfig = { useUnifiedTopology: true, useNewUrlParser: true }
const redisConfiguration = { host: REDIS_DB, port: 6379 };

const app = express();
const server = require("http").Server(app);
const io: Server = require("socket.io")(server);

connect(MONGO_DB, mongoDbConfig)
    .then(() => console.log("connected"))
    .catch(console.log);

server.listen(PORT, () => console.log(`server started on port : ${PORT}`));

io.adapter(redisAdapter(redisConfiguration));

io.use(setUserName)
    .use(getOldMessages)
    .use(setOnlineStatus.bind({ activeStatus: true }))
    .on(channel.CONNECTION, (socket: Socket) => {
        socket.on(channel.ONE_TO_ONE_FROM_CLIENT, getAndSendMessage.bind(io));
        socket.on(channel.DISCONNECT, onDisconnect.bind(socket));
    });

app.get("/", function (req: any, res: any) {
    res.sendFile(__dirname + "/index.html");
});
app.get("/clients", function (req: any, res: Response, next: NextFunction) {
    const { adapter }: any = io.of("/");
    adapter.clients((err: any, clients: any) => {
        if (err) {
            return next({ httpStatusCode: 400, message: `Bad request` });
        }
        res.send(clients);
    });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res
        .status(err.httpStatusCode || 500)
        .send(err.message || `Internal server error`);
});

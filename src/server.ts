import { Socket } from "socket.io";
import { NextFunction, Response, Request } from "express";
import redisAdapter from "socket.io-redis";

const port = process.env.PORT || 3000
import express from 'express'
import { SetUserName, DeleteUserName } from "./socket/identity";
const app = express();
const server = require('http').Server(app);
const io: any = require('socket.io')(server);

const redisConfiguration = { host: process.env.REDIS_DB || `localhost`, port: 6379 }


server.listen(port, () => console.log(`server started on port : ${port}`));

io.adapter(redisAdapter(redisConfiguration));

io.use(SetUserName)
    .on('connection', (socket: Socket) => {
        io.emit('hello', "awesome")
        socket.on('disconnect', DeleteUserName.bind(socket))
    });

app.get('/', function (req: any, res: any) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/clients', function (req: any, res: Response, next: NextFunction) {
    io.of('/').adapter.clients((err: any, clients: any) => {
        if (err) {
            return next({ httpStatusCode: 400, message: `Bad request` })
        }
        res.send(clients)
    });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(err.httpStatusCode || 500).send(err.message || `Internal server error`)
})
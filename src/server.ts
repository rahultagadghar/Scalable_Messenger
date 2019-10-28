import { Socket } from "socket.io";
import { NextFunction, Response, Request } from "express";

const port = process.env.PORT || 3000
const app = require('express')();
const server = require('http').Server(app);

const io: any = require('socket.io')(server);
const redisAdapter = require('socket.io-redis');
server.listen(port, () => console.log(`server started on port : ${port}`));

io.adapter(redisAdapter({ host: process.env.REDIS_DB || `localhost`, port: 6379 }));

io.on('connection', (socket: Socket) => {
    io.emit('hello', "awesome")
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
import { Socket } from "socket.io";
import Redis from "ioredis"
const redisConfiguration = { host: process.env.REDIS_DB || `localhost`, port: 6379 }

const redis = new Redis(redisConfiguration);


export function SetUserName(socket: Socket, next: Function) {
    redis.set(socket.handshake.query.userName, socket.id);
    next()
}

export function DeleteUserName(this: Socket) {
    redis.del(this.handshake.query.userName);
}
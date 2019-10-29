import { Socket, Server } from "socket.io";
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

async function getSocketId(userName: any) {
    const result: any = await redis.get(userName)
    return result
}

interface msgPayload {
    userName: string | null,
    toSocketId: string,
    message: string
}

export async function GetAndSendMessage(this: Server, msg: any) {

    console.log('got masg', msg)
    
    const id = await getSocketId(msg.userName)
    console.log("id", id)
    // this.to(msg.toSocketId).emit("One-One-From-Server", msg.message)
    this.to(id).emit("One-One-From-Server", msg.message)

}
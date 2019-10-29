import { Socket, Server } from "socket.io";
import Redis from "ioredis";
import { channel, msgPayload } from '../interface'
import { messageModel } from "../model/messages";
const redisConfiguration = {
    host: process.env.REDIS_DB || `localhost`,
    port: 6379
};

const redis = new Redis(redisConfiguration);

export async function getMessages(socket: Socket, next: Function) {
    const query = {
        receiverUserName: socket.handshake.query.userName
    }
    const allUserMessages = await messageModel.find(query);
    if (!allUserMessages) {
        return next();
    }
    socket.emit(channel.ONE_TO_ONE_FROM_SERVER, allUserMessages)
    await messageModel.remove(query)
    next()
}

export function SetUserName(socket: Socket, next: Function) {
    redis.set(socket.handshake.query.userName, socket.id);
    next();
}

export function DeleteUserName(this: Socket) {
    redis.del(this.handshake.query.userName);
}

async function getSocketId(userName: string): Promise<any> {
    return await redis.get(userName);
}

export async function GetAndSendMessage(this: Server, msg: msgPayload) {
    msg.time = Date.now();
    const id = await getSocketId(msg.receiverUserName);
    console.log('msg', msg)
    if (!id) {
        return await messageModel.insertMany([msg]);
    }
    this.to(id).emit(channel.ONE_TO_ONE_FROM_SERVER, msg);
}

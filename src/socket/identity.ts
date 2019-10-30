import { Socket, Server } from "socket.io";
import Redis from "ioredis";
import { channel, msgPayload } from "../interface";
import { messageModel } from "../model/messages";
import { onlineStatusModel } from "../model/onlineStatus";
const redisConfiguration = {
    host: process.env.REDIS_DB || `localhost`,
    port: 6379
};
const redis = new Redis(redisConfiguration);
export async function getOldMessages(socket: Socket, next: Function) {
    const query = {
        receiverUserName: socket.handshake.query.userName
    };
    const allUserMessages = await messageModel.find(query);
    if (!allUserMessages) {
        return next();
    }
    socket.emit(channel.ONE_TO_ONE_FROM_SERVER, allUserMessages);
    await messageModel.remove(query);
    next();
}
export function setUserName(socket: Socket, next: Function) {
    redis.set(socket.handshake.query.userName, socket.id);
    next();
}
export async function setOnlineStatus(this: any, socket: Socket, next: Function) {
    const active = this.activeStatus;
    const { userName } = socket.handshake.query;
    const doc = { userName, active, lastSeen: Date.now() };
    await onlineStatusModel.findOneAndUpdate({ userName }, doc, { upsert: true });
    next();
}
export function DeleteUserName(this: Socket) {
    return redis.del(this.handshake.query.userName);
}
async function getSocketId(userName: string): Promise<any> {
    return await redis.get(userName);
}
export async function getAndSendMessage(this: Server, msg: msgPayload) {
    msg.time = Date.now();
    const id = await getSocketId(msg.receiverUserName);
    if (!id) {
        return await messageModel.insertMany([msg]);
    }
    this.to(id).emit(channel.ONE_TO_ONE_FROM_SERVER, msg);
}
export async function onDisconnect(this: Socket) {
    await DeleteUserName.bind(this)()
    await setOnlineStatus.bind({ activeStatus: false })(this, () => null)
}
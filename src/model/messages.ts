import { Schema, model } from 'mongoose'

const messageSchema = new Schema({
    senderUserName: String,
    receiverUserName: String,
    messages: Array,
    time: { type: Date, default: Date.now }
})

export const messageModel = model("messages", messageSchema)
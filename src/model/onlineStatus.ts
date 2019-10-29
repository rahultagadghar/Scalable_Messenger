import { Schema, model } from 'mongoose'

const onlineStatusSchema = new Schema({
    userName: String,
    active: Boolean,
    lastSeen: { type: Date, default: Date.now }
})

export const messageModel = model("lastSeen", onlineStatusSchema)
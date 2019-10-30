export enum channel {
    ONE_TO_ONE_FROM_SERVER = "One-One-From-Server",
    ONE_TO_ONE_FROM_CLIENT = "One-One-From-Client",
    CONNECTION = "connection",
    DISCONNECT = "disconnect",
}

export interface msgPayload {
    senderUserName: string;
    receiverUserName: string;
    message: string;
    time: number;
}

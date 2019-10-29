export enum channel {
    ONE_TO_ONE_FROM_SERVER = "One-One-From-Server"
}

export interface msgPayload {
    senderUserName: string;
    receiverUserName: string;
    message: string;
    time: number;
}

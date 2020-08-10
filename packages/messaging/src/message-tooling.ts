import { Header, Message, } from './interfaces';

export function messageWithHeader<MessageType, PayloadType>
    (message: Message<MessageType, PayloadType>, header: Header): Message<MessageType, PayloadType> {
    return {...message, headers: [...(message.headers || []), header]};
}

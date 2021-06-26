import { Header, Message, } from './interfaces';

export function messageWithHeader<MessageType, PayloadType>
    (message: Message<MessageType, PayloadType>, header: Header): Message<MessageType, PayloadType> {
    let headers = message.headers || {};
    return {...message, headers: { ...headers, [header.key]: header.value}};
}

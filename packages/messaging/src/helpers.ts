import {
    Message,
    MessageConsumer,
    MessageConsumerFunc,
    MessageDispatcher,
    MessageDispatcherFunc, PartitionedMessage,
    StreamDefinition
} from './interfaces';

export function createMessageDispatcher<Stream extends StreamDefinition>
(send: MessageDispatcherFunc<Stream>): MessageDispatcher<Stream> {
    return {send};
}

export function createMessageConsumer<Stream extends StreamDefinition>
(consume: MessageConsumerFunc<Stream>): MessageConsumer<Stream> {
    return {consume};
}

export function isPartitionedMessage<MessageType, PayloadType>(message: Message<MessageType, PayloadType>): message is PartitionedMessage<MessageType, PayloadType> {
    return (message as PartitionedMessage<MessageType, PayloadType>).offset !== undefined
        && (message as PartitionedMessage<MessageType, PayloadType>).partition !== undefined
        && (message as PartitionedMessage<MessageType, PayloadType>).offset !== undefined;
}

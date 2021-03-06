export interface StreamDefinition {
    topic: string,
    messages: object,
}

export interface Header {
    key: string,
    value: Buffer | string | string[],
}

export interface MessageHeaders {
    [key: string]: Buffer | string | string[];
}

export interface Message<MessageType, PayloadType> {
    headers?: MessageHeaders,
    type: MessageType,
    payload: PayloadType
}

export interface PartitionedMessage<MessageType, PayloadType> extends Message<MessageType, PayloadType> {
    topic: string,
    partition: number,
    offset: number,
}

export type MessageHandlers<Stream extends StreamDefinition> = {
    readonly [K in keyof Stream['messages']]: (message: Message<K, Stream['messages'][K]>) => Promise<void>
};

export type TopicOfStream<Stream extends StreamDefinition> = Stream['topic'];
export type AnyMessageTypeFromStream<Stream extends StreamDefinition> = keyof Stream['messages'];
export type AnyPayloadFromStream<Stream extends StreamDefinition> = Stream['messages'][AnyMessageTypeFromStream<Stream>];

export type MessagesPerMessageType<Stream extends StreamDefinition> = {
    [K in keyof Stream['messages']]: Message<K, Stream['messages'][K]>
};

export type AnyMessageFrom<Stream extends StreamDefinition> = MessagesPerMessageType<Stream>[keyof MessagesPerMessageType<Stream>]
export type MessagesFrom<Stream extends StreamDefinition> = AnyMessageFrom<Stream>[];

export interface MessageConsumerFunc<Stream extends StreamDefinition> {
    (message: AnyMessageFrom<Stream>): Promise<void>
}

export interface MessageConsumer<Stream extends StreamDefinition> {
    consume(message: AnyMessageFrom<Stream>): Promise<void>
}

export interface MessageDispatcherFunc<Stream extends StreamDefinition> {
    (...messages: MessagesFrom<Stream>): Promise<void>
}

export interface MessageDispatcher<Stream extends StreamDefinition> {
    send(...messages: MessagesFrom<Stream>): Promise<void>
}

import {
    MessageConsumer,
    MessageConsumerFunc,
    MessageDispatcher,
    MessageDispatcherFunc,
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

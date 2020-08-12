import {
    MessageConsumer,
    MessageConsumerFunc,
    MessageDispatcher,
    MessageDispactcherFunc,
    StreamDefinition
} from './interfaces';

export function createMessageDispatcher<Stream extends StreamDefinition>
(dispatch: MessageDispactcherFunc<Stream>): MessageDispatcher<Stream> {
    return {send: dispatch};
}

export function createMessageConsumer<Stream extends StreamDefinition>
(consume: MessageConsumerFunc<Stream>): MessageConsumer<Stream> {
    return {consume};
}

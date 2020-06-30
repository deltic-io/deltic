import {
    MessageConsumer,
    MessageConsumerFunc,
    MessageProducer,
    MessageProducerFunc,
    StreamDefinition
} from './interfaces';

export function createMessageProducer<Stream extends StreamDefinition>
(send: MessageProducerFunc<Stream>): MessageProducer<Stream> {
    return {send};
}

export function createMessageConsumer<Stream extends StreamDefinition>
(consume: MessageConsumerFunc<Stream>): MessageConsumer<Stream> {
    return {consume};
}

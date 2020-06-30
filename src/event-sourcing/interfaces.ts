import { MessagesFrom, StreamDefinition } from '../messaging';

export interface AggregateRoot<Stream extends EventStreamDefinition<Stream>> {
    releaseEvents(): MessagesFrom<Stream>;
    aggregateRootVersion(): number;
    readonly aggregateRootId: Stream['aggregateRootIdType'];
}

export interface EventStreamDefinition<Stream extends EventStreamDefinition<Stream>> extends StreamDefinition {
    aggregateRootType: AggregateRoot<Stream>;
    aggregateRootIdType: any;
}

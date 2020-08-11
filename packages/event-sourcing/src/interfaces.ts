import { MessagesFrom, StreamDefinition } from '@deltic/messaging';

export interface AggregateRoot<Stream extends EventStreamDefinition<Stream>> {
    releaseEvents(): MessagesFrom<Stream>;
    aggregateRootVersion(): number;
    readonly aggregateRootId: Stream['aggregateRootId'];
}

export interface EventStreamDefinition<Stream extends EventStreamDefinition<Stream>> extends StreamDefinition {
    aggregateRoot: AggregateRoot<Stream>;
    aggregateRootId: any;
}

import { AggregateRoot, EventStreamDefinition } from './interfaces';
import { AnyMessageFrom, AnyMessageTypeFromStream, MessagesFrom } from '../messaging';
import 'reflect-metadata';

const eventHandlerMetadataKey = Symbol.for("deltic:event-sourcing:event-handler");

type MessageType = string | number;
type KeyType = string | symbol;
type LookupTable = Map<MessageType, KeyType>;

export const EventHandler = (messageType: MessageType): MethodDecorator => {
    return (aggregateRoot: object, key: KeyType) => {
        let metadata: LookupTable = Reflect.getMetadata(eventHandlerMetadataKey, aggregateRoot) || new Map();
        metadata.set(messageType, key);
        Reflect.defineMetadata(eventHandlerMetadataKey, metadata, aggregateRoot);
    }
}

export function createHandlerLookupTable<Stream extends EventStreamDefinition<Stream>>(aggregateRoot: AggregateRoot<Stream>) {
    return Reflect.getMetadata(eventHandlerMetadataKey, aggregateRoot) || new Map();
}

export abstract class AggregateRootBehavior<Stream extends EventStreamDefinition<Stream>> implements AggregateRoot<Stream> {
    readonly aggregateRootId: Stream['aggregateRootIdType'];
    private recordedMessages: MessagesFrom<Stream> = [];
    private aggregateRootVersionNumber = 0;
    private readonly eventHandlerMethodMap: LookupTable;

    constructor(aggregateRootId: Stream['aggregateRootIdType']) {
        this.aggregateRootId = aggregateRootId;
        this.eventHandlerMethodMap = createHandlerLookupTable(this);
    }

    protected recordThat<T extends AnyMessageTypeFromStream<Stream>>(type: T, payload: Stream['messages'][T]): void
    {
        let message = { type, payload };
        this.recordedMessages.push(message);
        this.aggregateRootVersionNumber++;
        this.apply(message);
    }

    protected apply(message: AnyMessageFrom<Stream>): void
    {
        let handler: KeyType | undefined = this.eventHandlerMethodMap.get(message.type as MessageType);

        if (handler) {
            (this as any)[handler](message.payload);
        }
    }


    aggregateRootVersion(): number {
        return this.aggregateRootVersionNumber;
    }

    releaseEvents(): MessagesFrom<Stream> {
        let events = this.recordedMessages;
        this.recordedMessages = [];
        return events;
    }

}

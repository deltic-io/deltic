import { EventStreamDefinition } from './interfaces';
import { AnyMessageTypeFromStream, MessagesFrom } from '@deltic/messaging';
import { InMemoryMessageRepository } from './in-memory-message-repository';
import { AggregateRootFactory, AggregateRootRepository } from './aggregate-root-repository';

type WhenHandler<Stream extends EventStreamDefinition<Stream>> =
    (context: { aggregateRoot: Stream['aggregateRoot'], repository: AggregateRootRepository<Stream> }) => Promise<void>;

export function createTestTooling<Stream extends EventStreamDefinition<Stream>>(
    id: Stream['aggregateRootId'],
    factory: AggregateRootFactory<Stream>
) {
    let jestTest = global.test;
    let messageRepository = new InMemoryMessageRepository<Stream>();
    let repository = new AggregateRootRepository(factory, messageRepository);
    let error: Error | undefined = undefined;

    afterEach(() => {
        messageRepository.clear();
        expect(error).toBeUndefined();
    });

    let createMessage = <T extends AnyMessageTypeFromStream<Stream>>(type: T, payload: Stream['messages'][T]) =>
        ({ type, payload });

    let given = async (...messages: MessagesFrom<Stream>) => {
        await messageRepository.persist(id, messages);
        messageRepository.clearLastCommit();
    };

    let when = async (handle: WhenHandler<Stream>) => {
        let aggregateRoot = await repository.retrieve(id);
        try {
            await handle({aggregateRoot, repository});
        } catch (e) {
            error = e;
        } finally {
            await repository.persist(aggregateRoot);
        }
    }

    let thrownError = () => {
        let e = error;
        error = undefined;
        throw e;
    }
    let emittedEvents = () => messageRepository.lastCommit.map(m => ({type: m.type, payload: m.payload}));

    type TestTooling = {
        given: typeof given,
        when: typeof when,
        createMessage: typeof createMessage,
        thrownError: typeof thrownError,
        emittedEvents: typeof emittedEvents,
    }

    type TestHandler = (tools: TestTooling) => Promise<void>;

    let test = (name: string, testHandler: TestHandler, timeout?: number) => {
        jestTest(name, async () => {
            await testHandler({given, when, createMessage, emittedEvents, thrownError});
        }, timeout);
    };

    return test;
}

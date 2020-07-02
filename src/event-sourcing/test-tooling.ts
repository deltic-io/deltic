import { AggregateRoot, EventStreamDefinition } from './interfaces';
import { AnyMessageTypeFromStream, MessagesFrom } from '../messaging';
import { InMemoryMessageRepository } from './in-memory-message-repository';
import { AggregateRootFactory, AggregateRootRepository } from './aggregate-root-repository';

type WhenHandler<Stream extends EventStreamDefinition<Stream>> =
    (context: { aggregateRoot: Stream['aggregateRootType'], repository: AggregateRootRepository<Stream> }) => Promise<void>;

export function createTestTooling<Stream extends EventStreamDefinition<Stream>>(
    id: Stream['aggregateRootIdType'],
    factory: AggregateRootFactory<Stream>
) {
    let jestTest = global.test;
    let messageRepository = new InMemoryMessageRepository<Stream>();
    let repository = new AggregateRootRepository(factory, messageRepository);
    let error: Error | undefined = undefined;

    afterEach(() => messageRepository.clear());

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

    let then = (...messages: MessagesFrom<Stream>): void => expect(messageRepository.lastCommit).toEqual(messages);

    let expectToFail = async (err?: Error) => {
        if (error === undefined) {
            expect(error).not.toBeUndefined();
        } else {
            expect(error).toEqual(err);
        }
        error = undefined;
    }

    let expectNoEvents = () => expect(messageRepository.lastCommit).toHaveLength(0);

    type TestTooling = {
        given: typeof given,
        when: typeof when,
        then: typeof then,
        expectToFail: typeof expectToFail,
        expectNoEvents: typeof expectNoEvents,
        createMessage: typeof createMessage,
    }

    type TestHandler = (tools: TestTooling) => Promise<void>;

    let test = (name: string, testHandler: TestHandler, timeout?: number) => {
        jestTest(name, async () => {
            await testHandler({given, when, then, expectToFail, expectNoEvents, createMessage});
            expect(error).toBeUndefined();
        }, timeout);
    };

    return test;
}

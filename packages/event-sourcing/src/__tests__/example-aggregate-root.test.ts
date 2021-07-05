import { createTestTooling } from '../';
import { ExampleAggregateRoot, ExampleStream, ExampleTypes, Member } from '../example-stream.stubs';

const frank: Member = {id: '1234', name: 'Frank', age: 32};
const renske: Member = {id: '1235', name: 'Renske', age: 29};
const test = createTestTooling<ExampleStream>('abcde', ExampleAggregateRoot);

/**
 * @group unit
 */
describe('Example aggregate root testing', () => {
    test("adding a member that is already part of the group", async ({given, when, createMessage, emittedEvents}) => {
        await given(createMessage(ExampleTypes.MemberWasAdded, frank));
        await when(async ({aggregateRoot}) => {
            aggregateRoot.addMember(frank);
        });
        expect(emittedEvents()).toHaveLength(0);
    });

    test("An aggregate root maintains a version", async ({when, createMessage}) => {
        await when(async ({ aggregateRoot }) => {
            expect(aggregateRoot.aggregateRootVersion()).toEqual(0);
            aggregateRoot.addMember(frank);
            expect(aggregateRoot.aggregateRootVersion()).toEqual(1);
            aggregateRoot.addMember(renske);
            expect(aggregateRoot.aggregateRootVersion()).toEqual(2);
        });
    });

    test("An aggregate does not need to have a handler for an event", async ({when, emittedEvents}) => {
        await when(async ({ aggregateRoot }) => {
            aggregateRoot.recordInsignificantEvent('something');
            aggregateRoot.recordInsignificantEvent('something else');
        });
        expect(emittedEvents()).toHaveLength(2);
    })

    test("Adding a member", async ({when, emittedEvents, createMessage}) => {
        await when(async ({aggregateRoot}) => {
            aggregateRoot.addMember(frank);
        });
        expect(emittedEvents()).toEqual([
            createMessage(ExampleTypes.MemberWasAdded, frank)
        ]);
    });

    test("Adding multiple members", async ({when, createMessage, emittedEvents}) => {
        await when(async ({aggregateRoot}) => {
            aggregateRoot.addMember(frank);
            aggregateRoot.addMember(renske);
        });
        expect(emittedEvents()).toEqual([
            createMessage(ExampleTypes.MemberWasAdded, frank),
            createMessage(ExampleTypes.MemberWasAdded, renske),
        ]);
    });

    test("Removing a member", async ({when, createMessage, given, emittedEvents}) => {
        await given(createMessage(ExampleTypes.MemberWasAdded, frank));
        await when(async ({aggregateRoot}) => {
            aggregateRoot.removeMember(frank.id);
        });
        expect(emittedEvents()).toEqual([createMessage(ExampleTypes.MemberWasRemoved, {id: frank.id})]);
    });

    test("Removing a member that does not exist", async ({when, createMessage, given, emittedEvents}) => {
        await when(async ({aggregateRoot}) => {
            aggregateRoot.removeMember(frank.id);
        });
        expect(emittedEvents()).toHaveLength(0);
    });

    test("Causing an error", async ({when, thrownError}) => {
        let error = new Error('what the hell');
        await when(async ({aggregateRoot}) => {
            aggregateRoot.throwAnError(error);
        });
        expect(thrownError).toThrow(new Error('what the hell'));
    });
});

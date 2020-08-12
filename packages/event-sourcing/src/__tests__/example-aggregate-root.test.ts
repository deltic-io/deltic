import { createTestTooling } from '../';
import { ExampleAggregateRoot, ExampleStream, ExampleTypes, Member } from '../example-stream.stubs';

const frank: Member = {id: '1234', name: 'Frank', age: 32};
const renske: Member = {id: '1235', name: 'Renske', age: 29};
const test = createTestTooling<ExampleStream>('abcde', ExampleAggregateRoot);

/**
 * @group unit
 */
describe('Example aggregate root testing', () => {
    test("Trying to add a member that is already part of the group", async ({given, when, createMessage, emittedEvents}) => {
        await given(createMessage(ExampleTypes.MemberWasAdded, frank));
        await when(async ({aggregateRoot}) => {
            aggregateRoot.addMember(frank);
        });
        expect(emittedEvents()).toHaveLength(0);
    });

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
        expect(emittedEvents()).toEqual([createMessage(ExampleTypes.MemberWasRemoved, {id: frank.id})])
    });

    test("Causing an error", async ({when, thrownError}) => {
        let error = new Error('what the hell');
        await when(async ({aggregateRoot}) => {
            aggregateRoot.throwAnError(error);
        });
        expect(thrownError).toThrow(new Error('what the hell'));
    });
});

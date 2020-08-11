import { AggregateRootBehavior, EventHandler } from '../aggregate-root-behavior';
import { AnyMessageFrom } from '@deltic/messaging';
import { createTestTooling } from '../test-tooling';

enum ExampleTypes {
    MemberWasAdded = "member.was.added",
    MemberWasRemoved = "member.was.removed",
}

interface Member {
    readonly id: string,
    readonly name: string,
    readonly age: number,
}

interface MemberWasAdded {
    readonly id: string,
    readonly name: string,
    readonly age: number,
}

interface MemberWasRemoved {
    readonly id: string,
}

type ExampleAggregateRootId = string;

interface ExampleStream {
    topic: 'example'
    aggregateRootId: ExampleAggregateRootId,
    aggregateRoot: ExampleAggregateRoot,
    messages: {
        [ExampleTypes.MemberWasAdded]: MemberWasAdded,
        [ExampleTypes.MemberWasRemoved]: MemberWasRemoved,
    }
}

class ExampleAggregateRoot extends AggregateRootBehavior<ExampleStream> {
    private members: Map<string, Member> = new Map();

    addMember(member: Member): void {
        if (!this.members.has(member.id)) {
            this.recordThat(ExampleTypes.MemberWasAdded, member);
        }
    }

    removeMember(id: string): void {
        if (this.members.has(id)) {
            this.recordThat(ExampleTypes.MemberWasRemoved, {id});
        }
    }

    public throwAnError(error: Error): void {
        throw error;
    }

    @EventHandler(ExampleTypes.MemberWasAdded)
    protected whenMemberWasAdded(event: MemberWasAdded) {
        this.members.set(event.id, event);
    }

    @EventHandler(ExampleTypes.MemberWasRemoved)
    protected whenMemberWasRemoved(event: MemberWasRemoved) {
        this.members.delete(event.id);
    }

    static async reconstituteFromEvents(
        id: ExampleAggregateRootId,
        messages: AsyncGenerator<AnyMessageFrom<ExampleStream>>
    ) {
        let aggregateRoot = new ExampleAggregateRoot(id);

        for await (let m of messages) {
            aggregateRoot.apply(m);
        }

        return aggregateRoot;
    }
}

const frank: Member = {id: '1234', name: 'Frank', age: 32};
const renske: Member = {id: '1235', name: 'Renske', age: 29};
const test = createTestTooling<ExampleStream>('abcde', ExampleAggregateRoot);

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
    await when(async ({ aggregateRoot }) => {
        aggregateRoot.throwAnError(error);
    });
    expect(thrownError).toThrow(new Error('what the hell'));
});

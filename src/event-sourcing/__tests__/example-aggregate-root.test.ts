import { AggregateRootBehavior, EventHandler } from '../aggregate-root-behavior';
import { AnyMessageFrom } from '../../messaging';
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
    aggregateRootIdType: ExampleAggregateRootId,
    aggregateRootType: ExampleAggregateRoot,
    messages: {
        [ExampleTypes.MemberWasAdded]: MemberWasAdded,
        [ExampleTypes.MemberWasRemoved]: MemberWasRemoved,
    }
}

class ExampleAggregateRoot extends AggregateRootBehavior<ExampleStream> {
    private members: Map<string, Member> = new Map();

    public addMember(member: Member): void {
        if (!this.members.has(member.id)) {
            this.recordThat(ExampleTypes.MemberWasAdded, member);
        }
    }

    public removeMember(id: string): void {
        if (this.members.has(id)) {
            this.recordThat(ExampleTypes.MemberWasRemoved, {id});
        }
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

test("Trying to add a member that is already part of the group", async ({given, when, createMessage, expectNoEvents}) => {
    await given(createMessage(ExampleTypes.MemberWasAdded, frank));
    await when(async ({aggregateRoot}) => {
        aggregateRoot.addMember(frank);
    });
    expectNoEvents();
});

test("Adding a member", async ({when, then, createMessage}) => {
    await when(async ({aggregateRoot}) => {
        aggregateRoot.addMember(frank);
    });
    then(createMessage(ExampleTypes.MemberWasAdded, frank));
});

test("Adding multiple members", async ({when, then, createMessage}) => {
    await when(async ({aggregateRoot}) => {
        aggregateRoot.addMember(frank);
        aggregateRoot.addMember(renske);
    });
    then(
        createMessage(ExampleTypes.MemberWasAdded, frank),
        createMessage(ExampleTypes.MemberWasAdded, renske),
    );
});


test("Removing a member", async ({when, then, createMessage, given}) => {
    await given(createMessage(ExampleTypes.MemberWasAdded, frank));
    await when(async ({aggregateRoot}) => {
        aggregateRoot.removeMember(frank.id);
    });
    then(
        createMessage(ExampleTypes.MemberWasRemoved, {id: frank.id})
    );
});

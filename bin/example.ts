import { AggregateRootBehavior, EventHandler } from '@deltic/event-sourcing';
import { InMemoryMessageRepository } from '@deltic/event-sourcing';
import { AggregateRootRepository } from '@deltic/event-sourcing';
import { AnyMessageFrom } from '@deltic/messaging';

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


let messageRepository = new InMemoryMessageRepository<ExampleStream>();
let repository = new AggregateRootRepository(ExampleAggregateRoot, messageRepository);

(async () => {
    console.log('starting');
    let aggregateRoot = await repository.retrieve('abc');

    const frank: Member = {id: '1234', name: 'Frank', age: 32};
    const renske: Member = {id: '1235', name: 'Renske', age: 29};

    aggregateRoot.addMember(frank);
    aggregateRoot.addMember(renske);
    aggregateRoot.removeMember(frank.id);
    aggregateRoot.addMember(frank);
    await repository.persist(aggregateRoot);

    let aggregate = await repository.retrieve('abc');
    aggregate.removeMember(frank.id);
    aggregate.addMember(frank);
    console.log(aggregate.releaseEvents());
})();

import { AggregateRootBehavior, createHandlerLookupTable, EventHandler } from '../event-sourcing';

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
}

let aggregateRoot = new ExampleAggregateRoot('abcd');

const frank: Member = {id: '1234', name: 'Frank', age: 32};
const renske: Member = {id: '1235', name: 'Renske', age: 29};

aggregateRoot.addMember(frank);
aggregateRoot.addMember(renske);
aggregateRoot.removeMember(frank.id);
aggregateRoot.addMember(frank);
console.log(aggregateRoot.releaseEvents());

createHandlerLookupTable(aggregateRoot);

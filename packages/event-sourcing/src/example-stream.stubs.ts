import { AggregateRootBehavior, EventHandler } from './aggregate-root-behavior';
import { AnyMessageFrom } from '@deltic/messaging';

export enum ExampleTypes {
    MemberWasAdded = "member.was.added",
    MemberWasRemoved = "member.was.removed",
    InsignificantThing = "insignificant.thing",
}

export interface Member {
    readonly id: string,
    readonly name: string,
    readonly age: number,
}

export interface MemberWasAdded {
    readonly id: string,
    readonly name: string,
    readonly age: number,
}

export interface MemberWasRemoved {
    readonly id: string,
}

export type ExampleAggregateRootId = string;

export interface ExampleStream {
    topic: 'example'
    aggregateRootId: ExampleAggregateRootId,
    aggregateRoot: ExampleAggregateRoot,
    messages: {
        [ExampleTypes.MemberWasAdded]: MemberWasAdded,
        [ExampleTypes.MemberWasRemoved]: MemberWasRemoved,
        [ExampleTypes.InsignificantThing]: string,
    }
}

export class ExampleAggregateRoot extends AggregateRootBehavior<ExampleStream> {
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

    public recordInsignificantEvent(value: string): void {
        this.recordThat(ExampleTypes.InsignificantThing, value);
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

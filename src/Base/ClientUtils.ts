import { Util } from "../utils/Util";
import { Weeknd } from "./Weeknd";
import { UserResolvable, User, Guild, GuildMember, TextChannel, Message, CollectorFilter, MessageAdditions, MessageOptions, Collection, DMChannel, NewsChannel, MessageCollectorOptions } from "discord.js";

interface Prompt {
    message: string | MessageAdditions | (MessageOptions & { split: false });
    filter?: CollectorFilter<[Message]>;
    options?: MessageCollectorOptions;
    delete?: boolean;
    all?: boolean;
}

class ClientUtils {
    client: Weeknd;

    constructor(client: Weeknd) {
        this.client = client;

        Util.hideProp(this, "client");
    }

    resolveUser(query: UserResolvable | string, multi?: false): User;
    resolveUser(query: UserResolvable | string, multi?: true): User[];
    resolveUser(query: UserResolvable | string, multi = false): User | User[] | undefined {
        const couldResolve = this.client.users.resolve(query as any);
        if (couldResolve) return multi ? [couldResolve] : couldResolve;

        try {
            const name = (query as string).toLowerCase();
            const arr: User[] = [];

            for (const [_, user] of this.client.users.cache) {
                if (!(user.username.toLowerCase().indexOf(name) < 0)) arr.push(user);
                if (!multi && arr.length > 0) break;
            }

            return multi ? arr : arr[0];
        } catch {}
    }

    resolveMember(guild: Guild, query: UserResolvable | string, multi?: false): GuildMember;
    resolveMember(guild: Guild, query: UserResolvable | string, multi?: true): GuildMember[];
    resolveMember(guild: Guild, query: UserResolvable | string, multi = false): GuildMember | GuildMember[] | undefined {
        const couldResolve = guild.members.resolve(query as any);
        if (couldResolve) return multi ? [couldResolve] : couldResolve;

        try {
            const name = (query as string).toLowerCase();
            const arr: GuildMember[] = [];

            for (const [_, member] of guild.members.cache) {
                if (!(member.user.username.toLowerCase().indexOf(name) < 0) || !((member.nickname ?? "").toLowerCase().indexOf(name) < 0)) arr.push(member);
                if (!multi && arr.length > 0) break;
            }

            return multi ? arr : arr[0];
        } catch {}
    }

    prompt(channel: TextChannel | DMChannel | NewsChannel, options: Prompt & { all: true }): Promise<Collection<`${bigint}`, Message> | null>
    prompt(channel: TextChannel | DMChannel | NewsChannel, options: Prompt & { all: false }): Promise<Message | null>
    prompt(channel: TextChannel | DMChannel | NewsChannel, options: Prompt): Promise<(Message | null) | (Collection<`${bigint}`, Message> | null)> {
        return new Promise(async (resolve) => {
            if (!options.filter) options.filter = () => true;
            const msg = await channel.send(options.message);
            const collector = channel.createMessageCollector(options.filter, options.options);

            collector.on("end", (collected: Collection<`${bigint}`, Message>, reason: string) => {
                if (options.delete && msg.deletable) msg.delete();
                resolve(options.all ? collected : collected.first()!);
            });
        });
    }
}

export { ClientUtils };

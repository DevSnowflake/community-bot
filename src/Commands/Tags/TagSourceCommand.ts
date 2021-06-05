import { Message, Util } from "discord.js";
import { CommandDispatcher } from "../../Base/CommandDispatcher";
import { Weeknd } from "../../Base/Weeknd";

class TagSourceCommand extends CommandDispatcher {
    constructor(client: Weeknd) {
        super(client);

        this.configure({
            name: "tagsource",
            aliases: ["tagcontent", "sourcetag", "tsource"],
            description: "View a tag's source",
            private: false,
            permissions: [],
            cooldown: 5000
        });
    }

    async execute(message: Message, args: string[]) {
        let tagName = args.join(" ");

        if (!tagName) {
            const response = await this.client.utils.prompt(message.channel, {
                message: "✍ | Alright, enter your tag name!",
                options: {
                    max: 1,
                    time: 20000,
                    dispose: true
                },
                all: false,
                filter: m => m.author.id === message.author.id
            });

            if (!response || !response.content) return message.reply("❌ | Looks like we are not viewing a tag!");
            tagName = response.content;
        }

        tagName = tagName.toLowerCase();

        const tagdb = this.client.database.models.get("Tags")!;
        const tag = await tagdb.findOne({ guild: message.guild!.id, id: tagName });
        if (!tag) return message.reply("❌ | That tag is not available!");

        message.reply(this.sanitize(tag.content), { split: true });
    }

    sanitize(txt: string) {
        return Util.removeMentions(Util.escapeMarkdown(txt));
    }
}

export default TagSourceCommand;
const { readdirSync } = require("fs");
const { Collection } = require("discord.js");
const { useMainPlayer } = require("discord-player");

client.commands = new Collection();
const commandsArray = [];
const player = useMainPlayer();

const { Translate, GetTranslationModule } = require("./process_tools");

const discordEvents = readdirSync("./events/Discord/").filter((file) =>
  file.endsWith(".js")
);
const playerEvents = readdirSync("./events/Player/").filter((file) =>
  file.endsWith(".js")
);

GetTranslationModule().then(() => {
  console.log("| Translation Module Loaded |");

  // Load Discord events
  for (const file of discordEvents) {
    const eventName = file.split(".")[0];
    const DiscordEvent = require(`./events/Discord/${file}`);
    console.log(`Registering Discord Event: ${eventName}`);

    if (typeof DiscordEvent !== "function") {
      console.error(`Invalid Discord Event in file: ${file}`);
      continue; // Skip invalid events
    }

    client.on(eventName, DiscordEvent.bind(null, client));
    delete require.cache[require.resolve(`./events/Discord/${file}`)];
  }

  // Load Player events
  for (const file of playerEvents) {
    const eventName = file.split(".")[0];
    const PlayerEvent = require(`./events/Player/${file}`);
    console.log(`Registering Player Event: ${eventName}`);

    if (typeof PlayerEvent !== "function") {
      console.error(`Invalid Player Event in file: ${file}`);
      continue; // Skip invalid events
    }

    player.events.on(eventName, PlayerEvent.bind(null));
    delete require.cache[require.resolve(`./events/Player/${file}`)];
  }

  // Load Commands
  readdirSync("./commands/").forEach((dirs) => {
    const commands = readdirSync(`./commands/${dirs}`).filter((files) =>
      files.endsWith(".js")
    );

    for (const file of commands) {
      const command = require(`./commands/${dirs}/${file}`);
      if (command.name && command.description) {
        commandsArray.push(command);
        const txtEvent = `< -> > [Loaded Command] <${command.name.toLowerCase()}>`;
        parseLog(txtEvent);
        client.commands.set(command.name.toLowerCase(), command);
        delete require.cache[require.resolve(`./commands/${dirs}/${file}`)];
      } else {
        console.error(`Invalid Command in file: ${file}`);
        const txtEvent = `< -> > [Failed Command] <${file}>`;
        parseLog(txtEvent);
      }
    }
  });

  // Register commands globally or to a specific guild
  client.on("ready", (client) => {
    if (client.config.app.global) {
      client.application.commands.set(commandsArray);
    } else {
      const guild = client.guilds.cache.get(client.config.app.guild);
      if (!guild) {
        console.error("Specified guild not found!");
        return;
      }
      guild.commands.set(commandsArray);
    }
  });

  // Log Translation Events
  async function parseLog(txtEvent) {
    console.log(await Translate(txtEvent, null));
  }
});
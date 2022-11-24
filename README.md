# Ordis, the Warframe bot

This is a bot designed to help Warframe players keep track of stuff, like the items they're looking for. It is built using `discord.js`.

## Running the project

To start, it is important that you set up both the application in the [Discord application tab](https://discord.com/developers/applications) and your environment in a `.env.development` or `.env.production` file as described in `.env.example`, in the same directory. You will need to define a token and client ID, which you can find in the official Discord application for your bot. You'll may also need a guild ID for development mode.

Then, to run this project you will need Node (currently using version 18.x.x; different major versions may result in errors) and NPM to be installed. Then, you can install the project dependencies by running this in the terminal:

```sh
npm i
```

### Deploying commands

To have the commands deployed to your server (dev mode) or to all servers the bot is in (prod mode), you can run

```sh
npm run deploy-commands:dev
```

which will refresh the slash commands in your development guild (defined by `GUILD_ID`) or

```sh
npm run deploy-commands:prod
```

which will refresh the slash commands in every server the bot is in and might take some time (generally around
5 minutes).

### Running the bot

For running the bot you can run either:

```sh
npm run start:dev
```

or

```sh
npm run start:prod
```

Currently both of them run the same code, except for changing `NODE_ENV` to the chosen environment, in case
different behaviors are needed some time in the future.

That's it. Now you get to enjoy Ordis outside Warframe too!

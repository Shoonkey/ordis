# Ordis, the Warframe bot

This is a bot designed to help Warframe players keep track of stuff, like the items they're looking for. It is built using `discord.js`.

## Running the project

To start, it is important that you set up both the application in the [Discord application tab](https://discord.com/developers/applications) and your environment in a `.env` file as described in `.env.example`, in the same directory. You will need to define a token and a client ID, which you can find in the official Discord application for your bot. You may also need a guild ID for the development mode.

Then, to run this project you will need Node (currently using version 18.x.x; different major versions may result in errors) and NPM to be installed. Then, you can install the project dependencies by running this in the terminal:

```sh
npm i
```

### Deploying commands

To have the commands deployed to your server (dev mode) or to all servers the bot is in (prod mode), you can run

```sh
npm run deploy-commands:dev
```

or

```sh
npm run deploy-commands:prod
```

### Running the bot

For running the bot you can run either:

```sh
npm run start:dev
```

or

```sh
npm run start:prod
```

That's it. Now you get to enjoy Ordis outside Warframe too!

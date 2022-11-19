# Ordis, the Warframe bot

This is a bot designed to help Warframe players keep track of stuff, like the items they're looking for. It is built using `discord.js`.

## Running the project

To start, it is important that you set up both the application in the [Discord application tab](https://discord.com/developers/applications) and your environment in a `.env`  file as described in `.env.example`, in the same directory. You will need to define a token and a client ID, which you can find in the official Discord application for your bot.

Then, to run this project you will need Node (currently using version 18.x.x; different major versions may result in errors) and NPM to be installed. Then, you can install the project dependencies by running this in the terminal:

```sh
npm i
```

You can run either run the project in development mode typing the following in the terminal:

```sh
npm run start:dev
```

or running in production mode by typing

```sh
npm run start:prod
```

That's it. Now you get to enjoy Ordis outside Warframe too!
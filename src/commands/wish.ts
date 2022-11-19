import fs from 'fs/promises'
import path from 'path';

import createCommand from '../core/create-command';

const Wish = createCommand(
  builder => {
    builder
      .setName('wish')
      .setDescription("Modifies or list the user's wishlist.")
      .addUserOption(option =>
        option
          .setName('type')
          .setDescription('Item type')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('name')
          .setDescription('Item name')
          .setRequired(true)
      );
  },
  async (interaction) => {
    console.log(interaction);
  }
);

export default Wish;

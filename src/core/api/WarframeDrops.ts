import axios, { AxiosInstance } from "axios";

import Drop from "../models/Drop";
import APIError from "./APIError";

interface BaseReward {
  _id: string;
  chance: number;
  rarity: string;
}

interface ItemReward extends BaseReward {
  itemName: string;
}

interface ModReward extends BaseReward {
  modName: string;
}

interface BountyReward extends ItemReward {
  stage: string;
}

interface MissionRewardData {
  [planetName: string]: {
    [missionNodeName: string]: {
      gameMode: string;
      isEvent: boolean;
      rewards: {
        [rewardKey: string]: ItemReward;
      };
    };
  };
}

interface RelicRewardData {
  _id: string;
  tier: string;
  relicName: string;
  state: string;
  rewards: ItemReward[];
}

interface TransientRewardData {
  _id: string;
  objectiveName: string;
  rewards: ItemReward[];
}

interface ModLocationData {
  _id: string;
  modName: string;
  enemies: {
    _id: string;
    enemyName: string;
    enemyModDropChance: number;
    chance: number;
    rarity: string;
  }[];
}

interface EnemyModTableData {
  _id: string;
  enemyName: string;
  enemyModDropChance: string;
  mods: ModReward[];
}

interface BlueprintLocationData {
  _id: string;
  itemName: string;
  enemies: {
    _id: string;
    enemyName: string;
    enemyItemDropChance: number;
    chance: number;
    rarity: string;
  }[];
}

interface EnemyBlueprintTableData {
  _id: string;
  enemyName: string;
  enemyItemDropChance: string;
  items: ItemReward[];
}

interface BountyRewardData {
  _id: string;
  bountyLevel: string;
  rewards: {
    [rewardKey: string]: BountyReward[];
  };
}

interface KeyRewardData {
  _id: string;
  keyName: string;
  rewards: {
    [rewardKey: string]: ItemReward[];
  };
}

// An interface for data given by warframe-drop-data
interface AllDropData {
  blueprintLocations: BlueprintLocationData[];
  modLocations: ModLocationData[];

  enemyModTables: EnemyModTableData[];
  enemyBlueprintTables: EnemyBlueprintTableData[];

  missionRewards: MissionRewardData;
  keyRewards: KeyRewardData[];
  sortieRewards: ItemReward[];
  transientRewards: TransientRewardData[];

  cetusBountyRewards: BountyRewardData[];
  solarisBountyRewards: BountyRewardData[];
  deimosRewards: BountyRewardData[];

  relics: RelicRewardData[];
}

class WarframeDrops {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: "https://drops.warframestat.us",
    });
  }

  async getItemDropLocation(item: string) {
    try {
      const dropDataResponse = await this.axiosInstance.get("/data/all.json");
      const drops: Drop[] = [];

      const dropData = dropDataResponse.data as AllDropData;
      const lowercaseItem = item.toLowerCase();

      const looksLikeItem = (itemName: string) => {
        return itemName.toLowerCase().includes(lowercaseItem);
      };

      /* 
        Search for items through the retrieved data 
        - Not all keys from drop data are searched through as some are redundant
        (like `enemyModTables`, which are mod drops sorted by enemy, and `modLocations`,
        which are mod drops sorted by mod)
      */

      for (const item of dropData.blueprintLocations) {
        if (!looksLikeItem(item.itemName)) continue;

        for (const enemy of item.enemies)
          drops.push({
            acquirableThrough: "enemy",
            itemName: item.itemName,
            dropChance: enemy.enemyItemDropChance,
            description: enemy.enemyName,
          });
      }

      // Mod locations sorted by mod
      // TODO: As it is sorted by mod, we could implement binary search instead of linear search here
      for (const mod of dropData.modLocations) {
        if (!looksLikeItem(mod.modName)) continue;

        for (const enemy of mod.enemies) {
          drops.push({
            acquirableThrough: "enemy",
            itemName: mod.modName,
            dropChance: enemy.enemyModDropChance,
            description: enemy.enemyName,
          });
        }
      }

      for (const [planet, planetRewards] of Object.entries(
        dropData.missionRewards
      )) {
        for (const [missionNode, missionNodeData] of Object.entries(
          planetRewards
        )) {
          for (const reward of Object.values(missionNodeData.rewards)) {
            if (looksLikeItem(reward.itemName))
              drops.push({
                acquirableThrough: "planetNode",
                itemName: reward.itemName,
                dropChance: reward.chance,
                description: `${missionNode} (${planet})`,
              });
          }
        }
      }

      for (const reward of dropData.sortieRewards) {
        if (looksLikeItem(reward.itemName))
          drops.push({
            acquirableThrough: "sortie",
            itemName: reward.itemName,
            dropChance: reward.chance,
          });
      }

      for (const objective of dropData.transientRewards) {
        for (const reward of objective.rewards)
          if (looksLikeItem(reward.itemName))
            drops.push({
              acquirableThrough: "objective",
              itemName: reward.itemName,
              dropChance: reward.chance,
              description: objective.objectiveName,
            });
      }

      for (const bounty of dropData.cetusBountyRewards) {
        for (const rewards of Object.values(bounty.rewards))
          for (const reward of rewards)
            if (looksLikeItem(reward.itemName))
              drops.push({
                acquirableThrough: "bounty",
                itemName: reward.itemName,
                dropChance: reward.chance,
                description: `${bounty.bountyLevel} (Cetus)`,
              });
      }

      for (const bounty of dropData.solarisBountyRewards) {
        for (const rewards of Object.values(bounty.rewards))
          for (const reward of rewards)
            if (looksLikeItem(reward.itemName))
              drops.push({
                acquirableThrough: "bounty",
                itemName: reward.itemName,
                dropChance: reward.chance,
                description: `${bounty.bountyLevel} (Fortuna)`,
              });
      }

      for (const bounty of dropData.deimosRewards) {
        for (const rewards of Object.values(bounty.rewards))
          for (const reward of rewards)
            if (looksLikeItem(reward.itemName))
              drops.push({
                acquirableThrough: "bounty",
                itemName: reward.itemName,
                dropChance: reward.chance,
                description: `${bounty.bountyLevel} (Deimos)`,
              });
      }

      for (const relic of dropData.relics) {
        for (const reward of relic.rewards) {
          if (looksLikeItem(reward.itemName))
            drops.push({
              acquirableThrough: "relic",
              itemName: reward.itemName,
              dropChance: reward.chance,
              description: `${relic.tier} ${relic.relicName} (${relic.state})`,
            });
        }
      }

      return drops;
    } catch (e) {
      console.error("Unable to get item drop location. Error:", e);
      throw new APIError("I wasn't able to look through the drop data");
    }
  }
}

export default new WarframeDrops();

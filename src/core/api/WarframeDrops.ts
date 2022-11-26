import axios, { AxiosInstance } from "axios";

import DropAcquisitionType from "../models/DropAcquisitionType";
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
        [rewardKey: string]: ItemReward[] | ItemReward;
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

interface ResultData {
  [acquirableThrough: string]: {
    [rewardName: string]: {
      [dropChanceString: string]: {
        [dropNodeName: string]: string[];
      };
    }
  };
}

interface DropData {
  acquirableThrough: DropAcquisitionType;
  rewardName: string;
  dropChance: number;
  dropNodeName?: string;
  description?: string;
}

class WarframeDrops {
  private axiosInstance: AxiosInstance;
  private filters: DropAcquisitionType[] | null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: "https://drops.warframestat.us",
    });

    this.filters = null;
  }

  restrictTo(filters: DropAcquisitionType[] | null) {
    this.filters = filters;
    return this;
  }

  async getItemDropLocation(item: string) {
    try {
      const dropDataResponse = await this.axiosInstance.get("/data/all.json");
      const drops: ResultData = {};

      const addDropLocation = ({
        acquirableThrough,
        rewardName,
        dropChance,
        dropNodeName,
        description
      }: DropData) => {
        if (!drops[acquirableThrough])
          drops[acquirableThrough] = {};

        if (!drops[acquirableThrough][rewardName])
          drops[acquirableThrough][rewardName] = {};

        const dropChanceStr = dropChance.toString();

        if (!drops[acquirableThrough][rewardName][dropChanceStr]) 
          drops[acquirableThrough][rewardName][dropChanceStr] = {};
        
        if (!dropNodeName)
          dropNodeName = "Other";
        
        if (!drops[acquirableThrough][rewardName][dropChance][dropNodeName])
          drops[acquirableThrough][rewardName][dropChance][dropNodeName] = [];

        drops[acquirableThrough][rewardName][dropChanceStr][dropNodeName].push(description);
      };

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

      if (!this.filters || this.filters.includes("enemy")) {

        for (const item of dropData.blueprintLocations) {
          if (!looksLikeItem(item.itemName)) continue;
  
          for (const enemy of item.enemies)
            addDropLocation({
              acquirableThrough: "enemy",
              rewardName: item.itemName,
              dropChance: enemy.enemyItemDropChance,
              description: enemy.enemyName,
            });
        }
  
        // Mod locations sorted by mod
        // TODO: As it is sorted by mod, we could implement binary search instead of linear search here
        for (const mod of dropData.modLocations) {
          if (!looksLikeItem(mod.modName)) continue;
  
          for (const enemy of mod.enemies) {
            addDropLocation({
              acquirableThrough: "enemy",
              rewardName: mod.modName,
              dropChance: enemy.enemyModDropChance,
              description: enemy.enemyName,
            });
          }
        }

      }

      if (!this.filters || this.filters.includes("planetNode")) {

        for (const [planet, planetRewards] of Object.entries(
          dropData.missionRewards
        )) {
          for (const [missionNode, missionNodeData] of Object.entries(
            planetRewards
          )) {
            for (const rewards of Object.values(missionNodeData.rewards)) {
              let rewardArray: ItemReward[];
  
              // Rewards sometimes isn't array, it may come as a single item object
              if (!Array.isArray(rewards)) rewardArray = [rewards];
              else rewardArray = rewards;
  
              for (const reward of rewardArray) {
                if (looksLikeItem(reward.itemName)) {
                  addDropLocation({
                    acquirableThrough: "planetNode",
                    rewardName: reward.itemName,
                    dropChance: reward.chance,
                    dropNodeName: planet,
                    description: `${missionNode}`,
                  });
                }
              }
            }
          }
        }

      }

      if (!this.filters || this.filters.includes("sortie")) {
        for (const reward of dropData.sortieRewards) {
          if (looksLikeItem(reward.itemName))
            addDropLocation({
              acquirableThrough: "sortie",
              rewardName: reward.itemName,
              dropChance: reward.chance,
            });
        }
      }

      if (!this.filters || this.filters.includes("objective")) {
        for (const objective of dropData.transientRewards) {
          for (const reward of objective.rewards)
            if (looksLikeItem(reward.itemName))
              addDropLocation({
                acquirableThrough: "objective",
                rewardName: reward.itemName,
                dropChance: reward.chance,
                description: objective.objectiveName
              });
        }
      }

      if (!this.filters || this.filters.includes("bounty")) {

        for (const bounty of dropData.cetusBountyRewards) {
          for (const rewards of Object.values(bounty.rewards))
            for (const reward of rewards)
              if (looksLikeItem(reward.itemName))
                addDropLocation({
                  acquirableThrough: "bounty",
                  rewardName: reward.itemName,
                  dropChance: reward.chance,
                  dropNodeName: "Cetus",
                  description: `${bounty.bountyLevel}`
                });
        }
  
        for (const bounty of dropData.solarisBountyRewards) {
          for (const rewards of Object.values(bounty.rewards))
            for (const reward of rewards)
              if (looksLikeItem(reward.itemName))
                addDropLocation({
                  acquirableThrough: "bounty",
                  rewardName: reward.itemName,
                  dropChance: reward.chance,
                  dropNodeName: "Fortuna",
                  description: `${bounty.bountyLevel}`
                });
        }
  
        for (const bounty of dropData.deimosRewards) {
          for (const rewards of Object.values(bounty.rewards))
            for (const reward of rewards)
              if (looksLikeItem(reward.itemName))
                addDropLocation({
                  acquirableThrough: "bounty",
                  rewardName: reward.itemName,
                  dropChance: reward.chance,
                  dropNodeName: "Deimos",
                  description: `${bounty.bountyLevel}`
                });
        }

      }

      if (!this.filters || this.filters.includes("relic")) {
        for (const relic of dropData.relics) {
          for (const reward of relic.rewards) {
            if (looksLikeItem(reward.itemName))
              addDropLocation({
                acquirableThrough: "relic",
                rewardName: reward.itemName,
                dropChance: reward.chance,
                description: `${relic.tier} ${relic.relicName} (${relic.state})`
              });
          }
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

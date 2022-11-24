export default interface Drop {
  acquirableThrough:
    | "enemy"
    | "planetNode"
    | "sortie"
    | "objective"
    | "bounty"
    | "relic";
  itemName: string;
  dropChance: number;
  description?: string;
}
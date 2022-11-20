import axios, { AxiosInstance } from "axios";

import APIError from "./APIError";

class WarframeStatus {
  axiosInstance: AxiosInstance;
  platform: string | null;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: "https://api.warframestat.us",
    });
  }

  setPlatform(platform: string) {
    switch (platform) {
      case "pc":
      case "ps4":
      case "xb1":
      case "swi":
        this.platform = platform;
        return this;
      default:
        throw new APIError(`The platform \`${platform}\` doesn't exist.`);
    }
  }

  getWorldState(world: string) {
    switch (world) {
      case "cetus":
      case "cambion":
      case "earth":
        return this.axiosInstance.get(`/${this.platform}/${world}Cycle`);
      default:
        throw new APIError(`I don't have data about the world \`${world}\``);
    }
  }
}

export default new WarframeStatus();

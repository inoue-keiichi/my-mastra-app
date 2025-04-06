import { createLogger } from "@mastra/core/logger";
import { Mastra } from "@mastra/core/mastra";

import { weatherAgent } from "./agents";
import { restaurantAgent } from "./agents/restaurantAgent";

export const mastra = new Mastra({
  agents: { weatherAgent, restaurantAgent },
  logger: createLogger({
    name: "Mastra",
    level: "info",
  }),
});

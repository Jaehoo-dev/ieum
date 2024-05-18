import { SolapiMessageService } from "solapi";

export const solapiMessageService = new SolapiMessageService(
  process.env.SOLAPI_API_KEY!,
  process.env.SOLAPI_API_SECRET!,
);

import { prisma } from "../../lib/prisma";
import { ISettingsUpdate } from "./settings.interface";

const getSettings = async () => {
  // There should be only one settings record; get or create it
  let settings = await prisma.siteConfig.findFirst();

  if (!settings) {
    settings = await prisma.siteConfig.create({
      data: {},
    });
  }

  return settings;
};

const updateSettings = async (payload: ISettingsUpdate) => {
  let settings = await prisma.siteConfig.findFirst();

  if (!settings) {
    settings = await prisma.siteConfig.create({
      data: payload,
    });
  } else {
    settings = await prisma.siteConfig.update({
      where: { id: settings.id },
      data: payload,
    });
  }

  return settings;
};

export const SettingsService = {
  getSettings,
  updateSettings,
};

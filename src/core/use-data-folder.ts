import path from "path";
import { existsSync } from "fs";
import { writeFile, mkdir, readFile } from "fs/promises";

const dataFolderPath = path.join(__dirname, "../../data");

// Ensure data folder exists and wishlist file is in it
async function ensureDataFolderExists() {
  if (!existsSync(dataFolderPath)) await mkdir(dataFolderPath);
}

export async function getDataContent(filename: string): Promise<object | null> {
  try {
    await ensureDataFolderExists();

    const filePath = `${dataFolderPath}/${filename}.json`;

    if (!existsSync(filePath)) {
      await writeFile(filePath, "{}", "utf8");
      return {};
    }

    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (e) {
    throw new Error(
      "Error! I wasn't able to retrieve your data, Operator. DoEs tHat boThEr yOu?"
    );
  }
}

export async function setDataContent(filename: string, content: object) {
  try {
    await ensureDataFolderExists();

    const filePath = `${dataFolderPath}/${filename}.json`;

    if (!existsSync(filePath)) {
      await writeFile(filePath, "{}", "utf8");
      return {};
    }

    await writeFile(filePath, JSON.stringify(content), "utf8");
  } catch (e) {
    throw new Error(
      "Sorry, Operator! I couldn't register your request. What a shame."
    );
  }
}

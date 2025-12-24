import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "../data");

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error("Error creating data directory:", error);
  }
}

async function getFilePath(module) {
  await ensureDataDir();
  return path.join(DATA_DIR, `${module}.js`);
}

async function readModule(module) {
  try {
    const filePath = await getFilePath(module);
    const content = await fs.readFile(filePath, "utf-8");
    // Try parsing as JSON
    try {
      return JSON.parse(content);
    } catch {
      // Fallback for CommonJS format (backwards compatibility)
      const match = content.match(/module\.exports\s*=\s*({[\s\S]*});?$/);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch {
          return { items: [] };
        }
      }
    }
    return { items: [] };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { items: [] };
    }
    console.error(`Error reading module ${module}:`, error);
    return { items: [] };
  }
}

async function writeModule(module, data) {
  try {
    const filePath = await getFilePath(module);
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, "utf-8");
    return true;
  } catch (error) {
    console.error(`Error writing module ${module}:`, error);
    throw error;
  }
}

export const dataStore = {
  async getAll(module) {
    const data = await readModule(module);
    return data.items || [];
  },

  async getById(module, id) {
    const data = await readModule(module);
    const items = data.items || [];
    return items.find((item) => item.id === id) || null;
  },

  async create(module, payload) {
    const data = await readModule(module);
    const items = data.items || [];

    const newItem = {
      id: uuidv4(),
      ...payload,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    items.push(newItem);
    await writeModule(module, { items });
    return newItem;
  },

  async update(module, id, payload) {
    const data = await readModule(module);
    const items = data.items || [];

    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    items[index] = {
      ...items[index],
      ...payload,
      id: items[index].id, // Keep original id
      createdAt: items[index].createdAt, // Keep original createdAt
      updatedAt: new Date().toISOString(),
    };

    await writeModule(module, { items });
    return items[index];
  },

  async delete(module, id) {
    const data = await readModule(module);
    const items = data.items || [];

    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return null;

    const deleted = items[index];
    items.splice(index, 1);
    await writeModule(module, { items });
    return deleted;
  },

  async initializeModule(module) {
    const filePath = await getFilePath(module);
    try {
      await fs.access(filePath);
    } catch {
      await writeModule(module, { items: [] });
    }
  },
};

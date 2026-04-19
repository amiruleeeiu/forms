import fs from "fs";
import path from "path";

const configDir = path.join(process.cwd(), "src/form-configs");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _registry: Record<string, any> | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getFormRegistry(): Record<string, any> {
  if (_registry) return _registry;

  const files = fs.readdirSync(configDir).filter((f) => f.endsWith(".json"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const registry: Record<string, any> = {};

  for (const file of files) {
    const slug = path.basename(file, ".json");
    const raw = fs.readFileSync(path.join(configDir, file), "utf-8");
    registry[slug] = JSON.parse(raw);
  }

  _registry = registry;
  return registry;
}

/** Returns the slug for the given serviceName, or undefined if not found. */
export function getSlugForService(serviceName: string): string | undefined {
  const registry = getFormRegistry();
  return Object.entries(registry).find(
    ([, config]) => config.serviceName === serviceName,
  )?.[0];
}

const UNITS: Record<string, number> = {
  s: 1,
  m: 60,
  h: 3600,
  d: 86400,
};

export function parseDurationToSeconds(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value.trim());

  if (!match) {
    throw new Error(
      `Invalid duration "${value}". Use a form like 15m, 1h, 7d.`,
    );
  }

  return Number(match[1]) * UNITS[match[2]];
}

export function calculateLevel(xp: number) {
  return Math.max(
    1,
    Math.floor(Math.sqrt(xp / 50))
  );
}

export function getLevelStartXP(level: number) {
  return Math.pow(level, 2) * 50;
}

export function getNextLevelXP(level: number) {
  return Math.pow(level + 1, 2) * 50;
}

export function getXPProgress(xp: number) {
  const level = calculateLevel(xp);

  const currentLevelXP =
    getLevelStartXP(level);

  const nextLevelXP =
    getNextLevelXP(level);

  const range =
    nextLevelXP - currentLevelXP;

  const earned =
    Math.max(0, xp - currentLevelXP);

  const percentage =
    range > 0
      ? Math.min(
          100,
          Math.round(
            (earned / range) * 100
          )
        )
      : 0;

  return {
    level,
    currentLevelXP,
    nextLevelXP,
    xpToNextLevel: Math.max(
      0,
      nextLevelXP - xp
    ),
    percentage,
  };
}
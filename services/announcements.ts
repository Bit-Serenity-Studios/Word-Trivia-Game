export interface AnnouncementVocabulary {
  entrySolved: (ink: number) => string;
  sealedSpawn: () => string;
  rescueOffered: (inkCost: number) => string;
  rankUp: (rankTitle: string, ink: number) => string;
  volumeCompleted: (volumeTitle: string) => string;
  cabinetUnlocked: (artifactName: string) => string;
  curatorLetter: (curatorName: string) => string;
}

export const ANNOUNCEMENTS: AnnouncementVocabulary = {
  entrySolved: (ink) => `Entry solved. Plus ${ink} ink.`,
  sealedSpawn: () => 'A sealed volume. Triple reward if solved.',
  rescueOffered: (inkCost) =>
    `The archives will lend a letter. Watch a broadcast, or spend ${inkCost} ink.`,
  rankUp: (rankTitle, ink) => `Rank advanced. ${rankTitle}. Plus ${ink} ink.`,
  volumeCompleted: (volumeTitle) => `${volumeTitle} is catalogued.`,
  cabinetUnlocked: (artifactName) => `A new curiosity: ${artifactName}.`,
  curatorLetter: (curatorName) => `A letter from ${curatorName}.`,
};

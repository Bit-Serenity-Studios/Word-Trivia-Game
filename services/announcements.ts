import type { Messages } from '@/i18n';
import { messagesFor } from '@/i18n';

export interface AnnouncementVocabulary {
  entrySolved: (ink: number) => string;
  sealedSpawn: () => string;
  rescueOffered: (inkCost: number) => string;
  rankUp: (rankTitle: string, ink: number) => string;
  volumeCompleted: (volumeTitle: string) => string;
  cabinetUnlocked: (artifactName: string) => string;
  curatorLetter: (curatorName: string) => string;
}

export function makeAnnouncements(catalog: Messages['announcement']): AnnouncementVocabulary {
  return {
    entrySolved: (ink) => catalog.entrySolved(ink),
    sealedSpawn: () => catalog.sealedSpawn,
    rescueOffered: (inkCost) => catalog.rescueOffered(inkCost),
    rankUp: (rankTitle, ink) => catalog.rankUp(rankTitle, ink),
    volumeCompleted: (volumeTitle) => catalog.volumeCompleted(volumeTitle),
    cabinetUnlocked: (artifactName) => catalog.cabinetUnlocked(artifactName),
    curatorLetter: (curatorName) => catalog.curatorLetter(curatorName),
  };
}

// Historical vocabulary — kept for tests and for sites that still call it
// directly. Always resolves against the default locale so string output is
// stable regardless of the user's active locale; UI sites that want to
// localise should call `useAnnouncements()` (in hooks/) which threads the
// active catalog.
export const ANNOUNCEMENTS: AnnouncementVocabulary = makeAnnouncements(
  messagesFor('en').announcement,
);

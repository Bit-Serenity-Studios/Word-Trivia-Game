import { ANNOUNCEMENTS } from '../services/announcements';

describe('announcement vocabulary', () => {
  it('produces a non-empty string for every declared kind', () => {
    expect(ANNOUNCEMENTS.entrySolved(12).length).toBeGreaterThan(0);
    expect(ANNOUNCEMENTS.sealedSpawn().length).toBeGreaterThan(0);
    expect(ANNOUNCEMENTS.rescueOffered(25).length).toBeGreaterThan(0);
    expect(ANNOUNCEMENTS.rankUp('Junior Fellow', 50).length).toBeGreaterThan(0);
    expect(ANNOUNCEMENTS.volumeCompleted('The Firmament').length).toBeGreaterThan(0);
    expect(ANNOUNCEMENTS.cabinetUnlocked('Pressed Fern').length).toBeGreaterThan(0);
    expect(ANNOUNCEMENTS.curatorLetter('Beatrix Wren').length).toBeGreaterThan(0);
  });

  it('embeds the runtime values in the announced string', () => {
    expect(ANNOUNCEMENTS.entrySolved(22)).toContain('22');
    expect(ANNOUNCEMENTS.rescueOffered(25)).toContain('25');
    expect(ANNOUNCEMENTS.rankUp('Archivist', 150)).toContain('Archivist');
    expect(ANNOUNCEMENTS.rankUp('Archivist', 150)).toContain('150');
    expect(ANNOUNCEMENTS.volumeCompleted('The Firmament')).toContain('The Firmament');
    expect(ANNOUNCEMENTS.cabinetUnlocked('Pressed Fern')).toContain('Pressed Fern');
    expect(ANNOUNCEMENTS.curatorLetter('Ambrose Halloway')).toContain('Ambrose Halloway');
  });

  it('ends every announcement with a full stop for VoiceOver pacing', () => {
    expect(ANNOUNCEMENTS.entrySolved(1).trim().endsWith('.')).toBe(true);
    expect(ANNOUNCEMENTS.sealedSpawn().trim().endsWith('.')).toBe(true);
    expect(ANNOUNCEMENTS.rescueOffered(1).trim().endsWith('.')).toBe(true);
    expect(ANNOUNCEMENTS.rankUp('X', 1).trim().endsWith('.')).toBe(true);
    expect(ANNOUNCEMENTS.volumeCompleted('X').trim().endsWith('.')).toBe(true);
    expect(ANNOUNCEMENTS.cabinetUnlocked('X').trim().endsWith('.')).toBe(true);
    expect(ANNOUNCEMENTS.curatorLetter('X').trim().endsWith('.')).toBe(true);
  });
});

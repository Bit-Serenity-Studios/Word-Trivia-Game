export interface Messages {
  meta: {
    localeName: string;
    localeCode: string;
  };
  common: {
    continue: string;
    close: string;
    cancel: string;
    confirm: string;
    back: string;
    notNow: string;
    readLater: string;
    yes: string;
    no: string;
  };
  tabs: {
    play: string;
    nightly: string;
    cabinet: string;
    store: string;
    settings: string;
  };
  settings: {
    title: string;
    section: {
      accessibility: string;
      desk: string;
      language: string;
      patronage: string;
      wordOfMouth: string;
      about: string;
    };
    highContrast: string;
    largerText: string;
    reduceMotion: string;
    haptics: string;
    music: string;
    sfx: string;
    restorePurchases: string;
    restorePurchasesHint: string;
    restored: (count: number) => string;
    restoredNone: string;
    enrolledAsPatron: string;
    share: string;
    shareHint: string;
    shareMessage: string;
    aboutVersion: (version: string, runtime: string) => string;
    resetProgress: string;
    resetHint: string;
    resetConfirmTitle: string;
    resetConfirmBody: string;
  };
  onboarding: {
    stepLabel: (index: number, total: number) => string;
    continue: string;
    beginFirstEntry: string;
    firstEntryHeader: string;
    firstEntryHint: string;
    enterAthenaeum: string;
    inauguration: string;
  };
  play: {
    revealLetterInk: (cost: number) => string;
    revealLetterCredits: (count: number) => string;
    setAside: string;
    nextEntry: string;
    inkCatalogued: (ink: number) => string;
    doubleWatchBroadcast: string;
    doubledByPatron: string;
    theShelfBack: string;
    sealedPrefix: string;
    sealedVolume: string;
    sealedBonus: string;
    volumeProgress: (solved: number, total: number) => string;
  };
  ranks: {
    advancedHeader: string;
    continueReading: string;
    inkGained: (ink: number) => string;
  };
  rescue: {
    heading: string;
    body: string;
    decline: string;
    watch: string;
  };
  volume: {
    readerBookplate: string;
    theReadingList: string;
    nextRankLabel: (rankTitle: string) => string;
    nextRankMet: string;
    nextRankFinal: string;
    entriesShort: (solved: number, total: number) => string;
    catalogued: string;
    sealedReadLater: (threshold: number) => string;
    volumeNumber: (index: number) => string;
  };
  curator: {
    letterHeader: string;
    beginTheVolume: string;
  };
  completion: {
    header: string;
    returnToShelf: string;
    inkReward: (ink: number) => string;
  };
  nightly: {
    header: (dateKey: string) => string;
    beginTonight: string;
    reReadEntry: string;
    catalogued: string;
    shareResult: string;
    tonightCategory: (category: string) => string;
    streakLabel: string;
    bestLabel: string;
  };
  store: {
    title: string;
    balance: (ink: number, hints: number) => string;
    section: {
      archivist: string;
      patronage: string;
      hintBundles: string;
      inkVials: string;
    };
    archivistTitle: string;
    archivistClaimed: (dateKey: string) => string;
    archivistOffer: (ink: number) => string;
    archivistClaimedLabel: string;
    archivistAttendLabel: string;
    patronEnrolled: string;
    footer: string;
  };
  cabinet: {
    title: string;
    progress: (unlocked: number, total: number) => string;
    nextArtifact: (name: string, atEntries: number, toGo: number) => string;
    shelfComplete: string;
    emptyHeading: string;
    emptyBody: string;
    sealed: string;
    sealedAt: (entries: number) => string;
  };
  familiar: {
    lockedHeading: string;
    lockedBody: string;
    title: string;
    idleBody: string;
    returned: string;
    foragingReturns: string;
    sendForaging: string;
    collectHoard: string;
    callBack: string;
    hoardTier: (ink: number, tier: string) => string;
  };
  notification: {
    heading: string;
    body: string;
    sendWord: string;
  };
  announcement: {
    entrySolved: (ink: number) => string;
    sealedSpawn: string;
    rescueOffered: (inkCost: number) => string;
    rankUp: (rankTitle: string, ink: number) => string;
    volumeCompleted: (volumeTitle: string) => string;
    cabinetUnlocked: (artifactName: string) => string;
    curatorLetter: (curatorName: string) => string;
  };
  ads: {
    advertisement: string;
    simulated: string;
    patronRemoves: string;
    stubTitle: string;
    stubBody: string;
    stubDone: string;
    stubDoneBody: string;
  };
}

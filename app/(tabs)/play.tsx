import React, { useEffect } from 'react';
import { View } from 'react-native';
import { PlaySurface } from '@/components/PlaySurface';
import { Ledger } from '@/components/Ledger';
import { useGame } from '@/state/gameStore';
import { useLedger } from '@/state/ledgerStore';
import { HINT_COST } from '@/game/scoring';

export default function PlayScreen() {
  const round = useGame((s) => s.round);
  const phase = useGame((s) => s.phase);
  const lastReward = useGame((s) => s.lastReward);
  const wrongFlash = useGame((s) => s.wrongFlash);
  const startNext = useGame((s) => s.startNext);
  const place = useGame((s) => s.place);
  const returnFromSlot = useGame((s) => s.returnFromSlot);
  const revealHint = useGame((s) => s.revealHint);

  const ink = useLedger((s) => s.ink);
  const streak = useLedger((s) => s.streak);
  const entries = useLedger((s) => s.entries);
  const hydrated = useLedger((s) => s.hydrated);
  const breakStreak = useLedger((s) => s.breakStreak);

  useEffect(() => {
    if (hydrated && !round) startNext();
  }, [hydrated, round, startNext]);

  const canHint = phase === 'playing' && ink >= HINT_COST;

  return (
    <PlaySurface
      round={round}
      phase={phase}
      wrongFlash={wrongFlash}
      lastReward={lastReward}
      header={
        <View style={{ alignItems: 'center' }}>
          <Ledger ink={ink} streak={streak} entries={entries} />
        </View>
      }
      primaryActionLabel={`REVEAL LETTER  ·  ${HINT_COST} ink`}
      primaryActionEnabled={canHint}
      onPrimaryAction={() => revealHint()}
      secondaryActionLabel="SET ASIDE"
      secondaryActionEnabled={phase === 'playing'}
      onSecondaryAction={() => {
        breakStreak();
        startNext();
      }}
      onPlace={place}
      onReturn={returnFromSlot}
      resolveActionLabel="NEXT ENTRY →"
      onResolveAction={startNext}
    />
  );
}

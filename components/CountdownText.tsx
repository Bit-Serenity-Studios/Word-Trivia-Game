import React, { useEffect, useState } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import { formatRemaining } from '@/game/familiar';

interface Props {
  deadline: number;
  onReady?: () => void;
  style?: StyleProp<TextStyle>;
}

export function CountdownText({ deadline, onReady, style }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Date.now() >= deadline) {
      onReady?.();
      return;
    }
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [deadline, onReady]);

  useEffect(() => {
    if (now >= deadline) onReady?.();
  }, [now, deadline, onReady]);

  return <Text style={style}>{formatRemaining(deadline - now)}</Text>;
}

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import {
  NullTelemetry,
  createConsoleTelemetry,
  type Telemetry,
  type TelemetryEventName,
  type TelemetryProps,
} from '@/services/analytics';

const TelemetryCtx = createContext<Telemetry>(NullTelemetry);

export function useTelemetry(): Telemetry {
  return useContext(TelemetryCtx);
}

export function useTrackOnMount(name: TelemetryEventName, props?: TelemetryProps): void {
  const telemetry = useTelemetry();
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    telemetry.track(name, props);
  }, [telemetry, name, props]);
}

interface Props {
  children: React.ReactNode;
  telemetry?: Telemetry;
}

export function TelemetryProvider({ children, telemetry }: Props) {
  const impl = useMemo<Telemetry>(() => {
    if (telemetry) return telemetry;
    if (__DEV__) return createConsoleTelemetry();
    return NullTelemetry;
  }, [telemetry]);

  useEffect(() => {
    impl.track('session_start');
  }, [impl]);

  return <TelemetryCtx.Provider value={impl}>{children}</TelemetryCtx.Provider>;
}

import React, { createContext, useContext, useEffect, useMemo, useRef } from 'react';
import {
  NullTelemetry,
  type Telemetry,
  type TelemetryEventName,
  type TelemetryProps,
} from '@/services/analytics';
import {
  defaultTelemetryForDev,
  resolveTelemetry,
} from '@/services/providerFactories';
import { useTelemetryId } from '@/state/telemetryIdStore';

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
  const hydrated = useTelemetryId((s) => s.hydrated);
  const ensureId = useTelemetryId((s) => s.ensureId);

  useEffect(() => {
    if (hydrated) ensureId();
  }, [hydrated, ensureId]);

  const impl = useMemo<Telemetry>(() => {
    if (telemetry) return telemetry;
    return resolveTelemetry(defaultTelemetryForDev());
  }, [telemetry]);

  useEffect(() => {
    impl.track('session_start');
  }, [impl]);

  return <TelemetryCtx.Provider value={impl}>{children}</TelemetryCtx.Provider>;
}

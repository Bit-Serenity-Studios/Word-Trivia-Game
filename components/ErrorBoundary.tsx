import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { palette, fonts } from '@/theme/tokens';
import { messagesFor } from '@/i18n';
import { useLocale } from '@/state/localeStore';

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    if (typeof console !== 'undefined') {
      console.warn('[Athenaeum] error boundary caught:', error, info.componentStack);
    }
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  override render(): React.ReactNode {
    if (!this.state.error) return this.props.children;
    return <ErrorFallback error={this.state.error} onReload={this.reset} />;
  }
}

function ErrorFallback({ error, onReload }: { error: Error; onReload: () => void }) {
  // useLocale is safe here — if the store itself is broken, the try/catch
  // below falls back to the English default.
  let m;
  try {
    const locale = useLocale.getState().locale;
    m = messagesFor(locale).error;
  } catch {
    m = messagesFor('en').error;
  }

  return (
    <View style={{ flex: 1, backgroundColor: palette.ink }}>
      <SafeAreaView style={styles.safe}>
        <View
          style={[styles.card, { backgroundColor: palette.mahogany, borderColor: palette.gold }]}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={`${m.heading}. ${m.body}`}
        >
          <Text
            style={{
              color: palette.gold,
              fontFamily: fonts.displayItalic,
              fontSize: 12,
              letterSpacing: 2.4,
              textAlign: 'center',
            }}
          >
            {m.heading.toUpperCase()}
          </Text>
          <Text
            style={{
              color: palette.parchment,
              fontFamily: fonts.display,
              fontSize: 22,
              textAlign: 'center',
              marginTop: 16,
              paddingHorizontal: 12,
            }}
          >
            {m.heading}
          </Text>
          <Text
            style={{
              color: palette.parchmentDim,
              fontFamily: fonts.bodyItalic,
              fontSize: 14,
              textAlign: 'center',
              marginTop: 14,
              paddingHorizontal: 12,
              lineHeight: 21,
            }}
          >
            {m.body}
          </Text>

          <ScrollView
            style={[styles.detailWell, { borderColor: palette.sepia }]}
            contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 12 }}
          >
            <Text
              style={{
                color: palette.sepia,
                fontFamily: fonts.bodyItalic,
                fontSize: 10,
                letterSpacing: 1.8,
                marginBottom: 4,
              }}
            >
              {m.detailLabel}
            </Text>
            <Text
              style={{
                color: palette.parchmentDim,
                fontFamily: fonts.body,
                fontSize: 11,
                lineHeight: 16,
              }}
              selectable
            >
              {error.name}: {error.message}
            </Text>
          </ScrollView>

          <Pressable
            onPress={onReload}
            accessibilityRole="button"
            accessibilityLabel={m.reload}
            style={[
              styles.button,
              { borderColor: palette.gold, backgroundColor: 'rgba(201, 162, 39, 0.10)' },
            ]}
          >
            <Text
              style={{
                color: palette.gold,
                fontFamily: fonts.displayItalic,
                fontSize: 13,
                letterSpacing: 1.2,
              }}
            >
              {m.reload}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  card: {
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 26,
    paddingHorizontal: 22,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 300,
    maxWidth: 420,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 18,
    elevation: 12,
  },
  detailWell: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 3,
    maxHeight: 160,
    width: '100%',
  },
  button: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    borderWidth: 1,
  },
});

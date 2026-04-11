import { usePostHog } from 'posthog-react-native';
import { useEffect, useRef } from 'react';

// ── Event names ──────────────────────────────────────────────
export const EVENTS = {
  // Screen views
  SCREEN_VIEWED: 'screen_viewed',

  // Auth
  USER_SIGNED_IN: 'user_signed_in',
  USER_SIGN_IN_FAILED: 'user_sign_in_failed',
  USER_SIGNED_UP: 'user_signed_up',
  USER_SIGN_UP_FAILED: 'user_sign_up_failed',
  USER_SIGNED_OUT: 'user_signed_out',
  VERIFICATION_CODE_SENT: 'verification_code_sent',
  VERIFICATION_CODE_RESENT: 'verification_code_resent',
  VERIFICATION_SUBMITTED: 'verification_submitted',

  // Navigation
  TAB_SWITCHED: 'tab_switched',
  NAVIGATE_TO_SIGN_UP: 'navigate_to_sign_up',
  NAVIGATE_TO_SIGN_IN: 'navigate_to_sign_in',

  // Subscription interactions
  SUBSCRIPTION_CARD_EXPANDED: 'subscription_card_expanded',
  SUBSCRIPTION_CARD_COLLAPSED: 'subscription_card_collapsed',
  SUBSCRIPTION_DETAIL_VIEWED: 'subscription_detail_viewed',

  // Settings
  SIGN_OUT_CLICKED: 'sign_out_clicked',

  // General
  ADD_BUTTON_CLICKED: 'add_button_clicked',
} as const;

// ── Hook: auto-track screen views ───────────────────────────
export function useTrackScreen(screenName: string, properties?: Record<string, any>) {
  const posthog = usePostHog();
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      posthog.screen(screenName, properties);
      posthog.capture(EVENTS.SCREEN_VIEWED, {
        screen_name: screenName,
        ...properties,
      });
      tracked.current = true;
    }
  }, [screenName]);
}

// ── Helper: fire a one-off event ────────────────────────────
export function captureEvent(
  posthog: ReturnType<typeof usePostHog>,
  event: string,
  properties?: Record<string, any>,
) {
  posthog.capture(event, properties);
}

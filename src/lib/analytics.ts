import posthog from 'posthog-js';
import type { UserDemographics } from './types';

let initialized = false;

export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';

  if (!key) {
    console.warn('PostHog key not configured');
    return;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    session_recording: {
      recordCrossOriginIframes: true,
    },
    persistence: 'localStorage+cookie',
  });

  initialized = true;
}

function getDemographics(): Partial<UserDemographics> {
  if (typeof window === 'undefined') return {};
  try {
    const data = localStorage.getItem('funCity_user');
    if (data) {
      const parsed = JSON.parse(data);
      return {
        user_id: parsed.id,
        username: parsed.username,
        age_group: parsed.age_group,
        country: parsed.country,
        nyc_familiarity: parsed.nyc_familiarity,
      };
    }
  } catch {
    // ignore parse errors
  }
  return {};
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const demographics = getDemographics();
  const merged = {
    ...demographics,
    ...properties,
  };

  if (initialized) {
    posthog.capture(event, merged);
  }
}

export function identifyUser(userId: string, username: string, demographics: Omit<UserDemographics, 'user_id' | 'username'>) {
  if (typeof window === 'undefined') return;

  if (initialized) {
    posthog.identify(userId, {
      username,
      age_group: demographics.age_group,
      country: demographics.country,
      nyc_familiarity: demographics.nyc_familiarity,
    });
  }
}

export function resetIdentity() {
  if (typeof window === 'undefined') return;
  if (initialized) {
    posthog.reset();
  }
}

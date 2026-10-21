/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NotificationSettings {
  enabled: boolean;
  subscribedMatchIds: string[];
  subscribedTeamNames: string[];
}

const STORAGE_KEY = 'soccer_notification_settings';

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return {
    enabled: true,
    subscribedMatchIds: [],
    subscribedTeamNames: [],
  };
}

export function saveNotificationSettings(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {}
}

export function toggleMatchNotification(matchId: string): boolean {
  const current = getNotificationSettings();
  const exists = current.subscribedMatchIds.includes(matchId);
  const updatedIds = exists
    ? current.subscribedMatchIds.filter((id) => id !== matchId)
    : [...current.subscribedMatchIds, matchId];

  saveNotificationSettings({
    ...current,
    subscribedMatchIds: updatedIds,
  });

  return !exists;
}

export function isMatchNotificationEnabled(
  matchId: string,
  homeTeamName: string,
  awayTeamName: string,
  settings: NotificationSettings
): boolean {
  if (settings.subscribedMatchIds.includes(matchId)) {
    return true;
  }
  const normHome = homeTeamName.toLowerCase();
  const normAway = awayTeamName.toLowerCase();
  return settings.subscribedTeamNames.some((t) => {
    const norm = t.toLowerCase();
    return normHome.includes(norm) || normAway.includes(norm);
  });
}

/**
 * Triggers native browser push notification if permitted
 */
export async function sendBrowserNotification(
  title: string,
  body: string,
  icon?: string
): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
      });
    } catch {
      // In some sandboxes Notification constructor is restricted
    }
  } else if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, {
          body,
          icon: icon || '/favicon.ico',
        });
      }
    } catch {}
  }
}

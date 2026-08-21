import type { SchedulerProvider } from '../providers/types.js';

/**
 * Pilot scheduled jobs (Part 5 §12) — in-process via SchedulerProvider.
 * Cron times are UK-local where applicable.
 */
export function registerJobs(scheduler: SchedulerProvider): void {
  // Streak reset — 23:30 Europe/London daily
  scheduler.schedule('streak-reset', '30 23 * * *', 'Europe/London', async () => {
    // TODO: evaluate who checked in today; break streaks
  });

  // Weekly league reset — Friday
  scheduler.schedule('league-weekly-reset', '5 0 * * 5', 'Europe/London', async () => {
    // TODO: rank, archive, promote/relegate
  });

  // Prayer reminder fan-out
  scheduler.schedule('prayer-reminders', '*/5 * * * *', 'Europe/London', async () => {
    // TODO: compose FCM payloads for upcoming windows
  });

  // GDPR deletion cooling-off completion
  scheduler.schedule('account-deletion', '0 3 * * *', 'Europe/London', async () => {
    // TODO: scrub PII for deletion_scheduled_at <= now
  });

  // GPS audit purge — 6 months (Part 8 / Architecture §6.6)
  scheduler.schedule('gps-audit-purge', '15 3 1 * *', 'Europe/London', async () => {
    // TODO: null out GPS fields older than 6 months
  });

  // Quest Friday refresh
  scheduler.schedule('quest-friday-refresh', '0 0 * * 5', 'Europe/London', async () => {
    // TODO: expire / activate weekly quests
  });
}

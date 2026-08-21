import type { SchedulerProvider } from '../types.js';

/** In-process cron scheduler for pilot (BullMQ deferred until scale). */
export class InProcessSchedulerProvider implements SchedulerProvider {
  schedule(
    _name: string,
    _cronExpression: string,
    _timezone: string,
    _handler: () => Promise<void>,
  ): void {
    // TODO: node-cron registration
  }

  start(): void {
    // TODO: start registered jobs
  }

  stop(): void {
    // TODO: stop jobs on shutdown
  }
}

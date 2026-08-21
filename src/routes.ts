import { Router } from 'express';
import { authRouter } from './modules/auth/auth.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { masajidRouter } from './modules/masajid/masajid.routes.js';
import { checkinsRouter } from './modules/checkins/checkins.routes.js';
import { streaksRouter } from './modules/streaks/streaks.routes.js';
import { leaguesRouter } from './modules/leagues/leagues.routes.js';
import { badgesRouter } from './modules/badges/badges.routes.js';
import { questsRouter } from './modules/quests/quests.routes.js';
import { rewardsRouter } from './modules/rewards/rewards.routes.js';
import { redemptionsRouter } from './modules/redemptions/redemptions.routes.js';
import { friendsRouter } from './modules/friends/friends.routes.js';
import { referralsRouter } from './modules/referrals/referrals.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { parentalConsentRouter } from './modules/parental-consent/parentalConsent.routes.js';
import { adminRouter } from './modules/admin/admin.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { requireAuth, requireActiveAccount, requireAdmin } from './middleware/auth.js';
import { masjidScope } from './middleware/masjidScope.js';

export function buildV1Router(): Router {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/auth', authRouter);

  router.use(requireAuth, requireActiveAccount);

  router.use('/users', usersRouter);
  router.use('/masajid', masajidRouter);
  router.use('/checkins', checkinsRouter);
  router.use('/streaks', streaksRouter);
  router.use('/leagues', leaguesRouter);
  router.use('/badges', badgesRouter);
  router.use('/quests', questsRouter);
  router.use('/rewards', rewardsRouter);
  router.use('/redemptions', redemptionsRouter);
  router.use('/friends', friendsRouter);
  router.use('/referrals', referralsRouter);
  router.use('/notifications', notificationsRouter);
  router.use('/parental-consent', parentalConsentRouter);

  router.use('/admin', requireAdmin, masjidScope, adminRouter);

  return router;
}

// ⚠️ AUTO-GENERATED FILE - DO NOT EDIT.

import { ApiKeyRepoFactory } from "../api-key/api-key.repo-factory.js";
import { ApiKeyService } from "../api-key/api-key.service.js";
import { ApiKeyTrpcProcedure } from "../api-key/api-key.trpc-procedure.js";
import { AppTrpcRouter } from "../app/app.trpc-router.js";
import { AuthController } from "../auth/auth.controller.js";
import { AuthService } from "../auth/auth.service.js";
import { JwtService } from "../auth/jwt.service.js";
import { ConfigService } from "../config/config.service.js";
import { DbService } from "../db/db.service.js";
import { GoogleAuthService } from "../google-auth/google-auth.service.js";
import { HealthController } from "../health/health.controller.js";
import { RefreshTokenCookieHelper } from "../refresh-token/refresh-token-cookie.helper.js";
import { RefreshTokenRepoFactory } from "../refresh-token/refresh-token.repo-factory.js";
import { TrpcService } from "../trpc/trpc.service.js";
import { UserRepoFactory } from "../user/user.repo-factory.js";

export const SCANNED_CONTROLLERS = [
  AuthController,
  HealthController,
];

export const SCANNED_INJECTABLES = [
  ApiKeyRepoFactory,
  ApiKeyService,
  ApiKeyTrpcProcedure,
  AppTrpcRouter,
  AuthService,
  ConfigService,
  DbService,
  GoogleAuthService,
  JwtService,
  RefreshTokenCookieHelper,
  RefreshTokenRepoFactory,
  TrpcService,
  UserRepoFactory,
];
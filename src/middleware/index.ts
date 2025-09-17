import { sequence } from 'astro:middleware';
import { cacheMiddleware } from './cache';
import { securityMiddleware } from './security';

export const onRequest = sequence(
  securityMiddleware,
  cacheMiddleware
);
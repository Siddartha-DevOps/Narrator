import { Injectable, UnprocessableEntityException } from '@nestjs/common';

/**
 * Minimal compliance safeguard for MVP: blocks obviously disallowed content
 * before a script is queued for rendering. This is a placeholder — swap in
 * a proper moderation API (e.g. a hosted text-classification endpoint) before
 * public launch. Kept as its own service so the check has one call site.
 */
const BLOCKED_PATTERNS: RegExp[] = [
  /\b(kill|murder)\s+(myself|yourself)\b/i,
  /\bchild\s+(sexual|explicit)\b/i,
  /\bimpersonat(e|ing)\s+(a\s+)?(police|government|official)\b/i,
];

const DISCLOSURE_NOTICE =
  'This video was generated using AI avatar technology.';

@Injectable()
export class ModerationService {
  assertScriptAllowed(script: string): void {
    for (const pattern of BLOCKED_PATTERNS) {
      if (pattern.test(script)) {
        throw new UnprocessableEntityException(
          'This script violates our content policy and cannot be rendered.',
        );
      }
    }
  }

  /** AI-generated-content disclosure required by most platform policies. */
  getDisclosureNotice(): string {
    return DISCLOSURE_NOTICE;
  }
}

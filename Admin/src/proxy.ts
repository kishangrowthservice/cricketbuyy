import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  // Coarse check only (per ADMIN_SPEC.md §4.2 / §10: Auth must never live in proxy alone)
  response.headers.set('X-Admin-Frame-Guard', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');

  return response;
}


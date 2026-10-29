import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    system: 'cricketbuyy-admin',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    concurrency_engine: 'optimistic_versioning_enabled',
    audit_chain: 'active'
  });
}

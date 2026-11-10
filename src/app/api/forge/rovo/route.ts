import { NextRequest, NextResponse } from 'next/server';
import { executeRovoClinicalAction } from '@/lib/caregraph-engine';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const actionKey = body.actionKey || 'audit-clinical-sla-and-news2';
  const issueKey = body.issueKey || 'HOSP-401';

  const result = executeRovoClinicalAction(actionKey, issueKey);
  return NextResponse.json({
    ok: true,
    agentKey: 'docarion-clinical-triage-agent',
    forgeModule: 'rovo:agent + action',
    result,
  });
}

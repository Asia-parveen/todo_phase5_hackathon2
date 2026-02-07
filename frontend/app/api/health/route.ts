import { NextResponse } from 'next/server';

/**
 * Health check endpoint for Kubernetes liveness and readiness probes.
 * Returns HTTP 200 with status "healthy" when the frontend is running.
 */
export async function GET() {
  return NextResponse.json(
    { status: 'healthy', service: 'frontend' },
    { status: 200 }
  );
}

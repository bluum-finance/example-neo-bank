import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

const ALLOWED_ROOTS = new Set([
  'investors',
  'assets',
  'documents',
  'banks',
  'markets',
  'market-data',
  'webhooks',
]);

type RouteCtx = { params: Promise<{ path?: string[] }> };

function searchParamsToRecord(searchParams: URLSearchParams): Record<string, string> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

async function proxy(request: NextRequest, context: RouteCtx) {
  const { path: segments } = await context.params;
  if (!segments?.length) {
    return NextResponse.json({ error: 'Path required' }, { status: 400 });
  }

  const root = segments[0];
  if (!ALLOWED_ROOTS.has(root)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const backendPath = `/${segments.join('/')}`;
  const method = request.method as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

  let data: unknown = undefined;
  if (method === 'POST' || method === 'PUT' || method === 'PATCH') {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      try {
        const text = await request.text();
        if (text) data = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    }
  }

  const idempotencyKey = request.headers.get('Idempotency-Key') ?? undefined;
  const query = searchParamsToRecord(request.nextUrl.searchParams);

  const { status, data: body } = await bluumApi.forward({
    method,
    url: backendPath,
    params: Object.keys(query).length ? query : undefined,
    data,
    headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
  });

  if (status === 204 || status === 205) {
    return new NextResponse(null, { status });
  }

  return NextResponse.json(body, { status });
}

export async function GET(request: NextRequest, context: RouteCtx) {
  return proxy(request, context);
}

export async function POST(request: NextRequest, context: RouteCtx) {
  return proxy(request, context);
}

export async function PUT(request: NextRequest, context: RouteCtx) {
  return proxy(request, context);
}

export async function PATCH(request: NextRequest, context: RouteCtx) {
  return proxy(request, context);
}

export async function DELETE(request: NextRequest, context: RouteCtx) {
  return proxy(request, context);
}

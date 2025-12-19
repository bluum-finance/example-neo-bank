import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get('q');
    const status = searchParams.get('status');
    const asset_class = searchParams.get('asset_class');
    const limit = searchParams.get('limit');

    const assets = await bluumApi.searchAssets({
      q: q || undefined,
      status: status as 'active' | 'inactive' | undefined,
      asset_class: asset_class as 'us_equity' | 'crypto' | 'us_option' | undefined,
      limit: limit ? parseInt(limit) : undefined,
    });
    return NextResponse.json(assets);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}


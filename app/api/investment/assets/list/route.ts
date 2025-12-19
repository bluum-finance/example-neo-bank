import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/services/bluum-api';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const asset_class = searchParams.get('asset_class');
    const tradable = searchParams.get('tradable');

    const assets = await bluumApi.listAssets({
      status: status as 'active' | 'inactive' | undefined,
      asset_class: asset_class as 'us_equity' | 'crypto' | 'us_option' | undefined,
      tradable: tradable === 'true' ? true : tradable === 'false' ? false : undefined,
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


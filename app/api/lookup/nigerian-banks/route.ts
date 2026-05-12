import { NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function GET() {
  try {
    try {
      const response = await bluumApi.getBanksByCountry('NG');
      return NextResponse.json(response, { status: 200 });
    } catch {
      const response = await bluumApi.getNigerianBanks();
      return NextResponse.json(response, { status: 200 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data || error.message },
      { status: error.response?.status || 500 }
    );
  }
}

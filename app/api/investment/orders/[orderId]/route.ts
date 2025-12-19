import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/services/bluum-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await bluumApi.getOrder(orderId);
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}


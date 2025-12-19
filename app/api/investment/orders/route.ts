import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/services/bluum-api';
import type { OrderRequest } from '@/types/bluum';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accountId = body.account_id;
    
    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const orderData: OrderRequest = body;
    const order = await bluumApi.placeOrder(accountId, orderData);
    return NextResponse.json(order, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accountId = searchParams.get('account_id');
    
    if (!accountId) {
      return NextResponse.json({ error: 'account_id is required' }, { status: 400 });
    }

    const status = searchParams.get('status');
    const symbol = searchParams.get('symbol');
    const side = searchParams.get('side');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const orders = await bluumApi.listOrders(accountId, {
      status: status as any,
      symbol: symbol || undefined,
      side: side as 'buy' | 'sell' | undefined,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}


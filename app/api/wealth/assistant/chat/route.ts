import { NextRequest, NextResponse } from 'next/server';
import { bluumApi } from '@/lib/bluum-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { account_id, message, context } = body;

    if (!account_id) {
      return NextResponse.json(
        {
          error: 'account_id is required',
        },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        {
          error: 'message is required',
        },
        { status: 400 }
      );
    }

    const response = await bluumApi.chatWithAssistant(account_id, {
      message,
      context: context || {},
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('AI chat error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to get AI chat response',
      },
      { status: 500 }
    );
  }
}

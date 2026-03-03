import { NextResponse } from 'next/server';

// Cache exchange rates for 1 hour (3600 seconds)
const CACHE_DURATION = 3600;
let cachedRates: { rates: Record<string, number>; timestamp: number } | null = null;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const base = searchParams.get('base') || 'USD';

    // Check cache
    if (cachedRates && Date.now() - cachedRates.timestamp < CACHE_DURATION * 1000) {
      return NextResponse.json({
        base,
        rates: cachedRates.rates,
        cached: true,
      });
    }

    // Fetch from exchangerate-api.com (free, no API key needed)
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`, {
      next: { revalidate: 3600 }, // Next.js cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Cache the rates
    cachedRates = {
      rates: data.rates,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      base: data.base,
      rates: data.rates,
      cached: false,
    });
  } catch (error: any) {
    console.error('Failed to fetch exchange rates:', error);
    
    // Return fallback rates if API fails
    return NextResponse.json(
      {
        base: 'USD',
        rates: {
          USD: 1,
          NGN: 1450, // Fallback rate
          GBP: 0.79,
          EUR: 0.92,
        },
        error: error.message,
        fallback: true,
      },
      { status: 200 } // Return 200 so frontend can still use fallback
    );
  }
}

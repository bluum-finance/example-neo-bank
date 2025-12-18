import { Router, Request, Response } from 'express';
import { bluumApi } from '../services/bluum-api';
import type { NewAccountRequest, OrderRequest, FundRequest } from '../types/bluum';

const router = Router();

const getAccountId = (req: Request): string | null => {
  return (req.query.account_id as string) || (req.body.account_id as string) || null;
};

// Account Routes
router.post('/accounts', async (req: Request, res: Response) => {
  try {
    const accountData: NewAccountRequest = req.body;
    const account = await bluumApi.createAccount(accountData);
    res.status(201).json(account);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

router.get('/accounts', async (req: Request, res: Response) => {
  try {
    const accounts = await bluumApi.listAccounts();
    res.json(accounts);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

router.get('/accounts/:accountId', async (req: Request, res: Response) => {
  try {
    const { accountId } = req.params;
    const account = await bluumApi.getAccount(accountId);
    res.json(account);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Asset Routes
router.get('/assets/search', async (req: Request, res: Response) => {
  try {
    const { q, status, asset_class, limit } = req.query;
    const assets = await bluumApi.searchAssets({
      q: q as string,
      status: status as 'active' | 'inactive',
      asset_class: asset_class as 'us_equity' | 'crypto' | 'us_option',
      limit: limit ? parseInt(limit as string) : undefined,
    });
    res.json(assets);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

router.get('/assets/list', async (req: Request, res: Response) => {
  try {
    const { status, asset_class, tradable } = req.query;
    const assets = await bluumApi.listAssets({
      status: status as 'active' | 'inactive',
      asset_class: asset_class as 'us_equity' | 'crypto' | 'us_option',
      tradable: tradable === 'true' ? true : tradable === 'false' ? false : undefined,
    });
    res.json(assets);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

router.get('/assets/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const asset = await bluumApi.getAssetBySymbol(symbol);
    res.json(asset);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

router.get('/assets/:symbol/chart', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { timeframe, start, end, limit, adjustment, feed } = req.query;

    if (!timeframe) {
      return res.status(400).json({ error: 'timeframe is required' });
    }

    const chartData = await bluumApi.getChartData({
      symbol,
      timeframe: timeframe as any,
      start: start as string,
      end: end as string,
      limit: limit ? parseInt(limit as string) : undefined,
      adjustment: adjustment as any,
      feed: feed as any,
    });
    res.json(chartData);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Position Routes (for getting holdings)
router.get('/positions', async (req: Request, res: Response) => {
  try {
    const accountId = getAccountId(req);
    if (!accountId) {
      return res.status(400).json({ error: 'account_id is required' });
    }

    const { symbol, non_zero_only } = req.query;
    const positions = await bluumApi.listPositions(accountId, {
      symbol: symbol as string,
      non_zero_only: non_zero_only === 'true',
    });

    // Transform positions to match frontend Stock interface
    const holdings = Array.isArray(positions)
      ? positions.map((pos: any) => ({
          symbol: pos.symbol,
          name: pos.symbol, // You might want to fetch asset name separately
          shares: parseFloat(pos.quantity),
          currentPrice: parseFloat(pos.current_price),
          purchasePrice: parseFloat(pos.average_cost_basis),
          value: parseFloat(pos.market_value),
          gain: parseFloat(pos.unrealized_pl),
          gainPercent: parseFloat(pos.unrealized_pl_percent),
        }))
      : [];

    res.json(holdings);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Trading Routes
router.post('/orders', async (req: Request, res: Response) => {
  try {
    const accountId = getAccountId(req);
    if (!accountId) {
      return res.status(400).json({ error: 'account_id is required' });
    }

    const orderData: OrderRequest = req.body;
    const order = await bluumApi.placeOrder(accountId, orderData);
    res.status(201).json(order);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

router.get('/orders', async (req: Request, res: Response) => {
  try {
    const accountId = getAccountId(req);
    if (!accountId) {
      return res.status(400).json({ error: 'account_id is required' });
    }

    const { status, symbol, side, limit, offset } = req.query;
    const orders = await bluumApi.listOrders(accountId, {
      status: status as any,
      symbol: symbol as string,
      side: side as 'buy' | 'sell',
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(orders);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

router.get('/orders/:orderId', async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await bluumApi.getOrder(orderId);
    res.json(order);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

// Wallet Routes
router.post('/funding', async (req: Request, res: Response) => {
  try {
    const accountId = getAccountId(req);
    if (!accountId) {
      return res.status(400).json({ error: 'account_id is required' });
    }

    const fundData: FundRequest = req.body;
    const transaction = await bluumApi.fundAccount(accountId, fundData);
    res.status(202).json(transaction);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

router.get('/transactions', async (req: Request, res: Response) => {
  try {
    const accountId = getAccountId(req);
    if (!accountId) {
      return res.status(400).json({ error: 'account_id is required' });
    }

    const { type, status, funding_type, date_from, date_to, limit, offset } = req.query;

    const transactions = await bluumApi.listTransactions(accountId, {
      type: type as any,
      status: status as any,
      funding_type: funding_type as any,
      date_from: date_from as string,
      date_to: date_to as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });
    res.json(transactions);
  } catch (error: any) {
    res.status(error.response?.status || 500).json({
      error: error.response?.data || error.message,
    });
  }
});

export default router;

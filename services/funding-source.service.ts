import { apiClient } from '@/lib/api-client';
import {
  extractConnectFundingSourceRows,
  extractFundingSourceRows,
  toFundingSource,
} from '@/lib/funding-source-normalize';
import type { FundingSource, NigerianBank } from '@/lib/bluum-api.types';

export type { FundingSource, NigerianBank };

export interface PlaidLinkTokenResponse {
  status: string;
  data: {
    link_token: string;
    hosted_link_url: string | null;
  };
}

export interface ConnectManualRequest {
  bank_name: string;
  account_holder_name: string;
  account_number: string;
  bank_account_type?: 'CHECKING' | 'SAVINGS';
  routing_number?: string;
  swift_code?: string;
  beneficiary_address?: string;
  currency?: string;
  country?: string;
  bank_code?: string;
  metadata?: Record<string, unknown>;
}

export interface NigerianBanksResponse {
  status: string;
  data: {
    banks: NigerianBank[];
  };
}

export class FundingSourceService {
  static async getLinkToken(accountId: string): Promise<string> {
    const response = await apiClient.post<PlaidLinkTokenResponse>(
      `/api/bluum/investors/${encodeURIComponent(accountId)}/funding-sources/plaid/link-token`,
      {}
    );
    return response.data.data.link_token;
  }

  static async connectAccount(accountId: string, publicToken: string): Promise<FundingSource[]> {
    const response = await apiClient.post<unknown>(`/api/bluum/investors/${encodeURIComponent(accountId)}/funding-sources/connect`, {
      type: 'plaid',
      public_token: publicToken,
    });
    const rows = extractConnectFundingSourceRows(response.data);
    return rows.map((row) => toFundingSource(row));
  }

  static async connectManualAccount(accountId: string, data: ConnectManualRequest): Promise<FundingSource> {
    const routingNumber = data.routing_number?.trim() || undefined;
    const payload = {
      type: 'manual' as const,
      ...data,
      routing_number: routingNumber,
    };
    const response = await apiClient.post<unknown>(`/api/bluum/investors/${encodeURIComponent(accountId)}/funding-sources/connect`, payload);
    const rows = extractConnectFundingSourceRows(response.data);
    const list = rows.map((row) => toFundingSource(row));
    const first = list[0];
    if (!first) {
      throw new Error('No funding source returned from connect');
    }
    return first;
  }

  static async getFundingSources(accountId: string, type: 'plaid' | 'manual' | 'all' = 'all'): Promise<FundingSource[]> {
    const response = await apiClient.get<unknown>(`/api/bluum/investors/${encodeURIComponent(accountId)}/funding-sources`, {
      params: { type },
    });
    const rows = extractFundingSourceRows(response.data);
    return rows.map((row) => toFundingSource(row));
  }

  static async disconnectFundingSource(accountId: string, fundingSourceId: string, type: 'plaid' | 'manual' = 'plaid') {
    const response = await apiClient.delete(`/api/bluum/investors/${encodeURIComponent(accountId)}/funding-sources/${encodeURIComponent(fundingSourceId)}`, {
      params: { type },
    });
    return response.data;
  }

  static async getNigerianBanks(): Promise<NigerianBank[]> {
    const response = await apiClient.get<NigerianBanksResponse>('/api/bluum/banks', {
      params: { country: 'NG' },
    });
    return response.data.data.banks ?? [];
  }
}

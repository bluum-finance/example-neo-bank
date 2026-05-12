import { apiClient } from '@/lib/api-client';
import type { FundingSource, NigerianBank } from '@/lib/bluum-api.types';

export type { FundingSource, NigerianBank };

export interface PlaidLinkTokenResponse {
  status: string;
  data: {
    link_token: string;
    hosted_link_url: string | null;
  };
}

export interface FundingSourcesResponse {
  fundingSources: FundingSource[];
}

export interface ConnectPlaidResponse {
  status: string;
  message: string;
  data: {
    fundingSources: FundingSource[];
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
      '/api/investment/funding-sources/plaid/link-token',
      { account_id: accountId }
    );
    return response.data.data.link_token;
  }

  static async connectAccount(accountId: string, publicToken: string): Promise<FundingSource[]> {
    const response = await apiClient.post<ConnectPlaidResponse>(
      '/api/investment/funding-sources/connect',
      { account_id: accountId, type: 'plaid', public_token: publicToken }
    );
    return response.data.data.fundingSources;
  }

  static async connectManualAccount(accountId: string, data: ConnectManualRequest): Promise<FundingSource> {
    // Filter out empty routing_number to avoid validation errors
    const routingNumber = data.routing_number?.trim() || undefined;
    const payload = { 
      account_id: accountId, 
      type: 'manual', 
      ...data,
      routing_number: routingNumber 
    };
    const response = await apiClient.post<ConnectPlaidResponse>(
      '/api/investment/funding-sources/connect',
      payload
    );
    const list = response.data.data.fundingSources;
    const first = list?.[0];
    if (!first) {
      throw new Error('No funding source returned from connect');
    }
    return first;
  }

  static async getFundingSources(accountId: string, type: 'plaid' | 'manual' | 'all' = 'all'): Promise<FundingSource[]> {
    const response = await apiClient.get<FundingSourcesResponse>(
      '/api/investment/funding-sources',
      { params: { account_id: accountId, type } }
    );
    return response.data.fundingSources ?? [];
  }

  static async disconnectFundingSource(accountId: string, fundingSourceId: string, type: 'plaid' | 'manual' = 'plaid') {
    const response = await apiClient.delete(`/api/investment/funding-sources/${fundingSourceId}`, {
      params: { account_id: accountId, type },
    });
    return response.data;
  }

  static async getNigerianBanks(): Promise<NigerianBank[]> {
    const response = await apiClient.get<NigerianBanksResponse>(
      '/api/lookup/nigerian-banks'
    );
    return response.data.data.banks ?? [];
  }
}

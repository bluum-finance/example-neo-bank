/**
 * Life Event Service
 * Handles API calls for planned major life events (college, wedding, home purchase, etc.)
 */

// Helper function to handle API errors
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: `HTTP ${response.status}: ${response.statusText}`,
    }));
    throw new Error(typeof error.error === 'string' ? error.error : error.error?.message || 'An error occurred');
  }
  return response.json();
}

export type LifeEventType =
  | 'college'
  | 'wedding'
  | 'home_purchase'
  | 'retirement'
  | 'major_purchase'
  | 'career_change'
  | 'custom';

export type LifeEventStatus = 'active' | 'completed' | 'archived';

export interface LifeEvent {
  event_id: string;
  account_id: string;
  name: string;
  event_type: LifeEventType;
  expected_date: string;
  estimated_cost: string;
  currency?: string;
  recurring?: boolean;
  linked_goal_id?: string | null;
  notes?: string;
  status: LifeEventStatus;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

export interface LifeEventListResponse {
  life_events: LifeEvent[];
  total_count: number;
}

export interface CreateLifeEventRequest {
  name: string;
  event_type: LifeEventType;
  expected_date: string;
  estimated_cost: string;
  currency?: string;
  recurring?: boolean;
  linked_goal_id?: string;
  notes?: string;
}

export interface UpdateLifeEventRequest {
  name?: string;
  event_type?: LifeEventType;
  expected_date?: string;
  estimated_cost?: string;
  currency?: string;
  recurring?: boolean;
  status?: LifeEventStatus;
  linked_goal_id?: string | null;
  notes?: string;
}

export class LifeEventService {
  /**
   * Create a new planned major life event
   */
  static async createLifeEvent(accountId: string, data: CreateLifeEventRequest): Promise<LifeEvent> {
    const response = await fetch('/api/wealth/life-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: accountId,
        ...data,
      }),
    });
    return handleResponse<LifeEvent>(response);
  }

  /**
   * Retrieves all planned life events for an account
   */
  static async listLifeEvents(
    accountId: string,
    filters?: {
      status?: LifeEventStatus;
      event_type?: LifeEventType;
    }
  ): Promise<LifeEventListResponse> {
    const queryParams = new URLSearchParams();
    queryParams.append('account_id', accountId);
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.event_type) queryParams.append('event_type', filters.event_type);

    const response = await fetch(`/api/wealth/life-events?${queryParams.toString()}`);
    return handleResponse<LifeEventListResponse>(response);
  }

  /**
   * Retrieves details for a specific life event
   */
  static async getLifeEvent(accountId: string, eventId: string): Promise<LifeEvent> {
    const queryParams = new URLSearchParams({ account_id: accountId });
    const response = await fetch(`/api/wealth/life-events/${eventId}?${queryParams.toString()}`);
    return handleResponse<LifeEvent>(response);
  }

  /**
   * Updates an existing life event
   */
  static async updateLifeEvent(
    accountId: string,
    eventId: string,
    data: UpdateLifeEventRequest
  ): Promise<LifeEvent> {
    const response = await fetch(`/api/wealth/life-events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account_id: accountId,
        ...data,
      }),
    });
    return handleResponse<LifeEvent>(response);
  }

  /**
   * Soft-deletes a life event by setting its status to archived
   */
  static async deleteLifeEvent(accountId: string, eventId: string): Promise<void> {
    const queryParams = new URLSearchParams({ account_id: accountId });
    const response = await fetch(`/api/wealth/life-events/${eventId}?${queryParams.toString()}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      await handleResponse(response);
    }
  }
}

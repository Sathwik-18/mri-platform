/**
 * Notifications API Service
 * Handles all notification-related API calls
 */

import { createClient } from '@/lib/supabase/client';
import type { ApiResponse } from './index';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'appointment' | 'scan_result' | 'assignment' | 'system';
  read: boolean;
  link: string | null;
  created_at: string;
}

class NotificationsApi {
  private supabase = createClient();

  /**
   * Get notifications for the current user
   */
  async getNotifications(limit = 20): Promise<ApiResponse<Notification[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        data: data || [],
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch notifications',
        status: 500,
      };
    }
  }

  /**
   * Get count of unread notifications
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { count, error } = await this.supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      return {
        data: count || 0,
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch unread count',
        status: 500,
      };
    }
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(id: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      return {
        data: true,
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to mark as read',
        status: 500,
      };
    }
  }

  /**
   * Mark all notifications as read for the current user
   */
  async markAllAsRead(): Promise<ApiResponse<boolean>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      return {
        data: true,
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to mark all as read',
        status: 500,
      };
    }
  }

  /**
   * Create a notification for a user
   */
  async createNotification(
    userId: string,
    title: string,
    message: string,
    type: Notification['type'] = 'system',
    link?: string
  ): Promise<ApiResponse<Notification>> {
    try {
      const { data, error } = await this.supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title,
          message,
          type,
          link: link || null,
          read: false,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data,
        error: null,
        status: 201,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create notification',
        status: 500,
      };
    }
  }
}

export const notificationsApi = new NotificationsApi();

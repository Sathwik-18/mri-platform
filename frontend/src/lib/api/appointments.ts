/**
 * Appointments API Service
 * Flow: Patient books (pending) → Doctor accepts/rejects → completed/cancelled
 */

import { createClient } from '@/lib/supabase/client';
import type { ApiResponse } from './index';
import { notificationsApi } from './notifications';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_type: 'consultation' | 'follow_up' | 'scan_review';
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient?: {
    id: string;
    patient_code: string;
    user_profile: { full_name: string } | { full_name: string }[];
  };
  doctor?: {
    id: string;
    doctor_code: string;
    specialization: string;
    user_profile: { full_name: string } | { full_name: string }[];
  };
  // Computed
  patient_name?: string;
  doctor_name?: string;
}

export interface CreateAppointmentInput {
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_type: Appointment['appointment_type'];
  notes?: string;
}

const APPT_SELECT = `
  *,
  patient:patient_profiles(
    id,
    patient_code,
    user_profile:user_profiles(full_name)
  ),
  doctor:doctor_profiles(
    id,
    doctor_code,
    specialization,
    user_profile:user_profiles(full_name)
  )
`;

class AppointmentsApi {
  private supabase = createClient();

  private resolveProfile(profile: any): string {
    if (Array.isArray(profile)) return profile[0]?.full_name || 'Unknown';
    return profile?.full_name || 'Unknown';
  }

  private mapAppointment(a: any): Appointment {
    return {
      ...a,
      patient_name: this.resolveProfile(a.patient?.user_profile),
      doctor_name: this.resolveProfile(a.doctor?.user_profile),
    };
  }

  /**
   * Get appointments for the current user (doctor or patient)
   */
  async getMyAppointments(): Promise<ApiResponse<Appointment[]>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('appointments')
        .select(APPT_SELECT)
        .order('appointment_date', { ascending: true });

      if (error) throw error;

      return {
        data: (data || []).map((a: any) => this.mapAppointment(a)),
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to fetch appointments',
        status: 500,
      };
    }
  }

  /**
   * Create a new appointment request (patient-initiated, status: pending)
   */
  async createAppointment(input: CreateAppointmentInput): Promise<ApiResponse<Appointment>> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await this.supabase
        .from('appointments')
        .insert({
          patient_id: input.patient_id,
          doctor_id: input.doctor_id,
          appointment_date: input.appointment_date,
          appointment_type: input.appointment_type,
          notes: input.notes || null,
          status: 'pending',
          created_by: user.id,
        })
        .select(APPT_SELECT)
        .single();

      if (error) throw error;

      // Notify the DOCTOR about the new appointment request
      const { data: doctorProfile } = await this.supabase
        .from('doctor_profiles')
        .select('user_id')
        .eq('id', input.doctor_id)
        .single();

      if (doctorProfile?.user_id) {
        const patientName = this.resolveProfile(data.patient?.user_profile);
        const date = new Date(input.appointment_date).toLocaleDateString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit',
        });
        const typeLabel = input.appointment_type.replace('_', ' ');

        await notificationsApi.createNotification(
          doctorProfile.user_id,
          'New Appointment Request',
          `${patientName} requested a ${typeLabel} on ${date}`,
          'appointment',
          '/doctor/dashboard'
        );
      }

      return {
        data: this.mapAppointment(data),
        error: null,
        status: 201,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to create appointment',
        status: 500,
      };
    }
  }

  /**
   * Update appointment status
   */
  async updateAppointment(
    id: string,
    updates: { status?: Appointment['status']; notes?: string }
  ): Promise<ApiResponse<Appointment>> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select(APPT_SELECT)
        .single();

      if (error) throw error;

      // Send notifications based on status change
      if (updates.status) {
        const doctorName = this.resolveProfile(data.doctor?.user_profile);
        const patientName = this.resolveProfile(data.patient?.user_profile);

        // Notify PATIENT about doctor's response
        if (['accepted', 'rejected', 'completed', 'cancelled'].includes(updates.status)) {
          const { data: patientProfile } = await this.supabase
            .from('patient_profiles')
            .select('user_id')
            .eq('id', data.patient_id)
            .single();

          if (patientProfile?.user_id) {
            const titles: Record<string, string> = {
              accepted: 'Appointment Accepted',
              rejected: 'Appointment Declined',
              completed: 'Appointment Completed',
              cancelled: 'Appointment Cancelled',
            };
            const messages: Record<string, string> = {
              accepted: `Dr. ${doctorName} accepted your appointment request`,
              rejected: `Dr. ${doctorName} declined your appointment request`,
              completed: `Your appointment with Dr. ${doctorName} has been completed`,
              cancelled: `Your appointment with Dr. ${doctorName} has been cancelled`,
            };

            await notificationsApi.createNotification(
              patientProfile.user_id,
              titles[updates.status] || 'Appointment Update',
              messages[updates.status] || 'Your appointment status has changed',
              'appointment',
              '/patient/dashboard'
            );
          }
        }
      }

      return {
        data: this.mapAppointment(data),
        error: null,
        status: 200,
      };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to update appointment',
        status: 500,
      };
    }
  }

  async acceptAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return this.updateAppointment(id, { status: 'accepted' });
  }

  async rejectAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return this.updateAppointment(id, { status: 'rejected' });
  }

  async cancelAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return this.updateAppointment(id, { status: 'cancelled' });
  }

  async completeAppointment(id: string): Promise<ApiResponse<Appointment>> {
    return this.updateAppointment(id, { status: 'completed' });
  }
}

export const appointmentsApi = new AppointmentsApi();

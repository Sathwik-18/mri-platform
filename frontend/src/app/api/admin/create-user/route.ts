import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { createClient } from '@/lib/supabase/server';

// Generate random password
function generatePassword(length = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

// Generate unique codes
function generateCode(prefix: string): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `${prefix}${timestamp}${random}`;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, full_name, phone, role, roleData } = body;

    // Validate required fields
    if (!email || !full_name || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: email, full_name, role' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['patient', 'doctor', 'radiologist', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    // Generate temporary password
    const temporaryPassword = generatePassword(12);

    // Use service role client to create user (bypasses RLS)
    const supabaseAdmin = createServiceRoleClient();

    // Create auth user
    const { data: newUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        first_login: true,
      },
    });

    if (authError || !newUser.user) {
      console.error('Auth creation error:', authError);
      return NextResponse.json(
        { error: authError?.message || 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile
    const { error: profileError } = await supabaseAdmin.from('user_profiles').insert({
      id: newUser.user.id,
      full_name,
      email,
      role,
      phone: phone || null,
      account_status: 'active',
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Rollback: delete auth user
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // Create role-specific profile
    let roleProfileError = null;

    if (role === 'patient') {
      const patientCode = generateCode('PT');
      const { error } = await supabaseAdmin.from('patient_profiles').insert({
        user_id: newUser.user.id,
        patient_code: patientCode,
        date_of_birth: roleData?.date_of_birth,
        age: roleData?.age,
        gender: roleData?.gender,
        blood_group_id: roleData?.blood_group_id,
        address: roleData?.address,
        city: roleData?.city,
        state: roleData?.state,
        pincode: roleData?.pincode,
        emergency_contact_name: roleData?.emergency_contact_name,
        emergency_contact_phone: roleData?.emergency_contact_phone,
        medical_history: roleData?.medical_history,
      });
      roleProfileError = error;
    } else if (role === 'doctor') {
      const doctorCode = generateCode('DR');
      const { error } = await supabaseAdmin.from('doctor_profiles').insert({
        user_id: newUser.user.id,
        doctor_code: doctorCode,
        specialization: roleData?.specialization,
        qualification_id: roleData?.qualification_id,
        license_number: roleData?.license_number,
        hospital_id: roleData?.hospital_id,
        experience_years: roleData?.experience_years,
      });
      roleProfileError = error;
    } else if (role === 'radiologist') {
      const radiologistCode = generateCode('RD');
      const { error } = await supabaseAdmin.from('radiologist_profiles').insert({
        user_id: newUser.user.id,
        radiologist_code: radiologistCode,
        specialization: roleData?.specialization,
        qualification_id: roleData?.qualification_id,
        license_number: roleData?.license_number,
        hospital_id: roleData?.hospital_id,
        certification: roleData?.certification,
      });
      roleProfileError = error;
    } else if (role === 'admin') {
      const adminCode = generateCode('AD');
      const { error } = await supabaseAdmin.from('admin_profiles').insert({
        user_id: newUser.user.id,
        admin_code: adminCode,
        hospital_id: roleData?.hospital_id,
        permissions: roleData?.permissions || {},
      });
      roleProfileError = error;
    }

    if (roleProfileError) {
      console.error('Role profile creation error:', roleProfileError);
      // Rollback: delete user profile and auth user
      await supabaseAdmin.from('user_profiles').delete().eq('id', newUser.user.id);
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json(
        { error: `Failed to create ${role} profile` },
        { status: 500 }
      );
    }

    // TODO: Send email with credentials
    // For now, just return the credentials in response
    // In production, you should send this via email

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: newUser.user.id,
        email,
        full_name,
        role,
        temporaryPassword, // In production, send via email instead
      },
    });
  } catch (error: any) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

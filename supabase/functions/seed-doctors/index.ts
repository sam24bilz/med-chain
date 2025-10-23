import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DoctorData {
  email: string;
  password: string;
  full_name: string;
  specialization: string;
}

const doctorsData: DoctorData[] = [
  { email: 'sarah.johnson@medchain.com', password: 'Doctor123!', full_name: 'Dr. Sarah Johnson', specialization: 'Cardiology' },
  { email: 'michael.chen@medchain.com', password: 'Doctor123!', full_name: 'Dr. Michael Chen', specialization: 'Dermatology' },
  { email: 'emily.rodriguez@medchain.com', password: 'Doctor123!', full_name: 'Dr. Emily Rodriguez', specialization: 'Pediatrics' },
  { email: 'james.williams@medchain.com', password: 'Doctor123!', full_name: 'Dr. James Williams', specialization: 'Orthopedics' },
  { email: 'aisha.patel@medchain.com', password: 'Doctor123!', full_name: 'Dr. Aisha Patel', specialization: 'Neurology' },
  { email: 'david.kim@medchain.com', password: 'Doctor123!', full_name: 'Dr. David Kim', specialization: 'Gastroenterology' },
  { email: 'maria.garcia@medchain.com', password: 'Doctor123!', full_name: 'Dr. Maria Garcia', specialization: 'Oncology' },
  { email: 'robert.brown@medchain.com', password: 'Doctor123!', full_name: 'Dr. Robert Brown', specialization: 'Psychiatry' },
  { email: 'lisa.anderson@medchain.com', password: 'Doctor123!', full_name: 'Dr. Lisa Anderson', specialization: 'Endocrinology' },
  { email: 'ahmed.hassan@medchain.com', password: 'Doctor123!', full_name: 'Dr. Ahmed Hassan', specialization: 'Pulmonology' },
  { email: 'jennifer.lee@medchain.com', password: 'Doctor123!', full_name: 'Dr. Jennifer Lee', specialization: 'Ophthalmology' },
  { email: 'carlos.martinez@medchain.com', password: 'Doctor123!', full_name: 'Dr. Carlos Martinez', specialization: 'Urology' },
  { email: 'priya.sharma@medchain.com', password: 'Doctor123!', full_name: 'Dr. Priya Sharma', specialization: 'Gynecology' },
  { email: 'thomas.wilson@medchain.com', password: 'Doctor123!', full_name: 'Dr. Thomas Wilson', specialization: 'ENT' },
  { email: 'fatima.abbas@medchain.com', password: 'Doctor123!', full_name: 'Dr. Fatima Abbas', specialization: 'Rheumatology' },
  { email: 'john.taylor@medchain.com', password: 'Doctor123!', full_name: 'Dr. John Taylor', specialization: 'Nephrology' },
  { email: 'sophie.zhang@medchain.com', password: 'Doctor123!', full_name: 'Dr. Sophie Zhang', specialization: 'Hematology' },
  { email: 'marcus.johnson@medchain.com', password: 'Doctor123!', full_name: 'Dr. Marcus Johnson', specialization: 'Radiology' },
  { email: 'nina.gupta@medchain.com', password: 'Doctor123!', full_name: 'Dr. Nina Gupta', specialization: 'Anesthesiology' },
  { email: 'peter.oconnor@medchain.com', password: 'Doctor123!', full_name: "Dr. Peter O'Connor", specialization: 'Emergency Medicine' },
  { email: 'rachel.kim@medchain.com', password: 'Doctor123!', full_name: 'Dr. Rachel Kim', specialization: 'Infectious Disease' },
  { email: 'mohammed.ali@medchain.com', password: 'Doctor123!', full_name: 'Dr. Mohammed Ali', specialization: 'General Surgery' },
  { email: 'catherine.white@medchain.com', password: 'Doctor123!', full_name: 'Dr. Catherine White', specialization: 'Family Medicine' },
  { email: 'daniel.park@medchain.com', password: 'Doctor123!', full_name: 'Dr. Daniel Park', specialization: 'Physical Medicine' },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const results = {
      created: 0,
      existing: 0,
      errors: [] as string[]
    }

    for (const doctor of doctorsData) {
      try {
        // Check if user already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('full_name', doctor.full_name)
          .maybeSingle()

        if (existingProfile) {
          console.log(`Doctor ${doctor.full_name} already exists`)
          results.existing++
          continue
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: doctor.email,
          password: doctor.password,
          email_confirm: true,
          user_metadata: {
            full_name: doctor.full_name,
            role: 'doctor',
            specialization: doctor.specialization
          }
        })

        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`Email ${doctor.email} already registered`)
            results.existing++
            continue
          }
          throw authError
        }

        console.log(`Created doctor: ${doctor.full_name}`)
        results.created++
      } catch (error: any) {
        console.error(`Error creating ${doctor.full_name}:`, error)
        results.errors.push(`${doctor.full_name}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Seeding complete: ${results.created} created, ${results.existing} already existed`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    console.error('Seeding error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

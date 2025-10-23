-- Create enum for user roles
CREATE TYPE public.user_role AS ENUM ('patient', 'doctor');

-- Create enum for consultation status
CREATE TYPE public.consultation_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL,
  specialization TEXT,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create consultations table
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  nft_token_id TEXT,
  status consultation_status DEFAULT 'pending' NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  price_hbar DECIMAL(10, 2) NOT NULL,
  transaction_hash TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Consultations RLS policies
CREATE POLICY "Users can view their own consultations"
  ON public.consultations
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE id = patient_id
      UNION
      SELECT user_id FROM public.profiles WHERE id = doctor_id
    )
  );

CREATE POLICY "Patients can create consultations"
  ON public.consultations
  FOR INSERT
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.profiles WHERE id = patient_id)
  );

CREATE POLICY "Users can update their own consultations"
  ON public.consultations
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.profiles WHERE id = patient_id
      UNION
      SELECT user_id FROM public.profiles WHERE id = doctor_id
    )
  );

-- Create NFT metadata table
CREATE TABLE public.nft_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES public.consultations(id) ON DELETE CASCADE NOT NULL,
  token_id TEXT NOT NULL UNIQUE,
  metadata_json JSONB NOT NULL,
  ipfs_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS on nft_metadata
ALTER TABLE public.nft_metadata ENABLE ROW LEVEL SECURITY;

-- NFT metadata RLS policies
CREATE POLICY "Users can view NFT metadata for their consultations"
  ON public.nft_metadata
  FOR SELECT
  USING (
    consultation_id IN (
      SELECT id FROM public.consultations
      WHERE auth.uid() IN (
        SELECT user_id FROM public.profiles WHERE id = patient_id
        UNION
        SELECT user_id FROM public.profiles WHERE id = doctor_id
      )
    )
  );

CREATE POLICY "System can insert NFT metadata"
  ON public.nft_metadata
  FOR INSERT
  WITH CHECK (true);

-- Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, specialization)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient'),
    NEW.raw_user_meta_data->>'specialization'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_consultations_updated_at
  BEFORE UPDATE ON public.consultations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Create storage bucket for NFT metadata
INSERT INTO storage.buckets (id, name, public)
VALUES ('nft-metadata', 'nft-metadata', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for NFT metadata
CREATE POLICY "NFT metadata is publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'nft-metadata');

CREATE POLICY "Authenticated users can upload NFT metadata"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'nft-metadata' AND
    auth.role() = 'authenticated'
  );

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_consultations_patient_id ON public.consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON public.consultations(doctor_id);
CREATE INDEX idx_consultations_status ON public.consultations(status);
CREATE INDEX idx_consultations_appointment_date ON public.consultations(appointment_date);
CREATE INDEX idx_nft_metadata_consultation_id ON public.nft_metadata(consultation_id);
CREATE INDEX idx_nft_metadata_token_id ON public.nft_metadata(token_id);
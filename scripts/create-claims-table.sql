-- Create the claims table
CREATE TABLE IF NOT EXISTS claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date_received DATE NOT NULL,
  corporate_name TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  employee_id TEXT,
  claim_amount DECIMAL(10,2) NOT NULL,
  claim_type TEXT NOT NULL CHECK (claim_type IN ('Dental', 'Optical', 'General Medical', 'Maternity', 'Surgery', 'Hospitalization', 'Other')),
  reimbursement_method TEXT NOT NULL CHECK (reimbursement_method IN ('cheque', 'bank-transfer')),
  current_status TEXT NOT NULL DEFAULT 'Received from client' CHECK (current_status IN (
    'Received from client',
    'Document scanned & uploaded',
    'Claim reviewed internally',
    'Sent to IGI',
    'Pending with IGI',
    'Approved by IGI',
    'Cheque Received',
    'Cheque Sent to Client',
    'Cheque Delivered'
  )),
  file_urls TEXT[] DEFAULT '{}',
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create an index on user_id for better query performance
CREATE INDEX IF NOT EXISTS idx_claims_user_id ON claims(user_id);

-- Create an index on current_status for filtering
CREATE INDEX IF NOT EXISTS idx_claims_current_status ON claims(current_status);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims(created_at DESC);

-- Enable Row Level Security
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own claims
CREATE POLICY "Users can view their own claims" ON claims
  FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own claims
CREATE POLICY "Users can insert their own claims" ON claims
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own claims
CREATE POLICY "Users can update their own claims" ON claims
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own claims
CREATE POLICY "Users can delete their own claims" ON claims
  FOR DELETE USING (auth.uid() = user_id);

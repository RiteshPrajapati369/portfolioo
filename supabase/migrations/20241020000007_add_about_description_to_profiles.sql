-- Add about_description column to profiles for extended bio/about section
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS about_description TEXT;

-- Seed existing profiles with default detailed about description if null
UPDATE public.profiles
SET about_description = 'With practical experience configuring rule-based Intrusion Detection and Prevention Systems (Snort/Suricata), architecting secure authentication workflows with multi-factor verification, and performing code-level audits across HTML, CSS, JavaScript, and PHP, my objective is to fortify systems before adversaries can exploit them.'
WHERE about_description IS NULL;

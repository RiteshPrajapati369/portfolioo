-- Seed initial profile, cybersecurity projects, skills, services, and navigation
DO $$
DECLARE
    v_profile_id UUID := '00000000-0000-0000-0000-000000000001';
    v_nav_id UUID := gen_random_uuid();
    v_proj_ids UUID[] := ARRAY[gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
    v_tech_ids UUID[] := ARRAY[gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), gen_random_uuid()];
BEGIN
    -- 1. Insert Profile
    INSERT INTO public.profiles (
        id,
        full_name,
        headline,
        bio,
        avatar_url,
        email,
        phone,
        location,
        status
    ) VALUES (
        v_profile_id,
        'Ritesh Prajapati',
        'Cybersecurity Specialist & Penetration Tester',
        'Cybersecurity professional specializing in Penetration Testing, Bug Hunting, Intrusion Detection Systems (IDS/IPS), and Secure Systems Architecture. Committed to hardening digital perimeters and identifying critical vulnerabilities.',
        '/images/profile.png',
        'panditritesh005@gmail.com',
        NULL,
        'Kathmandu, Nepal',
        'published'
    ) ON CONFLICT (id) DO NOTHING;

    -- 2. Insert Site Settings
    INSERT INTO public.site_settings (
        profile_id,
        site_title,
        tagline,
        hero_badge_text,
        is_available,
        copyright_text,
        footer_text
    ) VALUES (
        v_profile_id,
        'Ritesh Prajapati | Cybersecurity Portfolio',
        'Defending systems, auditing code, and engineering resilient security architectures.',
        'AVAILABLE FOR SECURITY AUDITS',
        true,
        '© 2026 Ritesh Prajapati. All rights reserved.',
        'Design by Ritesh Prajapati'
    ) ON CONFLICT (profile_id) DO NOTHING;

    -- 3. Insert SEO Settings
    INSERT INTO public.seo_settings (
        profile_id,
        meta_title,
        meta_description,
        meta_keywords
    ) VALUES (
        v_profile_id,
        'Ritesh Prajapati | Cybersecurity Specialist & Pentester',
        'Explore Ritesh Prajapati''s cybersecurity projects, penetration testing write-ups, vulnerability assessment toolkit, and network defense implementations.',
        ARRAY['Cybersecurity', 'Penetration Testing', 'Bug Hunting', 'IDS/IPS', 'Network Security', 'Ritesh Prajapati']
    ) ON CONFLICT (profile_id) DO NOTHING;

    -- 4. Navigation (Home · Work · Blog · Contact)
    INSERT INTO public.navigation (id, profile_id, name, is_active)
    VALUES (v_nav_id, v_profile_id, 'Main Navigation', true)
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.nav_links (navigation_id, label, href, is_external, sort_order)    
    VALUES
        (v_nav_id, 'Home', '/#hero', false, 1),
        (v_nav_id, 'Work', '/#work', false, 2),
        (v_nav_id, 'Blog', '/blog', false, 3),
        (v_nav_id, 'Contact', '/#contact', false, 4)
    ON CONFLICT DO NOTHING;

    -- 5. Technologies
    INSERT INTO public.technologies (id, name, category) VALUES
        (v_tech_ids[1], 'Snort / Suricata', 'Network Security'),
        (v_tech_ids[2], 'Python', 'Scripting'),
        (v_tech_ids[3], 'Burp Suite', 'Offensive Security'),
        (v_tech_ids[4], 'Next.js 14', 'Fullstack Framework'),
        (v_tech_ids[5], 'TypeScript', 'Programming Language'),
        (v_tech_ids[6], 'Supabase / PostgreSQL', 'Database & Security'),
        (v_tech_ids[7], 'Tailwind CSS', 'Styling')
    ON CONFLICT (name) DO NOTHING;

    -- 6. Projects (IDS/IPS, Personal Portfolio, Vulnerability Assessment Toolkit, Secure Authentication System)
    INSERT INTO public.projects (
        id, profile_id, title, slug, description, content, category, is_featured, sort_order, status
    ) VALUES
        (
            v_proj_ids[1],
            v_profile_id,
            'IDS/IPS',
            'ids-ips-network-defense',
            'Configured and deployed rule-based Intrusion Detection and Prevention Systems (Snort & Suricata) to intercept unauthorized network packets, detect brute-force attempts, and mitigate zero-day anomaly signatures.',
            'A comprehensive IDS/IPS network perimeter defense project analyzing PCAP traces, deploying custom signature rules, and evaluating stateful inspection mechanisms against active exploit simulations.',
            'Network Security',
            true,
            1,
            'published'
        ),
        (
            v_proj_ids[2],
            v_profile_id,
            'Personal Portfolio',
            'personal-cybersecurity-portfolio',
            'Engineered a high-performance single-owner cybersecurity portfolio and CMS using Next.js 14, Tailwind CSS, Supabase PostgreSQL with RLS, and Cloudflare Workers.',     
            'Architecture features strict Content-Security-Policy headers, server-side TOTP MFA verification, and 24-hour account lockout after 3 failed password attempts.',       
            'Web Architecture',
            true,
            2,
            'published'
        ),
        (
            v_proj_ids[3],
            v_profile_id,
            'Vulnerability Assessment Toolkit',
            'vulnerability-assessment-toolkit',
            'Automated security recon and vulnerability scanning suite for auditing web endpoints, CORS misconfigurations, security header deficiencies, and exposed sensitive directories.',
            'Modular toolkit built for penetration testers and bug hunters to rapidly map attack surfaces and validate critical OWASP Top 10 vulnerabilities.',
            'Offensive Security',
            true,
            3,
            'published'
        ),
        (
            v_proj_ids[4],
            v_profile_id,
            'Secure Authentication System',
            'secure-authentication-system',
            'Production-ready authentication engine implementing RFC 6238 TOTP Multi-Factor Authentication, account-wide 24-hour brute-force lockouts, and cryptographic session protection.',
            'Rigorous defense against credential stuffing and brute-force attacks via server-side attempt tracking, timing-safe validation, and tamper-resistant cookie handling.', 
            'Identity & Access Management',
            true,
            4,
            'published'
        )
    ON CONFLICT (slug) DO NOTHING;

    -- 7. Skills (Penetesting / Bug Hunting, HTML, CSS, JS, PHP)
    INSERT INTO public.skills (profile_id, name, category, proficiency, sort_order, status)
    VALUES
        (v_profile_id, 'Penetesting / Bug Hunting', 'Offensive Security', 95, 1, 'published'),
        (v_profile_id, 'HTML', 'Frontend & Structure', 90, 2, 'published'),
        (v_profile_id, 'CSS', 'Styling & Responsive Design', 85, 3, 'published'),
        (v_profile_id, 'JS', 'Scripting & Frontend Logic', 88, 4, 'published'),
        (v_profile_id, 'PHP', 'Backend & Server Auditing', 82, 5, 'published')
    ON CONFLICT DO NOTHING;

    -- 8. Services
    INSERT INTO public.services (profile_id, title, description, sort_order, status)      
    VALUES
        (
            v_profile_id,
            'Penetration Testing & Bug Hunting',
            'In-depth offensive security assessments to expose vulnerabilities before attackers exploit them, following OWASP standards and real-world threat models.',
            1,
            'published'
        ),
        (
            v_profile_id,
            'Web Application Security Auditing',
            'Code review, API security testing, injection flaw analysis, and authentication logic verification across modern web stacks.',
            2,
            'published'
        ),
        (
            v_profile_id,
            'Network Defense & IDS/IPS Engineering',
            'Perimeter hardening, firewall rule optimization, intrusion detection monitoring, and anomaly detection setups.',
            3,
            'published'
        ),
        (
            v_profile_id,
            'Secure Authentication & MFA Architecture',
            'Architecting robust access controls with TOTP MFA, account lockout mechanisms, and tamper-proof session workflows.',
            4,
            'published'
        )
    ON CONFLICT DO NOTHING;

    -- 9. Initial Blog Post
    INSERT INTO public.blog_posts (
        profile_id,
        title,
        slug,
        summary,
        content,
        reading_time,
        tags,
        status
    ) VALUES (
        v_profile_id,
        'Offensive Security Methodology: From Reconnaissance to Exploitation',
        'offensive-security-methodology',
        'A technical deep dive into structured penetration testing workflows, active intelligence gathering, and responsible disclosure practices.',
        '# Offensive Security Methodology\n\nPenetration testing requires methodical discipline rather than chaotic guessing. In this article, we examine the structured phases of security assessments:\n\n1. **Reconnaissance & Passive OSINT**: Discovering subdomains, DNS records, and exposed repositories.\n2. **Active Scanning & Enumeration**: Port scanning, service fingerprinting, and header inspection.\n3. **Vulnerability Identification**: Correlating CVEs, checking for SQLi, XSS, and broken access controls (BOLA/IDOR).\n4. **Exploitation & Proof-of-Concept**: Demonstrating impact safely without service disruption.\n5. **Remediation & Hardening**: Delivering actionable engineering recommendations.\n\nDefense in depth begins with knowing how the adversary thinks.',
        '6 min read',
        ARRAY['Penetration Testing', 'Bug Hunting', 'Methodology'],
        'published'
    ) ON CONFLICT (slug) DO NOTHING;

    -- 10. Default Social Links (GitHub, LinkedIn, X)
    INSERT INTO public.social_links (profile_id, platform, url, label, sort_order, is_active)
    VALUES
        (v_profile_id, 'github', 'https://github.com/RiteshPrajapati369', 'GitHub', 1, true),
        (v_profile_id, 'linkedin', 'https://www.linkedin.com/in/ritesh-prajapati-5b7238285', 'LinkedIn', 2, true),
        (v_profile_id, 'twitter', 'https://x.com/RiteshPraj8063', 'X (Twitter)', 3, true) 
    ON CONFLICT DO NOTHING;
END $$;
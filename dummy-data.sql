-- Insert dummy leads
INSERT INTO leads (name, email, phone, company, product_interest, message, category, ai_category, ai_confidence, ai_reasoning, status, priority) VALUES
('John Smith', 'john@techcorp.com', '+1-555-0101', 'TechCorp Inc', 'Laminate Flooring', 'We need flooring for a 5000 sq ft office ASAP. Budget approved, looking to start next month.', 'HOT', 'HOT', 0.95, 'Urgent timeline, approved budget, large project indicates high purchase intent', 'NEW', 'HIGH'),

('Sarah Johnson', 'sarah@startup.io', '+1-555-0102', 'Startup.io', 'LED Lighting', 'Interested in learning more about your LED lighting solutions. We are a small team of 10.', 'WARM', 'WARM', 0.78, 'Moderate interest, smaller team size, exploratory phase', 'CONTACTED', 'MEDIUM'),

('Mike Chen', 'mike@bigcorp.com', '+1-555-0103', 'BigCorp LLC', 'Hardwood Flooring', 'Just browsing your website. Might need something in 6 months.', 'COLD', 'COLD', 0.45, 'Low urgency, distant timeline, minimal engagement', 'NEW', 'LOW'),

('Emily Davis', 'emily@medtech.com', '+1-555-0104', 'MedTech Solutions', 'Wall Laminates', 'We need wall laminates for 3 floors. Need proposal by Friday!', 'HOT', 'HOT', 0.92, 'Formal RFP process, immediate deadline, commercial project', 'QUALIFIED', 'HIGH'),

('Robert Wilson', 'robert@retailco.com', '+1-555-0105', 'RetailCo', 'Vinyl Flooring', 'Looking for options to upgrade our store flooring. Timeline is flexible.', 'WARM', 'WARM', 0.65, 'Active search but flexible timeline, mid-level interest', 'NURTURING', 'MEDIUM'),

('Lisa Anderson', 'lisa@consulting.com', '+1-555-0106', 'Anderson Consulting', 'Decorative Lighting', 'Can you send me your pricing sheet?', 'COLD', 'COLD', 0.38, 'Price-focused inquiry, minimal context provided', 'NEW', 'LOW'),

('David Kumar', 'david@builders.com', '+1-555-0107', 'Kumar Builders', 'Laminate Flooring', 'Urgent! Building 3 apartments. Need 10000 sq ft flooring delivered this week!', 'HOT', 'HOT', 0.98, 'Extremely urgent, bulk order, immediate need', 'NEW', 'HIGH'),

('Jennifer Lee', 'jennifer@hotel.com', '+1-555-0108', 'Grand Hotel', 'LED Lighting', 'Renovating hotel lobby. Looking for premium LED lighting options. Budget is 50 lakhs.', 'HOT', 'HOT', 0.90, 'High budget, commercial project, specific requirements', 'CONTACTED', 'HIGH');

-- Insert dummy follow-ups
INSERT INTO follow_ups (lead_id, type, scheduled_at, status, message, approved) 
SELECT 
    id,
    'INITIAL',
    NOW() + INTERVAL '30 minutes',
    'PENDING',
    'Thank you for your urgent inquiry! We''re excited to help with your project. A senior consultant will contact you within the hour to discuss your flooring requirements.',
    false
FROM leads WHERE email = 'john@techcorp.com';

INSERT INTO follow_ups (lead_id, type, scheduled_at, status, message, approved) 
SELECT 
    id,
    'INITIAL',
    NOW() + INTERVAL '15 minutes',
    'PENDING',
    'Thank you for reaching out! Given the urgency of your project, I''m prioritizing this. Can we schedule a call today to discuss specifications?',
    false
FROM leads WHERE email = 'david@builders.com';

INSERT INTO follow_ups (lead_id, type, scheduled_at, status, message, approved) 
SELECT 
    id,
    'FIRST_FOLLOWUP',
    NOW() + INTERVAL '1 day',
    'PENDING',
    'Following up on your LED lighting inquiry. Have you had a chance to review our product catalog? I can arrange a showroom visit.',
    false
FROM leads WHERE email = 'sarah@startup.io';

INSERT INTO follow_ups (lead_id, type, scheduled_at, status, message, approved) 
SELECT 
    id,
    'INITIAL',
    NOW() + INTERVAL '1 hour',
    'PENDING',
    'Thank you for your interest in our premium LED lighting! I''ve prepared a proposal tailored for hotel lobby renovations. Would you like to schedule a consultation?',
    false
FROM leads WHERE email = 'jennifer@hotel.com';

INSERT INTO follow_ups (lead_id, type, scheduled_at, status, message, approved) 
SELECT 
    id,
    'SECOND_FOLLOWUP',
    NOW() + INTERVAL '3 days',
    'PENDING',
    'Just checking in! We have a new vinyl flooring collection that might interest you. Would you like to see samples?',
    false
FROM leads WHERE email = 'robert@retailco.com';

INSERT INTO follow_ups (lead_id, type, scheduled_at, status, message, approved, approved_by, approved_at) 
SELECT 
    id,
    'INITIAL',
    NOW() - INTERVAL '1 hour',
    'SENT',
    'Thank you for your interest! I''ve attached our wall laminates catalog with pricing for bulk orders.',
    true,
    'admin',
    NOW() - INTERVAL '2 hours'
FROM leads WHERE email = 'emily@medtech.com';

-- Insert dummy approvals
INSERT INTO approvals (lead_id, type, status, requested_by, notes)
SELECT 
    id,
    'CATEGORY_OVERRIDE',
    'PENDING',
    'sales@company.com',
    'Customer requested to be moved to HOT category due to updated budget approval'
FROM leads WHERE email = 'sarah@startup.io';

INSERT INTO approvals (lead_id, type, status, requested_by, notes)
SELECT 
    id,
    'FOLLOWUP_EMAIL',
    'PENDING',
    'sales@company.com',
    'Requesting approval to send custom follow-up with special pricing offer'
FROM leads WHERE email = 'robert@retailco.com';

INSERT INTO approvals (lead_id, type, status, requested_by, notes)
SELECT 
    id,
    'LEAD_ASSIGNMENT',
    'PENDING',
    'sales@company.com',
    'High-value lead. Request assignment to senior sales manager for personalized handling'
FROM leads WHERE email = 'david@builders.com';

INSERT INTO approvals (lead_id, type, status, requested_by, notes)
SELECT 
    id,
    'FOLLOWUP_EMAIL',
    'PENDING',
    'sales@company.com',
    'Request approval to send premium hotel lighting proposal with custom pricing'
FROM leads WHERE email = 'jennifer@hotel.com';

INSERT INTO approvals (lead_id, type, status, requested_by, notes)
SELECT 
    id,
    'CATEGORY_OVERRIDE',
    'PENDING',
    'sales@company.com',
    'Price-only inquiry but large company. Suggest upgrading to WARM for nurturing campaign'
FROM leads WHERE email = 'lisa@consulting.com';

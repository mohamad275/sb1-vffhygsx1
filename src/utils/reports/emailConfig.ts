import { EmailJSConfig } from './types';

// IMPORTANT: These values must match your EmailJS configuration exactly
export const EMAIL_CONFIG: EmailJSConfig = {
  SERVICE_ID: 'service_vay0mfe',
  TEMPLATE_ID: 'template_w9xbb1v', 
  USER_ID: 'UYroOn-Bh4rvA-kwT',
  PRIVATE_KEY: 'zcxaO7A-Zk3Uzs5PWra7N' // Make sure this matches your private key
};

// Template parameters must match your EmailJS template variables exactly
export const EMAIL_TEMPLATE_VARS = {
  to_name: 'المستلم',
  to_email: '{{to_email}}',
  subject: '{{subject}}',
  message: '{{message}}',
  pdf_url: '{{pdf_url}}',
  date: '{{date}}'
};
export interface EmailJSConfig {
  SERVICE_ID: string;
  TEMPLATE_ID: string;
  USER_ID: string;
  PRIVATE_KEY: string;
}

export interface EmailTemplate {
  to_email: string;
  subject: string;
  message: string;
  pdf_content?: string;
  pdf_name?: string;
}
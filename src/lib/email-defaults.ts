/** Default email templates — shown in Admin → Lead alerts until the admin edits them. */
export const EMAIL_DEFAULTS = {
  emailSubjectTpl: 'New {{type}}: {{name}} — {{course}} ({{leadId}})',
  emailHeadingTpl: 'New lead on {{site}} website',
  emailBodyTpl: 'A new {{type}} has come in from the website.\n\n{{details}}\n\nCall or WhatsApp the student as soon as possible.',
  emailFooterTpl: 'Sent automatically by the website. Reply to this email to answer the student.',
  studentReplySubjectTpl: 'Thank you for contacting {{site}} — {{leadId}}',
  studentReplyBodyTpl: 'Hi {{firstName}},\n\nThank you for your enquiry about {{course}}. Our counsellor will call or WhatsApp you on {{phone}} shortly — usually within a few working hours.\n\nYour reference number is {{leadId}}.\n\n[View your enquiry & fees]({{thankYouLink}})\n\nIf you have any questions, just reply to this email or call us on {{sitePhone}}.\n\nWarm regards,\nTeam {{site}}',
  studentReplyCareerBodyTpl: 'Hi {{firstName}},\n\nThank you for applying for {{course}} at {{site}}. We have received your application and CV. Our team will review it and contact you if your profile is shortlisted.\n\nYour reference number is {{leadId}}.\n\nWarm regards,\nTeam {{site}}',
  paymentSubjectTpl: 'Payment received: ₹{{amount}} — {{name}} — {{course}} ({{leadId}})',
  paymentBodyTpl: 'A fee payment has been received on the website.\n\nStudent: {{name}}\nPhone: {{phone}}\nEmail: {{email}}\nCourse: {{course}}\nAmount: ₹{{amount}}\nRazorpay payment ID: {{paymentId}}\n\n[Open lead in admin]({{adminLink}})',
  studentPaymentSubjectTpl: 'Payment received — {{course}} | {{site}}',
  studentPaymentBodyTpl: 'Hi {{firstName}},\n\nWe have received your payment of ₹{{amount}} for {{course}}. Thank you!\n\nPayment ID: {{paymentId}}\nReference: {{leadId}}\n\nOur team will contact you shortly with your batch details.\n\nWarm regards,\nTeam {{site}}',
} as const;

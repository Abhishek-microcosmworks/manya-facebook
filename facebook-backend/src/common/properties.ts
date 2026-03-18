import {
  AdminCSVReportEmailTemplate,
  contactUsQueryConfirmationEmailTemplate,
  EmailVerificationTemplate,
  ForgotPasswordTemplate,
} from './email-templates';

export default {
  development: () => ({
    mongoDBConfig: {
      username: process.env.MONGO_USERNAME,
      password: process.env.MONGO_PASSWORD,
      host: process.env.MONGO_HOST,
      port: parseInt(process.env.MONGO_PORT, 10),
      database: process.env.MONGO_DATABASE,
    },

    accountVerificationEmail: {
      subject: 'Verify Your Email to Complete Registration',
      emailBody:
        'Thank you for signing up with nestjs-starter! To complete your registration, please verify your email address by clicking the link below:',
      fromEmail: process.env.AWS_SES_EMAIL,
      EmailVerificationTemplate,
    },

    forgotPasswordEmail: {
      subject: 'Reset Your Password',
      emailBody:
        'You requested a password reset. Please click the link below to reset your password:',
      fromEmail: process.env.AWS_SES_EMAIL,
      ForgotPasswordTemplate,
    },

    contactUsQueryConfirmationEmail: {
      subject: "We've Received Your Inquiry",
      emailBody:
        'Thank you for reaching out! Our team has received your inquiry and will respond soon.',
      fromEmail: process.env.AWS_SES_EMAIL,
      contactUsQueryConfirmationEmailTemplate,
    },

    BulkRecipesCreationReportEmail: {
      subject: 'Recipes CSV Upload Report',
      emailBody: 'Recipes CSV Upload Report.',
      fromEmail: process.env.AWS_SES_EMAIL,
      AdminCSVReportEmailTemplate,
    },

    BulkDevicesCreationReportEmail: {
      subject: 'Devices CSV Upload Report',
      emailBody: 'Devices CSV Upload Report',
      fromEmail: process.env.AWS_SES_EMAIL,
      AdminCSVReportEmailTemplate,
    },
  }),

  production: () => ({
    mongoDBConfig: {
      username: process.env.MONGO_USERNAME,
      password: process.env.MONGO_PASSWORD,
      host: process.env.MONGO_HOST,
      port: parseInt(process.env.MONGO_PORT, 10),
      database: process.env.MONGO_DATABASE,
    },
  }),
};

# Project Name

## Setup Instructions

### Environment Variables

This project requires a `.env` file to be created in the root directory. Below are the required environment variables:

```ini
SERVER_PORT=
NODE_ENV=
FRONTEND_URL=

MONGO_USERNAME=
MONGO_PASSWORD=
MONGO_HOST=
MONGO_PORT=
MONGO_DATABASE=

REDIS_TYPE=
REDIS_URL=

VERIFICATION_TOKEN_EXPIRY=

JWT_ACCESS_TOKEN_SECRET=
JWT_ACCESS_TOKEN_LIFETIME=
ACCESS_TOKEN_EXPIRY=
JWT_REFRESH_TOKEN_SECRET=
JWT_REFRESH_TOKEN_LIFETIME=
REFRESH_TOKEN_EXPIRY=

AWS_SES_ACCESS_KEY_ID=
AWS_SES_SECRET_ACCESS_KEY=
AWS_SES_REGION=
AWS_SES_EMAIL=

AWS_S3_ACCESS_KEY_ID=
AWS_S3_SECRET_ACCESS_KEY=
AWS_S3_REGION=
AWS_S3_BUCKET_NAME=

APP_ADMIN_MAIL=
APP_ADMIN_NAME=
APP_ADMIN_PASSWORD=
```

### Installation

1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd <repository-name>
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Install NestJS CLI:
   ```sh
   npm install -g @nestjs/cli
   ```
4. Create a `.env` file and add the required variables as shown above.
5. Start the application in development mode:
   ```sh
   npm run start:dev
   ```

### Contributing

Feel free to submit issues or pull requests!

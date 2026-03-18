export const ForgotPasswordTemplate = `<html>
  <head>
    <style>
      body {
        font-family: "Exo", serif;
        font-optical-sizing: auto;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      a {
        color: white;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        border-radius: 10px;
        border: 1px solid #ddd;
        background-color: #387160;
        color: white;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        text-align: center;
        border-bottom: 2px solid #fff;
        padding: 18px;
        display: flex;
        justify-content: flex-start;
        align-items: center;
      }
      .header img {
        width: 169px; /* Adjust the logo size */
        height: 5vh;
      }
      h1 {
        color: white;
        font-size: 24px;
        margin-bottom: 20px;
      }
      .message {
        font-size: 16px;
        color: white;
        margin-bottom: 20px;
      }
      .link-container {
        margin: 20px 0;
        text-align: center;
      }
      .reset-link {
        display: inline-block;
        padding: 10px 20px;
        font-size: 16px;
        color: white;
        background-color: #3f2a66;
        text-decoration: none;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .reset-link:hover {
        background-color: #473073;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        color: white;
        font-size: 14px;
      }
      .main {
        padding: 20px;
      }
    </style>

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Exo:ital,wght@0,100..900;1,100..900&display=swap"
      rel="stylesheet"
    />
  </head>

  <body>
    <div class="container">
      <!-- Header with logo -->
      <div class="header">
        <img src="/nestjs-starter_logo.png" alt="nestjs-starter Logo" class="logo-img" />
      </div>
      <div class="main">
        <h1>Hello, <span style="color: #473073">$$email</span></h1>

        <p class="message">
          We received a request to reset your password for your <strong>Facebook</strong> account. <br />
          Click the button below to reset your password.
        </p>

        <div class="link-container">
          <a href="$$data.link" class="reset-link">Reset Your Password</a>
        </div>

        <p class="message">
          This link is valid for the next <strong>$$timeLeftMessage</strong>. If
          you did not request this email, please disregard it.
        </p>

        <p class="message">If you have any issues, feel free to contact our support team.</p>

        <p class="footer">&copy; ${new Date().getFullYear()} Facebook Team. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>
`;

export const EmailVerificationTemplate = `<html>
  <head>
    <style>
      body {
        font-family: "Exo", serif;
        font-optical-sizing: auto;
        background-color: #ffffff;
        margin: 0;
        padding: 0;
      }
      a {
        color: black;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        border-radius: 10px;
        border: 2px solid black;
        background-color: #ffffff;
        color: black;
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
      }
      h1 {
        color: black;
        font-size: 24px;
        margin-bottom: 20px;
      }
      .message {
        font-size: 16px;
        color: black;
        margin-bottom: 20px;
      }
      .link-container {
        margin: 20px 0;
        text-align: center;
      }
      .verification-link {
        display: inline-block;
        padding: 10px 20px;
        font-size: 16px;
        color: white !important;
        background-color: black;
        text-decoration: none;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }
      .verification-link:hover {
        background-color: #333;
      }
      .footer {
        text-align: center;
        margin-top: 20px;
        color: black;
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
      <div class="main">
        <h1>Hello, <span style="color: black">$$email</span></h1>

        <p class="message">$$message</p>

        <div class="link-container">
          <a href="$$data.link" class="verification-link">Verify Your Email</a>
        </div>

        <p class="message">
          This link is valid for the next <strong>$$timeLeftMessage</strong>. If
          you did not request this email, please disregard it.
        </p>

        <p class="message">Thank you for choosing us!</p>

        <p class="footer">
          &copy; ${new Date().getFullYear()} Facebook Team. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>`;

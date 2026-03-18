export const contactUsQueryConfirmationEmailTemplate = `
<html>
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
        width: 169px;
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
        <h1>Hello, <span style="color: #473073">$$name</span></h1>

        <p class="message">
          Thank you for reaching out to <strong>nestjs-starter</strong>! We have
          received your inquiry and appreciate you taking the time to contact
          us.
        </p>

        <p class="message">
          Our team is currently reviewing your request and will get back to you
          as soon as possible. We strive to respond promptly, usually within
          <strong>24-48 hours</strong>.
        </p>

        <p class="message">
          In the meantime, if you have any urgent questions, feel free to reply
          to this email or visit our support page for more information.
        </p>

        <p class="message">
          We value your time and look forward to assisting you!
        </p>

        <p class="footer">
          &copy; ${new Date().getFullYear()} nestjs-starter Team. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
`;

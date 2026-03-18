export const AdminCSVReportEmailTemplate = `
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
        text-decoration: none;
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
      .report-link {
        display: inline-block;
        padding: 10px 15px;
        background-color: #473073;
        color: white;
        border-radius: 5px;
        font-weight: bold;
        text-align: center;
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
        <h1>Hello, Admin</h1>

        <p class="message">
          Your CSV upload has been processed successfully. However, some records
          could not be created due to errors.
        </p>

        <p class="message">
          To review the details of the failed entries, please check the report
          by clicking the link below:
        </p>

        <p style="text-align: center">
          <a href="$$reportUrl" class="report-link">View Report</a>
        </p>

        <p class="message">
          Please review the report and correct any necessary data before
          re-uploading.
        </p>

        <p class="footer">
          &copy; ${new Date().getFullYear()} nestjs-starter Team. All rights reserved.
        </p>
      </div>
    </div>
  </body>
</html>
`;

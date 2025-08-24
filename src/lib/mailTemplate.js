const mailTemplate = `

<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Verify Your Email</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
      }
      .container {
        max-width: 500px;
        margin: auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      .code {
        font-size: 24px;
        font-weight: bold;
        color: #4a90e2;
        background: #f0f4ff;
        padding: 12px 20px;
        border-radius: 6px;
        display: inline-block;
        margin: 20px 0;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #888;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Email Verification</h2>
      <p>Hi {username},</p>
      <p>Thank you for registering. Please use the following code to verify your email address:</p>
      <div class="code">{verificationCode}</div>
      <p>This code will expire in 24 hours. If you did not create an account, you can safely ignore this email.</p>
      <div class="footer">
        &copy; 2025 Student Buddy. All rights reserved.
      </div>
    </div>
  </body>
</html>



`




const ResetPasswordTemplate = `

  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Password Reset</title>
    <style>
      body {
        background-color: #f4f4f4;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        background-color: #ffffff;
        margin: 40px auto;
        padding: 30px;
        border-radius: 10px;
        box-shadow: 0px 0px 8px rgba(0,0,0,0.1);
      }
      .header {
        text-align: center;
        padding-bottom: 20px;
      }
      .header h1 {
        color: #333;
      }
      .content {
        font-size: 16px;
        line-height: 1.6;
        color: #555;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        margin-top: 25px;
        font-size: 16px;
        color: #fff;
        background-color: #4a90e2;
        border-radius: 5px;
        text-decoration: none;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #999;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        
        <p>We received a request to reset your password for your Student Buddy account.</p>
        <p>Click the button below to reset your password. If you didn't request this, please ignore this email.</p>
       <a href="{resetLink}" class="button">Reset Password</a>

      </div>
      <div class="footer">
        <p>This link is valid for the next 30 minutes.</p>
        <p>Student Buddy Team</p>
      </div>
    </div>
  </body>
  </html>





`


const ResetPasswordSuccessTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Password Reset Successful</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f7fa;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      background: #fff;
      max-width: 600px;
      margin: 40px auto;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
    }
    h1 {
      color: #4CAF50;
    }
    p {
      line-height: 1.6;
    }
    .footer {
      text-align: center;
      font-size: 12px;
      color: #888;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset Successful</h1>
    
    <p>Your password has been successfully reset. You can now log in to your account with your new password.</p>
    <p>If you did not perform this action, please contact our support team immediately.</p>
    <p>Thank you,<br/>Student Buddy Team</p>
    
  </div>
</body>
</html>`
export { mailTemplate, ResetPasswordTemplate, ResetPasswordSuccessTemplate }

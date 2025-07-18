const COMMON_STYLES = `
  /* Reset styles */
  * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  }

  body {
      margin: 0;
      padding: 0;
  }

  /* Custom styles */
  .container {
      max-width: 600px;
      padding: 20px;
  }

  .logo {
      width: auto;
      height: 80px;
  }

  h1 {
      font-weight: bold;
      color: #374151;
      margin-top: 20px;
  }

  .verification-text {
      margin-top: 10px;
      color: #4B5563;
      padding-bottom: 10px;
  }

  .verification-code {
      display: flex;
      justify-content: center;
      margin-top: 10px;
  }

  .verification-code p {
      width: 40px;
      height: 40px;
      text-align: center;
      line-height: 40px;
      font-size: 20px;
      font-weight: bold;
      color: #3B82F6;
      border: 1.5px solid #3B82F6;
      border-radius: 5px;
      margin-right: 10px;
      margin-bottom: 10px;
  }

  .expiration-text {
      margin-top: 10px;
      color: #4B5563;
      line-height: 1.5;
  }

  .regards-text {
      margin-top: 20px;
      color: #4B5563;
      line-height: 1.5;
  }

  .contact-text {
      margin-top: 20px;
      color: #6B7280;
      line-height: 1.5;
  }

  .contact-link {
      color: #3B82F6;
      text-decoration: none;
  }

  .contact-link:hover {
      text-decoration: underline;
  }

  /* Responsive adjustments */
  @media only screen and (max-width: 600px) {
      .container {
          padding: 10px;
      }
      .logo {
          height: 60px;
      }
      .verification-code p {
          font-size: 16px;
          width: 30px;
          height: 30px;
          line-height: 30px;
      }
  }

  button {
      box-sizing: border-box;
      border: 0;
      border-radius: 20px;
      color: #fff;
      padding: 1em 1.8em;
      background: #0269f8;
      display: flex;
      transition: 0.2s background;
      align-items: center;
      gap: 0.6em;
      font-weight: bold;
  }

  button .arrow-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
  }

  button .arrow {
      margin-top: 1px;
      width: 10px;
      background: #0269f8;
      height: 2px;
      position: relative;
      transition: 0.2s;
  }

  button .arrow::before {
      content: "";
      box-sizing: border-box;
      position: absolute;
      border: solid #fff;
      border-width: 0 2px 2px 0;
      display: inline-block;
      top: -3px;
      right: 3px;
      transition: 0.2s;
      padding: 3px;
      transform: rotate(-45deg);
  }

  button:hover {
      background-color: #60a543;
  }

  button:hover .arrow {
      background: #fff;
  }

  button:hover .arrow:before {
      right: 0;
  }

  a {
      text-decoration: none;
  }
`;

const STAFF_NOTIFY_MAIL_TEMPLATE = (name, Student_ID, Student_Name, Request_ID) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Email</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${COMMON_STYLES}</style>
      </head>
<body>
    <div class="container">
    <header>
    <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="" style="width: 300px; height: auto;">
</header>

    
        <main>
            <h1>Respected ${name},</h1> <br>
<p class="verification-text">
We would like to inform you that your email address has been provided by ${Student_Name} during a recent equipment issue request submitted through the Amudalab Equipment Management system.
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Student ID: ${Student_ID}<br>
Request ID: ${Request_ID}<br><br>
This information is being shared for your awareness, as your details have been provided by the student.<br>
If you have any concerns about this request or were not informed by the student, please feel free to contact the lab administration.
</p>
<p class="regards-text">
Best Regards, <br>
The Amuda-lab Team
</p>

        </main>
    
        <footer>
            <p class="contact-text">Should you have any questions or require assistance, please feel free to reach out to our team at <a href="mailto:amudalab2025@gmail.com" class="contact-link">amudalab2025@gmail.com</a></p>
        </footer>
    </div>
</body>
      </html>
    `;
}

const STAFF_ACCEPT_MAIL_TEMPLATE = (name, Student_ID, Student_Name, Request_ID) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Email</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${COMMON_STYLES}</style>
      </head>
<body>
    <div class="container">
    <header>
    <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="" style="width: 300px; height: auto;">
</header>

    
        <main>
            <h1>Respected ${name},</h1> <br>
<p class="verification-text">
This is to inform you that the equipment issue request submitted by ${Student_Name} has been approved through the Amudalab Equipment Management system.
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Student ID: ${Student_ID}<br>
Request ID: ${Request_ID}<br><br>
Your email was provided as part of the request, and this notification is sent for your records and awareness.<br>
If you have any concerns or questions regarding this request, please don’t hesitate to reach out to the lab team.
</p>
<p class="regards-text">
Best Regards, <br>
The Amuda-lab Team
</p>

        </main>
    
        <footer>
            <p class="contact-text">Should you have any questions or require assistance, please feel free to reach out to our team at <a href="mailto:amudalab2025@gmail.com" class="contact-link">amudalab2025@gmail.com</a></p>
        </footer>
    </div>
</body>
      </html>
    `;
}

const STAFF_REJECT_MAIL_TEMPLATE = (name, Student_ID, Student_Name, Request_ID, reason) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Email</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${COMMON_STYLES}</style>
      </head>
<body>
    <div class="container">
    <header>
    <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="" style="width: 300px; height: auto;">
</header>

    
        <main>
            <h1>Respected ${name},</h1> <br>
<p class="verification-text">
We would like to notify you that the equipment issue request submitted by ${Student_Name} has been rejected in the Amudalab Equipment Management system.
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Student ID: ${Student_ID}<br>
Request ID: ${Request_ID}<br>
Reason: ${reason ? reason : "Due to unavailability or conflict with current lab scheduling."}<br><br>
Your email was provided as part of the request, and this notification is sent for your records and awareness.<br>
If you have any concerns or questions regarding this request, please don’t hesitate to reach out to the lab team.
</p>
<p class="regards-text">
Best Regards, <br>
The Amuda-lab Team
</p>

        </main>
    
        <footer>
            <p class="contact-text">Should you have any questions or require assistance, please feel free to reach out to our team at <a href="mailto:amudalab2025@gmail.com" class="contact-link">amudalab2025@gmail.com</a></p>
        </footer>
    </div>
</body>
      </html>
    `;
}

const STAFF_RE_NOTIFY_MAIL_TEMPLATE = (name, Student_ID, Student_Name, Request_ID) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Email</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${COMMON_STYLES}</style>
      </head>
<body>
    <div class="container">
    <header>
    <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="" style="width: 300px; height: auto;">
</header>

    
        <main>
            <h1>Respected ${name},</h1> <br>
<p class="verification-text">
We would like to inform you that ${Student_Name} has submitted a reissue request for the following lab equipment:
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Student ID: ${Student_ID}<br>
Request ID: ${Request_ID}<br>
Your email was provided during the request, and this notification is shared for your awareness.
</p>
<p class="regards-text">
Best Regards, <br>
The Amuda-lab Team
</p>

        </main>
    
        <footer>
            <p class="contact-text">Should you have any questions or require assistance, please feel free to reach out to our team at <a href="mailto:amudalab2025@gmail.com" class="contact-link">amudalab2025@gmail.com</a></p>
        </footer>
    </div>
</body>
      </html>
    `;
}

const STAFF_RE_ACCEPT_MAIL_TEMPLATE = (name, Student_ID, Student_Name, Request_ID) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Email</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${COMMON_STYLES}</style>
      </head>
<body>
    <div class="container">
    <header>
    <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="" style="width: 300px; height: auto;">
</header>

    
        <main>
            <h1>Respected ${name},</h1><br>
<p class="verification-text">
This is to inform you that the reissue request submitted by ${Student_Name} has been approved.
</p>

<p class="expiration-text">
<strong>Request Details</strong><br>
Student ID: ${Student_ID}<br>
Request ID: ${Request_ID}<br>
This update is for your reference, as your email was provided during the student’s request. If you have any concerns or questions regarding this request, please don’t hesitate to reach out to the lab team.
</p>

<p class="regards-text">
Best Regards, <br>
The Amuda-lab Team
</p>

        </main>
    
        <footer>
            <p class="contact-text">Should you have any questions or require assistance, please feel free to reach out to our team at <a href="mailto:amudalab2025@gmail.com" class="contact-link">amudalab2025@gmail.com</a></p>
        </footer>
    </div>
</body>
      </html>
    `;
}

const STAFF_RE_REJECT_MAIL_TEMPLATE = (name, Student_ID, Student_Name, Request_ID, reason) => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <title>Email</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${COMMON_STYLES}</style>
      </head>
<body>
    <div class="container">
    <header>
    <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="" style="width: 300px; height: auto;">
</header>

    
        <main>
            <h1>Respected ${name},</h1><br>
<p class="verification-text">
We would like to inform you that the reissue request submitted by ${Student_Name} has been rejected.
</p>

<p class="expiration-text">
<strong>Request Details</strong><br>
Student ID: ${Student_ID}<br>
Request ID: ${Request_ID}<br>
Reason: ${reason ? reason : "Due to unavailability or conflict with current lab scheduling."}<br><br>

This notification is sent for your awareness, as your email was referenced in the student’s request.
</p>

<p class="regards-text">
Best Regards, <br>
The Amuda-lab Team
</p>

        </main>
    
        <footer>
            <p class="contact-text">Should you have any questions or require assistance, please feel free to reach out to our team at <a href="mailto:amudalab2025@gmail.com" class="contact-link">amudalab2025@gmail.com</a></p>
        </footer>
    </div>
</body>
      </html>
    `;
}

module.exports = {
    STAFF_NOTIFY_MAIL_TEMPLATE,
    STAFF_ACCEPT_MAIL_TEMPLATE,
    STAFF_REJECT_MAIL_TEMPLATE,
    STAFF_RE_NOTIFY_MAIL_TEMPLATE,
    STAFF_RE_ACCEPT_MAIL_TEMPLATE,
    STAFF_RE_REJECT_MAIL_TEMPLATE
};
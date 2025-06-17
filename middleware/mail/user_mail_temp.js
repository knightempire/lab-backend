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

const USER_NOTIFY_MAIL_TEMPLATE = (name, Expected_Duration, Request_Date_Time, Request_ID) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
Thank you! Your equipment/component request has been successfully submitted through the Amudalab Equipment Management system. The lab team will review your request and notify you once it has been processed.
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Request ID: ${Request_ID}<br>
Request Date & Time: ${Request_Date_Time}<br>
Expected Usage Duration: ${Expected_Duration}<br><br>
Please ensure that your email and student ID details are correct, as further communication will be sent to this address. If there is any issue or correction needed, kindly contact the lab staff as soon as possible.
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

const USER_ACCEPT_MAIL_TEMPLATE = (name, date, Admin_Expected_Duration, Admin_Schedule_Date_and_Time, Request_ID) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
Good news! Your equipment issue request on ${date} has been approved.  
You can now collect the equipment from the lab store as per the scheduled time. Please make sure to bring your ID and follow the lab guidelines during the handover.
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Request ID: ${Request_ID}<br>
Expected Usage Duration: ${Admin_Expected_Duration}<br><br>
Collection Date and Time: ${Admin_Schedule_Date_and_Time}
If you have any questions or need assistance, feel free to reach out to the lab staff.
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

const USER_REJECT_MAIL_TEMPLATE = (name, Date, Request_ID, reason) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
We regret to inform you that your request to issue component on ${Date} has been declined.  
<br><br>
Reason: ${reason ? reason : "Due to unavailability or conflict with current lab scheduling."}
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Request ID: ${Request_ID}<br>
You're welcome to submit a new request at a different time or contact the lab staff for alternative options.
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

const USER_REMINDER_MAIL_TEMPLATE = (name, Request_ID, Collected_Date_Time, Return_Date_Time) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
Just a quick reminder from Amuda-lab Equipment Management — the return due date for your borrowed equipment is approaching. Please refer to the request details below to stay in compliance with our regulations.
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Request ID: ${Request_ID}<br>
Issue Date: ${Collected_Date_Time}<br>
Return Due Date: ${Return_Date_Time} – [usually one month after issue]<br><br>
Please make sure to return the equipment by the due date, or submit a renewal request if you still need it. Returning or renewing on time helps us ensure fair access to equipment for everyone.
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

const USER_DELAY_MAIL_TEMPLATE = (name, Request_ID, Request_Date_Time, Issued_Date_Time, Due_Date_Time) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
Our records show that the following equipment issued to you has exceeded the usage period and has not been returned or renewed:
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Request ID: ${Request_ID}<br>
Request Date: ${Request_Date_Time}<br>
Issue Date: ${Issued_Date_Time}<br>
Due Date: ${Due_Date_Time}<br><br>
We kindly request you to take immediate action by either:
<ul>
<li class="expiration-text">Returning the equipment to the lab, or</li>
<li class="expiration-text">Submitting a renewal request if you still need it.</li>
</ul>
</p>
<p class="expiration-text">
Delays in return may affect availability for other users and could lead to restrictions on future equipment usage.
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

const USER_RE_NOTIFY_MAIL_TEMPLATE = (name, Request_ID) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
We’ve received your reissue request. Your request is currently under review. You will receive an update once it is processed.
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Request ID: ${Request_ID}<br><br>
Thank you for using Amudalab Equipment Management.
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

const USER_RE_ACCEPT_MAIL_TEMPLATE = (name, Approved_Date_Time, Request_ID) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
Good news! Your equipment reissue request has been approved.
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Request ID: ${Request_ID}<br>
Updated Due Date: ${Approved_Date_Time}<br><br>
If you have any questions or need assistance, feel free to reach out to the lab staff.
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

const USER_RE_REJECT_MAIL_TEMPLATE = (name, Request_ID, reason) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
We regret to inform you that your request to reissue equipment has been declined.
</p>
<p class="expiration-text">
<strong>Request Details</strong><br>
Request ID: ${Request_ID}<br>
Reason: ${reason ? reason : "Due to unavailability or conflict with current lab scheduling."}<br><br>
You are requested to return the equipment by the original due date to avoid any penalties.
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

const USER_RETURN_MAIL_TEMPLATE = (name, Request_ID, Return_Date_Time) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
We have successfully received the equipment you returned. Thank you for returning it on time and helping us maintain smooth operations at the Amudalab Equipment Management system.
</p>
<p class="expiration-text">
<strong>Return Details</strong><br>
Request ID: ${Request_ID}<br>
Returned On: ${Return_Date_Time}<br>
If you have any further requests or feedback regarding your experience, feel free to reach out to the lab team.
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

const USER_COLLECT_MAIL_TEMPLATE = (name, Request_ID, Collection_Date_Time, New_Due_Date) => {
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
            <img class="logo" src="https://i.ibb.co/kghNV3gy/amuda-lab-temp-img.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
<p class="verification-text">
This is to confirm that you have collected the equipment you requested. Please ensure that the equipment is handled responsibly and returned on or before the updated return date.
</p>
<p class="expiration-text">
<strong>Collection Details</strong><br>
Request ID: ${Request_ID}<br>
Collected On: ${Collection_Date_Time}<br>
Updated Return Due Date: ${New_Due_Date}<br><br>
Please retain this email for your records. If you need an extension, submit a reissue request before the due date.
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
    USER_NOTIFY_MAIL_TEMPLATE,
    USER_ACCEPT_MAIL_TEMPLATE,
    USER_REJECT_MAIL_TEMPLATE,
    USER_REMINDER_MAIL_TEMPLATE,
    USER_DELAY_MAIL_TEMPLATE,
    USER_RE_NOTIFY_MAIL_TEMPLATE,
    USER_RE_ACCEPT_MAIL_TEMPLATE,
    USER_RE_REJECT_MAIL_TEMPLATE,
    USER_RETURN_MAIL_TEMPLATE,
    USER_COLLECT_MAIL_TEMPLATE
};
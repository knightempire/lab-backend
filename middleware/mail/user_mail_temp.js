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

const USER_ACCEPT_MAIL_TEMPLATE = (name, requestDate, dueDate, Request_ID) => {
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
            <img class="logo" src="https://images.ctfassets.net/tyqyfq36jzv2/4LDyHu4fEajllYmI8y5bj7/124bcfb1b6a522326d7d90ac1e3debc8/Linkedin-logo-png.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
            
           <p class="verification-text">Good news! Your equipment issue request on  ${requestDate} has been approved.
You can now collect the equipment from the lab store as per the scheduled time. Please make sure to bring your ID and follow the lab guidelines during the handover.
</p>


     
    
            <p class="expiration-text">
               <strong>Request Details</strong><br>
           Request ID: ${Request_ID}
           <br>
Request Date: ${requestDate} <br>
    Due Date: ${dueDate}<br><br>
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

const USER_REJECT_MAIL_TEMPLATE = (name, requestDate, Request_ID, reason) => {
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
            <img class="logo" src="https://images.ctfassets.net/tyqyfq36jzv2/4LDyHu4fEajllYmI8y5bj7/124bcfb1b6a522326d7d90ac1e3debc8/Linkedin-logo-png.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
            
           <p class="verification-text">We regret to inform you that your request to issue equipments on ${requestDate} has been declined.
<br><br>
Reason : ${reason ? reason : "Due to unavailability or conflict with current lab scheduling."}

</p>


     
    
            <p class="expiration-text">
        <strong>Request Details</strong><br>

           Request ID: ${Request_ID}
           <br>

Request Date: ${requestDate}
<br><br>
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

const USER_REMINDER_MAIL_TEMPLATE = (name, Request_ID, issuedDate, dueDate) => {
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
            <img class="logo" src="https://images.ctfassets.net/tyqyfq36jzv2/4LDyHu4fEajllYmI8y5bj7/124bcfb1b6a522326d7d90ac1e3debc8/Linkedin-logo-png.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
            
           <p class="verification-text">Just a quick reminder from Amudalab Equipment Management — it's been nearly one month since you issued the following equipment:


</p>


     
    
            <p class="expiration-text">
               <strong>Request Details</strong>
<br>
           Request ID: ${Request_ID}
           <br>
Issue Date:  ${issuedDate}
<br>
Return Due Date:   ${dueDate}

<br><br>
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

const USER_DELAY_MAIL_TEMPLATE = (name, Request_ID, issuedDate, dueDate) => {
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
            <img class="logo" src="https://images.ctfassets.net/tyqyfq36jzv2/4LDyHu4fEajllYmI8y5bj7/124bcfb1b6a522326d7d90ac1e3debc8/Linkedin-logo-png.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
            
           <p class="verification-text">Our records show that the following equipment issued to you has exceeded the one-month usage period and has not been returned or renewed:

</p>


     
    
      <p class="expiration-text">
    <strong>Request Details</strong><br>
    Request ID: ${Request_ID}<br>
    Issue Date: ${issuedDate}<br>
    Due Date: ${dueDate}<br><br>

    We kindly request you to take immediate action by either:

    <li class="expiration-text">Returning the equipment to the lab, or</li>
    <li class="expiration-text">Submitting a renewal request if you still need it.</li>

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
            <img class="logo" src="https://images.ctfassets.net/tyqyfq36jzv2/4LDyHu4fEajllYmI8y5bj7/124bcfb1b6a522326d7d90ac1e3debc8/Linkedin-logo-png.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
            
           <p class="verification-text"> We’ve received your reissue request,  Your request is currently under review. You will receive an update once it is processed.

</p>


     
    
            <p class="expiration-text">
               <strong>Request Details</strong><br>
           Request ID: ${Request_ID}
           <br><br>

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

const USER_RE_ACCEPT_MAIL_TEMPLATE = (name, dueDate, Request_ID) => {
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
            <img class="logo" src="https://images.ctfassets.net/tyqyfq36jzv2/4LDyHu4fEajllYmI8y5bj7/124bcfb1b6a522326d7d90ac1e3debc8/Linkedin-logo-png.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
            
           <p class="verification-text"> Good news! Your equipment re-issue request has been approved.
</p>


     
    
            <p class="expiration-text">
               <strong>Request Details</strong><br>
           Request ID: ${Request_ID}
           <br>
    Due Date: ${dueDate}<br><br>
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
            <img class="logo" src="https://images.ctfassets.net/tyqyfq36jzv2/4LDyHu4fEajllYmI8y5bj7/124bcfb1b6a522326d7d90ac1e3debc8/Linkedin-logo-png.png" alt="">
        </header>
    
        <main>
            <h1>Hello ${name},</h1> <br>
            
           <p class="verification-text">We regret to inform you that your request to re-issue equipments  has been declined.


</p>


     
    
            <p class="expiration-text">
        <strong>Request Details</strong><br>

           Request ID: ${Request_ID}
           <br>
Reason : ${reason ? reason : "Due to unavailability or conflict with current lab scheduling."}
<br><br>
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

module.exports = {
    USER_ACCEPT_MAIL_TEMPLATE,
    USER_REJECT_MAIL_TEMPLATE,
    USER_REMINDER_MAIL_TEMPLATE,
    USER_DELAY_MAIL_TEMPLATE,
    USER_RE_NOTIFY_MAIL_TEMPLATE,
    USER_RE_ACCEPT_MAIL_TEMPLATE,
    USER_RE_REJECT_MAIL_TEMPLATE
};
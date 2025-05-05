
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

const TEMPLATE_WELCOME_MAIL = (name, verificationUrl) => {
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
            
            <p class="verification-text">Welcome to Linkedin – your go-to hub for real-time content! Stay updated with trending posts and discussions from across the web, all curated just for you.</p>

            
      
            <div class="verification-code">
                <a href="${verificationUrl}" target="_blank">
                    <button>
                        Verify
                    </button>
                </a>
            </div>
    
            <p class="expiration-text">This verification link will expire in the next 5 minutes. Please do not share this link with anyone for security reasons. It's important to keep your link confidential to prevent unauthorized access to your account.</p>
    
            <p class="regards-text">
                Regards, <br>
                Linkedin <br>
              
            </p>
        </main>
    
        <footer>
            <p class="contact-text">Should you have any questions or require assistance, please feel free to reach out to our team at <a href="mailto:#" class="contact-link">Linkedin.com</a></p>
        </footer>
    </div>
</body>
      </html>
    `;
};

const TEMPLATE_RESET_MAIL = (name, verificationUrl) => {
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
            
             <p class="verification-text">We received a request to reset your password. To get started, please click the button below to reset your password.</p>

            <div class="verification-code">
                <a href="${verificationUrl}" target="_blank">
                    <button>
                        Reset Password
                    </button>
                </a>
            </div>
    
            <p class="expiration-text">This verification link will expire in the next 5 minutes. Please do not share this link with anyone for security reasons. It's important to keep your link confidential to prevent unauthorized access to your account.</p>
    
            <p class="regards-text">
                Regards, <br>
                Linkedin 
          
            </p>
        </main>
    
        <footer>
            <p class="contact-text">Should you have any questions or require assistance, please feel free to reach out to our team at <a href="mailto:#" class="contact-link">Linkedin.com</a></p>
        </footer>
    </div>
</body>
      </html>
    `;
};

  const TEMPLATE_ADMIN_WELCOME_MAIL = (name, verificationUrl) => {
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
            
           <p class="verification-text">Welcome to Linkedin Admin – your command center for managing content, tracking trends, and empowering the platform.</p>


            <div class="verification-code">
                <a href="${verificationUrl}" target="_blank">
                    <button>
                        Reset Password
                    </button>
                </a>
            </div>
    
            <p class="expiration-text">This verification link will expire in the next 5 minutes. Please do not share this link with anyone for security reasons. It's important to keep your link confidential to prevent unauthorized access to your account.</p>
    
            <p class="regards-text">
                Regards, <br>
                Linkedin 
          
            </p>
        </main>
    
        <footer>
            <p class="contact-text">Should you have any questions or require assistance, please feel free to reach out to our team at <a href="mailto:#" class="contact-link">Linkedin.com</a></p>
        </footer>
    </div>
</body>
      </html>
    `;
  };







module.exports ={TEMPLATE_WELCOME_MAIL,TEMPLATE_RESET_MAIL,TEMPLATE_ADMIN_WELCOME_MAIL};
  

document.getElementById('generate-otp').addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const phoneNO = document.getElementById('phoneNO').value;
  const generateOtpButton = document.getElementById('generate-otp');
  const timer = document.getElementById('timer');
  const countdownElement = document.getElementById('countdown');

  if (!email) {
    alert('Please enter your email.');
    return;
  }
  
  if (!phoneNO || !/^\d{10}$/.test(phoneNO)) {
    alert('Please enter a valid 10-digit phone number.');
    return;
  }

  // Generate a random OTP (6 digits)
  const otp = Math.floor(100000 + Math.random() * 900000);

  try {
    // Send email with OTP
    const response = await fetch('/send-otp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp })
    });

    if (response.ok) {
      // Store the OTP temporarily (this is just for the demo, avoid this in production)
      localStorage.setItem('otp', otp);

      alert('OTP sent to your email. Please enter it to proceed.');

      // Show the OTP input and registration button
      document.getElementById('otp').style.display = 'block';
      document.getElementById('register-button').style.display = 'block';

      // Disable the button and start the timer
      generateOtpButton.disabled = true;
      timer.style.display = 'inline';
      let timeLeft = 60;
      countdownElement.textContent = timeLeft;

      const countdownInterval = setInterval(() => {
        timeLeft -= 1;
        countdownElement.textContent = timeLeft;

        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          generateOtpButton.disabled = false;
          timer.style.display = 'none';
        }
      }, 1000);
    } else {
      const responseData = await response.json();
      if (responseData.message === 'User with this email already exists') {
        alert('User with this email already exists. Please use a different email.');
      } else {
        alert(responseData.error || 'Failed to send OTP. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred while sending OTP. Please try again.');
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const age = document.getElementById('age').value;
  const gender = document.getElementById('gender').value;
  const phoneNO = document.getElementById('phoneNO').value;
  const otp = document.getElementById('otp').value;

  // Retrieve the stored OTP (this is just for the demo, avoid this in production)
  const storedOtp = localStorage.getItem('otp');

  if (otp !== storedOtp) {
    alert('Invalid OTP. Please try again.');
    return;
  }

  try {
    // Proceed with registration
    const registrationResponse = await fetch('/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, email, password, age, gender, phoneNO })
    });

    if (registrationResponse.ok) {
      alert('Registration successful.');
      window.location.href = '/login.html'; // Redirect to login page
    } else {
      const registrationData = await registrationResponse.json();
      alert(registrationData.error || 'An error occurred during registration.');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred during registration. Please try again.');
  }
});

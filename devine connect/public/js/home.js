// Get the user icon and the navigation menu
const userIcon = document.getElementById('user');

// Add event listener to detect when the user hovers over the user icon
userIcon.addEventListener('mouseenter', () => {
    // Check if the user is logged in (replace this with your authentication logic)
    const isLoggedIn = true; // For demonstration, assuming the user is logged in

    // Get the container where the user name or login button will be displayed
    const userContainer = document.getElementById('user-container');

    // If the user is logged in, display the user's name
    if (isLoggedIn) {
        const userName = 'John Doe'; // Replace 'John Doe' with the actual user's name
        userContainer.textContent = userName;
    } else {
        // If the user is not logged in, display a login button
        const loginButton = document.createElement('a');
        loginButton.textContent = 'Login';
        loginButton.href = 'login.html'; // Replace 'login.html' with the actual login page URL
        userContainer.innerHTML = ''; // Clear any existing content
        userContainer.appendChild(loginButton);
    }
});

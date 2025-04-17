document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = getCookie('token');
        console.log('FRONT END TOKEN'+token); // Use a function to get cookie value

        if (!token) {
            // If token is not present, redirect to login page
            window.location.href = '/login.html';
            return;
        }
        console.log("token   ="+token);
        const response = await fetch('/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            displayUserProfile(user);
        } else if (response.status === 401) {
            // If unauthorized, redirect to login page
            window.location.href = '/login.html';
        } else {
            const errorData = await response.json();
            alert(errorData.error || 'Failed to fetch user profile');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to fetch user profile');
    }
});

function displayUserProfile(user) {
    const profileInfoDiv = document.getElementById('profile-info');
    profileInfoDiv.innerHTML = `
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Role:</strong> ${user.role}</p>
    `;
}

// Function to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

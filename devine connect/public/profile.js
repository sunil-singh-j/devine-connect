document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = getCookie('token');
        console.log('FRONT END TOKEN: ' + token);

        if (!token) {
            // If token is not present, redirect to login page
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            displayUserProfile(user);
            console.log("User data: ", user);
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
    <div  class="templediv">
        <p><strong>Name:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Age:</strong> ${user.age}</p>
        <p><strong>Gender:</strong> ${user.gender}</p>
        <p><strong>Phone Number:</strong> ${user.phoneNO}</p>
        </div>
        <h3  style="text-align: center;" >Bookings:</h3>
        <div  id="bookingsTableContainer">
        <table class="bookingsTable">
            <thead>
                <tr>
                    <th>Temple Name</th>
                    <th>Event Name</th>
                    <th>Event Description</th>
                    <th>Booking ID</th>
                   
                    <th>Booking Time</th>
                </tr>
            </thead>
            <tbody>
                ${user.bookings.map(booking => `
                    <tr>
                        <td>${booking.temple_name || ''}</td>
                        <td>${booking.event_name || ''}</td>
                        <td>${booking.event_description || ''}</td>
                        <td>${booking.booking_id || ''}</td>
                       
                        <td>${booking.booking_time || ''}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
    `;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Function to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

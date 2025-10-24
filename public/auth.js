

document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const authIconButton = document.getElementById('auth-icon-button');
    const authDropdownMenu = document.getElementById('auth-dropdown-menu');

 
    async function checkAuthStatus() {
        try {
            const response = await fetch('/check-auth');
            const data = await response.json();

            if (data.isAuthenticated) {
               
                updateNavbarLoggedIn(data.userId);
            } else {
                
                updateNavbarLoggedOut();
            }
        } catch (error) {
            console.error('Error checking authentication status:', error);
           
            updateNavbarLoggedOut(); 
        }
    }


    function updateNavbarLoggedOut() {
        
        authIconButton.onclick = () => {
            window.location.href = '/signin.html';
        };
        
       
        authIconButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        `;

        authIconButton.setAttribute('title', 'Sign In');
    }
    
   
    async function updateNavbarLoggedIn(userId) {
       
        const username = userId.substring(0, 4); 
       
        authIconButton.innerHTML = `<span class="text-xl">${username.charAt(0).toUpperCase()}</span>`;
        authIconButton.setAttribute('title', `Logged in as ${username}`);

      
        authIconButton.onclick = () => {
            authDropdownMenu.classList.toggle('hidden');
        };

      
        authDropdownMenu.innerHTML = `
            <div class="px-4 py-3 text-sm text-gray-700 border-b">
                Logged in as: <strong class="text-pink-600">${username}</strong>
            </div>
            <a href="/tracker.html" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                My Tracker
            </a>
            <a href="/logout" class="block px-4 py-2 text-sm text-pink-600 hover:bg-pink-50 font-semibold border-t">
                Logout
            </a>
        `;
        
        
        window.addEventListener('click', (e) => {
            if (!authContainer.contains(e.target)) {
                authDropdownMenu.classList.add('hidden');
            }
        });
    }

  
    checkAuthStatus();
});


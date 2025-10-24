

function loadUserProfile() {
    const profileContainer = document.getElementById('user-profile');
    if (!profileContainer) return;

    fetch('/api/user/profile')
        .then(response => {
            if (response.status === 401) {
                window.location.href = '/signin.html';
                return {}; 
            }
            return response.json();
        })
        .then(data => {
            const dropdown = profileContainer.querySelector('.user-dropdown');
            const usernameDisplay = profileContainer.querySelector('.dropdown-username');

            if (data && data.success) {
                usernameDisplay.textContent = `Hello, ${data.username}`;
                
                profileContainer.addEventListener('click', (event) => {
                    event.stopPropagation(); 
                    dropdown.classList.toggle('visible');
                });

                document.addEventListener('click', (event) => {
                    if (dropdown.classList.contains('visible') && !profileContainer.contains(event.target)) {
                        dropdown.classList.remove('visible');
                    }
                });

            } else {
                profileContainer.innerHTML = '<a class="cta-button" href="/logout">Logout</a>';
            }
        })
        .catch(error => {
            console.error('Error loading user profile:', error);
            profileContainer.innerHTML = '<a class="cta-button" href="/logout">Logout</a>';
        });
}



function initTracker() {
    const saveButton = document.querySelector('.print-btn');
    const habitTable = document.querySelector('.habit-table');
    const monthSelect = document.getElementById('month-select');
    const monthDisplay = document.getElementById('current-month-display');

    let currentMonth = monthSelect.value; 


    function loadTrackerData(monthToLoad) {
        currentMonth = monthToLoad; 

        fetch(`/api/tracker/load/${currentMonth}`)
            .then(response => {
                if (response.status === 401) {
                    alert('Session expired. Please sign in.');
                    window.location.href = '/signin.html';
                    return;
                }
                return response.json();
            })
            .then(data => {
                if (data && data.success && data.progress.length > 0) {
                    applyProgress(data.progress);
                    console.log(`✅ Progress loaded successfully for ${currentMonth}.`);
                } else {
                  
                    applyProgress([]); 
                    console.log(`No saved progress found for ${currentMonth}, starting fresh.`);
                }
            })
            .catch(error => {
                console.error('Error loading tracker data:', error);
            });
    }
    
    function applyProgress(progressData) {
        const allCheckboxes = document.querySelectorAll('.check-box');
        allCheckboxes.forEach(cb => cb.checked = false);

        const rows = habitTable.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const habitName = row.querySelector('td:first-child').textContent.trim();
            const checkboxes = row.querySelectorAll('.check-box');
            
            const savedHabitRecord = progressData.find(item => item.habit === habitName);

            if (savedHabitRecord && Array.isArray(savedHabitRecord.dates)) {
                
                savedHabitRecord.dates.forEach(dayNumber => {
                    const checkboxIndex = dayNumber - 1; 

                    if (checkboxIndex >= 0 && checkboxIndex < checkboxes.length) {
                        checkboxes[checkboxIndex].checked = true;
                    }
                });
            }
        });
    }
    
 
    function collectTrackerData() {
        const data = [];
        const rows = habitTable.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const habitName = row.querySelector('td:first-child').textContent.trim();
            const checkboxes = row.querySelectorAll('.check-box');
            const dates = []; 

            checkboxes.forEach((cb, dayIndex) => {
                if (cb.checked) {
                    dates.push(dayIndex + 1); 
                }
            });
            
            data.push({ habit: habitName, dates: dates });
        });

        return data;
    }

    
    function saveProgress() {
        const progressData = collectTrackerData();
        
        fetch('/api/tracker/save', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ month: currentMonth, progress: progressData }),
        })
        .then(response => {
             if (response.status === 401) {
                alert('Session expired. Please sign in.');
                window.location.href = '/signin.html';
                return;
            }
            return response.json();
        })
        .then(data => {
            if (data && data.success) {
                alert(`Progress saved successfully for ${currentMonth}!`); 
                console.log('✅ Progress saved successfully to database!');
            } else {
                alert('Failed to save progress.');
                console.error('Server save error:', data.message);
            }
        })
        .catch(error => {
            console.error('Error saving data:', error);
            alert('An error occurred during save.');
        });
    }

    
    if (saveButton) {
        saveButton.addEventListener('click', (e) => {
            e.preventDefault(); 
            saveProgress();
        });
    }

    if (monthSelect) {
        monthSelect.addEventListener('change', (e) => {
            const newMonth = e.target.value;
            monthDisplay.textContent = `Monthly Progress: ${newMonth}`;
            loadTrackerData(newMonth);
        });
    }

    loadTrackerData(currentMonth);
}



document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile(); 
    initTracker();
});
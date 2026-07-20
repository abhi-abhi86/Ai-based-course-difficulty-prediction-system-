document.addEventListener('DOMContentLoaded', async () => {
    const searchInput = document.getElementById('course-search');
    const autocompleteList = document.getElementById('autocomplete-list');
    const searchLabel = document.getElementById('search-label');
    
    // Toggles
    const toggleDegrees = document.getElementById('toggle-degrees');
    const toggleOnline = document.getElementById('toggle-online');
    
    const resultContainer = document.getElementById('result-container');
    const loadingState = document.getElementById('loading-state');
    const predictionResult = document.getElementById('prediction-result');
    const resetBtn = document.getElementById('reset-btn');

    // Result Elements
    const resCourseName = document.getElementById('result-course-name');
    const resCourseType = document.getElementById('result-course-type');
    const difficultyBadge = document.getElementById('difficulty-badge');
    const difficultyLevel = document.getElementById('difficulty-level');
    
    // Metric Labels
    const labelDuration = document.getElementById('label-duration');
    const labelSubjects = document.getElementById('label-subjects');
    const labelGraduates = document.getElementById('label-graduates');
    
    const resDuration = document.getElementById('result-duration');
    const resSubjects = document.getElementById('result-subjects');
    const resGraduates = document.getElementById('result-graduates');
    const resFeedback = document.getElementById('result-feedback');

    let courseDatabase = [];
    let currentFilter = 'degrees';

    // Fetch the course database
    try {
        const response = await fetch('courses.json');
        courseDatabase = await response.json();
    } catch (error) {
        console.error("Failed to load course database:", error);
        searchInput.placeholder = "Error loading database...";
        searchInput.disabled = true;
    }

    // Toggle Logic
    const updateSearchContext = () => {
        if (toggleDegrees.checked) {
            currentFilter = 'degrees';
            searchLabel.textContent = "Search for a UG or PG Degree";
            searchInput.placeholder = "e.g., B.Tech, MBA, MBBS...";
        } else {
            currentFilter = 'online';
            searchLabel.textContent = "Search for an Online Course/Certificate";
            searchInput.placeholder = "e.g., Coursera, Google, CS50...";
        }
        // Trigger input event to refresh autocomplete if there's text
        if (searchInput.value) {
            searchInput.dispatchEvent(new Event('input'));
        }
    };

    toggleDegrees.addEventListener('change', updateSearchContext);
    toggleOnline.addEventListener('change', updateSearchContext);

    // Autocomplete Logic
    searchInput.addEventListener('input', function() {
        const val = this.value;
        closeAllLists();
        if (!val) { return false; }

        autocompleteList.classList.remove('hidden');

        // Filter database based on current filter (Degrees vs Online)
        let filteredDB = [];
        if (currentFilter === 'degrees') {
            filteredDB = courseDatabase.filter(c => 
                !c.type.toLowerCase().includes('online') && 
                !c.type.toLowerCase().includes('coursera') && 
                !c.type.toLowerCase().includes('google')
            );
        } else {
            filteredDB = courseDatabase.filter(c => 
                c.type.toLowerCase().includes('online') || 
                c.type.toLowerCase().includes('coursera') || 
                c.type.toLowerCase().includes('google')
            );
        }

        // Find matches
        const matches = filteredDB.filter(course => 
            course.name.toLowerCase().includes(val.toLowerCase()) || 
            course.id.toLowerCase().includes(val.toLowerCase())
        );

        if (matches.length === 0) {
            const noMatch = document.createElement("div");
            noMatch.innerHTML = "<em>No matches found in this category</em>";
            noMatch.style.cursor = "default";
            noMatch.style.color = "rgba(255,255,255,0.5)";
            autocompleteList.appendChild(noMatch);
            return;
        }

        // Limit matches to 20 to prevent massive dropdowns
        const displayMatches = matches.slice(0, 20);

        // Render matches
        displayMatches.forEach(course => {
            const item = document.createElement("div");
            
            // Highlight matching text
            const regex = new RegExp(`(${val})`, "gi");
            const highlightedText = course.name.replace(regex, "<strong>$1</strong>");
            item.innerHTML = highlightedText;
            
            // Add subtle type badge next to name
            item.innerHTML += ` <span style="font-size: 0.75rem; opacity: 0.6; float: right;">${course.type}</span>`;
            
            // Handle selection
            item.addEventListener("click", function() {
                searchInput.value = course.name;
                closeAllLists();
                analyzeCourse(course);
            });
            autocompleteList.appendChild(item);
        });
    });

    // Close dropdown on click outside
    document.addEventListener("click", function (e) {
        if (e.target !== searchInput) {
            closeAllLists();
        }
    });

    function closeAllLists() {
        autocompleteList.innerHTML = "";
        autocompleteList.classList.add('hidden');
    }

    // Analyze and Display Course
    function analyzeCourse(course) {
        // UI Transition to Loading State
        resultContainer.classList.remove('hidden');
        loadingState.classList.remove('hidden');
        predictionResult.classList.add('hidden');
        
        // Disable search and toggles during analysis
        searchInput.disabled = true;
        toggleDegrees.disabled = true;
        toggleOnline.disabled = true;

        // Simulate AI Processing Time (1.5 seconds)
        setTimeout(() => {
            displayResult(course);
        }, 1500);
    }

    function displayResult(course) {
        // Hide loading, show result
        loadingState.classList.add('hidden');
        predictionResult.classList.remove('hidden');

        // Populate Data
        resCourseName.textContent = course.name;
        resCourseType.textContent = course.type;
        
        // Dynamic labels based on course type
        if (course.type.toLowerCase().includes('online')) {
            labelDuration.textContent = "Estimated Time";
            labelSubjects.textContent = "Modules / Courses";
            labelGraduates.textContent = "Enrolled Learners";
        } else {
            labelDuration.textContent = "Duration";
            labelSubjects.textContent = "Subjects per Sem";
            labelGraduates.textContent = "Approx. Yearly Graduates";
        }

        // Badge Logic
        difficultyBadge.className = 'score-badge'; // reset
        difficultyLevel.textContent = course.difficultyLevel;
        
        let cssClass = 'medium';
        if (course.difficultyLevel.toLowerCase().includes('easy')) cssClass = 'easy';
        if (course.difficultyLevel.toLowerCase().includes('hard')) cssClass = 'hard';
        if (course.difficultyLevel.toLowerCase().includes('expert')) cssClass = 'expert';
        difficultyBadge.classList.add(cssClass);
        
        resDuration.textContent = course.duration;
        resSubjects.textContent = course.subjectsPerSem;
        resGraduates.textContent = course.graduatesYearly;
        
        resFeedback.textContent = course.aiAnalysis;
    }

    // Reset Button
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.disabled = false;
        toggleDegrees.disabled = false;
        toggleOnline.disabled = false;
        resultContainer.classList.add('hidden');
        searchInput.focus();
    });
});

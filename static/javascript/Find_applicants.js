const job_title_input = document.getElementById("job_title_id")
const job_description_input = document.getElementById("job_description_id")
const submit_button = document.getElementById("submit_button")





// Set API endpoint
const API_URL = '/upload_applicants';

// Event listener for form submission
verification_Form.addEventListener('submit', function(e) {
    e.preventDefault();

    
    const job_title = job_title_input.value.trim();
    const job_description = job_description_input.value.trim();
    
    // Send question to API
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            job_title: job_title,
            job_description: job_description
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        
        if ( data.response == 'password_error' )
        {
            error_passwords_match.style.display = 'inline'
            console.log(data.response)
        }
        else if ( data.response == 'exist' )
        {
            error_message.style.display = "inline"
            username_input.value = ''
            username_input.blur()
            console.log(data.response)
        }
        else if ( data.response == 'valid' )
        {
            window.location.href = "/Verify_email"
        }
    
    })
    .catch(error => {
        console.error('Error:', error);
        
        const body = document.querySelector("body")
        body.insertAdjacentHTML("beforeend", `<div class="error-panel">
                                            <span>
                                                <h2>Error!</h2>
                                                <p>Something went wrong. Try again.</p>
                                                <div>
                                                    <button>Ok</button>
                                                </div>
                                            </span>
                                        </div>
                                `)
        const error_panel = document.querySelector(".error-panel")

        error_panel.firstElementChild.lastElementChild.firstElementChild.addEventListener("click", () => {
            error_panel.remove()
            window.location.href = "/main_page"
        })
    });
});

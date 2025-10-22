const email_input = document.getElementById("email_id")
const verification_code_input = document.getElementById("verification_code_id")
const error_message = document.getElementById("error_message")
const verification_Form = document.getElementById("verification_form")
const submit_button = document.getElementById("submit_button")

const emailjs = window.emailjs;

submit_button.addEventListener("click", () => {
    error_message.style.display = "none"
})



// Event listener for form submission
verification_Form.addEventListener('submit', function(e) {
    e.preventDefault();

    error_message.style.display = "none"
    
    const email = email_input.value.trim();
    const verification_code = verification_code_input.value.trim();
    
    // Set API endpoint
    const API_URL = '/Verification';

    // Send question to API
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            verification_code: verification_code
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        
        console.log(data.response)
        if ( data.response == 'valid' )
        {
            window.location.href = "/login"
        }
        else if ( data.response == 'expired' )
        {
            error_message.style.display = "inline"
            error_message.innerHTML = "This code is expired, check your email for a new code."
            
            emailjs.send("service_a17lfxf","template_wn7vzdh",{
                message: data.verification_code
            }, "A1mKi6_6NZGOXeTfV")
            .then((result) => {
                console.log("Email sent successfully!", result.text);
            }, (error) => {
                console.log("Failed to send email:", error.text);
                const body = document.querySelector("body")
                body.insertAdjacentHTML("beforeend", `<div class="error-panel">
                                                    <span>
                                                        <h2>Error!</h2>
                                                        <p>Try again Later.</p>
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

            setTimeout(() => {
                window.location.href = "/Verify_email"
            }, 10000)
        }
        else if ( data.response == 'unvalid' )
        {
            error_message.style.display = "inline"
            error_message.innerHTML = "This code is incorrect."
        }
    
    })
    .catch(error => {
        console.error('Error:', error);
        // loadingElement.remove();
        
        // // Add error message
        // addMessage('system', 'Sorry, there was an error processing your question. Please try again.');
    });
});


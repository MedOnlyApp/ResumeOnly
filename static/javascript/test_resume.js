const job_title_input = document.getElementById("job_title_id")
const job_description_input = document.getElementById("job_description_id")
const fileInput = document.getElementById("resumes_input_id")
const submit_button = document.getElementById("submit_input")
const reset_button = document.getElementById("reset_input")
const submit_form = document.getElementById("submit_form")

const upload_resume_div = document.getElementById("upload_resume_div")

const uploaded_resumes_container = document.getElementById("uploaded_resumes_container")


let resumedata

reset_button.addEventListener("click", (e) => {
    e.preventDefault()
    window.location.href = "/analyse_resume"
})

// > Event listener for form submission
submit_form.addEventListener('submit', function(e) {
    e.preventDefault();

    submit_button.disabled = true
    reset_button.disabled = true
    
    const score_panel_id = document.getElementById("score_panel_id")
    const resume_info_div = document.getElementById("resume_info_div")
    
    // > add the loader circle animation
    score_panel_id.insertAdjacentHTML("afterbegin", `<div class="loader" id="loader"></div>`)

    const loader = document.getElementById("loader")

    window.location.href = "#score_panel_id"

    
    const job_title = job_title_input.value.trim();
    const job_description = job_description_input.value.trim();

    
    const formData = new FormData();
    formData.append('resumes', fileInput.files[0]);  // Assuming file input
    formData.append('job_title', job_title);
    formData.append('job_description', job_description);

    const score_paragraph_div = document.getElementById("score_paragraph_div")
    const resume_panel_div = document.getElementById("resume_panel_div")

    // > Set API endpoint
    const API_URL = '/upload_resume'

    fetch(API_URL, {
        method: 'POST',
        body: formData
    })
    .then(async response => {
        const contentType = response.headers.get('content-type');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${errorText}`);
        } else if (contentType && contentType.includes('application/json')) {
            return response.json();
        } else {
            const text = await response.text();
            throw new Error(`Expected JSON, got: ${text}`);
        }
    })
    .then(data => {
        resumedata = data

        // > Remove the loader        
        loader.remove()

      
        // resume_steps_div_id.style.display = "none"
        resume_info_div.style.display = "block"
        
        submit_button.disabled = false
        reset_button.disabled = false

        // > add the score
        if ( data.resume_data["description"] == false )
        {
            score_paragraph_div.children[1].children[0].style.width = "0%"
            score_paragraph_div.children[0].children[1].innerHTML = "0/100"
        }
        else if ( data.resume_data["score"] != null )
        {
            score_paragraph_div.children[1].children[0].style.width = parseInt(String(data.resume_data["score"])) + "%"
            score_paragraph_div.children[0].children[1].innerHTML = parseInt(String(data.resume_data["score"])) + "/100"
        }
        // > Add the name
        resume_panel_div.children[0].children[0].innerHTML = data.resume_data["name"]
        // > Add the picture
        if ( data.resume_data["image"]["image"] != null )
        {
            resume_panel_div.children[0].children[1].children[1].style.display = "inline"
            resume_panel_div.children[0].children[1].children[1].src = `data:image/${data.resume_data["image"]["ext"]};base64,${data.resume_data["image"]["image"]}`
            resume_panel_div.children[0].children[1].children[0].style.display = "none"
        }
        else {
            resume_panel_div.children[0].children[1].children[0].style.display = "block"
            resume_panel_div.children[0].children[1].children[0].innerHTML = data.resume_data["name"][0]
        }
        // > Add the image if it exists
        
        // > Add about section
        resume_panel_div.children[1].children[1].children[1].innerHTML = data.resume_data["paragraphs"]["about"]
        // > Add links
        // >  email //////
        if ( "email" in data.resume_data["links"] )
            resume_panel_div.children[1].children[1].children[2].children[0].href = data.resume_data["links"]["email"]
        else
            resume_panel_div.children[1].children[1].children[2].children[0].style.display = "none"
        // >  phone number //////
        if ( "phone" in data.resume_data["links"] )
            resume_panel_div.children[1].children[1].children[2].children[1].href = data.resume_data["links"]["phone"]
        else
            resume_panel_div.children[1].children[1].children[2].children[1].style.display = "none"
        // >  linkedin //////
        if ( "linkedin" in data.resume_data["links"] )
            resume_panel_div.children[1].children[1].children[2].children[2].href = data.resume_data["links"]["linkedin"]
        else
            resume_panel_div.children[1].children[1].children[2].children[2].style.display = "none"
        // >  github //////
        if ( "linkedin" in data.resume_data["links"] )
            resume_panel_div.children[1].children[1].children[2].children[3].href = data.resume_data["links"]["github"]
        else
            resume_panel_div.children[1].children[1].children[2].children[3].style.display = "none"
        // > Add Skills
        for ( let skill of data.resume_data["skills"])
        {
            resume_panel_div.children[2].children[1].innerHTML += "<span>" + skill + "</span>"
        }
        // > Add Interview Questions
        if ( data.resume_data["interview_questions"] != null )
        {
            resume_panel_div.insertAdjacentHTML("beforeend", 
                                                `<div id="questions_paragraph_div">
                                                    <h3>Interview Questions</h3>
                                                    <div id="questions_div">
                                                        <ul></ul>
                                                    </div>
                                                </div>`)
            for ( let question of data.resume_data["interview_questions"] )
            {
                resume_panel_div.lastElementChild.querySelector("ul").insertAdjacentHTML("beforeend",
                                                                                        `<li style="margin-bottom: 10px; color: green;">${question}</li>`)
            }
        }
    
    })
    .catch(error => {
        const body = document.querySelector("body")
        body.insertAdjacentHTML("beforeend", `<div class="error-panel">
                                            <span>
                                                <h2>Error!</h2>
                                                <p>$Try again Later.</p>
                                                <div>
                                                    <button>Ok</button>
                                                </div>
                                            </span>
                                        </div>
                                `)
        const error_panel = document.querySelector(".error-panel")

        error_panel.firstElementChild.lastElementChild.firstElementChild.addEventListener("click", () => {
            error_panel.remove()
            window.location.href = "/analyse_resume"
        })
    });

});





upload_resume_div.addEventListener("dragover", (e) => {
    e.preventDefault()
    upload_resume_div.classList.add("dragover")
})

upload_resume_div.addEventListener("dragleave", (e) => {
    e.preventDefault()
    upload_resume_div.classList.remove("dragover")
})

upload_resume_div.addEventListener('drop', (e) => {
    e.preventDefault()
    upload_resume_div.classList.remove('dragover')

    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
        fileInput.files = e.dataTransfer.files // Set dropped file to hidden input
        uploaded_resumes_container.innerHTML += '\
        <div class="pdf_file">\
            <div class="name">\
                <img src="../static/img/pdf1.png" alt="pdf">\
                <span></span>\
            </div>\
            <div>\
                <span id="remove_button_id">\
                    <img src="../static/img/close.svg" alt="close">\
                </span>\
            </div>\
        </div>\
'
        const span = document.querySelector('.pdf_file .name span')
        span.textContent = file.name
    }

    const remove_button = document.getElementById("remove_button_id")

    if ( remove_button != null ) {

        remove_button.addEventListener("click", (e) => {
            fileInput.files = null
            uploaded_resumes_container.innerHTML = ""
        })
    }
});

fileInput.addEventListener("input", (e) => {

    if (fileInput.files && fileInput.files[0].type === "application/pdf") {
        // fileInput.files = e.dataTransfer.files // Set dropped file to hidden input
        uploaded_resumes_container.innerHTML += '\
        <div class="pdf_file">\
            <div class="name">\
                <img src="../static/img/pdf1.png" alt="pdf">\
                <span></span>\
            </div>\
            <div>\
                <span id="remove_button_id">\
                    <img src="../static/img/close.svg" alt="close">\
                </span>\
            </div>\
        </div>\
'
        const span = document.querySelector('.pdf_file .name span')
        span.textContent = fileInput.files[0].name
    }

    const remove_button = document.getElementById("remove_button_id")

    if ( remove_button != null ) {

        remove_button.addEventListener("click", (e) => {
            fileInput.files = null
            uploaded_resumes_container.innerHTML = ""
        })
    }

})





window.addEventListener("pageshow", function (event) {
  // 'pageshow' fires even when the page is loaded from cache
  if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
    document.querySelector("form")?.reset()
} else {
    document.querySelector("form")?.reset()
  }

});



const userInfo = document.getElementById("user-info");
// const user_id = userInfo.dataset.user_id;  
// const application_id = userInfo.dataset.application_id;  

// console.log(user_id, application_id);


const publish_porfolio = document.getElementById("publish-portfolio")
const input = document.getElementById("portfolio-input");
const prefix = "ResumeOnly.com/portfolio/";

publish_porfolio.style.pointerEvents = "none"
publish_porfolio.style.backgroundColor = "lightgray"
publish_porfolio.style.borderColor = "black"
publish_porfolio.style.color = "black"

// > Ensure it always starts with prefix
input.addEventListener("input", () => {
    if (!input.value.startsWith(prefix)) {
        input.value = prefix;
        publish_porfolio.style.pointerEvents = "none"
        publish_porfolio.style.backgroundColor = "lightgray"
        publish_porfolio.style.borderColor = "black"
        publish_porfolio.style.color = "black"
    }
    if (input.value == prefix) {
        publish_porfolio.style.pointerEvents = "none"
        publish_porfolio.style.backgroundColor = "lightgray"
        publish_porfolio.style.borderColor = "black"
        publish_porfolio.style.color = "black"
    }
});

// > Keep cursor after prefix
input.addEventListener("keydown", (e) => {
    if (input.selectionStart < prefix.length) {
        // > block editing inside the prefix
        e.preventDefault(); 
        input.setSelectionRange(prefix.length, prefix.length);
    }
    else {
        publish_porfolio.style.pointerEvents = "auto"
        publish_porfolio.style.backgroundColor = ""
        publish_porfolio.style.borderColor = ""
        publish_porfolio.style.color = ""
    }
});





function close_icon_element(element) {
    element.addEventListener("click", () => {

        console.log(element.parentElement.id)
        if ( element.parentElement.id == "about_id" )
        {
            const header_links = document.querySelector(".header-menu").querySelectorAll("li")
            header_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "About" )
                    element.remove()
            })
            const footer_links = document.querySelector("footer").querySelectorAll("li")
            footer_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "About" )
                    element.remove()
            })
        }
        else if ( element.parentElement.id == "experience_id" )
        {
            const header_links = document.querySelector(".header-menu").querySelectorAll("li")
            header_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "Experiences" )
                    element.remove()
            })
            const footer_links = document.querySelector("footer").querySelectorAll("li")
            footer_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "Experiences" )
                    element.remove()
            })
        }
        else if ( element.parentElement.id == "project_id" )
        {
            const header_links = document.querySelector(".header-menu").querySelectorAll("li")
            header_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "Projects" )
                    element.remove()
            })
            const footer_links = document.querySelector("footer").querySelectorAll("li")
            footer_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "Projects" )
                    element.remove()
            })
        }
        else if ( element.parentElement.id == "skills_id" )
        {
            const header_links = document.querySelector(".header-menu").querySelectorAll("li")
            header_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "Skills" )
                    element.remove()
            })
            const footer_links = document.querySelector("footer").querySelectorAll("li")
            footer_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "Skills" )
                    element.remove()
            })
        }
        else if ( element.parentElement.id == "contact_id_2" )
        {
            const header_links = document.querySelector(".header-menu").querySelectorAll("li")
            header_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "Contact Me" )
                    element.remove()
            })
            const footer_links = document.querySelector("footer").querySelectorAll("li")
            footer_links.forEach(element => {
                if ( element.firstElementChild.innerHTML == "Contact" )
                    element.remove()
            })
        }
        
        element.parentElement.remove()
    })

}

function close_element(element) {
    element.style.position = "relative"
    element.style.border = "solid 2px black"
    
    element.insertAdjacentHTML("beforeend", '<span class="material-symbols-outlined close-icon" style="position: absolute; top: 0; right: 0; background-color: white; color: black; border-radius: 0 0 0 5px; cursor: pointer; z-index: 10;">close</span>')
}

function unclose_element(element) {
    element.style.position = ""
    element.style.border = ""

    element.lastElementChild.remove()
    // element.insertAdjacentHTML("beforeend", '<span class="material-symbols-outlined close-icon" style="position: absolute; top: 0; right: 0; background-color: white; color: black; border-radius: 0 0 0 5px; cursor: pointer; z-index: 10;">close</span>')
}

function edit_element(element) {
    element.style.cursor = 'pointer'
    element.addEventListener("dblclick", (e) => {
        element.classList.add("noselect")
        const body = document.getElementById("body")
        body.insertAdjacentHTML("beforeend", `<div class="message-panel">
                                            <span>
                                                <h2>Edit</h2>
                                                <input type="text" value='${element.innerHTML}'>
                                                <div>
                                                    <button>Cancel</button>
                                                    <button>Save</button>
                                                </div>
                                            </span>
                                        </div>
                                `)

        const message_panel = document.querySelector(".message-panel")
        
        message_panel.firstElementChild.lastElementChild.firstElementChild.addEventListener("click", () => {
            message_panel.remove()
        })
        message_panel.firstElementChild.lastElementChild.lastElementChild.addEventListener("click", () => {
            if ( element.tagName.toLowerCase() === "h1" && ( element.parentElement.classList.contains("card-back") || element.parentElement.classList.contains("card-front") ) ) 
            {
                // element.innerHTML = message_panel.firstElementChild.children[1].value
                element.parentElement.parentElement.firstElementChild.lastElementChild.innerHTML = message_panel.firstElementChild.children[1].value
                element.parentElement.parentElement.lastElementChild.firstElementChild.innerHTML = message_panel.firstElementChild.children[1].value
                
            }
            else {
                element.innerHTML = message_panel.firstElementChild.children[1].value
            }
            message_panel.remove()
        })
    })
}

function unedit_element(element) {
    element.style.cursor = ''
    element.addEventListener("dblclick", null)
}














// > Set API endpoint
const API_URL = '/get_portfolio_info'

fetch(API_URL, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        user: ""
    })
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
    console.log(data)

    // > Remove the loader
    const section_element = document.querySelector("section")
    
    section_element.firstElementChild.firstElementChild.remove()

    console.log('Removed the loader')
    
    // > Add The portfolio html
    section_element.firstElementChild.style.display = "block"
    section_element.firstElementChild.insertAdjacentHTML("afterbegin", `                <header>
                    <div>

                        <a href="#" class="name_title text-edit"></a>
                        
                        <ul class="header-menu">
                            <li><a class="text-edit" href="#about_id">About</a></li>
                            <li><a class="text-edit" href="#experience_id">Experiences</a></li>
                            <li><a class="text-edit" href="#project_id">Projects</a></li>
                            <li><a class="text-edit" href="#skills_id">Skills</a></li>
                            <li><a href="#contact_id_2" class="contact_me contact-button text-edit">Contact Me</a></li>
                        </ul>

                    </div>
                    <span class="material-symbols-outlined menu-icon">menu</span>
                </header>

                <main>
                    <div class="closable" id="about_id">
                        <div id="about_header" class="closable">
                            <h1 class="text-edit">Mohamed Rouane</h1>
                            <span class="header-section-decore"></span>
                        </div>
                        <div id="about_body">
                            <div class="closable">
                                <div class="img_div">
                                    <img src="../static/img/portfolio/profile-circle.svg" alt="">
                                    
                                </div>
                            </div>

                            <div class="about-description">
                                <p class="closable text-edit">Data Science</p>
                                <div class="closable">
                                    <div class="closable"><p><span class="text-edit">7+</span> <br> <span class="text-edit">Projects</span></p></div>
                                    <div class="center closable"><p><span class="text-edit">5+</span> <br> <span class="text-edit">Experiences</span></p></div>
                                    <div class="closable"><p><span class="text-edit">1</span> <br> <span class="text-edit">Skills</span></p></div>
                                </div>
                            </div>
                        </div>

                        <div id="contact_id">
                        </div>
                    </div>
                    
                    <div class="closable" id="project_id">
                        <div id="project_header" class="closable">
                            <h1 class="text-edit">My Work</h1>
                            <p class="text-edit">Check out some of my previous work related to my academic path, <br>experiences and projects</p>
                            <span class="header-section-decore"></span>
                        </div>

                        <div id="project_body">
                        
                        </div>
                    </div>
                    
                    <div class="closable" id="experience_id">
                        <div id="experience_header" class="closable">
                            <h1 class="text-edit">Experience & Education</h1>
                            <p class="text-edit">My academic & professional journey.</p>
                            <span class="header-section-decore"></span>
                        </div>
                        
                        <div id="experience_body">
                        
                        </div>
                    </div>
                    
                    <div class="closable" id="skills_id">
                        <div id="skills_header" class="closable">
                            <h1 class="text-edit">Skills & Technologies</h1>
                            <p class="text-edit">A comprehensive overview of my technical expertise and the tools I work with.</p>
                            <span class="header-section-decore"></span>
                        </div>

                        <div id="skills_body">

                        </div>

                        </div>
                    </div>

                    <div class="closable" id="contact_id_2">
                        <div id="contact_header" class="closable">
                            <h1 class="text-edit">Contact Me</h1>
                            <p class="text-edit">Feel free to contact me for anything.</p>
                            <span class="header-section-decore"></span>
                        </div>

                        <div id="contact_body">
                        </div>

                    </div>
                    
                    
                    <button id="arrow_up_id">
                        <span class="material-symbols-outlined">arrow_upward</span>
                    </button>

                </main>

                <footer>
                    <div>
                        <a href="#" class="name_title text-edit">ROUANE</a>
                        <div>
                            <ul>
                                <li><a class="text-edit" href="#about_id">About</a></li>
                                <li><a class="text-edit" href="#experience_id">Experiences</a></li>
                                <li><a class="text-edit" href="#project_id">Projects</a></li>
                                <li><a class="text-edit" href="#skills_id">Skills</a></li>
                                <li><a class="text-edit" href="#contact_id_2">Contact</a></li>
                            </ul>
                        </div>

                        <div id="rights">
                            <img src="../static/img/portfolio/copyright.svg" alt="">
                            <p>2025 ${data.resume_data["name"]}. All rights reserved. Made by <a href="/main_page">ResumeOnly</a></p>
                        </div>
                    </div>
                </footer>
                `)
    console.log('Add The portfolio html')
    

    const name_title = document.querySelectorAll(".name_title")
    const about_id = document.getElementById("about_id")
    const skills_id = document.getElementById("skills_id")
    const project_id = document.getElementById("project_id")
    const experience_id = document.getElementById("experience_id")
    const contact_id = document.getElementById("contact_id")
    const contact_id_2 = document.getElementById("contact_id_2")
    const rights = document.getElementById("rights")

    // > Website name
    name_title.forEach((element) => {
        element.innerHTML = data.resume_data["name"].split(" ")[1]
    })
    console.log('Website Name')

    // > About

    about_id.children[0].children[0].innerHTML = data.resume_data["name"]
    about_id.children[1].children[1].children[0].innerHTML = data.resume_data['paragraphs']['about']

    if ( data.resume_data["image"]["image"] != null )
    {
        about_id.children[1].children[0].children[0].children[0].src = `data:image/${data.resume_data["image"]["ext"]};base64,${data.resume_data["image"]["image"]}`
    }
    else {
        about_id.children[1].children[0].children[0].children[0].innerHTML += data.resume_data["name"][0]
        about_id.children[1].children[0].children[0].style.fontSize = "50px"
    }

    about_id.children[1].lastElementChild.lastElementChild.firstElementChild.firstElementChild.firstElementChild.innerHTML = `${Object.keys(data.resume_data["paragraphs"]["projects"]).length}+`
    about_id.children[1].lastElementChild.lastElementChild.children[1].firstElementChild.firstElementChild.innerHTML = `${Object.keys(data.resume_data["paragraphs"]["experiences"]).length}+`
    about_id.children[1].lastElementChild.lastElementChild.lastElementChild.firstElementChild.firstElementChild.innerHTML = `${data.resume_data["skills"].length}+`
    
    console.log('about')

    // > Projects
    if ( data.resume_data["paragraphs"] != null )
        if ( "projects" in data.resume_data["paragraphs"] ) 
        {
            for (const key in data.resume_data["paragraphs"]["projects"]) {

                project_id.lastElementChild.innerHTML += `<div class="card-container closable">
                                <div class="card">
                                    <div class="card-front">
                                        <img src="../static/img/portfolio/project2.jpg" alt="">
                                        <h1 class="text-edit">${data.resume_data["paragraphs"]["projects"][key]["name"]}</h1>
                                    </div>
                                    <div class="card-back">
                                        <h1 class="text-edit">${data.resume_data["paragraphs"]["projects"][key]["name"]}</h1>
                                        <p class="text-edit">${data.resume_data["paragraphs"]["projects"][key]["text"]}</p>
                                        <div>
                                            <div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`
                
                if ( "skills" in data.resume_data["paragraphs"]["projects"][key] && data.resume_data["paragraphs"]["projects"][key]["skills"] != null ) {
                    for ( const skill of data.resume_data["paragraphs"]["projects"][key]["skills"] ) {       
                        project_id.lastElementChild.lastElementChild.children[0].lastElementChild.lastElementChild.firstElementChild.innerHTML += `<span class="closable"><span class="text-edit">${skill}</span></span>`
                    }
                }

            }

        }

    console.log('project')

    // > Skills

    if ( data.resume_data["skill_categories"] != null ) {

        for (const key in data.resume_data["skill_categories"]) {
            
            skills_id.children[1].insertAdjacentHTML("beforeend", `<div class="closable">
                                    <div class="skills_title">
                                        <h2 class="text-edit">${key}</h2>
                                    </div>
                                    <div class="skills">
                                    </div>
                                </div>
                                `)
            // skills_id.children[-1].children[0].children[0].innerHTML = key
            
            for ( const skill of data.resume_data["skill_categories"][key] )
            {       
                skills_id.children[1].lastElementChild.children[1].insertAdjacentHTML("beforeend", `<div class="closable"><span class="text-edit">${skill}</span></div>`)
            }
        }
    }

    console.log('skills')

    // > Experiences

    if ( data.resume_data["paragraphs"] != null )
        if ( "experiences" in data.resume_data["paragraphs"] ) {
            experience_id.lastElementChild.insertAdjacentHTML("beforeend", `<span></span>`)
            console.log("experience 1")
            for (const key in data.resume_data["paragraphs"]["experiences"]) {
                experience_id.lastElementChild.insertAdjacentHTML("beforeend", `<div class="closable"><div></div></div>`)
                
                if (data.resume_data["paragraphs"]["experiences"][key]["date"] != null)
                    experience_id.lastElementChild.lastElementChild.firstElementChild.insertAdjacentHTML("beforeend", `<span class="experience_time closable text-edit">${data.resume_data["paragraphs"]["experiences"][key]["date"]}</span>`)
                if (data.resume_data["paragraphs"]["experiences"][key]["location"] != null)
                    experience_id.lastElementChild.lastElementChild.firstElementChild.insertAdjacentHTML("beforeend", `
                                            <div class="closable">
                                                <span class="material-symbols-outlined location_icon">location_on</span>
                                                <span class="location text-edit">${data.resume_data["paragraphs"]["experiences"][key]["location"]}</span>
                                            </div>
                                            `)
                // experience_id.lastElementChild.innerHTML += `</div>`

                if (data.resume_data["paragraphs"]["experiences"][key]["name"] != null)
                    experience_id.lastElementChild.lastElementChild.insertAdjacentHTML("beforeend", `<h2 class="text-edit">${data.resume_data["paragraphs"]["experiences"][key]["name"]}</h2>`)

                if (data.resume_data["paragraphs"]["experiences"][key]["institution"] != null)
                    experience_id.lastElementChild.lastElementChild.insertAdjacentHTML("beforeend", `<span class="experience_org text-edit">${data.resume_data["paragraphs"]["experiences"][key]["institution"]}</span>`)

                if (data.resume_data["paragraphs"]["experiences"][key]["text"] != null)
                    experience_id.lastElementChild.lastElementChild.insertAdjacentHTML("beforeend", `<p class="text-edit">${data.resume_data["paragraphs"]["experiences"][key]["text"]}</p>`)
                    
                experience_id.lastElementChild.insertAdjacentHTML("beforeend", `<span></span>`)
            }

        }

    console.log('experience')

    // > Contact 
    
    if ( data.resume_data["email"] != null && ( data.resume_data["links"] == {} || data.resume_data["links"] == null ) )
        contact_id.style.display = 'none'
    else {
        if ( data.resume_data["email"] != null )
            contact_id.insertAdjacentHTML("beforeend", `<a target="_blank" href="mailto:${data.resume_data["email"]}">
                                    <img src="../static/img/portfolio/email.svg" alt="">
                                    <span class="contact-type text-edit">Email</span>
                                </a>`)

        if ( "linkedin" in data.resume_data["links"] )
            contact_id.insertAdjacentHTML("beforeend", `<a target="_blank" href="${data.resume_data["links"]["linkedin"]}">
                                    <img src="../static/img/portfolio/linkedin.svg" alt="">
                                    <span class="contact-type text-edit">Linkedin</span>
                                </a>`)

        if ( "github" in data.resume_data["links"] )
            contact_id.insertAdjacentHTML("beforeend", `<a target="_blank" href="${data.resume_data["links"]["github"]}">
                                    <img src="../static/img/portfolio/github.svg" alt="">
                                    <span class="contact-type text-edit">Github</span>
                                </a>`)
        
        initButtons()

    }

    console.log('contact')

    // > Contact 2
    
    if ( data.resume_data["email"] != null && data.resume_data["phone"] == null )
        contact_id_2.style.display = 'none'
    else {
        if ( data.resume_data["email"] != null )
            contact_id_2.lastElementChild.insertAdjacentHTML("beforeend", `<div class="closable">
                                    <img src="../static/img/email.svg" alt="">
                                    <span class="text-edit">${data.resume_data["email"]}</span>
                                </div>`)


        if ( data.resume_data["phone"] != null )
            contact_id_2.lastElementChild.insertAdjacentHTML("beforeend", `<div class="closable">
                                    <img src="../static/img/phone.svg" alt="">
                                    <span class="text-edit">${data.resume_data["phone"]}</span>
                                </div>`)
        
        
    }

    console.log('contact 2')

    // > Code for edit button

    const publish_porfolio = document.getElementById("publish-portfolio")
    const edit_porfolio = document.getElementById("edit-portfolio")
    const save_porfolio = document.getElementById("save-portfolio")



    edit_porfolio.addEventListener("click", () => {
        edit_porfolio.style.display = "none"
        save_porfolio.style.display = "flex"

        const a_elements = document.querySelectorAll("a")
        a_elements.forEach(element => {
            element.addEventListener("click", (e) => {
                e.preventDefault()
            })
        })

        const closable_elements = document.querySelectorAll(".closable")
        
        closable_elements.forEach(element => {
            close_element(element)
        })
        
        const close_buttons = document.querySelectorAll(".close-icon")
        
        close_buttons.forEach(element => {
            close_icon_element(element)
        })


        const text_edit = document.querySelectorAll(".text-edit")
        
        text_edit.forEach(element => {
            edit_element(element)
        })

        const img_div = document.querySelector(".img_div")
        img_div.insertAdjacentHTML("beforeend", `<input type="file" accept=".png, .jpg, .jpeg" style="display: none;">`)
        img_div.firstElementChild.addEventListener("click", () => {
            img_div.lastElementChild.click()
        })

        img_div.lastElementChild.addEventListener("click", () => {
            const file = img_div.lastElementChild.files[0]
            if (file) {
                try {
                    const imgURL = URL.createObjectURL(file)
                    img_div.firstElementChild.src = imgURL
                } catch (error) {
                    console.error("Something went wrong:", error.message);
                }
            }
        })

        function add_skill_to_project(element) {
            element.addEventListener("click", () => {
                const body = document.getElementById("body")
                body.insertAdjacentHTML("beforeend", `<div class="message-panel">
                                                    <span>
                                                        <h2>Add Skill</h2>
                                                        <input type="text">
                                                        <div>
                                                            <button>Cancel</button>
                                                            <button>Add</button>
                                                        </div>
                                                    </span>
                                                </div>
                                        `)
                const message_panel = document.querySelector(".message-panel")

                message_panel.firstElementChild.lastElementChild.firstElementChild.addEventListener("click", () => {
                    message_panel.remove()
                })
                message_panel.firstElementChild.lastElementChild.lastElementChild.addEventListener("click", () => {
                    element.insertAdjacentHTML("beforebegin", `<span class="closable"><span class="text-edit">${message_panel.firstElementChild.children[1].value}</span></span>`)
                    message_panel.remove()

                    close_element(element.previousElementSibling)
                    close_icon_element(element.previousElementSibling.lastElementChild)
                    edit_element(element.previousElementSibling.firstElementChild)
                })
            })
        }

        function add_skill_to_categorie(element) {
            element.addEventListener("click", () => {
                const body = document.getElementById("body")
                body.insertAdjacentHTML("beforeend", `<div class="message-panel">
                                                    <span>
                                                        <h2>Add a Skill</h2>
                                                        <input type="text">
                                                        <div>
                                                            <button>Cancel</button>
                                                            <button>Add</button>
                                                        </div>
                                                    </span>
                                                </div>
                                        `)
                const message_panel = document.querySelector(".message-panel")

                message_panel.firstElementChild.lastElementChild.firstElementChild.addEventListener("click", () => {
                    message_panel.remove()
                })

                message_panel.firstElementChild.lastElementChild.lastElementChild.addEventListener("click", () => {
                
                    element.parentElement.insertAdjacentHTML("beforebegin", `
                                                                                <div class="closable">
                                                                                    <span>${message_panel.querySelector("input").value}</span>
                                                                                </div>
                                                                                `)
                    message_panel.remove()
                    close_element(element.parentElement.previousElementSibling)
                    close_icon_element(element.parentElement.previousElementSibling.lastElementChild)
                    edit_element(element.parentElement.previousElementSibling.firstElementChild)
                })

            })

        }



        // > Add a project

        const project_id = document.getElementById("project_id")

        project_id.children[1].insertAdjacentHTML("beforeend", '<div class="card-container" style="background-color: white; border: solid 2px black;"><span class="material-symbols-outlined add-project" style="display: flex; align-items: center; justify-content: center; font-size: 70px; width: 100%; height: 100%;">add</span></div>')
        
        const add_project = document.querySelector(".add-project")
        
        add_project.addEventListener("click", () => {
            const body = document.getElementById("body")
            body.insertAdjacentHTML("beforeend", `<div class="message-panel">
                                                <span>
                                                    <h2>Add Project</h2>
                                                    <h4>Project Title :</h4>
                                                    <input type="text">
                                                    <h4>Project Description :</h4>
                                                    <textarea name="" id=""></textarea>
                                                    <div>
                                                        <button>Cancel</button>
                                                        <button>Add</button>
                                                    </div>
                                                </span>
                                            </div>
                                    `)
            const message_panel = document.querySelector(".message-panel")

            message_panel.firstElementChild.lastElementChild.firstElementChild.addEventListener("click", () => {
                message_panel.remove()
            })
            
            message_panel.firstElementChild.lastElementChild.lastElementChild.addEventListener("click", () => {
            
                project_id.children[1].lastElementChild.insertAdjacentHTML("beforebegin", `<div class="card-container closable">
                                <div class="card">
                                    <div class="card-front">
                                        <img src="../static/img/portfolio/project2.jpg" alt="">
                                        <h1 class="text-edit">${message_panel.firstElementChild.children[2].value}</h1>
                                    </div>
                                    <div class="card-back">
                                        <h1 class="text-edit">${message_panel.firstElementChild.children[2].value}</h1>
                                        <p class="text-edit">${message_panel.firstElementChild.children[4].value}</p>
                                        <div>
                                            <div>
                                                <span class="material-symbols-outlined add-project-skill" style="display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;">add</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`)
                add_skill_to_project(project_id.children[1].lastElementChild.previousElementSibling.querySelector(".add-project-skill"))
                
                close_element(project_id.children[1].lastElementChild.previousElementSibling)
                close_icon_element(project_id.children[1].lastElementChild.previousElementSibling.lastElementChild)
                edit_element(project_id.children[1].lastElementChild.previousElementSibling.firstElementChild.firstElementChild.lastElementChild)
                edit_element(project_id.children[1].lastElementChild.previousElementSibling.firstElementChild.lastElementChild.firstElementChild)
                edit_element(project_id.children[1].lastElementChild.previousElementSibling.firstElementChild.lastElementChild.children[1])
                message_panel.remove()
            })

        })


        // > Add Skills to card-back on project

        const card_backs = document.querySelectorAll(".card-back")
        
        card_backs.forEach(element => {
            element.lastElementChild.firstElementChild.insertAdjacentHTML("beforeend", '<span class="material-symbols-outlined add-project-skill" style="display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer;">add</span>')
        })
        
        const add_project_skill_buttons = document.querySelectorAll(".add-project-skill")
        add_project_skill_buttons.forEach(element => {
            add_skill_to_project(element)
        })

        // > Add Skills to skills panel

        const skills_id = document.getElementById("skills_id")
        skills_id.children[1].insertAdjacentHTML("beforeend", `<div style="background-color: white; border: solid 2px black;">
                                                <span class="material-symbols-outlined add-skill-categorie" style="display: flex; align-items: center; justify-content: center; font-size: 70px; width: 100%; height: 100%; cursor: pointer">add</span>
                                            </div>`)

        const add_skill_categorie = skills_id.querySelector(".add-skill-categorie")
        add_skill_categorie.addEventListener("click", () => {
            const body = document.getElementById("body")
            body.insertAdjacentHTML("beforeend", `<div class="message-panel">
                                                <span>
                                                    <h2>Add Skill Categorie</h2>
                                                    <input type="text">
                                                    <div>
                                                        <button>Cancel</button>
                                                        <button>Add</button>
                                                    </div>
                                                </span>
                                            </div>
                                    `)
            const message_panel = document.querySelector(".message-panel")

            message_panel.firstElementChild.lastElementChild.firstElementChild.addEventListener("click", () => {
                message_panel.remove()
            })
            
            message_panel.firstElementChild.lastElementChild.lastElementChild.addEventListener("click", () => {
            
                skills_id.children[1].lastElementChild.insertAdjacentHTML("beforebegin", `<div class="closable">
                                                                        <div class="skills_title">
                                                                            <h2 class="text-edit">${message_panel.querySelector("input").value}</h2>
                                                                        </div>
                                                                        <div class="skills">
                                                                            <div style="background-color: white; border: solid 2px black;">
                                                                                <span class="material-symbols-outlined add-skill-to-categorie" style="display: flex; align-items: center; justify-content: center; font-size: 70px; width: 100%; height: 100%; color: black; cursor: pointer;">add</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                `)
                close_element(skills_id.children[1].lastElementChild.previousElementSibling)
                close_icon_element(skills_id.children[1].lastElementChild.previousElementSibling.lastElementChild)
                edit_element(skills_id.children[1].lastElementChild.previousElementSibling.firstElementChild.firstElementChild)
                message_panel.remove()

                const add_skill_button = skills_id.children[1].lastElementChild.previousElementSibling.querySelector(".add-skill-to-categorie")
                add_skill_to_categorie(add_skill_button)
            })

        })

        skills_id.children[1].querySelectorAll(".skills").forEach(element => {
            element.insertAdjacentHTML("beforeend", `<div style="background-color: white; border: solid 2px black;">
                                                            <span class="material-symbols-outlined add-skill-to-categorie" style="display: flex; align-items: center; justify-content: center; font-size: 70px; width: 100%; height: 100%; color: black; cursor: pointer;">add</span>
                                                        </div>
                                                            `)
            add_skill_to_categorie(element.lastElementChild.firstElementChild)
        })
    })

    save_porfolio.addEventListener("click", () => {
        save_porfolio.style.display = "none"
        edit_porfolio.style.display = "flex"

        const a_elements = document.querySelectorAll("a")
        a_elements.forEach(element => {
            element.addEventListener("click", (e) => {
                // e.preventDefault()
                element.href = element.href
            })
        })

        const closable_elements = document.querySelectorAll(".closable")
        
        closable_elements.forEach(element => {
            unclose_element(element)
        })
        
        const text_edit = document.querySelectorAll(".text-edit")
        
        text_edit.forEach(element => {
            unedit_element(element)
        })

        console.log("did you see this")

        try {
            const img_div = document.querySelector(".img_div")
            img_div.querySelector("input").remove()
        } catch (error) {
            console.error("Something went wrong:", error.message);
        }
        
    })

    publish_porfolio.addEventListener("click", () => {

        fetch("/check_portfolio_name", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                portfolio_name: publish_porfolio.parentElement.firstElementChild.value.substring(25)
            })
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

            if ( data.response == "exist" )
            {
                console.log("port/ exist")
            }
            else {
                fetch("/save_portfolio", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: publish_porfolio.parentElement.firstElementChild.value.substring(25),
                        portfolio: document.querySelector("section").firstElementChild.innerHTML
                    })
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
                    console.log("port/")
                    window.location.href = `/portfolio/${publish_porfolio.parentElement.firstElementChild.value.substring(25)}`
                })
                .catch(error => {
                    console.error('Error:', error.message);
                    const body = document.querySelector("body")
                    body.insertAdjacentHTML("beforeend", `<div class="error-panel">
                                                        <span>
                                                            <h2>Error!</h2>
                                                            <p>${error.message}. Try again.</p>
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

            }

        })
        .catch(error => {
            console.error('Error:', error.message);
            const body = document.querySelector("body")
            body.insertAdjacentHTML("beforeend", `<div class="error-panel">
                                                <span>
                                                    <h2>Error!</h2>
                                                    <p>${error.message}. Try again.</p>
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


    })



})
.catch(error => {
    console.error('Error:', error.message);
    const body = document.querySelector("body")
    body.insertAdjacentHTML("beforeend", `<div class="error-panel">
                                        <span>
                                            <h2>Error!</h2>
                                            <p>${error.message}. Try again.</p>
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





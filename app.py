from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from database import database
import uuid
import random
import smtplib
import os
import backend
import base64
import time
import json
import json5
import secrets

# code = f"{secrets.randbelow(1_000_000):06d}"
# print(code)


app = Flask(__name__)
UPLOAD_FOLDER = 'uploads/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.secret_key = "moh"

@app.route('/')
def index():
    """Render the main page"""
    session["user_id"] = None
    # return render_template('index.html')
    return render_template('main_page.html')

@app.route("/portfolio/<username>")
def portfolio_site(username):
    # Here you can query a database or dictionary to fetch user portfolio data
    # Example: return a portfolio page with the given username
    portfolio = database.get_portfolio(username)["portfolio"]
    print(portfolio)
    return render_template("portfolio_site.html", username=username, portfolio=portfolio)

@app.route('/login')
def login():
    """Render the login page"""
    return render_template('Login.html')

@app.route('/register')
def Register():
    """Render the registration page"""
    return render_template('Register.html')

@app.route('/login_form', methods=["POST"])
def login_form():
    """check the login information"""
    session['user_id'] = None
    data = request.json
    email = data.get("email", '')
    password = data.get("password", '')
    # print(f"email : {email} | password : {password}")

    response = database.check_login_info(email=email, password=password)
    
    if response == "user not found" or response == "password incorrect" or response == "unverified":
        return jsonify({
            'response': response,
            'user_id': None
        })
    else:
        # > login session
        session["user_id"] = response
        return jsonify({
            'response': "valid",
            'user_id': session["user_id"]
        })

@app.route('/register_form', methods=["POST"])
def register_form():
    """check the register information"""
    
    data = request.json
    client_name = data.get("client_name", '')
    username = data.get("username", '')
    email = data.get("email", '')
    password = data.get("password", '')
    password_confirm = data.get("password_confirm", '')
    print(f"email : {email} | password : {password}")

    verification_code = f"{secrets.randbelow(1_000_000):06d}"
    
    if password != password_confirm:
        return jsonify({
            'response': "password_error"
        })
    
    response = database.check_registration_info(email=email, password=password)
    
    if response == 'valid':
        database.add_user(str(uuid.uuid4()), client_name, username, email, password, "", None, verification_code)
        response = 'unverified'

    if response == 'unverified':
        return jsonify({
            'response': response,
            'verification_code': verification_code
        })

    return jsonify({
        'response': response
    })

@app.route('/Verify_email')
def Verify_email():
    """Render the verification page"""
    return render_template('Verify_email.html')

@app.route('/Verification', methods=["POST"])
def Verification():
    """verify the email"""

    data = request.json
    email = data.get("email", '')
    verification_code = data.get("verification_code", '')
    new_verification_code = f"{secrets.randbelow(1_000_000):06d}"
    
    response = database.check_verification_code(email, verification_code, new_verification_code)
    return jsonify({
        'response': response,
        'verification_code': new_verification_code
    })

@app.route('/main_page')
def main_page():
    """Render the main page"""
    user_id=session.get('user_id')
    # print("user_ID  = ",user_id)
    return render_template('main_page.html', user_id=user_id)

@app.route('/analyse_resume')
def analyse_resume():
    """Render the resume page"""
    user_id=session.get('user_id')
    # print(user_id)
    if user_id is None:
        return redirect(url_for('login'))
    
    return render_template('Test_Resume.html', user_id=user_id)

@app.route('/analyse_applicants')
def analyse_applicants():
    """Render the applicants page"""
    user_id=session.get('user_id')
    return render_template('Find_top_applicants.html', user_id=user_id)

@app.route('/upload_resume', methods=["POST"])
def upload_resume(): 
    """Analyse resume"""
    print(request.files)
    if 'resumes' not in request.files:
        return 'No files part in the request'
    
    file = request.files['resumes']
    
    if file and file.filename != '':
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file_binary = file.read()
        # file.save(filepath)
    
    data = request.form
    job_title = data.get("job_title", '')
    job_description = data.get("job_description", '')
    # print(f"job_title : {job_title} | job_description : {job_description}")

    obj = backend.ExtractData(file_binary, job_description, job_title)
    resume_data = obj.get_resume_data()
    job_data = obj.get_job_data()
    print(resume_data)
    application_id = int(time.time() * 1000)
    session["application_id"] = application_id
    database.add_application(client_id=session["user_id"],
                             applications_id=application_id,
                             job_title=job_title,
                             resume_name=file.filename,
                             resume_file=file_binary,
                             resume_text=resume_data["text"],
                             job_desctiption=job_description,
                             score=resume_data["score"],
                             resume_info=json5.dumps(resume_data)
                             )
    
    if resume_data["image"]["image"] != None:
        if isinstance(resume_data["image"]["image"], bytes):
            resume_data["image"]["image"] = base64.b64encode(resume_data["image"]["image"]).decode('utf-8')

    return jsonify({
        'resume_data': resume_data,
        'job_data': job_data
    })

@app.route('/upload_applicants', methods=["POST"])
def upload_applicants(): 
    """Analyse applicants"""
    print(request.files)
    if 'resumes[]' not in request.files:
        return 'No files part in the request'
    
    files = request.files.getlist('resumes[]')
    
    for file in files:
        if file and file.filename != '':
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
            # file.save(filepath)
    
    data = request.form
    job_title = data.get("job_title", '')
    job_description = data.get("job_description", '')
    # print(f"job_title : {job_title} | job_description : {job_description}")

    return jsonify({
        'response': 'Files uploaded successfully!'
    })

@app.route('/portfolio')
def portfolio():
    """Render the portfolio page"""
    user_id=session.get('user_id')
    print("user_ID  = ",user_id)

    return render_template("portfolio.html", user_id=user_id, application_id=session.get("application_id"))

@app.route('/get_portfolio_info', methods=["POST"])
def get_portfolio_info():
    """Get the resume info for the portfolio page"""
    # data = request.json
    # email = data.get("email", '')

    # resume_data = database.get_application(session.get("user_id"), session.get("application_id"))
    resume_data = json5.loads(database.get_application(session.get("user_id"), session.get("application_id"))["resume_info"])
    print(resume_data)
    return jsonify({
        "resume_data": resume_data
    })

@app.route('/save_portfolio', methods=["POST"])
def save_portfolio():
    """Get the resume info for the portfolio page"""
    data = request.json
    username = data.get("username", '')
    portfolio = data.get("portfolio", '')

    database.add_portfolio(session.get("user_id"), username, portfolio)

    return jsonify({
        "save": True
    })

@app.route('/check_portfolio_name', methods=["POST"])
def check_portfolio_name():
    """Get the resume info for the portfolio page"""
    data = request.json
    username = data.get("portfolio_name", '')

    answer = database.check_portfolio_name(username)

    return jsonify({
        "response": answer
    })

@app.route('/account')
def account():
    """Render the account page"""
    user_id=session.get('user_id')
    print("user_ID  = ",user_id)

    return render_template("profile.html", user_id=user_id)

@app.route('/load_account_info', methods=["POST"])
def load_account_info():
    """Get Account information"""
    user_id=session.get('user_id')
    print("user_ID  = ",user_id)
    applications = database.get_client_applications(client_id=user_id)
    # profile_info = list(database.get_client_profile_info(client_id=user_id))
    profile_info = database.get_client_profile_info(client_id=user_id)
    print("profile_info :", profile_info)
    if profile_info["image"] != None:
        # if isinstance(profile_info["image"], bytes):
        image_bytes = bytes(profile_info["image"])
        profile_info["image"] = base64.b64encode(image_bytes).decode('utf-8')

    return jsonify({
        "applications": applications,
        "profile_info": profile_info
    })

@app.route('/load_account_info/delete_application', methods=["POST"])
def delete_application():
    """Delete application"""
    data = request.json
    application_id = data.get("application_id", "")
    print("application_Id : ", application_id)
    user_id=session.get('user_id')
    print("user_ID  = ",user_id)

    database.remove_application(client_id=user_id, application_id=application_id)
    print("deleted")

    return jsonify({
        "Isdeleted": True
    })

@app.route("/account/add_img", methods=["POST"])
def add_img():
    """Add image to account"""
    user_id = session.get('user_id')
    print("user_ID  = ", user_id)
    file = request.files["image"]
    print("file : ", file)

    if file and file.filename != "":
        file_binary = file.read()  # ✅ Read the binary content
        database.add_image_to_user(client_id=user_id, image=file_binary)

    return jsonify({
        'response': 'Image uploaded successfully!'
    })

@app.route("/account/update_profile", methods=["POST"])
def update_profile():
    """Update profile info"""
    user_id = session.get('user_id')
    print("user_ID  = ", user_id)

    data = request.json
    client_name = data.get("client_name", "")
    bio = data.get("bio", "")
    # print("file : ", file)

    database.update_profile(client_id=user_id, client_name=client_name, bio=bio)

    return jsonify({
        'response': 'Profile Updated successfully!'
    })








if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

# (1, '88ebe9b0-9f1b-4dbd-9c54-859cb04f9ac5', 'MedOnly', 'mohamed.rouane.23@ump.ac.ma', 'new')





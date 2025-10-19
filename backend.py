from dotenv import load_dotenv
import os
import pymupdf
import re
import nltk
# from pyresparser import ResumeParser
from spacy import load
import threading
from groq import Groq
import json5
import base64
import tempfile

nltk.download('stopwords')

from pyresparser import utils


import io
import spacy
from spacy.matcher import Matcher


class ResumeParser(object):

    def __init__(
        self,
        resume,
        skills_file=None,
        custom_regex=None
    ):
        nlp = spacy.load('en_core_web_sm')
        # custom_nlp = spacy.load(os.path.dirname(os.path.abspath(__file__)))
        self.custom_nlp = spacy.load('en_core_web_sm')
        self.__skills_file = skills_file
        self.__custom_regex = custom_regex
        self.__matcher = Matcher(nlp.vocab)
        self.__details = {
            'name': None,
            'email': None,
            'mobile_number': None,
            'skills': None,
            'college_name': None,
            'degree': None,
            'designation': None,
            'experience': None,
            'company_names': None,
            'no_of_pages': None,
            'total_experience': None,
        }
        self.__resume = resume
        if not isinstance(self.__resume, io.BytesIO):
            ext = os.path.splitext(self.__resume)[1].split('.')[1]
        else:
            ext = self.__resume.name.split('.')[1]
        self.__text_raw = utils.extract_text(self.__resume, '.' + ext)
        self.__text = ' '.join(self.__text_raw.split())
        self.__nlp = self.custom_nlp(self.__text)
        self.__custom_nlp = nlp(self.__text_raw)
        self.__noun_chunks = list(self.__nlp.noun_chunks)
        self.__get_basic_details()

    def get_extracted_data(self):
        return self.__details

    def __get_basic_details(self):
        cust_ent = utils.extract_entities_wih_custom_model(
                            self.__custom_nlp
                        )
        # name = utils.extract_name(self.__nlp, matcher=self.__matcher)
        name = self.extract_name(self.__nlp, matcher=self.__matcher)
        email = utils.extract_email(self.__text)
        mobile = utils.extract_mobile_number(self.__text, self.__custom_regex)
        skills = utils.extract_skills(
                    self.__nlp,
                    self.__noun_chunks,
                    self.__skills_file
                )
        # edu = utils.extract_education(
        #               [sent.string.strip() for sent in self.__nlp.sents]
        #       )
        entities = utils.extract_entity_sections_grad(self.__text_raw)

        # extract name
        try:
            self.__details['name'] = cust_ent['Name'][0]
        except (IndexError, KeyError):
            self.__details['name'] = name

        # extract email
        self.__details['email'] = email

        # extract mobile number
        self.__details['mobile_number'] = mobile

        # extract skills
        self.__details['skills'] = skills

        # extract college name
        try:
            self.__details['college_name'] = entities['College Name']
        except KeyError:
            pass

        # extract education Degree
        try:
            self.__details['degree'] = cust_ent['Degree']
        except KeyError:
            pass

        # extract designation
        try:
            self.__details['designation'] = cust_ent['Designation']
        except KeyError:
            pass

        # extract company names
        try:
            self.__details['company_names'] = cust_ent['Companies worked at']
        except KeyError:
            pass

        try:
            self.__details['experience'] = entities['experience']
            try:
                exp = round(
                    utils.get_total_experience(entities['experience']) / 12,
                    2
                )
                self.__details['total_experience'] = exp
            except KeyError:
                self.__details['total_experience'] = 0
        except KeyError:
            self.__details['total_experience'] = 0
        self.__details['no_of_pages'] = utils.get_number_of_pages(
                                            self.__resume
                                        )
        return
    def extract_name(nlp_text, matcher):
        '''
        Helper function to extract name from spacy nlp text

        :param nlp_text: object of `spacy.tokens.doc.Doc`
        :param matcher: object of `spacy.matcher.Matcher`
        :return: string of full name
        '''
        from pyresparser import constants as cs
        pattern = [cs.NAME_PATTERN]

        # matcher.add('NAME', None, *pattern)
        # matcher.add('NAME', [p for p in pattern])
        matcher.add('NAME', pattern=pattern)

        matches = matcher(nlp_text)

        for _, start, end in matches:
            span = nlp_text[start:end]
            if 'name' not in span.text.lower():
                return span.text


class ExtractData:
    def __init__(self, file, job_description:str, job_title:str):
        # > Write to a temporary file
        temp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf", mode="wb")
        temp.write(file)
        self.temp_path = temp.name
        temp.close()

        self.job_description = job_description
        # > Create a document object from the file path
        self.document = pymupdf.open(self.temp_path)
        # > Load the Spacy model
        # threading.Thread(target=self.load_model).start()

        # > connect to the chatbot
        load_dotenv()
        self.client = Groq(
                    api_key=os.getenv("GROQ_API_KEY")
        )
        return

    def load_model(self):
        self.model_loaded = False
        self.nlp = load("en_core_web_sm", disable=["tagger", "parser", "lemmatizer", "textcat"])
        self.model_loaded = True
        return
    
    def load_similarity_model(self):
        self.similarity_model_loaded = False
        # > Load the SentenceTransformer model
        self.similarity_model_loaded = True

        return

    def extract_text(self):
        """Extract the resume's text and returns a list of page's text"""
        text_pages = []
        self.text = ""
        for page_num in range(len(self.document)):
            page = self.document[page_num]
            page_text = page.get_text()
            self.text += page_text
            
            text_pages.append(page_text)

        return text_pages

    def authenticate_link(self, link:str):
        """Authenticate the type of link provided"""
        link_pattern = r"^https?://"
        mail_pattern = r"^mailto:"
        phone_pattern = r"^tel:"
        whatsapp_pattern = r"wa.me"
        github_pattern = r"github.com/"
        linkedin_pattern = r"linkedin.com/"
        location_pattern = r"\Wmaps\W"

        if re.search(link_pattern, link) != None:
            if re.search(github_pattern, link) != None:
                return "github"
            elif re.search(linkedin_pattern, link) != None:
                return "linkedin"
            elif re.search(location_pattern, link) != None:
                return "location"
            elif re.search(whatsapp_pattern, link) != None:
                return "phone"
            else:
                return "link"
        elif re.search(mail_pattern, link) != None:
            return "email"
        elif re.search(phone_pattern, link) != None:
            return "phone"
        elif re.search(whatsapp_pattern, link) != None:
            return "phone"

        return "other"
    
    def find_links(self):
        """ Find all links in the documentument """
        if self.document.has_links() == False:
            return {}
        
        all_links = {}

        for page_num, page in enumerate(self.document, start=1):
            links = page.get_links()
            for link in links:
                if "uri" in link:
                    link_type = self.authenticate_link(link["uri"])
                    if link_type in all_links.keys():
                        if type(all_links[link_type]) != list:
                            tmp = all_links[link_type]
                            all_links[link_type] = []
                            all_links[link_type].append(tmp)

                        all_links[link_type].append(link["uri"])
                    else:
                        all_links[link_type] = link["uri"]

        return all_links

    def Font_Size_Threshold(self, blocks):
        """Set a threshold for font size to determine if a text is a heading or not"""
        fontsize_moy = 0
        i = 0

        for block in blocks:
            if 'lines' in block.keys():
                for span in block['lines'][0]["spans"]:
                    fontsize_moy += span['size']
                    i += 1

        return fontsize_moy/i

    def divide_paragraphs(self):    
        """ Divide the text into paragraphs """
        headers = []
        Resume_text = ''

        # > find headers
        for page_num, page in enumerate(self.document, start=1):
            blocks = page.get_text("dict")["blocks"]
            fontsize_moy = self.Font_Size_Threshold(blocks)

            Resume_text += page.get_text("text")
            for block in blocks:
                if "lines" in block:
                    header = block['lines'][0]["spans"][0]['text'].strip()
                    font_size = block['lines'][0]["spans"][0]['size']
                    font_name = block['lines'][0]["spans"][0]['font']
                    
                    is_bold = "Bold" in font_name or "bold" in font_name

                    if font_size > fontsize_moy and is_bold:  # > You can adjust the threshold
                        headers.append((Resume_text.index(header), header))

        headers.sort()

        # > Divide paragraphs
        self.text_paragraphs = {}
        if headers[0][0] != 0:
            self.text_paragraphs["start"] = Resume_text[:headers[0][0]+len(headers[0][1])]
        for i, x in enumerate(headers):
            if i+1 < len(headers):
                self.text_paragraphs[x[1]] = Resume_text[x[0]+len(x[1]):headers[i+1][0]]

        self.text_paragraphs[headers[-1][1]] = Resume_text[headers[-1][0]+len(x[1]):]
        

        return 

    def find_emails(self, text:str):
        """ Find emails in the text """
        email_pattern = r"(\w+\.?)+@(\w+\.?)+"
        liste = []
        for email in list(re.finditer(email_pattern, text)):
            liste.append({'email':email.group(), 'range':(email.start(), email.end())})    
            # > Example : {'email':'mohamed.rouane.23@ump.ac.ma', 'range':(10, 20)}
        
        return liste

    def find_phone_numbers(self, text:str):
        """ Find phone numbers in the text """
        phone_pattern = r"((\+\d+)(\s?\(\d+\))?((-)?(\s?\d+))*)|((\d+\s)?(\(?\d+\)?)([\s-]?\d+)+)"

        phone_list = [{'phone':phone.group(), 'range':(phone.start(), phone.end())} for phone in re.finditer(phone_pattern, text) if phone.end()-phone.start() >= 7]

        return phone_list

    def paragraphs_font_size(self):
        """Returns the font size of the paragraphs with the given header."""

        self.paragraphs_headers = {}
        self.paragraph_blocks = {}

        blocks = []
        liste_headers = list(self.text_paragraphs.keys())

        for page in self.document:
                blocks += page.get_text("dict")["blocks"]

        for index, header in enumerate(liste_headers):
            next_header = liste_headers[index+1] if index+1 < len(liste_headers) else ""

            found_header = False
            found_next_header = False

            start_index = 0
            end_index = 0

            self.paragraph_blocks[header] = []
            self.paragraphs_headers[header] = []

            for i, block in enumerate(blocks):
                if 'lines' in block.keys():
                    for span in block['lines'][0]["spans"]:
                        if span['text'] == header:
                            found_header = True
                            start_index = i+1
                            end_index = i+1
                            continue
                        
                    if span['text'] == next_header:
                        found_next_header = True
                        end_index = i
                        break

                    if found_header == True:
                        end_index += 1
                        if "bold" in span['font'].lower():
                            self.paragraphs_headers[header].append(span)
                        # print(span)
                    
                
                if found_header == True and found_next_header == True:
                    break
        
            self.paragraph_blocks[header] += blocks[start_index:end_index]
        return
    # def get_resume_score(self):
    #     """Calculate Similarity betwen resume and job description"""
        
    #     # > Check if the similarity model is loaded
    #     while self.similarity_model_loaded == False:
    #         continue
        
    #     try:
    #         job_embeddings = self.model.encode(self.job_description, convert_to_numpy=True, normalize_embeddings=True)
    #         resume_embeddings = self.model.encode(self.text, convert_to_numpy=True, normalize_embeddings=True)
    #         similarity = dot(job_embeddings, resume_embeddings)
    #     except: 
    #         self.get_resume_score()
        
    #     return similarity

    def binary_image_to_file(self, image:dict):
        """ Converts a binary image to a file """
        from PIL import Image
        import io

        # > Load image from bytes
        img = Image.open(io.BytesIO(image['image']))

        # > save the image
        img.save(f'output.{image["ext"]}')
        
        return

    def find_image(self):
        """ Finds images in the pdf """
        image = {
            'image': None,
            'ext': None
        }

        for page_num, page in enumerate(self.document, start=1):
            blocks = page.get_text("dict")["blocks"]
            
            for block in blocks:
                if 'image' in block.keys():
                    image = {
                        "image": block['image'],
                        "ext": block['ext']
                    }
                    return image
        
        return image

    def strip_text_with_nlp(self):
        # doc = self.nlp(u"{}".format(self.text))
        doc = ResumeParser.custom_nlp(u"{}".format(self.text))

        return

    def detect_entities_with_large_model(self):
        """ Detects entities in the text """
        entities = {}

        # doc = self.nlp(u"{}".format(self.text))
        doc = ResumeParser.custom_nlp(u"{}".format(self.text))
        for ents in doc.ents:
            if ents.label_ not in entities.keys():
                entities[ents.label_] = []
                entities[ents.label_].append(ents)
            else:
                entities[ents.label_].append(ents)
        
        return entities

    def get_resume_data(self):
        self.resume_information = {
            "name": None,
            "email": None,
            "phone": None,
            "location": None,
            "skills": None,
            "skill_categories": None,
            "paragraphs": {},
            "links": None,
            "text": None,
            "pages_text": None,
            "image": None,
            'score': None,
            'interview_questions': None,
        }

        # > Extract data from resume
        resume_data = ResumeParser(resume=self.temp_path).get_extracted_data()
        # resume_data = ResumeParser.__init__
        print(resume_data)

        # > Clean up the temp file
        # os.remove(self.temp_path)

        # > Extract data using chatbot
        pages_text = self.extract_text()
        data_1, data_2 = self.get_chatbot_data_one_resume()

        # > if the number of pages in a resume is more than 3
        if resume_data['no_of_pages'] == 0 or resume_data['no_of_pages'] > 3:
            return

        # > Score
        if data_1 != None:
            self.resume_information['score'] = data_1[list(data_1.keys())[-2]]

        # > Interview Questions
        if data_1 != None:
            self.resume_information['interview_questions'] = data_1[list(data_1.keys())[-1]]


        # > Skills
        self.resume_information['skills'] = resume_data['skills']
        if 'skills' in data_2.keys():
            self.resume_information['skill_categories'] = data_2['skills']

        # > Extract text from resume
        self.resume_information["text"] = self.text
        self.resume_information["pages_text"] = pages_text

        use_entities = False
        if data_2 == None:
            # > Extract entities with large language model
            while self.model_loaded == False:
                pass
            entities = self.detect_entities_with_large_model()
            use_entities = True

        # > Check if the resume has a name
        if use_entities == True and 'PERSON' in entities.keys():
            if resume_data['name'] == entities['PERSON'][0].text:
                self.resume_information['name'] = resume_data['name']
        else:
            try:
                self.resume_information['name'] = data_2[list(data_2.keys())[0]]['name']
            except :
                self.resume_information['name'] = "John Doe"

        # > Find the about section
        if "about" in data_2[list(data_2.keys())[0]].keys():
            self.resume_information['paragraphs']['about'] = data_2[list(data_2.keys())[0]]['about']
        elif "about" in data_2.keys():
            self.resume_information['paragraphs']['about'] = data_2['about']
        else:
            self.resume_information['paragraphs']['about'] = None

        # > Find the Links
        Links = self.find_links()
        self.resume_information['links'] = Links

        # > Email
        if 'email' in Links.keys():
            if Links['email'].startswith("mailto:") == True:
                self.resume_information['email'] = Links['email'][7:]
        elif resume_data['email'] != None:
            self.resume_information['email'] = resume_data['email']
        else:
            email_list = self.find_emails(self.text)
            if email_list != []:
                self.resume_information['email'] = email_list[0]
        
        # > Phone Number
        if 'phone' in Links.keys():
            if Links['phone'].startswith("tel:") == True:
                self.resume_information['phone'] = Links['phone'][4:]
        elif resume_data['mobile_number'] != None:
            self.resume_information['phone'] = resume_data['mobile_number']
        else:
            email_list = self.find_phone_numbers(self.text)
            if email_list != []:
                self.resume_information['phone'] = email_list[0]['phone']
        
        # > Location
        # if 'location' in Links.keys():
        #     self.resume_information['location'] = {
        #                                         "name": None,
        #                                         "link": Links['location'],
        #                                         }
        # if "GPE" in entities.keys():
        #     self.resume_information['location'] = entities['GPE'][0].text

        # > Paragraphs
        if data_2 != None:
            for i, key in enumerate(data_2.keys()):
                if i == 0 or i == len(data_2.keys()):
                    continue
                self.resume_information['paragraphs'][key] = data_2[key]

        # > Image 
        image = self.find_image()
        if image["image"] != None:
            if isinstance(image["image"], bytes):
                image["image"] = base64.b64encode(image["image"]).decode('utf-8')
        self.resume_information['image'] = image

        return self.resume_information
    
    def get_job_data(self):
        self.job_information = {
            "name": None,
            "text": None,
            "skills": None,
            "paragraphs": {},
            "education": None,
            "experience": None,
        }

        # > Text
        self.job_information["text"] = self.job_description

        # > put the job description in a pdf
        file_name = "job_description.pdf"
        self.text_to_pdf(file_name, self.job_description)

        # > Extract data from resume
        job_data = ResumeParser(resume=file_name).get_extracted_data()

        # > Delete job_description.pdf
        # os.remove(file_name)

        # > if the number of pages in a resume is more than 3
        if job_data['no_of_pages'] == 0 or job_data['no_of_pages'] > 3:
            return
        
        # > Skills 
        self.job_information['skills'] = job_data['skills']



        return self.job_information

    def text_to_pdf(self, file_name:str, text:str):

        # > Create a new PDF
        doc = pymupdf.open()

        # > Add a blank page
        page = doc.new_page()

        # > Define where to place the text (x, y), font size, etc.
        position = pymupdf.Point(72, 72) 
        page.insert_text(position, text, fontsize=12)

        # > Save to file
        doc.save(file_name)
        doc.close()

        return

    def get_chatbot_data_one_resume(self):

        while True:

            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are an AI assistant that analyses raw resume text and return a JSON that is compatible with json.loads(), what you will return is the dictionary only with no text before or after if such as 'Here is the JSON :'. 
    you will be given a raw resume text with no clear formatting and a job description. Your task is to:
    1. check if the provided text of the resume is actually a resume, provide an answer in the JSON under the key 'resume'.
    Example : 'resume': True, or 'resume': False.
    2. check if the provided text of the job descripption is actually a job descripption, provide an answer in the JSON under the key 'description', and the values should be the same as the resume key.
    3. Analyse the job description and the resume provided and give the resume a score on the scale of 100 on how compatible the resume is with the job description, check if candidate has the skills required for the job role and if his experiences are as well. Put it at the end of the JSON labeled 'score' and the value is an integer representing the score.
    5. if the job description is valid generate 5 interview questions related to the job description, store them in a list labeled "questions", if it is not valid return None.
    4. Return only a valid JSON. 
    Example:

    {{
    "resume": true,
    "description": true,
    "score": 90,
    "questions": ["Question 1", "Question 2", ...]
    }}
    don't return anything else (code, no text before or after the JSON or anything), just the JSON so that I can convert it into json format, so the syntax should be right.
    """
                    },
                    {
                        "role": "user",
                        "content": f"""resume : {self.text},
                                        job description :{self.job_description}
                                    """
                    }
                ],
                model="llama-3.3-70b-versatile",
            )

            parsed_resume_1 = chat_completion.choices[0].message.content

            try:
                data_1 = json5.loads(parsed_resume_1)
                break
            except :
                pass

        while True:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": f"""You are an AI assistant that restructures raw resume text into a well-organized JSON that is compatible with json.loads(), what you will return is the JSON only with no text before or after if such as 'Here is the JSON :'. 
    you will be given a raw resume text with no clear formatting. Don't return anything else such as (programming code, no text before or after the JSON or anything), just the JSON, the first letter retured should be '{' and the last should be '}' and make sure all the quotes inside the JSON are double quotes so that I can put it in a json file, so the JSON syntax should be right. Your task is to:
    1. Identify the personal details of the candidate (name, email, phone number, about,  etc.) and store them in the dictionary as a section, if there is an about or profile or a section with the same meaning, extend it to a 30 word paragraph and put it in the about item, but if there isn't generate a with 30 word about the canidate and make it a string for example : "about":"text".
    Example : "personal_details": {{"name": "", "email": "", "phone": ""}}.
    2. Identify the all the main sections of the resume (like Profile, Education, Work Experience, Skills, Projects, etc.)
    3. Divide the text into a JSON format where:
    - Keys are section headers
    - Values are either:
    - A JSON of numbered entries for sections like Experience or skills
    4. the returned experience section will contain both the experiences and the educations in a time order labeled "experiences", each experience will be in a json with these specifics:
    - "name": the title of the item (e.g., job title or degree).
    - "date": the date or time range.
    - "institution": where the experience or education was.
    - "location": could be the country or country or both, remote.
    - "text": a full paragraph describing it.
    if any of these keys don't have a value for a certain experience, value it as null.
    5. group the skills to into categories (like programming languages, languages, frameworks, ...) each group of skills will be in a list item with a key labeled the categorie name inside of a json. If the skills are already grouped in the resume, check if the grouping is correct, if not create another correct one, make sure not to return duplicate skills. 
    6. don't mix the project and the experiences, the experiences should be just the candidate's educations, internships, jobs, compititions. Put the projects in the "projects" section only, and put the experiences and the educations in one JSON labeled "experiences" in order.
    7. Return only a valid JSON. 

    example:

    {{
        "personal_details": {{
            "name": "Amine Saihi", 
            "email": "amine.saihi@ump.ac.ma", 
            "phone": "+212771332478", 
            "about": "Data science and Cloud computing student Looking for a graduation internship 2025", 
            "github": "github.com/amine759", 
            "linkedin": "linkedin.com/in/amine-saihi/", 
            "location": "Morocco",
            "...": "..."
        }},

        "experiences": {{
            "1": {{
                "name": "Master in Computer Science",
                "date": "2020-2022",
                "institution": "XYZ University",
                "location": "France, Paris",
                "text": "I had my Master in Computer Science from XYZ University where I ..."
            }},
            "2": {{
                "name": "Software Engineer at ABC Corp",
                "date": "2022-2024",
                "institution": "ABC Corp",
                "location": "remote",
                "text": "I worked on backend development using Python and REST APIs ..."
            }},
            "...": {{...}}
        }},

        "projects": {{
            "1": {{
                "name": "project name",
                "text": "description on the project",
                "skills": ["list of skills used in this project"]
            }},
            "...": "..."
        }},
        
        "skills": {{
            "Programming Languages": ["Python", "Java", "SQL", ...],
            "Frameworks": ["Flask", ...],
            "...": "..."
            "Languages": ["English", "French", ...]
        }}
    }}
    """
                    },
                    {
                        "role": "user",
                        "content": f"""resume : {self.text}
                                    """
                    }
                ],
                model="llama-3.1-8b-instant",
            )

            parsed_resume_2 = chat_completion.choices[0].message.content

            try:
                data_2 = json5.loads(parsed_resume_2)
                break
            except :
                pass

        return data_1, data_2








if __name__ == "__main__":
    job_description = """About the job
Who We Are

Boston Consulting Group partners with leaders in business and society to tackle their most important challenges and capture their greatest opportunities. BCG was the pioneer in business strategy when it was founded in 1963. Today, we help clients with total transformation-inspiring complex change, enabling organizations to grow, building competitive advantage, and driving bottom-line impact.

To succeed, organizations must blend digital and human capabilities. Our diverse, global teams bring deep industry and functional expertise and a range of perspectives to spark change. BCG delivers solutions through leading-edge management consulting along with technology and design, corporate and digital ventures—and business purpose. We work in a uniquely collaborative model across the firm and throughout all levels of the client organization, generating results that allow our clients to thrive.

We Are BCG X

We’re a diverse team of more than 3,000 tech experts united by a drive to make a difference. Working across industries and disciplines, we combine our experience and expertise to tackle the biggest challenges faced by society today. We go beyond what was once thought possible, creating new and innovative solutions to the world’s most complex problems. Leveraging BCG’s global network and partnerships with leading organizations, BCG X provides a stable ecosystem for talent to build game-changing businesses, products, and services from the ground up, all while growing their career. Together, we strive to create solutions that will positively impact the lives of millions.

What You'll Do

As a part of BCG X you will work closely with consulting teams on a diverse range of advanced topics. You will have the opportunity to leverage software development methodologies to deliver value to BCG's Consulting & BCG X (case) teams, BCG X Product teams and Practice Areas (domain) through providing software developer subject matter expertise, and accelerated execution support. You will collaborate with teams to gather requirements, specify, design, develop, deliver and support software solutions serving client needs. You will provide technical support through deeper understanding of relevant software solutions and processes to build high quality and efficient technology solutions. Assignments will range from short term Proof of concepts/Minimum viable product to long term cases with enterprise grade software development as a critical enabler through the project level description of the role responsibilities and impact within the organization.

What You'll Bring

Must Have Strong Experience

Python
Cloud computing platforms (AWS, Azure, Google Cloud, etc.)
Containerization (Docker, Kubernetes, etc.)
Relational databases (PostgreSQL, MariaDB, MySQL, etc.)
NoSQL databases (MongoDB, Neo4j, Redis, etc)
Spark or other distributed big data systems (Hadoop, Pig, Hive, etc.)
Stream-processing frameworks (e.g. Kafka)
Data pipeline orchestration tools (Airflow, Prefect, Dagster, etc.)
Unix-based command line & development tools
Version control (e.g. Git)

Nice To Have

Java, Scala
Flask, FastAPI, Django or NodeJS (BACKEND)
CI/CD tools (CircleCI, Octopus deploy, Jenkins, etc.)
Infrastructure as code (Terraform, Chef, Puppet, Ansible, etc.)
Deployment (Helm charts, Octopus Deploy, etc.)
Monitoring tools (Datadog, New Relic, App Dynamics, etc.)
Security tools (sonarqube, Veracode)
Unit testing frameworks (Pytest, Mocha, Jest, etc.)
Automated UI testing tools (Selenium, Cypress, Playwright, etc.)
Postman or other API testing tool

Functional Skills

Data Modeling for Analytics and decisioning
Selecting and integrating Big Data tools
Implementing ETL process(s) across on-premise and cloud architectures
Monitoring performance and advising any necessary infrastructure changes

Communicating With Confidence And Ease

You will be a clear and confident communicator, able to deliver messages in a concise manner with strong and effective written and verbal communication.

Job Requirement

Bachelor's / Master's degree in computer science, engineering/technology or equivalent* Excellent oral and written communication skills in French and English

Work Experience

Relevant domain of Data Engineering across industries and work experience providing analytics solutions in a commercial setting

Who You'll Work With

Our technology consultants and specialists partner with our clients and colleagues to build and implement digital solutions through a broad spectrum of activities. Technology jobs and engineering jobs include design of IT architectures, large-scale transformation, agile development, software engineering, cybersecurity consulting, and risk management.

Boston Consulting Group is an Equal Opportunity Employer. All qualified applicants will receive consideration for employment without regard to race, color, age, religion, sex, sexual orientation, gender identity / expression, national origin, disability, protected veteran status, or any other characteristic protected under national, provincial, or local law, where applicable, and those with criminal histories will be considered in a manner consistent with applicable state and local laws."""
    
    job_title = "Data Engineer"


    




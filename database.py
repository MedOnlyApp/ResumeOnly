import sqlite3
import psycopg2
import psycopg2.extras
import random
import uuid
from datetime import datetime
import os

class database:
    def __init__(self):

        conn, cursor = self.initialize_database()
        # try:
        #     cursor.execute("""SELECT * FROM Clients""")
        # except:
        #     self.create_tables()

        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'Clients'
            );
        """)
        exists = cursor.fetchone()[0]
        if not exists:
            self.create_tables()
        conn.close()
        pass

    def initialize_database(self):
        # conn = sqlite3.connect("database.db")
        # cursor = conn.cursor()
        DATABASE_URL = os.environ.get("DATABASE_URL")
        conn = psycopg2.connect(DATABASE_URL, sslmode="require")
        cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        return conn, cursor
    
    def create_tables(self):
        conn, cursor = self.initialize_database()

        sql_for_clients = """CREATE TABLE Clients(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            client_name TEXT NOT NULL,
            username TEXT NOT NULL,
            email TEXT NOT NULL,
            password TEXT NOT NULL,
            bio TEXT,
            image BLOB,
            date DATETIME,
            verification_code TEXT,
            verified BOOLEAN
            )"""
        cursor.execute("DROP TABLE IF EXISTS Clients")
        cursor.execute(sql_for_clients)

        sql_for_applications = """CREATE TABLE Applications(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            applications_id TEXT NOT NULL,
            date TEXT NOT NULL,
            job_title TEXT NOT NULL,
            resume_name TEXT NOT NULL,
            resume_file BLOB NOT NULL,
            resume_text TEXT NOT NULL,
            job_desctiption TEXT NOT NULL,
            score INTEGER NOT NULL,
            resume_info TEXT NOT NULL
            )"""
        cursor.execute("DROP TABLE IF EXISTS Applications")
        cursor.execute(sql_for_applications)

        sql_for_portfolios = """CREATE TABLE Portfolio(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id TEXT NOT NULL,
            username TEXT,
            portfolio TEXT,
            date TEXT NOT NULL
            )"""
        cursor.execute("DROP TABLE IF EXISTS Portfolio")
        cursor.execute(sql_for_portfolios)

        conn.commit()
        conn.close()
        return
    
    @staticmethod
    def check_login_info(email:str, password:str):
        """Check if the Login credentials exist in the database"""
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""SELECT client_id, password FROM Clients
                            WHERE email='{email}'""")
        user = cursor.fetchall()
        conn.close()

        if len(user) == 0:
            return "user not found"
        elif user[0][1] != password:
            return "password incorrect"
        elif user[0][-1] == 0:
            return "unverified"
        else:
            # return "valid"
            return user[0][0]

    @staticmethod
    def check_portfolio_name(username:str):
        """Check if the Login credentials exist in the database"""
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""SELECT * FROM Portfolio
                            WHERE username='{username}'""")
        user = cursor.fetchall()
        conn.close()

        if len(user) == 0:
            return "valid"
        else:
            return "exist"

    @staticmethod 
    def check_registration_info(email:str, password:str):
        """Check if the Registration credentials exist in the database"""
        db = database()
        conn, cursor = db.initialize_database()

        # cursor.execute(f"""SELECT COUNT(*) FROM Clients
        cursor.execute(f"""SELECT * FROM Clients
                            WHERE email='{email}'""")
        user = cursor.fetchall()
        conn.close()

        # print(user)
        # print(len(user))

        if len(user) == 0:
            return "valid"
        elif len(user) == 1:
            if user[0][-1] == 0:
                if password == user[0][5]:
                    db.update_user_password(email, password)
                return "unverified"
            else:
                return "verified"

    @staticmethod    
    def check_verification_code(email:str, verification_code:str, new_verification_code:str):
        """Check the validity of the verification code"""

        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""SELECT * FROM Clients
                            WHERE email='{email}'""")
        user = cursor.fetchall()
        conn.close()

        if user[0][-2] == verification_code:
            db_time_str = user[0][-3]
            # Convert string to datetime object
            db_time = datetime.strptime(db_time_str, "%Y-%m-%d %H:%M:%S")
            now = datetime.now()
            time_diff = db_time - now
            # Compare
            if time_diff.total_seconds() > 3 * 3600:
                db.update_verification_code_and_date(email, new_verification_code)
                return "expired"
            else:
                db.update_verification_status(email)
                return "valid"
        else:
            return 'unvalid'
    
    @staticmethod
    def add_user(client_id:str, client_name:str, username:str, email:str, password:str, bio:str, image, verification_code):
        """Add a user in the database"""

        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute("""INSERT INTO Clients(client_id, client_name, username, email, password, bio, image, date, verification_code, verified)
                        VALUES(?, ?, ?, ?, ?, ?, ?, DATETIME('now'), ?, 0)""", (client_id, client_name, username, email, password, bio, image, verification_code))
        conn.commit()
        conn.close()
        return
    
    @staticmethod
    def add_image_to_user(client_id:str, image:bytes):
        """Add an image to the user user in the database"""

        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute("""UPDATE Clients
                        SET image = ?
                        WHERE client_id = ?""", (image, client_id))
        conn.commit()
        conn.close()
        return
     
    @staticmethod
    def add_application(client_id:str, applications_id:str, job_title:str, resume_name:str, resume_file:bytes, resume_text:str, job_desctiption:str, score:str, resume_info:str):
        """Add an application in the database"""
        db = database()
        conn, cursor = db.initialize_database()

        date = db.get_date()
        print("*******************",(client_id, 
                        applications_id,
                        date,
                        job_title,
                        resume_name,
                        # resume_file,
                        resume_text,
                        job_desctiption,
                        score,
                        resume_info
                        ))

        cursor.execute("""INSERT INTO Applications(
                        client_id,
                        applications_id,
                        date,
                        job_title,
                        resume_name,
                        resume_file,
                        resume_text,
                        job_desctiption,
                        score,
                        resume_info
                        )
                       VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", 
                       (client_id, 
                        applications_id,
                        date,
                        job_title,
                        resume_name,
                        resume_file,
                        resume_text,
                        job_desctiption,
                        score,
                        resume_info
                        )
                )
        conn.commit()
        conn.close()
        return
     
    @staticmethod
    def add_portfolio(client_id:str, username:str, portfolio:str):
        """Add an application in the database"""

        db = database()
        conn, cursor = db.initialize_database()

        date = db.get_date()

        cursor.execute("""INSERT INTO Portfolio(
                        client_id,
                        username,
                        portfolio,
                        date
                        )
                       VALUES(?, ?, ?, ?)""", 
                       (client_id, 
                        username,
                        portfolio,
                        date
                        )
                )
        conn.commit()
        conn.close()
        return

    @staticmethod
    def update_user_password(email:str, new_password:str):
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""UPDATE Clients
                        SET password = '{new_password}'
                        WHERE email = '{email}'""")
        conn.commit()
        conn.close()
        return
    
    @staticmethod
    def update_verification_code_and_date(email:str, new_verification_code:str):
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""UPDATE Clients
                        SET verification_code = '{new_verification_code}' AND date = 'DATETIME("now")'
                        WHERE email = '{email}'""")
        conn.commit()
        conn.close()
        return
    
    @staticmethod
    def update_verification_status(email:str):
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""UPDATE Clients
                        SET verified = '1'
                        WHERE email = '{email}'""")
        conn.commit()
        conn.close()
        return
    
    @staticmethod
    def update_profile(client_id:str, client_name:str, bio:str):
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""UPDATE Clients
                        SET client_name = ?, bio = ?
                        WHERE client_id = ?
                        """, (client_name, bio, client_id))
        conn.commit()
        conn.close()
        return

    @staticmethod
    def get_application(client_id:str, application_id:str):
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""SELECT resume_info FROM Applications
                        WHERE client_id = "{client_id}" AND applications_id = "{application_id}"
                       """)
        application = cursor.fetchone()

        conn.close()
        return application[0]

    @staticmethod
    def get_portfolio(username:str):
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""SELECT portfolio FROM Portfolio
                        WHERE username = "{username}"
                       """)
        application = cursor.fetchone()

        conn.close()
        return application[0]

    @staticmethod
    def get_client_applications(client_id:str):
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""SELECT applications_id, job_title, resume_name, score, date FROM Applications
                        WHERE client_id = "{client_id}"
                       """)
        applications = cursor.fetchall()

        conn.close()
        return applications

    @staticmethod
    def get_client_profile_info(client_id:str):
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""SELECT client_name, username, bio, image FROM Clients
                        WHERE client_id = ?
                       """, (client_id,))
        profile_info = cursor.fetchall()

        conn.close()
        return profile_info

    @staticmethod
    def remove_application(client_id:str, application_id:str):
        db = database()
        conn, cursor = db.initialize_database()

        cursor.execute(f"""DELETE FROM Applications
                        WHERE client_id=? AND applications_id = ?
                        """, (client_id, application_id))
        conn.commit()
        conn.close()
        return
        
    def remove_user(self, email:str):
        conn, cursor = self.initialize_database()

        cursor.execute(f"""DELETE FROM Clients
                        WHERE email='{email}'""")

        conn.commit()
        conn.close()
        return
        
    def read_users(self):
        conn, cursor = self.initialize_database()
        cursor.execute("""SELECT * FROM Clients;""")
        rows = cursor.fetchall()
        conn.close()
        print(*rows, sep="\n")
        return

    def read_applicants(self):
        conn, cursor = self.initialize_database()
        cursor.execute("""SELECT id, client_id, applications_id, job_title, resume_name, score, date  FROM Applications""")
        rows = cursor.fetchall()
        conn.close()
        print(*rows, sep="\n")
        return

    def get_date(self):
        conn, cursor = self.initialize_database()
        cursor.execute("SELECT CURRENT_DATE;")
        current_date = cursor.fetchone()[0]
        
        conn.close()
        
        # conn = sqlite3.connect(":memory:")
        # cursor = conn.cursor()

        # cursor.execute("SELECT date('now');")
        # current_date = cursor.fetchone()[0]

        # conn.close()
        return current_date
    

if __name__ == "__main__":
    db = database()
    db.create_tables()
    database.add_user(str(uuid.uuid4()), "Mohamed Rouane", "MedOnly", "m@gmail.com", "123", "", None, "132565")
    # database.check_registration_info("mohamed.rouane.23@ump.ac.ma", "password")
    db.read_users()
    # database.update_user_password("mohamed.rouane.23@ump.ac.ma", "new")
    # db.read_users()
    # print(database.get_client_profile_info("11fdab8c-c490-4b11-b309-038d1856551e"))
    # db.read_applicants()
    # db.get_date()
    # print(database.get_client_applications("9b1db1b1-13c8-47ad-87c0-21f062fd71f7"))
    # database.remove_application("9b1db1b1-13c8-47ad-87c0-21f062fd71f7", "1749329612743")
    # print(database.get_client_applications("9b1db1b1-13c8-47ad-87c0-21f062fd71f7"))
    # db.read_applicants()



import smtplib
from email.message import EmailMessage
from email.utils import parseaddr
import os
import atexit

email = 'minechaser@jakubraban.com'
smtp_server = 'mail.privateemail.com'
port = 465
login = 'jakub@jakubraban.com'
password = os.environ.get('EMAIL_PASSWORD')
server = smtplib.SMTP_SSL(smtp_server, port)
server.login(login, password)
atexit.register(lambda: server.quit())


def send_message(from_email, content):
    if parseaddr(from_email)[1]:
        message = EmailMessage()
        message["Subject"] = f'Contact Form Message From {from_email}'
        message["From"] = f'MineChaser <{email}>'
        message["To"] = email
        message["Reply-To"] = from_email
        message.set_content(content)
        server.send_message(message)

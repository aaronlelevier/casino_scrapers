from contact.models import Email
from contact.tests.factory import create_contact
from person.tests.factory import create_single_person


def send_html_email():
    """
    Emails don't send when running the unittests, so this live test
    function proves that it works.
    """
    person = create_single_person()
    email = create_contact(Email, person)
    email.email = 'a@a.com'
    email.save()
    subject = 'foo'
    body = 'bar'

    Email.objects.send_email(email, subject, body)

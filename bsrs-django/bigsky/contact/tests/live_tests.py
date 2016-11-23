from django.conf import settings
from django.test import TestCase

from contact.models import Email, PhoneNumber
from contact.tests.factory import create_contact
from person.tests.factory import create_single_person


def send_email():
    """
    Emails don't send when running the unittests, so this live test
    function proves that it works.
    """
    person = create_single_person()
    email = create_contact(Email, person)
    email.email = settings.EMAIL_HOST_USER
    email.save()
    subject = 'foo'
    html_content = '<p>bar</p><p><em>biz</em></p>'
    text_content = 'bar\nbiz'

    Email.objects.send_email(email, subject, html_content, text_content)


def send_sms():
    """
    Sets DEBUG=False, allowing a live SMS to be sent.
    """
    class Test(TestCase):

        def send_sms(self):
            person = create_single_person()
            ph = create_contact(PhoneNumber, person)
            ph.number = "+18884561000"
            ph.save()
            body = 'foo'

            with self.settings(DEBUG=False):
                PhoneNumber.objects.send_sms(ph, body)

    Test().send_sms()

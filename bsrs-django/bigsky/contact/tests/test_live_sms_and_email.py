from django.conf import settings
from django.core import mail
from django.test import TestCase
from django.utils.timezone import now, localtime

from contact.models import Email, PhoneNumber
from contact.tests.factory import create_contact
from person.tests.factory import create_single_person


class EmailTests(TestCase):

    def test_send_email(self):
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

        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].subject, subject)
        self.assertEqual(mail.outbox[0].alternatives[0][0], html_content)
        self.assertEqual(mail.outbox[0].alternatives[0][1], 'text/html')
        self.assertEqual(mail.outbox[0].body, text_content)
        self.assertEqual(mail.outbox[0].from_email, settings.EMAIL_HOST_USER)
        self.assertEqual(mail.outbox[0].to[0], settings.EMAIL_HOST_USER)


class SmsTests(TestCase):

    def test_send_sms(self):
        person = create_single_person()
        ph = create_contact(PhoneNumber, person)
        ph.number = "+18884561000"
        ph.save()
        body = str(localtime(now()))

        ret = PhoneNumber.objects.send_sms(ph, body)

        self.assertIsInstance(ret, str,
                              "Error: should have returned an Twilio.sid")

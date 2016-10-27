import os
from mock import patch

from django.conf import settings
from django.template import loader
from django.test import TestCase

from pretend import stub

from automation import helpers
from automation.tests.factory import create_automation_event
from person.models import Role
from person.tests.factory import create_single_person, create_role
from ticket.models import TicketPriority, TicketStatus
from ticket.tests.factory import TicketWithActivities
from translation.tests.factory import create_translation_keys_for_fixtures


class InterpolateTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
        twa = TicketWithActivities()
        twa.create()
        self.ticket = twa.ticket
        self.event = create_automation_event()
        self.automation = stub(event=self.event)
        self.translation = create_translation_keys_for_fixtures()
        self.interpolate = helpers.Interpolate(
            self.ticket, self.translation, event=self.event)
        # email
        self.html_base_template = os.path.join(settings.TEMPLATES_DIR,
                                     'email/test/base.html')
        with open(os.path.join(settings.TEMPLATES_DIR, 'email/test/body.html')) as f:
            raw_body = f.read().replace('\n', '')
        self.html_email_body = self.interpolate.text(raw_body)

    def test_text(self):
        s = "Emergency at {{location.name}} priority {{ticket.priority}} to view the ticket go to {{ticket.url}}"
        self.assertEqual(
            self.interpolate.text(s),
            "Emergency at {} priority {} to view the ticket go to {}"
            .format(self.ticket.location.name,
                    self.translation.values[self.ticket.priority.name],
                    self.interpolate._ticket_url())
        )

    def test_text__i18n(self):
        # return i18n key to start
        s = "{{ticket.priority}}"
        self.assertEqual(self.interpolate.text(s), TicketPriority.MEDIUM.split('.')[-1])
        s = "{{ticket.status}}"
        self.assertEqual(self.interpolate.text(s), TicketStatus.NEW.split('.')[-1])

    def test_text__ticket_request(self):
        s = "{{ticket.request}}"
        self.assertEqual(self.interpolate.text(s), self.ticket.request)

    def test_text__automation_event(self):
        s = "{{automation.event}}"
        self.assertEqual(self.interpolate.text(s), self.automation.event.key)

    def test_text__ticket_url(self):
        s = "{{ticket.url}}"
        self.assertEqual(self.interpolate.text(s),
                         "{}/tickets/{}".format(settings.SITE_URL, self.ticket.id))

    def test_text__ticket_activity__remove_tag(self):
        interpolate = helpers.Interpolate(
            self.ticket, self.translation, event=self.event)
        s = "{{ticket.activity}}"
        ret = interpolate.text(s)
        self.assertEqual(ret, '')

    def test_text__empty_string(self):
        s = ''
        self.assertEqual(self.interpolate.text(s), '')

    def test_get_raw_tags(self):
        s = "Emergency at {{location.name}} with priority {{ticket.priority}}"
        self.assertEqual(self.interpolate._get_raw_tags(s), ['{{location.name}}', '{{ticket.priority}}'])

    def test_get_tags(self):
        s = "Emergency at {{location.name}} with priority {{ticket.priority}}"
        self.assertEqual(self.interpolate._get_tags(s), ['location.name', 'ticket.priority'])

    def test_get_first_tag(self):
        s = "Emergency at {{location.name}} with priority {{ticket.priority}}"
        self.assertEqual(self.interpolate._get_first_tag(s), 'location.name')

    def test_replace(self):
        s = "{{location.name}}"
        self.assertEqual(self.interpolate._replace(s, s), "{location.name}")

    def test_ticket_url(self):
        self.assertEqual(self.interpolate._ticket_url(),
                        '{}/tickets/{}'.format(settings.SITE_URL, self.ticket.id))

    def test_contains_ticket_activity(self):
        s = "Foo"
        self.assertFalse(self.interpolate.contains_ticket_activity(s))
        s = "Foo {{ticket.activity}}"
        self.assertTrue(self.interpolate.contains_ticket_activity(s))

    def test_get_html_email__combine_base_template_with_body(self):
        title = '<title>Big Sky</title>'
        with open(self.html_base_template) as f:
            base = f.read().replace('\n', '')
        self.assertIn(title, base)

        ret = self.interpolate.get_html_email(
            self.html_base_template, body=self.html_email_body)

        self.assertIn(title, ret)
        self.assertIn(self.ticket.location.name, ret)
        self.assertIn(self.translation.values[self.ticket.priority.name], ret)
        self.assertIn(self.interpolate._ticket_url(), ret)
        self.assertNotIn('\n', ret)

    def test_get_html_email__inline_css(self):
        with open(self.html_base_template) as f:
            base_template_content = f.read().replace('\n', '')
        self.assertIn(
            '<style type="text/css">h1 { border:1px solid black }</style>',
            base_template_content)
        self.assertIn('<h1>Test Email</h1>', base_template_content)

        ret = self.interpolate.get_html_email(
            self.html_base_template, body=self.html_email_body)

        self.assertNotIn('h1 { border:1px solid black }', ret)
        self.assertIn(
            '<h1 style="border:1px solid black">Test Email</h1>',
            ret
        )

    def test_get_html_email__populate_ticket_activity(self):
        ticket_activity = self.ticket.activities.first()
        self.assertTrue(ticket_activity)
        body = self.interpolate.text('{{location.name}}')

        ret = self.interpolate.get_html_email(
            self.html_base_template, body=body, ticket_activity=True, ticket=self.ticket)

        self.assertIn(
            '<li>Type: {}</li>'.format(ticket_activity.type.name),
            ret
        )

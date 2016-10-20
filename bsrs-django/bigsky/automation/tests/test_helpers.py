from mock import patch

from django.conf import settings
from django.test import TestCase

from pretend import stub

from automation import helpers
from automation.tests.factory import create_automation_event
from person.models import Role
from person.tests.factory import create_single_person, create_role
from ticket.models import TICKET_PRIORITY_MEDIUM
from ticket.tests.factory import create_standard_ticket
from translation.tests.factory import create_translation_keys_for_fixtures


class InterpolateTests(TestCase):

    def setUp(self):
        self.person = create_single_person()
        self.ticket = create_standard_ticket()
        self.automation = stub(event=create_automation_event())
        self.translation = create_translation_keys_for_fixtures()
        self.interpolate = helpers.Interpolate(
            self.ticket, self.automation, self.translation)

    def test_text(self):
        s = "Emergency at {{location.name}} priority {{ticket.priority}} to view the ticket go to {{ticket.url}}"
        self.assertEqual(
            self.interpolate.text(s),
            "Emergency at {} priority {} to view the ticket go to {}"
            .format(self.ticket.location.name,
                    self.translation.values[self.ticket.priority.name],
                    self.interpolate._ticket_url())
        )

    def test_text__ticket_priority__i18n(self):
        # return i18n key to start
        s = "{{ticket.priority}}"
        self.assertEqual(self.interpolate.text(s), TICKET_PRIORITY_MEDIUM.split('.')[-1])

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

    @patch("automation.helpers.loader.render_to_string")
    def test_text__ticket_activity(self, mock_func):
        s = "{{ticket.activity}}"
        self.interpolate.text(s)
        self.assertEqual(mock_func.call_args[0][0], 'email/ticket-activities.html')
        self.assertEqual(mock_func.call_args[0][1], {'ticket': self.ticket})

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

    def test_get_role_id(self):
        role = create_role('foo')
        s = "{{role 'foo'}}"
        self.assertEqual(self.interpolate.get_role_id(s), str(role.id))

    def test_get_role_id__does_not_exist(self):
        with self.assertRaises(Role.DoesNotExist):
            Role.objects.get(name='bar')
        s = "{{role 'bar'}}"
        self.assertIsNone(self.interpolate.get_role_id(s))

    def test_get_role_id__too_few_args(self):
        s = "{{role-no-second-arg}}"
        self.assertIsNone(self.interpolate.get_role_id(s))

    def test_get_role_id__too_many_args(self):
        s = "{{role 'foo' 'bar'}}"
        self.assertIsNone(self.interpolate.get_role_id(s))

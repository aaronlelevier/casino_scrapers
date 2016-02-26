from django.test import TestCase

from generic.models import Attachment
from generic.tests.factory import create_attachments
from person.tests.factory import create_single_person
from ticket.tests.factory import create_ticket


class FactoryTests(TestCase):

    def test_create_attachments(self):
        create_single_person()
        ticket = create_ticket()

        ret = create_attachments(ticket=ticket)

        self.assertIsInstance(ret, Attachment)
        self.assertEqual(ret.content_object, ticket)
        self.assertEqual(ret.object_id, ticket.id)

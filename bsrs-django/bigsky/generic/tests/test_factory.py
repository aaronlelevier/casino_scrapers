from django.test import TestCase

from generic.models import Attachment
from generic.tests.factory import create_file_attachment, create_image_attachment
from person.tests.factory import create_single_person
from ticket.tests.factory import create_ticket


class FactoryTests(TestCase):

    def setUp(self):
        create_single_person()

    def test_create_file_attachment(self):
        ticket = create_ticket()

        ret = create_file_attachment(ticket)

        self.assertIsInstance(ret, Attachment)
        self.assertEqual(ret.content_object, ticket)
        self.assertEqual(ret.object_id, ticket.id)
        self.assertTrue(str(ret.file))
        self.assertFalse(str(ret.image_full))
        self.assertFalse(str(ret.image_medium))
        self.assertFalse(str(ret.image_thumbnail))

    def test_create_image_attachment(self):
        ticket = create_ticket()

        ret = create_image_attachment(ticket)

        self.assertIsInstance(ret, Attachment)
        self.assertEqual(ret.content_object, ticket)
        self.assertEqual(ret.object_id, ticket.id)
        self.assertTrue(str(ret.file))
        self.assertTrue(str(ret.image_full))
        self.assertTrue(str(ret.image_medium))
        self.assertTrue(str(ret.image_thumbnail))

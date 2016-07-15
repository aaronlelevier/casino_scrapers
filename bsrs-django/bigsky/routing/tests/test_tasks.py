from mock import patch

from django.test import TestCase

from routing.tasks import process_ticket


class TaskTests(TestCase):

    @patch("routing.tasks.Assignment.objects.process_ticket")
    def test_process_ticket(self, was_called):
        process_ticket('foo', 'bar')
        self.assertTrue(was_called)

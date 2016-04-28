from mock import patch

from django.test import TestCase

from translation import tasks
from utils.tests.helpers import celery_set_eager


class TaskTests(TestCase):

    def setUp(self):
        celery_set_eager()

    def test_debug_task(self):
        x = 'foo'
        ret = tasks.debug_task.delay(x).get()
        self.assertEqual(ret, x)

    @patch("translation.models.TranslationManager.gspread_get_all_csv")
    def test_gspread_get_all_csv(self, mock_func):
        tasks.gspread_get_all_csv()
        self.assertTrue(mock_func.was_called)

    @patch("translation.models.TranslationManager.import_all_csv")
    def test_import_all_csv(self, mock_func):
        tasks.import_all_csv()
        self.assertTrue(mock_func.was_called)

    @patch("translation.tasks.gspread_get_all_csv")
    @patch("translation.tasks.import_all_csv")
    def test_update_translations(self, mock_func_gspread, mock_func_import):
        tasks.update_translations()
        self.assertTrue(mock_func_gspread.was_called)
        self.assertTrue(mock_func_import.was_called)

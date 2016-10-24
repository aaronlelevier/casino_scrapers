import os


from django.conf import settings
from django.test import TestCase

from utils.tests import helpers


class HelperTests(TestCase):

    def test_attachments_dir(self):
        self.assertTrue(os.path.isdir(settings.ATTACHMENTS_DIRECTORY))

    def test_remove_attachment_test_files(self):
        test_file = os.path.join(settings.ATTACHMENTS_DIRECTORY, 'test.png')

        with open(test_file, 'w') as outfile:
            outfile.write('bob')

        self.assertTrue(os.path.isfile(test_file))

        helpers.remove_attachment_test_files()

        self.assertFalse(os.path.isfile(test_file))

    def test_build_dict(self):
        lst = [
            {'id':'1234','name':'Jason'},
            {'id':'2345','name':'Tom'},
            {'id':'3456','name':'Art'}
        ]

        d = helpers.build_dict(lst, key="name")
        
        ret = d["Tom"] 
        self.assertEqual(ret['id'], '2345')
        self.assertEqual(ret['name'], 'Tom')

    def test_empty_str_if_none(self):
        self.assertEqual(helpers.empty_str_if_none(None), '')
        self.assertEqual(helpers.empty_str_if_none('foo'), 'foo')

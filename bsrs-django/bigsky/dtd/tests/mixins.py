from dtd.models import DTD_START_KEY
from dtd.tests.factory import create_tree_data
from generic.tests.factory import create_image_attachment
from person.tests.factory import PASSWORD, create_single_person


class TreeDataTestSetUpMixin(object):

    def setUp(self):
        self.password = PASSWORD
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        # models
        self.attachment = create_image_attachment()
        self.tree_data = create_tree_data(key=DTD_START_KEY, attachments=[self.attachment])

    def tearDown(self):
        self.client.logout()

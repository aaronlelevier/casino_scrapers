from person.tests.factory import PASSWORD, create_single_person
from setting.tests.factory import create_general_setting


class SettingSetupMixin(object):

    def setUp(self):
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)
        self.general_setting = create_general_setting()

    def tearDown(self):
        self.client.logout()

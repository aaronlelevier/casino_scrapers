from unittest.mock import MagicMock

from person.tests.factory import create_single_person, PASSWORD
from utils.permissions import CrudPermissions


class LoginMixin(object):

    def setUp(self):
        self.person = create_single_person()
        self.client.login(username=self.person.username, password=PASSWORD)

    def tearDown(self):
        self.client.logout()


class MockPermissionsAllowAnyMixin(object):
    """
    Mixin to allow for ignoring permissions in view tests.
    """
    def setUp(self):
        super(MockPermissionsAllowAnyMixin, self).setUp()

        self.has_permission = CrudPermissions.has_permission
        CrudPermissions.has_permission = MagicMock(return_value=True)

    def tearDown(self):
        super(MockPermissionsAllowAnyMixin, self).tearDown()

        CrudPermissions.has_permission = self.has_permission

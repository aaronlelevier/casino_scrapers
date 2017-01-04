from unittest.mock import MagicMock

from utils.permissions import CrudPermissions


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

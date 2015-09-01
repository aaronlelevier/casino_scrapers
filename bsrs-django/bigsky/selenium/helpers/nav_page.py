from method_helpers import MethodHelpers
from base_page import BasePage


class NavPage(BasePage, MethodHelpers):
    def click_admin(self):
        self.driver_wait.find_element_by_class_name("t-nav-admin").click()
        # self.find_class_element("t-nav-admin").click()
    def find_people_link(self):
        return self.wait_xhr("t-nav-admin-people")
    def find_location_link(self):
        return self.wait_xhr("t-nav-admin-location")
    def find_location_level_link(self):
        return self.wait_xhr("t-nav-admin-location-level")
    def find_role_link(self):
        return self.wait_xhr("t-nav-admin-role")

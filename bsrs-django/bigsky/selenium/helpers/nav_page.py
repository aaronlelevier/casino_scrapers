from method_helpers import MethodHelpers
from base_page import BasePage


class NavPage(BasePage, MethodHelpers):
    def click_admin(self):
        self.find_class_element("t-nav-admin").click()
    def find_people_link(self):
        return self.wait_xhr("t-nav-admin-people")
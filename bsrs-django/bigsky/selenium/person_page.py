from method_helpers import MethodHelpers
from base_page import BasePage

class PersonPage(BasePage, MethodHelpers):
    def click_btn(self):
       element = self.find_id_element();
    def find_new_link(self):
        return self.wait_xhr("t-person-new")


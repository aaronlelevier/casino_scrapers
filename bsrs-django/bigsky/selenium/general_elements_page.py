from method_helpers import MethodHelpers
from base_page import BasePage

class GeneralElementsPage(BasePage, MethodHelpers):
    def find_add_btn(self):
        return self.find_class_element("t-add-btn")
    def click_save_btn(self):
        self.find_class_element("t-save-btn").click()

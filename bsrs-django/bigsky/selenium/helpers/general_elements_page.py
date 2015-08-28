from method_helpers import MethodHelpers
from base_page import BasePage


class GeneralElementsPage(BasePage, MethodHelpers):
    '''
    Page objects for general DOM nodes
    '''

    def find_add_btn(self):
        return self.find_class_element("t-add-btn")

    def click_save_btn(self):
        self.find_class_element("t-save-btn").click()

    def click_delete_btn(self):
        self.find_class_element("t-delete-btn").click()

    def click_dropdown_delete(self):
        self.find_class_element("dropdown-toggle").click()

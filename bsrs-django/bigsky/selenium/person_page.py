from method_helpers import MethodHelpers
from base_page import BasePage

class PersonPage(BasePage, MethodHelpers):
    def click_btn(self):
       element = self.find_id_element();
    def find_new_link(self):
        return self.wait_xhr("t-person-new")
    def find_and_assert_username(self, username):
        username_input = self.wait_xhr("t-person-username")
        assert username_input.get_attribute("value") == username
    def find_ph_new_entry_send_keys(self, phone_num):
        first_phone_number_input = self.find_class_element("t-new-entry")
        first_phone_number_input.send_keys(phone_num)
    def find_all_ph_new_entries(self):
        return self.find_class_elements("t-new-entry")
    def assert_ph_inputs(self, inputs, *args):
        assert len(inputs) == 2
        assert inputs[0].get_attribute("value") == args[0]
        assert inputs[1].get_attribute("value") == args[1]

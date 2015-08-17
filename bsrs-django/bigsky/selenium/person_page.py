from method_helpers import MethodHelpers
from base_page import BasePage


class PersonPage(BasePage, MethodHelpers):
    '''
    Person page containing all DOM nodes
    '''
    def click_btn(self):
       element = self.find_id_element()

    def find_new_link(self):
        return self.wait_xhr("t-person-new")

    def find_wait_and_assert_elem(self, elem, value):
        elem_input = self.wait_xhr(elem)
        assert elem_input.get_attribute("value") == value

    def find_and_assert_elems(self, **kwargs):
        for k,v in kwargs.items():
            setattr(self, k + "_input", self.find_id_element(k))
            assert getattr(self, k + "_input").get_attribute("value") == v
             

        # first_name_input = self.driver.find_element_by_id("first_name")
        # middle_initial_input = self.driver.find_element_by_id("middle_initial")
        # last_name_input = self.driver.find_element_by_id("last_name")
        # emp_number_input = self.driver.find_element_by_id("employee_id")
        # title_input = self.driver.find_element_by_id("title")
        # assert username_input.get_attribute("value") == username
        # assert first_name_input.get_attribute("value") == first_name
        # assert middle_initial_input.get_attribute("value") == middle_initial
        # assert last_name_input.get_attribute("value") == last_name
        # assert emp_number_input.get_attribute("value") == employee_id
        # assert title_input.get_attribute("value") == title
        
    def find_ph_new_entry_send_keys(self, phone_num):
        first_phone_number_input = self.find_class_element("t-new-entry")
        first_phone_number_input.send_keys(phone_num)

    def find_all_ph_new_entries(self):
        return self.find_class_elements("t-new-entry")

    def assert_ph_inputs(self, inputs, *args):
        assert len(inputs) == 2
        assert inputs[0].get_attribute("value") == args[0]
        assert inputs[1].get_attribute("value") == args[1]

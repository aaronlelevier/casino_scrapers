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
        for k,v in kwargs.iteritems():
            setattr(self, k + "_input", self.find_id_element(k))
            assert getattr(self, k + "_input").get_attribute("value") == v

    def find_list_name(self):
        return self.wait_xhr("t-person-username", plural=True)

    def find_list_data(self):
        return self.wait_xhr("t-person-data", plural=True)

    def click_name_in_list(self, name, new_person):
        pagination = self.wait_xhr("t-pages")
        element_list = pagination.find_elements_by_tag_name("li")
        element_list_len = len(element_list)
        count = 0
        while count < element_list_len:
            try:
                all_people = self.find_list_data()
            except AssertionError:
                pass
            list_view_elements = self.find_list_name()
            for row in list_view_elements:
                if row.text and row.text == name:
                    new_person = row
            if new_person:
                break
            count += 1
            pagination = self.find_class_element("t-pages")
            element_list = pagination.find_elements_by_tag_name("a")
            next_elem = element_list[count]
            next_elem.click()
        return new_person

    def find_ph_new_entry_send_keys(self, phone_num):
        first_phone_number_input = self.find_class_element("t-new-entry")
        first_phone_number_input.send_keys(phone_num)

    def find_all_ph_new_entries(self):
        return self.find_class_elements("t-new-entry")

    def assert_ph_inputs(self, inputs, *args):
        assert len(inputs) == 2
        assert inputs[0].get_attribute("value") == args[0]
        assert inputs[1].get_attribute("value") == args[1]

    def assert_name_not_in_list(self, name, new_person):
        pagination = self.find_class_element("t-pages")
        element_list = pagination.find_elements_by_tag_name("li")
        element_list_len = len(element_list)
        count = 0
        while count < element_list_len:
            try:
                all_people = self.find_list_data()
            except AssertionError:
                pass
            list_view_elements = self.find_list_name()
            for row in list_view_elements:
                if row.text and row.text == name:
                    new_person = row
            count += 1
            pagination = self.find_class_element("t-pages")
            try:
                element_list = pagination.find_elements_by_tag_name("a")
                next_elem = element_list[count]
                next_elem.click()
            except:
                assert new_person == None

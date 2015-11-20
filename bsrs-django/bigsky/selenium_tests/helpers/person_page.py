import selenium

from .model_page import ModelPage


class PersonPage(ModelPage):
    '''
    Person page containing all DOM nodes
    '''

    def __init__(self, driver, new_link, list_name, list_data, *args, **kwargs):
        super(ModelPage, self).__init__(*args, **kwargs)
        # Selenium
        self.driver = driver
        # Page
        self.new_link = new_link
        self.list_name = list_name
        self.list_data = list_data

    def _loop_over_names(self, name, new_person, count):
        """Loop over names in the list.

        :Return: new_person; incremented count for the page.
        """
        try:
            self.find_list_data()
        except AssertionError:
            pass
        list_view_elements = self.find_list_name()
        for row in list_view_elements:
            if row.text and row.text == name:
                new_person = row
        count += 1
        return (new_person, count)

    def click_name_in_list(self, name, new_person):
        pagination = self.wait_for_xhr_request("t-pages")
        element_list = pagination.find_elements_by_tag_name("li")
        element_list_len = len(element_list)
        count = 0
        while count < element_list_len:
            new_person, count = self._loop_over_names(name, new_person, count)
            if new_person:
                break
            pagination = self.wait_for_xhr_request("t-pages")
            element_list = pagination.find_elements_by_tag_name("a")
            next_elem = element_list[count]
            next_elem.click()
        return new_person

    def find_ph_new_entry_send_keys(self, phone_num):
        first_phone_number_input = self.driver.find_element_by_class_name("t-new-entry")
        first_phone_number_input.send_keys(phone_num)

    def find_all_ph_new_entries(self):
        return self.driver.find_elements_by_class_name("t-new-entry")

    def assert_ph_inputs(self, inputs, *args):
        assert len(inputs) == 2
        assert inputs[0].get_attribute("value") == args[0]
        assert inputs[1].get_attribute("value") == args[1]

    def assert_name_not_in_list(self, name, new_person):
        pagination = self.driver.find_element_by_class_name("t-pages")
        element_list = pagination.find_elements_by_tag_name("li")
        element_list_len = len(element_list)
        count = 0
        while count < element_list_len:
            new_person, count = self._loop_over_names(name, new_person, count)

            pagination = self.driver.find_element_by_class_name("t-pages")
            try:
                element_list = pagination.find_elements_by_tag_name("a")
                next_elem = element_list[count]
                next_elem.click()
            except selenium.common.exceptions.ElementNotVisibleException:
                pass
            except IndexError:
                assert new_person == None

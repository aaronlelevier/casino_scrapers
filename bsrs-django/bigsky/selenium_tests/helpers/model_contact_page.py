import selenium

from .model_page import ModelPage


class ModelContactPage(ModelPage):
    '''
    Contact page containing all DOM nodes
    '''

    def __init__(self, driver, new_link, list_name, list_data, *args, **kwargs):
        super(ModelPage, self).__init__(*args, **kwargs)
        # Selenium
        self.driver = driver
        # Page
        self.new_link = new_link
        self.list_name = list_name
        self.list_data = list_data

    def assert_children(self, child_one):
        first_loc = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-location-children-select-trigger ')]/span")
        text = first_loc.text
        assert child_one in text
    
    def assert_locations(self, child_one):
        first_loc = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-person-locations-select-trigger ')]/span")
        text = first_loc.text
        assert child_one in text

    def find_ph_new_entry_send_keys(self, phone_num):
        first_phone_number_input = self.driver.find_element_by_class_name("t-phonenumber-number0")
        first_phone_number_input.send_keys(phone_num)

    def find_all_ph_new_entries(self):
        return self.driver.find_elements_by_class_name("t-new-entry")

    def assert_ph_inputs(self, inputs, *args):
        assert len(inputs) == 2
        assert inputs[0].get_attribute("value") == args[0]
        assert inputs[1].get_attribute("value") == args[1]

    def assert_phone_number_inputs(self, phone_one, phone_two):
        first_phone_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-input-multi-phone ')]/div/input")
        second_phone_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-input-multi-phone ')]/div/following-sibling::*[1]/input")
        assert first_phone_input.get_attribute("value") == phone_one
        assert second_phone_input.get_attribute("value") == phone_two

    def find_address_new_entry_send_keys(self, index, street, city, zip_code):
        first_street_input = self.driver.find_element_by_class_name("t-address-address%s" % index)
        # first_street_input = self.driver.find_element_by_xpath("(//*[contains(concat(' ', @class, ' '), ' t-address-group ')])[%s]/div/following-sibling::*[1]/textarea" % index)
        first_street_input.send_keys(street)
        first_city_input = self.driver.find_element_by_class_name("t-address-city%s" % index)
        # first_city_input = self.driver.find_element_by_xpath("(//*[contains(concat(' ', @class, ' '), ' t-address-group ')])[%s]/div/following-sibling::*[1]/following-sibling::*[1]/input" % index)
        first_city_input.send_keys(city)
        first_zip_input = self.driver.find_element_by_class_name("t-address-postal-code%s" % index)
        # first_zip_input = self.driver.find_element_by_xpath("(//*[contains(concat(' ', @class, ' '), ' t-address-group ')])[%s]/div/following-sibling::*[1]/following-sibling::*[1]/following-sibling::*[1]/following-sibling::*[1]/input" % index)
        first_zip_input.send_keys(zip_code)

    def assert_address_inputs(self, index, new_street, new_city, new_zip):
        street_input = self.driver.find_element_by_xpath("(//*[contains(concat(' ', @class, ' '), ' t-address-group ')])[%s]/div/following-sibling::*[1]/textarea" % index)
        city_input = self.driver.find_element_by_xpath("(//*[contains(concat(' ', @class, ' '), ' t-address-group ')])[%s]/div/following-sibling::*[1]/following-sibling::*[1]/input" % index)
        zip_input = self.driver.find_element_by_xpath("(//*[contains(concat(' ', @class, ' '), ' t-address-group ')])[%s]/div/following-sibling::*[1]/following-sibling::*[1]/following-sibling::*[1]/following-sibling::*[1]/input" % index)
        assert street_input.get_attribute("value") == new_street
        assert city_input.get_attribute("value") == new_city
        assert zip_input.get_attribute("value") == new_zip

    def find_email_new_entry_send_keys(self, email):
        first_email_input = self.driver.find_element_by_class_name("t-email-email0")
        first_email_input.send_keys(email)
        # first_email_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-input-multi-email ')]/div/input")
        # first_email_input.send_keys(email)

    def find_second_email_new_entry_send_keys(self, email):
        second_email_input = self.driver.find_element_by_class_name("t-email-email1")
        second_email_input.send_keys(email)
        # second_email_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-input-multi-email ')]/div/following-sibling::*[1]/input")
        # second_email_input.send_keys(email)

    def assert_email_inputs(self, email_one, email_two):
        first_email_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-input-multi-email ')]/div/input")
        second_email_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-input-multi-email ')]/div/following-sibling::*[1]/input")
        assert first_email_input.get_attribute("value") == email_two or first_email_input.get_attribute("value") == email_one
        assert second_email_input.get_attribute("value") == email_one or second_email_input.get_attribute("value") == email_two

    def assert_name_not_in_list(self, name, new_model):
        pagination = self.driver.find_element_by_class_name("t-pages")
        element_list = pagination.find_elements_by_tag_name("li")
        element_list_len = len(element_list)
        count = 0
        while count < element_list_len:
            new_model, count = self._loop_over_names(name, new_model, count)

            pagination = self.driver.find_element_by_class_name("t-pages")
            try:
                element_list = pagination.find_elements_by_tag_name("a")
                next_elem = element_list[count]
                next_elem.click()
            except selenium.common.exceptions.ElementNotVisibleException:
                pass
            except IndexError:
                assert new_model is None

import unittest
import uuid
import time

from selenium import webdriver
from selenium.webdriver.support.ui import Select

from helpers import (LoginMixin, FillInHelper, MethodHelpers,
    JavascriptMixin, PersonHelper, LoginPage, PersonPage,
    NavPage, GeneralElementsPage)


def get_text_excluding_children(driver, element):
    return driver.execute_script("""
    return jQuery(arguments[0]).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
    }).text();
    """, element)


class LoginTests(unittest.TestCase, JavascriptMixin, LoginMixin, FillInHelper, MethodHelpers):
    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()

    def tearDown(self):
        self.driver.close()

    def test_role_list(self):
        self.driver.find_element_by_class_name("t-nav-admin").click()
        self.wait_for_xhr_request("t-nav-admin-role").click()
        all_roles = self.wait_for_xhr_request("t-role-data", plural=True)

    def test_role_detail_save(self):
        self.driver.find_element_by_class_name("t-nav-admin").click()
        self.wait_for_xhr_request("t-nav-admin-role").click()
        all_roles = self.wait_for_xhr_request("t-role-data", plural=True)
        all_roles[0].click()
        self.driver.find_element_by_class_name("t-save-btn").click()
        self.wait_for_xhr_request("t-role-data", plural=True)

    def test_navigate_to_location_list_and_create_new_location_record(self):
        self.driver.find_element_by_class_name("t-nav-admin").click()
        nav_admin_location = self.wait_for_xhr_request("t-nav-admin-location")
        nav_admin_location.click()
        new_location = self.wait_for_xhr_request("t-location-new")
        new_location.click()
        new_location_name = str(uuid.uuid4())[0:10]
        new_location_number = str(uuid.uuid4())[0:8]
        new_location_level = str(uuid.uuid4())[0:29]
        location_name_input = self.driver.find_element_by_id("location_name")
        location_number_input = self.driver.find_element_by_id("location_number")
        location_level_input = Select(self.driver.find_element_by_id("location_location_level_select"))
        location_name_input.send_keys(new_location_name)
        location_number_input.send_keys(new_location_number)
        location_level_input.select_by_index(1)
        self.driver.find_element_by_class_name("t-save-btn").click()
        all_locations = self.wait_for_xhr_request("t-location-data", plural=True)
        new_location = all_locations[len(all_locations) - 1]
        new_location.click()
        location_name_input = self.wait_for_xhr_request("t-location-name")
        location_number_input = self.wait_for_xhr_request("t-location-number")
        location_level_input = self.wait_for_xhr_request("t-location-level")
        assert location_name_input.get_attribute("value") == new_location_name
        assert location_number_input.get_attribute("value") == new_location_number
        # updated_location_name = "DEF STORE"
        # updated_location_number = "5678"
        # self.driver.find_element_by_id("location_name").clear()
        # self.driver.find_element_by_id("location_number").clear()
        # location_name_input = self.driver.find_element_by_id("location_name")
        # location_name_input.send_keys(updated_location_name)
        # location_number_input = self.driver.find_element_by_id("location_number")
        # location_number_input.send_keys(updated_location_number)
        # self.driver.find_element_by_class_name("t-save-btn").click()
        # all_locations = self.wait_for_xhr_request("t-location-data", plural=True)
        # new_location = all_locations[len(all_locations) - 1]
        # new_location.click()
        # updated_name_input = self.wait_for_xhr_request("t-location-name")
        # updated_number_input = self.wait_for_xhr_request("t-location-number")
        # assert updated_name_input.get_attribute("value") == updated_location_name
        # assert updated_number_input.get_attribute("value") == updated_location_number

    # def test_navigate_to_role_list_and_create_new_role_record(self):
    #     self.driver.find_element_by_class_name("t-nav-admin").click()
    #     nav_admin_role = self.wait_for_xhr_request("t-nav-admin-role")
    #     nav_admin_role.click()
    #     new_role = self.wait_for_xhr_request("t-role-new")
    #     new_role.click()
    #     new_name = str(uuid.uuid4())[0:29]
    #     name_input = self.driver.find_element_by_id("name")
    #     role_type_input = Select(self.driver.find_element_by_id("role_type_select"))
    #     location_level_input = Select(self.driver.find_element_by_id("location_level_select"))
    #     name_input.send_keys(new_name)
    #     role_type_input.select_by_index(0)
    #     location_level_input.select_by_index(1)
    #     self.driver.find_element_by_class_name("t-save-btn").click()
    #     all_roles = self.wait_for_xhr_request("t-role-data", plural=True)
    #     new_role = all_roles[len(all_roles) - 1]
    #     new_role.click()
    #     name_input = self.wait_for_xhr_request("t-role-name")
    #     assert name_input.get_attribute("value") == new_name
    #     updated_name = str(uuid.uuid4())[0:29]
    #     self.driver.find_element_by_id("name").clear()
    #     name_input = self.driver.find_element_by_id("name")
    #     name_input.send_keys(updated_name)
    #     self.driver.find_element_by_class_name("t-save-btn").click()
    #     all_roles = self.wait_for_xhr_request("t-role-data", plural=True)
    #     updated_role = all_roles[len(all_roles) - 1]
    #     updated_role.click()
    #     updated_name_input = self.wait_for_xhr_request("t-role-name")
    #     assert updated_name_input.get_attribute("value") == updated_name

    # def test_navigate_to_location_list_and_create_new_location_level_record(self):
    #     self.driver.find_element_by_class_name("t-nav-admin").click()
    #     nav_admin_locationOrg = self.wait_for_xhr_request("t-nav-admin-locationOrg")
    #     nav_admin_locationOrg.click()
    #     new_location = self.wait_for_xhr_request("t-location-level-new")
    #     new_location.click()
    #     new_name = str(uuid.uuid4())[0:29]
    #     name_input = self.driver.find_element_by_id("location_level_name")
    #     name_input.send_keys(new_name)
    #     self.driver.find_element_by_class_name("t-save-btn").click()
    #     all_locations = self.wait_for_xhr_request("t-location-level-data", plural=True)
    #     new_location = all_locations[len(all_locations) - 1]
    #     new_location.click()
    #     name_input = self.wait_for_xhr_request("t-location-level-name")
    #     assert name_input.get_attribute("value") == new_name
    #     updated_name = str(uuid.uuid4())[0:29]
    #     self.driver.find_element_by_id("location_level_name").clear()
    #     name_input = self.driver.find_element_by_id("location_level_name")
    #     name_input.send_keys(updated_name)
    #     self.driver.find_element_by_class_name("t-save-btn").click()
    #     all_locations = self.wait_for_xhr_request("t-location-level-data", plural=True)
    #     new_location = all_locations[len(all_locations) - 1]
    #     new_location.click()
    #     name_input = self.wait_for_xhr_request("t-location-level-name")
    #     assert name_input.get_attribute("value") == updated_name

    # def test_navigate_to_people_list_and_create_new_person_record(self):
    #     self.at(self.driver.current_url, LoginPage.url())
    #     nav_page = NavPage(self.driver, self.wait)
    #     nav_page.click_admin()
    #     nav_admin_people = nav_page.find_people_link()
    #     nav_admin_people.click()
    #     person_page = PersonPage(self.driver, self.wait)
    #     person_new_link = person_page.find_new_link()
    #     person_new_link.click()
    #     username = str(uuid.uuid4())[0:29]
    #     password = "bobber1"
    #     role = "RNfkmZFxsz"
    #     person = PersonHelper(username=username, password=password)
    #     role_input = Select(self.driver.find_element_by_id("person-role"))
    #     role_input.select_by_index(1)
    #     self._fill_in(person)
    #     gen_elem_page = GeneralElementsPage(self.driver, self.wait)
    #     gen_elem_page.click_save_btn()
    #     person_page.find_wait_and_assert_elem("t-person-username", username)
    #     first_name = "scooter"
    #     middle_initial = "B"
    #     last_name = "McGavine"
    #     employee_id = "1234"
    #     title = "myTitle"
    #     new_phone_one = "888-999-7878"
    #     new_phone_two = "888-999-7899"
    #     person = PersonHelper(first_name=first_name, middle_initial=middle_initial,
    #             last_name=last_name, employee_id=employee_id,
    #             title=title)
    #     self._fill_in(person)
    #     add_phone_number_btn = gen_elem_page.find_add_btn()
    #     add_phone_number_btn.click()
    #     person_page.find_ph_new_entry_send_keys(new_phone_one)
    #     add_phone_number_btn.click()
    #     all_phone_number_inputs = person_page.find_all_ph_new_entries()
    #     last_phone_number_input = all_phone_number_inputs[1]
    #     last_phone_number_input.send_keys(new_phone_two)
    #     person_page.assert_ph_inputs(all_phone_number_inputs, new_phone_one, new_phone_two)

    #     self.driver.find_element_by_class_name("t-save-btn").click()
    #     all_people = self.wait_for_xhr_request("t-person-data", plural=True)
    #     #TODO: verify before the refresh that the person was added using a count ?
    #     self.driver.refresh()
    #     all_people = self.wait_for_xhr_request("t-person-data", plural=True)
    #     #TODO: verify after the refresh that the person was added using a count ?
    #     pagination = self.driver.find_element_by_class_name("t-pages")
    #     element_list = pagination.find_elements_by_tag_name("li")
    #     element_list_len = len(element_list)
    #     new_person = None
    #     count = 0
    #     while count < element_list_len:
    #         try:
    #             all_people = self.wait_for_xhr_request("t-person-data", plural=True)
    #         except AssertionError:
    #             pass
    #         people_list_view = self.driver.find_elements_by_class_name("t-person-username")
    #         for row in people_list_view:
    #             if row.text and row.text == username:
    #                 new_person = row
    #         if new_person:
    #             break
    #         count += 1
    #         pagination = self.driver.find_element_by_class_name("t-pages")
    #         element_list = pagination.find_elements_by_tag_name("a")
    #         next_elem = element_list[count]
    #         next_elem.click()
    #     try:
    #         new_person.click()
    #     except AttributeError as e:
    #         raise e("new person not found")
    #     person_page.find_wait_and_assert_elem("t-person-username", username)
    #     person_page.find_and_assert_elems(username=username, first_name=first_name,
    #         middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)
    #     self.driver.refresh()
    #     person_page.find_wait_and_assert_elem("t-person-username", username)
    #     person_page.find_and_assert_elems(username=username, first_name=first_name,
    #         middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)

if __name__ == "__main__":
    unittest.main()

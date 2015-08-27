import unittest
import uuid
import time
import random
import string

from selenium import webdriver
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from helpers import (LoginMixin, FillInHelper, MethodHelpers,
    JavascriptMixin, PersonHelper, LocationHelper, LoginPage,
    NavPage, GeneralElementsPage, Wait, PersonPage, LocationPage, LocationLevelPage, RolePage)

# from pages import (PersonPage, LocationPage)


def get_text_excluding_children(driver, element):
    return driver.execute_script("""
    return jQuery(arguments[0]).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
    }).text();
    """, element)

def rand_chars(number=10):
    return ''.join([str(random.choice(string.ascii_letters)) for x in range(number)])


class SeleniumTests(JavascriptMixin, LoginMixin, FillInHelper, MethodHelpers, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)

    def tearDown(self):
        self.driver.close()

    # def test_role(self):
    #     ### CREATE
    #     # Go to Role Area
    #     self.at(self.driver.current_url, LoginPage.url())
    #     nav_page = NavPage(self.driver, self.wait)
    #     nav_page.click_admin()
    #     nav_admin_role = nav_page.find_role_link()
    #     nav_admin_role.click()
    #     # the "new_role_name" is the 2nd <td> in the <table>, so loop thro
    #     # the <table> and confirm the newly created Role is there.
    #     role_page = RolePage(self.driver, self.wait)
    #     role_new_link = role_page.find_new_link()
    #     role_new_link.click()
    #     # New Role Data
    #     name = rand_chars(10)
    #     role = LocationHelper(name=name)
    #     self._fill_in(role)
    #     gen_elem_page = GeneralElementsPage(self.driver, self.wait)
    #     gen_elem_page.click_save_btn()
    #     # new Role in List view
    #     all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
    #     self.assertIn(
    #         name,
    #         [r.find_elements_by_tag_name('td')[1].text for r in all_roles]
    #     )
    #     ### UPDATE
    #     # Go to the first Role's Detail view
    #     all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
    #     new_role_name = rand_chars(10)
    #     final_new_role_name = all_roles[0].find_elements_by_tag_name('td')[1].text + new_role_name
    #     all_roles[0].click()
    #     # click 'save' on Role to Update it
    #     name_input = self.driver_wait.find_element_by_id("name")
    #     name_input.send_keys(new_role_name)
    #     self.driver_wait.find_element_by_class_name("t-save-btn").click()
    #     # check name change
    #     all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
    #     self.driver.find_element_by_xpath("//*[text()='{0}']".format(final_new_role_name))
    #     ### DELETE
    #     # Go to the first Role's Detail view
    #     all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
    #     role_name = all_roles[0].find_elements_by_tag_name('td')[1].text
    #     all_roles[0].click()
    #     # click Delete
    #     self.driver_wait.find_element_by_class_name("dropdown-toggle").click()
    #     self.driver_wait.find_element_by_class_name("t-delete-btn").click()
    #     # check Role is deleted
    #     all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
    #     self.assertNotIn(
    #         role_name,
    #         [r.find_elements_by_tag_name('td')[1].text for r in all_roles]
    #     )

    def test_location(self):
        ### CREATE
        # Go to Role Area
        self.at(self.driver.current_url, LoginPage.url())
        nav_page = NavPage(self.driver, self.wait)
        nav_page.click_admin()
        nav_admin_location = nav_page.find_location_link()
        nav_admin_location.click()
        # Get to "Location create view"
        location_page = LocationPage(self.driver, self.wait)
        location_new_link = location_page.find_new_link()
        location_new_link.click()
        # Enter info and hit "save"
        location_name = rand_chars(10)
        location_number = rand_chars(10)
        location_level = rand_chars(10)
        location = LocationHelper(location_name=location_name, location_number=location_number)
        self._fill_in(location)
        location_level_input = Select(self.driver_wait.find_element_by_id("location_location_level_select"))
        location_level_input.select_by_index(1)
        gen_elem_page = GeneralElementsPage(self.driver, self.wait)
        gen_elem_page.click_save_btn()
        # Go to newly created Location's Detail view
        locations = self.wait_for_xhr_request("t-location-data")
        self.driver.refresh()
        location_list_view = self.driver.find_elements_by_class_name("t-location-name")
        new_location = None
        for row in location_list_view:
            if row.text and row.text == location_name:
                new_location = row
        if new_location:
            try:
                new_location.click()
            except AttributeError as e:
                raise e("new location not found")
        # UPDATE
        # # Go to Location Detail view
        # Change name and hit "save"
        location_page.find_wait_and_assert_elem("t-location-name", location_name)
        location_name = rand_chars(10)
        location = LocationHelper(location_name=location_name)
        self._fill_in(location, True)
        gen_elem_page.click_save_btn()
        # List view contains new name
        locations = self.wait_for_xhr_request("t-location-data")
        location_list_view = self.driver.find_elements_by_class_name("t-location-name")
        new_location = None
        for row in location_list_view:
            if row.text and row.text == location_name:
                new_location = row
        if new_location:
            try:
                new_location.click()
            except AttributeError as e:
                raise e("new location not found")

        # DELETE
        # # Go to Location Detail view
        # click Delete
        # #TODO: debug why delete isn't working
        # self.find_class_element("dropdown-toggle").click()
        # self.find_class_element("t-delete-btn").click()
        # # check Role is deleted
        # all_locations = self.wait_for_xhr_request("t-location-data")
        # location_list_view = self.driver.find_elements_by_class_name("t-location-name")
        # self.assertNotIn(
        #     location_name,
        #     [r.text for r in location_list_view]
        # )

    # def test_location_level(self):
    #     ### CREATE
    #     # Go to Role Area
    #     self.at(self.driver.current_url, LoginPage.url())
    #     nav_page = NavPage(self.driver, self.wait)
    #     nav_page.click_admin()
    #     nav_admin_location_level = nav_page.find_location_level_link()
    #     nav_admin_location_level.click()
    #     # Go to Create view
    #     location_level_page = LocationLevelPage(self.driver, self.wait)
    #     location_level_new_link = location_level_page.find_new_link()
    #     location_level_new_link.click()
    #     # create new Location Level
    #     location_level_name = rand_chars(10)
    #     location = LocationHelper(location_level_name=location_level_name)
    #     self._fill_in(location)
    #     name_input = self.driver.find_element_by_id("location_level_name")
    #     name_input.send_keys(location_level_name)
    #     gen_elem_page = GeneralElementsPage(self.driver, self.wait)
    #     gen_elem_page.click_save_btn()
    #     # new record shows in List view
    #     all_locations = self.driver_wait.find_elements_by_class_name("t-location-level-data")
    #     self.driver.refresh()
    #     self.driver.find_element_by_xpath("//*[contains(text(),'{0}')]".format(location_level_name))
    #     ### UPDATE
    #     # TODO: Need to deserialize the javascript object for 'LocationLevel' in order for
    #     #   the delete be able to work.
    #     # go to Detail view
    #     all_levels = self.driver_wait.find_elements_by_class_name("t-location-level-data")
    #     updated_name = rand_chars(10)
    #     # final_updated_name = all_levels[0].find_elements_by_tag_name('td')[1].text + updated_name
    #     all_levels[0].click()
    #     # update name
    #     self.driver_wait.find_element_by_class_name("t-location-level-name").clear()
    #     name_input = self.driver_wait.find_element_by_class_name("t-location-level-name")
    #     name_input.send_keys(updated_name)
    #     time.sleep(3)
    #     save_btn = self.driver_wait.find_element_by_class_name("t-save-btn")
    #     save_btn.click()
    #     # updated name shows in List view
    #     # TODO: Passes w/ ``python run_selenium.py`` but not ``bash ci.sh``.
    #     #   shows a timeout exception with the latter
    #     # all_levels = self.driver_wait.find_elements_by_class_name("t-location-level-data")
    #     self.driver.find_element_by_xpath("//*[contains(text(),'{0}')]".format(updated_name))
    #     # ### DELETE
    #     # # Go to Location Detail view
    #     # locations = self.find_class_elements("t-location-level-data")
    #     # location_name = locations[0].find_elements_by_tag_name('td')[1].text
    #     # locations[0].click()
    #     # # click Delete
    #     # self.driver_wait.find_element_by_class_name("dropdown-toggle").click()
    #     # self.driver_wait.find_element_by_class_name("t-delete-btn").click()
    #     # # check Role is deleted
    #     # all_locations = self.driver_wait.find_elements_by_class_name("t-location-level-data")
    #     # self.assertNotIn(
    #     #     location_name,
    #     #     [r.find_elements_by_tag_name('td')[1].text for r in all_locations]
    #     # )

    def test_person(self):
        ### CREATE
        self.at(self.driver.current_url, LoginPage.url())
        nav_page = NavPage(self.driver, self.wait)
        nav_page.click_admin()
        nav_admin_people = nav_page.find_people_link()
        nav_admin_people.click()
        person_page = PersonPage(self.driver, self.wait)
        person_new_link = person_page.find_new_link()
        person_new_link.click()
        username = str(uuid.uuid4())[0:29]
        password = "bobber1"
        role = "RNfkmZFxsz"
        person = PersonHelper(username=username, password=password)
        role_input = Select(self.driver.find_element_by_id("person-role"))
        role_input.select_by_index(1)
        self._fill_in(person)
        gen_elem_page = GeneralElementsPage(self.driver, self.wait)
        gen_elem_page.click_save_btn()
        ### UPDATE
        person_page.find_wait_and_assert_elem("t-person-username", username)
        first_name = "scooter"
        middle_initial = "B"
        last_name = "McGavine"
        employee_id = "1234"
        title = "myTitle"
        new_phone_one = "888-999-7878"
        new_phone_two = "888-999-7899"
        person = PersonHelper(first_name=first_name, middle_initial=middle_initial,
                last_name=last_name, employee_id=employee_id,
                title=title)
        self._fill_in(person)
        add_phone_number_btn = gen_elem_page.find_add_btn()
        add_phone_number_btn.click()
        person_page.find_ph_new_entry_send_keys(new_phone_one)
        add_phone_number_btn.click()
        all_phone_number_inputs = person_page.find_all_ph_new_entries()
        last_phone_number_input = all_phone_number_inputs[1]
        last_phone_number_input.send_keys(new_phone_two)
        person_page.assert_ph_inputs(all_phone_number_inputs, new_phone_one, new_phone_two)
        self.driver.find_element_by_class_name("t-save-btn").click()
        all_people = self.wait_for_xhr_request("t-person-data", plural=True)
        #TODO: verify before the refresh that the person was added using a count ?
        self.driver.refresh()
        all_people = self.wait_for_xhr_request("t-person-data", plural=True)
        #TODO: verify after the refresh that the person was added using a count ?
        pagination = self.driver.find_element_by_class_name("t-pages")
        element_list = pagination.find_elements_by_tag_name("li")
        element_list_len = len(element_list)
        new_person = None
        count = 0
        while count < element_list_len:
            try:
                all_people = self.wait_for_xhr_request("t-person-data", plural=True)
            except AssertionError:
                pass
            people_list_view = self.driver.find_elements_by_class_name("t-person-username")
            for row in people_list_view:
                if row.text and row.text == username:
                    new_person = row
            if new_person:
                break
            count += 1
            pagination = self.driver.find_element_by_class_name("t-pages")
            element_list = pagination.find_elements_by_tag_name("a")
            next_elem = element_list[count]
            next_elem.click()
        try:
            new_person.click()
        except AttributeError as e:
            raise e("new person not found")
        person_page.find_wait_and_assert_elem("t-person-username", username)
        person_page.find_and_assert_elems(username=username, first_name=first_name,
            middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)
        self.driver.refresh()
        person_page.find_wait_and_assert_elem("t-person-username", username)
        person_page.find_and_assert_elems(username=username, first_name=first_name,
            middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)


if __name__ == "__main__":
    unittest.main()

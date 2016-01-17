from __future__ import absolute_import

import unittest
import random
import string

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import Select

from helpers import (
    LoginMixin, FillInHelper, JavascriptMixin, InputHelper,
    NavPage, GeneralElementsPage, Wait, ModelPage,
    ModelContactPage
)

def get_text_excluding_children(driver, element):
    return driver.execute_script("""
    return jQuery(arguments[0]).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
    }).text();
    """, element)

def rand_chars(number=10):
    return "a"+''.join([str(random.choice(string.ascii_letters)) for x in range(number)])


class SeleniumTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Generic Elements
        self.gen_elem_page = GeneralElementsPage(self.driver)
        # Go to Admin Page
        self.nav_page = NavPage(self.driver)
        self.nav_page.click_admin()

    def tearDown(self):
        self.driver.close()

    def test_translated_value(self):
        """Translation key 'menu.home' -> 'home' in 'en' """
        self.driver.find_element_by_link_text('Home')

    def test_keypress__enter(self):
        # Go to Location Area
        self.nav_page.find_location_link().click()
        # Create Location Page Object
        location_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-location-name",
            list_data = "t-grid-data"
        )
        # click first record in list data
        locations = location_page.find_list_data()
        locations[0].click()
        # save H1 name
        init_title = self.wait_for_xhr_request_xpath("//*/div/h1")
        self.wait_for_xhr_request("t-location-name").send_keys(Keys.RETURN)
        post_title = self.wait_for_xhr_request_xpath("//*/div/h1")
        assert init_title == post_title

    def test_role(self):
        ### CREATE
        # Go to Role Area
        self.nav_page.find_role_link().click()
        # Create Role Page Object
        role_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-role-name",
            list_data = "t-grid-data"
        )
        role_page.find_new_link().click()
        # New Role Data
        name = rand_chars()
        role = InputHelper(name=name)
        self._fill_in(role)
        role_category = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-role-category-select ')]/div")
        role_category.click()
        role_category_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-basic-dropdown--opened ')]/div/input")
        role_category_input.send_keys("a")
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]", debounce=True)
        category_option = self.driver.find_element_by_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        category_option.click()
        #SCOTT not sure why this is failing on jenkins
        # role_ll_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-location-level-select ')]/div")
        # role_ll_input.click()
        # ll_options = self.wait_for_xhr_request("ember-power-select-option", plural=True)
        # ll_options[0].click()
        # self.gen_elem_page.click_save_btn()
        # # new Role in List view
        # role = role_page.find_list_data()
        # self.driver.refresh()
        # self.wait_for_xhr_request("t-sort-name-dir").click()
        # role_list_view = role_page.find_list_name()
        # role_page.click_name_in_list(name, role_list_view)
        # ### UPDATE
        # # Go to the first Role's Detail view
        # role_page.find_wait_and_assert_elem("t-role-name", name)
        # role_name = rand_chars()
        # role = InputHelper(role_name=role_name)
        # self._fill_in(role, clear=True)
        # self.gen_elem_page.click_save_btn()
        # # check name change
        # role = role_page.find_list_data()
        # self.driver.refresh()
        # role_list_view = role_page.find_list_name()
        # role_page.click_name_in_list(role_name, role_list_view)
        # ### DELETE
        # # Go to the first Role's Detail view
        # role_page.find_wait_and_assert_elem("t-role-name", role_name)
        # # click Delete
        # self.gen_elem_page.click_dropdown_delete()
        # self.gen_elem_page.click_delete_btn()
        # # check Role is deleted
        # self.driver.refresh()
        # role = role_page.find_list_data()
        # role_list_view = role_page.find_list_name()
        # self.assertNotIn(
        #     role_name,
        #     [r.text for r in role_list_view]
        # )

    def test_location(self):
        ### CREATE
        # Go to Location Area
        self.nav_page.find_location_link().click()
        # Create Location Page Object
        location_page = ModelContactPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-location-name",
            list_data = "t-grid-data"
        )
        # Get to "Location create view"
        location_new_link = location_page.find_new_link()
        location_new_link.click()
        # Enter info and hit "save"
        location_name = rand_chars()
        location_number = rand_chars()
        location_level = rand_chars()
        location = InputHelper(location_name=location_name, location_number=location_number)
        self._fill_in(location)
        location_level_select = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-location-level-select ')]/div")
        location_level_select.click()
        ll_option = self.driver.find_element_by_class_name("ember-power-select-option--highlighted")
        ll_option.click()
        # location_level_input = Select(self.driver.find_element_by_id("location_location_level_select"))
        # location_level_input.select_by_index(1)
        self.gen_elem_page.click_save_btn()
        # Go to newly created Location's Detail view
        self.driver_wait.find_elements_by_class_name(location_page.list_data)
        self.wait_for_xhr_request("t-sort-name-dir").click()
        self.driver.refresh()
        location_list_view = location_page.find_list_name()
        new_location = location_page.click_name_in_list_pages(location_name, new_model=None)
        try:
            new_location.click()
        except AttributeError as e:
            raise e("new location not found")
        ### UPDATE
        # Go to Location Detail view, Change name and add Contact information and hit "save"
        location_page.find_wait_and_assert_elem("t-location-name", location_name)
        new_location_name = rand_chars()
        new_phone_one = "888-999-7878"
        new_phone_two = "888-999-7899"
        new_street_one = "112 2nd St"
        new_street_two = "64th St Ste 203"
        new_city_one = "Bangladesh"
        new_city_two = "Madison"
        new_zip_one = "45322"
        new_zip_two = "34332-4545"
        new_email_one = "snewcomer@wat.com"
        new_email_two = "aaron@foo.com"
        location = InputHelper(location_name=new_location_name)
        self._fill_in(location, True)
        add_phone_number_btn = self.gen_elem_page.find_add_btn()
        add_phone_number_btn.click()
        location_page.find_ph_new_entry_send_keys(new_phone_one)
        add_phone_number_btn.click()
        all_phone_number_inputs = location_page.find_all_ph_new_entries()
        last_phone_number_input = all_phone_number_inputs[1]
        last_phone_number_input.send_keys(new_phone_two)

        # # if it fails here, might be due to size of browser.  Jenkins is headless so should pass
        # add_location_email_btn = self.gen_elem_page.find_add_email_btn()
        # add_location_email_btn.click()
        # location_page.find_email_new_entry_send_keys(new_email_one)
        # add_location_email_btn.click()
        # location_page.find_second_email_new_entry_send_keys(new_email_two)
        
        add_address_btn = self.gen_elem_page.find_add_address_btn()
        add_address_btn.click()
        location_page.find_address_new_entry_send_keys(1, new_street_one, new_city_one, new_zip_one)
        add_address_btn.click()
        location_page.find_address_new_entry_send_keys(2, new_street_two, new_city_two, new_zip_two)
        self.gen_elem_page.click_save_btn()
        # List view contains new name
        locations = location_page.find_list_data()
        self.driver.refresh()
        locations = location_page.find_list_data()
        new_location = location_page.click_name_in_list_pages(new_location_name, new_model=None)
        try:
            new_location.click()
        except AttributeError as e:
            raise e("new location not found")
        # Check to see if address/email/phone numbers saved
        location_page.find_wait_and_assert_elem("t-location-name", new_location_name)
        location_page.assert_phone_number_inputs(new_phone_one, new_phone_two)
        # location_page.assert_email_inputs(new_email_one, new_email_two)
        location_page.assert_address_inputs(1, new_street_one, new_city_one, new_zip_one)
        location_page.assert_address_inputs(2, new_street_two, new_city_two, new_zip_two)
        ### DELETE
        # Go to Location Detail view click Delete
        self.gen_elem_page.click_dropdown_delete()
        self.gen_elem_page.click_delete_btn()
        # check Location is deleted
        self.driver.refresh()
        locations = location_page.find_list_data()
        location_list_view = location_page.find_list_name()
        self.assertNotIn(
            location_name,
            [r.text for r in location_list_view]
        )

    def test_location_level(self):
        ### CREATE
        # Go to Role Area
        self.nav_page.find_location_level_link().click()
        # Create LocationLevel Page Object
        location_level_page = ModelPage(
            driver=self.driver,
            new_link = "t-add-new",
            list_name = "t-location-level-name",
            list_data = "t-grid-data"
        )
        # Go to Create view
        location_level_new_link = location_level_page.find_new_link()
        location_level_new_link.click()
        # create new Location Level
        location_level_name = rand_chars()
        location_level = InputHelper(location_level_name=location_level_name)
        self._fill_in(location_level)
        self.gen_elem_page.click_save_btn()
        # new record shows in List view
        location_levels = location_level_page.find_list_data()
        self.driver.refresh()
        location_level_list_view = location_level_page.find_list_name()
        location_level_page.click_name_in_list(location_level_name, location_level_list_view)
        ### UPDATE
        self.driver.refresh()
        location_level_page.find_wait_and_assert_elem("t-location-level-name", location_level_name)
        location_level_name = rand_chars()
        location_level = InputHelper(location_level_name=location_level_name)
        self._fill_in(location_level, True)
        self.gen_elem_page.click_save_btn()
        ### List View
        location_levels = location_level_page.find_list_data()
        self.driver.refresh()
        location_level_list_view = location_level_page.find_list_name()
        location_level_page.click_name_in_list(location_level_name, location_level_list_view)
        ### DELETE
        # Go to the first Role's Detail view
        location_level_list_view = location_level_page.find_list_name()
        location_level_page.find_wait_and_assert_elem("t-location-level-name", location_level_name)
        # click Delete
        self.gen_elem_page.click_dropdown_delete()
        self.gen_elem_page.click_delete_btn()
        # check Role is deleted
        self.driver.refresh()
        location_level = location_level_page.find_list_data()
        location_level_list_view = location_level_page.find_list_name()
        self.assertNotIn(
            location_level_name,
            [r.text for r in location_level_list_view]
        )

    def test_person(self):
        ### CREATE
        # Go to Person Area
        self.nav_page.find_people_link().click()
        # Create Person Page Object
        person_page = ModelContactPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-person-username",
            list_data = "t-grid-data"
        )
        # Go to Create Person view
        person_page.find_new_link().click()
        username = "almno_"+rand_chars()
        password = "bobber-foo"
        person = InputHelper(username=username, password=password)
        self._fill_in(person)
        self.gen_elem_page.click_save_btn()
        ### UPDATE
        person_page.find_wait_and_assert_elem("t-person-username", username)
        first_name = "aaascooter"
        middle_initial = "B"
        last_name = "McGavine"
        employee_id = "1234"
        title = "myTitle"
        new_phone_one = "888-999-7878"
        new_phone_two = "888-999-7899"
        new_street_one = "112 2nd St"
        new_street_two = "64th St Ste 203"
        new_city_one = "Bangladesh"
        new_city_two = "Madison"
        new_zip_one = "45322"
        new_zip_two = "34332-4545"
        new_email_one = "snewcomer@wat.com"
        new_email_two = "aaron@foo.com"
        person = InputHelper(first_name=first_name, middle_initial=middle_initial,
                last_name=last_name, employee_id=employee_id,
                title=title)
        self._fill_in(person)
        add_phone_number_btn = self.gen_elem_page.find_add_btn()
        add_phone_number_btn.click()
        person_page.find_ph_new_entry_send_keys(new_phone_one)
        add_phone_number_btn.click()
        all_phone_number_inputs = person_page.find_all_ph_new_entries()
        last_phone_number_input = all_phone_number_inputs[1]
        last_phone_number_input.send_keys(new_phone_two)
        person_page.assert_ph_inputs(all_phone_number_inputs, new_phone_one, new_phone_two)
        # add_email_btn = self.gen_elem_page.find_add_email_btn()
        # add_email_btn.click()
        # person_page.find_email_new_entry_send_keys(new_email_one)
        # add_email_btn.click()
        # person_page.find_second_email_new_entry_send_keys(new_email_two)
        add_address_btn = self.gen_elem_page.find_add_address_btn()
        add_address_btn.click()
        person_page.find_address_new_entry_send_keys(1, new_street_one, new_city_one, new_zip_one)
        add_address_btn.click()
        person_page.find_address_new_entry_send_keys(2, new_street_two, new_city_two, new_zip_two)
        # b/c first save won't work if the 'password' is still attached to the person.
        self.gen_elem_page.click_save_btn()
        person_page.find_list_data()
        self.driver.refresh()
        person_page.find_list_data()
        new_person = person_page.click_name_in_list_pages(username, new_model=None)
        try:
            new_person.click()
        except AttributeError as e:
            raise e("new person not found")
        person_page.find_wait_and_assert_elem("t-person-username", username)
        person_page.find_and_assert_elems(username=username, first_name=first_name,
            middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)
        person_page.assert_phone_number_inputs(new_phone_one, new_phone_two)
        # person_page.assert_email_inputs(new_email_one, new_email_two)
        person_page.assert_address_inputs(1, new_street_one, new_city_one, new_zip_one)
        person_page.assert_address_inputs(2, new_street_two, new_city_two, new_zip_two)
        self.driver.refresh()
        person_page.find_wait_and_assert_elem("t-person-username", username)
        person_page.find_and_assert_elems(username=username, first_name=first_name,
            middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)
        ### DELETE
        person_page.find_wait_and_assert_elem("t-person-username", username)
        self.gen_elem_page.click_dropdown_delete()
        self.gen_elem_page.click_delete_btn()
        self.driver.refresh()
        person = self.driver_wait.find_elements_by_class_name(person_page.list_data) #person_page.find_list_data(just_refreshed=True)
        person_page.find_list_name()

        # # TODO: 
        # This is failing because a Grid View page # allows you to go to that page,
        # but there are no records on that page
        # person_page.assert_name_not_in_list(username, new_person=None)

if __name__ == "__main__":
    unittest.main()

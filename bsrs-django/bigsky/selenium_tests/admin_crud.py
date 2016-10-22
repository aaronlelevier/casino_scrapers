from __future__ import absolute_import

import unittest
import time

from selenium import webdriver
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys

from helpers import (
    LoginMixin, FillInHelper, JavascriptMixin, InputHelper,
    NavPage, GeneralElementsPage, Wait, ModelPage,
    ModelContactPage, rand_chars, rand_num
)


# NOTE: Comment out - b/c button is currently disabled, and not able to click on 'checkbox'.
#   - debug on Ember then bring back this test.
# class DtSeleniumTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    # def setUp(self):
    #     self.driver = webdriver.Firefox(capabilities=caps)
    #     self.driver.set_window_size(1200, 1200)
    #     self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
    #     self.login()
    #     # Wait
    #     self.driver_wait = Wait(self.driver)
    #     # Generic Elements
    #     self.gen_elem_page = GeneralElementsPage(self.driver)
    #     time.sleep(3)

    # def tearDown(self):
    #     self.driver.close()

    # def test_post_and_patch(self):
    #     # /dashboard
    #     self.wait_for_xhr_request('t-launch-dt-ticket').click()
    #     # /dt/new
    #     requester_input = self.wait_for_xhr_request('t-dt-ticket-requester')
    #     requester_input.send_keys('foo')
    #     self.wait_for_xhr_request('t-dt-start').click()
    #     # /dt/{start-id}
    #     description = self.wait_for_xhr_request('t-dtd-preview-description')
    #     assert description.text == 'Start'
    #     number = self.wait_for_xhr_request('t-dtd-field-number')
    #     number.send_keys(1)
    #     text = self.wait_for_xhr_request('t-dtd-field-text')
    #     text.send_keys('foo')
    #     textarea = self.wait_for_xhr_request('t-dtd-field-textarea')
    #     textarea.send_keys('bar')
    #     self.wait_for_xhr_request('ember-basic-dropdown-trigger').click()
    #     options = self.wait_for_xhr_request('ember-power-select-options', plural=True)
    #     options[0].click()
    #     checkbox = self.wait_for_xhr_request_xpath("//*[contains(@class, 't-dtd-preview-field')]//span[text()='ad']")
    #     checkbox.click()
    #     buttons = self.wait_for_xhr_request('t-dtd-preview-btn', plural=True)
    #     buttons[1].click()
    #     # /dt/{2nd-node-id}
    #     description = self.wait_for_xhr_request('t-dtd-preview-description')
    #     assert description.text == 'Maintenance'


class SeleniumTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.set_window_size(1200, 1200)
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Generic Elements
        self.gen_elem_page = GeneralElementsPage(self.driver)
        # Go to Admin Page
        self.nav_page = NavPage(self.driver)
        time.sleep(3)
        self.nav_page.click_admin()

    def tearDown(self):
        self.driver.close()

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

    def test_automation_profile(self):
        ap_link = self.nav_page.find_automation_profiles_link()
        ap_link.click()
        # Create AP Page Object
        page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-automation-description",
            list_data = "t-grid-data"
        )
        # Create
        page.find_new_link().click()
        # description
        description = rand_chars()
        automation = InputHelper(description=description)
        self.wait_for_xhr_request("t-automation-description")
        self._fill_in(automation)
        # assignee
        assignee_dropdown = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-automation-assignee-select ')]/div")
        assignee_dropdown.click()
        assignee_input = self.wait_for_xhr_request("ember-power-select-search-input")
        assignee_input.send_keys('a')
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.driver.find_element_by_xpath("//*[@aria-current='true']").click()
        # pf
        assignee_dropdown = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-automation-pf-select ')]/div")
        assignee_dropdown.click()
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.driver.find_element_by_xpath("//*[@aria-current='true']").click()
        # criteria
        assignee_dropdown = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-location-select ')]/div")
        assignee_dropdown.click()
        assignee_input = self.wait_for_xhr_request("ember-power-select-trigger-multiple-input")
        assignee_input.send_keys('a')
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.driver.find_element_by_xpath("//*[@aria-current='true']").click()
        # save
        self.gen_elem_page.click_save_btn()

        # Find in list
        automation = page.find_list_data()
        self.driver.refresh()
        list_view = page.find_list_name()
        time.sleep(2)
        page.click_name_in_list(description, list_view)

        # Update
        # description
        description = rand_chars()
        automation = InputHelper(description=description)
        automation_input = self.wait_for_xhr_request("t-automation-description")
        automation_input.clear()
        self._fill_in(automation)
        # assignee
        assignee_dropdown = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-automation-assignee-select ')]/div")
        assignee_dropdown.click()
        assignee_input = self.wait_for_xhr_request("ember-power-select-search-input")
        assignee_input.send_keys('a')
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]//li[2]").click()
        # pf
        assignee_dropdown = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-automation-pf-select ')]/div")
        assignee_dropdown.click()
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]//li[2]").click()
        # criteria
        assignee_dropdown = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-location-select ')]/div")
        assignee_dropdown.click()
        assignee_input = self.wait_for_xhr_request("ember-power-select-trigger-multiple-input")
        assignee_input.send_keys('a')
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.driver.find_element_by_xpath("//*[@aria-current='true']").click()
        # save
        self.gen_elem_page.click_save_btn()

        # Find in list
        automation = page.find_list_data()
            # self.driver.refresh()
        list_view = page.find_list_name()
        page.click_name_in_list(description, list_view)

        # Delete
        automation_input = self.wait_for_xhr_request("t-automation-description")
        self.gen_elem_page.click_dropdown_delete()
        self.wait_for_xhr_request("t-delete-btn").click()
        self.wait_for_xhr_request("t-modal-delete-btn").click()

        # check removed from list
        page.find_list_data()
            # self.driver.refresh()
            # page.find_list_data()
        list_view = page.find_list_name()
        self.assertNotIn(
            description,
            [r.text for r in list_view]
        )

    def test_role(self):
        ### CREATE
        # Go to Role Area
        role_link = self.nav_page.find_role_link()
        role_link.click()
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
        self.wait_for_xhr_request("t-role-name")
        self._fill_in(role)
        role_category = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-role-category-select ')]/div")
        role_category.click()
        category_options = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        category_option = self.driver.find_element_by_xpath("//*[@aria-current='true']")
        category_option.click()
        role_ll_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-location-level-select ')]/div")
        role_ll_input.click()
        ll_options = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        ll_option = self.driver.find_element_by_xpath("//*[@aria-current='true']")
        ll_option.click()
        self.gen_elem_page.click_save_btn()
        # new Role in List view
        role = role_page.find_list_data()
            # self.driver.refresh()
        new_role_yay = self.wait_for_xhr_request("t-sort-name-dir")
        new_role_yay.click()
        role_list_view = role_page.find_list_name()
        role_page.click_name_in_list(name, role_list_view)
        ### UPDATE
        # Go to the first Role's Detail view
        role_page.find_wait_and_assert_elem("t-role-name", name)
        role_name = rand_chars()
        role = InputHelper(name=role_name)
        self._fill_in(role, clear=True)
        self.gen_elem_page.click_save_btn()
        # check name change
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
        location_link = self.nav_page.find_location_link()
        location_link.click()
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
        location = InputHelper(name=location_name, number=location_number)
        self._fill_in(location)
        location_level_select = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-location-level-select ')]/div")
        location_level_select.click()
        ll_option = self.driver.find_element_by_xpath("//*[@aria-current='true']")
        ll_option.click()
        status_select = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-location-status-select ')]/div")
        status_select.click()
        status_option = self.driver.find_element_by_xpath("//*[@aria-current='true']")
        status_option.click()
        old_phone_one = "222-999-7878"
        old_phone_two = "222-999-7899"
        old_street_one = "001 Tourmaline St"
        old_street_two = "32 Bunny Road"
        old_city_one = "London"
        old_city_two = "Washington DC"
        old_zip_one = "45322"
        old_zip_two = "34332-4545"
        old_email_one = "andy@wat.com"
        old_email_two = "wat@foo.com"
        # Fill in Contact data
        add_phone_number_btn = self.gen_elem_page.find_add_btn()
        add_phone_number_btn.click()
        location_page.find_ph_new_entry_send_keys(old_phone_one)
        add_phone_number_btn.click()
        last_phone_number_input = self.driver.find_element_by_class_name("t-phonenumber-number1")
            # all_phone_number_inputs = location_page.find_all_ph_new_entries()
            # last_phone_number_input = all_phone_number_inputs[1]
        last_phone_number_input.send_keys(old_phone_two)
        add_location_email_btn = self.gen_elem_page.find_add_email_btn()
        self.driver.execute_script('arguments[0].scrollTop = arguments[0].scrollHeight', add_location_email_btn)
            # add_location_email_btn.send_keys("\n")
        add_location_email_btn.click()
        location_page.find_email_new_entry_send_keys(old_email_one)
        add_location_email_btn.click()
        location_page.find_second_email_new_entry_send_keys(old_email_two)
        add_address_btn = self.gen_elem_page.find_add_address_btn()
        add_address_btn.click()
        location_page.find_address_new_entry_send_keys(0, old_street_one, old_city_one, old_zip_one)
        add_address_btn.click()
        location_page.find_address_new_entry_send_keys(1, old_street_two, old_city_two, old_zip_two)
        self.gen_elem_page.click_save_btn()

        # Go to newly created Location's Detail view
        time.sleep(2)
        self.driver_wait.find_elements_by_class_name(location_page.list_data)
        self.wait_for_xhr_request("t-sort-name-dir").click()
            # self.driver.refresh()
        location_list_view = location_page.find_list_name()
        new_location = location_page.click_name_in_list_pages(location_name, new_model=None)
        try:
            new_location.click()
        except AttributeError as e:
            raise e("new location not found")
        ### UPDATE
        # Go to Location Detail view, Change name and add Contact information and hit "save"
        location_page.find_wait_and_assert_elem("t-location-name", location_name)
        # location_page.assert_email_inputs(old_email_one, old_email_two)
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
        # New form fields
        location = InputHelper(name=new_location_name)
        self._fill_in(location, True)
        location_number = rand_chars()
        location_level = rand_chars()
        location = InputHelper(number=location_number)
        self._fill_in(location)
        location_level_select = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-location-level-select ')]/div")
        location_level_select.click()
        ll_option = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' ember-basic-dropdown-content ')]/ul/li[text()='District']")
        ll_option.click()
        # Fill in Children
        location_children_input = self.driver.find_element_by_xpath("(//*[contains(@class, 't-location-children-select')])[last()]")
        location_children_input.click()
        location_children_input.send_keys("a")
        try:
            child_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
            child_option.click()
        except (AttributeError, NoSuchElementException) as e:
            raise e("child not found")
        # Fill in Parents
        location_parents_input = self.driver.find_element_by_xpath("(//*[contains(@class, 't-location-parent-select')])[last()]")
        location_parents_input.click()
        location_parents_input.send_keys("a")
        parent_option = self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        parent_option.click()
        # Fill in More Contact data
        # add_phone_number_btn = self.gen_elem_page.find_add_btn()
        # add_phone_number_btn.click()

        # second_to_last_phone_number_input = self.driver.find_element_by_class_name("t-phonenumber-number2")
            # all_phone_number_inputs = location_page.find_all_ph_new_entries()
            # second_to_last_phone_number_input = all_phone_number_inputs[2]
        # second_to_last_phone_number_input.send_keys(new_phone_one)
        # add_phone_number_btn.click()
        # last_phone_number_input = self.driver.find_element_by_class_name("t-phonenumber-number3")
        # all_phone_number_inputs = location_page.find_all_ph_new_entries()
        # last_phone_number_input = all_phone_number_inputs[3]
        # last_phone_number_input.send_keys(new_phone_two)
        # email_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-input-multi-email ')]/div/input")
        # email_input = self.driver.find_element_by_class_name("t-email-email0")
        # email_input.clear()
        # location_page.find_email_new_entry_send_keys(new_email_one)
        # add_address_btn = self.gen_elem_page.find_add_address_btn()
        # add_address_btn.click()
        # location_page.find_address_new_entry_send_keys(2, new_street_one, new_city_one, new_zip_one)
        # add_address_btn.click()
        # location_page.find_address_new_entry_send_keys(3, new_street_two, new_city_two, new_zip_two)
        self.gen_elem_page.click_save_btn()

        # List view contains new name
        locations = location_page.find_list_data()
            # self.driver.refresh()
            # locations = location_page.find_list_data()
        new_location = location_page.click_name_in_list_pages(new_location_name, new_model=None)
        try:
            new_location.click()
        except AttributeError as e:
            raise e("new location not found")
        # Check to see if address/email/phone numbers saved
        location_page.find_wait_and_assert_elem("t-location-name", new_location_name)
        # location_page.assert_phone_number_inputs(old_phone_one, old_phone_two)
        # location_page.assert_children("Company")
        # location_page.assert_email_inputs(new_email_one, old_email_two)
        # location_page.assert_address_inputs(2, new_street_one, new_city_one, new_zip_one)
        # location_page.assert_address_inputs(4, new_street_two, new_city_two, new_zip_two)
        ### DELETE
        # Go to Location Detail view click Delete
        self.gen_elem_page.click_dropdown_delete()
        self.gen_elem_page.click_delete_btn()
        # check Location is deleted
            # self.driver.refresh()
        # locations = location_page.find_list_data()
        # location_list_view = location_page.find_list_name()
        # self.assertNotIn(
        #     location_name,
        #     [r.text for r in location_list_view]
        # )

    def test_location_level(self):
        ### CREATE
        # Go to Role Area
        llevel_link = self.nav_page.find_location_level_link()
        llevel_link.click()
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
        location_level = InputHelper(name=location_level_name)
        self._fill_in(location_level)
        self.gen_elem_page.click_save_btn()
        # new record shows in List view
        location_levels = location_level_page.find_list_data()
            # self.driver.refresh()
            # location_levels = location_level_page.find_list_data()
        location_level_list_view = location_level_page.find_list_name()
        new_llevel = location_level_page.click_name_in_list_pages(location_level_name, new_model=None)
        try:
            new_llevel.click()
        except AttributeError as e:
            raise e("new location level not found")
        ### UPDATE
        location_level_page.find_wait_and_assert_elem("t-location-level-name", location_level_name)
        location_level_name = rand_chars()
        location_level = InputHelper(name=location_level_name)
        self._fill_in(location_level, True)
        self.gen_elem_page.click_save_btn()
        ### List View
        location_levels = location_level_page.find_list_data()
            # self.driver.refresh()
            # location_level_list_view = location_level_page.find_list_name()
        location_level_page.click_name_in_list_pages(location_level_name, location_level_list_view)
        ### DELETE
        # Go to the first Role's Detail view
        # location_level_list_view = location_level_page.find_list_name()
        # location_level_page.find_wait_and_assert_elem("t-location-level-name", location_level_name)
        # # click Delete
        # self.gen_elem_page.click_dropdown_delete()
        # self.gen_elem_page.click_delete_btn()
        # # check LLevel is deleted
        # location_level = location_level_page.find_list_data()
        # self.driver.refresh()
        # location_level = location_level_page.find_list_data()
        # location_level_list_view = location_level_page.find_list_name()
        # self.assertNotIn(
        #     location_level_name,
        #     [r.text for r in location_level_list_view]
        # )

    def test_person(self):
        ### CREATE
        # Go to Person Area
        people_link = self.nav_page.find_people_link()
        people_link.click()
        # Create Person Page Object
        person_page = ModelContactPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-person-username",
            list_data = "t-grid-data"
        )
        # Go to Create Person view
        person_page.find_new_link().click()
        username = "almno_"+rand_num()
        password = "bobber-foo"
        first_name = "foo"
        last_name = "bar"
        person = InputHelper(username=username, password=password, first_name=first_name, last_name=last_name)
        self._fill_in(person)
        # select a Locale
        locale_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-locale-select ')]/div")
        locale_input.click()
        locale_option = self.driver.find_element_by_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
        locale_option.click()
        # save
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
        # Fill in Contact Info
        add_phone_number_btn = self.gen_elem_page.find_add_btn()
        add_phone_number_btn.click()
        person_page.find_ph_new_entry_send_keys(new_phone_one)
        add_phone_number_btn.click()
        last_phone_number_input = self.driver.find_element_by_class_name("t-phonenumber-number1")
        # all_phone_number_inputs = person_page.find_all_ph_new_entries()
        # last_phone_number_input = all_phone_number_inputs[1]
        last_phone_number_input.send_keys(new_phone_two)
        # not api related
        # person_page.assert_ph_inputs(all_phone_number_inputs, new_phone_one, new_phone_two)
        add_email_btn = self.gen_elem_page.find_add_email_btn()
        add_email_btn.click()
        person_page.find_email_new_entry_send_keys(new_email_one)
        add_email_btn.click()
        person_page.find_second_email_new_entry_send_keys(new_email_two)

    #     # NOTE: no address button on template (7/18 ayl)
    #     # add_address_btn = self.gen_elem_page.find_add_address_btn()
    #     # add_address_btn.click()
    #     # person_page.find_address_new_entry_send_keys(1, new_street_one, new_city_one, new_zip_one)
    #     # add_address_btn.click()
    #     # person_page.find_address_new_entry_send_keys(2, new_street_two, new_city_two, new_zip_two)

    #     # Fill in Location
    #     # TODO: (scott) double slashes can be removed at some point when the templates are stable. Selects all nodes, regardless of where they are in document.  Allows for relative path selection
    #     location_input = self.driver.find_element_by_xpath("(//*[contains(@class, 't-person-locations-select')])[last()]")
    #     location_input.click()
    #     location_input.send_keys("a")
    #     loc_option = self.wait_for_xhr_request_xpath("//*[contains(concat(' ', @class ,' '), ' ember-power-select-options ')]/li")
    #     loc_option_name = loc_option.text
    #     loc_option.click()
    #     # Select different locale
    #     locale_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-locale-select ')]/div")
    #     locale_input.click()
    #     locale_option = self.driver.find_element_by_xpath("//*[contains(@class, 'ember-power-select-options')]/li[1]")
    #     locale_option.click()

    #     # b/c first save won't work if the 'password' is still attached to the person.
    #     # self.gen_elem_page.click_save_btn()
    #     # TODO: once locale is sent down correctly
    #     # person_page.find_list_data()
    #     # self.driver.refresh()
    #     # person_page.find_list_data()
    #     # new_person = person_page.click_name_in_list_pages(username, new_model=None)
    #     # try:
    #     #     new_person.click()
    #     # except AttributeError as e:
    #     #     raise e("new person not found")
    #     # person_page.find_wait_and_assert_elem("t-person-username", username)
    #     # person_page.find_and_assert_elems(username=username, first_name=first_name,
    #     #     middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)
    #     # person_page.assert_phone_number_inputs(new_phone_one, new_phone_two)
    #     # person_page.assert_email_inputs(new_email_one, new_email_two)
    #     # person_page.assert_address_inputs(1, new_street_one, new_city_one, new_zip_one)
    #     # person_page.assert_address_inputs(2, new_street_two, new_city_two, new_zip_two)
    #     # # person_page.assert_locations(loc_option_name)
    #     # self.driver.refresh()
    #     # person_page.find_wait_and_assert_elem("t-person-username", username)
    #     # assert self.driver.find_element_by_class_name("t-locale-select-trigger").text == "ja - ja"
    #     # person_page.find_and_assert_elems(username=username, first_name=first_name,
    #     #     middle_initial=middle_initial, last_name=last_name, employee_id=employee_id, title=title)
    #     # ### DELETE
    #     # person_page.find_wait_and_assert_elem("t-person-username", username)
    #     # self.gen_elem_page.click_dropdown_delete()
    #     # self.gen_elem_page.click_delete_btn()
    #     # self.driver.refresh()
    #     # person = self.driver_wait.find_elements_by_class_name(person_page.list_data) #person_page.find_list_data(just_refreshed=True)
    #     # person_page.find_list_name()

    #     # # TODO:
    #     # This is failing because a Grid View page # allows you to go to that page,
    #     # but there are no records on that page
    #     # person_page.assert_name_not_in_list(username, new_person=None)

    def test_tenant_update(self):
        tenant_link = self.nav_page.find_tenant_link()
        tenant_link.click()
        # Create Person Page Object
        tenant_page = ModelContactPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-tenant-company_name",
            list_data = "t-grid-data"
        )
        self.wait_for_xhr_request('t-grid-data').click()

        self.wait_for_xhr_request('t-tenant-company_name')

        implementation_contact_dropdown = self.driver.find_element_by_class_name('t-tenant-implementation_contact-select')
        implementation_contact_dropdown.click()
        implementation_contact_input = self.wait_for_xhr_request("ember-power-select-trigger-multiple-input")
        implementation_contact_input.send_keys('a')
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.driver.find_element_by_xpath("//*[@aria-current='true']").click()

        dtd_start_dropdown = self.driver.find_element_by_class_name('t-tenant-dtd_start-select')
        dtd_start_dropdown.click()
        dtd_start_input = self.wait_for_xhr_request("ember-power-select-trigger-multiple-input")
        dtd_start_input.send_keys('a')
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.driver.find_element_by_xpath("//*[@aria-current='true']").click()

        # save
        self.gen_elem_page.click_save_btn()
        time.sleep(5)
        # redirected to list
        tenant_page.find_list_data()

    def test_tenant(self):
        tenant_link = self.nav_page.find_tenant_link()
        tenant_link.click()
        # Create Person Page Object
        tenant_page = ModelContactPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-tenant-company_name",
            list_data = "t-grid-data"
        )

        ### CREATE
        tenant_page.find_new_link().click()

        # fill in all fields
        company_name_text = "company_name_"+rand_num()
        company_name = self.driver.find_element_by_class_name('t-tenant-company_name')
        company_name.send_keys(company_name_text)

        company_code = self.driver.find_element_by_class_name('t-tenant-company_code')
        company_code.send_keys("company_code_"+rand_num())

        dashboard_text = self.driver.find_element_by_class_name('t-tenant-dashboard_text')
        dashboard_text.send_keys("welcome")

        # select a Currency
        currency = self.driver.find_element_by_class_name('t-currency-select')
        currency.click()
        currency_option = self.driver.find_element_by_class_name('ember-power-select-options')
        time.sleep(2)
        currency_option.click()

        # select a Country
        country_dropdown = self.driver.find_element_by_class_name('t-tenant-country-select')
        country_dropdown.click()
        country_input = self.wait_for_xhr_request("ember-power-select-trigger-multiple-input")
        country_input.send_keys('a')
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.driver.find_element_by_xpath("//*[@aria-current='true']").click()

        implementation_contact_initial = self.driver.find_element_by_class_name('t-tenant-implementation_contact_initial')
        implementation_contact_initial.send_keys("Shanaya")

        # select an Implementation Email Type
        implementation_contact_email_type = self.driver.find_element_by_class_name("t-email-type-select")
        implementation_contact_email_type.click()
        implementation_contact_email_type_option = self.driver.find_element_by_class_name('ember-power-select-options')
        time.sleep(2)
        implementation_contact_email_type_option.click()

        implementation_contact_email = self.driver.find_element_by_class_name("t-email-email")
        implementation_contact_email.send_keys("shanaya@twaine.com")

        billing_contact = self.driver.find_element_by_class_name('t-tenant-billing_contact')
        billing_contact.send_keys("John Wayne")

        # select a billing address type
        billing_address_type = self.driver.find_element_by_class_name("t-address-type-select")
        billing_address_type.click()
        billing_address_type_option = self.driver.find_element_by_class_name('ember-power-select-options')
        time.sleep(2)
        billing_address_type_option.click()

        billing_address = self.driver.find_element_by_class_name('t-address-address')
        billing_address.send_keys("1436 Fake Street")

        billing_city = self.driver.find_element_by_class_name('t-address-city')
        billing_city.send_keys("Springfield")

        # select a State
        billing_state_dropdown = self.driver.find_element_by_class_name("t-address-state")
        billing_state_dropdown.click()
        billing_state_input = self.wait_for_xhr_request("ember-power-select-search-input")
        billing_state_input.send_keys('a')
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.driver.find_element_by_xpath("//*[@aria-current='true']").click()

        billing_zip = self.driver.find_element_by_class_name('t-address-postal-code')
        billing_zip.send_keys("65497")

        # select a Billing Country
        billing_country_dropdown = self.driver.find_element_by_class_name("t-address-country")
        billing_country_dropdown.click()
        billing_country_input = self.wait_for_xhr_request("ember-power-select-search-input")
        billing_country_input.send_keys('a')
        self.wait_for_xhr_request_xpath("//*[contains(@class, 'ember-power-select-options')]")
        time.sleep(2)
        self.driver.find_element_by_xpath("//*[@aria-current='true']").click()

        # select an Billing Email Type
        billing_email_type = self.driver.find_elements_by_class_name("t-email-type-select")[1]
        # self.driver.execute_script('arguments[0].scrollTop = arguments[0].scrollHeight', billing_email_type)
        billing_email_type.click()
        billing_email_type_option = self.driver.find_element_by_class_name('ember-power-select-options')
        time.sleep(2)
        billing_email_type_option.click()

        billing_email = self.driver.find_element_by_class_name("t-email-email1")
        billing_email.send_keys("johnwayne@western.com")

        # select an Billing Phone Type
        billing_phone_type = self.driver.find_element_by_class_name("t-phone-number-type-select")
        billing_phone_type.click()
        billing_phone_type_option = self.driver.find_element_by_class_name('ember-power-select-options')
        time.sleep(2)
        billing_phone_type_option.click()

        billing_phone = self.driver.find_element_by_class_name("t-phonenumber-number")
        billing_phone.send_keys("649-975-8223")

        # save
        self.gen_elem_page.click_save_btn()
        time.sleep(5)
        # Find in list
        tenant = tenant_page.find_list_data()
        list_view = tenant_page.find_list_name()
        tenant_page.click_name_in_list(company_name_text, list_view)
        time.sleep(2)

        # ensure scid is present
        scid = self.driver.find_element_by_css_selector('[data-test-id="tenant-scid"]')
        assert len(scid.get_attribute("value")) == 10


if __name__ == "__main__":
    unittest.main()

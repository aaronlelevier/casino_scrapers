import unittest
import uuid
import time

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select, WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from helpers import (LoginMixin, FillInHelper, MethodHelpers,
    JavascriptMixin, PersonHelper, LoginPage, PersonPage,
    NavPage, GeneralElementsPage, Wait)


def get_text_excluding_children(driver, element):
    return driver.execute_script("""
    return jQuery(arguments[0]).contents().filter(function() {
        return this.nodeType == Node.TEXT_NODE;
    }).text();
    """, element)


class RoleTests(JavascriptMixin, LoginMixin, FillInHelper, MethodHelpers, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Go to Role Area
        self.driver_wait.find_element_by_class_name("t-nav-admin").click()
        self.driver_wait.find_element_by_class_name("t-nav-admin-role").click()

    def tearDown(self):
        self.driver.close()

    def test_role_create(self):
        # the "new_role_name" is the 2nd <td> in the <table>, so loop thro
        # the <table> and confirm the newly created Role is there.
        self.driver_wait.find_element_by_class_name("t-role-new").click()
        # New Role Data
        new_role_name = str(uuid.uuid4())[0:10]
        name_input = self.driver_wait.find_element_by_id("name")
        name_input.send_keys(new_role_name)
        self.driver_wait.find_element_by_class_name("t-save-btn").click()
        # new Role in List view
        all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
        self.assertIn(new_role_name, [r.find_elements_by_tag_name('td')[1].text for r in all_roles])

    def test_role_update(self):
        # Go to the first Role's Detail view
        all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
        new_role_name = '- updated'
        final_new_role_name = all_roles[0].find_elements_by_tag_name('td')[1].text + new_role_name
        all_roles[0].click()
        # click 'save' on Role to Update it
        name_input = self.driver_wait.find_element_by_id("name")
        name_input.send_keys(new_role_name)
        self.driver_wait.find_element_by_class_name("t-save-btn").click()
        # check name change
        all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
        self.assertIn(
            final_new_role_name,
            [r.find_elements_by_tag_name('td')[1].text for r in all_roles]
        )

    def test_role_delete(self):
        # Go to the first Role's Detail view
        all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
        role_name = all_roles[0].find_elements_by_tag_name('td')[1].text
        all_roles[0].click()
        # click Delete
        self.driver_wait.find_element_by_class_name("dropdown-toggle").click()
        self.driver_wait.find_element_by_class_name("t-delete-btn").click()
        # check Role is deleted
        all_roles = self.driver_wait.find_elements_by_class_name("t-role-data")
        self.assertNotIn(
            role_name,
            [r.find_elements_by_tag_name('td')[1].text for r in all_roles]
        )


class LocationTests(JavascriptMixin, LoginMixin, FillInHelper, MethodHelpers, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Go to Role Area
        self.driver_wait.find_element_by_class_name("t-nav-admin").click()
        self.driver_wait.find_element_by_class_name("t-nav-admin-location").click()

    def tearDown(self):
        self.driver.close()

    def test_create(self):
        # Get to "Location create view"
        new_location = self.driver_wait.find_element_by_class_name("t-location-new").click()
        # Enter info and hit "save"
        new_location_name = str(uuid.uuid4())[0:10]
        new_location_number = str(uuid.uuid4())[0:8]
        new_location_level = str(uuid.uuid4())[0:29]
        location_name_input = self.driver_wait.find_element_by_id("location_name")
        location_number_input = self.driver_wait.find_element_by_id("location_number")
        location_level_input = Select(self.driver_wait.find_element_by_id("location_location_level_select"))
        location_name_input.send_keys(new_location_name)
        location_number_input.send_keys(new_location_number)
        location_level_input.select_by_index(1)
        self.driver_wait.find_element_by_class_name("t-save-btn").click()
        # Go to newly created Location's Detail view
        locations = self.driver_wait.find_elements_by_class_name("t-location-data")
        self.driver.refresh()
        self.driver.find_element_by_xpath("//*[text()='{0}']".format(new_location_name)).click()

    def test_update(self):
        # Go to Location Detail view
        location = self.driver_wait.find_elements_by_class_name("t-location-data")[0].click()
        # Change name and hit "save"
        updated_location_name = "DEF STORE"
        location_name_input = self.driver_wait.find_element_by_id("location_name")
        location_name_input.clear()
        location_name_input.clear()
        location_name_input.send_keys(updated_location_name)
        self.driver_wait.find_element_by_class_name("t-save-btn").click()
        # List view contains new name
        all_locations = self.driver_wait.find_elements_by_class_name("t-location-data")
        self.assertIn(
            updated_location_name,
            [r.find_elements_by_tag_name('td')[1].text for r in all_locations]
        )

    def test_delete(self):
        # Go to Location Detail view
        locations = self.driver_wait.find_elements_by_class_name("t-location-data")
        location_name = locations[0].find_elements_by_tag_name('td')[1].text
        locations[0].click()
        # click Delete
        self.driver_wait.find_element_by_class_name("dropdown-toggle").click()
        self.driver_wait.find_element_by_class_name("t-delete-btn").click()
        # check Role is deleted
        all_locations = self.driver_wait.find_elements_by_class_name("t-location-data")
        self.assertNotIn(
            location_name,
            [r.find_elements_by_tag_name('td')[1].text for r in all_locations]
        )



class LocationLevelTests(JavascriptMixin, LoginMixin, FillInHelper, MethodHelpers, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Go to Role Area
        self.driver_wait.find_element_by_class_name("t-nav-admin").click()
        self.driver_wait.find_element_by_class_name("t-nav-admin-location-level").click()

    def tearDown(self):
        self.driver.close()

    def test_location_level_create(self):
        # Go to Create view
        self.driver_wait.find_element_by_class_name("t-location-level-new").click()
        # create new Location Level
        new_name = str(uuid.uuid4())[0:29]
        name_input = self.driver.find_element_by_id("location_level_name")
        name_input.send_keys(new_name)
        self.driver.find_element_by_class_name("t-save-btn").click()
        # new record shows in List view
        all_locations = self.driver_wait.find_elements_by_class_name("t-location-level-data")
        self.driver.refresh()
        self.driver.find_element_by_xpath("//*[contains(text(),'{0}')]".format(new_name))

    def test_location_level_update(self):
        # go to Detail view
        all_levels = self.driver_wait.find_elements_by_class_name("t-location-level-data")
        updated_name = "- updated"
        final_updated_name = all_levels[0].find_elements_by_tag_name('td')[1].text + updated_name
        all_levels[0].click()
        # update name
        name_input = self.driver_wait.find_element_by_class_name("t-location-level-name")
        name_input.send_keys(updated_name)
        self.driver_wait.find_element_by_class_name("t-save-btn").click()
        # updated name shows in List view
        all_levels = self.driver_wait.find_elements_by_class_name("t-location-level-data")
        self.assertIn(
            final_updated_name,
            [r.find_elements_by_tag_name('td')[1].text for r in all_levels]
        )

    def test_delete(self):
        # Go to Location Detail view
        locations = self.driver_wait.find_elements_by_class_name("t-location-level-data")
        location_name = locations[0].find_elements_by_tag_name('td')[1].text
        locations[0].click()
        # click Delete
        self.driver_wait.find_element_by_class_name("dropdown-toggle").click()
        self.driver_wait.find_element_by_class_name("t-delete-btn").click()
        # check Role is deleted
        all_locations = self.driver_wait.find_elements_by_class_name("t-location-level-data")
        self.assertNotIn(
            location_name,
            [r.find_elements_by_tag_name('td')[1].text for r in all_locations]
        )


class PersonTests(JavascriptMixin, LoginMixin, FillInHelper, MethodHelpers, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Go to Role Area
        self.driver.find_element_by_class_name("t-nav-admin").click()
        self.wait_for_xhr_request("t-nav-admin-people").click()

    def tearDown(self):
        self.driver.close()

    def test_create(self):
        # go to Create view
        self.wait_for_xhr_request("t-person-new", plural=True)[0].click()
        # fill in info and hit "save"
        username = str(uuid.uuid4())[0:29]
        password = "bobber1"
        username_input = self.driver.find_element_by_class_name("t-person-username")
        password_input = self.driver.find_element_by_class_name("t-person-password")
        username_input.send_keys(username)
        password_input.send_keys(password)
        role_input = Select(self.driver.find_element_by_id("person-role"))
        role_input.select_by_index(1)
        self.driver.find_element_by_class_name("t-save-btn").click()
        # Redirected to Person Detail view
        time.sleep(5)
        self.driver.find_element_by_class_name("t-save-btn").click()
        # now at List view
        time.sleep(5)
        self.wait_for_xhr_request("t-person-data", plural=True)

        # Now confirm that the newly created Person is in the List View
        ret_username = None
        element_list = (self.driver.find_element_by_class_name("t-pages")
                                   .find_elements_by_tag_name("a"))
        # Loop through pages in the Grid view looking for the new Person
        # that was just created
        for element in element_list:
            print element_list
            element.click()
            people = self.wait_for_xhr_request("t-person-data", plural=True)
            for p in people:
                p_row_username = p.find_elements_by_tag_name('td')[1]
                if username == p_row_username.text:
                    ret_username = p_row_username.text
        self.assertEqual(ret_username, username)


class LoginTests(JavascriptMixin, LoginMixin, FillInHelper, MethodHelpers, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()

    def tearDown(self):
        self.driver.close()

    def test_navigate_to_people_list_and_create_new_person_record(self):
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
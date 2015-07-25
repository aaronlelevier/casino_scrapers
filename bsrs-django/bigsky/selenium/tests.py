import unittest
import uuid 
from time import sleep

from selenium import webdriver
from login import LoginMixin
from javascript import JavascriptMixin

class LoginTests(unittest.TestCase, LoginMixin, JavascriptMixin):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)

    def tearDown(self):
        self.driver.close()

    def test_login_page_rendered_with_inputs(self):
        self.login()

        current_user = self.driver.find_element_by_class_name("current-user")
        assert current_user.is_displayed()

    def test_navigate_to_people_list_and_load_first_detail_record(self):
        self.login()

        self.driver.find_element_by_class_name("t-nav-admin").click()
        nav_admin_people = self.wait_for_xhr_request("t-nav-admin-people")
        nav_admin_people.click()

        first_person = self.wait_for_xhr_request("t-person-data")
        first_person.click()

        username_input = self.wait_for_xhr_request("t-person-username")
        assert username_input.get_attribute("value")

        self.driver.find_element_by_class_name('t-save-btn').click()

        self.wait_for_xhr_request("t-person-data")


    def test_navigate_to_people_list_and_create_new_person_record(self):
        self.login()

        self.driver.find_element_by_class_name("t-nav-admin").click()
        nav_admin_people = self.wait_for_xhr_request("t-nav-admin-people")
        nav_admin_people.click()

        first_person = self.wait_for_xhr_request("t-person-new")
        first_person.click()

        username_input = self.driver.find_element_by_id("username")
        password_input = self.driver.find_element_by_id("password")
        email_input = self.driver.find_element_by_id("email")
        role_input = self.driver.find_element_by_id("role")
        first_name_input = self.driver.find_element_by_id("first_name")
        last_name_input = self.driver.find_element_by_id("last_name")

        username_input.send_keys(str(uuid.uuid4())[0:29])
        password_input.send_keys("bobber1")
        role_input.send_keys(1)
        email_input.send_keys("bobber1@gmail.com")
        first_name_input.send_keys(str(uuid.uuid4())[0:29])
        last_name_input.send_keys('Gibson')
        self.driver.find_element_by_class_name('t-save-btn').click()

        # TODO
        # self.wait_for_xhr_request("t-person-data")

if __name__ == "__main__":
    unittest.main()

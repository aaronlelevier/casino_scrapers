import unittest

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
        assert username_input.get_attribute("value") == "aaron"


if __name__ == "__main__":
    unittest.main()

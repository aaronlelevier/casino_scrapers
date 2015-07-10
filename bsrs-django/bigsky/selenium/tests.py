import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class LoginTests(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver,10)

    def tearDown(self):
        self.driver.close()

    def test_login_page_rendered_with_inputs(self):
        self.driver.get("http://127.0.0.1:8000/login/")

        # Login Inputs needed
        username_input = self.driver.find_element_by_id("id_username")
        password_input = self.driver.find_element_by_id("id_password")

        assert username_input.is_displayed()
        assert password_input.is_displayed()

        # Login Credentials
        username_input.send_keys("aaron")
        password_input.send_keys("1234")
        password_input.send_keys(Keys.RETURN)

        # upon being redirected, the User will see this
        self.wait.until(lambda d: d.title.lower().startswith('bsrs-ember'))

        current_user = self.driver.find_element_by_class_name("current-user")
        assert current_user.is_displayed()

if __name__ == "__main__":
    unittest.main()

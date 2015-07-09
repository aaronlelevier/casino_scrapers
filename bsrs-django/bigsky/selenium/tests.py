import time
import unittest
from selenium import webdriver
from selenium.webdriver.common.keys import Keys


class LoginTests(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()

    def tearDown(self):
        self.driver.close()

    def test_login_page_rendered_with_inputs(self):
        driver = self.driver
        driver.get("http://127.0.0.1:8000/login/")

        username_input = driver.find_element_by_id("id_username")
        password_input = driver.find_element_by_id("id_password")

        assert username_input.is_displayed()
        assert password_input.is_displayed()

        username_input.send_keys("aaron")
        password_input.send_keys("1234")
        password_input.send_keys(Keys.RETURN)

        time.sleep(10)
        current_user = driver.find_element_by_class_name("current-user")
        assert current_user.is_displayed()

if __name__ == "__main__":
    unittest.main()

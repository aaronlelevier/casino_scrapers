<<<<<<< HEAD
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
        assert driver.find_element_by_id("id_username").is_displayed()
        assert driver.find_element_by_id("id_password").is_displayed()


if __name__ == "__main__":
    unittest.main()
=======
from selenium import webdriver
from selenium.webdriver.common.keys import Keys

browser = webdriver.Firefox()

browser.get("http://127.0.0.1:8000/login/")
assert 'Login' in browser.title

browser.close()
>>>>>>> django

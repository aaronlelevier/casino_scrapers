import time

from selenium.webdriver.common.keys import Keys


class LoginMixin(object):

    def login(self, username="aaron", password="1234"):
        self.driver.get("http://127.0.0.1:8001/login/")

        username_input = self.wait_for_xhr_request_id("id_username")
        password_input = self.wait_for_xhr_request_id("id_password")

        assert username_input.is_displayed()
        assert password_input.is_displayed()

        username_input.send_keys(username)
        password_input.send_keys(password)
        password_input.send_keys(Keys.RETURN)


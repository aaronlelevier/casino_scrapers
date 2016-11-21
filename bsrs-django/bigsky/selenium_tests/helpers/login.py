from __future__ import absolute_import

from selenium.webdriver.common.keys import Keys

import random


class LoginMixin(object):

    def login(self, username="admin", password="tangobravo"):
        self.driver.get("http://127.0.0.1:8001/dashboard?_={}".format(random.random()))

        username_input = self.driver.find_element_by_id("id_username")
        password_input = self.driver.find_element_by_id("id_password")

        assert username_input.is_displayed()
        assert password_input.is_displayed()

        username_input.send_keys(username)
        password_input.send_keys(password)
        password_input.send_keys(Keys.RETURN)

        self.wait.until(lambda browser: browser.title.lower().startswith('denali'))

import unittest
import time

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By

from helpers import LoginMixin


class PageSelectors(object):

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait = wait

    def find_clickable_element_by_css_selector(self, selector):
        return self._find_clickable_element(selector, By.CSS_SELECTOR)

    def find_clickable_element_by_class_name(self, selector):
        return self._find_clickable_element(selector, By.CLASS_NAME)

    def _find_clickable_element(self, selector, query):
        return self.wait.until(EC.element_to_be_clickable((query, selector)))

    def find_visible_element_by_class_name(self, selector):
        return self.wait.until(EC.visibility_of_element_located((By.CLASS_NAME, selector)))

    def element_not_present(self, element):
        self.wait.until(EC.staleness_of(element))


class TicketPage(PageSelectors):

    def click_ticket_menu_link(self):
        element = self.find_clickable_element_by_class_name('t-nav-tickets')
        element.click()

    def click_item_in_list(self):
        # This selector uses the first column "priority" as an click target
        first_item_selector = '.t-grid-data:nth-child(1) > td:nth-child(2)'
        self.find_clickable_element_by_css_selector(first_item_selector).click()

    def find_create_work_order_button(self):
        return self.find_clickable_element_by_class_name('t-create-work-order-btn')

    def click_create_work_order_button(self):
        self.find_create_work_order_button().click()


class TicketWithoutWorkOrderPage(TicketPage):

    def find_steps_display(self):
        return self.find_visible_element_by_class_name('t-work-order-steps')

    def click_cancel_button(self):
        self.find_clickable_element_by_class_name('t-cancel-work-order').click()


class TicktetWorkOrderTests(LoginMixin, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.set_window_size(1300, 1200)
        self.wait = WebDriverWait(self.driver, 10)
        self.login()
        time.sleep(3)

    def tearDown(self):
        self.driver.close()

    def test_create_and_cancel(self):
        """
        a user can create a new work order and then cancel it
        """
        page = TicketWithoutWorkOrderPage(self.driver, self.wait)

        # User loads the ticket list and clicks through to the details page
        page.click_ticket_menu_link()
        page.click_item_in_list()

        # The user should see a "dispatch work order button"
        page.find_create_work_order_button()

        # User can click to begin the steps to dispatch a new work order
        page.click_create_work_order_button()

        # User should see the steps UI
        element = page.find_steps_display()

        # User can cancel instead
        page.click_cancel_button()

        # Be sure the modal for the steps have gone away
        page.element_not_present(element)


if __name__ == "__main__":
    unittest.main()

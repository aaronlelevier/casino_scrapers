from __future__ import absolute_import

import os
import unittest
import random
import string

from selenium import webdriver

from helpers import (
    LoginMixin, FillInHelper, JavascriptMixin, InputHelper,
    NavPage, GeneralElementsPage, Wait, ModelPage
)

def rand_chars(number=10):
    return ''.join([str(random.choice(string.ascii_letters)) for x in range(number)])


class TicketTests(JavascriptMixin, LoginMixin, FillInHelper, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.wait = webdriver.support.ui.WebDriverWait(self.driver, 10)
        self.login()
        # Wait
        self.driver_wait = Wait(self.driver)
        # Generic Elements
        self.gen_elem_page = GeneralElementsPage(self.driver)
        self.nav_page = NavPage(self.driver)

        # Go to Ticket Area
        self.nav_page.find_ticket_link().click()

    def tearDown(self):
        self.driver.close()

    def test_file_upload(self):
        # Create Ticket Page Object
        ticket_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-ticket-request",
            list_data = "t-grid-data"
        )
        self.wait_for_xhr_request("t-sort-request-dir")
        tickets = ticket_page.find_list_data()
        tickets[0].click()
        # Detail View
        attach_file_btn = self.driver.find_element_by_xpath("//input[@type='file']")
        attach_file_btn.send_keys(os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "source/test_in/es.csv"
        ))
        self.gen_elem_page.click_save_btn()
        # List View
        tickets = ticket_page.find_list_data()
        # tickets[0].click()
        # Detail View
        # TODO: Do page refresh, and confirm Attachment is still there.

    def test_image_upload(self):
        # Create Ticket Page Object
        ticket_page = ModelPage(
            driver = self.driver,
            new_link = "t-add-new",
            list_name = "t-ticket-request",
            list_data = "t-grid-data"
        )
        self.wait_for_xhr_request("t-sort-request-dir")
        tickets = ticket_page.find_list_data()
        tickets[0].click()
        # Detail View
        attach_file_btn = self.driver.find_element_by_xpath("//input[@type='file']")
        attach_file_btn.send_keys(os.path.join(
            os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
            "source/test_in/aaron.jpeg"
        ))
        self.gen_elem_page.click_save_btn()
        # List View
        tickets = ticket_page.find_list_data()
        tickets[0].click()
        # Detail View
        # TODO: Do page refresh, and confirm Attachment is still there.

    # COMMENT OUT: While `Ticket` and `ember-power-select` are WIP
    # def test_ticket(self):
    #     ### CREATE
    #     # Create Ticket Page Object
    #     ticket_page = ModelPage(
    #         driver = self.driver,
    #         new_link = "t-add-new",
    #         list_name = "t-ticket-request",
    #         list_data = "t-grid-data"
    #     )
    #     ticket_page.find_list_data()
    #     # Get to "ticket create view"
    #     ticket_new_link = ticket_page.find_new_link()
    #     ticket_new_link.click()
    #     # Enter info and hit "save"

    #     # will enter once get component in place
    #     ticket_request = rand_chars()
    #     ticket = InputHelper(ticket_request=ticket_request)
    #     self._fill_in_using_class(ticket)
    #     ticket_priority_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-priority-select ')]/div/div")
    #     ticket_priority_input.click()
    #     priority_option = self.driver.find_element_by_class_name("highlighted")
    #     priority_option.click()
    #     ticket_status_input = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-status-select ')]/div/div")
    #     ticket_status_input.click()
    #     status_option = self.driver.find_element_by_class_name("highlighted")
    #     status_option.click()
    #     ticket_location = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-location-select ')]/div/div")
    #     ticket_location.click()
    #     ticket_location_input = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/div/input")
    #     ticket_location_input.send_keys("a")
    #     self.wait_for_xhr_request_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]", debounce=True)
    #     location_option = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]")
    #     location_option.click()
    #     ticket_assignee = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-assignee-select ')]/div/div")
    #     ticket_assignee.click()
    #     ticket_assignee_input = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/div/input")
    #     ticket_assignee_input.send_keys("a")
    #     self.wait_for_xhr_request_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]", debounce=True)
    #     assignee_option = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]")
    #     assignee_option.click()
    #     ticket_category = self.driver.find_element_by_xpath("//*[contains(concat(' ', @class, ' '), ' t-ticket-category-select ')]/div/div")
    #     ticket_category.click()
    #     ticket_category_input = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/div/input")
    #     ticket_category_input.send_keys("a")
    #     self.wait_for_xhr_request_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]", debounce=True)
    #     category_option = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]")
    #     category_option.click()
    #     ticket_category_two = self.driver.find_element_by_xpath("(//div[contains(concat(' ', @class, ' '), ' t-ticket-category-select ')]/div/div)[2]")
    #     ticket_category_two.click()
    #     ticket_category_two_input = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/div/input")
    #     ticket_category_two_input.send_keys("a")
    #     self.wait_for_xhr_request_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]", debounce=True)
    #     category_two_option = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]")
    #     category_two_option.click()
    #     ticket_category_three = self.driver.find_element_by_xpath("(//div[contains(concat(' ', @class, ' '), ' t-ticket-category-select ')]/div/div)[3]")
    #     ticket_category_three.click()
    #     ticket_category_three_input = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/div/input")
    #     ticket_category_three_input.send_keys("a")
    #     self.wait_for_xhr_request_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]", debounce=True)
    #     category_three_option = self.driver.find_element_by_xpath("//*[@id='ember-basic-dropdown-wormhole']/div/ul/li[1]")
    #     category_three_option.click()
    #     self.gen_elem_page.click_save_btn()
    #     # Go to newly created ticket's Detail view
    #     ticket_page.find_list_data()
    #     self.driver.refresh()
    #     ticket_list_view = ticket_page.find_list_name()
    #     new_ticket = ticket_page.click_name_in_list_pages(ticket_request, new_model=None)
    #     try:
    #         new_ticket.click()
    #     except AttributeError as e:
    #         raise e("new ticket not found")
    #     ### UPDATE
    #     # Go to ticket Detail view, Change request and hit "save"
    #     ticket_page.find_wait_and_assert_elem("t-ticket-request", ticket_request)
    #     ticket_request_two = rand_chars()
    #     self.driver.find_element_by_class_name("t-ticket-request").clear()
    #     ticket = InputHelper(ticket_request=ticket_request_two)
    #     self._fill_in_using_class(ticket)
    #     self.gen_elem_page.click_save_btn()
    #     # # List view contains new request
    #     ticket_page.find_list_data()
    #     self.driver.refresh()
    #     ticket_list_view_two = ticket_page.find_list_name()
    #     new_ticket_two = ticket_page.click_name_in_list_pages(ticket_request_two, new_model=None)
    #     try:
    #         new_ticket_two.click()
    #     except AttributeError as e:
    #         raise e("new ticket not found")
    #     ### DELETE
    #     # Go to Ticket Detail view click Delete
    #     self.gen_elem_page.click_dropdown_delete()
    #     self.gen_elem_page.click_delete_btn()
    #     # check Ticket is deleted
    #     self.driver.refresh()
    #     tickets = ticket_page.find_list_data()
    #     ticket_list_view = ticket_page.find_list_name()
    #     # this needs to be improved to look through all the pages
    #     self.assertNotIn(
    #         ticket_request_two,
    #         [r.text for r in ticket_list_view]
    #     )


if __name__ == "__main__":
    unittest.main()

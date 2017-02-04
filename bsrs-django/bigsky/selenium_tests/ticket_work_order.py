import unittest
import time

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait

from helpers import LoginMixin
from helpers.wait_helpers import WaitSelectorsMixin


class TicketPage(WaitSelectorsMixin):

    def __init__(self, driver, wait):
        self.driver = driver
        self.wait = wait

    def click_ticket_menu_link(self):
        element = self.find_clickable_element_by_class_name('t-nav-tickets')
        element.click()

    def click_item_in_list(self, item=1):
        # This selector uses the first column "priority" as an click target
        first_item_selector = '.t-grid-data:nth-child({}) > td:nth-child({})'.format(item, item+1)
        self.find_clickable_element_by_css_selector(first_item_selector).click()

    def find_create_work_order_button(self):
        return self.find_clickable_element_by_class_name('t-create-work-order-btn')

    def click_create_work_order_button(self):
        self.find_create_work_order_button().click()


class TicketWithoutWorkOrderPage(TicketPage):

    def find_steps_display(self):
        return self.find_visible_element_by_class_name('t-work-order-steps')

    def category_is_selected(self):
        """
        Power select for category (trade) is pre-populated no need to search and select
        """
        selected_category = '.t-wo-create-trade-select .ember-power-select-selected-item'
        return self.find_visible_element_by_css_selector(selected_category)

    def choose_a_provider(self):
        self.find_clickable_element_by_class_name('t-wo-create-provider-select').click()
        search_term = 'Joe'
        # Searches for a provider based on fixure data, Joe's… blah is a
        # provider for every category/trade
        self.find_visible_element_by_css_selector(
            '.ember-power-select-search > input').send_keys(search_term)
        search_result_selector = '.ember-power-select-option:nth-child(1)'
        self.text_present_in_element_by_css_selector(search_result_selector, search_term)
        self.find_clickable_element_by_css_selector(search_result_selector).click()

    def click_primary_button(self):
        self.find_primary_button().click()

    def click_primary_button_and_wait(self):
        btn = self.find_primary_button()
        btn.click()
        self.element_not_present(btn)

    def find_primary_button(self):
        return self.find_visible_element_by_css_selector('.ember-modal-dialog .btn-primary')

    def click_next_button(self):
        self.find_primary_button()
        self.find_clickable_element_by_class_name('t-next-btn').click()

    def find_nte_input(self):
        return self.find_clickable_element_by_css_selector('[data-test-id="approved_amount"]')

    def fill_in_nte(self, cost):
        self.find_clickable_element_by_class_name('t-wo-approved_amount').send_keys(cost)

    def pick_scheduled_date(self):
        # Date selector is using a pika-day component, find today (selected by default)
        self.find_visible_element_by_class_name('t-scheduled-date').click()
        current_day_selector = '.pika-single:not(.is-hidden) .pika-table .is-today button'
        self.find_clickable_element_by_css_selector(current_day_selector).click()
        self.find_invisible_element_by_css_selector('.pika-single.is-hidden')

    def find_third_and_active_step(self):
        # check the steps indicator to confirm that 3rd step is active (the confirm step)
        active_step_selector = '.t-status-tracker .timeline__item--active:nth-child(3)'
        return self.find_visible_element_by_css_selector(active_step_selector)

    def find_done_button(self):
        modal_btn_selector = '.modal-footer .btn-default'
        return self.find_clickable_element_by_css_selector(modal_btn_selector)


class TicktetWorkOrderTests(LoginMixin, unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Firefox()
        self.driver.set_window_size(1300, 1200)
        self.wait = WebDriverWait(self.driver, 10)
        self.login()
        time.sleep(3)

    def tearDown(self):
        self.driver.close()

    def test_dispatch_new(self):
        """
        User can dispatch new work order from the ticket details page
        """
        page = TicketWithoutWorkOrderPage(self.driver, self.wait)
        # User loads the ticket list and clicks through to the details page
        page.click_ticket_menu_link()
        page.click_item_in_list(2)
        # The user should see a "dispatch work order button"
        page.find_create_work_order_button()
        # User can click to begin the steps to dispatch a new work order
        page.click_create_work_order_button()
        # User should see the steps UI
        page.find_steps_display()
        # The category is already selected in the first step
        page.category_is_selected()
        # User can search and select a provided based on selected category
        page.choose_a_provider()
        # User can click 'next' to move on to the second step
        page.click_next_button()
        # The second step has an input for NTE (approved amount) value
        page.find_nte_input()
        # Can input an approved amount
        page.fill_in_nte(100)
        # Select a scheduled date
        page.pick_scheduled_date()
        # User can click 'next' to move on to confirm
        page.click_next_button()
        # User is on the confirm page
        page.find_third_and_active_step()
        # User dispatches work order
        page.click_primary_button_and_wait()
        # Final screen indicates success and has done button to dismiss
        done_btn = page.find_done_button()
        # Click done to dismiss modal
        done_btn.click()
        # Be sure the modal for the steps have gone away
        page.element_not_present(done_btn)


    def test_update(self):
        """
        User can go to a Ticket with an existing WorkOrder and update the WorkOrder
        """
        page = TicketWithoutWorkOrderPage(self.driver, self.wait)
        # User loads the ticket list and clicks through to the details page
        page.click_ticket_menu_link()
        page.click_item_in_list()
        # expand work order
        page.find_clickable_element_by_class_name('work-order-collapsed').click()
        # edit gl_code
        page.find_clickable_element_by_class_name('t-wo-gl_code0').send_keys(1)
        # edit instructions
        page.find_clickable_element_by_class_name('t-instructions').send_keys(1)
        # save btn is active, so can be clicked
        self.assertTrue(page.find_visible_element_by_class_name('t-save-btn').is_enabled())
        # save
        page.find_clickable_element_by_class_name('t-save-btn').click()
        # redirected to list
        page.find_clickable_element_by_class_name('t-add-new')


if __name__ == "__main__":
    unittest.main()

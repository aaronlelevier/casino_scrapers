class GeneralElementsPage(object):
    '''
    Page objects for general DOM nodes
    '''
    def __init__(self, driver):
        self.driver = driver

    def find_add_btn(self):
        return self.driver.find_element_by_class_name("t-add-phone-number-btn")

    def find_add_address_btn(self):
        return self.driver.find_element_by_class_name("t-add-address-btn")

    def find_add_email_btn(self):
        return self.driver.find_element_by_class_name("t-add-email-btn")

    def click_save_btn(self):
        self.driver.find_element_by_class_name("t-save-btn").click()

    def click_delete_btn(self):
        self.driver.find_element_by_class_name("t-delete-btn").click()

    def click_delete_yes(self):
        self.driver.find_element_by_class_name("t-modal-delete-btn").click()

    def click_dropdown_delete(self):
        self.driver.find_element_by_xpath("//*[contains(@class, 't-crud-buttons')]/button[contains(@class, 't-dropdown-delete')]").click()

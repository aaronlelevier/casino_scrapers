import time


class JavascriptMixin(object):
    """
    Wait for a jQuery ``$.active`` flag before returning the element.

    Can only be Mixed-in with classes containing a Selenium driver because 
    requires the driver to check for elements.
    """
    
    def wait_for_xhr_request(self, selector, plural=False, just_refreshed=False, debounce=False):
        if debounce:
            time.sleep(.5)
        for w in range(10):
            print("waiting for xhr callback...{}".format(selector))
            if self.driver.execute_script("return $.active") == 0:
                if plural:
                    element = self.driver.find_elements_by_class_name(selector)
                    assert len(element) > 0
                else:
                    element = self.driver.find_element_by_class_name(selector)
                    assert element.is_displayed()
                return element
            if just_refreshed:
                time.sleep(2)
            else:
                time.sleep(1)

    def wait_for_xhr_request_xpath(self, selector, plural=False, just_refreshed=False, debounce=False):
        if debounce:
            time.sleep(.5)
        for w in range(10):
            print("waiting for xhr callback...{}".format(selector))
            if self.driver.execute_script("return $.active") == 0:
                if plural:
                    element = self.driver.find_element_by_xpath(selector)
                    assert len(element) > 0
                else:
                    element = self.driver.find_element_by_xpath(selector)
                return element
            if just_refreshed:
                time.sleep(2)
            else:
                time.sleep(1)

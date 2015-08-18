import time

from selenium.common.exceptions import NoSuchElementException


class JavascriptMixin(object):

    def wait_for_xhr_request(self, selector, plural=False):
        for w in range(10):
            print "waiting for xhr callback...{}".format(selector)
            if(self.driver.execute_script("return $.active") == 0):
                if(plural):
                    element = self.driver.find_elements_by_class_name(selector)
                    assert len(element) > 0
                else:
                    element = self.driver.find_element_by_class_name(selector)
                    assert element.is_displayed()
                return element
            time.sleep(1)

    def wait_for_element_by_id(self, selector):
        for i in range(10):
            print "waiting for element_by_id"
            try:
                element = self.driver.find_element_by_id(selector)
            except NoSuchElementException:
                time.sleep(1)
            else:
                return element

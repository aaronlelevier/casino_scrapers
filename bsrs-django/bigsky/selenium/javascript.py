import time


class JavascriptMixin(object):

    def wait_for_xhr_request(self, selector):
        for w in range(1, 10):
            print "waiting for xhr callback..."
            if(self.driver.execute_script("return $.active") == 0):
                element = self.driver.find_element_by_class_name(selector)
                assert element.is_displayed()
                return element
            time.sleep(1)

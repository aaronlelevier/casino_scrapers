class FillInHelper(object):
    def _fill_in(self, person):
        print person
        for k, v in person.__dict__.iteritems():
            setattr(self, k + '_input', self.find_id_element(k))
            inputrr = getattr(self, k + '_input')
            inputrr.send_keys(v)


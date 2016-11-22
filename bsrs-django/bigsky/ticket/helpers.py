import copy

from category.models import Category
from person.models import Person
from generic.models import Attachment
from ticket.models import TicketActivityType


class TicketActivityToRepresentation(object):

    def __init__(self, data):
        self.data = copy.deepcopy(data)
        self.type = TicketActivityType.objects.get(id=self.data['type'])

    def get_data(self):
        if self.data['content']:
            if self.type.name == TicketActivityType.ASSIGNEE:
                self.set_assignee_data()
            elif self.type.name == TicketActivityType.SEND_EMAIL:
                self.set_person_data()
            elif self.type.name == TicketActivityType.SEND_SMS:
                self.set_person_data()
            elif self.type.name == TicketActivityType.CC_ADD:
                self.set_person_list_data_with_key(key='added')
            elif self.type.name == TicketActivityType.CC_REMOVE:
                self.set_person_list_data_with_key(key='removed')
            elif self.type.name == TicketActivityType.CATEGORIES:
                self.set_category_data()
            elif self.type.name == TicketActivityType.ATTACHMENT_ADD:
                self.set_attachment_list_data_with_key(key='added')

        self.data.update({'type': self.type.name})

        return self.data

    def set_assignee_data(self):
        for k,v in self.data['content'].items():
            person = Person.objects_all.get(id=v)
            self.data['content'][k] = person.to_simple_fullname_dict()

    def set_person_data(self):
        self.data['content'] = (Person.objects.filter(id__in=self.data['content'])
                                              .values('id', 'fullname'))

    def set_person_list_data_with_key(self, key):
        person_ids = list(self.data['content'].values())
        self.data['content'] = {key: []}

        for id in person_ids:
            person = Person.objects_all.get(id=id)
            self.data['content'][key].append(person.to_simple_fullname_dict())

    def set_attachment_list_data_with_key(self, key):
        attachment_ids = list(self.data['content'].values())
        self.data['content'] = {key: []}

        for id in attachment_ids:
            attachment = Attachment.objects_all.get(id=id)
            self.data['content'][key].append(attachment.to_dict())

    def set_category_data(self):
        self.set_category_with_key('from')
        self.set_category_with_key('to')

    def set_category_with_key(self, key):
        categories = list(v for k,v in self.data['content'].items() if k.startswith('{}_'.format(key)))
        self.data['content'].update({key: []})

        for id in categories:
            category = Category.objects_all.get(id=id)
            self.data['content'][key].append(category.to_simple_dict())

        for i, _ in enumerate(self.data['content'][key]):
            self.data['content'].pop('{}_{}'.format(key,i))

        if 'from' in self.data['content']:
            self.data['content']['from'].sort(key=lambda x: x['level'])
        if 'to' in self.data['content']:
            self.data['content']['to'].sort(key=lambda x: x['level'])

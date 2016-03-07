CURRENCY_CHOICES = (
    ('admin.currency.usd'), ('USD'),
    ('admin.currency.eur'), ('EUR'),
    ('admin.currency.jpy'), ('JPY'),
)

PERSON_STATUS_CHOICES = (
    ('admin.person.status.active', 'Active'),
    ('admin.person.status.inactive', 'Inactive'),
    ('admin.person.status.expired', 'Expired'),
)

CATEGORY_STATUS_CHOICES = (
    ('admin.category.status.active', 'Active'),
    ('admin.category.status.inactive', 'Inactive'),
)

ROLE_TYPE_CHOICES = (
    ('admin.role.type.internal', 'Internal'),
    ('admin.role.type.third_party', 'Third Party'),
)

INVOICE_CHOICES = (
    ('admin.invoice.new', 'New'),
    ('admin.invoice.draft', 'Draft'),
)

INVOICE_SELECT_ASSIGN_CHOICES = (
    ('admin.invoice.select_assign.all', 'All'),
    ('admin.invoice.select_assign.managers', 'Managers'),
)

CLOSE_WO_ON_APPROVAL_CHOICES = (
    ('admin.work_order.close.do_not_display', 'Do not display'),
    ('admin.work_order.close.unchecked', 'Unchecked'),
    ('admin.work_order.close.checked', 'Checked'),
)

THIRD_PARTY_STATUS_CHOICES = (
    ('admin.third_party.status.active', 'Active'),
    ('admin.third_party.status.inactive', 'Inactive'),
)

TICKET_STATUS_CHOICES = (
    ('ticket.status.new'), ('New'),
    ('ticket.status.deferred'), ('Deferred'),
    ('ticket.status.in_progress'), ('In Progress'),
    ('ticket.status.complete'), ('Complete'),
    ('ticket.status.denied'), ('Denied'),
    ('ticket.status.problem_solved'), ('Problem solved'),
    ('ticket.status.draft'), ('Draft'),
    ('ticket.status.unsatisfactory'), ('Unsatisfactory'),
)

TICKET_PRIORITY_CHOICES = (
    ('ticket.priority.emergency'), ('Emergency'),
    ('ticket.priority.high'), ('High'),
    ('ticket.priority.low'), ('Low'),
    ('ticket.priority.medium'), ('Medium'),
)

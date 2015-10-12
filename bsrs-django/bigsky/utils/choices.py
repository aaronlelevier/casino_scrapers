CURRENCY_CHOICES = (
    ('usd', 'usd'),
    ('eur', 'eur'),
    ('jpy', 'jpy'),
)

PERSON_STATUS_CHOICES = (
    ('active', 'active'),
    ('two', 'two'),
)

CATEGORY_STATUS_CHOICES = (
    ('Active', 'Active'),
    ('Inactive', 'Inactive'),
)

ROLE_TYPE_CHOICES = (
    ('Internal', 'Internal'),
    ('Third Party', 'Third Party'),
)

INVOICE_CHOICES = (
    ('new', 'new'),
    ('draft', 'draft'),
)

INVOICE_SELECT_ASSIGN_CHOICES = (
    ('all', 'all'),
    ('managers', 'managers'),
)

CLOSE_WO_ON_APPROVAL_CHOICES = (
    ('Do not display', 'Do not display'),
    ('unchecked', 'unchecked'),
    ('checked', 'checked'),
)

THIRD_PARTY_STATUS_CHOICES = (
    ('active', 'active'),
    ('two', 'two'),
)

TICKET_STATUS_CHOICES = (
    ('New', 'New'),
    ('Deferred', 'Deferred'),
    ('In Progress', 'In Progress'),
    ('Complete', 'Complete'),
    ('Denied', 'Denied'),
    ('Problem Solved', 'Problem Solved'),
    ('Draft', 'Draft'),
    ('Unsatisfactory Completion', 'Unsatisfactory Completion'),
)

TICKET_PRIORITY_CHOICES = (
    ('Emergency', 'Emergency'),
    ('High', 'High'),
    ('Medium', 'Medium'),
    ('Low', 'Low'),
)

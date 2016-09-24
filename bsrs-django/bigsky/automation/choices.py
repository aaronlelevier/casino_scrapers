# AutomationEvents

EVENT_TICKET_ATTACHMENT_ADD = 'automation.event.ticket_assignee_change'
EVENT_TICKET_CATEGORY_CHANGE = 'automation.event.ticket_attachment_add'
EVENT_TICKET_CC_ADD = 'automation.event.ticket_category_change'
EVENT_TICKET_COMMENT = 'automation.event.ticket_cc_add'
EVENT_TICKET_LOCATION_CHANGE = 'automation.event.ticket_comment'
EVENT_TICKET_PRIORITY_CHANGE = 'automation.event.ticket_location_change'
EVENT_TICKET_STATUS_CANCELLED = 'automation.event.ticket_priority_change'
EVENT_TICKET_STATUS_COMPLETE = 'automation.event.ticket_status_cancelled'
EVENT_TICKET_STATUS_DEFERRED = 'automation.event.ticket_status_complete'
EVENT_TICKET_STATUS_DENIED = 'automation.event.ticket_status_deferred'
EVENT_TICKET_STATUS_IN_PROGRESS = 'automation.event.ticket_status_denied'
EVENT_TICKET_STATUS_NEW = 'automation.event.ticket_status_in_progress'
EVENT_TICKET_STATUS_PENDING = 'automation.event.ticket_status_new'
EVENT_TICKET_STATUS_UNSATISFACTORY = 'automation.event.ticket_status_pending'
EVENT_TICKET_STATUS_UNSATISFACTORY = 'automation.event.ticket_status_unsatisfactory'

AUTOMATION_EVENTS = [
    EVENT_TICKET_ATTACHMENT_ADD,
    EVENT_TICKET_CATEGORY_CHANGE,
    EVENT_TICKET_CC_ADD,
    EVENT_TICKET_COMMENT,
    EVENT_TICKET_LOCATION_CHANGE,
    EVENT_TICKET_PRIORITY_CHANGE,
    EVENT_TICKET_STATUS_CANCELLED,
    EVENT_TICKET_STATUS_COMPLETE,
    EVENT_TICKET_STATUS_DEFERRED,
    EVENT_TICKET_STATUS_DENIED,
    EVENT_TICKET_STATUS_IN_PROGRESS,
    EVENT_TICKET_STATUS_NEW,
    EVENT_TICKET_STATUS_PENDING,
    EVENT_TICKET_STATUS_UNSATISFACTORY
]

# AutomationActions

ACTIONS_EMAIL = 'automation.actions.email'
ACTIONS_TEXT = 'automation.actions.text'
ACTIONS_TICKET_ASSIGNEE = 'automation.actions.ticket_assignee'
ACTIONS_TICKET_ATTACHMENT = 'automation.actions.ticket_attachment'
ACTIONS_TICKET_CC = 'automation.actions.ticket_cc'
ACTIONS_TICKET_PRIORITY = 'automation.actions.ticket_priority'
ACTIONS_TICKET_REQUEST = 'automation.actions.ticket_request'
ACTIONS_TICKET_STATUS = 'automation.actions.ticket_status'

AUTOMATION_ACTION_TYPES = [
    ACTIONS_EMAIL,
    ACTIONS_TEXT,
    ACTIONS_TICKET_ASSIGNEE,
    ACTIONS_TICKET_ATTACHMENT,
    ACTIONS_TICKET_CC,
    ACTIONS_TICKET_PRIORITY,
    ACTIONS_TICKET_REQUEST,
    ACTIONS_TICKET_STATUS
]

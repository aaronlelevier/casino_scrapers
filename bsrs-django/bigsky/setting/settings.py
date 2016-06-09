GENERAL_SETTINGS = {
    "company_code": {
        "value": "One",
    },
    "company_name": {
        "value": "Andy's Pianos",
    },
    "dashboard_text": {
        "value": "Welcome",
    },
    "login_grace": {
        "value": 1,
    },
    "exchange_rates": {
        "value": 1.0,
    },
    "tickets_module": {
        "value": True
    },
    "work_orders_module": {
        "value": True
    },
    "invoices_module": {
        "value": True
    },
    "test_mode": {
        "value": False,
    },
    "test_contractor_email": {
        "value": "test@bigskytech.com",
    },
    "test_contractor_phone": {
        "value": "+18587155000",
    },
    "dt_start_id": {
        "value": "011530c4-ce6c-4724-9cfd-37a16e787001",
    },
    "default_currency_id": {
        "value": "009530c4-ce6c-4724-9cfd-37a16e787001"
    }
}

ROLE_SETTINGS = {
    "create_all": {
        "value": True,
    },
    "accept_assign": {
        "value": False,
    },
    "accept_notify": {
        "value": False,
    },
    "dashboard_text": {
        "inherits_from": "general",
    }
}

PERSON_SETTINGS = {
    "accept_assign": {
        "inherits_from": "role"
    },
    "accept_notify": {
        "inherits_from": "role"
    },
    "password_one_time": {
        "value": False,
    }
}

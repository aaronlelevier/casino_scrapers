GENERAL_SETTINGS = {
    "company_code": {
        "value": "One",
        "type": "str"
    },
    "company_name": {
        "value": "Andy's Pianos",
        "type": "str",
    },
    "dashboard_text": {
        "value": "Welcome",
        "type": "str",
    },
    "login_grace": {
        "value": 1,
        "type": "int",
    },
    "exchange_rates": {
        "value": 1.0,
        "type": "float",
    },
    "modules": {
        "value": [],
        "type": "list",
    },
    "test_mode": {
        "value": False,
        "type": "bool",
    },
    "email": {
        "value": "test@bigskytech.com",
        "type": "email",
    },
    "test_contractor_phone": {
        "value": "+18587155000",
        "type": "phone",
    },
    "dt_start_key": {
        "value": "Start",
        "type": "str",
    }
}

ROLE_SETTINGS = {
    "create_all": {
        "value": True,
        "type": "bool",
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
        "type": "bool"
    }
}

schema = {
    "type": "object",
    "properties": {
        "welcome_text": {
            "type": "string",
            "minLength": 2,
            "maxLength": 10
        },
        "test_mode": {
            "type": "boolean"
        }
    },
    "required": ["welcome_text", "test_mode"]
}

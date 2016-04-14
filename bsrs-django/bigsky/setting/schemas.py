schema = {
    "type": "object",
    "properties": {
        "welcome_text": {
            "type": "string",
            "minLength": 2,
            "maxLength": 10
        }
    },
    "required": ["welcome_text"]
}

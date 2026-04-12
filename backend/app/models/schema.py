from pydantic import BaseModel

# Request body schema

class TextInput(BaseModel):
    text: str
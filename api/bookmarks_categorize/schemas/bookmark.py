from pydantic import BaseModel

class Request:
    pass

class Response:
    class categorizeBookmark(BaseModel):
        categorized_bookmark_json: list[dict] = []
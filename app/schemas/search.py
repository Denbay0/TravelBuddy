from app.schemas.common import CamelModel
from app.schemas.posts import PostOut
from app.schemas.routes import RouteOut


class SearchResponse(CamelModel):
    query: str
    routes: list[RouteOut]
    posts: list[PostOut]

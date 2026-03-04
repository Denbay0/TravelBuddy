from app.schemas.common import CamelModel
from app.schemas.posts import PostOut
from app.schemas.routes import RouteOut


class SearchUserOut(CamelModel):
    id: int
    name: str
    handle: str
    avatar_url: str


class SearchResponse(CamelModel):
    query: str
    routes: list[RouteOut]
    posts: list[PostOut]
    users: list[SearchUserOut]

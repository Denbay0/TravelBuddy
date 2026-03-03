from app.schemas.common import PaginatedResponse
from app.schemas.common import CamelModel


class PopularUserOut(CamelModel):
    id: int
    name: str
    handle: str
    posts_count: int
    followers_count: int


class PopularUsersResponse(PaginatedResponse[PopularUserOut]):
    pass

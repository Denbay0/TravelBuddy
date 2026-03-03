from pydantic import BaseModel

from app.schemas.common import PaginatedResponse


class PopularUserOut(BaseModel):
    id: int
    name: str
    handle: str
    postsCount: int
    followersCount: int


class PopularUsersResponse(PaginatedResponse[PopularUserOut]):
    pass

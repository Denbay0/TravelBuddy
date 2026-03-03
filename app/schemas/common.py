from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict


def _to_camel_case(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        populate_by_name=True,
        alias_generator=_to_camel_case,
    )

T = TypeVar("T")


class PaginatedResponse(CamelModel, Generic[T]):
    items: list[T]
    page: int
    limit: int
    total: int

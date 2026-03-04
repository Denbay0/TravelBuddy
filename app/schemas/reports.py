from app.schemas.common import CamelModel


class ReportExampleResponse(CamelModel):
    title: str
    summary: str
    highlights: list[str]

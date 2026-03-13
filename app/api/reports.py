from datetime import datetime, timezone
from io import BytesIO

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.api.routes import _parse_route_data
from app.db.database import get_db
from app.db.models import Route, User
from app.schemas.reports import ReportExampleResponse

router = APIRouter(prefix="/reports", tags=["reports"])


def _render_pdf(title: str, lines: list[str]) -> bytes:
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    y = height - 60
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(40, y, title)
    y -= 30

    pdf.setFont("Helvetica", 11)
    for line in lines:
        if y < 60:
            pdf.showPage()
            y = height - 60
            pdf.setFont("Helvetica", 11)
        pdf.drawString(40, y, line)
        y -= 18

    pdf.save()
    return buffer.getvalue()


@router.get("/example", response_model=ReportExampleResponse)
def get_example_report() -> ReportExampleResponse:
    return ReportExampleResponse(
        title="TravelBuddy Demo Report",
        summary="Пример отчёта по поездке с ключевыми метриками.",
        highlights=[
            "5 городов за 8 дней",
            "Суммарная дистанция: 1260 км",
            "Транспорт: Поезд + Пешком",
        ],
    )


@router.get("/example/pdf")
def download_example_report_pdf() -> Response:
    content = _render_pdf(
        "TravelBuddy Example Report",
        [
            f"Generated at: {datetime.now(timezone.utc).isoformat()}",
            "",
            "Маршрут: Рим -> Флоренция -> Милан",
            "Длительность: 6 дней",
            "Оценочная дистанция: 730 км",
            "Рекомендация: бронь транспорта за 2 недели.",
        ],
    )
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="travelbuddy-example-report.pdf"'},
    )


@router.get("/routes/{route_id}/pdf")
def download_route_report_pdf(
    route_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Response:
    route = db.scalar(select(Route).where(Route.id == route_id))
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    cities, _, distance_km, note = _parse_route_data(route.cities)
    lines = [
        f"Owner: {route.owner.username}",
        f"Generated for: {current_user.username}",
        f"Title: {route.title}",
        f"Duration (days): {route.duration_days}",
        f"Transport: {route.transport}",
        f"Cities: {' -> '.join(cities) if cities else 'N/A'}",
        f"Distance (km): {distance_km}",
        f"Description: {route.description or '-'}",
        f"Note: {note or '-'}",
    ]
    content = _render_pdf(f"Route report #{route.id}", lines)
    return Response(
        content=content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="route-{route.id}-report.pdf"'},
    )

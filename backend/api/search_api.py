from fastapi import APIRouter
from tools.pdf_search_tool import search_pdf
from tools.csv_search_tool import search_csv

router = APIRouter()

@router.get("/search")
def search(q: str):

    pdf_result = search_pdf(q)
    csv_result = search_csv(q)

    return {
        "pdf": pdf_result,
        "csv": csv_result
    }
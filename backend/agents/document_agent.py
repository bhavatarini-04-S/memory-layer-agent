from tools.pdf_search_tool import search_pdf
from tools.csv_search_tool import search_csv

def document_agent(query):

    pdf_data = search_pdf(query)
    csv_data = search_csv(query)

    return {
        "pdf": pdf_data,
        "csv": csv_data
    }
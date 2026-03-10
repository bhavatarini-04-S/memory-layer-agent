from pypdf import PdfReader

def search_pdf(query):

    reader = PdfReader("datasets/reports.pdf")

    results = []

    for page in reader.pages:
        text = page.extract_text()
        if query.lower() in text.lower():
            results.append(text)

    return results[:2]
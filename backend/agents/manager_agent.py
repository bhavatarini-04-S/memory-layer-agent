from tools.pdf_search_tool import search_pdf
from tools.csv_search_tool import search_csv
from tools.notes_search_tool import search_notes
from tools.email_search_tool import search_email

def manager_agent(query):

    if "budget" in query.lower():
        return search_pdf(query)

    if "venue" in query.lower():
        return search_csv(query)

    if "email" in query.lower():
        return search_email(query)

    return search_notes(query)
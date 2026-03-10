def search_notes(query):

    with open("datasets/meeting_notes.txt") as f:
        text = f.read()

    if query.lower() in text.lower():
        return text

    return "No match in notes"
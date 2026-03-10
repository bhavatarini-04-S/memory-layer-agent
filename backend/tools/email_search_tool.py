import pandas as pd

def search_email(query):

    df = pd.read_csv("datasets/emails.csv")

    results = df[df["message"].str.contains(query, case=False)]

    return results.to_dict(orient="records")
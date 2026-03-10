import pandas as pd

def search_csv(query):

    df = pd.read_csv("datasets/events.csv")

    results = df[df.apply(
        lambda row: row.astype(str).str.contains(query, case=False).any(),
        axis=1
    )]

    return results.to_dict(orient="records") 
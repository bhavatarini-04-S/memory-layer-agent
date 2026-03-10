def answer_agent(data):

    if isinstance(data, dict):
        return f"Found information: {data}"

    return f"Answer: {data}"
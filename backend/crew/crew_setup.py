from agents.manager_agent import manager_agent
from agents.answer_agent import answer_agent

def run_crew(query):

    data = manager_agent(query)

    answer = answer_agent(data)

    return answer
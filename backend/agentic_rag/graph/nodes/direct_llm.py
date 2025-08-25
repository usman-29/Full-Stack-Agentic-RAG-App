from typing import Any, Dict

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from graph.state import GraphState


# Direct LLM chain for simple questions
# Slightly higher temperature for more natural responses
llm = ChatOpenAI(temperature=0.7)

direct_llm_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful AI assistant. Answer the user's question directly and conversationally. Keep responses concise and friendly."),
    ("human", "{question}")
])

direct_llm_chain = direct_llm_prompt | llm | StrOutputParser()


def direct_llm_response(state: GraphState) -> Dict[str, Any]:
    """
    Generate a direct response using LLM without retrieval or web search.
    Used for generic questions, small talk, and simple queries.

    Args:
        state (GraphState): The current state of the graph.

    Returns:
        Dict[str, Any]: A dictionary containing the generated response and the question
    """
    print("---DIRECT LLM RESPONSE---")
    question = state["question"]

    generation = direct_llm_chain.invoke({"question": question})

    return {
        "generation": generation,
        "question": question,
        "documents": [],  # No documents used for direct response
        "use_web_search": False
    }

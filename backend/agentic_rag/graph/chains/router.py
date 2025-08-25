from typing import Literal

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI


class RouteQuery(BaseModel):
    """Route a user query to the most relevant datasource."""

    datasource: Literal["vectorstore", "web_search", "direct_llm"] = Field(
        ...,
        description="Route the user query to the vectorstore, websearch, or direct LLM. Available options are 'vectorstore', 'web_search', or 'direct_llm'",
    )


llm = ChatOpenAI(temperature=0)
structured_llm_router = llm.with_structured_output(RouteQuery)

message = """You are an expert at routing a user question to the most appropriate source.

Available routes:
1. 'vectorstore' - For questions about machine learning concepts such as: agents, prompt engineering, and adversarial attacks.
2. 'direct_llm' - For generic questions, small talk, greetings, simple math, basic conversations, or questions that don't require external knowledge.
3. 'web_search' - For specific factual questions, current events, or topics not covered by the vectorstore that require external information.

Choose 'direct_llm' for casual conversation and simple queries that can be answered directly without needing external sources."""
router_prompt = ChatPromptTemplate.from_messages(
    [("system", message), ("human", "{question}")]
)

question_router = router_prompt | structured_llm_router

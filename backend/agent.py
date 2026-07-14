from typing import Annotated, TypedDict
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from agent_tools import ALL_TOOLS
from dotenv import load_dotenv
import os
import uuid

load_dotenv()

SYSTEM_PROMPT = """You are an AI assistant for a pharmaceutical CRM system, specifically the HCP (Healthcare Professional) module. You help field sales representatives log, manage, and review their interactions with doctors and other healthcare professionals.

Your capabilities:
1. **Log Interaction** - Record new meetings, calls, detail aids, sample drops, and other interactions with HCPs.
2. **Edit Interaction** - Modify previously logged interaction records.
3. **Search HCP** - Find healthcare professionals by name, specialty, institution, or city.
4. **Get Interaction History** - Review past interactions with a specific HCP.
5. **Schedule Follow-up** - Create follow-up tasks tied to HCPs and interactions.

When a user describes an interaction in natural language, extract the relevant information:
- Which HCP (search if needed)
- Type of interaction (meeting, call, email, etc.)
- Date and duration
- Products discussed
- Key topics covered
- Sentiment (positive/neutral/negative)
- Whether follow-up is needed

Always confirm the details with the user before logging. Be conversational and helpful.
If the user provides free-text notes, summarize the key points.
When dates are relative (e.g., "today", "yesterday"), use the current date context.

Current date context: Use ISO format for dates (YYYY-MM-DDTHH:MM:SS).
"""


class AgentState(TypedDict):
    messages: Annotated[list, add_messages]


def create_agent():
    llm = ChatGroq(
        model="llama-3.3-70b-versatile",
        api_key=os.getenv("GROQ_API_KEY"),
        temperature=0.3,
    )

    llm_with_tools = llm.bind_tools(ALL_TOOLS)

    def call_model(state: AgentState):
        messages = state["messages"]
        if not messages or not isinstance(messages[0], SystemMessage):
            messages = [SystemMessage(content=SYSTEM_PROMPT)] + messages
        response = llm_with_tools.invoke(messages)
        return {"messages": [response]}

    def should_continue(state: AgentState):
        last_message = state["messages"][-1]
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            return "tools"
        return END

    tool_node = ToolNode(ALL_TOOLS)

    graph = StateGraph(AgentState)
    graph.add_node("agent", call_model)
    graph.add_node("tools", tool_node)
    graph.set_entry_point("agent")
    graph.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
    graph.add_edge("tools", "agent")

    return graph.compile()


conversation_store: dict[str, list] = {}


def get_or_create_conversation(conversation_id: str | None) -> tuple[str, list]:
    if conversation_id and conversation_id in conversation_store:
        return conversation_id, conversation_store[conversation_id]
    new_id = conversation_id or str(uuid.uuid4())
    conversation_store[new_id] = [SystemMessage(content=SYSTEM_PROMPT)]
    return new_id, conversation_store[new_id]


async def chat_with_agent(message: str, conversation_id: str | None = None) -> dict:
    conv_id, messages = get_or_create_conversation(conversation_id)

    messages.append(HumanMessage(content=message))

    agent = create_agent()
    result = await agent.ainvoke({"messages": messages})

    updated_messages = result["messages"]
    conversation_store[conv_id] = updated_messages

    last_ai_message = None
    tool_calls_made = []
    for msg in reversed(updated_messages):
        if isinstance(msg, AIMessage) and msg.content and not getattr(msg, "tool_calls", None):
            last_ai_message = msg
            break

    for msg in updated_messages:
        if hasattr(msg, "tool_calls") and msg.tool_calls:
            tool_calls_made.extend([
                {"tool": tc["name"], "args": tc["args"]}
                for tc in msg.tool_calls
            ])

    response_text = last_ai_message.content if last_ai_message else "I've processed your request."

    return {
        "response": response_text,
        "conversation_id": conv_id,
        "tool_calls": tool_calls_made if tool_calls_made else None,
    }

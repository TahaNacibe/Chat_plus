from typing import Optional
from prompts.mode_prompt_list import handleModeToPrompt
from services.memory_services import MemoryServices
from prompts.rules import rules
from prompts.output import output_structure
from services.library_services import RAGServices


def build_context(
    chat_history: list[str],
    memory_service: MemoryServices, 
    ragServices: RAGServices, 
    current_user_input: str,
    need_title: bool,
    mode: Optional[str],
    chat_id: str,
    user_settings: str,
    include_rag: bool = False
) -> str:
    
    # Last N messages with better formatting
    last_messages = "\n".join(
        f"{msg['role']}: {msg['content']}" 
        for msg in chat_history[-8:] 
        if isinstance(msg, dict) and "role" in msg and "content" in msg
    )

    # Get mode-specific prompt
    mode_prompt = handleModeToPrompt(mode)

    # Title generation request
    request_chat_title = (
        "When the user message contains meaningful or specific content (not generic greetings like 'hello', 'hi', etc.), "
        "generate a concise, descriptive chat title that captures the main topic or request. "
        "Include this title in a backend block using: [BLOCK:{\"type\":\"title\", \"lang\":\"eng\"}]title content[/BLOCK]. "
        "Generate the title immediately when you identify a clear topic from the message. "
        "Never mention title generation or the title block structure in your conversation with the user. "
        "The title should be 3-8 words maximum and clearly represent the conversation topic."
        if need_title else ""
    )

    # Memory recall with error handling
    try:
        memory_hits = memory_service.fetch(query=current_user_input, chat_id=chat_id, k=10)
        memory_context = "\n".join(memory_hits) if memory_hits else "No relevant memories found."
    except Exception:
        memory_context = "Memory service unavailable."

    # RAG recall with error handling
    rag_context = ""
    if include_rag:
        try:
            rag_chunks = ragServices.rag_query(question=current_user_input, chat_id=chat_id)
            rag_context = "\n".join(rag_chunks) if rag_chunks else "No relevant documents found."
        except Exception:
            rag_context = "Document retrieval service unavailable."

    # Build context sections conditionally
    context_sections = []
    
    # Always include core sections
    context_sections.extend([
        f"RULES\n{rules}",
        f"OUTPUT FORMAT\n{output_structure}"
    ])
    
    # Add personalization if provided
    if user_settings and user_settings.strip():
        context_sections.append(f"USER PERSONALIZATION\n{user_settings}")
    
    # Add mode-specific instructions
    if mode_prompt:
        context_sections.append(f"CURRENT MODE\n{mode_prompt}")
    
    # Add conversational context if available
    if last_messages.strip():
        context_sections.append(f"RECENT CHAT HISTORY\n{last_messages}")
    
    # Add memory context if available
    if memory_context and memory_context.strip() and memory_context != "No relevant memories found.":
        context_sections.append(f"RELEVANT MEMORIES\n{memory_context}")
    
    # Add RAG context if enabled and available
    if include_rag and rag_context and rag_context.strip() and rag_context != "No relevant documents found.":
        context_sections.append(f"RETRIEVED DOCUMENT CHUNKS\n{rag_context}")
    
    # Add title request if needed
    if request_chat_title:
        context_sections.append(f"TITLE GENERATION\n{request_chat_title}")

    # Join all sections with clear separators
    full_context = "\n\n".join(context_sections)

    return full_context
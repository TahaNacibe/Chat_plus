import asyncio
from services.memory_services import MemoryServices
from services.library_services import LibraryServices
from prompts.chat_prompt import build_context
from model.api_called import GeminiAgent
import os


async def test_agent(input):
    gemini_api_key = os.environ.get("GEMINI_API_KEY", "")
    prompt = build_context(chat_history = [],
    memory_service = MemoryServices(),
    library_service = LibraryServices(),
    current_user_input = input,
    chat_id = "2")
    print("--------------------------- Start Model -------------------")
    agent = GeminiAgent(api_key=gemini_api_key,system_prompt=prompt)
    response = await agent.run(input)
    print("------------------------- Response -----------------")
    print(response)
    

if __name__ == "__main__":
    while True:
        user_input = input(">> ")
        if user_input == "exit":
            break
        asyncio.run(test_agent(user_input))
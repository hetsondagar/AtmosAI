#!/usr/bin/env python3
"""
AtmosAI AI Service Runner (Simplified Version)
This script starts the FastAPI AI service with minimal dependencies
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    log_level = os.getenv("LOG_LEVEL", "info")
    
    print(f"Starting AtmosAI AI Service (Simple Version) on {host}:{port}")
    print(f"Log level: {log_level}")
    
    # Start the server
    uvicorn.run(
        "main-simple:app",
        host=host,
        port=port,
        reload=True,
        log_level=log_level,
        access_log=True
    )

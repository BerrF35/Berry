# Dockerfile for Berry Server


FROM python:3.11.8

# Set environment variables
# ENV OPENAI_API_KEY ...

ENV HOST 0.0.0.0
# ^ Sets the server host to 0.0.0.0, Required for the server to be accessible outside the container

# Copy required files into container
RUN mkdir -p berry scripts
COPY berry/ berry/
COPY scripts/ scripts/
COPY poetry.lock pyproject.toml README.md ./

# Expose port 8000
EXPOSE 8000

# Install server dependencies
RUN pip install ".[server]"

# Start the server
ENTRYPOINT ["berry", "--server"]




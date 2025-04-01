# Ensure there is a server to run
if [ ! -f manage.py ]; then
  echo "Unable to find Django project. Please ensure this script is run from the project root."
  exit 1;
fi

# Activate python virtual environment
if [ ! -f .venv/bin/activate ]; then
  echo "Python virtual environment not initialized"
  exit 1
fi
source .venv/bin/activate

# Define cleanup operations when server ends
function killServer() {
  # Kill the shell running all commands
  kill 0;

  # Deactivate python virtual environment
  deactivate;
}

# Run the following commands in parallel, and listen for CTRL+C to end server
# (see `killServer` above)
(trap killServer SIGINT;
  python3 manage.py runserver &
  yarn dev
)


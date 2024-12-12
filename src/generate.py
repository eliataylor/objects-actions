import os
import sys
import argparse
from django.DjangoBuilder import DjangoBuilder
from react.ReactBuilder import ReactBuilder
from loguru import logger

logger.add("runnerlogs.log", level="DEBUG")
logger.add(sys.stdout, level="INFO")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate project files based on field types CSV.")
    parser.add_argument('command', choices=['admin', 'fake-data', 'typescript', 'reactjs', 'cypress'],
                        help="Target command for the generation.")
    parser.add_argument('--types', required=True, help="Path to the Object Types CSV file.")
    parser.add_argument('--matrix', required=False, help="Path to the Permissions Matrix CSV file.")
    parser.add_argument('--output_dir', required=True, help="Path to the output directory.")

    args = parser.parse_args()

    command = args.command
    types_path = args.types
    matrix_path = args.matrix
    output_dir = args.output_dir

    if not os.path.exists(types_path):
        logger.error(f"Error: Field Types CSV '{types_path}' does not exist.")
        sys.exit(1)

    if not os.path.exists(output_dir):
        logger.error(f"Error: Directory '{output_dir}' does not exist.")
        sys.exit(1)

    logger.info(f"Running command: {command}")
    logger.info(f"Input file: {types_path}")
    logger.info(f"Output directory: {output_dir}")

    if command == 'admin':
        DjangoBuilder(types_path, output_dir)
    elif command == 'reactjs' or command == 'typescript':
        reactor = ReactBuilder(types_path, matrix_path, output_dir)
        if command == 'typescript':
            reactor.build_types()
        else:
            reactor.build_navigation()

    else:
        logger.warning(f"Command '{command}' not yet implemented")
        sys.exit(1)

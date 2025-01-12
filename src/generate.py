import os
import sys
import argparse
from django.DjangoBuilder import DjangoBuilder
from typescript.TypesBuilder import TypesBuilder
from loguru import logger

logger.add("runnerlogs.log", level="DEBUG")
logger.add(sys.stdout, level="INFO")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate project files based on field types CSV.")
    parser.add_argument('command', choices=['django', 'typescript', 'worksheets'],
                        help="Target command for the generation.")
    parser.add_argument('--types', required=True, help="Path to the Object Types CSV file.")
    parser.add_argument('--permissions', required=False, help="Path to the Permissions Matrix CSV file.")
    parser.add_argument('--output_dir', required=True, help="Path to the output directory.")

    args = parser.parse_args()

    command = args.command
    types_path = args.types
    matrix_path = args.permissions
    output_dir = args.output_dir

    # TODO: Check if a Google Spreadsheet URL and download programmatically

    if not os.path.exists(types_path):
        logger.error(f"Error: Field Types CSV '{types_path}' does not exist.")
        sys.exit(1)

    if not os.path.exists(output_dir):
        os.makedirs(os.path.dirname(output_dir), exist_ok=True)
        logger.info(f"Creating output directory: '{output_dir}'")

    logger.info(f"Running command: {command}")
    logger.info(f"Input file: {types_path}")
    logger.info(f"Output directory: {output_dir}")

    if command == 'worksheets':
        pass # clone and build empty worksheets with provided Object Types and basic CRUD URL patterns populated
    if command == 'django':
        builder = DjangoBuilder(types_path, matrix_path, output_dir)
        if matrix_path:
            builder.build_permissions()
    elif command == 'typescript':
        reactor = TypesBuilder(types_path, matrix_path, output_dir)
        reactor.build_types()
        reactor.build_forms()
        if matrix_path:
            reactor.build_permissions()


    else:
        logger.warning(f"Command '{command}' not yet implemented")
        sys.exit(1)

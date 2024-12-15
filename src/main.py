import os
import sys
import argparse
from DjangoBuilder import DjangoBuilder
from TypesBuilder import TypesBuilder
from loguru import logger

logger.add("runnerlogs.log", level="DEBUG")
logger.add(sys.stdout, level="INFO")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=" project files based on field types CSV.")
    parser.add_argument('--project', required=True, help="project name")
    parser.add_argument('--types', required=False, help="Path to the Object Types CSV file.")
    parser.add_argument('--matrix', required=False, help="Path to the Permissions Matrix CSV file.")
    parser.add_argument('--spreadsheet', required=False, help="Share URI for Object/Actions spreadsheet.")

    args = parser.parse_args()

    command = args.command
    types_path = args.types
    matrix_path = args.matrix
    project = args.project
    output_dir = project

    if not os.path.exists(types_path):
        logger.error(f"Error: Field Types CSV '{types_path}' does not exist.")
        sys.exit(1)

    if not os.path.exists(output_dir):
        logger.error(f"Error: Directory '{output_dir}' does not exist.")
        sys.exit(1)

    logger.info(f"Running command: {command}")
    logger.info(f"Input file: {types_path}")
    logger.info(f"Output directory: {output_dir}")

    DjangoBuilder(types_path, output_dir)
    reactor = TypesBuilder(types_path, matrix_path, output_dir)
    reactor.build_types()


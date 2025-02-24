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
    parser.add_argument('command', choices=['django', 'typescript', 'permissions-ts', 'forms', 'chatbot'],
                        help="Target command for the generation.")
    parser.add_argument('--types', required=True, help="Path to the Object Types CSV file.")
    parser.add_argument('--permissions', required=False, help="Path to the Permissions Matrix CSV file.")
    parser.add_argument('--default_perm', required=False, choices=['AllowAny', 'IsAuthenticated', 'IsAuthenticatedOrReadOnly'], default='IsAuthenticatedOrReadOnly', help="Default permission when matches are not found in permissions matrix")
    parser.add_argument('--output_dir', required=True, help="Path to the output directory.")

    args = parser.parse_args()

    command = args.command
    types_path = args.types
    matrix_path = args.permissions
    output_dir = args.output_dir
    default_perm = args.default_perm

    # TODO: Check if a Google Spreadsheet URL and download programmatically

    if not os.path.exists(types_path):
        logger.error(f"Error: Field Types CSV '{types_path}' does not exist.")
        sys.exit(1)

    if not os.path.exists(output_dir):
        os.makedirs(os.path.dirname(output_dir), exist_ok=True)
        logger.info(f"Creating output directory: '{output_dir}'")

    logger.info(f"Running command: {command}")
    logger.info(f"Output directory: {output_dir}")

    if command == 'chatbot':
        builder = DjangoBuilder(output_dir)
        builder.build_chatbot_structures(types_path)
    elif command == 'django':
        builder = DjangoBuilder(output_dir)
        builder.build_django(types_path, default_perm)
        # builder.build_permissions(matrix_path, default_perm)
    elif command == 'permissions-ts':
        reactor = TypesBuilder(types_path, matrix_path, output_dir)
        reactor.build_permissions(default_perm)
    elif command == 'forms':
        reactor = TypesBuilder(types_path, matrix_path, output_dir)
        reactor.build_forms()
    elif command == 'typescript':
        reactor = TypesBuilder(types_path, matrix_path, output_dir)
        reactor.build_types()


    else:
        logger.warning(f"Command '{command}' not yet implemented")
        sys.exit(1)

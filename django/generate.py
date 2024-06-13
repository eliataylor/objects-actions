import os
import sys
import argparse
import DjangoBuilder

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate project files based on field types CSV.")
    parser.add_argument('command', choices=['admin', 'fake-data', 'reactjs', 'cypress-tests'],
                        help="Target command for the generation.")
    parser.add_argument('--types', required=True, help="Path to the Object Types CSV file.")
    parser.add_argument('--matrix', required=False, help="Path to the Permissions Matrix CSV file.")
    parser.add_argument('--output', required=True, help="Path to the output directory.")

    args = parser.parse_args()

    command = args.command
    input_path = args.input
    output_dir = args.output

    if not os.path.exists(input_path):
        print(f"Error: Field Types CSV '{input_path}' does not exist.")
        sys.exit(1)

    if not os.path.exists(output_dir):
        print(f"Error: Directory '{output_dir}' does not exist.")
        sys.exit(1)

    print(f"Running command: {command}")
    print(f"Input file: {input_path}")
    print(f"Output directory: {output_dir}")

    if command == 'admin':
        DjangoBuilder(input_path, output_dir)
    else:
        print(f"WARN: Command '{output_dir}' not yet implemented")
        sys.exit(1)

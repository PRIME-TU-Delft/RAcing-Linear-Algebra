import csv
import os

# This python script was used to clean the CSV files that were exported from Grasple. The CSV files contained a lot of 
# unnecessary characters, such as apostrophes and spaces that did not allow for the correct storing of data. Additionally,
# grasple would provide 100 rows of data, but we decided 20 was enough for our purposes.
# To use this script, place it in the same directory as the CSV files that need to be cleaned and then, run the script.

# Function to remove a character from a string
def remove_character(string, characters):
    for character in characters:
        string = string.replace(character, "")
    return string

# Get the current directory
current_directory = os.getcwd()

# Iterate over all files in the directory
for filename in os.listdir(current_directory):
    # Check if the file is a CSV file
    if filename.endswith(".csv"):
        # Open the CSV file
        with open(filename, 'r') as input_file:
            reader = csv.reader(input_file)

            # Generate the output filename
            output_filename = "cleaned_" + filename

            # Open the output CSV file
            with open(output_filename, 'w', newline='') as output_file:
                writer = csv.writer(output_file)

                # Initialize row counter
                row_count = 0

                # Iterate over each row in the input file
                for row in reader:
                    # Apply the remove_character function to each element in the row
                    cleaned_row = [remove_character(element, "' ") for element in row]

                    # Write the cleaned row to the output file
                    writer.writerow(cleaned_row)

                    # Increment the row counter
                    row_count += 1

                    # Break the loop if 20 rows have been processed
                    if row_count >= 21:
                        break

        print(f"Character removal complete for {filename}. Output file: {output_filename}")

import os
import time

import pandas as pd
import requests
from dotenv import load_dotenv

# Load environment variables (for API key)
load_dotenv()


class CensusBureauConnector:
    """
    A class to connect to the U.S. Census Bureau API and retrieve population and demographic data
    for all municipalities in the United States.
    """

    def __init__(self, api_key=None):
        """
        Initialize the Census Bureau connector.

        Args:
            api_key (str, optional): Census API key. If not provided, will look for CENSUS_API_KEY in environment.
        """
        self.api_key = api_key or os.getenv("CENSUS_API_KEY")
        if not self.api_key:
            raise ValueError("Census API key is required. Get one at https://api.census.gov/data/key_signup.html")

        self.base_url = "https://api.census.gov/data"

    def get_municipalities(self, state_fips=None):
        """
        Get a list of all municipalities (incorporated places) in the US or in a specific state.

        Args:
            state_fips (str, optional): Two-digit FIPS code for a specific state. If None, get all states.

        Returns:
            pandas.DataFrame: DataFrame containing municipality information
        """
        # Most recent year for places (municipalities) geography
        year = 2023
        dataset = "acs/acs5"

        # Construct geographic filter
        if state_fips:
            geo_filter = f"state:{state_fips}&in=state:{state_fips}"
        else:
            geo_filter = "us:*"

        # Get list of incorporated places
        url = f"{self.base_url}/{year}/{dataset}?get=NAME,GEO_ID&for=place:*&in={geo_filter}&key={self.api_key}"

        try:
            response = requests.get(url)
            response.raise_for_status()

            # Convert to DataFrame
            data = response.json()
            headers = data[0]
            values = data[1:]

            df = pd.DataFrame(values, columns=headers)
            return df

        except requests.exceptions.RequestException as e:
            print(f"Error retrieving municipalities: {e}")
            return None

    def get_population_data(self, places_df):
        """
        Get population data for a list of municipalities.

        Args:
            places_df (pandas.DataFrame): DataFrame with municipality information

        Returns:
            pandas.DataFrame: DataFrame with population data added
        """
        year = 2023
        dataset = "acs/acs5"

        # Create a copy of the dataframe to add data to
        result_df = places_df.copy()

        # Add columns for population data
        result_df["Total Population"] = None

        # Process in batches to avoid API limits
        batch_size = 50
        total_places = len(places_df)

        for i in range(0, total_places, batch_size):
            print(f"Processing batch {i // batch_size + 1} of {(total_places + batch_size - 1) // batch_size}")
            batch = places_df.iloc[i:i + batch_size]

            for idx, row in batch.iterrows():
                state_code = row["state"]
                place_code = row["place"]

                # Build URL for population data
                pop_url = f"{self.base_url}/{year}/{dataset}?get=B01003_001E&for=place:{place_code}&in=state:{state_code}&key={self.api_key}"

                try:
                    response = requests.get(pop_url)
                    response.raise_for_status()
                    data = response.json()

                    # Population is in the first returned value (after headers)
                    if len(data) > 1:
                        population = data[1][0]
                        result_df.loc[idx, "Total Population"] = population

                    # Be nice to the API
                    time.sleep(0.1)

                except requests.exceptions.RequestException as e:
                    print(f"Error retrieving population for {row['NAME']}: {e}")
                    continue

        return result_df

    def get_demographic_data(self, places_df):
        """
        Get demographic data (race, age, gender, income) for municipalities.

        Args:
            places_df (pandas.DataFrame): DataFrame with municipality information

        Returns:
            pandas.DataFrame: DataFrame with demographic data added
        """
        year = 2023
        dataset = "acs/acs5"

        # Create a copy to add demographic data
        result_df = places_df.copy()

        # Define variables to collect
        # B02001_00*E: Race data
        # B01001_00*E: Sex by age data
        # B19013_001E: Median household income
        # B17001_002E: Poverty count

        variables = [
            "B02001_001E",  # Total population
            "B02001_002E",  # White alone
            "B02001_003E",  # Black or African American alone
            "B02001_004E",  # American Indian and Alaska Native alone
            "B02001_005E",  # Asian alone
            "B02001_006E",  # Native Hawaiian and Other Pacific Islander alone
            "B02001_007E",  # Some other race alone
            "B02001_008E",  # Two or more races
            "B03003_003E",  # Hispanic or Latino
            "B01001_001E",  # Total population (for sex by age)
            "B01001_002E",  # Male population
            "B01001_026E",  # Female population
            "B19013_001E",  # Median household income
            "B17001_001E",  # Total population for poverty
            "B17001_002E"  # Population in poverty
        ]

        variable_str = ",".join(variables)

        # Add columns for demographic data
        demographic_columns = [
            "Total", "White", "Black", "NativeAmerican", "Asian", "PacificIslander",
            "OtherRace", "MultipleRaces", "Hispanic", "TotalPop", "Male", "Female",
            "MedianIncome", "TotalPoverty", "InPoverty"
        ]

        for col in demographic_columns:
            result_df[col] = None

        # Process in batches to avoid API limits
        batch_size = 50
        total_places = len(places_df)

        for i in range(0, total_places, batch_size):
            print(
                f"Processing demographic batch {i // batch_size + 1} of {(total_places + batch_size - 1) // batch_size}")
            batch = places_df.iloc[i:i + batch_size]

            for idx, row in batch.iterrows():
                state_code = row["state"]
                place_code = row["place"]

                # Build URL for demographic data
                demo_url = f"{self.base_url}/{year}/{dataset}?get={variable_str}&for=place:{place_code}&in=state:{state_code}&key={self.api_key}"

                try:
                    response = requests.get(demo_url)
                    response.raise_for_status()
                    data = response.json()

                    # Extract demographic data
                    if len(data) > 1:
                        values = data[1][:-2]  # Exclude the state and place codes at end

                        # Add values to result dataframe
                        for col_idx, col_name in enumerate(demographic_columns):
                            result_df.loc[idx, col_name] = values[col_idx]

                    # Be nice to the API
                    time.sleep(0.1)

                except requests.exceptions.RequestException as e:
                    print(f"Error retrieving demographics for {row['NAME']}: {e}")
                    continue

        return result_df

    def calculate_derived_metrics(self, df):
        """
        Calculate derived demographic metrics based on raw census data.

        Args:
            df (pandas.DataFrame): DataFrame with raw demographic data

        Returns:
            pandas.DataFrame: DataFrame with additional calculated fields
        """
        result_df = df.copy()

        # Convert data types for calculations
        numeric_columns = [
            "Total", "White", "Black", "NativeAmerican", "Asian", "PacificIslander",
            "OtherRace", "MultipleRaces", "Hispanic", "TotalPop", "Male", "Female",
            "MedianIncome", "TotalPoverty", "InPoverty"
        ]

        for col in numeric_columns:
            if col in result_df.columns:
                result_df[col] = pd.to_numeric(result_df[col], errors='coerce')

        # Calculate percentages
        if "Total" in result_df.columns and result_df["Total"].sum() > 0:
            # Race percentages
            for race in ["White", "Black", "NativeAmerican", "Asian", "PacificIslander", "OtherRace", "MultipleRaces",
                         "Hispanic"]:
                if race in result_df.columns:
                    result_df[f"{race}Pct"] = (result_df[race] / result_df["Total"] * 100).round(2)

            # Gender percentages
            if "Male" in result_df.columns and "TotalPop" in result_df.columns:
                result_df["MalePct"] = (result_df["Male"] / result_df["TotalPop"] * 100).round(2)
                result_df["FemalePct"] = (result_df["Female"] / result_df["TotalPop"] * 100).round(2)

            # Poverty rate
            if "InPoverty" in result_df.columns and "TotalPoverty" in result_df.columns:
                result_df["PovertyRate"] = (result_df["InPoverty"] / result_df["TotalPoverty"] * 100).round(2)

        return result_df

    def get_all_municipality_data(self, state_fips=None, save_to_csv=True, output_file="us_municipalities_data.csv"):
        """
        Retrieve complete dataset for all municipalities.

        Args:
            state_fips (str, optional): Two-digit FIPS code to limit to one state
            save_to_csv (bool): Whether to save results to a CSV file
            output_file (str): Filename for output CSV

        Returns:
            pandas.DataFrame: Complete dataset of municipality information
        """
        print("Getting list of municipalities...")
        places_df = self.get_municipalities(state_fips)

        if places_df is None or len(places_df) == 0:
            print("No municipalities found.")
            return None

        print(f"Found {len(places_df)} municipalities.")

        print("Retrieving population data...")
        pop_df = self.get_population_data(places_df)

        print("Retrieving demographic data...")
        demo_df = self.get_demographic_data(places_df)

        # Combine all data
        result_df = pd.merge(pop_df, demo_df, on=list(places_df.columns))

        # Calculate additional metrics
        print("Calculating derived metrics...")
        result_df = self.calculate_derived_metrics(result_df)

        # Save to CSV if requested
        if save_to_csv:
            print(f"Saving data to {output_file}...")
            result_df.to_csv(output_file, index=False)
            print("Data saved successfully.")

        return result_df


# Example usage
if __name__ == "__main__":
    # Replace with your Census API key or set CENSUS_API_KEY in environment
    API_KEY = None  # os.getenv("CENSUS_API_KEY")

    # Initialize connector
    census = CensusBureauConnector(api_key=API_KEY)

    # Get all data (this will take a long time for all municipalities)
    # For testing, use a specific state FIPS code (e.g., "06" for California)

    # Uncomment to get data for all municipalities in the US (very time consuming)
    # all_data = census.get_all_municipality_data()

    # For testing, get data for a single state (e.g., Delaware - FIPS code "10")
    # See: https://www.census.gov/library/reference/code-lists/ansi/ansi-codes-for-states.html
    de_data = census.get_all_municipality_data(state_fips="10", output_file="delaware_municipalities.csv")

    if de_data is not None:
        print(f"Retrieved data for {len(de_data)} municipalities.")
        print("\nSample data:")
        print(de_data.head())

    # Example: Generate summary statistics for state municipalities
    if de_data is not None:
        print("\nSummary Statistics:")
        summary = {
            "Total Municipalities": len(de_data),
            "Average Population": de_data["Total Population"].astype(float).mean(),
            "Largest Municipality": de_data.loc[de_data["Total Population"].astype(float).idxmax(), "NAME"],
            "Largest Population": de_data["Total Population"].astype(float).max(),
            "Smallest Municipality": de_data.loc[de_data["Total Population"].astype(float).idxmin(), "NAME"],
            "Smallest Population": de_data["Total Population"].astype(float).min(),
            "Average Median Income": de_data["MedianIncome"].astype(float).mean(),
            "Average Poverty Rate": de_data["PovertyRate"].astype(float).mean()
        }

        for key, value in summary.items():
            print(f"{key}: {value}")

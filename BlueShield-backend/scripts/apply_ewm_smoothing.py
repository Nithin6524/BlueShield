#!/usr/bin/env python3
"""
Script to apply EWM_7 (Exponentially Weighted Moving Average with 7-period span) smoothing
to the Bay of Bengal microplastic concentration dataset.
"""

import pandas as pd
import numpy as np
from pathlib import Path
import os

def apply_ewm_smoothing(input_file, output_file, span=7):
    """
    Apply EWM smoothing to the microplastic concentration data.
    
    Args:
        input_file (str): Path to the input CSV file
        output_file (str): Path to the output CSV file
        span (int): Span for EWM smoothing (default: 7)
    """
    print(f"Reading dataset from: {input_file}")
    
    # Read the dataset
    df = pd.read_csv(input_file)
    
    print(f"Original dataset shape: {df.shape}")
    print(f"Columns: {list(df.columns)}")
    
    # Check for missing values in the concentration column
    concentration_col = 'Interpolated_Concentration'
    missing_count = df[concentration_col].isna().sum()
    print(f"Missing values in {concentration_col}: {missing_count}")
    
    # Create a copy of the dataframe
    df_smoothed = df.copy()
    
    # Apply EWM smoothing to the Interpolated_Concentration column
    print(f"Applying EWM smoothing with span={span}...")
    
    # Sort by date to ensure proper time series order
    df_smoothed['Date'] = pd.to_datetime(df_smoothed['Date'])
    df_smoothed = df_smoothed.sort_values('Date').reset_index(drop=True)
    
    # Apply EWM smoothing
    df_smoothed[f'{concentration_col}_EWM_{span}'] = df_smoothed[concentration_col].ewm(span=span, adjust=False).mean()
    
    # Update the original concentration column with smoothed values
    df_smoothed[concentration_col] = df_smoothed[f'{concentration_col}_EWM_{span}']
    
    # Add a column to indicate this is smoothed data
    df_smoothed['Is_Smoothed'] = True
    df_smoothed['Smoothing_Method'] = f'EWM_{span}'
    
    # Drop the temporary column
    df_smoothed = df_smoothed.drop(columns=[f'{concentration_col}_EWM_{span}'])
    
    # Save the smoothed dataset
    print(f"Saving smoothed dataset to: {output_file}")
    df_smoothed.to_csv(output_file, index=False)
    
    print(f"Smoothed dataset shape: {df_smoothed.shape}")
    
    # Display some statistics
    print("\nSmoothing Statistics:")
    print(f"Original mean concentration: {df[concentration_col].mean():.6f}")
    print(f"Smoothed mean concentration: {df_smoothed[concentration_col].mean():.6f}")
    print(f"Original std concentration: {df[concentration_col].std():.6f}")
    print(f"Smoothed std concentration: {df_smoothed[concentration_col].std():.6f}")
    
    return df_smoothed

def main():
    """Main function to run the EWM smoothing process."""
    
    # Define file paths
    base_dir = Path(__file__).parent.parent
    data_dir = base_dir / "data" / "raw"
    processed_dir = base_dir / "data" / "processed"
    
    input_file = data_dir / "bay_of_bengal_interpolated.csv"
    output_file = processed_dir / "bay_of_bengal_ewm7_smoothed.csv"
    
    # Create processed directory if it doesn't exist
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    # Check if input file exists
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        return
    
    try:
        # Apply EWM smoothing
        smoothed_df = apply_ewm_smoothing(input_file, output_file, span=7)
        
        print(f"\n✅ Successfully created EWM_7 smoothed dataset!")
        print(f"📁 Output file: {output_file}")
        print(f"📊 Total records: {len(smoothed_df)}")
        
        # Show first few rows of the smoothed data
        print("\nFirst 5 rows of smoothed data:")
        print(smoothed_df[['Date', 'Latitude', 'Longitude', 'Interpolated_Concentration', 'Is_Smoothed', 'Smoothing_Method']].head())
        
    except Exception as e:
        print(f"❌ Error applying EWM smoothing: {str(e)}")
        raise

if __name__ == "__main__":
    main()

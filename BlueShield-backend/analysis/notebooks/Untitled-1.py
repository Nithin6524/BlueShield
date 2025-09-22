# %%
# Imports
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import tensorflow as tf
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import LSTM, Dense, Dropout, BatchNormalization, Input, MultiHeadAttention, LayerNormalization
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.layers import Bidirectional
import warnings
warnings.filterwarnings('ignore')

# Reproducibility
SEED = 42
np.random.seed(SEED)
tf.random.set_seed(SEED)


# %%
# Load dataset
df = pd.read_csv('../../../../../data/processed/bay_of_bengal.csv')

# Basic info
print(df.head())
print(df.info())
print(df.isnull().sum())



# %%
# Keep relevant columns
features = ['Latitude', 'Longitude']
target = 'Interpolated_Concentration'  

# Drop rows with missing target
df_clean = df.dropna(subset=[target]).reset_index(drop=True)

# Add categorical features
categorical_features = ['SubRegion', 'Density_Class']

# One-hot encode categorical features
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
import numpy as np

# Create encoded features for SubRegion
subregion_encoder = LabelEncoder()
df_clean['SubRegion_encoded'] = subregion_encoder.fit_transform(df_clean['SubRegion'])

# Create encoded features for Density_Class
density_encoder = LabelEncoder()
df_clean['Density_Class_encoded'] = density_encoder.fit_transform(df_clean['Density_Class'])

# Add encoded categorical features to features list
features.extend(['SubRegion_encoded', 'Density_Class_encoded'])

# Feature scaling
scaler_features = MinMaxScaler()
scaler_target = MinMaxScaler()

df_clean[features] = scaler_features.fit_transform(df_clean[features].values)
df_clean[target] = scaler_target.fit_transform(df_clean[[target]].values)

# Optional: Add temporal feature (day of year)
df_clean['Date'] = pd.to_datetime(df_clean['Date'])
df_clean['DayOfYear'] = df_clean['Date'].dt.dayofyear
df_clean['DayOfYear'] = df_clean['DayOfYear'] / 366  # Normalize

features.append('DayOfYear')

# Scale again after adding DayOfYear
df_clean[features] = scaler_features.fit_transform(df_clean[features].values)

# Print feature information
print("Features used:", features)
print("SubRegion unique values:", subregion_encoder.classes_)
print("Density_Class unique values:", density_encoder.classes_)
print("Feature shape:", df_clean[features].shape)



# %%
# Display feature information and data distribution
print("=== FEATURE INFORMATION ===")
print(f"Total features: {len(features)}")
print(f"Features: {features}")
print(f"Target: {target}")
print(f"Data shape: {df_clean.shape}")
print(f"Missing values: {df_clean[features + [target]].isnull().sum().sum()}")

print("\n=== CATEGORICAL FEATURE DISTRIBUTION ===")
print("SubRegion distribution:")
print(df_clean['SubRegion'].value_counts())
print("\nDensity_Class distribution:")
print(df_clean['Density_Class'].value_counts())

print("\n=== ENCODED FEATURES ===")
print("SubRegion encoding mapping:")
for i, region in enumerate(subregion_encoder.classes_):
    print(f"  {region} -> {i}")
print("\nDensity_Class encoding mapping:")
for i, density in enumerate(density_encoder.classes_):
    print(f"  {density} -> {i}")

# Show sample of encoded data
print("\n=== SAMPLE ENCODED DATA ===")
sample_cols = ['Latitude', 'Longitude', 'SubRegion', 'SubRegion_encoded', 'Density_Class', 'Density_Class_encoded', 'DayOfYear', target]
print(df_clean[sample_cols].head(10))


# %%
# Verify the updated feature set
print("=== UPDATED FEATURE VERIFICATION ===")
print(f"Number of features: {len(features)}")
print(f"Features: {features}")
print(f"Expected input shape: (timesteps, {len(features)})")
print(f"Expected output shape: (output_window,)")

# Quick test to ensure everything works
print("\n=== QUICK FEATURE TEST ===")
print("Sample feature values (first 5 rows):")
print(df_clean[features].head())

print("\nFeature statistics:")
print(df_clean[features].describe())


# %%
# Model Architecture Definitions
def build_attention_lstm(input_shape, output_size, lstm_units=64, dropout_rate=0.2):
    inputs = Input(shape=input_shape)
    lstm_out = LSTM(lstm_units, return_sequences=True)(inputs)
    lstm_out = Dropout(dropout_rate)(lstm_out)
    lstm_out = LSTM(lstm_units//2, return_sequences=True)(lstm_out)
    lstm_out = Dropout(dropout_rate)(lstm_out)
    
    attention_out = MultiHeadAttention(num_heads=4, key_dim=32)(lstm_out, lstm_out)
    attention_out = LayerNormalization(epsilon=1e-6)(attention_out + lstm_out)
    
    pooled = tf.keras.layers.GlobalAveragePooling1D()(attention_out)
    dense_out = Dense(64, activation='relu')(pooled)
    dense_out = BatchNormalization()(dense_out)
    dense_out = Dropout(dropout_rate)(dense_out)
    dense_out = Dense(32, activation='relu')(dense_out)
    dense_out = Dropout(dropout_rate)(dense_out)
    
    outputs = Dense(output_size)(dense_out)
    
    model = Model(inputs=inputs, outputs=outputs)
    return model
    
def build_basic_lstm(input_shape, output_size, lstm_units=64, dropout_rate=0.2):
    model = Sequential([
        LSTM(lstm_units, return_sequences=False, input_shape=input_shape),
        Dropout(dropout_rate),
        Dense(32, activation='relu'),
        Dropout(dropout_rate),
        Dense(output_size)
    ])
    return model

def build_stacked_lstm(input_shape, output_size, lstm_units=64, dropout_rate=0.2):
    model = Sequential([
        LSTM(lstm_units, return_sequences=True, input_shape=input_shape),
        Dropout(dropout_rate),
        LSTM(lstm_units//2, return_sequences=False),
        Dropout(dropout_rate),
        Dense(64, activation='relu'),
        BatchNormalization(),
        Dense(32, activation='relu'),
        Dropout(dropout_rate),
        Dense(output_size)
    ])
    return model

def build_bidirectional_lstm(input_shape, output_size, lstm_units=64, dropout_rate=0.2):
    model = Sequential([
        Bidirectional(LSTM(lstm_units, return_sequences=True), input_shape=input_shape),
        Dropout(dropout_rate),
        Bidirectional(LSTM(lstm_units//2, return_sequences=False)),
        Dropout(dropout_rate),
        Dense(64, activation='relu'),
        BatchNormalization(),
        Dense(32, activation='relu'),
        Dropout(dropout_rate),
        Dense(output_size)
    ])
    return model


# %%
# Training and Evaluation Functions
def train_and_evaluate(model_fn, model_name, X_train, y_train, X_test, y_test, epochs=50, batch_size=32):
    print(f"\nTraining {model_name} model...")
    
    model = model_fn(X_train.shape[1:], y_train.shape[1])
    model.compile(optimizer='adam', loss='mse', metrics=['mae'])
    
    callbacks = [
        EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True),
        ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=5, min_lr=1e-6),
        ModelCheckpoint(f'best_{model_name}.keras', monitor='val_loss', save_best_only=True)
    ]
    
    history = model.fit(
        X_train, y_train,
        validation_split=0.2,
        epochs=epochs,
        batch_size=batch_size,
        callbacks=callbacks,
        verbose=1
    )
    
    # Predictions
    y_pred = model.predict(X_test)
    y_pred_scaled = scaler_target.inverse_transform(y_pred)
    y_test_scaled = scaler_target.inverse_transform(y_test)
    
    # Metrics
    mse = mean_squared_error(y_test_scaled, y_pred_scaled)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test_scaled, y_pred_scaled)
    r2 = r2_score(y_test_scaled.flatten(), y_pred_scaled.flatten())
    
    print(f"{model_name} RMSE: {rmse:.4f}, MAE: {mae:.4f}, R2: {r2:.4f}")
    
    return {
        'model': model,
        'history': history,
        'predictions': y_pred_scaled,
        'actual': y_test_scaled,
        'rmse': rmse,
        'mae': mae,
        'r2': r2
    }


# %%


# Sequence Creation and Basic Data Split
def create_sequences(df, input_window=60, output_window=14):
    X, y = [], []
    for i in range(input_window, len(df) - output_window + 1):
        X.append(df.iloc[i-input_window:i][features].values)
        y.append(df.iloc[i:i+output_window][target].values)
    return np.array(X), np.array(y)

input_window = 60
output_window = 14

X, y = create_sequences(df_clean, input_window, output_window)

print("X shape:", X.shape)
print("y shape:", y.shape)

# Basic train-test split
split_idx = int(0.8 * len(X))
X_train, X_test = X[:split_idx], X[split_idx:]
y_train, y_test = y[:split_idx], y[split_idx:]

print("Train shape:", X_train.shape, y_train.shape)
print("Test shape:", X_test.shape, y_test.shape)


# %%
# Basic Model Training and Comparison
models = {
    'Basic': build_basic_lstm,
    'Stacked': build_stacked_lstm,
    'Bidirectional': build_bidirectional_lstm,
    'Attention': build_attention_lstm
}

results = {}

for name, fn in models.items():
    results[name] = train_and_evaluate(fn, name.lower(), X_train, y_train, X_test, y_test, epochs=50)


# %%
# Basic Results Analysis
comparison_df = pd.DataFrame({
    'Model': [name for name in results.keys()],
    'RMSE': [results[name]['rmse'] for name in results.keys()],
    'MAE': [results[name]['mae'] for name in results.keys()],
    'R2': [results[name]['r2'] for name in results.keys()]
})

print("\nModel Comparison:")
print(comparison_df)

best_model_name = min(results.keys(), key=lambda x: results[x]['rmse'])
print(f"\nBest performing model: {best_model_name} with RMSE={results[best_model_name]['rmse']:.4f}")


# %%
# Basic Visualization
def plot_predictions(results, num_samples=3):
    for model_name, res in results.items():
        plt.figure(figsize=(12,4))
        for i in range(min(num_samples, len(res['predictions']))):
            plt.plot(res['actual'][i], label='Actual', marker='o')
            plt.plot(res['predictions'][i], label='Predicted', marker='x')
            plt.title(f'{model_name} LSTM - Sample {i+1}')
            plt.xlabel('Days')
            plt.ylabel('Concentration')
            plt.legend()
            plt.show()

plot_predictions(results)


# %%
# Advanced Testing Strategies
from sklearn.model_selection import train_test_split, KFold, StratifiedKFold
import random

def create_stratified_test_sets(df_clean, features, target, input_window=60, output_window=14, test_size=0.2):
    """
    Create test sets based on different stratification strategies
    """
    # Create sequences first
    X, y = create_sequences(df_clean, input_window, output_window)
    
    # Get corresponding metadata for each sequence
    sequence_metadata = []
    for i in range(input_window, len(df_clean) - output_window + 1):
        # Get the region and subregion for the last point in the sequence
        region = df_clean.iloc[i-1]['Region'] if 'Region' in df_clean.columns else 'Unknown'
        subregion = df_clean.iloc[i-1]['SubRegion'] if 'SubRegion' in df_clean.columns else 'Unknown'
        sequence_metadata.append({
            'region': region,
            'subregion': subregion,
            'index': i
        })
    
    metadata_df = pd.DataFrame(sequence_metadata)
    
    # Strategy 1: Random sampling
    X_train_random, X_test_random, y_train_random, y_test_random = train_test_split(
        X, y, test_size=test_size, random_state=42
    )
    
    # Strategy 2: Temporal split (last 20% of time)
    temporal_split_idx = int(0.8 * len(X))
    X_train_temporal = X[:temporal_split_idx]
    X_test_temporal = X[temporal_split_idx:]
    y_train_temporal = y[:temporal_split_idx]
    y_test_temporal = y[temporal_split_idx:]
    
    # Strategy 3: Region-based stratification
    unique_regions = metadata_df['region'].unique()
    region_indices = {}
    for region in unique_regions:
        region_indices[region] = metadata_df[metadata_df['region'] == region].index.tolist()
    
    # For each region, split 80/20
    X_train_region, X_test_region = [], []
    y_train_region, y_test_region = [], []
    
    for region, indices in region_indices.items():
        if len(indices) > 1:  # Need at least 2 samples to split
            region_X = X[indices]
            region_y = y[indices]
            split_idx = int(0.8 * len(region_X))
            
            X_train_region.extend(region_X[:split_idx])
            X_test_region.extend(region_X[split_idx:])
            y_train_region.extend(region_y[:split_idx])
            y_test_region.extend(region_y[split_idx:])
    
    X_train_region = np.array(X_train_region)
    X_test_region = np.array(X_test_region)
    y_train_region = np.array(y_train_region)
    y_test_region = np.array(y_test_region)
    
    # Strategy 4: Subregion-based stratification
    unique_subregions = metadata_df['subregion'].unique()
    subregion_indices = {}
    for subregion in unique_subregions:
        subregion_indices[subregion] = metadata_df[metadata_df['subregion'] == subregion].index.tolist()
    
    X_train_subregion, X_test_subregion = [], []
    y_train_subregion, y_test_subregion = [], []
    
    for subregion, indices in subregion_indices.items():
        if len(indices) > 1:
            subregion_X = X[indices]
            subregion_y = y[indices]
            split_idx = int(0.8 * len(subregion_X))
            
            X_train_subregion.extend(subregion_X[:split_idx])
            X_test_subregion.extend(subregion_X[split_idx:])
            y_train_subregion.extend(subregion_y[:split_idx])
            y_test_subregion.extend(subregion_y[split_idx:])
    
    X_train_subregion = np.array(X_train_subregion)
    X_test_subregion = np.array(X_test_subregion)
    y_train_subregion = np.array(y_train_subregion)
    y_test_subregion = np.array(y_test_subregion)
    
    return {
        'random': (X_train_random, X_test_random, y_train_random, y_test_random),
        'temporal': (X_train_temporal, X_test_temporal, y_train_temporal, y_test_temporal),
        'region': (X_train_region, X_test_region, y_train_region, y_test_region),
        'subregion': (X_train_subregion, X_test_subregion, y_train_subregion, y_test_subregion)
    }

# Create different test sets
test_sets = create_stratified_test_sets(df_clean, features, target, input_window, output_window)

print("Test set sizes:")
for strategy, (X_train, X_test, y_train, y_test) in test_sets.items():
    print(f"{strategy.capitalize()}: Train {X_train.shape}, Test {X_test.shape}")


# %%
# Cross-Validation and Advanced Evaluation Functions
def evaluate_model_with_cv(model_fn, model_name, X, y, cv_folds=5, epochs=30, batch_size=32):
    """
    Evaluate model using k-fold cross-validation
    """
    kf = KFold(n_splits=cv_folds, shuffle=True, random_state=42)
    cv_scores = []
    fold_results = []
    
    print(f"\nCross-validation for {model_name} model ({cv_folds} folds)...")
    
    for fold, (train_idx, val_idx) in enumerate(kf.split(X)):
        print(f"Fold {fold + 1}/{cv_folds}")
        
        X_train_fold, X_val_fold = X[train_idx], X[val_idx]
        y_train_fold, y_val_fold = y[train_idx], y[val_idx]
        
        # Build and train model
        model = model_fn(X_train_fold.shape[1:], y_train_fold.shape[1])
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        
        # Train with early stopping
        callbacks = [
            EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
            ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6)
        ]
        
        history = model.fit(
            X_train_fold, y_train_fold,
            validation_data=(X_val_fold, y_val_fold),
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=0
        )
        
        # Evaluate
        y_pred = model.predict(X_val_fold, verbose=0)
        y_pred_scaled = scaler_target.inverse_transform(y_pred)
        y_val_scaled = scaler_target.inverse_transform(y_val_fold)
        
        # Calculate metrics
        mse = mean_squared_error(y_val_scaled, y_pred_scaled)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_val_scaled, y_pred_scaled)
        r2 = r2_score(y_val_scaled.flatten(), y_pred_scaled.flatten())
        
        cv_scores.append({'rmse': rmse, 'mae': mae, 'r2': r2})
        fold_results.append({
            'fold': fold + 1,
            'predictions': y_pred_scaled,
            'actual': y_val_scaled,
            'rmse': rmse,
            'mae': mae,
            'r2': r2
        })
    
    # Calculate average metrics
    avg_rmse = np.mean([score['rmse'] for score in cv_scores])
    avg_mae = np.mean([score['mae'] for score in cv_scores])
    avg_r2 = np.mean([score['r2'] for score in cv_scores])
    std_rmse = np.std([score['rmse'] for score in cv_scores])
    std_mae = np.std([score['mae'] for score in cv_scores])
    std_r2 = np.std([score['r2'] for score in cv_scores])
    
    print(f"{model_name} CV Results: RMSE={avg_rmse:.4f}±{std_rmse:.4f}, MAE={avg_mae:.4f}±{std_mae:.4f}, R2={avg_r2:.4f}±{std_r2:.4f}")
    
    return {
        'model_name': model_name,
        'avg_rmse': avg_rmse,
        'std_rmse': std_rmse,
        'avg_mae': avg_mae,
        'std_mae': std_mae,
        'avg_r2': avg_r2,
        'std_r2': std_r2,
        'fold_results': fold_results
    }

def comprehensive_evaluation(model_fn, model_name, test_sets, epochs=30, batch_size=32):
    """
    Evaluate model across all different testing strategies
    """
    results = {}
    
    for strategy, (X_train, X_test, y_train, y_test) in test_sets.items():
        print(f"\nEvaluating {model_name} with {strategy} strategy...")
        
        # Train model
        model = model_fn(X_train.shape[1:], y_train.shape[1])
        model.compile(optimizer='adam', loss='mse', metrics=['mae'])
        
        callbacks = [
            EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True),
            ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, min_lr=1e-6)
        ]
        
        history = model.fit(
            X_train, y_train,
            validation_split=0.2,
            epochs=epochs,
            batch_size=batch_size,
            callbacks=callbacks,
            verbose=0
        )
        
        # Predictions
        y_pred = model.predict(X_test, verbose=0)
        y_pred_scaled = scaler_target.inverse_transform(y_pred)
        y_test_scaled = scaler_target.inverse_transform(y_test)
        
        # Metrics
        mse = mean_squared_error(y_test_scaled, y_pred_scaled)
        rmse = np.sqrt(mse)
        mae = mean_absolute_error(y_test_scaled, y_pred_scaled)
        r2 = r2_score(y_test_scaled.flatten(), y_pred_scaled.flatten())
        
        results[strategy] = {
            'rmse': rmse,
            'mae': mae,
            'r2': r2,
            'predictions': y_pred_scaled,
            'actual': y_test_scaled
        }
        
        print(f"{strategy.capitalize()}: RMSE={rmse:.4f}, MAE={mae:.4f}, R2={r2:.4f}")
    
    return results


# %%
# Comprehensive Evaluation Execution
print("="*60)
print("COMPREHENSIVE MODEL EVALUATION WITH DIFFERENT TESTING STRATEGIES")
print("="*60)

# Test with the best performing model (Bidirectional LSTM)
best_model_fn = build_bidirectional_lstm
best_model_name = "Bidirectional LSTM"

# 1. Cross-validation on full dataset
print("\n1. CROSS-VALIDATION EVALUATION")
print("-" * 40)
X_full, y_full = create_sequences(df_clean, input_window, output_window)
cv_results = evaluate_model_with_cv(best_model_fn, best_model_name, X_full, y_full, cv_folds=5)

# 2. Different testing strategies
print("\n2. DIFFERENT TESTING STRATEGIES EVALUATION")
print("-" * 40)
strategy_results = comprehensive_evaluation(best_model_fn, best_model_name, test_sets)

# 3. Create comparison table
print("\n3. COMPARISON OF TESTING STRATEGIES")
print("-" * 40)

comparison_data = []
for strategy, metrics in strategy_results.items():
    comparison_data.append({
        'Strategy': strategy.capitalize(),
        'RMSE': f"{metrics['rmse']:.4f}",
        'MAE': f"{metrics['mae']:.4f}",
        'R2': f"{metrics['r2']:.4f}"
    })

# Add CV results
comparison_data.append({
    'Strategy': 'Cross-Validation',
    'RMSE': f"{cv_results['avg_rmse']:.4f}±{cv_results['std_rmse']:.4f}",
    'MAE': f"{cv_results['avg_mae']:.4f}±{cv_results['std_mae']:.4f}",
    'R2': f"{cv_results['avg_r2']:.4f}±{cv_results['std_r2']:.4f}"
})

comparison_df = pd.DataFrame(comparison_data)
print(comparison_df)

# 4. Find best strategy
strategy_rmse = {strategy: metrics['rmse'] for strategy, metrics in strategy_results.items()}
best_strategy = min(strategy_rmse.keys(), key=lambda x: strategy_rmse[x])
print(f"\nBest testing strategy: {best_strategy.capitalize()} (RMSE: {strategy_rmse[best_strategy]:.4f})")


# %%
# Advanced Visualization
def plot_strategy_comparison(strategy_results, num_samples=3):
    """
    Plot predictions vs actual for different testing strategies
    """
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    axes = axes.flatten()
    
    strategies = list(strategy_results.keys())
    
    for idx, strategy in enumerate(strategies):
        if idx >= 4:  # Only plot first 4 strategies
            break
            
        ax = axes[idx]
        metrics = strategy_results[strategy]
        
        # Plot first few samples
        for i in range(min(num_samples, len(metrics['predictions']))):
            ax.plot(metrics['actual'][i], label=f'Actual Sample {i+1}', marker='o', alpha=0.7)
            ax.plot(metrics['predictions'][i], label=f'Predicted Sample {i+1}', marker='x', alpha=0.7)
        
        ax.set_title(f'{strategy.capitalize()} Strategy\nRMSE: {metrics["rmse"]:.4f}, R2: {metrics["r2"]:.4f}')
        ax.set_xlabel('Days')
        ax.set_ylabel('Concentration')
        ax.legend()
        ax.grid(True, alpha=0.3)
    
    # Hide unused subplots
    for idx in range(len(strategies), 4):
        axes[idx].set_visible(False)
    
    plt.tight_layout()
    plt.show()

def plot_metrics_comparison(strategy_results, cv_results):
    """
    Create bar plots comparing metrics across strategies
    """
    strategies = list(strategy_results.keys()) + ['Cross-Validation']
    rmse_values = [strategy_results[s]['rmse'] for s in strategy_results.keys()] + [cv_results['avg_rmse']]
    mae_values = [strategy_results[s]['mae'] for s in strategy_results.keys()] + [cv_results['avg_mae']]
    r2_values = [strategy_results[s]['r2'] for s in strategy_results.keys()] + [cv_results['avg_r2']]
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    # RMSE comparison
    axes[0].bar(strategies, rmse_values, color='skyblue', alpha=0.7)
    axes[0].set_title('RMSE Comparison Across Testing Strategies')
    axes[0].set_ylabel('RMSE')
    axes[0].tick_params(axis='x', rotation=45)
    
    # MAE comparison
    axes[1].bar(strategies, mae_values, color='lightcoral', alpha=0.7)
    axes[1].set_title('MAE Comparison Across Testing Strategies')
    axes[1].set_ylabel('MAE')
    axes[1].tick_params(axis='x', rotation=45)
    
    # R2 comparison
    axes[2].bar(strategies, r2_values, color='lightgreen', alpha=0.7)
    axes[2].set_title('R² Comparison Across Testing Strategies')
    axes[2].set_ylabel('R²')
    axes[2].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    plt.show()

# Plot comparisons
print("\n4. VISUALIZATION OF TESTING STRATEGIES")
print("-" * 40)
plot_strategy_comparison(strategy_results)
plot_metrics_comparison(strategy_results, cv_results)


# %%
# Visualization of different testing strategies
def plot_strategy_comparison(strategy_results, num_samples=3):
    """
    Plot predictions vs actual for different testing strategies
    """
    fig, axes = plt.subplots(2, 2, figsize=(15, 10))
    axes = axes.flatten()
    
    strategies = list(strategy_results.keys())
    
    for idx, strategy in enumerate(strategies):
        if idx >= 4:  # Only plot first 4 strategies
            break
            
        ax = axes[idx]
        metrics = strategy_results[strategy]
        
        # Plot first few samples
        for i in range(min(num_samples, len(metrics['predictions']))):
            ax.plot(metrics['actual'][i], label=f'Actual Sample {i+1}', marker='o', alpha=0.7)
            ax.plot(metrics['predictions'][i], label=f'Predicted Sample {i+1}', marker='x', alpha=0.7)
        
        ax.set_title(f'{strategy.capitalize()} Strategy\nRMSE: {metrics["rmse"]:.4f}, R2: {metrics["r2"]:.4f}')
        ax.set_xlabel('Days')
        ax.set_ylabel('Concentration')
        ax.legend()
        ax.grid(True, alpha=0.3)
    
    # Hide unused subplots
    for idx in range(len(strategies), 4):
        axes[idx].set_visible(False)
    
    plt.tight_layout()
    plt.show()

def plot_metrics_comparison(strategy_results, cv_results):
    """
    Create bar plots comparing metrics across strategies
    """
    strategies = list(strategy_results.keys()) + ['Cross-Validation']
    rmse_values = [strategy_results[s]['rmse'] for s in strategy_results.keys()] + [cv_results['avg_rmse']]
    mae_values = [strategy_results[s]['mae'] for s in strategy_results.keys()] + [cv_results['avg_mae']]
    r2_values = [strategy_results[s]['r2'] for s in strategy_results.keys()] + [cv_results['avg_r2']]
    
    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    # RMSE comparison
    axes[0].bar(strategies, rmse_values, color='skyblue', alpha=0.7)
    axes[0].set_title('RMSE Comparison Across Testing Strategies')
    axes[0].set_ylabel('RMSE')
    axes[0].tick_params(axis='x', rotation=45)
    
    # MAE comparison
    axes[1].bar(strategies, mae_values, color='lightcoral', alpha=0.7)
    axes[1].set_title('MAE Comparison Across Testing Strategies')
    axes[1].set_ylabel('MAE')
    axes[1].tick_params(axis='x', rotation=45)
    
    # R2 comparison
    axes[2].bar(strategies, r2_values, color='lightgreen', alpha=0.7)
    axes[2].set_title('R² Comparison Across Testing Strategies')
    axes[2].set_ylabel('R²')
    axes[2].tick_params(axis='x', rotation=45)
    
    plt.tight_layout()
    plt.show()

# Plot comparisons
print("\n4. VISUALIZATION OF TESTING STRATEGIES")
print("-" * 40)
plot_strategy_comparison(strategy_results)
plot_metrics_comparison(strategy_results, cv_results)


# %%
# Summary and Recommendations
print("\n5. SUMMARY AND RECOMMENDATIONS")
print("="*60)

print("\nTesting Strategy Analysis:")
print("-" * 30)

# Analyze each strategy
strategy_analysis = {
    'Random': {
        'description': 'Random 80/20 split of all data',
        'pros': ['Simple to implement', 'Balanced representation', 'No bias'],
        'cons': ['May not reflect real-world temporal patterns', 'Data leakage possible']
    },
    'Temporal': {
        'description': 'Last 20% of time series data for testing',
        'pros': ['Realistic temporal evaluation', 'Tests model on future data', 'No data leakage'],
        'cons': ['May not represent all data patterns', 'Limited test set size']
    },
    'Region': {
        'description': 'Stratified by geographical regions',
        'pros': ['Tests geographical generalization', 'Balanced regional representation'],
        'cons': ['May have imbalanced samples per region', 'Complex to implement']
    },
    'Subregion': {
        'description': 'Stratified by sub-regions (more granular)',
        'pros': ['More granular geographical testing', 'Better regional diversity'],
        'cons': ['Very small test sets for some subregions', 'May not be representative']
    }
}

for strategy, analysis in strategy_analysis.items():
    if strategy.lower() in strategy_results:
        rmse = strategy_results[strategy.lower()]['rmse']
        print(f"\n{strategy} Strategy:")
        print(f"  Description: {analysis['description']}")
        print(f"  Performance: RMSE = {rmse:.4f}")
        print(f"  Pros: {', '.join(analysis['pros'])}")
        print(f"  Cons: {', '.join(analysis['cons'])}")

print(f"\nCross-Validation Results:")
print(f"  Average RMSE: {cv_results['avg_rmse']:.4f} ± {cv_results['std_rmse']:.4f}")
print(f"  Average MAE: {cv_results['avg_mae']:.4f} ± {cv_results['std_mae']:.4f}")
print(f"  Average R²: {cv_results['avg_r2']:.4f} ± {cv_results['std_r2']:.4f}")

print(f"\nRECOMMENDATIONS:")
print("-" * 20)
print("1. For production deployment: Use Temporal strategy (most realistic)")
print("2. For model development: Use Cross-validation (most robust)")
print("3. For geographical analysis: Use Region strategy")
print("4. Always compare multiple strategies to ensure model robustness")
print("5. Consider ensemble approaches combining different strategies")

# Save results for future reference
results_summary = {
    'cv_results': cv_results,
    'strategy_results': strategy_results,
    'comparison_df': comparison_df,
    'best_strategy': best_strategy
}

print(f"\nResults saved for future reference.")
print(f"Best performing strategy: {best_strategy.capitalize()}")
print(f"Best RMSE: {strategy_rmse[best_strategy]:.4f}")




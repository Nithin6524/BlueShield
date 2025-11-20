import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, r2_score

# ---------------------------
# 1️⃣ Load your dataset
# ---------------------------
df = pd.read_csv("your_dataset.csv")

# Encode species if not already numeric
if 'species_encoded' not in df.columns:
    le = LabelEncoder()
    df['species_encoded'] = le.fit_transform(df['species'])

# ---------------------------
# 2️⃣ Train model to predict species
# ---------------------------
X_species = df[['latitude', 'longitude', 'MP_concentration_mg_L', 'temperature_C', 'salinity_ppt']]
y_species = df['species_encoded']

X_train, X_test, y_train, y_test = train_test_split(X_species, y_species, test_size=0.2, random_state=42)
species_model = RandomForestClassifier(random_state=42)
species_model.fit(X_train, y_train)
print("Species prediction accuracy:", accuracy_score(y_test, species_model.predict(X_test)))

# ---------------------------
# 3️⃣ Train model to predict bioaccumulation_factor
# ---------------------------
X_bio = df[['latitude', 'longitude', 'MP_concentration_mg_L', 'temperature_C', 'salinity_ppt', 'species_encoded']]
y_bio = df['bioaccumulation_factor']

X_train, X_test, y_train, y_test = train_test_split(X_bio, y_bio, test_size=0.2, random_state=42)
bio_model = RandomForestRegressor(random_state=42)
bio_model.fit(X_train, y_train)
print("Bioaccumulation R2:", r2_score(y_test, bio_model.predict(X_test)))

# ---------------------------
# 4️⃣ Train model to predict predicted_dose_mg_mL
# ---------------------------
X_dose = df[['latitude', 'longitude', 'MP_concentration_mg_L', 'temperature_C', 'salinity_ppt', 
             'species_encoded', 'bioaccumulation_factor']]
y_dose = df['predicted_dose_mg_mL']

X_train, X_test, y_train, y_test = train_test_split(X_dose, y_dose, test_size=0.2, random_state=42)
dose_model = RandomForestRegressor(random_state=42)
dose_model.fit(X_train, y_train)
print("Dose prediction R2:", r2_score(y_test, dose_model.predict(X_test)))

# ---------------------------
# 5️⃣ Predict for new samples
# ---------------------------
# Example new data (replace with your input)
new_data = pd.DataFrame({
    'latitude': [35.0],
    'longitude': [139.0],
    'MP_concentration_mg_L': [0.8],
    'temperature_C': [22],
    'salinity_ppt': [33]
})

# Step 1: Predict species
new_data['species_encoded'] = species_model.predict(new_data)

# Step 2: Predict bioaccumulation
new_data['bioaccumulation_factor'] = bio_model.predict(new_data)

# Step 3: Predict dose
new_data['predicted_dose_mg_mL'] = dose_model.predict(new_data)

print("\nFinal predictions:")
print(new_data)
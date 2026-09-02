import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

def generate_focus_data(num_samples=1000, random_seed=42):
    """Generates synthetic study session records for regression training."""
    np.random.seed(random_seed)

    session_duration = np.random.randint(15, 180, size=num_samples) # minutes
    breaks_taken = np.random.randint(0, 6, size=num_samples)
    time_of_day_hour = np.random.randint(6, 24, size=num_samples)
    tab_switches = np.random.randint(0, 15, size=num_samples)
    self_rating = np.random.randint(1, 6, size=num_samples)

    # True target formula with realistic noise
    base = self_rating * 18.0
    penalties = (breaks_taken * 4.5) + (tab_switches * 2.8)
    duration_factor = np.where((session_duration >= 25) & (session_duration <= 90), 8.0, -5.0)
    noise = np.random.normal(0, 3.0, size=num_samples)

    target_score = np.clip(base - penalties + duration_factor + noise, 0.0, 100.0)

    df = pd.DataFrame({
        'session_duration': session_duration,
        'breaks_taken': breaks_taken,
        'time_of_day_hour': time_of_day_hour,
        'tab_switches': tab_switches,
        'self_rating': self_rating,
        'normalized_focus_score': target_score
    })

    return df

def train_and_save_focus_model():
    print("Generating synthetic focus score dataset (1,000 rows)...")
    df = generate_focus_data()

    X = df.drop(columns=['normalized_focus_score'])
    y = df['normalized_focus_score']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    print("Training RandomForestRegressor model...")
    model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("\n--- FOCUS SCORE REGRESSION EVALUATION ---")
    print(f"Mean Absolute Error (MAE): {mae:.2f} points")
    print(f"Root Mean Squared Error (RMSE): {rmse:.2f} points")
    print(f"R2 Score: {r2:.4f}")

    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)

    model_path = os.path.join(models_dir, 'focus_score_model.pkl')
    joblib.dump(model, model_path)
    print(f"Saved focus score model to: {os.path.abspath(model_path)}")

if __name__ == '__main__':
    train_and_save_focus_model()

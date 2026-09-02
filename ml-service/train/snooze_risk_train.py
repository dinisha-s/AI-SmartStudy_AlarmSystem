import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def generate_synthetic_data(num_samples=1000, random_seed=42):
    """Generates realistic synthetic user sleep and alarm records for training."""
    np.random.seed(random_seed)

    hour_of_alarm = np.random.randint(5, 11, size=num_samples) # 5 AM - 10 AM
    day_of_week = np.random.randint(0, 7, size=num_samples) # 0=Mon, 6=Sun
    sleep_duration_prev_night = np.random.uniform(4.0, 9.5, size=num_samples) # hours
    snooze_count_last_7_days = np.random.randint(0, 15, size=num_samples)
    study_session_pending = np.random.choice([0, 1], size=num_samples, p=[0.3, 0.7])
    self_reported_energy = np.random.randint(1, 6, size=num_samples) # 1-5 scale

    # Realistic logic for target (did_snooze):
    # Higher snooze tendency if sleep < 6h, high past snoozes, early hour, low energy
    score = (
        (6.5 - sleep_duration_prev_night) * 0.35 +
        (snooze_count_last_7_days * 0.15) +
        ((8 - hour_of_alarm) * 0.20) +
        ((3 - self_reported_energy) * 0.25)
    )

    # Sigmoid function to calculate probability
    prob = 1 / (1 + np.exp(-score))
    did_snooze = (prob > 0.5).astype(int)

    df = pd.DataFrame({
        'hour_of_alarm': hour_of_alarm,
        'day_of_week': day_of_week,
        'sleep_duration_prev_night': sleep_duration_prev_night,
        'snooze_count_last_7_days': snooze_count_last_7_days,
        'study_session_pending': study_session_pending,
        'self_reported_energy': self_reported_energy,
        'did_snooze': did_snooze
    })

    return df

def train_and_save_model():
    print("Generating synthetic training dataset (1,000 rows)...")
    df = generate_synthetic_data()

    X = df.drop(columns=['did_snooze'])
    y = df['did_snooze']

    # Train / Test Split (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training RandomForestClassifier model...")
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate Model
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)

    print("\n--- MODEL EVALUATION RESULTS ---")
    print(f"Accuracy:  {acc * 100:.2f}%")
    print(f"Precision: {prec * 100:.2f}%")
    print(f"Recall:    {rec * 100:.2f}%")
    print(f"F1 Score:  {f1 * 100:.2f}%")
    print("Confusion Matrix:\n", confusion_matrix(y_test, y_pred))

    # Create models directory if it doesn't exist
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)

    model_path = os.path.join(models_dir, 'snooze_risk_model.pkl')
    joblib.dump(model, model_path)
    print(f"\nSuccessfully saved trained model to: {os.path.abspath(model_path)}")

if __name__ == '__main__':
    train_and_save_model()

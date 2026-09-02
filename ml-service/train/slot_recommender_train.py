import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

def generate_slot_data(num_samples=1000, random_seed=42):
    """Generates synthetic data mapping subject type to optimal study time slot."""
    np.random.seed(random_seed)

    subject_type = np.random.randint(0, 4, size=num_samples) # 0=Theory, 1=Numerical, 2=Coding, 3=Language
    avg_focus_history = np.random.uniform(50.0, 95.0, size=num_samples)

    # Heuristics:
    # Math/Numerical (1) -> Morning (0) or Afternoon (1)
    # Coding (2) -> Night (3) or Evening (2)
    # Theory (0) -> Morning (0) or Evening (2)
    # Language (3) -> Afternoon (1) or Evening (2)
    slots = []
    for st, focus in zip(subject_type, avg_focus_history):
        if st == 1: # Numerical
            slot = np.random.choice([0, 1], p=[0.7, 0.3])
        elif st == 2: # Coding
            slot = np.random.choice([2, 3], p=[0.4, 0.6])
        elif st == 0: # Theory
            slot = np.random.choice([0, 2], p=[0.6, 0.4])
        else: # Language
            slot = np.random.choice([1, 2], p=[0.5, 0.5])
        slots.append(slot)

    df = pd.DataFrame({
        'subject_type': subject_type,
        'avg_focus_history': avg_focus_history,
        'best_slot': slots
    })

    return df

def train_and_save_slot_model():
    print("Generating synthetic study slot dataset (1,000 rows)...")
    df = generate_slot_data()

    X = df[['subject_type', 'avg_focus_history']]
    y = df['best_slot']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training multi-class RandomForestClassifier slot recommender model...")
    model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print("\n--- SLOT RECOMMENDER EVALUATION ---")
    print(f"Accuracy: {acc * 100:.2f}%")
    print("Classification Report:\n", classification_report(y_test, y_pred))

    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)

    model_path = os.path.join(models_dir, 'slot_recommender_model.pkl')
    joblib.dump(model, model_path)
    print(f"Saved slot recommender model to: {os.path.abspath(model_path)}")

if __name__ == '__main__':
    train_and_save_slot_model()

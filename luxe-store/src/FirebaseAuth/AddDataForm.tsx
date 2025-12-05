import React, { useState } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc } from "firebase/firestore";
import { useToast } from "../contexts/ToastContext";

interface User {
  id?: string;
  name: string;
  age: number;
}

interface FormErrors {
  name?: string;
  age?: string;
}

const AddDataForm = () => {
  const [data, setData] = useState<Omit<User, "id">>({ name: "", age: 0 });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  // Validation rules
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!data.name.trim()) {
      newErrors.name = "Name is required";
    } else if (data.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (data.name.trim().length > 50) {
      newErrors.name = "Name must not exceed 50 characters";
    }

    if (!Number.isInteger(data.age) || data.age < 0) {
      newErrors.age = "Please enter a valid age";
    } else if (data.age < 13) {
      newErrors.age = "Must be at least 13 years old";
    } else if (data.age > 120) {
      newErrors.age = "Please enter a realistic age";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === "age" ? Number(value) || 0 : value;
    setData((prev) => ({ ...prev, [name]: parsedValue }));
    // Clear error for this field on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast("Please fix the errors before submitting", "error");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, "users"), {
        name: data.name.trim(),
        age: data.age,
        createdAt: new Date().toISOString(),
      });
      addToast("User added successfully!", "success");
      setData({ name: "", age: 0 });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to add user";
      console.error("Error adding document:", error);
      addToast(`Error: ${message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name *</label>
        <input
          id="name"
          name="name"
          value={data.name}
          onChange={handleChange}
          placeholder="Enter user name"
          disabled={loading}
          aria-describedby={errors.name ? "name-error" : undefined}
          required
        />
        {errors.name && (
          <span id="name-error" className="error">
            {errors.name}
          </span>
        )}
      </div>

      <div>
        <label htmlFor="age">Age *</label>
        <input
          id="age"
          name="age"
          type="number"
          value={data.age}
          onChange={handleChange}
          placeholder="Enter age"
          disabled={loading}
          aria-describedby={errors.age ? "age-error" : undefined}
          required
        />
        {errors.age && (
          <span id="age-error" className="error">
            {errors.age}
          </span>
        )}
      </div>

      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add User"}
      </button>
    </form>
  );
};

export default AddDataForm;

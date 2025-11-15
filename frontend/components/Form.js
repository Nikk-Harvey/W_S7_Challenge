import React, { useState } from 'react';
import * as Yup from "yup";
import axios from "axios";


// 👇 Here are the validation errors you will use with Yup.
const validationErrors = {
  fullNameTooShort: 'full name must be at least 3 characters',
  fullNameTooLong: 'full name must be at most 20 characters',
  sizeIncorrect: 'size must be S or M or L'
};

// 👇 Here you will create your schema.

const schema = Yup.object().shape({
  fullName: Yup.string().trim().min(3).max(20).required("Full name required"),
  size: Yup.string().oneOf(["S", "M", "L"]).required("Size required"),
  toppings: Yup.array().of(Yup.string().oneOf(["1", "2", "3", "4", "5"]))
});

// 👇 This array could help you construct your checkboxes using .map in the JSX.
const toppings = [
  { topping_id: '1', text: 'Pepperoni' },
  { topping_id: '2', text: 'Green Peppers' },
  { topping_id: '3', text: 'Pineapple' },
  { topping_id: '4', text: 'Mushrooms' },
  { topping_id: '5', text: 'Ham' },
];

export default function Form() {
  const [formData, setFormData] = useState({
    fullName: "",
    size: "",
    toppings: []
  });
  const [errors, setErrors] = useState({});

  const handleChange = (evt) => {
    const {name, value, type, checked} = evt.target;

    if (type === "checkbox") {
      setFormData(prev => ({
        ...prev,
        toppings: checked
        ? [...prev.toppings, value]
        : prev.toppings.filter(t => t !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value}));
    }
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    try {
      await schema.validate(formData, { abortEarly: false});
      await axios.post("http://localhost:9009/api/order", formData);
      alert("Order submitted!");
      setFormData({ fullName: "", size: "", toppings: []});
      setErrors({});
    } catch (err) {
      if (err.inner) {
        const newErrors = {};
        err.inner.forEach(e => { newErrors[e.path] = e.message});
        setErrors(newErrors);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Full Name
        <input 
        name="fullName" 
        value={formData.fullName} 
        onChange={handleChange}
        />
      </label>
      {errors.fullName && <p>{errors.fullName}</p>}

      <label>Size
        <select name="size" value={formData.size} onChange={handleChange}>
          <option value="">--Select--</option>
          <option value="S">Small</option>
          <option value="M">Medium</option>
          <option value="L">Large</option>
        </select>
      </label>
      {errors.size && <p>{errors.size}</p>}

      <fieldset>
        <legend>Toppings</legend>
        {toppings.map(({topping_id, text}) => (
          <label key={topping_id}>
            <input
              type="checkbox"
              name="toppings"
              value={topping_id}
              checked={formData.toppings.includes(topping_id)}
              onChange={handleChange}
            /> {text}
          </label>
        ))}
       
      </fieldset>
      
      <button type="submit">Submit Order</button>
    </form>
  );
}

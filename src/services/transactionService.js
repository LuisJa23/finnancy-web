// services/transactionService.js
import { getCurrentUserUID } from "./AuthService"; // Cambiado a AuthService

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Mapeo de categorías del formulario a las del backend
const EXPENSE_CATEGORY_MAPPING = {
  alimentacion: "Alimentación",
  servicios: "Servicios",
  transporte: "Transporte",
  otro: "Otro",
};

const INCOME_CATEGORY_MAPPING = {
  salario: "Salario",
  venta: "Venta",
  otro: "Otro",
};

// Mapeo de métodos de pago del formulario a los del backend
const PAYMENT_METHOD_MAPPING = {
  efectivo: "CASH",
  tarjeta: "DEBIT_CARD", // Por defecto débito, podrías agregar otra opción para crédito
  transferencia: "BANK_TRANSFER",
};

export const getTransactionSummary = async (userId) => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/api/transactions/summary/${userId}`
    );

    if (!response.ok) {
      throw new Error(`Error al obtener el resumen: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error en getTransactionSummary:", error);
    throw error;
  }
};
export const registerExpense = async (expenseData) => {
  try {
    // Obtener el userId del token
    const userId = getCurrentUserUID();
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario");
    }

    // Obtener el token para autenticación
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    // Preparar los datos según el formato esperado por la API
    const transactionData = {
      amount: parseFloat(expenseData.amount),
      category:
        EXPENSE_CATEGORY_MAPPING[expenseData.category] || expenseData.category,
      date: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
      description: expenseData.details || "",
      type: "EXPENSE",
      expenseType: "VARIABLE", // Puedes cambiar esto según tu lógica de negocio
      paymentMethod: PAYMENT_METHOD_MAPPING[expenseData.method] || "OTHER",
      userId: userId,
    };

    // Realizar la petición POST
    const response = await fetch(`${BACKEND_URL}/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Asumiendo que usas Bearer token
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error al registrar el egreso:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export const registerIncome = async (incomeData) => {
  try {
    // Obtener el userId del token
    const userId = getCurrentUserUID();
    if (!userId) {
      throw new Error("No se pudo obtener el ID del usuario");
    }

    // Obtener el token para autenticación
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No se encontró el token de autenticación");
    }

    // Preparar los datos según el formato esperado por la API
    const transactionData = {
      amount: parseFloat(incomeData.amount),
      category:
        INCOME_CATEGORY_MAPPING[incomeData.category] || incomeData.category,
      date: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
      description: incomeData.details || "",
      type: "INCOME",
      paymentMethod: PAYMENT_METHOD_MAPPING[incomeData.method] || "OTHER",
      userId: userId,
    };

    // Realizar la petición POST
    const response = await fetch(`${BACKEND_URL}/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Asumiendo que usas Bearer token
      },
      body: JSON.stringify(transactionData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message || `Error ${response.status}: ${response.statusText}`
      );
    }

    const result = await response.json();
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error al registrar el ingreso:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Función auxiliar para validar los datos de egresos antes de enviar
export const validateExpenseData = (data) => {
  const errors = [];

  if (!data.amount || parseFloat(data.amount) <= 1) {
    errors.push("El monto debe ser mayor que 1");
  }

  if (!data.category) {
    errors.push("Debe seleccionar una categoría");
  }

  if (!data.method) {
    errors.push("Debe seleccionar un método de pago");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Función auxiliar para validar los datos de ingresos antes de enviar
export const validateIncomeData = (data) => {
  const errors = [];

  if (!data.amount || parseFloat(data.amount) <= 1) {
    errors.push("El monto debe ser mayor que 1");
  }

  if (!data.category) {
    errors.push("Debe seleccionar una categoría");
  }

  if (!data.method) {
    errors.push("Debe seleccionar un método de pago");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Función para obtener el userId (útil para validaciones)
export const getUserId = () => {
  return getCurrentUserUID();
};

// Función para debug - ver userId en consola
export const debugUserId = () => {
  const userId = getCurrentUserUID();
  const token = localStorage.getItem("token");

  console.log("=== DEBUG USER INFO ===");
  console.log("User ID:", userId);
  console.log("Token exists:", !!token);

  if (token) {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = JSON.parse(
        atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
      );
      console.log("Token payload:", decodedPayload);
    } catch (error) {
      console.log("Error decoding token:", error);
    }
  }

  console.log("=====================");
  return userId;
};

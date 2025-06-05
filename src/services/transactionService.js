// services/transactionService.js
import { getCurrentUserUID } from "./AuthService"; // Cambiado a AuthService

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Categorías válidas según el backend ExpenseCategory enum
const VALID_EXPENSE_CATEGORIES = [
  "Hogar",
  "Tarjeta de crédito", 
  "Transporte",
  "Supermercado",
  "Tiendas",
  "Otro"
];

const VALID_INCOME_CATEGORIES = [
  "Salario",
  "Otro"
];

// Mapeo de métodos de pago del formulario a los del backend
const PAYMENT_METHOD_MAPPING = {
  "CASH": "CASH",
  "DEBIT_CARD": "DEBIT_CARD", 
  "CREDIT_CARD": "CREDIT_CARD",
  "BANK_TRANSFER": "BANK_TRANSFER"
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
    // ============= LOGGING CRÍTICO PARA DEBUG =============
    console.group("🚨🚨🚨 CRITICAL EXPENSE DEBUG SESSION");
    console.log("Timestamp:", new Date().toISOString());
    console.log("Input data received:", expenseData);
    console.log("Type of each field:");
    Object.keys(expenseData).forEach(key => {
      console.log(`  ${key}: "${expenseData[key]}" (${typeof expenseData[key]})`);
    });
    
    // ============= VALIDACIÓN CRÍTICA INMEDIATA =============
    console.group("🚨 CRITICAL VALIDATION - Register Expense");
    console.log("Raw input data:", expenseData);
    
    // VERIFICACIÓN INMEDIATA de categoría antes de cualquier procesamiento
    const validCategories = ["Supermercado", "Hogar", "Tarjeta de crédito", "Transporte", "Tiendas", "Otro"];
    if (!validCategories.includes(expenseData.category)) {
      console.error(`🚨 IMMEDIATE REJECTION: Invalid category "${expenseData.category}"`);
      console.error("Valid categories:", validCategories);
      throw new Error(`Categoría inválida recibida: "${expenseData.category}". Categorías válidas: ${validCategories.join(", ")}`);
    }
    
    // VERIFICACIÓN de contaminación con detalles
    const detailsWords = ["papas", "galletas", "pan", "leche", "huevos", "carne", "pollo", "arroz", "frijoles"];
    if (detailsWords.some(word => expenseData.category.toLowerCase().includes(word.toLowerCase()))) {
      console.error(`🚨 IMMEDIATE REJECTION: Category contains details "${expenseData.category}"`);
      throw new Error(`Error: "${expenseData.category}" parece ser un detalle, no una categoría válida`);
    }
    
    // VERIFICACIÓN de patrón userId
    const userIdPattern = /^[a-zA-Z0-9]{28}$/;
    if (userIdPattern.test(expenseData.category)) {
      console.error(`🚨 IMMEDIATE REJECTION: Category looks like userId "${expenseData.category}"`);
      throw new Error(`Error crítico: La categoría contiene lo que parece ser un ID de usuario`);
    }
    
    console.log("✅ Initial validation passed");
    console.groupEnd();
    
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

    // Validar que los campos obligatorios estén presentes
    if (!expenseData.amount || !expenseData.category || !expenseData.method) {
      throw new Error("Faltan campos obligatorios: amount, category, method");
    }

    // Validar integridad de los datos del formulario
    validateFormDataIntegrity(expenseData, userId);

    // SANITIZAR Y VALIDAR datos específicamente
    const cleanData = sanitizeAndValidateExpenseData(expenseData, userId);

    // VALIDACIÓN CRÍTICA: Verificar que category no contiene details
    if (cleanData.category === cleanData.details) {
      console.error("🚨 CRITICAL ERROR: Category equals details!", {
        category: cleanData.category,
        details: cleanData.details
      });
      throw new Error("Error interno: la categoría no puede ser igual a los detalles");
    }

    // VALIDACIÓN CRÍTICA: Verificar que category es una categoría válida
    if (!validCategories.includes(cleanData.category)) {
      console.error("🚨 CRITICAL ERROR: Invalid category received!", {
        received: cleanData.category,
        valid: validCategories
      });
      throw new Error(`Categoría inválida: "${cleanData.category}". Debe ser una de: ${validCategories.join(", ")}`);
    }

    // Validar que el método de pago sea válido
    const validPaymentMethod = PAYMENT_METHOD_MAPPING[cleanData.method];
    if (!validPaymentMethod) {
      throw new Error(`Método de pago no válido: ${cleanData.method}`);
    }

    // Validación final: verificar que la categoría es válida según el backend
    if (!VALID_EXPENSE_CATEGORIES.includes(cleanData.category)) {
      console.error("🚨 CRITICAL ERROR: Categoría no válida para backend!", {
        received: cleanData.category,
        validBackend: VALID_EXPENSE_CATEGORIES
      });
      throw new Error(`Categoría inválida para backend: "${cleanData.category}". Debe ser una de: ${VALID_EXPENSE_CATEGORIES.join(", ")}`);
    }

    // Preparar los datos según el formato esperado por la API del backend
    const transactionData = {
      type: "EXPENSE",
      amount: parseFloat(cleanData.amount),
      description: cleanData.details || "",
      category: cleanData.category, // Usar categoría directa como string
      paymentMethod: validPaymentMethod,
      expenseType: "VARIABLE", // Campo requerido por el backend
      date: new Date().toISOString().split("T")[0], // Fecha actual en formato YYYY-MM-DD
      userId: userId
    };

    // Validación adicional: verificar que no hay datos contaminados
    if (transactionData.category === userId) {
      console.error("🚨 ERROR: La categoría es igual al userId. Esto es un error!");
      throw new Error("Error interno: categoría incorrecta");
    }
    
    if (transactionData.description && transactionData.description === transactionData.category) {
      console.warn("⚠️ WARNING: La descripción y categoría son iguales");
    }

    // Realizar la petición POST al endpoint principal
    console.log("🚀 Enviando transacción al backend:", transactionData);
    
    const response = await fetch(`${BACKEND_URL}/api/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(transactionData),
    });

    console.log("📡 Respuesta del servidor:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🚨 Error del servidor:", errorText);
      
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Si no es JSON válido, usar el texto plano
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log("✅ Transacción registrada exitosamente:", result);
    
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

    // Validar que los campos obligatorios estén presentes
    if (!incomeData.amount || !incomeData.category || !incomeData.method) {
      throw new Error("Faltan campos obligatorios: amount, category, method");
    }

    // Validar integridad de los datos del formulario
    validateFormDataIntegrity(incomeData, userId);

    // Validar que el método de pago sea válido
    const validPaymentMethod = PAYMENT_METHOD_MAPPING[incomeData.method];
    if (!validPaymentMethod) {
      throw new Error(`Método de pago no válido: ${incomeData.method}`);
    }

    // Validar que la categoría es válida para ingresos
    if (!VALID_INCOME_CATEGORIES.includes(incomeData.category)) {
      console.error("🚨 CRITICAL ERROR: Categoría de ingreso no válida!", {
        received: incomeData.category,
        validIncome: VALID_INCOME_CATEGORIES
      });
      throw new Error(`Categoría de ingreso inválida: "${incomeData.category}". Debe ser una de: ${VALID_INCOME_CATEGORIES.join(", ")}`);
    }

    // Preparar los datos según el formato esperado por la API del backend
    const transactionData = {
      type: "INCOME",
      amount: parseFloat(incomeData.amount),
      description: incomeData.details || "",
      category: incomeData.category, // Usar categoría directa
      paymentMethod: validPaymentMethod,
      date: new Date().toISOString().split("T")[0],
      userId: userId
    };
    
    console.log("🔍 Datos del formulario recibidos:", incomeData);
    console.log("🔄 Amount:", incomeData.amount, "->", parseFloat(incomeData.amount));
    console.log("🔄 Details:", incomeData.details);
    console.log("🔄 Categoria:", incomeData.category);
    console.log("🔄 Method:", incomeData.method, "->", validPaymentMethod);
    console.log("🔄 Objeto final para enviar:", transactionData);

    // Validación adicional: verificar que no hay datos contaminados
    if (transactionData.category === userId) {
      console.error("🚨 ERROR: La categoría es igual al userId. Esto es un error!");
      throw new Error("Error interno: categoría incorrecta");
    }
    
    if (transactionData.description && transactionData.description === transactionData.category) {
      console.warn("⚠️ WARNING: La descripción y categoría son iguales");
    }

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

// Función auxiliar para limpiar y validar datos del formulario
const sanitizeAndValidateExpenseData = (expenseData, userId) => {
  console.log("🧹 Sanitizando datos del formulario...");
  
  // Crear una copia limpia de los datos
  const sanitized = {
    amount: String(expenseData.amount || "").trim(),
    details: String(expenseData.details || "").trim(),
    category: String(expenseData.category || "").trim(),
    method: String(expenseData.method || "").trim()
  };
  
  console.log("🔍 Datos sanitizados:", sanitized);
  
  // Verificar que details no se haya colado en category
  if (sanitized.category && sanitized.details && sanitized.category === sanitized.details) {
    console.error("🚨 ERROR: Details encontrados en category field!");
    throw new Error("Error de datos: los detalles están en el campo de categoría");
  }
  
  // Verificar que userId no esté en ningún campo
  Object.keys(sanitized).forEach(key => {
    if (sanitized[key] === userId) {
      console.error(`🚨 ERROR: UserID encontrado en campo ${key}!`);
      throw new Error(`Error crítico: userId en campo ${key}`);
    }
  });
  
  // Verificar que category sea válida
  const validCategories = ["Supermercado", "Hogar", "Tarjeta de crédito", "Transporte", "Tiendas", "Otro"];
  if (!validCategories.includes(sanitized.category)) {
    console.error("🚨 ERROR: Categoría inválida:", sanitized.category);
    throw new Error(`Categoría inválida: "${sanitized.category}"`);
  }
  
  console.log("✅ Datos sanitizados y validados correctamente");
  return sanitized;
};

// Función auxiliar para validar que los datos no estén contaminados
const validateFormDataIntegrity = (formData, userId) => {
  console.log("🔍 Validando integridad de datos...");
  
  // Verificar que ningún campo contenga el userId
  const fields = ['amount', 'details', 'category', 'method'];
  for (const field of fields) {
    if (formData[field] === userId) {
      console.error(`🚨 ERROR: El campo '${field}' contiene el userId: ${formData[field]}`);
      throw new Error(`Error interno: campo ${field} contaminado con userId`);
    }
  }
  
  // Verificar que la categoría no sea igual a los detalles
  if (formData.category && formData.details && formData.category === formData.details) {
    console.warn(`⚠️ WARNING: La categoría y los detalles son iguales: ${formData.category}`);
  }
  
  // Verificar que los campos obligatorios no estén vacíos
  if (!formData.category || formData.category.trim() === '') {
    throw new Error("La categoría no puede estar vacía");
  }
  
  if (!formData.method || formData.method.trim() === '') {
    throw new Error("El método de pago no puede estar vacío");
  }
  
  console.log("✅ Datos del formulario validados correctamente");
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

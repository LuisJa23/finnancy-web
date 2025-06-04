// services/statsService.js
import { getCurrentUserUID } from './AuthService';

// URL del backend de reportes financieros
const REPORTS_BACKEND_URL = 'http://finnnacy-reports-backend.us-east-2.elasticbeanstalk.com';

/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null} - Token de autenticación
 */
export function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Obtiene el reporte financiero completo del usuario
 * @param {string} userId - ID del usuario (opcional, por defecto user123)
 * @returns {Promise<Object>} - Datos del reporte financiero
 */
export async function getFinancialReport(userId = null) {
  try {
    // Usar user123 como ID de prueba si no se proporciona uno
    const uid = userId || 'user123';

    const response = await fetch(`${REPORTS_BACKEND_URL}/api/reports/financial-report/${uid}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener reporte financiero: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return data;
  } catch (error) {
    console.error('Error en getFinancialReport:', error);
    throw error;
  }
}

/**
 * Obtiene las últimas transacciones con balance acumulado
 * Nota: Esta función ahora utiliza los datos de savingsHistory del reporte financiero
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Array>} - Array de transacciones con balance acumulado
 */
export async function getLastTransactionsWithBalance(userId = null) {
  try {
    // Obtener el reporte financiero completo que contiene savingsHistory
    const financialReport = await getFinancialReport(userId);
    
    // Extraer savingsHistory del totalSavings
    const savingsHistory = financialReport?.totalSavings?.savingsHistory || [];
    
    // Si no hay historia, crear datos de ejemplo basados en el balance actual
    if (savingsHistory.length === 0) {
      const currentSavings = financialReport?.totalSavings?.currentSavings || 0;
      
      // Generar datos de ejemplo para los últimos 7 días
      const exampleData = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Simular cambios graduales hacia el balance actual
        const progress = (6 - i) / 6; // 0 a 1
        const balance = currentSavings * progress;
        const amount = i === 6 ? currentSavings - (currentSavings * 5/6) : 
                      (currentSavings * progress) - (currentSavings * (progress - 1/6));
        
        exampleData.push({
          date: date.toISOString().split('T')[0],
          amount: amount,
          runningBalance: balance,
          description: i === 0 ? 'Balance inicial' : `Transacción día ${7-i}`
        });
      }
      
      return exampleData;
    }
    
    return savingsHistory;
  } catch (error) {
    console.error('Error al obtener transacciones con balance:', error);
    throw new Error(`Error al obtener transacciones: ${error.message}`);
  }
}

/**
 * Obtiene estadísticas de gastos por categoría
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Array>} - Array de gastos por categoría
 */
export async function getExpensesByCategory(userId = null) {
  try {
    const financialReport = await getFinancialReport(userId);
    return financialReport?.expensesByCategory || [];
  } catch (error) {
    console.error('Error en getExpensesByCategory:', error);
    throw error;
  }
}

/**
 * Obtiene datos de ingresos vs egresos
 * @param {string} userId - ID del usuario (opcional)
 * @returns {Promise<Object>} - Datos de ingresos vs egresos
 */
export async function getIncomeVsExpenses(userId = null) {
  try {
    const financialReport = await getFinancialReport(userId);
    return financialReport?.incomeVsExpenses || null;
  } catch (error) {
    console.error('Error en getIncomeVsExpenses:', error);
    throw error;
  }
}

/**
 * Función de utilidad para formatear moneda
 * @param {number} amount - Cantidad a formatear
 * @returns {string} - Cantidad formateada como moneda
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Función de utilidad para formatear números
 * @param {number} number - Número a formatear
 * @returns {string} - Número formateado
 */
export function formatNumber(number) {
  return new Intl.NumberFormat('es-CO').format(number);
}

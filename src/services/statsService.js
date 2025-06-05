// services/statsService.js
import { getCurrentUserUID } from './AuthService.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8081';
const REPORTS_BACKEND_URL = import.meta.env.VITE_REPORTS_BACKEND_URL || 'http://finnnacy-reports-backend.us-east-2.elasticbeanstalk.com';

/**
 * Obtiene el token del localStorage
 */
function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Obtiene el reporte financiero completo del usuario
 * @param {string} userId - ID del usuario (opcional, se obtiene del token si no se proporciona)
 * @returns {Promise<Object>} - Datos del reporte financiero
 */
export async function getFinancialReport(userId = null) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const uid = userId || getCurrentUserUID();
    if (!uid) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await fetch(`${REPORTS_BACKEND_URL}/api/reports/financial-report/${uid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
 * Obtiene el resumen de transacciones del usuario
 * @param {string} userId - ID del usuario (opcional, se obtiene del token si no se proporciona)
 * @returns {Promise<Object>} - Resumen de transacciones
 */
export async function getTransactionSummary(userId = null) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const uid = userId || getCurrentUserUID();
    if (!uid) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await fetch(`${BACKEND_URL}/api/transactions/summary/${uid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener resumen de transacciones: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error en getTransactionSummary:', error);
    throw error;
  }
}

/**
 * Obtiene todas las transacciones del usuario para debugging
 * @param {string} userId - ID del usuario
 * @returns {Promise<Array>} - Lista de transacciones
 */
export async function getAllUserTransactions(userId = null) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const uid = userId || getCurrentUserUID();
    if (!uid) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await fetch(`${BACKEND_URL}/api/transactions/user/${uid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener transacciones: ${response.status} ${response.statusText}`);
    }

    const transactions = await response.json();
    console.log('📝 statsService - Todas las transacciones:', transactions);
    
    // Analizar las categorías en las transacciones
    if (Array.isArray(transactions)) {
      const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
      const categories = [...new Set(expenseTransactions.map(t => t.category))];
      
      console.log('🔍 Análisis de transacciones de gastos:');
      console.log(`  Total transacciones de gastos: ${expenseTransactions.length}`);
      console.log(`  Categorías únicas encontradas: ${categories.length}`);
      console.log(`  Categorías: [${categories.join(', ')}]`);
      
      // Agrupar por categoría manualmente para comparar
      const manualGrouping = {};
      expenseTransactions.forEach(t => {
        if (!manualGrouping[t.category]) {
          manualGrouping[t.category] = 0;
        }
        manualGrouping[t.category] += t.amount;
      });
      
      console.log('📊 Agrupación manual por categoría:');
      Object.entries(manualGrouping).forEach(([category, amount]) => {
        console.log(`  ${category}: $${amount}`);
      });
    }
    
    return transactions;
  } catch (error) {
    console.error('Error en getAllUserTransactions:', error);
    throw error;
  }
}

/**
 * Obtiene las últimas 8 transacciones con balance acumulado
 * @param {string} userId - ID del usuario (opcional, se obtiene del token si no se proporciona)
 * @returns {Promise<Array>} - Array de transacciones con balance acumulado
 */
export async function getLastTransactionsWithBalance(userId = null) {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No se encontró token de autenticación');
    }

    const uid = userId || getCurrentUserUID();
    if (!uid) {
      throw new Error('No se pudo obtener el ID del usuario');
    }

    const response = await fetch(`${REPORTS_BACKEND_URL}/api/transactions/last-8-with-balance/${uid}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener transacciones con balance: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📊 Últimas transacciones con balance:', data);
    return data;
  } catch (error) {
    console.error('Error en getLastTransactionsWithBalance:', error);
    throw error;
  }
}

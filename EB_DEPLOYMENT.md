# Deployment a Elastic Beanstalk - Configuración Simplificada

## 📋 Archivos Necesarios

```
├── app.js                    # Servidor Express 
├── Procfile                  # Comando de inicio: "web: node app.js"
├── package.json             # Dependencies
├── buildspec.yml            # Para build (opcional)
├── .ebignore               # Archivos a excluir
├── .ebextensions/          # Configuración EB
│   ├── 01_node.config     # Configuración básica
│   └── 02_performance.config  # Variables de entorno
└── .platform/
    └── nginx/
        └── conf.d/
            └── default.conf   # Nginx para React SPA
```

## 🚀 Comandos de Deployment

### **Setup inicial:**
```powershell
# Inicializar EB en el proyecto
eb init finnancy-front --platform "Node.js 18" --region us-east-1

# Crear entorno
eb create finnancy-front-prod --instance-type t3.small
```

### **Deployment:**
```powershell
# Build local
npm run build

# Deploy a EB
eb deploy

# Ver logs
eb logs

# Abrir aplicación
eb open
```

## ⚙️ Configuración Mínima

### **Variables de entorno (en .ebextensions):**
- `NODE_ENV=production`
- `PORT=8080` 
- `NPM_CONFIG_PRODUCTION=false` (para instalar devDependencies para build)

### **Health Check:**
- **Endpoint:** `/health`
- **Puerto:** 8080

### **Archivos servidos:**
- **Estáticos:** Nginx sirve desde `/dist`
- **SPA Routes:** Express maneja rutas de React Router

## 🔍 Verificación

1. **Health check:** `https://tu-app.elasticbeanstalk.com/health`
2. **Aplicación:** `https://tu-app.elasticbeanstalk.com`
3. **Logs:** `eb logs --all`

¡Configuración lista para deployment directo a Elastic Beanstalk! 🎉

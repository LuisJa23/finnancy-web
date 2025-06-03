# Pipeline CI/CD - CodeBuild + Elastic Beanstalk para Finnancy Front

## 🏗️ Arquitectura del Pipeline

```
GitHub → CodePipeline → CodeBuild → Elastic Beanstalk
   ↓           ↓           ↓             ↓
Source    Orchestration  Build      Deployment
```

## 📋 Componentes del Pipeline

### 1. **CodeBuild (Build Stage)**
- **Runtime:** Node.js 18
- **Build process:** `npm ci` + `npm run build`
- **Output:** Aplicación React compilada en `/dist`
- **Configuración:** `buildspec.yml`

### 2. **Elastic Beanstalk (Deploy Stage)**  
- **Platform:** Node.js 18 on Amazon Linux 2
- **Server:** Express.js sirve la SPA React
- **Proxy:** Nginx (configurado para SPA)
- **Health check:** `/health` endpoint

## 🔧 Archivos de Configuración

### **Estructura de archivos críticos:**
```
.
├── buildspec.yml                    # CodeBuild configuration
├── app.js                          # Express server
├── Procfile                        # EB start command
├── package.json                    # Dependencies
├── .ebignore                       # Files to exclude from EB
├── .ebextensions/                  # EB configuration
│   ├── 01_node.config             # Basic settings
│   ├── 02_performance.config      # Performance tuning
│   ├── 03_codebuild_integration.config  # CodeBuild specific
│   └── 04_logging.config          # Logging configuration
└── .platform/
    └── nginx/
        └── conf.d/
            └── default.conf        # Nginx SPA configuration
```

## 🚀 Setup del Pipeline

### **Paso 1: Configurar CodeBuild Project**
```bash
aws codebuild create-project \
  --name "finnancy-front-build" \
  --source type=CODEPIPELINE,buildspec=buildspec.yml \
  --artifacts type=CODEPIPELINE \
  --environment type=LINUX_CONTAINER,image=aws/codebuild/amazonlinux2-x86_64-standard:4.0,computeType=BUILD_GENERAL1_MEDIUM \
  --service-role arn:aws:iam::ACCOUNT:role/CodeBuildServiceRole
```

### **Paso 2: Crear Elastic Beanstalk Application**
```bash
# Crear aplicación
eb init finnancy-front --platform "Node.js 18" --region us-east-1

# Crear entorno de desarrollo
eb create finnancy-front-dev --instance-type t3.micro

# Crear entorno de producción  
eb create finnancy-front-prod --instance-type t3.small
```

### **Paso 3: Configurar CodePipeline**
```bash
aws codepipeline create-pipeline \
  --cli-input-json file://aws-pipeline-config.json
```

## 📊 Monitoreo y Debugging

### **Comandos útiles:**
```powershell
# Ver logs de CodeBuild
aws logs tail /aws/codebuild/finnancy-front-build --follow

# Ver logs de Elastic Beanstalk
eb logs finnancy-front-prod --all

# Verificar estado del pipeline
aws codepipeline get-pipeline-state --name finnancy-front-pipeline

# Health check manual
curl https://tu-app.elasticbeanstalk.com/health
curl https://tu-app.elasticbeanstalk.com/build-info
```

### **Endpoints de monitoring:**
- **Health Check:** `/health` - Estado de la aplicación
- **Build Info:** `/build-info` - Información del build
- **CloudWatch Logs:** Logs automáticos de aplicación y servidor

## ⚡ Optimizaciones Aplicadas

### **CodeBuild:**
- ✅ Cache de node_modules optimizado
- ✅ Build verification automático
- ✅ Error handling mejorado
- ✅ Variables de entorno para producción

### **Elastic Beanstalk:**
- ✅ Configuración moderna (.platform en lugar de container_commands)
- ✅ Health checks optimizados
- ✅ Nginx configurado para React SPA
- ✅ Logging automático a CloudWatch
- ✅ Auto-scaling configurado

### **Application:**
- ✅ Express server optimizado para producción
- ✅ Static file serving con cache headers
- ✅ Error handling robusto
- ✅ Build verification en runtime

## 🔍 Troubleshooting

### **Build failures en CodeBuild:**
1. Verificar `buildspec.yml` syntax
2. Verificar dependencies en `package.json`
3. Revisar logs: `aws logs tail /aws/codebuild/finnancy-front-build`

### **Deployment failures en EB:**
1. Verificar health check: `curl /health`
2. Revisar configuración: `.ebextensions/*`
3. Verificar logs: `eb logs --all`

### **Application errors:**
1. Verificar que `/dist` existe y contiene `index.html`
2. Verificar Express server en puerto 8080
3. Verificar nginx proxy configuration

## 📈 Métricas de Performance

- **Build time:** ~2-4 minutos
- **Deploy time:** ~3-5 minutos  
- **Total pipeline:** ~6-10 minutos
- **Health check response:** <100ms
- **Static assets cache:** 1 año

## 🔒 Security Best Practices

- ✅ No secrets en código
- ✅ IAM roles con permisos mínimos
- ✅ HTTPS redirect en producción
- ✅ Security headers en nginx
- ✅ CloudWatch logging habilitado

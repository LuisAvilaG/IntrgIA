# Integración con n8n

Este documento describe cómo funciona la integración entre el frontend de Beautomate y el backend construido con n8n.

## URL Base de n8n

La URL base para los webhooks de n8n se almacena en el \`localStorage\` del navegador bajo la clave \`n8nUrl\`.

**Ejemplo de URL:** \`http://localhost:5678/webhook\`

## Endpoints

### Fase de Configuración (Settings & Mapping)

#### 1. Descubrir Subsidiarias
- **Endpoint:** \`/api/discover-subsidiaries\`
- **Método:** \`POST\`
- **Body:** \`{ "integrationId": "..." }\`

#### 2. Descubrir Datos por Subsidiaria (para Settings)
- **Endpoint:** \`/api/discover-mappings\`
- **Método:** \`POST\`
- **Body:** \`{ "integrationId": "...", "subsidiaryId": "..." }\`

#### 3. Configuración de Formato de Archivo y Settings (Endpoint Unificado)
- **Endpoint:** \`/api/file-format-config\`
- **Método:** \`POST\`
- **Acción "save_settings":** Guarda la configuración de "General Settings".
- **Acción "analyze":** Analiza un archivo de muestra.
- **Acción "save":** Guarda la configuración del parser.

#### 4. Mapeo Avanzado (Endpoint Unificado)
- **Endpoint:** \`/api/discover-advanced-mappings\`
- **Método:** \`POST\`
- **Descripción:** Un único endpoint para descubrir los datos necesarios para el mapeo y para guardar la configuración final.

- **Acción de Descubrimiento (Body):**
    \`\`\`json
    {
      "integrationId": "integ_abc123",
      "action": "discover"
    }
    \`\`\`
- **Respuesta de Descubrimiento Exitosa:**
    \`\`\`json
    {
      "status": "success",
      "discoveredMappings": { "Tender_Name": ["Efectivo", "Visa"] },
      "netsuiteData": { "accounts": [], "classes": [], "departments": [] }
    }
    \`\`\`

- **Acción de Guardado (Body):**
    \`\`\`json
    {
      "integrationId": "integ_abc123",
      "action": "save",
      "mappings": {
        "Tender_Name": [
          { "sourceValue": "Visa", "netsuiteAccount": "1150", "netsuiteClass": null }
        ]
      }
    }
    \`\`\`
- **Respuesta de Guardado Exitosa:**
    \`\`\`json
    { "status": "success", "message": "Advanced mappings saved." }
    \`\`\`

### Gestión de Clientes e Integraciones
- **/clients** (POST, GET)
- **/integrations** (GET, POST)
- **/integrations/status** (POST)

### Gestión de Credenciales
- **/credentials/pos** (POST)
- **/api/sftp-config** (POST)
- **/credentials/erp** (POST)

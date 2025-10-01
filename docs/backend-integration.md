# Integración con n8n

Este documento describe cómo funciona la integración entre el frontend de Beautomate y el backend construido con n8n.

## URL Base de n8n

La URL base para los webhooks de n8n se almacena en el `localStorage` del navegador bajo la clave `n8nUrl`. Esta URL se debe configurar desde el Dashboard de la aplicación antes de realizar cualquier petición.

**Ejemplo de URL:** `http://localhost:5678/webhook`

## Endpoints

### Fase de Configuración (Settings)

#### Paso 1: Descubrir Subsidiarias

-   **Endpoint:** `/api/discover-subsidiaries`
-   **Método:** `POST`
-   **Descripción:** Obtiene únicamente la lista de Subsidiarias de NetSuite para poblar el primer campo de la configuración.
-   **Formato del Body:**
    ```json
    {
      "integrationId": "integ_abc123"
    }
    ```
-   **Respuesta Exitosa (Ejemplo):**
    ```json
    {
      "status": "success",
      "data": {
        "subsidiaries": [
          { "id": "1", "name": "La Caldera Principal" },
          { "id": "2", "name": "La Caldera Sucursal" }
        ]
      }
    }
    ```
-   **Respuesta de Falla (Ejemplo):**
    ```json
    {
      "status": "error",
      "message": "Could not connect to NetSuite using the provided credentials."
    }
    ```

#### Paso 2: Descubrir Datos por Subsidiaria

-   **Endpoint:** `/api/discover-mappings`
-   **Método:** `POST`
-   **Descripción:** Una vez seleccionada una subsidiaria, obtiene los datos restantes (Cuentas, Clases, Departamentos) filtrados por esa subsidiaria.
-   **Formato del Body:**
    ```json
    {
      "integrationId": "integ_abc123",
      "subsidiaryId": "1"
    }
    ```
-   **Respuesta Exitosa (Ejemplo):**
    ```json
    {
      "status": "success",
      "data": {
        "pos": {},
        "netsuite": {
          "accounts": [ { "id": "1150", "name": "1150 - Clearing Account" }, ... ],
          "classes": [ { "id": "1", "name": "Restaurante" }, ... ],
          "departments": [ { "id": "10", "name": "Administración" }, ... ]
        }
      }
    }
    ```
-   **Respuesta de Falla (Ejemplo):**
     ```json
    {
      "status": "error",
      "message": "Could not retrieve mappings for the selected subsidiary."
    }
    ```

### Gestión de Clientes e Integraciones

#### Crear un Cliente

-   **Endpoint:** `/clients`
-   **Método:** `POST`
-   **Respuestas:** `{ "status": "true" }` (Éxito), `{ "status": "fail" }` (Duplicado)

#### Obtener Clientes

-   **Endpoint:** `/clients` (todos) o `/clients?id={id}` (específico)
-   **Método:** `GET`

#### Obtener Integraciones de un Cliente

-   **Endpoint:** `/integrations?clientId={clientIdCompuesto}`
-   **Método:** `GET`

#### Crear una Nueva Integración

-   **Endpoint:** `/integrations`
-   **Método:** `POST`
-   **Body:** `{ "clientid": "...", "integratioType": "..." }`
-   **Respuesta:** `{ "status": "success", "integrationid": "integ_abc123" }`

#### Actualizar el Estado de una Integración

-   **Endpoint:** `/integrations/status`
-   **Método:** `POST`
-   **Body:** `{ "integrationid": "...", "newStatus": "..." }`


### Gestión de Credenciales y Configuración Específica

#### Guardar Credenciales del POS

-   **Endpoint:** `/credentials/pos`
-   **Método:** `POST`
-   **Body:** `{ "integrationid": "...", "connectionType": "...", ... }`

#### Guardar Configuración de Archivos SFTP (Paso Condicional)

-   **Endpoint:** `/api/sftp-config`
-   **Método:** `POST`
-   **Descripción:** Guarda el patrón de nombres de archivo y la lista de restaurantes con sus valores dinámicos para las integraciones SFTP.
-   **Formato del Body:**
    ```json
    {
      "integrationId": "integ_abc123",
      "fileNamePattern": "GLExport_<StoreNumber>_<StoreClass><MMDDYY>.txt",
      "fileExtension": "txt",
      "restaurants": [
        {
          "name": "Restaurante Principal",
          "path": "/exports/restaurante_101/",
          "placeholders": {
            "StoreNumber": "101",
            "StoreClass": "A"
          }
        },
        {
          "name": "Sucursal Norte",
          "path": "/exports/restaurante_102/",
          "placeholders": {
            "StoreNumber": "102",
            "StoreClass": "B"
          }
        }
      ]
    }
    ```
-   **Respuesta Exitosa (Ejemplo):**
    ```json
    {
        "status": "success",
        "message": "SFTP configuration saved successfully."
    }
    ```
-   **Respuesta de Falla (Ejemplo):**
    ```json
    {
        "status": "error",
        "message": "Invalid data provided. Please check all fields."
    }
    ```

#### Guardar Credenciales del ERP

-   **Endpoint:** `/credentials/erp`
-   **Método:** `POST`
-   **Body:** `{ "integrationid": "...", "connectionType": "netsuite_tba", ... }`

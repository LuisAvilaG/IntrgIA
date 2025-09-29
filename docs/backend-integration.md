# Integración con n8n

Este documento describe cómo funciona la integración entre el frontend de Beautomate y el backend construido con n8n.

## URL Base de n8n

La URL base para los webhooks de n8n se almacena en el `localStorage` del navegador bajo la clave `n8nUrl`. Esta URL se debe configurar desde el Dashboard de la aplicación antes de realizar cualquier petición.

**Ejemplo de URL:** `http://localhost:5678`

El frontend intentará conectarse a `{n8nUrl}/webhook-test` y, si falla, a `{n8nUrl}/webhook`.

## Endpoints

### Crear un Cliente

-   **Endpoint:** `/clients`
-   **Método:** `POST`
-   **Respuestas:**
    -   `{ "status": "true" }` (Éxito)
    -   `{ "status": "fail" }` (Cliente Duplicado)

### Obtener Todos los Clientes

-   **Endpoint:** `/clients`
-   **Método:** `GET`
-   **Respuesta Exitosa (Ejemplo):** `[ { cliente1 }, { cliente2 } ]`

### Obtener un Cliente Específico

-   **Endpoint:** `/clients?id={id}`
-   **Método:** `GET`
-   **Respuesta Exitosa (Ejemplo):** `[ { cliente } ]` o `{ cliente }`

### Obtener Integraciones de un Cliente

-   **Endpoint:** `/integrations?clientId={clientIdCompuesto}`
-   **Método:** `GET`
-   **Parámetros de Query:**
    -   `clientId` (requerido): El ID compuesto del cliente (ej: `Campomar_Luis Avila`).
-   **Respuesta Exitosa (Ejemplo):**
    ```json
    [
      {
        "id": 1,
        "createdAt": "2025-09-28T23:47:14.789Z",
        "integrationid": "1",
        "clientid": "Campomar_Luis Avila",
        "integratioType": "Simphony-NetSuite",
        "status": "Active"
      }
    ]
    ```
-   **Respuesta Sin Integraciones:** `[]` (Un array vacío)

### Actualizar el Estado de una Integración

-   **Endpoint:** `/integrations/status`
-   **Método:** `POST`
-   **Descripción:** Cambia el estado de una integración.
-   **Formato del Body:**
    ```json
    {
      "integrationid": "1",
      "newStatus": "paused"
    }
    ```
-   **Respuesta Exitosa:** `{ "status": "success" }`

### Crear una Nueva Integración (Paso 1)

-   **Endpoint:** `/integrations`
-   **Método:** `POST`
-   **Descripción:** Crea el registro inicial de una integración.
-   **Formato del Body:**
    ```json
    {
      "clientid": "Campomar_Luis Avila",
      "integratioType": "Simphony-NetSuite"
    }
    ```
-   **Respuesta Exitosa:** `{ "status": "success", "integrationid": "integ_abc123" }`

### Guardar Credenciales del POS (Paso 2)

-   **Endpoint:** `/credentials/pos`
-   **Método:** `POST`
-   **Descripción:** Guarda y valida las credenciales del sistema POS.
-   **Formato del Body (SFTP):**
    ```json
    {
      "integrationid": "integ_abc123",
      "connectionType": "sftp",
      "hostname": "sftp.example.com",
      "username": "user",
      "password": "pass",
      "port": 22
    }
    ```
-   **Respuesta Exitosa:** `{ "status": "success" }`
-   **Respuesta de Falla:** `{ "status": "error", "message": "Invalid credentials" }`

### Guardar Credenciales del ERP (Paso 3)

-   **Endpoint:** `/credentials/erp`
-   **Método:** `POST`
-   **Descripción:** Guarda y valida las credenciales del sistema ERP.
-   **Formato del Body (NetSuite TBA):**
    ```json
    {
      "integrationid": "integ_abc123",
      "accountId": "TSTDRV12345",
      "consumerKey": "key_123",
      "consumerSecret": "secret_456",
      "tokenId": "token_789",
      "tokenSecret": "token_secret_012"
    }
    ```
-   **Respuesta Exitosa:** `{ "status": "success" }`
-   **Respuesta de Falla:** `{ "status": "error", "message": "Invalid credentials" }`

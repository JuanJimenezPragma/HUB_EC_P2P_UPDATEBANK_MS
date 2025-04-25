# HUB_EC_P2P_UPDATEBANK_MS
# Lambda Function: `clx-lambda-updatebank`

## Descripción
Esta función lambda se encarga de actualizar la información de entidades en el sistema. Al recibir una solicitud, 
procesa los datos proporcionados y actualiza la información correspondiente de cada entidad en la base de datos; esta
lambda es invocada a través de un API Gateway con el método `PUT`.

Esta lambda es invocada por el front cuando el usuario termina de diligenciar el formulario de actualización de una entidad.

## Funcionalidad
- Actualiza los detalles de uno o varios entidades en el sistema.
- Valida que los datos recibidos cumplan con el formato y las reglas de negocio establecidas.
- Realiza operaciones de actualización de forma atómica para asegurar consistencia.
- Registra el resultado de la operación y genera logs para facilitar el monitoreo.

## Parámetros de entrada
La lambda espera recibir un payload en formato multipart/form-data con los siguientes campos:
- `entityName` (string, required): Nuevo nombre del banco.
- `upperLimit` (number, required): Limite superior de la entidad.
- `lowerLimit` (number, required): Limite inferior de la entidad.
- `initial_amount` (number, required): Monto inicial de la entidad.
- `denialLimit` (number, required): Limite de negación de la entidad.
- `recipients` (list<string>, required): Lista de correos electrónicos de los receptores de notificaciones.
- `file` (file, optional): Logo de la entidad.


### Ejemplo de payload (body: multipart/form-data):
```multipart/form-data
{
  "entityName": "Entidad de prueba 1",
  "upperLimit": "1500.00",
  "initial_amount": "1000.00",
  "lowerLimit": "100.00",
  "denialLimit": "0.00",
  "recipients": [
      "correo_prueba1@email.com"
  ],
  "file": "logo_entidad.png"
}
```
## Ejecución del proyecto

### Preparación del entorno
Para ejecutar el proyecto se debe tener instalado Node.js en su versión 20.X.X y npm, luego se deben instalar las dependencias del proyecto con el comando:
```bash
npm install
```
#### Prerequisitos
Dado que este proyecto es una lambda de AWS se optó por usar el framework [AWS SAM][AWS SAM] el cual facilita el desarrollo,
pruebas y despliegue de lambdas en AWS, para usar el framework se deben tener en cuenta los siguientes prerequisitos:
1. Tener instalado [AWS CLI][AWS CLI] y configurado con las respectivas credenciales de AWS **DE LA CUENTA DE DESARROLLO**
   (ya sea en el perfil `default` o uno personalizado).
2. Tener instalado [Docker][Docker]. *(Asegúrese de que Docker es completamente funcional y accesible desde su terminal)*
3. Tener instalado [AWS SAM CLI][AWS SAM CLI].

Una vez cumplidos los prerequisitos hay una cosa más que se debe tener en cuenta antes de ejecutar el proyecto en local,
dado que la lambda normalmente se ejecuta a través de un endpoint de API Gateway, se debe simular ese endpoint en el
entorno local, para ello se debe editar el archivo `template.yaml`, afortunadamente el repositorio contiene un archivo de
referencia llamado `template.example.yaml` que ya contiene la configuración necesaria para simular el endpoint, por lo que
basta con renombrar el archivo `template.example.yaml` a `template.yaml` o en su defecto reemplazar el contenido del archivo
de referencia en el original y listo, ya se puede ejecutar el proyecto en local.:

***Nota:** El cambio descrito anteriormente no debe ser agregado al repositorio puesto que es un cambio que se realiza
exclusivamente de manera local para probar la lambda, **NO OLVIDAR** devolver los archivos a su estado natural para evitar
problemas en el despliegue y aprovisionamiento de la infraestructura*

### Construcción del proyecto
Para construir el proyecto ejecutaremos el siguiente comando:
```bash
sam build
```

### Ejecución del proyecto
Retomemos por un momento el punto #1 de la sección de ***Prerequisitos***, dado que el comando a utilizar dependerá de
cómo hayamos configurado nuestras credenciales de AWS.
- Si se configuraron con el perfil `default` se debe ejecutar el siguiente comando:
```bash
sam local start-api
```
- Si se configuraron con un perfil personalizado se debe ejecutar el siguiente comando:
```bash
sam local start-api --profile <nombre_del_perfil>
```

Si todo se ejecutó correctamente la terminal deberá mostrar un mensaje satisfactorio indicando la ruta de nuestro localhost
en la que está disponible la lambda, y de esa manera ya podremos hacerle peticiones localmente.

[AWS CLI]: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
[Docker]: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-docker.html
[AWS SAM]: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/what-is-sam.html
[AWS SAM CLI]: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
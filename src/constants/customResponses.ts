export class CustomResponse {
    readonly statusCode: number;
    readonly customStatusCode: string;
    readonly message: string;
    readonly details?: string;

    constructor(statusCode: number, customStatusCode: string, message: string, details?: string) {
      this.statusCode = statusCode;
      this.customStatusCode = customStatusCode;
      this.message = message;
      this.details = details;
      
    }
    
    withDetails(details: string) {
      return new CustomResponse(this.statusCode, this.customStatusCode, this.message, details);
    }
    withMessage(message: string) {
      return new CustomResponse(this.statusCode, this.customStatusCode, message);
    }
  
    static readonly S201000 = new CustomResponse(201, "CTUB-S201-000", "Entidad actualizada exitosamente.");
    static readonly S201001 = new CustomResponse(201, "CTUB-S201-001", "Entidad activada correctamente.");
    static readonly S201002 = new CustomResponse(201, "CTUB-S201-002", "Entidad desactivada correctamente.");
    static readonly B400000 = new CustomResponse(400, "CTUB-B400-000", "Solicitud Incorrecta.");
    static readonly B400001 = new CustomResponse(400, "CTUB-B400-001", "Los campos de la entidad son obligatorios.");
    static readonly B404000 = new CustomResponse(404, "CTUB-B404-000", "La entidad con ese fiid no existe.");
    static readonly B404001 = new CustomResponse(404, "CTUB-B404-001", "El nombre de la tabla o el fiid no está definido.");
    static readonly B403000 = new CustomResponse(403, "CTUB-B403-000", "El usuario no tiene permiso o No está autenticado.");
    static readonly E500000 = new CustomResponse(500, "CTUB-E500-000", "Error interno del servidor.");
    static readonly E500001 = new CustomResponse(500, "CTUB-E500-001", "Some of the following environment variables are missing: ParametersBankTableName, BucketName or the value of the path parameter: fiid.");
    static readonly E500002 = new CustomResponse(500, "CTUB-E500-002", "El cuerpo de la solicitud está vacio.");
    static readonly E500003 = new CustomResponse(500, "CTUB-E500-003", "Error Obteniendo el parameter store.");
    
}

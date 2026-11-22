class ApiError extends Error{
    constructor(status,message){
        super();
        this.status = status ;
        this.message = message ;
    }
    
    static NotFound(name) {
        this.status = 404;
        this.message = `${name} Not Found`
    }

    static BadRequest(message = 'Bad Request, Check your inputs') {
        this.status = 400;
        this.message = message;
    }

    static UnprocessableEntity(message) {
        this.status = 422;
        this.message = message;
    }

    static Forbidden(message) {
        this.status = 403;
        this.message = message;
    }
}

export default ApiError ;


// class ApiError extends Error {
//     constructor(status, message) {
//         super(message);
//         this.status = status;
//     }

//     static NotFound(name = "Resource") {
//         return new ApiError(404, `${name} Not Found`);
//     }

//     static BadRequest(message = 'Bad Request, Check your inputs') {
//         return new ApiError(400, message);
//     }

//     static UnprocessableEntity(message = 'Unprocessable Entity') {
//         return new ApiError(422, message);
//     }

//     static Forbidden(message = 'Forbidden') {
//         return new ApiError(403, message);
//     }
// }

// export default ApiError;

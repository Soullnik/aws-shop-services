
export const generateResponce = (statusCode: number, body: any) => {
    return {
        statusCode: statusCode,
        headers: {
            "Access-Control-Allow-Origin": "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials": true, // Required for cookies, authorization headers with HTTPS
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }
}
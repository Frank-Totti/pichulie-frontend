import { http } from '../api/http.js';

// Returns the response, not de response.json(), so it is necesary to get the data at the code 
export async function loginUser({ email, password }) {
    return http.post('/api/users/login',{email, password});
}

export async function logOutUser(token) {
    const response = http.post('/api/users/logout',undefined, {
        headers : {
            Authorization : `Bearer ${token}`,
        },
    });
    return response;
}

export async function getInfoUser(token) {
    const response = http.get('/api/users/get-info', {
        headers : {
            Authorization : `Bearer ${token}`,
        },
    });
    return response;
}

export async function updateUser(token,{ name, email, age, password }) {
    const response = http.put('/api/users/update',{ name, email, age, password },{
        headers : {
            Authorization : `Bearer ${token}`,
        },
    });
    return response;   
}

export async function recoverPasword({email}) {
    const response = http.post('/api/users/request-reset',{email});
    return response;
}

export async function registerUser({email, password, passwordCheck, name, age}) {
    const response = http.post('/api/users/register', 
    {email, password, passwordCheck, name, age});
    return response;
}

export async function changePasswordUser({token, newPassword}) {
    const response = http.post('http://localhost:3000/api/users/reset-password', {token, newPassword});
    return response;
}
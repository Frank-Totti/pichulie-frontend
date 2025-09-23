import { http } from '../api/http.js';

export async function updateTask(token, taskId, {title, detail, remember, status, task_date}) {
    //console.log(token);
    const response = http.put(`/api/task/edit/${taskId}`, 
    {title, detail, remember, status, task_date}, {
        headers : {
            Authorization : `Bearer ${token}`,
        },
    });
    return response;
}

export async function createTask(token, {title, detail, status, task_date}) {
    const response = http.post('/api/task/new', {title, detail, status, task_date},{
        headers : {
            Authorization : `Bearer ${token}`,
        },
    });
    return response;
}

export async function TaskByDate(token, {user_id, task_date}) {
    const response = http.post('/api/task/by-date', {user_id, task_date},{
        headers : {
            Authorization : `Bearer ${token}`,
        },
    });
    //console.log(response);
    return response;
}

export async function TaskById(token,taskId) {
    //console.log(token);
    const response = http.get(`/api/task/get-task/${taskId}`, {
        headers : {
            Authorization : `Bearer ${token}`,
        },
    });
    return response;
}

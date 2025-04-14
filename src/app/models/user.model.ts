export interface User {
    id: number;
    username: string;
    email: string;
    user_type: 'GERENTE' | 'USUARIO';
    token?: string;
}
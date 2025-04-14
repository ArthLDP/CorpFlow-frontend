export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'FAZER_TAREFA' | 'VERIFICAR' | 'APROVADO';
    created_by: number;
    created_at: Date;
    updated_at: Date;
}
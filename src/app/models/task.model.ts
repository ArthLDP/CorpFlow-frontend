export interface Task {
    id: number;
    title: string;
    description: string;
    status: 'FAZER_TAREFA' | 'EM_EXECUCAO' | 'VERIFICAR' | 'APROVADO';
    attributed_to: number;
    finalDate: Date;
    created_by: number;
    created_at: Date;
    updated_at: Date;
}
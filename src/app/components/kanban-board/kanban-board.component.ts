import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  fazerTarefas: Task[] = [];
  verificar: Task[] = [];
  aprovado: Task[] = [];
  
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.fazerTarefas = tasks.filter(task => task.status === 'FAZER_TAREFA');
      this.verificar = tasks.filter(task => task.status === 'VERIFICAR');
      this.aprovado = tasks.filter(task => task.status === 'APROVADO');
    });
  }

  // Função que gerencia o arrastar e soltar
  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Reordenação dentro da mesma lista
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Movendo para outra lista
      const task = event.previousContainer.data[event.previousIndex];
      const prevStatus = task.status;
      const newStatus = this.getStatusFromListId(event.container.id);
      
      // Validar regras de movimento
      if (!this.validateMove(prevStatus, newStatus)) {
        return;
      }
      
      // Validar regras de permissão para aprovação
      if (newStatus === 'APROVADO' && !this.authService.isManager()) {
        this.snackBar.open('Apenas gerentes conseguem aprovar tarefas', 'Fechar', {
          duration: 3000
        });
        return;
      }
      
      // Prosseguir com o movimento
      this.taskService.updateTaskStatus(task.id, newStatus).subscribe({
        next: (updatedTask) => {
          // Atualizar UI
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex,
          );
        },
        error: (error) => {
          this.snackBar.open('Erro ao atualizar o status da tarefa', 'Fechar', {
            duration: 3000
          });
        }
      });
    }
  }

  // Obtém o status correspondente ao ID da lista
  private getStatusFromListId(listId: string): 'FAZER_TAREFA' | 'VERIFICAR' | 'APROVADO' {
    switch (listId) {
      case 'fazer-tarefa-list': return 'FAZER_TAREFA';
      case 'verificar-list': return 'VERIFICAR';
      case 'aprovado-list': return 'APROVADO';
      default: return 'FAZER_TAREFA';
    }
  }

  // Valida se o movimento é permitido pelas regras de negócio
  private validateMove(prevStatus: string, newStatus: string): boolean {
    if (newStatus === 'APROVADO' && prevStatus !== 'VERIFICAR') {
      this.snackBar.open('Este bloco precisa estar em "Verificar" para ser aprovado', 'Fechar', {
        duration: 3000
      });
      return false;
    }

    if (newStatus === 'FAZER_TAREFA' && prevStatus !== 'APROVADO') {
      this.snackBar.open('Este bloco precisa estar aprovado para arrastá-lo para "Fazer tarefa"', 'Fechar', {
        duration: 3000
      });
      return false;
    }

    return true;
  }

  // Adicionar uma nova tarefa
  addNewTask(title: string, description: string): void {
    const newTask: Partial<Task> = {
      title,
      description,
      status: 'FAZER_TAREFA'
    };

    this.taskService.createTask(newTask).subscribe(task => {
      this.fazerTarefas.push(task);
    });
  }
}
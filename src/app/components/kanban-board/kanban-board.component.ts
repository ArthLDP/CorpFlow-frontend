import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Task } from '../../models/task.model';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss']
})
export class KanbanBoardComponent implements OnInit {
  fazerTarefas: Task[] = [];
  verificar: Task[] = [];
  aprovado: Task[] = [];
  usuarios: User[] = [];
  minDate: Date = new Date();
  
  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadUsers();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe(tasks => {
      this.fazerTarefas = tasks.filter(task => task.status === 'FAZER_TAREFA');
      this.verificar = tasks.filter(task => task.status === 'VERIFICAR');
      this.aprovado = tasks.filter(task => task.status === 'APROVADO');
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.usuarios = users
    })
  }

  getUserNameById(id: number): string {
    let user = this.usuarios.find(user => user.id === id);
    if (user) return user.username;
    return "";
  }

  getDateStringByDate(date: Date | string): string {
    if (!date) return "";
  
    const months = [
      "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
      "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
  
    const dateObj = new Date(date)

    const day = dateObj.getUTCDate();
    const month = months[dateObj.getUTCMonth()];
    const year = dateObj.getUTCFullYear();
  
    return `${day} de ${month} de ${year}`;
  }

  // Função que gerencia o arrastar e soltar
  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // Reordenação dentro da mesma lista
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Movendo para outra lista
      const task = event.previousContainer.data[event.previousIndex];
      const prevStatus = this.getStatusFromListId(event.previousContainer.id);
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
    if (prevStatus === 'APROVADO') {
      this.snackBar.open('Este bloco já foi aprovado, não é possível fazer mudanças"', 'Fechar', {
        duration: 3000
      });
      return false;
    }

    if (newStatus === 'APROVADO' && prevStatus !== 'VERIFICAR') {
      this.snackBar.open('Este bloco precisa estar em "Verificar" para ser aprovado', 'Fechar', {
        duration: 3000
      });
      return false;
    }

    return true;
  }

  // Adicionar uma nova tarefa
  addNewTask(title: string, description: string, attributed_to: number, finalDate: string): void {
    let [day, month, year] = finalDate.split('/')
    const dateObj = new Date(+year, +month - 1, +day)
    const newTask: Partial<Task> = {
      title,
      description,
      status: 'FAZER_TAREFA',
      attributed_to,
      finalDate: dateObj
    };

    this.taskService.createTask(newTask).subscribe(task => {
      this.fazerTarefas.push(task);
    });
  }
}
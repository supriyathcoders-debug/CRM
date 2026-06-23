import { ROLES } from '@crm/shared';
import { NotFoundError } from '../utils/errors';
import { taskRepository } from '../repositories/task.repository';
import { projectRepository } from '../repositories/project.repository';
import { employeeRepository } from '../repositories/employee.repository';
import { auditService } from './audit.service';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export class TaskService {
  async list(
    user: NonNullable<AuthenticatedRequest['user']>,
    query: {
      page: number;
      limit: number;
      projectId?: string;
      status?: string;
      assigneeId?: string;
      search?: string;
    }
  ) {
    const scopedQuery = { ...query };
    if (user.role === ROLES.EMPLOYEE && user.employeeId) {
      scopedQuery.assigneeId = user.employeeId;
    }

    const { items, total } = await taskRepository.list(user.companyId, scopedQuery);
    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async getById(user: NonNullable<AuthenticatedRequest['user']>, id: string) {
    const task = await taskRepository.findById(user.companyId, id);
    if (!task) throw new NotFoundError('Task not found');
    return task;
  }

  async create(
    user: NonNullable<AuthenticatedRequest['user']>,
    input: {
      projectId?: string;
      title: string;
      description?: string;
      priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      assigneeId?: string;
      dueDate?: string;
      estimatedHours?: number;
    }
  ) {
    if (input.projectId) {
      const project = await projectRepository.findById(user.companyId, input.projectId);
      if (!project) throw new NotFoundError('Project not found');
    }
    if (input.assigneeId) {
      const assignee = await employeeRepository.findById(input.assigneeId, user.companyId);
      if (!assignee) throw new NotFoundError('Assignee not found');
    }

    const task = await taskRepository.create({
      projectId: input.projectId ?? null,
      title: input.title,
      description: input.description,
      priority: input.priority,
      assigneeId: input.assigneeId ?? null,
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      estimatedHours: input.estimatedHours ?? null,
      reporterId: user.employeeId ?? null,
    });

    await auditService.log({
      companyId: user.companyId,
      userId: user.id,
      action: 'CREATE',
      entityType: 'Task',
      entityId: task.id,
    });

    return task;
  }

  async update(
    user: NonNullable<AuthenticatedRequest['user']>,
    id: string,
    input: {
      title?: string;
      description?: string | null;
      status?: 'PENDING' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED';
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      assigneeId?: string | null;
      dueDate?: string | null;
      estimatedHours?: number | null;
      actualHours?: number | null;
    }
  ) {
    const existing = await taskRepository.findById(user.companyId, id);
    if (!existing) throw new NotFoundError('Task not found');

    if (input.assigneeId) {
      const assignee = await employeeRepository.findById(input.assigneeId, user.companyId);
      if (!assignee) throw new NotFoundError('Assignee not found');
    }

    return taskRepository.update(id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.description !== undefined && { description: input.description }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.priority !== undefined && { priority: input.priority }),
      ...(input.assigneeId !== undefined && { assigneeId: input.assigneeId }),
      ...(input.dueDate !== undefined && { dueDate: input.dueDate ? new Date(input.dueDate) : null }),
      ...(input.estimatedHours !== undefined && { estimatedHours: input.estimatedHours }),
      ...(input.actualHours !== undefined && { actualHours: input.actualHours }),
    });
  }
}

export const taskService = new TaskService();

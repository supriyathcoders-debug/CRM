import { dashboardRepository } from '../repositories/dashboard.repository';

export class DashboardService {
  async getDashboard(
    companyId: string,
    role: string,
    employeeId?: string | null
  ) {
    if (role === 'SUPER_ADMIN') {
      return dashboardRepository.getSuperAdminStats(companyId);
    }
    return dashboardRepository.getRoleStats(companyId, role, employeeId);
  }
}

export const dashboardService = new DashboardService();

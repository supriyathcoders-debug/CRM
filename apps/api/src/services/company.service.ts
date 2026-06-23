import { companyRepository } from '../repositories/company.repository';
import { storageService } from './storage.service';
import { auditService, formatAuditActor } from './audit.service';
import { NotFoundError } from '../utils/errors';
import type { AuthenticatedRequest } from '../middleware/auth.middleware';

export class CompanyService {
  async getBranding(companyId: string) {
    const company = await companyRepository.findById(companyId);
    if (!company) throw new NotFoundError('Company not found');
    return company;
  }

  async updateBranding(
    actor: NonNullable<AuthenticatedRequest['user']>,
    input: { name?: string }
  ) {
    const company = await companyRepository.findById(actor.companyId);
    if (!company) throw new NotFoundError('Company not found');

    const updated = await companyRepository.updateBranding(actor.companyId, {
      ...(input.name !== undefined && { name: input.name }),
    });

    await auditService.log({
      companyId: actor.companyId,
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'Company',
      entityId: actor.companyId,
      oldValues: { name: company.name, logoUrl: company.logoUrl },
      newValues: { name: updated.name, logoUrl: updated.logoUrl, updatedBy: formatAuditActor(actor) },
    });

    return updated;
  }

  async uploadLogo(
    actor: NonNullable<AuthenticatedRequest['user']>,
    file: Express.Multer.File
  ) {
    const company = await companyRepository.findById(actor.companyId);
    if (!company) throw new NotFoundError('Company not found');

    const uploaded = await storageService.upload(file, 'logos');
    const updated = await companyRepository.updateBranding(actor.companyId, {
      logoUrl: uploaded.url,
    });

    await auditService.log({
      companyId: actor.companyId,
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'Company',
      entityId: actor.companyId,
      oldValues: { logoUrl: company.logoUrl },
      newValues: { logoUrl: updated.logoUrl, updatedBy: formatAuditActor(actor) },
    });

    return updated;
  }

  async removeLogo(actor: NonNullable<AuthenticatedRequest['user']>) {
    const company = await companyRepository.findById(actor.companyId);
    if (!company) throw new NotFoundError('Company not found');

    const updated = await companyRepository.updateBranding(actor.companyId, { logoUrl: null });

    await auditService.log({
      companyId: actor.companyId,
      userId: actor.id,
      action: 'UPDATE',
      entityType: 'Company',
      entityId: actor.companyId,
      oldValues: { logoUrl: company.logoUrl },
      newValues: { logoUrl: null, updatedBy: formatAuditActor(actor) },
    });

    return updated;
  }
}

export const companyService = new CompanyService();

import { Component, inject } from '@angular/core';

import { SessionService } from '../services/session.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  private readonly session = inject(SessionService);
  readonly user = this.session.user;

  get canManageCatalogs(): boolean {
    const roleId = this.user()?.roleId;
    return roleId === 1 || roleId === 2;
  }
}

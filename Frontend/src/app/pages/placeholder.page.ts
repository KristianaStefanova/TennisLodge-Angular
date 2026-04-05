import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  template: `
    <div class="container" style="padding: var(--space-10) 0 var(--space-16)">
      <p style="margin: 0; color: var(--color-text-muted); font-size: var(--text-sm)">
        This section will be available soon.
      </p>
    </div>
  `,
})
export class PlaceholderPage {}

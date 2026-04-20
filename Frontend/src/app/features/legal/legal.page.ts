import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LEGAL_CONTENT, LegalDocument, LegalDocumentType } from './legal-content';

@Component({
  selector: 'app-legal-page',
  imports: [RouterLink],
  templateUrl: './legal.page.html',
  styleUrl: './legal.page.css',
})
export class LegalPage {
  private readonly route = inject(ActivatedRoute);

  readonly document = computed<LegalDocument>(() => {
    const docType = (this.route.snapshot.data['documentType'] as LegalDocumentType | undefined) ?? 'privacy';
    return LEGAL_CONTENT[docType] ?? LEGAL_CONTENT.privacy;
  });
}

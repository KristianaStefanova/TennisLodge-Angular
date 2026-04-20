export type LegalDocumentType = 'privacy' | 'terms' | 'cookies';

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalDocument {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
}

export const LEGAL_CONTENT: Record<LegalDocumentType, LegalDocument> = {
  privacy: {
    title: 'Privacy Policy',
    description:
      'Draft page. The official Privacy Policy has not been published yet.',
    updatedAt: 'Pending publication',
    sections: [
      {
        heading: 'Current Status',
        paragraphs: [
          'This is a placeholder route created to support the footer navigation and legal section structure.',
          'No final legal text is currently maintained in this repository.',
        ],
      },
      {
        heading: 'What Is Implemented',
        paragraphs: [
          'The application currently provides authentication, tournaments, and accommodation features.',
          'A final legal policy should be reviewed and approved before publication.',
        ],
      },
      {
        heading: 'Next Step',
        paragraphs: [
          'Replace this content with your approved Privacy Policy text.',
          'Keep this route and page layout as-is for consistency across legal documents.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    description:
      'Draft page. The official Terms of Service have not been published yet.',
    updatedAt: 'Pending publication',
    sections: [
      {
        heading: 'Current Status',
        paragraphs: [
          'This page exists to provide a real route for footer links and avoid broken navigation.',
          'The legal text here is intentionally non-final and should not be treated as binding terms.',
        ],
      },
      {
        heading: 'What Is Implemented',
        paragraphs: [
          'The project includes account access, authenticated routes, and user-facing platform modules.',
          'There is no approved Terms document stored in the current codebase.',
        ],
      },
      {
        heading: 'Next Step',
        paragraphs: [
          'Replace this draft with your legally reviewed Terms of Service.',
          'You can keep this route and component model for long-term maintainability.',
        ],
      },
    ],
  },
  cookies: {
    title: 'Cookie Policy',
    description:
      'Draft page. The official Cookie Policy has not been published yet.',
    updatedAt: 'Pending publication',
    sections: [
      {
        heading: 'Current Status',
        paragraphs: [
          'This route is active so legal links in the footer point to real pages.',
          'Final cookie language still needs legal validation and publication.',
        ],
      },
      {
        heading: 'What Is Implemented',
        paragraphs: [
          'The frontend performs authenticated requests and normal navigation flows.',
          'This repository does not yet contain an approved Cookie Policy text.',
        ],
      },
      {
        heading: 'Next Step',
        paragraphs: [
          'Replace this draft with your official Cookie Policy wording.',
          'The current structure is ready for that replacement without routing changes.',
        ],
      },
    ],
  },
};

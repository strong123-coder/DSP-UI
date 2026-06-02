export interface ApiEndpoint {
  name: string;
  path: string;
  hasPathParams?: boolean;
}

export const apiConfig: ApiEndpoint[] = [
  // Keeping config empty as no backend API endpoints are defined yet for DSP-UI
];

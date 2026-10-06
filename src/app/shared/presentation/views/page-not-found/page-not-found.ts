import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

/** Fallback view shown when the requested route does not exist. */
@Component({
  imports: [RouterLink],
  selector: 'app-page-not-found',
  styleUrl: './page-not-found.css',
  templateUrl: './page-not-found.html',
})
export class PageNotFound {
  /** Router used to read the URL that could not be resolved. */
  private readonly router = inject(Router);

  /** Path the user tried to open. */
  protected readonly invalidPath = this.router.url;
}

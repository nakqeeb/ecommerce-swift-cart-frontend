import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search',
  imports: [],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent {
  router = inject(Router);

  doSearch(value: string) {
    this.router.navigateByUrl(`/search/${value}`);
  }

}

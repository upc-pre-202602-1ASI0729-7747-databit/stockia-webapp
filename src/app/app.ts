import { Component } from '@angular/core';
//import { Layout } from './shared/presentation/components/layout/layout';
import { RouterOutlet } from '@angular/router';

/** Root component: renders the application layout. */
@Component({
  //imports: [Layout, RouterOutlet],
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {}

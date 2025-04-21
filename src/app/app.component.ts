import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Mega Able 5+';
  mostrar_carga_todo = false
  nointer=false;
  public netStatus:string;

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
    // this.mostrar_carga_todo = true
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
      // this.mostrar_carga_todo = false
    });
  }
}

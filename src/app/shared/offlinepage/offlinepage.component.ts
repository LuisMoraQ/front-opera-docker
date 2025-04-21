import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-offlinepage',
  templateUrl: './offlinepage.component.html',
  styleUrls: ['./offlinepage.component.scss']
})
export class OfflinepageComponent implements OnInit {

  constructor(private ruta: Router,) { }

  ngOnInit(): void {
    if(window.navigator.onLine){
      this.ruta.navigate(['/principal']);
    }
  }

}
